import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useNotifications } from '../services';
import { useTheme } from '../services/ThemeContext';
import { Story } from '../types';

export default function StoriesPage() {
  const navigate = useNavigate();
  const userService = useUser();
  const notifications = useNotifications();
  const { theme } = useTheme();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Story>>({});

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const allStories = await userService.getStories();
      setStories(allStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      await notifications.showError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (selectedStory) {
      setEditForm(selectedStory);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedStory || !editForm) return;
    
    try {
      const updated = await userService.updateStory(selectedStory.id, editForm);
      setStories(stories.map(s => s.id === updated.id ? updated : s));
      setSelectedStory(updated);
      setIsEditing(false);
      await notifications.showSuccess('Story updated!');
    } catch (error) {
      console.error('Error updating story:', error);
      await notifications.showError('Failed to update story');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    try {
      await userService.deleteStory(id);
      setStories(stories.filter(s => s.id !== id));
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
      await notifications.showSuccess('Story deleted');
    } catch (error) {
      console.error('Error deleting story:', error);
      await notifications.showError('Failed to delete story');
    }
  };

  const handleCreateNew = () => {
    navigate('/onboarding?step=stories');
  };

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">My Stories</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {stories.length} stories
            </span>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Story
          </button>
        </div>
      </div>

      {/* Stories List */}
      <aside className={`w-80 border-r pt-20 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4 space-y-2">
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No stories yet
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Create your first story
              </button>
            </div>
          ) : (
            stories.map(story => (
              <button
                key={story.id}
                onClick={() => handleStoryClick(story)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  selectedStory?.id === story.id
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold mb-2">{story.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {story.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedStory?.id === story.id
                          ? 'bg-white/20 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Story Detail */}
      <main className="flex-1 overflow-y-auto pt-20">
        {selectedStory ? (
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className={`rounded-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    selectedStory.title
                  )}
                </h2>
                {!isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedStory.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Situation */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Situation
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm.situation || ''}
                      onChange={(e) => setEditForm({ ...editForm, situation: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed ml-10`}>
                      {selectedStory.situation}
                    </p>
                  )}
                </div>

                {/* Task */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      T
                    </div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Task
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm.task || ''}
                      onChange={(e) => setEditForm({ ...editForm, task: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed ml-10`}>
                      {selectedStory.task}
                    </p>
                  )}
                </div>

                {/* Action */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                      A
                    </div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Action
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm.action || ''}
                      onChange={(e) => setEditForm({ ...editForm, action: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed ml-10`}>
                      {selectedStory.action}
                    </p>
                  )}
                </div>

                {/* Result */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      R
                    </div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Result
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm.result || ''}
                      onChange={(e) => setEditForm({ ...editForm, result: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  ) : (
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed ml-10`}>
                      {selectedStory.result}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 ml-10">
                    {selectedStory.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          theme === 'dark'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📖</div>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a story to view details
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
