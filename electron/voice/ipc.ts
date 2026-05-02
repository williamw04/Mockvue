import type { IpcMain } from 'electron';
import type { AppendVoiceTranscriptEventInput, CreateVoiceInterviewSessionInput } from '../internal-types';
import { VoiceInterviewController } from './controller';

export function registerVoiceInterviewIpcHandlers(ipcMain: IpcMain, controller: VoiceInterviewController): void {
  ipcMain.handle('voice-interview:create-session', async (_event, input: CreateVoiceInterviewSessionInput) => {
    return controller.createSession(input);
  });

  ipcMain.handle('voice-interview:get-session', async (_event, sessionId: string) => {
    return controller.getSession(sessionId);
  });

  ipcMain.handle('voice-interview:list-sessions', async () => {
    return controller.listSessions();
  });

  ipcMain.handle('voice-interview:start-session', async (_event, sessionId: string) => {
    return controller.startSession(sessionId);
  });

  ipcMain.handle('voice-interview:pause-session', async (_event, sessionId: string) => {
    return controller.pauseSession(sessionId);
  });

  ipcMain.handle('voice-interview:resume-session', async (_event, sessionId: string) => {
    return controller.resumeSession(sessionId);
  });

  ipcMain.handle('voice-interview:interrupt-session', async (_event, sessionId: string) => {
    return controller.interruptSession(sessionId);
  });

  ipcMain.handle('voice-interview:end-session', async (_event, sessionId: string) => {
    return controller.endSession(sessionId);
  });

  ipcMain.handle('voice-interview:get-transcript', async (_event, sessionId: string) => {
    return controller.getTranscript(sessionId);
  });

  ipcMain.handle('voice-interview:append-transcript-event', async (_event, sessionId: string, input: AppendVoiceTranscriptEventInput) => {
    return controller.appendTranscriptEvent(sessionId, input);
  });

  ipcMain.handle('voice-interview:get-events', async (_event, sessionId: string) => {
    return controller.getEvents(sessionId);
  });
}
