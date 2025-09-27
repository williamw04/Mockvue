const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { getUsers, addUser, deleteUser } = require('./database.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,        // Security: disable Node.js in renderer
      contextIsolation: true,        // Security: isolate contexts
      enableRemoteModule: false      // Security: disable remote module
    }
  });

  win.loadFile('index.html');
  
  // Optional: Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

// Initialize IPC handlers when app is ready
app.whenReady().then(() => {
  createWindow();
  
  // Database operations
  ipcMain.handle('get-users', async () => {
    try {
      return await getUsers();
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch users');
    }
  });

  ipcMain.handle('add-user', async (event, userData) => {
    try {
      const { name, email } = userData;
      return await addUser(name, email);
    } catch (error) {
      console.error('Database error:', error);
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Email already exists');
      }
      throw new Error('Failed to add user');
    }
  });

  ipcMain.handle('delete-user', async (event, userId) => {
    try {
      return await deleteUser(userId);
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete user');
    }
  });

  // Utility handlers
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('show-save-dialog', async () => {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result;
  });
});

// Standard Electron app lifecycle
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
