import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { UserDataStorage, DocumentStorage } from './storage';

let mainWindow: BrowserWindow | null = null;
let userDataStorage: UserDataStorage;
let documentStorage: DocumentStorage;

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
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================
// File Dialog IPC Handlers
// ============================================

ipcMain.handle('show-open-dialog', async (_event, options) => {
  try {
    if (!mainWindow) return { canceled: true };
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: options?.filters || [
        { name: 'All Files', extensions: ['*'] },
      ],
      ...options,
    });
    
    if (result.canceled || !result.filePaths.length) {
      return { canceled: true };
    }
    
    // Read file content
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    return {
      canceled: false,
      filePath,
      fileName,
      content,
    };
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
    
    // Write file
    fs.writeFileSync(result.filePath, content, 'utf-8');
    
    return {
      canceled: false,
      filePath: result.filePath,
    };
  } catch (error) {
    console.error('Error in show-save-dialog:', error);
    throw error;
  }
});

// ============================================
// User Profile Operations IPC Handlers
// ============================================

ipcMain.handle('get-user-profile', async () => {
  try {
    return await userDataStorage.getUserProfile();
  } catch (error) {
    console.error('Error in get-user-profile:', error);
    throw error;
  }
});

ipcMain.handle('save-user-profile', async (_event, profile) => {
  try {
    return await userDataStorage.saveUserProfile(profile);
  } catch (error) {
    console.error('Error in save-user-profile:', error);
    throw error;
  }
});

ipcMain.handle('complete-onboarding', async () => {
  try {
    await userDataStorage.completeOnboarding();
  } catch (error) {
    console.error('Error in complete-onboarding:', error);
    throw error;
  }
});

// ============================================
// Resume Operations IPC Handlers
// ============================================

ipcMain.handle('get-resume', async () => {
  try {
    return await userDataStorage.getResume();
  } catch (error) {
    console.error('Error in get-resume:', error);
    throw error;
  }
});

ipcMain.handle('save-resume', async (_event, resume) => {
  try {
    return await userDataStorage.saveResume(resume);
  } catch (error) {
    console.error('Error in save-resume:', error);
    throw error;
  }
});

// ============================================
// Story Operations IPC Handlers
// ============================================

ipcMain.handle('get-stories', async () => {
  try {
    return await userDataStorage.getStories();
  } catch (error) {
    console.error('Error in get-stories:', error);
    throw error;
  }
});

ipcMain.handle('get-story', async (_event, id: string) => {
  try {
    return await userDataStorage.getStory(id);
  } catch (error) {
    console.error('Error in get-story:', error);
    throw error;
  }
});

ipcMain.handle('create-story', async (_event, story) => {
  try {
    return await userDataStorage.createStory(story);
  } catch (error) {
    console.error('Error in create-story:', error);
    throw error;
  }
});

ipcMain.handle('update-story', async (_event, id: string, story) => {
  try {
    return await userDataStorage.updateStory(id, story);
  } catch (error) {
    console.error('Error in update-story:', error);
    throw error;
  }
});

ipcMain.handle('delete-story', async (_event, id: string) => {
  try {
    await userDataStorage.deleteStory(id);
  } catch (error) {
    console.error('Error in delete-story:', error);
    throw error;
  }
});

// ============================================
// Interview Response Operations IPC Handlers
// ============================================

ipcMain.handle('get-interview-responses', async () => {
  try {
    return await userDataStorage.getInterviewResponses();
  } catch (error) {
    console.error('Error in get-interview-responses:', error);
    throw error;
  }
});

ipcMain.handle('create-interview-response', async (_event, response) => {
  try {
    return await userDataStorage.createInterviewResponse(response);
  } catch (error) {
    console.error('Error in create-interview-response:', error);
    throw error;
  }
});

ipcMain.handle('update-interview-response', async (_event, id: string, response) => {
  try {
    return await userDataStorage.updateInterviewResponse(id, response);
  } catch (error) {
    console.error('Error in update-interview-response:', error);
    throw error;
  }
});

ipcMain.handle('delete-interview-response', async (_event, id: string) => {
  try {
    await userDataStorage.deleteInterviewResponse(id);
  } catch (error) {
    console.error('Error in delete-interview-response:', error);
    throw error;
  }
});

// ============================================
// Document Operations IPC Handlers
// ============================================

ipcMain.handle('get-documents', async () => {
  try {
    return await documentStorage.getDocuments();
  } catch (error) {
    console.error('Error in get-documents:', error);
    throw error;
  }
});

ipcMain.handle('get-document', async (_event, id: string) => {
  try {
    return await documentStorage.getDocument(id);
  } catch (error) {
    console.error('Error in get-document:', error);
    throw error;
  }
});

ipcMain.handle('create-document', async (_event, data) => {
  try {
    return await documentStorage.createDocument(data);
  } catch (error) {
    console.error('Error in create-document:', error);
    throw error;
  }
});

ipcMain.handle('update-document', async (_event, id: string, data) => {
  try {
    return await documentStorage.updateDocument(id, data);
  } catch (error) {
    console.error('Error in update-document:', error);
    throw error;
  }
});

ipcMain.handle('delete-document', async (_event, id: string) => {
  try {
    await documentStorage.deleteDocument(id);
  } catch (error) {
    console.error('Error in delete-document:', error);
    throw error;
  }
});

ipcMain.handle('search-documents', async (_event, query: string) => {
  try {
    return await documentStorage.searchDocuments(query);
  } catch (error) {
    console.error('Error in search-documents:', error);
    throw error;
  }
});
