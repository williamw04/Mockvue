import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
export interface Document {
  id: string;
  title: string;
  description: string;
  content?: string;
  tags: string[];
  wordCount: number;
  lastModified: string;
  createdAt: string;
}

export interface DocumentData {
  title: string;
  description?: string;
  content?: string;
  tags?: string[];
}

export interface FileDialogResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
}

export interface StorageStats {
  totalDocuments: number;
  totalWords: number;
  storageSize: number;
}

export interface ElectronAPI {
  // Document operations
  getDocuments: () => Promise<Document[]>;
  getDocument: (id: string) => Promise<Document | null>;
  createDocument: (documentData: DocumentData) => Promise<Document>;
  updateDocument: (documentId: string, documentData: Partial<DocumentData>) => Promise<Document>;
  deleteDocument: (documentId: string) => Promise<{ success: boolean }>;
  searchDocuments: (query: string) => Promise<Document[]>;
  
  // File dialogs
  showOpenDialog: (options?: {
    filters?: Array<{ name: string; extensions: string[] }>;
    defaultPath?: string;
  }) => Promise<FileDialogResult>;
  showSaveDialog: (content: string, options?: {
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<FileDialogResult>;
  
  // Storage stats
  getStorageStats: () => Promise<StorageStats>;
  
  // Platform info
  platform: string;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Document operations
  getDocuments: () => ipcRenderer.invoke('get-documents'),
  getDocument: (id: string) => ipcRenderer.invoke('get-document', id),
  createDocument: (documentData: DocumentData) => ipcRenderer.invoke('create-document', documentData),
  updateDocument: (documentId: string, documentData: Partial<DocumentData>) => 
    ipcRenderer.invoke('update-document', documentId, documentData),
  deleteDocument: (documentId: string) => ipcRenderer.invoke('delete-document', documentId),
  searchDocuments: (query: string) => ipcRenderer.invoke('search-documents', query),
  
  // File dialogs
  showOpenDialog: (options?: any) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (content: string, options?: any) => ipcRenderer.invoke('show-save-dialog', content, options),
  
  // Storage stats
  getStorageStats: () => ipcRenderer.invoke('get-storage-stats'),
  
  // Platform info
  platform: process.platform,
});

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

