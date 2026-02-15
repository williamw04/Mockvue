/**
 * Web Document Service Implementation
 * Uses localStorage for data persistence
 */

import type { Document, DocumentData } from '../../types';
import type { IDocumentService } from '../interfaces';

const STORAGE_KEY = 'mockvue_documents';

export class WebDocumentService implements IDocumentService {
  private getAllDocumentsFromStorage(): Document[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading documents from localStorage:', error);
      return [];
    }
  }

  private saveDocumentsToStorage(documents: Document[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving documents to localStorage:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<Document[]> {
    try {
      const documents = this.getAllDocumentsFromStorage();
      // Sort by last modified (most recent first)
      return documents.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const documents = this.getAllDocumentsFromStorage();
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async createDocument(data: DocumentData): Promise<Document> {
    try {
      const documents = this.getAllDocumentsFromStorage();
      const now = new Date().toISOString();
      
      const newDocument: Document = {
        id: crypto.randomUUID(),
        userId: 'user-1', // Will be replaced with actual user ID
        title: data.title,
        description: data.description,
        questions: data.questions || [],
        tags: data.tags || [],
        createdAt: now,
        updatedAt: now,
        lastModified: now,
      };
      
      documents.push(newDocument);
      this.saveDocumentsToStorage(documents);
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    try {
      const documents = this.getAllDocumentsFromStorage();
      const index = documents.findIndex(doc => doc.id === id);
      
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      const updated: Document = {
        ...documents[index],
        ...data,
        id: documents[index].id,
        userId: documents[index].userId,
        createdAt: documents[index].createdAt,
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      
      documents[index] = updated;
      this.saveDocumentsToStorage(documents);
      return updated;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const documents = this.getAllDocumentsFromStorage();
      const filtered = documents.filter(doc => doc.id !== id);
      this.saveDocumentsToStorage(filtered);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const documents = await this.getDocuments();
      const lowerQuery = query.toLowerCase();
      
      return documents.filter(doc =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.description?.toLowerCase().includes(lowerQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        doc.questions.some(q => 
          q.text.toLowerCase().includes(lowerQuery) ||
          q.response.toLowerCase().includes(lowerQuery)
        )
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}
