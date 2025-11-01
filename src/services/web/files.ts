/**
 * Web File Service Implementation
 * Uses File System Access API and fallback methods for browsers
 */

import type { Document, DocumentData, FilePickerOptions } from '../../types';
import type { IFileService } from '../interfaces';

export class WebFileService implements IFileService {
  /**
   * Check if File System Access API is available
   */
  private hasFileSystemAccess(): boolean {
    return 'showOpenFilePicker' in window;
  }

  async pickFile(options?: FilePickerOptions): Promise<File | File[] | null> {
    // Try modern File System Access API first
    if (this.hasFileSystemAccess()) {
      try {
        const pickerOpts: OpenFilePickerOptions = {
          multiple: options?.multiple || false,
          types: options?.accept ? [{
            description: 'Documents',
            accept: {
              'application/*': options.accept,
            },
          }] : undefined,
        };

        const handles = await (window as any).showOpenFilePicker(pickerOpts);
        
        if (options?.multiple) {
          const files = await Promise.all(
            handles.map((handle: any) => handle.getFile())
          );
          return files;
        } else {
          const file = await handles[0].getFile();
          return file;
        }
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error with File System Access API:', error);
        }
        return null;
      }
    }

    // Fallback to traditional file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.multiple || false;
      
      if (options?.accept) {
        input.accept = options.accept.join(',');
      }

      input.onchange = () => {
        const files = Array.from(input.files || []);
        
        if (files.length === 0) {
          resolve(null);
        } else if (options?.multiple) {
          resolve(files);
        } else {
          resolve(files[0]);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  async saveFile(content: string, filename?: string): Promise<boolean> {
    const suggestedName = filename || 'document.txt';

    // Try modern File System Access API first
    if (this.hasFileSystemAccess()) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName,
          types: [{
            description: 'Text Files',
            accept: {
              'text/plain': ['.txt'],
              'text/html': ['.html'],
              'application/json': ['.json'],
            },
          }],
        });

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error with File System Access API:', error);
        }
        return false;
      }
    }

    // Fallback to download
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  }

  async readFile(file: File | string): Promise<string> {
    if (typeof file === 'string') {
      throw new Error('Cannot read file by path in web environment');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  async exportDocument(document: Document, format: 'json' | 'txt' | 'html'): Promise<boolean> {
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify(document, null, 2);
        filename = `${document.title}.json`;
        break;
        
      case 'txt':
        content = `${document.title}\n${'='.repeat(document.title.length)}\n\n`;
        content += `${document.description}\n\n`;
        content += `Tags: ${document.tags.join(', ')}\n`;
        content += `Last Modified: ${new Date(document.lastModified).toLocaleDateString()}\n`;
        content += `Word Count: ${document.wordCount}\n\n`;
        content += `${'─'.repeat(50)}\n\n`;
        content += document.content || '';
        filename = `${document.title}.txt`;
        break;
        
      case 'html':
        content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #f9fafb;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #1a202c;
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    .meta {
      color: #718096;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-item {
      display: inline-block;
      margin-right: 1.5rem;
    }
    .tags {
      margin: 1rem 0;
    }
    .tag {
      display: inline-block;
      background: #edf2f7;
      color: #2d3748;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .description {
      color: #4a5568;
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    .content {
      color: #2d3748;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${document.title}</h1>
    
    <div class="meta">
      <span class="meta-item">📅 ${new Date(document.lastModified).toLocaleDateString()}</span>
      <span class="meta-item">📝 ${document.wordCount} words</span>
      <span class="meta-item">🕐 Created ${new Date(document.createdAt).toLocaleDateString()}</span>
    </div>
    
    ${document.tags.length > 0 ? `
    <div class="tags">
      ${document.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
    </div>
    ` : ''}
    
    ${document.description ? `<p class="description">${document.description}</p>` : ''}
    
    <div class="content">${document.content || ''}</div>
  </div>
</body>
</html>`;
        filename = `${document.title}.html`;
        break;
    }
    
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
          description: parsed.description || '',
          content: parsed.content || '',
          tags: parsed.tags || [],
        };
      }
    } catch {
      // Not JSON, continue with plain text
    }
    
    // Import as plain text document
    const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    return {
      title,
      description: `Imported from ${file.name}`,
      content,
      tags: ['imported'],
    };
  }
}

