import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useStorage, useNotifications } from "../services";
import { Document } from "../types";
import AIAssistantPanel from "./AIAssistantPanel";
import ResponseSelector from "./ResponseSelector";
import { customSchema } from "../blocks/schema";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export default function DocumentPageWithAI() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const storage = useStorage();
  const notifications = useNotifications();
  
  // Document state
  const [document, setDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Sidebar section collapse states
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [aiStudioOpen, setAiStudioOpen] = useState(true);
  const [responsesOpen, setResponsesOpen] = useState(true);
  const [selectedResponseCount, setSelectedResponseCount] = useState(0);
  
  // Initialize BlockNote editor with custom schema
  const editor = useCreateBlockNote({
    schema: customSchema,
    initialContent: [
      {
        type: "heading",
        content: "📚 Sample Question Block Demo",
      },
      {
        type: "paragraph",
        content: "This document demonstrates the agentic AI system integrated with custom BlockNote blocks. Try the features below!",
      },
      {
        type: "paragraph",
        content: "",
      },
      {
        type: "question",
        props: {
          questionText: "What are the key principles of effective learning?",
          aiFeatureEnabled: true,
        },
      },
      {
        type: "response",
        props: {
          selected: false,
          aiGenerated: false,
        },
        content: [
          {
            type: "text",
            text: "Active engagement with the material through practice and application helps solidify understanding and retention.",
            styles: {},
          },
        ],
      },
      {
        type: "response",
        props: {
          selected: false,
          aiGenerated: false,
        },
        content: [
          {
            type: "text",
            text: "Spaced repetition and distributed practice are more effective than cramming for long-term retention.",
            styles: {},
          },
        ],
      },
      {
        type: "context",
        content: [
          {
            type: "text",
            text: "Research in cognitive psychology demonstrates that learning is optimized through multiple strategies including retrieval practice, elaboration, and interleaving.",
            styles: {},
          },
        ],
      },
      {
        type: "notes",
        content: [
          {
            type: "text",
            text: "Remember to review the meta-analysis by Dunlosky et al. (2013) on learning techniques.",
            styles: {},
          },
        ],
      },
      {
        type: "paragraph",
        content: "",
      },
      {
        type: "heading",
        content: "🤖 How to Use AI Features",
      },
      {
        type: "paragraph",
        content: "1. 💡 Brainstorm: Generate creative ideas based on your document context",
      },
      {
        type: "paragraph",
        content: "2. 📝 Feedback: Select a response block (click it to select) and get AI feedback",
      },
      {
        type: "paragraph",
        content: "3. ✍️ Draft: Create a structured draft from your responses and context",
      },
    ],
  });

  // Load document on mount
  useEffect(() => {
    if (id) {
      loadDocument(id);
    } else {
      // Creating new document
      setDocument({
        id: crypto.randomUUID(),
        title: 'AI-Powered Document',
        description: 'Document with agentic AI features',
        content: '',
        tags: ['AI', 'Demo'],
        wordCount: 0,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  }, [id]);

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

  const saveDocument = async () => {
    if (!document) return;
    
    try {
      setIsSaving(true);
      
      // Get current editor content
      const blocks = editor.document;
      const content = JSON.stringify(blocks);
      
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
        navigate(`/document/${document.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
      await notifications.showSuccess('Document saved!');
    } catch (error) {
      console.error('Error saving document:', error);
      await notifications.showError('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  // Insert custom blocks
  const insertQuestionBlock = () => {
    editor.insertBlocks(
      [
        {
          type: 'question',
          props: {
            questionText: 'Type your question here...',
            aiFeatureEnabled: true,
          },
        },
      ],
      editor.getTextCursorPosition().block,
      'after'
    );
  };

  const insertResponseBlock = () => {
    editor.insertBlocks(
      [
        {
          type: 'response',
          props: {
            selected: false,
            aiGenerated: false,
          },
          content: 'Type your response here...',
        },
      ],
      editor.getTextCursorPosition().block,
      'after'
    );
  };

  const insertContextBlock = () => {
    editor.insertBlocks(
      [
        {
          type: 'context',
          content: 'Add context information here...',
        },
      ],
      editor.getTextCursorPosition().block,
      'after'
    );
  };

  const insertNotesBlock = () => {
    editor.insertBlocks(
      [
        {
          type: 'notes',
          content: 'Add notes here...',
        },
      ],
      editor.getTextCursorPosition().block,
      'after'
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-14 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Document</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Custom Block Toolbar */}
          <div className="flex items-center gap-1 px-2 border-l border-gray-700">
            <button
              onClick={insertQuestionBlock}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Insert Question Block"
            >
              <span className="text-lg">❓</span>
            </button>
            <button
              onClick={insertResponseBlock}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Insert Response Block"
            >
              <span className="text-lg">💬</span>
            </button>
            <button
              onClick={insertContextBlock}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Insert Context Block"
            >
              <span className="text-lg">📋</span>
            </button>
            <button
              onClick={insertNotesBlock}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title="Insert Notes Block"
            >
              <span className="text-lg">📝</span>
            </button>
          </div>

          {/* Save button */}
          <button
            onClick={saveDocument}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </>
            )}
          </button>

          {/* Close button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded transition-colors ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <div className="max-w-3xl mx-auto px-12 py-8">
            
            {/* Document Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <span className="text-4xl">🤖</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-300 mb-4 text-center hover:text-white transition-colors duration-300">
                {document?.title || 'AI-Powered Document'}
              </h1>
            </div>

            {/* Editor Content */}
            <div className="document-editor-dark">
              <style>{`
                .document-editor-dark .bn-container {
                  background-color: transparent !important;
                }
                .document-editor-dark .bn-block-content {
                  color: #d1d5db !important;
                }
                .document-editor-dark [data-node-type="heading"] {
                  color: #f3f4f6 !important;
                  font-weight: 600;
                }
                .document-editor-dark .bn-inline-content {
                  caret-color: #fff;
                }
                .document-editor-dark .ProseMirror {
                  padding: 0;
                }
                .document-editor-dark h1 {
                  font-size: 2em;
                  font-weight: 700;
                  color: #f9fafb !important;
                  margin: 1em 0 0.5em;
                }
                .document-editor-dark h2 {
                  font-size: 1.5em;
                  font-weight: 600;
                  color: #f3f4f6 !important;
                  margin: 0.8em 0 0.4em;
                }
                .document-editor-dark h3 {
                  font-size: 1.17em;
                  font-weight: 600;
                  color: #e5e7eb !important;
                  margin: 0.6em 0 0.3em;
                }
                .document-editor-dark p {
                  color: #d1d5db !important;
                  line-height: 1.6;
                  margin: 0.5em 0;
                }
                .document-editor-dark .bn-side-menu {
                  color: #9ca3af;
                }
                .document-editor-dark .bn-drag-handle {
                  color: #6b7280;
                }
              `}</style>
              <BlockNoteView 
                editor={editor} 
                theme="dark"
              />
            </div>

          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-96 border-l border-gray-800 overflow-y-auto bg-[#1a1a1a] flex flex-col">
          
          {/* AI STUDIO */}
          <div className="border-b border-gray-800">
            <button
              onClick={() => setAiStudioOpen(!aiStudioOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                🤖 AI Studio
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${aiStudioOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {aiStudioOpen && (
              <div className="h-96">
                <AIAssistantPanel editor={editor} />
              </div>
            )}
          </div>

          {/* RESPONSES */}
          <div className="border-b border-gray-800 flex-1 flex flex-col">
            <button
              onClick={() => setResponsesOpen(!responsesOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                💬 Responses {selectedResponseCount > 0 && `(${selectedResponseCount})`}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${responsesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {responsesOpen && (
              <div className="flex-1 min-h-0">
                <ResponseSelector 
                  editor={editor} 
                  onSelectionChange={setSelectedResponseCount}
                />
              </div>
            )}
          </div>

          {/* PROPERTIES */}
          <div className="border-b border-gray-800">
            <button
              onClick={() => setPropertiesOpen(!propertiesOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Properties
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${propertiesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {propertiesOpen && (
              <div className="px-4 pb-4 space-y-3">
                {/* Tags */}
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm text-gray-400 flex-shrink-0">Tags</span>
                  <div className="ml-auto flex flex-wrap gap-1.5 justify-end">
                    {document?.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Saved */}
                {lastSaved && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-400">Last Saved</span>
                    <span className="ml-auto text-sm text-gray-300">{lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}

