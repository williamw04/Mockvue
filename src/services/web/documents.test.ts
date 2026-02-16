import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebDocumentService } from './documents';
import type { Document } from '../../types';

describe('WebDocumentService', () => {
  let service: WebDocumentService;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    service = new WebDocumentService();
  });

  describe('getDocuments', () => {
    it('returns empty array when no documents exist', async () => {
      const docs = await service.getDocuments();
      expect(docs).toEqual([]);
    });

    it('returns documents sorted by lastModified descending', async () => {
      const docs: Document[] = [
        {
          id: '1',
          userId: 'user-1',
          title: 'Older Doc',
          questions: [],
          tags: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          lastModified: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          userId: 'user-1',
          title: 'Newer Doc',
          questions: [],
          tags: [],
          createdAt: '2026-02-01T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
          lastModified: '2026-02-01T00:00:00Z',
        },
      ];
      localStorage.setItem('mockvue_documents', JSON.stringify(docs));

      const result = await service.getDocuments();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Newer Doc');
      expect(result[1].title).toBe('Older Doc');
    });
  });

  describe('getDocument', () => {
    it('returns null when document does not exist', async () => {
      const doc = await service.getDocument('nonexistent');
      expect(doc).toBeNull();
    });

    it('returns the document matching the id', async () => {
      const docs: Document[] = [
        {
          id: 'doc-1',
          userId: 'user-1',
          title: 'My Doc',
          questions: [],
          tags: ['test'],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          lastModified: '2026-01-01T00:00:00Z',
        },
      ];
      localStorage.setItem('mockvue_documents', JSON.stringify(docs));

      const doc = await service.getDocument('doc-1');
      expect(doc).not.toBeNull();
      expect(doc!.title).toBe('My Doc');
      expect(doc!.tags).toEqual(['test']);
    });
  });

  describe('createDocument', () => {
    it('creates a document with generated id and timestamps', async () => {
      const doc = await service.createDocument({
        title: 'New Document',
        description: 'A test document',
      });

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('New Document');
      expect(doc.description).toBe('A test document');
      expect(doc.questions).toEqual([]);
      expect(doc.tags).toEqual([]);
      expect(doc.createdAt).toBeDefined();
      expect(doc.updatedAt).toBeDefined();
      expect(doc.lastModified).toBeDefined();
    });

    it('persists to localStorage', async () => {
      await service.createDocument({ title: 'Persisted Doc' });

      const stored = JSON.parse(localStorage.getItem('mockvue_documents')!);
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('Persisted Doc');
    });

    it('appends to existing documents', async () => {
      await service.createDocument({ title: 'First' });
      await service.createDocument({ title: 'Second' });

      const docs = await service.getDocuments();
      expect(docs).toHaveLength(2);
    });
  });

  describe('updateDocument', () => {
    it('updates document fields while preserving id and createdAt', async () => {
      const created = await service.createDocument({ title: 'Original' });

      // Advance time to ensure updatedAt differs
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValueOnce('2099-01-01T00:00:00Z');

      const updated = await service.updateDocument(created.id, {
        title: 'Updated Title',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(created.id);
      expect(updated.createdAt).toBe(created.createdAt);
      expect(updated.updatedAt).not.toBe(created.createdAt);

      vi.restoreAllMocks();
    });

    it('throws when document does not exist', async () => {
      await expect(
        service.updateDocument('nonexistent', { title: 'Nope' }),
      ).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('removes the document from storage', async () => {
      const doc = await service.createDocument({ title: 'To Delete' });
      await service.deleteDocument(doc.id);

      const docs = await service.getDocuments();
      expect(docs).toHaveLength(0);
    });

    it('does not affect other documents', async () => {
      const doc1 = await service.createDocument({ title: 'Keep' });
      const doc2 = await service.createDocument({ title: 'Delete' });

      await service.deleteDocument(doc2.id);

      const docs = await service.getDocuments();
      expect(docs).toHaveLength(1);
      expect(docs[0].id).toBe(doc1.id);
    });
  });

  describe('searchDocuments', () => {
    beforeEach(async () => {
      await service.createDocument({
        title: 'React Interview Prep',
        description: 'Frontend questions',
        tags: ['frontend'],
        questions: [
          { id: 'q1', text: 'What is a hook?', response: 'A hook is...', isExpanded: false },
        ],
      });
      await service.createDocument({
        title: 'System Design Notes',
        description: 'Architecture patterns',
        tags: ['backend'],
        questions: [
          { id: 'q2', text: 'Explain microservices', response: 'Microservices are...', isExpanded: false },
        ],
      });
    });

    it('searches by title', async () => {
      const results = await service.searchDocuments('react');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('React Interview Prep');
    });

    it('searches by description', async () => {
      const results = await service.searchDocuments('architecture');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('System Design Notes');
    });

    it('searches by tags', async () => {
      const results = await service.searchDocuments('frontend');
      expect(results).toHaveLength(1);
    });

    it('searches by question text', async () => {
      const results = await service.searchDocuments('hook');
      expect(results).toHaveLength(1);
    });

    it('searches by response text', async () => {
      const results = await service.searchDocuments('microservices are');
      expect(results).toHaveLength(1);
    });

    it('returns empty for no matches', async () => {
      const results = await service.searchDocuments('python');
      expect(results).toHaveLength(0);
    });

    it('is case insensitive', async () => {
      const results = await service.searchDocuments('REACT');
      expect(results).toHaveLength(1);
    });
  });
});
