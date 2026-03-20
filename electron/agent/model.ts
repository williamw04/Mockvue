import { GoogleGenerativeAI, FunctionDeclaration } from '@google/generative-ai';
import type { AgentChatMessage, AgentAssistantId, AgentTurnTrace, AgentStep } from '../internal-types';
import { getToolDefinitionsForAssistant, AgentToolExecutor, ToolCallResult, AgentToolName } from './tools';
import { buildSystemPrompt } from './prompts';

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

console.log('\n[AgentModelClient] ========== AGENTIC LOOP START ==========');
      console.log('[AgentModelClient] User message:', currentQuery.substring(0, 100));

    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n[AgentModelClient] --- Iteration ${iteration} ---`);

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

      console.log('\n[AgentModelClient] === FULL PROMPT (Iteration ' + iteration + ') ===');
      console.log(fullPrompt);
      console.log('[AgentModelClient] === END PROMPT ===\n');

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const parts = response.candidates?.[0]?.content?.parts || [];

      let hasToolCall = false;

      for (const part of parts) {
        if ('functionCall' in part && part.functionCall) {
          hasToolCall = true;
          const toolName = part.functionCall.name as AgentToolName;
          const toolArgs = (part.functionCall.args || {}) as Record<string, unknown>;

          console.log(`[AgentModelClient] Tool call: ${toolName}`, JSON.stringify(toolArgs, null, 2));

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

          console.log(`[AgentModelClient] Tool result:`, toolResult.success ? 'success' : 'error');
          if (toolResult.success && toolResult.data !== undefined) {
            console.log('[AgentModelClient] Tool result data:', typeof toolResult.data === 'string' 
              ? toolResult.data.substring(0, 500) 
              : JSON.stringify(toolResult.data, null, 2).substring(0, 500));
          }

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

        console.log('[AgentModelClient] === FULL RESPONSE ===');
        console.log(fullResponse);
        console.log('[AgentModelClient] === END RESPONSE ===');

        console.log('[AgentModelClient] ========== AGENTIC LOOP END ==========');
        console.log(`[AgentModelClient] Total iterations: ${iteration}`);
        console.log(`[AgentModelClient] Total tool calls: ${trace.totalToolCalls}`);
        console.log(`[AgentModelClient] Response length: ${fullResponse.length}`);

        trace.steps.push({
          id: makeId('step'),
          kind: 'response',
          timestamp: new Date().toISOString(),
          content: fullResponse,
        });

        return { reply: fullResponse, trace };
      }

      currentQuery = 'Based on the tool results above, continue answering the user\'s original question.';
    }

    console.log('[AgentModelClient] ========== AGENTIC LOOP END (max iterations) ==========');

    const maxIterMsg = 'I apologize, but I reached the maximum number of processing steps. Please try rephrasing your question.';
    callbacks?.onChunk?.(maxIterMsg);

    return {
      reply: maxIterMsg,
      trace,
    };
  }
}