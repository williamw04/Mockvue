/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { UserDataStorage, DocumentStorage } from './storage';
import {
  extractText,
  parseResumeWithGemini,
  analyzeResumeBullets,
  chatWithResumeContext,
  analyzeAtsCompatibility,
} from './parser';
import { AgentKnowledgeAssembler } from './agent/knowledge';
import { AgentMemoryStore } from './agent/memory-store';
import { CoachingStore } from './agent/coaching-store';
import { AgentRuntime } from './agent/runtime';
import {
  registerVoiceInterviewIpcHandlers,
  registerVoiceInterviewStreamingIpcHandlers,
  cleanupAllVoiceSessions,
  TextOnlyVoiceInterviewProvider,
  VoiceInterviewController,
} from './voice/index';
import { VoiceInterviewSessionStore } from './voice/session-store';
import { agentLogger } from './agent/logger';
import { registerIpcHandlers, createHandler } from './ipc-utils';
import { ElectronPDFService } from './pdf-service';

let mainWindow: BrowserWindow | null = null;
let userDataStorage: UserDataStorage;
let documentStorage: DocumentStorage;
let agentRuntime: AgentRuntime;
let coachingStore: CoachingStore;
let voiceInterviewController: VoiceInterviewController;
let pdfService: ElectronPDFService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f9fafb',
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize storage
  userDataStorage = new UserDataStorage();
  documentStorage = new DocumentStorage();
  agentRuntime = new AgentRuntime(
    new AgentKnowledgeAssembler(userDataStorage),
    new AgentMemoryStore()
  );
  coachingStore = new CoachingStore();
  voiceInterviewController = new VoiceInterviewController(
    new VoiceInterviewSessionStore(),
    new TextOnlyVoiceInterviewProvider()
  );
  pdfService = new ElectronPDFService();

  createWindow();
  registerVoiceInterviewIpcHandlers(ipcMain, voiceInterviewController);
  registerVoiceInterviewStreamingIpcHandlers(ipcMain, () => mainWindow);

  registerIpcHandlers(ipcMain, [
    // User Profile
    createHandler('get-user-profile', () => userDataStorage.getUserProfile()),
    createHandler('save-user-profile', (_, profile) =>
      userDataStorage.saveUserProfile(profile as any)
    ),
    createHandler('complete-onboarding', () => userDataStorage.completeOnboarding()),

    // Resume
    createHandler('get-resume', () => userDataStorage.getResume()),
    createHandler('save-resume', (_, resume) => userDataStorage.saveResume(resume as any)),

    // Candidate Profile
    createHandler('get-candidate-profile', () => userDataStorage.getCandidateProfile()),
    createHandler('save-candidate-profile', (_, profile) =>
      userDataStorage.saveCandidateProfile(profile as any)
    ),

    // Resume Analysis Cache
    createHandler('get-resume-analysis', () => userDataStorage.getResumeAnalysis()),
    createHandler('save-resume-analysis', (_, analysis) =>
      userDataStorage.saveResumeAnalysis(analysis as any)
    ),

    // ATS Analysis Cache
    createHandler('get-ats-analysis', () => userDataStorage.getAtsAnalysis()),
    createHandler('save-ats-analysis', (_, analysis) =>
      userDataStorage.saveAtsAnalysis(analysis as any)
    ),

    // Stories
    createHandler('get-stories', () => userDataStorage.getStories()),
    createHandler('get-story', (_, id) => userDataStorage.getStory(id as string)),
    createHandler('create-story', (_, story) => userDataStorage.createStory(story as any)),
    createHandler('update-story', (_, id, story) =>
      userDataStorage.updateStory(id as string, story as any)
    ),
    createHandler('delete-story', (_, id) => userDataStorage.deleteStory(id as string)),

    // Interview Responses
    createHandler('get-interview-responses', () => userDataStorage.getInterviewResponses()),
    createHandler('create-interview-response', (_, response) =>
      userDataStorage.createInterviewResponse(response as any)
    ),
    createHandler('update-interview-response', (_, id, response) =>
      userDataStorage.updateInterviewResponse(id as string, response as any)
    ),
    createHandler('delete-interview-response', (_, id) =>
      userDataStorage.deleteInterviewResponse(id as string)
    ),

    // Documents
    createHandler('get-documents', () => documentStorage.getDocuments()),
    createHandler('get-document', (_, id) => documentStorage.getDocument(id as string)),
    createHandler('create-document', (_, data) => documentStorage.createDocument(data as any)),
    createHandler('update-document', (_, id, data) =>
      documentStorage.updateDocument(id as string, data as any)
    ),
    createHandler('delete-document', (_, id) => documentStorage.deleteDocument(id as string)),
    createHandler('search-documents', (_, query) =>
      documentStorage.searchDocuments(query as string)
    ),

    // Agent Sessions
    createHandler('agent:create-session', (_, input) => agentRuntime.createSession(input as any)),
    createHandler('agent:get-session', (_, sessionId) =>
      agentRuntime.getSession(sessionId as string)
    ),
    createHandler('agent:list-sessions', (_, assistantId) =>
      agentRuntime.listSessions(assistantId as any)
    ),
    createHandler('agent:clear-session-memory', (_, sessionId) =>
      agentRuntime.clearSessionMemory(sessionId as string)
    ),
    createHandler('agent:get-session-messages', (_, sessionId) =>
      agentRuntime.getMessages(sessionId as string)
    ),
    createHandler('agent:rename-session', (_, sessionId, newTitle) =>
      agentRuntime.renameSession(sessionId as string, newTitle as string)
    ),
    createHandler('agent:delete-session', (_, sessionId) =>
      agentRuntime.deleteSession(sessionId as string)
    ),

    // Agent Logs
    createHandler('agent:logging-status', () => ({
      enabled: agentLogger.isEnabled(),
      logsDir: agentLogger.getLogsDir(),
    })),
    createHandler('agent:list-logs', (_, maxCount = 20) => {
      const logFiles = agentLogger.listRecentLogs(maxCount as number);
      return logFiles.map((filePath) => {
        const stats = fs.statSync(filePath);
        return {
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          modified: stats.mtime,
        };
      });
    }),
    createHandler('agent:open-logs-dir', () => shell.openPath(agentLogger.getLogsDir())),

    createHandler('coaching:get-session-data', (_, sessionId) =>
      coachingStore.getSessionData(sessionId as string)
    ),
    createHandler('coaching:add-goal', (_, sessionId, input) =>
      coachingStore.addGoal(sessionId as string, input as any)
    ),
    createHandler('coaching:update-goal', (_, sessionId, goalId, updates) =>
      coachingStore.updateGoal(sessionId as string, goalId as string, updates as any)
    ),
    createHandler('coaching:add-todo', (_, sessionId, input) =>
      coachingStore.addTodo(sessionId as string, input as any)
    ),
    createHandler('coaching:update-todo', (_, sessionId, todoId, updates) =>
      coachingStore.updateTodo(sessionId as string, todoId as string, updates as any)
    ),
    createHandler('coaching:propose-change', (_, sessionId, input) =>
      coachingStore.proposeChange(sessionId as string, input as any)
    ),
    createHandler('coaching:accept-change', (_, sessionId, changeId, modification) =>
      coachingStore.acceptChange(
        sessionId as string,
        changeId as string,
        modification as string | undefined
      )
    ),
    createHandler('coaching:reject-change', (_, sessionId, changeId) =>
      coachingStore.rejectChange(sessionId as string, changeId as string)
    ),
    createHandler('coaching:get-pending-changes', (_, sessionId) =>
      coachingStore.getPendingChanges(sessionId as string)
    ),
    createHandler('coaching:get-change-log', (_, sessionId) =>
      coachingStore.getChangeLog(sessionId as string)
    ),
    createHandler('coaching:create-version', (_, sessionId, input) =>
      coachingStore.createVersion(sessionId as string, input as any)
    ),
    createHandler('coaching:list-versions', (_, sessionId) =>
      coachingStore.listVersions(sessionId as string)
    ),
    createHandler('coaching:get-user-profile', () => coachingStore.getUserProfile()),
    createHandler('coaching:update-user-profile', (_, updates) =>
      coachingStore.updateUserProfile(updates as any)
    ),
    createHandler('coaching:clear-session-data', (_, sessionId) =>
      coachingStore.clearSessionData(sessionId as string)
    ),

    // PDF Service
    createHandler('pdf:get-templates', () => pdfService.getTemplates()),
    createHandler('pdf:generate', (_, resume, templateId, userProfile) =>
      pdfService.generatePDF(resume as any, templateId as string, userProfile as any)
    ),
    createHandler('pdf:open', (_, pdfPath) => pdfService.openPDF(pdfPath as string)),
    createHandler('pdf:get-templates-path', () => pdfService.getTemplatesPath()),
  ]);

  ipcMain.on('agent:set-api-key', (_, apiKey: string) => {
    agentRuntime.setApiKey(apiKey);
    console.log('[Agent] API key set');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  cleanupAllVoiceSessions();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================
// File Dialog IPC Handlers (complex - need mainWindow)
// ============================================

ipcMain.handle('show-open-dialog', async (_event, options) => {
  try {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }],
      ...options,
    });

    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    return { canceled: false, filePath, fileName, content };
  } catch (error) {
    console.error('Error in show-open-dialog:', error);
    throw error;
  }
});

