import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import RecentlyOpened from './RecentlyOpened';
import ProgressChart from './ProgressChart';
import { DailyTasks } from './DailyTasks';
import DocumentGrid from './DocumentGrid';
import { SearchCommandPalette } from './SearchCommandPalette';
import { Document, ProgressStats } from '../types';
import { useStorage, useNotifications } from '../services';
import { getPlatformInfo } from '../utils/platform';
import { useTheme } from '../services/ThemeContext';

// Mock data for widgets (can be made dynamic later)
const progressStats: ProgressStats = {
  completed: 24,
  inProgress: 8,
  scheduled: 12,
  pending: 6,
};

// Helper function to format relative time
const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);

  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  return date.toLocaleDateString();
};

export function Dashboard() {
  const storage = useStorage();
  const notifications = useNotifications();
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
    
    // Log platform info
    const platformInfo = getPlatformInfo();
    console.log('Running on:', platformInfo.platform, '|', platformInfo.os);

    // Keyboard shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await storage.getDocuments();
      
      // Sort by last modified (most recent first)
      const sortedDocs = [...docs].sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      
      setDocuments(sortedDocs);
      setRecentDocuments(sortedDocs.slice(0, 6)); // Get 6 most recent
      
      // If no documents exist, create some sample documents
      if (docs.length === 0) {
        await createSampleDocuments();
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
      await notifications.showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const createSampleDocuments = async () => {
    const sampleDocs = [
      {
        title: 'Welcome to Mockvue',
        description: 'Get started with your first document. This app works both as a desktop app and in your browser!',
        content: 'Welcome to Mockvue! This is a powerful document editor that works seamlessly across platforms.',
        tags: ['welcome', 'getting-started'],
      },
      {
        title: 'Project Planning',
        description: 'Ideas and notes for the upcoming project launch.',
        content: 'Project timeline and key milestones...',
        tags: ['work', 'planning'],
      },
    ];

    try {
      for (const doc of sampleDocs) {
        await storage.createDocument(doc);
      }
      await loadDocuments(); // Reload to show new documents
      await notifications.showSuccess('Sample documents created!');
    } catch (err) {
      console.error('Error creating sample documents:', err);
    }
  };

  const handleNavigation = (section: string) => {
    if (section === 'search') {
      setIsSearchOpen(true);
    } else {
      console.log('Navigating to:', section);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await storage.deleteDocument(id);
      await notifications.showSuccess('Document deleted');
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      await notifications.showError('Failed to delete document');
    }
  };

  // Format documents with relative time
  const formattedDocuments = documents.map(doc => ({
    ...doc,
    lastModified: formatRelativeTime(doc.lastModified),
  }));

  const formattedRecentDocuments = recentDocuments.map(doc => ({
    ...doc,
    lastModified: formatRelativeTime(doc.lastModified),
  }));

  const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0);

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDocuments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
      <SearchCommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Sidebar */}
      <Sidebar onNavigate={handleNavigation} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* AI Assistant Demo Banner */}
          <Link to="/ai-assistant">
            <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🤖</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">AI Assistant Demo</h3>
                    <p className="text-blue-100">
                      Try the new LangGraph-powered agentic system integration
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold">
                  Try Now →
                </div>
              </div>
            </div>
          </Link>

          {/* Recently Opened */}
          <RecentlyOpened documents={formattedRecentDocuments} />

          {/* Progress and Calendar Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProgressChart stats={progressStats} title="Interview Progress" />
            <DailyTasks />
          </div>

          {/* Documents Grid */}
          <DocumentGrid 
            documents={formattedDocuments} 
            totalWords={totalWords}
            onDelete={handleDeleteDocument}
            onRefresh={loadDocuments}
          />
        </div>
      </main>
    </div>
  );
};
