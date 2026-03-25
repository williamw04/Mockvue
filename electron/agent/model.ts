/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI, FunctionDeclaration } from '@google/generative-ai';
import type { AgentChatMessage, AgentAssistantId, AgentTurnTrace, AgentStep } from '../internal-types';
import { getToolDefinitionsForAssistant, AgentToolExecutor, ToolCallResult, AgentToolName } from './tools';
import { buildSystemPrompt } from './prompts';
import { agentLogger } from './logger';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toGeminiTool(toolDef: { name: string; description: string; parameters: any }): FunctionDeclaration {
  return {
    name: toolDef.name,
    description: toolDef.description,
    parameters: toolDef.parameters,
  };
}

export interface StreamingCallbacks {
  onChunk?: (text: string) => void;
  onStep?: (step: AgentStep) => void;
}

export class AgentModelClient {
  private apiKey: string | null = null;
  private currentSessionId: string | null = null;

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async completeTurnWithTools(
    assistantId: AgentAssistantId,
    messages: AgentChatMessage[],
    toolExecutor: AgentToolExecutor,
    callbacks?: StreamingCallbacks,
    maxIterations: number = 5,
  ): Promise<{ reply: string; trace: AgentTurnTrace }> {
    if (!this.apiKey) {
      const errorMsg = 'Error: API key not configured. Please set VITE_GEMINI_API_KEY in your environment.';
      callbacks?.onChunk?.(errorMsg);
      return {
        reply: errorMsg,
        trace: { steps: [], totalToolCalls: 0 },
      };
    }

    const genAI = new GoogleGenerativeAI(this.apiKey);
    const toolDefinitions = getToolDefinitionsForAssistant(assistantId);

    const trace: AgentTurnTrace = { steps: [], totalToolCalls: 0 };

    const systemPrompt = buildSystemPrompt(assistantId);

    let chatHistory = '';
    for (const msg of messages.slice(0, -1)) {
      if (msg.role === 'user') {
        chatHistory += `User: ${msg.content}\n`;
      } else {
        chatHistory += `Assistant: ${msg.content}\n`;
      }
    }

    const lastMessage = messages[messages.length - 1];
    let currentQuery = lastMessage.content;
    let iteration = 0;
    let toolResultsSummary = '';

    this.currentSessionId = makeId('session');
    agentLogger.startSession(this.currentSessionId, assistantId);
    agentLogger.log({
      type: 'iteration',
      data: {
        iteration: 0,
        userMessage: currentQuery.substring(0, 500),
        messageCount: messages.length,
        assistantId,
      },
    });

    if (agentLogger.isEnabled()) {
      console.log('[AgentModelClient] Logging enabled. Session:', this.currentSessionId);
    }

    while (iteration < maxIterations) {
      iteration++;
      console.log(`[AgentModelClient] Iteration ${iteration}`);

      const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        tools: [{
          functionDeclarations: toolDefinitions.map(toGeminiTool),
        }],
      });

      const fullPrompt = `${systemPrompt}

${chatHistory ? `Previous conversation:\n${chatHistory}\n` : ''}
${toolResultsSummary ? `Tool results obtained:\n${toolResultsSummary}\n` : ''}
Current user message: ${currentQuery}

${iteration === 1 ? 'First, determine what tools you need to call to answer this question. Call the appropriate tools.' : 'Based on the tool results above, provide your final response to the user. If you need more information, call additional tools.'}`;

      agentLogger.logPrompt(iteration, fullPrompt, {
        chatHistoryLength: chatHistory.length,
        toolResultsLength: toolResultsSummary.length,
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const parts = response.candidates?.[0]?.content?.parts || [];

      let hasToolCall = false;

      for (const part of parts) {
        if ('functionCall' in part && part.functionCall) {
          hasToolCall = true;
          const toolName = part.functionCall.name as AgentToolName;
          const toolArgs = (part.functionCall.args || {}) as Record<string, unknown>;

          console.log(`[AgentModelClient] Tool call: ${toolName}`);
          agentLogger.logToolCall(toolName, toolArgs);

          const toolCallStep: AgentStep = {
            id: makeId('step'),
            kind: 'tool_call',
            timestamp: new Date().toISOString(),
            toolName,
            toolArgs,
          };
          trace.steps.push(toolCallStep);
          callbacks?.onStep?.(toolCallStep);

          const toolResult: ToolCallResult = await toolExecutor.execute(toolName, toolArgs);

          console.log(`[AgentModelClient] Tool result: ${toolResult.success ? 'success' : 'error'}`);
          agentLogger.logToolResult(
            toolName, 
            toolResult.data, 
            toolResult.success, 
            toolResult.error
          );

          const toolResultStep: AgentStep = {
            id: makeId('step'),
            kind: 'tool_result',
            timestamp: new Date().toISOString(),
            toolName,
            toolResult: toolResult.data,
            toolError: toolResult.error,
          };
          trace.steps.push(toolResultStep);
          callbacks?.onStep?.(toolResultStep);

          if (toolResult.success && toolResult.data !== undefined) {
            const resultStr = typeof toolResult.data === 'string'
              ? toolResult.data
              : JSON.stringify(toolResult.data, null, 2);
            toolResultsSummary += `\n### ${toolName} result:\n${resultStr.slice(0, 3000)}\n`;
          } else if (toolResult.error) {
            toolResultsSummary += `\n### ${toolName} error: ${toolResult.error}\n`;
          }

          trace.totalToolCalls++;
        }
      }

      if (!hasToolCall) {
        console.log('[AgentModelClient] Streaming final response...');

        const streamingResult = await model.generateContentStream(fullPrompt);
        let fullResponse = '';

        for await (const chunk of streamingResult.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            process.stdout.write(chunkText);
            fullResponse += chunkText;
            callbacks?.onChunk?.(chunkText);
          }
        }
        process.stdout.write('\n');

        console.log(`[AgentModelClient] Complete. Iterations: ${iteration}, Tool calls: ${trace.totalToolCalls}, Response: ${fullResponse.length} chars`);

        agentLogger.logResponse(fullResponse);
        agentLogger.logIteration(iteration, trace.totalToolCalls, true);

        trace.steps.push({
          id: makeId('step'),
          kind: 'response',
          timestamp: new Date().toISOString(),
          content: fullResponse,
        });

        agentLogger.endSession();

        return { reply: fullResponse, trace };
      }

      currentQuery = 'Based on the tool results above, continue answering the user\'s original question.';
    }

    console.log('[AgentModelClient] Max iterations reached');

    const maxIterMsg = 'I apologize, but I reached the maximum number of processing steps. Please try rephrasing your question.';
    callbacks?.onChunk?.(maxIterMsg);

    agentLogger.logIteration(iteration, trace.totalToolCalls, false);
    agentLogger.endSession();

    return {
      reply: maxIterMsg,
      trace,
    };
  }
}