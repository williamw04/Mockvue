import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProgressChart from './ProgressChart';
import { DailyTasks } from './DailyTasks';
import { DocumentGrid } from './documents/DocumentGrid';
import { ProgressStats, Story, Document } from '../types';
import { useUser, useDocuments, useNotifications } from '../services';
import { getPlatformInfo } from '../utils/platform';

// Mock data for widgets (can be made dynamic later)
const progressStats: ProgressStats = {
  completed: 24,
  inProgress: 8,
  scheduled: 12,
  pending: 6,
};


export function Dashboard() {
  const userService = useUser();
  const documentService = useDocuments();
  const notifications = useNotifications();
  const [stories, setStories] = useState<Story[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stories and documents on mount
  useEffect(() => {
    loadData();

    // Log platform info
    const platformInfo = getPlatformInfo();
    console.log('Running on:', platformInfo.platform, '|', platformInfo.os);
  }, []);

  const loadData = async () => {
    try {
      const [userStories, userDocuments] = await Promise.all([
        userService.getStories(),
        documentService.getDocuments(),
      ]);
      setStories(userStories);
      setDocuments(userDocuments);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      await notifications.showSuccess('Document deleted');
      // Reload documents
      const userDocuments = await documentService.getDocuments();
      setDocuments(userDocuments);
    } catch (err) {
      console.error('Error deleting document:', err);
      await notifications.showError('Failed to delete document');
    }
  };

  const handleNavigation = (section: string) => {
    console.log('Navigating to:', section);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
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
          <div className="mb-6 rounded-2xl p-6 bg-surface shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📚</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Stories
                  </h2>
                  <p className="text-sm text-gray-600">
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
              <div className="text-center py-8 border-2 border-dashed rounded-lg border-gray-200">
                <div className="text-4xl mb-3">✍️</div>
                <p className="text-sm mb-4 text-gray-600">
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
                    className="p-4 rounded-lg transition-all hover:shadow-md bg-gray-50 hover:bg-gray-100"
                  >
                    <h3 className="font-semibold mb-2 text-gray-900">
                      {story.title}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {story.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
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

          {/* Progress and Calendar Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProgressChart stats={progressStats} title="Interview Progress" />
            <DailyTasks />
          </div>

          {/* Documents Grid */}
          <DocumentGrid
            documents={documents}
            onDelete={handleDeleteDocument}
          />
        </div>
      </main>
    </div>
  );
}
