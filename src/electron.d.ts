export interface ElectronAPI {
  getDocuments: () => Promise<unknown[]>;
  createDocument: (documentData: unknown) => Promise<{ success: boolean }>;
  updateDocument: (documentId: string, documentData: unknown) => Promise<{ success: boolean }>;
  deleteDocument: (documentId: string) => Promise<{ success: boolean }>;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

