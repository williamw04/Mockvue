import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentStorage } from './storage';

let mainWindow: BrowserWindow | null = null;
let storage: DocumentStorage;

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
  storage = new DocumentStorage();
  
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
// Document Operations IPC Handlers
// ============================================

ipcMain.handle('get-documents', async () => {
  try {
    return await storage.getDocuments();
  } catch (error) {
    console.error('Error in get-documents:', error);
    throw error;
  }
});

ipcMain.handle('get-document', async (_event, documentId: string) => {
  try {
    return await storage.getDocument(documentId);
  } catch (error) {
    console.error('Error in get-document:', error);
    throw error;
  }
});

ipcMain.handle('create-document', async (_event, documentData) => {
  try {
    const document = await storage.createDocument(documentData);
    return document;
  } catch (error) {
    console.error('Error in create-document:', error);
    throw error;
  }
});

ipcMain.handle('update-document', async (_event, documentId: string, documentData) => {
  try {
    const document = await storage.updateDocument(documentId, documentData);
    return document;
  } catch (error) {
    console.error('Error in update-document:', error);
    throw error;
  }
});

ipcMain.handle('delete-document', async (_event, documentId: string) => {
  try {
    await storage.deleteDocument(documentId);
    return { success: true };
  } catch (error) {
    console.error('Error in delete-document:', error);
    throw error;
  }
});

ipcMain.handle('search-documents', async (_event, query: string) => {
  try {
    return await storage.searchDocuments(query);
  } catch (error) {
    console.error('Error in search-documents:', error);
    throw error;
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
// Storage Stats IPC Handler
// ============================================

ipcMain.handle('get-storage-stats', async () => {
  try {
    return await storage.getStats();
  } catch (error) {
    console.error('Error in get-storage-stats:', error);
    throw error;
  }
});

