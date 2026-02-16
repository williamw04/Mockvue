# Services Abstraction Layer - Usage Guide

This guide explains how to use the services abstraction layer to build features for the Electron environment.

## Overview

The services abstraction layer provides a unified API for platform-specific functionality:

- **Storage Service**: Document persistence (Electron: IPC/File System)
- **File Service**: File operations (Electron: Native dialogs)
- **Notification Service**: System notifications (Electron: Native)

## Quick Start

### 1. Using Services in Components

The easiest way to use services is through React hooks:

```typescript
import { useStorage, useFiles, useNotifications } from './services';

function MyComponent() {
  const storage = useStorage();
  const files = useFiles();
  const notifications = useNotifications();

  const handleCreateDocument = async () => {
    try {
      const doc = await storage.createDocument({
        title: 'New Document',
        description: 'A new document',
        content: 'Hello world!',
        tags: ['example'],
      });

      await notifications.showSuccess('Document created successfully!');
    } catch (error) {
      await notifications.showError('Failed to create document');
    }
  };

  // ... rest of component
}
```

### 2. Using All Services Together

```typescript
import { useServices } from './services';

function Dashboard() {
  const { storage, files, notifications } = useServices();

  const loadDocuments = async () => {
    const docs = await storage.getDocuments();
    return docs;
  };

  const exportDocument = async (docId: string) => {
    const doc = await storage.getDocument(docId);
    if (doc) {
      const success = await files.exportDocument(doc, 'html');
      if (success) {
        await notifications.showSuccess('Document exported!');
      }
    }
  };

  // ... rest of component
}
```

## Complete Examples

### Example 1: Document Management

```typescript
import { useStorage, useNotifications } from './services';
import { useState, useEffect } from 'react';

function DocumentManager() {
  const storage = useStorage();
  const notifications = useNotifications();
  const [documents, setDocuments] = useState([]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await storage.getDocuments();
    setDocuments(docs);
  };

  const createDocument = async (data) => {
    try {
      const newDoc = await storage.createDocument(data);
      setDocuments([...documents, newDoc]);
      await notifications.showSuccess('Document created!');
    } catch (error) {
      await notifications.showError('Failed to create document');
    }
  };

  const updateDocument = async (id, data) => {
    try {
      const updated = await storage.updateDocument(id, data);
      setDocuments(documents.map(doc => doc.id === id ? updated : doc));
      await notifications.showSuccess('Document updated!');
    } catch (error) {
      await notifications.showError('Failed to update document');
    }
  };

  const deleteDocument = async (id) => {
    try {
      await storage.deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
      await notifications.showSuccess('Document deleted!');
    } catch (error) {
      await notifications.showError('Failed to delete document');
    }
  };

  return (
    <div>
      <button onClick={() => createDocument({
        title: 'New Doc',
        description: 'Description',
      })}>
        Create Document
      </button>
      {/* Render documents */}
    </div>
  );
}
```

### Example 2: File Import/Export

```typescript
import { useFiles, useStorage, useNotifications } from './services';

function FileOperations() {
  const files = useFiles();
  const storage = useStorage();
  const notifications = useNotifications();

  const handleImport = async () => {
    try {
      const file = await files.pickFile({
        accept: ['.json', '.txt'],
      });

      if (file && !(file instanceof Array)) {
        const documentData = await files.importDocument(file);
        const newDoc = await storage.createDocument(documentData);
        await notifications.showSuccess(`Imported: ${newDoc.title}`);
      }
    } catch (error) {
      await notifications.showError('Failed to import file');
    }
  };

  const handleExport = async (documentId: string) => {
    try {
      const doc = await storage.getDocument(documentId);
      
      if (doc) {
        const success = await files.exportDocument(doc, 'html');
        
        if (success) {
          await notifications.showSuccess('Document exported!');
        }
      }
    } catch (error) {
      await notifications.showError('Failed to export document');
    }
  };

  return (
    <div>
      <button onClick={handleImport}>Import File</button>
      <button onClick={() => handleExport('doc-id')}>Export as HTML</button>
    </div>
  );
}
```

### Example 3: Search Functionality

```typescript
import { useStorage } from './services';
import { useState } from 'react';

function SearchBar() {
  const storage = useStorage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim()) {
      const docs = await storage.searchDocuments(searchQuery);
      setResults(docs);
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search documents..."
      />
      <div>
        {results.map(doc => (
          <div key={doc.id}>{doc.title}</div>
        ))}
      </div>
    </div>
  );
}
```



## Service Interface Reference

### Storage Service

```typescript
interface IStorageService {
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  createDocument(data: DocumentData): Promise<Document>;
  updateDocument(id: string, data: Partial<DocumentData>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  searchDocuments(query: string): Promise<Document[]>;
}
```

### File Service

```typescript
interface IFileService {
  pickFile(options?: FilePickerOptions): Promise<File | File[] | null>;
  saveFile(content: string, filename?: string): Promise<boolean>;
  readFile(file: File | string): Promise<string>;
  exportDocument(document: Document, format: 'json' | 'txt' | 'html'): Promise<boolean>;
  importDocument(file: File): Promise<DocumentData>;
}
```

### Notification Service

```typescript
interface INotificationService {
  isSupported(): boolean;
  requestPermission(): Promise<boolean>;
  show(options: NotificationOptions): Promise<void>;
  showSuccess(message: string): Promise<void>;
  showError(message: string): Promise<void>;
  showInfo(message: string): Promise<void>;
}
```

## Best Practices

1. **Always use the service hooks** instead of directly accessing Electron APIs
2. **Handle errors gracefully**
3. **Show user feedback** - use notifications for important operations

## Testing

You can provide mock services for testing:

```typescript
import { ServicesProvider } from './services';

// In your test
const mockStorage = {
  getDocuments: jest.fn().mockResolvedValue([]),
  // ... other methods
};

const mockServices = {
  storage: mockStorage,
  files: mockFileService,
  notifications: mockNotificationService,
};

render(
  <ServicesProvider services={mockServices}>
    <YourComponent />
  </ServicesProvider>
);
```

## Next Steps

To complete the Electron implementation:

1. Add IPC handlers in `electron/main.ts` for file operations
2. Implement actual file system storage in Electron
3. Add database integration (SQLite, etc.) if needed
4. Implement auto-update for Electron
5. Add more platform-specific features as needed



