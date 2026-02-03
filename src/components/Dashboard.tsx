import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import RecentlyOpened from './RecentlyOpened';
import ProgressChart from './ProgressChart';
import { DailyTasks } from './DailyTasks';
import DocumentGrid from './DocumentGrid';
import { SearchCommandPalette } from './SearchCommandPalette';
import { Document, ProgressStats, Story } from '../types';
import { useStorage, useNotifications, useUser } from '../services';
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
  const userService = useUser();
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load documents and stories on mount
  useEffect(() => {
    loadDocuments();
    loadStories();
    
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

  const loadStories = async () => {
    try {
      const userStories = await userService.getStories();
      setStories(userStories);
    } catch (err) {
      console.error('Error loading stories:', err);
    }
  };

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
      <div className={`flex h-screen items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <SearchCommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Sidebar */}
      <Sidebar onNavigate={handleNavigation} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Interview Prep Banner */}
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Behavioral Interview Prep</h3>
                  <p className="text-blue-100">
                    Build your story library and ace your interviews
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stories Quick Access */}
          <div className={`mb-6 rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📚</div>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Your Stories
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stories.length} {stories.length === 1 ? 'story' : 'stories'} ready for interviews
                  </p>
                </div>
              </div>
              <Link
                to="/stories"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View All →
              </Link>
            </div>

            {stories.length === 0 ? (
              <div className={`text-center py-8 border-2 border-dashed rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-4xl mb-3">✍️</div>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  You haven't created any stories yet
                </p>
                <Link
                  to="/stories"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create Your First Story
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.slice(0, 6).map(story => (
                  <Link
                    key={story.id}
                    to="/stories"
                    className={`p-4 rounded-lg transition-all hover:shadow-md ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {story.title}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {story.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

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
