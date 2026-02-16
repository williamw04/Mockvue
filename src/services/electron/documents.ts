/**
 * Electron Document Service Implementation
 * Uses IPC to communicate with the main process for document operations
 */

import type { Document, DocumentData } from '../../types';
import type { IDocumentService } from '../interfaces';

export class ElectronDocumentService implements IDocumentService {
  async getDocuments(): Promise<Document[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    
    try {
      return await window.electronAPI.getDocuments();
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    
    try {
      return await window.electronAPI.getDocument(id);
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async createDocument(data: DocumentData): Promise<Document> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.createDocument(data);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      return await window.electronAPI.updateDocument(id, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      await window.electronAPI.deleteDocument(id);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string): Promise<Document[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    
    try {
      return await window.electronAPI.searchDocuments(query);
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}
