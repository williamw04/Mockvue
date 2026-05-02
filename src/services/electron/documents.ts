/**
 * Electron Document Service Implementation
 * Uses IPC to communicate with the main process for document operations
 */

import type { Document, DocumentData } from '../../types';
import type { IDocumentService } from '../interfaces';
import { ServiceError } from '../errors';

export class ElectronDocumentService implements IDocumentService {
  private get api() {
    if (!window.electronAPI) {
      throw ServiceError.unavailable('Electron API not available');
    }
    return window.electronAPI;
  }

  async getDocuments(): Promise<Document[]> {
    try {
      return await this.api.getDocuments();
    } catch (error) {
      console.error('Error getting documents:', error);
      throw ServiceError.storage('Failed to get documents', error instanceof Error ? error : undefined);
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      return await this.api.getDocument(id);
    } catch (error) {
      console.error('Error getting document:', error);
      throw ServiceError.storage('Failed to get document', error instanceof Error ? error : undefined);
    }
  }

  async createDocument(data: DocumentData): Promise<Document> {
    try {
      return await this.api.createDocument(data);
    } catch (error) {
      console.error('Error creating document:', error);
      throw ServiceError.storage('Failed to create document', error instanceof Error ? error : undefined);
    }
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    try {
      return await this.api.updateDocument(id, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw ServiceError.storage('Failed to update document', error instanceof Error ? error : undefined);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.api.deleteDocument(id);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw ServiceError.storage('Failed to delete document', error instanceof Error ? error : undefined);
    }
  }

  async searchDocuments(query: string): Promise<Document[]> {
    try {
      return await this.api.searchDocuments(query);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw ServiceError.storage('Failed to search documents', error instanceof Error ? error : undefined);
    }
  }
}
