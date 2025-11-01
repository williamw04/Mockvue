import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useStorage, useFiles, useNotifications } from "../services";
import { Document } from "../types";
// Default styles for the mantine editor
import "@blocknote/mantine/style.css";
// Include the included Inter font
import "@blocknote/core/fonts/inter.css";

export default function MyEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const storage = useStorage();
  const files = useFiles();
  const notifications = useNotifications();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const editor = useCreateBlockNote();

  // Load document on mount if ID is provided
  useEffect(() => {
    if (id) {
      loadDocument(id);
    } else {
      // Creating new document
      setDocument({
        id: crypto.randomUUID(),
        title: 'Untitled Document',
        description: '',
        content: '',
        tags: [],
        wordCount: 0,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  }, [id]);

  // Auto-save when editor content changes
  useEffect(() => {
    if (!document) return;

    const handleChange = () => {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save (2 seconds after last change)
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    };

    // Note: You might need to add BlockNote's onChange handler here
    // editor.onChange(handleChange);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document, editor]);

  const loadDocument = async (docId: string) => {
    try {
      const doc = await storage.getDocument(docId);
      
      if (doc) {
        setDocument(doc);
        
        // Load content into editor
        if (doc.content) {
          try {
            const blocks = JSON.parse(doc.content);
            editor.replaceBlocks(editor.document, blocks);
          } catch {
            // If content is not JSON (plain text), create a single paragraph
            editor.replaceBlocks(editor.document, [{
              type: "paragraph",
              content: doc.content,
            }]);
          }
        }
        
        setLastSaved(new Date(doc.lastModified));
      } else {
        await notifications.showError('Document not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      await notifications.showError('Failed to load document');
      navigate('/');
    }
  };

  const handleAutoSave = async () => {
    if (!document || !hasUnsavedChanges) return;
    await saveDocument(false); // false = don't show notification
  };

  const saveDocument = async (showNotification = true) => {
    if (!document) return;
    
    try {
      setIsSaving(true);
      
      // Get current editor content
      const blocks = editor.document;
      const content = JSON.stringify(blocks);
      
      // Calculate word count
      const text = blocks.map((block: any) => block.content || '').join(' ');
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      
      // Update or create document
      if (id) {
        await storage.updateDocument(document.id, {
          content,
          title: document.title,
          description: document.description,
          tags: document.tags,
        });
      } else {
        await storage.createDocument({
          title: document.title,
          description: document.description,
          content,
          tags: document.tags,
        });
        // After first save, navigate to the document's URL
        navigate(`/document/${document.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (showNotification) {
        await notifications.showSuccess('Document saved!');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      await notifications.showError('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'json' | 'txt' | 'html') => {
    if (!document) return;
    
    try {
      // Save first to ensure latest content
      await saveDocument(false);
      
      // Get latest document
      const latestDoc = await storage.getDocument(document.id);
      if (latestDoc) {
        await files.exportDocument(latestDoc, format);
        await notifications.showSuccess(`Exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error exporting document:', error);
      await notifications.showError('Failed to export document');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* User Profile Section */}
        <div className="p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              W
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">William Wu</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <span className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </span>
                <span className="text-sm">Back to Home</span>
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-blue-50 text-blue-600 font-medium"
              >
                <span className="text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                <span className="text-sm">Editor</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => saveDocument(true)}
            disabled={isSaving}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <span className="text-white">
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
            </span>
            <span className="text-sm font-medium">
              {isSaving ? 'Saving...' : 'Save Document'}
            </span>
          </button>
          
          {/* Export dropdown */}
          <div className="relative group">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
              <span className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span className="text-sm">Export</span>
            </button>
            
            {/* Export dropdown menu */}
            <div className="hidden group-hover:block absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={() => handleExport('html')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                Export as HTML
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('txt')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
              >
                Export as Text
              </button>
            </div>
          </div>
          
          {/* Save status */}
          {lastSaved && (
            <p className="text-xs text-gray-500 text-center pt-2">
              {hasUnsavedChanges ? (
                <span className="text-orange-600">Unsaved changes</span>
              ) : (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              )}
            </p>
          )}
        </div>
      </aside>

      {/* Editor Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Document header */}
        {document && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <input
              type="text"
              value={document.title}
              onChange={(e) => {
                setDocument({ ...document, title: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="text-2xl font-bold text-gray-900 border-none outline-none w-full focus:ring-0 bg-transparent"
              placeholder="Document title..."
            />
            <input
              type="text"
              value={document.description}
              onChange={(e) => {
                setDocument({ ...document, description: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="text-sm text-gray-600 border-none outline-none w-full focus:ring-0 bg-transparent mt-2"
              placeholder="Add a description..."
            />
          </div>
        )}
        
        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <BlockNoteView editor={editor} />
        </div>
      </main>
    </div>
  );
}