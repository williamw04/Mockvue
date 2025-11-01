import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
// Default styles for the mantine editor
import "@blocknote/mantine/style.css";
// Include the included Inter font
import "@blocknote/core/fonts/inter.css";

export default function MyEditor() {
  const navigate = useNavigate();
  const editor = useCreateBlockNote();

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
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
            <span className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </span>
            <span className="text-sm">Save Document</span>
          </button>
        </div>
      </aside>

      {/* Editor Content */}
      <main className="flex-1 overflow-hidden">
        <BlockNoteView editor={editor} />
      </main>
    </div>
  );
}