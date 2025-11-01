/**
 * Electron Storage Service Implementation
 * Uses IPC to communicate with the main process for file system operations
 */

import type { Document, DocumentData } from '../../types';
import type { IStorageService } from '../interfaces';

export class ElectronStorageService implements IStorageService {
  async getDocuments(): Promise<Document[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    
    try {
      const documents = await window.electronAPI.getDocuments();
      return documents as Document[];
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
      const result = await window.electronAPI.createDocument(data);
      return result;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: Partial<DocumentData>): Promise<Document> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    
    try {
      const result = await window.electronAPI.updateDocument(id, data);
      return result;
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
      const result = await window.electronAPI.deleteDocument(id);
      
      if (!result.success) {
        throw new Error('Failed to delete document');
      }
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

