import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Document operations
  getDocuments: () => ipcRenderer.invoke('get-documents'),
  createDocument: (documentData: unknown) => ipcRenderer.invoke('create-document', documentData),
  updateDocument: (documentId: string, documentData: unknown) => 
    ipcRenderer.invoke('update-document', documentId, documentData),
  deleteDocument: (documentId: string) => ipcRenderer.invoke('delete-document', documentId),
  
  // Platform info
  platform: process.platform,
});

// Type definitions for the exposed API
export interface ElectronAPI {
  getDocuments: () => Promise<unknown[]>;
  createDocument: (documentData: unknown) => Promise<{ success: boolean }>;
  updateDocument: (documentId: string, documentData: unknown) => Promise<{ success: boolean }>;
  deleteDocument: (documentId: string) => Promise<{ success: boolean }>;
  platform: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