ipcMain.handle('show-save-dialog', async (_event, content: string, options) => {
  try {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: options?.defaultPath || 'document.txt',
      filters: options?.filters || [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'HTML Files', extensions: ['html'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      ...options,
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { canceled: false, filePath: result.filePath };
  } catch (error) {
    console.error('Error in show-save-dialog:', error);
    throw error;
  }
});

// ============================================
// Resume Operations IPC Handlers (complex - file operations)
// ============================================

ipcMain.handle(
  'resume:parse',
  async (_, { filePath, apiKey }: { filePath: string; apiKey: string }) => {
    try {
      const text = await extractText(filePath);
      const parsedData = await parseResumeWithGemini(text, apiKey);

      const userDataPath = app.getPath('userData');
      const resumesDir = path.join(userDataPath, 'user-data', 'resumes');
      if (!fs.existsSync(resumesDir)) {
        fs.mkdirSync(resumesDir, { recursive: true });
      }
      const pdfFileName = `resume-${Date.now()}.pdf`;
      const storedPdfPath = path.join(resumesDir, pdfFileName);
      fs.copyFileSync(filePath, storedPdfPath);

      return { success: true, data: parsedData, rawText: text, pdfPath: storedPdfPath };
    } catch (error) {
      console.error('Resume parsing failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
);

ipcMain.handle('resume:replace-pdf', async (_, { filePath }: { filePath: string }) => {
  try {
    const userDataPath = app.getPath('userData');
    const resumesDir = path.join(userDataPath, 'user-data', 'resumes');
    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
    }
    const pdfFileName = `resume-${Date.now()}.pdf`;
    const storedPdfPath = path.join(resumesDir, pdfFileName);
    fs.copyFileSync(filePath, storedPdfPath);

    return { success: true, pdfPath: storedPdfPath };
  } catch (error) {
    console.error('Resume replace failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('open-resume-pdf', async (_, pdfPath: string) => {
  try {
    const userDataPath = app.getPath('userData');
    const resumesDir = path.resolve(path.join(userDataPath, 'user-data', 'resumes'));
    const resolvedPath = path.resolve(pdfPath);

    if (!resolvedPath.startsWith(resumesDir)) {
      throw new Error('Invalid path: PDF must be within resumes directory');
    }

    await shell.openPath(pdfPath);
  } catch (error) {
    console.error('Error opening PDF:', error);
    throw error;
  }
});

ipcMain.handle(
  'resume:analyze-bullets',
  async (_, { resumeData, apiKey }: { resumeData: any; apiKey: string }) => {
    try {
      const analysisData = await analyzeResumeBullets(resumeData, apiKey);
      return { success: true, data: analysisData };
    } catch (error) {
      console.error('Resume analysis failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
);

ipcMain.handle('resume:analyze-ats', async (_, { filePath }: { filePath: string }) => {
  try {
    const atsResult = await analyzeAtsCompatibility(filePath);
    return { success: true, data: atsResult };
  } catch (error) {
    console.error('ATS compatibility analysis failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle(
  'resume:chat',
  async (
    _,
    { messages, analysisContext, apiKey }: { messages: any[]; analysisContext: any; apiKey: string }
  ) => {
    try {
      const reply = await chatWithResumeContext(messages, analysisContext, apiKey);
      return { success: true, reply };
    } catch (error) {
      console.error('Resume chat failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
);

// ============================================
// Agent IPC Handlers (complex - streaming)
// ============================================

ipcMain.handle('agent:run-turn', async (event, input) => {
  try {
    return await agentRuntime.runTurn(input, {
      onChunk: (text: string) => {
        event.sender.send('agent:chunk', { sessionId: input.sessionId, text });
      },
      onStep: (step: any) => {
        event.sender.send('agent:step', { sessionId: input.sessionId, step });
      },
    });
  } catch (error) {
    console.error('Error in agent:run-turn:', error);
    throw error;
  }
});

// ============================================
// Agent Log IPC Handlers (complex - path validation)
// ============================================

ipcMain.handle('agent:get-log', async (_event, logPath: string) => {
  try {
    const resolvedPath = path.resolve(logPath);
    const logsDir = agentLogger.getLogsDir();

    if (!resolvedPath.startsWith(logsDir)) {
      throw new Error('Invalid log path');
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading agent log:', error);
    throw error;
  }
});

ipcMain.handle('agent:delete-log', async (_event, logPath: string) => {
  try {
    const resolvedPath = path.resolve(logPath);
    const logsDir = agentLogger.getLogsDir();

    if (!resolvedPath.startsWith(logsDir)) {
      throw new Error('Invalid log path');
    }

    fs.unlinkSync(resolvedPath);
    return true;
  } catch (error) {
    console.error('Error deleting agent log:', error);
    throw error;
  }
});
