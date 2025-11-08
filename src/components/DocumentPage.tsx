import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useStorage, useNotifications } from "../services";
import { Document } from "../types";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export default function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const storage = useStorage();
  const notifications = useNotifications();
  
  // Document state
  const [document, setDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Sidebar section collapse states
  const [tocOpen, setTocOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
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
          {/* Duplicate */}
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Menu */}
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-700 mx-2"></div>

          {/* Comments tab */}
          <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments
          </button>

          {/* Updates tab */}
          <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updates
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
            
            {/* Document Icon - with subtle animation */}
            <div className="mb-6 flex items-center justify-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <span className="text-4xl">🧠</span>
              </div>
            </div>

            {/* Document Title - with subtle animation */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '100ms'}}>
              <h1 className="text-4xl font-bold text-gray-300 mb-4 text-center hover:text-white transition-colors duration-300">
                The Science and Strategies of Success
              </h1>
            </div>

            {/* Editor Toolbar - Custom styling to match dark theme */}
            <div className="mb-2 flex items-center gap-4 text-sm text-gray-400">
              <button className="hover:text-white transition-colors flex items-center gap-1">
                <span className="font-medium">T</span>
              </button>
              <button className="hover:text-white transition-colors">
                <span className="font-bold">H</span>
              </button>
              <div className="h-4 w-px bg-gray-700"></div>
              <button className="hover:text-white transition-colors">≡</button>
              <button className="hover:text-white transition-colors">☰</button>
              <div className="h-4 w-px bg-gray-700"></div>
              <button className="hover:text-white transition-colors">&lt;/&gt;</button>
              <button className="hover:text-white transition-colors">99</button>
              <div className="h-4 w-px bg-gray-700"></div>
              <button className="hover:text-white transition-colors">📎</button>
              <button className="hover:text-white transition-colors">🔗</button>
              <button className="hover:text-white transition-colors">☺</button>
            </div>

            {/* Document metadata */}
            <div className="mb-6 flex items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-800">
              <span>3 sources</span>
              <span>•</span>
              <span>Last edited 2 hours ago</span>
            </div>

            {/* Editor Content - Custom styling for dark theme */}
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

            {/* Save button floating at bottom */}
            {document && (
              <div className="fixed bottom-8 right-8">
                <button
                  onClick={saveDocument}
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
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
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-gray-800 overflow-y-auto bg-[#1a1a1a]">
          <div className="flex flex-col">
            
            {/* TABLE OF CONTENTS */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Table of Contents
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {tocOpen && (
                <div className="px-4 pb-4 space-y-1">
                  <a href="#overview" className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                    — Overview
                  </a>
                  <a href="#key-concepts" className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                    — Key Concepts
                  </a>
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
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                      In Progress
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm text-gray-400 flex-shrink-0">Tags</span>
                    <div className="ml-auto flex flex-wrap gap-1.5 justify-end">
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">
                        Psychology
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                        Research
                      </span>
                    </div>
                  </div>

                  {/* Created */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">Created</span>
                    <span className="ml-auto text-sm text-gray-300">Nov 6, 2025</span>
                  </div>

                  {/* Sources */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm text-gray-400">Sources</span>
                    <span className="ml-auto text-sm text-gray-300">3</span>
                  </div>

                  {/* Shared with */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm text-gray-400">Shared with</span>
                    <div className="ml-auto flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-[#1a1a1a]"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-[#1a1a1a]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI STUDIO */}
            <div className="border-b border-gray-800">
              <button
                onClick={() => setAiStudioOpen(!aiStudioOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  AI Studio
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
                <div className="px-4 pb-4 space-y-2">
                  {/* Audio Overview */}
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">Audio Overview</div>
                      <div className="text-xs text-gray-400">Generate summary</div>
                    </div>
                  </button>

                  {/* Video Overview */}
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">Video Overview</div>
                      <div className="text-xs text-gray-400">Create visualization</div>
                    </div>
                  </button>

                  {/* Mind Map */}
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">Mind Map</div>
                      <div className="text-xs text-gray-400">Generate diagram</div>
                    </div>
                  </button>

                  {/* Flashcards */}
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">Flashcards</div>
                      <div className="text-xs text-gray-400">Study cards</div>
                    </div>
                  </button>

                  {/* Quiz */}
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">Quiz</div>
                      <div className="text-xs text-gray-400">Test knowledge</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* BACKLINKS */}
            <div>
              <button
                onClick={() => setBacklinksOpen(!backlinksOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Backlinks
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${backlinksOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {backlinksOpen && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-500 italic">No backlinks yet</p>
                </div>
              )}
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}

