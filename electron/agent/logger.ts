import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface AgentLogEntry {
  timestamp: string;
  sessionId: string;
  assistantId: string;
  type: 'prompt' | 'response' | 'tool_call' | 'tool_result' | 'iteration';
  data: Record<string, unknown>;
}

export interface AgentLogSession {
  sessionId: string;
  assistantId: string;
  startedAt: string;
  entries: AgentLogEntry[];
}

class AgentLogger {
  private logsDir: string;
  private enabled: boolean;
  private currentSession: AgentLogSession | null = null;
  private currentLogFile: string | null = null;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.logsDir = path.join(userDataPath, 'agent-logs');
    this.enabled = process.env.AGENT_LOGGING === 'true' || process.env.AGENT_LOGGING === '1';
    
    if (this.enabled) {
      this.ensureLogsDirectory();
      console.log('[AgentLogger] Logging enabled. Logs directory:', this.logsDir);
    }
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  startSession(sessionId: string, assistantId: string): void {
    if (!this.enabled) return;

    this.currentSession = {
      sessionId,
      assistantId,
      startedAt: new Date().toISOString(),
      entries: [],
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(
      this.logsDir, 
      `session-${sessionId.substring(0, 8)}-${timestamp}.json`
    );
  }

  log(entry: Omit<AgentLogEntry, 'timestamp' | 'sessionId' | 'assistantId'>): void {
    if (!this.enabled || !this.currentSession) return;

    const fullEntry: AgentLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession.sessionId,
      assistantId: this.currentSession.assistantId,
      ...entry,
    };

    this.currentSession.entries.push(fullEntry);
    this.flushToFile();
  }

  logPrompt(iteration: number, prompt: string, context?: Record<string, unknown>): void {
    this.log({
      type: 'prompt',
      data: {
        iteration,
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''),
        fullPrompt: prompt,
        context,
      },
    });
  }

  logResponse(response: string, finishReason?: string): void {
    this.log({
      type: 'response',
      data: {
        responseLength: response.length,
        responsePreview: response.substring(0, 500) + (response.length > 500 ? '...' : ''),
        fullResponse: response,
        finishReason,
      },
    });
  }

  logToolCall(toolName: string, args: Record<string, unknown>): void {
    const sanitizedArgs = this.sanitizeArgs(args);
    this.log({
      type: 'tool_call',
      data: {
        toolName,
        args: sanitizedArgs,
      },
    });
  }

  logToolResult(toolName: string, result: unknown, success: boolean, error?: string): void {
    const sanitizedResult = this.sanitizeResult(result);
    this.log({
      type: 'tool_result',
      data: {
        toolName,
        success,
        result: sanitizedResult,
        error,
      },
    });
  }

  logIteration(iteration: number, totalToolCalls: number, hasResponse: boolean): void {
    this.log({
      type: 'iteration',
      data: {
        iteration,
        totalToolCalls,
        hasResponse,
      },
    });
  }

  endSession(): void {
    if (!this.enabled || !this.currentSession || !this.currentLogFile) return;

    this.flushToFile();
    this.currentSession = null;
    this.currentLogFile = null;
  }

  private flushToFile(): void {
    if (!this.currentSession || !this.currentLogFile) return;

    const content = JSON.stringify(this.currentSession, null, 2);
    fs.writeFileSync(this.currentLogFile, content, 'utf-8');
  }

  private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...args };
    if (sanitized.apiKey) {
      sanitized.apiKey = '[REDACTED]';
    }
    return sanitized;
  }

  private sanitizeResult(result: unknown): unknown {
    if (result === null || result === undefined) {
      return result;
    }

    if (typeof result === 'string') {
      if (result.length > 2000) {
        return result.substring(0, 2000) + '... [truncated]';
      }
      return result;
    }

    if (Array.isArray(result)) {
      if (result.length > 10) {
        return [...result.slice(0, 10), `... ${result.length - 10} more items`];
      }
      return result;
    }

    return result;
  }

  getLogsDir(): string {
    return this.logsDir;
  }

  listRecentLogs(maxCount: number = 10): string[] {
    if (!fs.existsSync(this.logsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.logsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, maxCount);

    return files.map(f => path.join(this.logsDir, f));
  }
}

export const agentLogger = new AgentLogger();