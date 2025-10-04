import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

// IPC handlers - placeholder for future functionality
ipcMain.handle('get-documents', async () => {
  // TODO: Implement database queries
  return [];
});

ipcMain.handle('create-document', async (_event, documentData) => {
  // TODO: Implement document creation
  console.log('Creating document:', documentData);
  return { success: true };
});

ipcMain.handle('update-document', async (_event, documentId, documentData) => {
  // TODO: Implement document update
  console.log('Updating document:', documentId, documentData);
  return { success: true };
});

ipcMain.handle('delete-document', async (_event, documentId) => {
  // TODO: Implement document deletion
  console.log('Deleting document:', documentId);
  return { success: true };
});

