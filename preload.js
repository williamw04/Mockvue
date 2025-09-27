const { contextBridge, ipcRenderer } = require('electron');

// Expose only specific, safe functions to the frontend
contextBridge.exposeInMainWorld('database', {
  // Get all users
  getUsers: () => ipcRenderer.invoke('get-users'),
  
  // Add a new user with validation
  addUser: (name, email) => {
    if (!name || !email) {
      return Promise.reject(new Error('Name and email are required'));
    }
    return ipcRenderer.invoke('add-user', { name, email });
  },
  
  // Delete user by ID
  deleteUser: (id) => {
    if (!id || isNaN(id)) {
      return Promise.reject(new Error('Valid user ID is required'));
    }
    return ipcRenderer.invoke('delete-user', id);
  }
});

// Also expose utility functions if needed
contextBridge.exposeInMainWorld('app', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog')
});
