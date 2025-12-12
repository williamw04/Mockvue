import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useStorage, useNotifications } from "../services";
import { Document } from "../types";
import { useTheme } from "../services/ThemeContext";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export default function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const storage = useStorage();
  const notifications = useNotifications();
  const { theme } = useTheme();
  
  // Document state
  const [document, setDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Sidebar section collapse states
  const [aiStudioOpen, setAiStudioOpen] = useState(true);
  const [backlinksOpen, setBacklinksOpen] = useState(true);
  
  // Initialize BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "Overview",
      },
      {
        type: "paragraph",
        content: "These sources provide an extensive overview of concepts central to positive psychology, focusing on character strengths, character and successful aging, hope, relating them directly to goal attainment and providing methods for measuring and increasing these traits.",
      },
      {
        type: "paragraph",
        content: "",
      },
      {
        type: "paragraph",
        content: "The second source discusses the character strengths—the Values in Action (VIA) system, which classifies core human strengths like wisdom, courage, and temperance.",
      },
      {
        type: "paragraph",
        content: "",
      },
      {
        type: "heading",
        content: "Key Concepts",
      },
      {
        type: "paragraph",
        content: "",
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

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Navigation Bar */}
      <header className={`flex-shrink-0 h-14 border-b flex items-center justify-between px-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Document</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Duplicate */}
          <button className={`p-2 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Menu */}
          <button className={`p-2 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Close button */}
          <button
            onClick={() => navigate('/')}
            className={`p-2 rounded transition-colors ml-2 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
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
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto px-12 py-8">
            
            {/* Document Title - with subtle animation */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '100ms'}}>
              <h1 className={`text-4xl font-bold mb-4 text-center transition-colors duration-300 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'}`}>
                The Science and Strategies of Success
              </h1>
            </div>

            {/* Editor Toolbar - Custom styling to match theme */}
            <div className={`mb-2 flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <button className={`transition-colors flex items-center gap-1 ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>
                <span className="font-medium">T</span>
              </button>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>
                <span className="font-bold">H</span>
              </button>
              <div className={`h-4 w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>≡</button>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>☰</button>
              <div className={`h-4 w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>&lt;/&gt;</button>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>99</button>
              <div className={`h-4 w-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>📎</button>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>🔗</button>
              <button className={`transition-colors ${theme === 'dark' ? 'hover:text-white' : 'hover:text-black'}`}>☺</button>
            </div>

            {/* Document metadata */}
            <div className={`mb-6 flex items-center gap-4 text-xs pb-4 border-b ${theme === 'dark' ? 'text-gray-500 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
              <span>3 sources</span>
              <span>•</span>
              <span>Last edited 2 hours ago</span>
            </div>

            {/* Editor Content - Custom styling for theme */}
            <div className={theme === 'dark' ? 'document-editor-dark' : 'document-editor-light'}>
              <style>{`
                /* DARK MODE STYLES */
                .document-editor-dark .bn-container {
                  background-color: #111827 !important;
                }
                .document-editor-dark .bn-editor {
                  background-color: #111827 !important;
                }
                .document-editor-dark [data-theming-css-variables-demo] {
                  background-color: #111827 !important;
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
                  background-color: #111827 !important;
                }
                .document-editor-dark [class*="bn-"] {
                  --bn-colors-editor-background: #111827 !important;
                }
                .document-editor-dark h1 {
                  font-size: 2em;
                  font-weight: 700;
                  color: #f9fafb !important;
                }
                .document-editor-dark h2 {
                  font-size: 1.5em;
                  font-weight: 600;
                  color: #f3f4f6 !important;
                }
                .document-editor-dark h3 {
                  font-size: 1.17em;
                  font-weight: 600;
                  color: #e5e7eb !important;
                }
                .document-editor-dark p {
                  color: #d1d5db !important;
                  line-height: 1.6;
                }
                .document-editor-dark .bn-side-menu {
                  color: #9ca3af;
                }
                .document-editor-dark .bn-drag-handle {
                  color: #6b7280;
                }
                /* Fix slash menu positioning */
                .document-editor-dark .bn-suggestion-menu {
                  position: fixed !important;
                  z-index: 9999 !important;
                }
                .document-editor-dark .bn-slash-menu {
                  position: fixed !important;
                  z-index: 9999 !important;
                }

                /* LIGHT MODE STYLES */
                .document-editor-light .bn-container {
                  background-color: transparent !important;
                }
                .document-editor-light .bn-block-content {
                  color: #374151 !important;
                }
                .document-editor-light [data-node-type="heading"] {
                  color: #111827 !important;
                  font-weight: 600;
                }
                .document-editor-light h1 {
                  font-size: 2em;
                  font-weight: 700;
                  color: #111827 !important;
                }
                .document-editor-light h2 {
                  font-size: 1.5em;
                  font-weight: 600;
                  color: #1f2937 !important;
                }
                .document-editor-light p {
                  color: #374151 !important;
                  line-height: 1.6;
                }
                /* Fix slash menu positioning */
                .document-editor-light .bn-suggestion-menu {
                  position: fixed !important;
                  z-index: 9999 !important;
                }
                .document-editor-light .bn-slash-menu {
                  position: fixed !important;
                  z-index: 9999 !important;
                }
              `}</style>
              <BlockNoteView 
                editor={editor} 
                theme={theme === 'dark' ? "dark" : "light"}
              />
            </div>

            {/* Save button floating at bottom */}
            {document && (
              <div className="fixed bottom-8 right-8">
                <button
                  onClick={saveDocument}
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors text-white"
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
                      Save Document
                    </>
                  )}
                </button>
                {lastSaved && !isSaving && (
                  <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`w-80 border-l overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-col">
            
            {/* AI STUDIO */}
            <div className={`border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => setAiStudioOpen(!aiStudioOpen)}
                className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  AI Studio
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${aiStudioOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {aiStudioOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {/* Audio Overview */}
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Audio Overview</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Generate summary</div>
                    </div>
                  </button>

                  {/* Video Overview */}
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Video Overview</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Create visualization</div>
                    </div>
                  </button>

                  {/* Mind Map */}
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mind Map</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Generate diagram</div>
                    </div>
                  </button>

                  {/* Flashcards */}
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Flashcards</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Study cards</div>
                    </div>
                  </button>

                  {/* Quiz */}
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quiz</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Test knowledge</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* BACKLINKS */}
            <div>
              <button
                onClick={() => setBacklinksOpen(!backlinksOpen)}
                className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Backlinks
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${backlinksOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {backlinksOpen && (
                <div className="px-4 pb-4">
                  <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No backlinks yet</p>
                </div>
              )}
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
