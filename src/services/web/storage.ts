/**
 * Web Storage Service Implementation
 * Uses IndexedDB for browser-based storage
 */

import type { Document, DocumentData } from '../../types';
import type { IStorageService } from '../interfaces';

const DB_NAME = 'mockvue-db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export class WebStorageService implements IStorageService {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('lastModified', 'lastModified', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async getDocuments(): Promise<Document[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting documents from IndexedDB:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting document from IndexedDB:', error);
      return null;
    }
  }

  async createDocument(data: DocumentData): Promise<Document> {
    try {
      const document: Document = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || '',
        content: data.content || '',
        tags: data.tags || [],
        wordCount: data.content ? data.content.split(/\s+/).length : 0,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.add(document);
        request.onsuccess = () => resolve(document);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error creating document in IndexedDB:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: Partial<DocumentData>): Promise<Document> {
    try {
      const existingDoc = await this.getDocument(id);
      
      if (!existingDoc) {
        throw new Error(`Document with id ${id} not found`);
      }

      const updatedDoc: Document = {
        ...existingDoc,
        ...data,
        wordCount: data.content ? data.content.split(/\s+/).length : existingDoc.wordCount,
        lastModified: new Date().toISOString(),
      };

      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.put(updatedDoc);
        request.onsuccess = () => resolve(updatedDoc);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error updating document in IndexedDB:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting document from IndexedDB:', error);
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
        doc.content?.toLowerCase().includes(lowerQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}

