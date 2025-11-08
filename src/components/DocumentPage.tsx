import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <p className="text-gray-400 text-center">Main content area - Editor will go here</p>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-gray-800 overflow-y-auto bg-[#1a1a1a]">
          <div className="p-4">
            <p className="text-gray-400 text-sm">Right sidebar - Properties and tools will go here</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

