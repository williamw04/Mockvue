import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import RecentlyOpened from './RecentlyOpened';
import ProgressChart from './ProgressChart';
import CalendarWidget from './CalendarWidget';
import DocumentGrid from './DocumentGrid';
import { Document, CalendarEvent, ProgressStats } from '../types';
import { useStorage, useNotifications } from '../services';
import { getPlatformInfo } from '../utils/platform';

// Mock data for widgets (can be made dynamic later)
const progressStats: ProgressStats = {
  completed: 24,
  inProgress: 8,
  scheduled: 12,
  pending: 6,
};

const calendarEvents: CalendarEvent[] = [
  { id: '1', time: '9:00 AM', title: 'User interview with Sarah M.', type: 'error' },
  { id: '2', time: '11:00 AM', title: 'Review interview transcripts', type: 'info' },
  { id: '3', time: '2:00 PM', title: 'Update research findings', type: 'warning' },
  { id: '4', time: '3:30 PM', title: "Schedule next week's interviews", type: 'warning' },
  { id: '5', time: '4:30 PM', title: 'Prepare PM interview questions', type: 'success' },
];

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
  const navigate = useNavigate();
  const storage = useStorage();
  const notifications = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
    
    // Log platform info
    const platformInfo = getPlatformInfo();
    console.log('Running on:', platformInfo.platform, '|', platformInfo.os);
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
    console.log('Navigating to:', section);
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
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={handleNavigation} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* AI Feature Banner */}
          <div className="mb-6 bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🤖</span>
                  <h3 className="text-2xl font-bold">AI-Powered Documents</h3>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                    NEW DEMO
                  </span>
                </div>
                <p className="text-purple-100 mb-4 max-w-2xl">
                  Experience the future of document editing with integrated AI features: Brainstorm ideas, get feedback on responses, and generate structured drafts using custom question blocks.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-purple-100">
                  <div className="flex items-center gap-2">
                    <span>💡</span>
                    <span>Brainstorm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📝</span>
                    <span>Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✍️</span>
                    <span>Draft Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>❓</span>
                    <span>Question Blocks</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/ai-document')}
                className="ml-4 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Try AI Demo</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recently Opened */}
          <RecentlyOpened documents={formattedRecentDocuments} />

          {/* Progress and Calendar Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProgressChart stats={progressStats} title="Interview Progress" />
            <CalendarWidget events={calendarEvents} date="1/5" />
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