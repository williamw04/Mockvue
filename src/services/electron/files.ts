/**
 * Electron File Service Implementation
 * Uses native Electron dialogs and file system access
 */

import type { Document, DocumentData, FilePickerOptions } from '../../types';
import type { IFileService } from '../interfaces';

export class ElectronFileService implements IFileService {
  async pickFile(options?: FilePickerOptions): Promise<File | File[] | null> {
    // Note: In a full implementation, you would add IPC handlers in main.ts
    // for dialog.showOpenDialog
    console.warn('File picker not yet fully implemented for Electron');
    console.log('Options:', options);
    
    // For now, return null. This would be implemented with:
    // return await window.electronAPI.openFileDialog(options);
    return null;
  }

  async saveFile(content: string, filename?: string): Promise<boolean> {
    // Note: In a full implementation, you would add IPC handlers in main.ts
    // for dialog.showSaveDialog and fs.writeFile
    console.warn('Save file not yet fully implemented for Electron');
    console.log('Saving:', filename, 'Content length:', content.length);
    
    // For now, return true. This would be implemented with:
    // return await window.electronAPI.saveFileDialog(content, filename);
    return true;
  }

  async readFile(file: File | string): Promise<string> {
    if (file instanceof File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
    
    // For file path strings, use IPC
    // return await window.electronAPI.readFile(file);
    console.warn('Reading file by path not yet implemented');
    return '';
  }

  async exportDocument(document: Document, format: 'json' | 'txt' | 'html'): Promise<boolean> {
    let content = '';
    let extension = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify(document, null, 2);
        extension = 'json';
        break;
      case 'txt':
        content = `${document.title}\n\n${document.description}\n\n${document.content || ''}`;
        extension = 'txt';
        break;
      case 'html':
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1a202c; }
    .meta { color: #718096; font-size: 0.875rem; }
    .tags { margin: 1rem 0; }
    .tag { display: inline-block; background: #edf2f7; padding: 0.25rem 0.75rem; border-radius: 0.25rem; margin-right: 0.5rem; }
  </style>
</head>
<body>
  <h1>${document.title}</h1>
  <div class="meta">
    Last modified: ${new Date(document.lastModified).toLocaleDateString()}
    | Word count: ${document.wordCount}
  </div>
  <div class="tags">
    ${document.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
  </div>
  <p>${document.description}</p>
  <div>${document.content || ''}</div>
</body>
</html>
        `.trim();
        extension = 'html';
        break;
    }
    
    const filename = `${document.title}.${extension}`;
    return this.saveFile(content, filename);
  }

  async importDocument(file: File): Promise<DocumentData> {
    const content = await this.readFile(file);
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      
      if (parsed.title) {
        return {
          title: parsed.title,
          description: parsed.description,
          content: parsed.content,
          tags: parsed.tags || [],
        };
      }
    } catch {
      // Not JSON, treat as plain text
    }
    
    // Import as plain text
    return {
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: 'Imported from file',
      content,
      tags: [],
    };
  }
}

