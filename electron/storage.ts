/**
 * Document Storage Manager for Electron
 * Handles file system operations for document persistence
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

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

export class DocumentStorage {
  private documentsDir: string;
  private metadataFile: string;

  constructor() {
    // Use app's userData directory for document storage
    const userDataPath = app.getPath('userData');
    this.documentsDir = path.join(userDataPath, 'documents');
    this.metadataFile = path.join(userDataPath, 'documents-metadata.json');

    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  /**
   * Get path for a document file
   */
  private getDocumentPath(id: string): string {
    return path.join(this.documentsDir, `${id}.json`);
  }

  /**
   * Load metadata index (for quick listing without reading all files)
   */
  private loadMetadata(): Record<string, Omit<Document, 'content'>> {
    try {
      if (fs.existsSync(this.metadataFile)) {
        const data = fs.readFileSync(this.metadataFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
    return {};
  }

  /**
   * Save metadata index
   */
  private saveMetadata(metadata: Record<string, Omit<Document, 'content'>>): void {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving metadata:', error);
      throw error;
    }
  }

  /**
   * Get all documents
   */
  async getDocuments(): Promise<Document[]> {
    try {
      const metadata = this.loadMetadata();
      const documents: Document[] = [];

      // Get all document files
      const files = fs.readdirSync(this.documentsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          const doc = await this.getDocument(id);
          if (doc) {
            documents.push(doc);
          }
        }
      }

      // Sort by last modified (most recent first)
      documents.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );

      return documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    try {
      const docPath = this.getDocumentPath(id);
      
      if (fs.existsSync(docPath)) {
        const data = fs.readFileSync(docPath, 'utf-8');
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  /**
   * Create a new document
   */
  async createDocument(data: DocumentData): Promise<Document> {
    try {
      const document: Document = {
        id: this.generateId(),
        title: data.title,
        description: data.description || '',
        content: data.content || '',
        tags: data.tags || [],
        wordCount: this.calculateWordCount(data.content || ''),
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Save document file
      const docPath = this.getDocumentPath(document.id);
      fs.writeFileSync(docPath, JSON.stringify(document, null, 2), 'utf-8');

      // Update metadata index
      const metadata = this.loadMetadata();
      const { content, ...metadataEntry } = document;
      metadata[document.id] = metadataEntry;
      this.saveMetadata(metadata);

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(id: string, data: Partial<DocumentData>): Promise<Document> {
    try {
      const existingDoc = await this.getDocument(id);
      
      if (!existingDoc) {
        throw new Error(`Document with id ${id} not found`);
      }

      const updatedDoc: Document = {
        ...existingDoc,
        title: data.title !== undefined ? data.title : existingDoc.title,
        description: data.description !== undefined ? data.description : existingDoc.description,
        content: data.content !== undefined ? data.content : existingDoc.content,
        tags: data.tags !== undefined ? data.tags : existingDoc.tags,
        wordCount: data.content !== undefined 
          ? this.calculateWordCount(data.content) 
          : existingDoc.wordCount,
        lastModified: new Date().toISOString(),
      };

      // Save document file
      const docPath = this.getDocumentPath(id);
      fs.writeFileSync(docPath, JSON.stringify(updatedDoc, null, 2), 'utf-8');

      // Update metadata index
      const metadata = this.loadMetadata();
      const { content, ...metadataEntry } = updatedDoc;
      metadata[id] = metadataEntry;
      this.saveMetadata(metadata);

      return updatedDoc;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      const docPath = this.getDocumentPath(id);
      
      if (fs.existsSync(docPath)) {
        fs.unlinkSync(docPath);
      }

      // Update metadata index
      const metadata = this.loadMetadata();
      delete metadata[id];
      this.saveMetadata(metadata);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Search documents by query
   */
  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const allDocs = await this.getDocuments();
      const lowerQuery = query.toLowerCase();

      return allDocs.filter(doc => 
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

  /**
   * Generate a unique ID for documents
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate word count from text
   */
  private calculateWordCount(text: string): number {
    if (!text) return 0;
    
    // Try to parse as JSON (BlockNote format)
    try {
      const blocks = JSON.parse(text);
      if (Array.isArray(blocks)) {
        const allText = blocks
          .map((block: any) => this.extractTextFromBlock(block))
          .join(' ');
        return this.countWords(allText);
      }
    } catch {
      // Not JSON, treat as plain text
    }
    
    return this.countWords(text);
  }

  /**
   * Extract text from BlockNote block (recursive)
   */
  private extractTextFromBlock(block: any): string {
    let text = '';
    
    if (block.content) {
      if (typeof block.content === 'string') {
        text += block.content + ' ';
      } else if (Array.isArray(block.content)) {
        text += block.content.map((item: any) => {
          if (typeof item === 'string') return item;
          if (item.text) return item.text;
          return '';
        }).join(' ');
      }
    }
    
    // Handle nested blocks (e.g., list items, nested structures)
    if (block.children && Array.isArray(block.children)) {
      text += block.children.map((child: any) => this.extractTextFromBlock(child)).join(' ');
    }
    
    return text;
  }

  /**
   * Count words in plain text
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    totalWords: number;
    storageSize: number;
  }> {
    try {
      const documents = await this.getDocuments();
      const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0);
      
      // Calculate storage size
      let storageSize = 0;
      const files = fs.readdirSync(this.documentsDir);
      for (const file of files) {
        const filePath = path.join(this.documentsDir, file);
        const stats = fs.statSync(filePath);
        storageSize += stats.size;
      }

      return {
        totalDocuments: documents.length,
        totalWords,
        storageSize,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalDocuments: 0,
        totalWords: 0,
        storageSize: 0,
      };
    }
  }
}

