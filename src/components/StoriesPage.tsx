import { useState, useEffect, useMemo } from 'react';
// use-navigate removed
import { useUser, useNotifications } from '../services';
import { Story, Resume, CoreStoryCategory, CoreStoryMatch } from '../types';
import { TopNavBar } from './TopNavBar';

// The 10 Core Story categories with metadata
const CORE_STORIES: { category: CoreStoryCategory; title: string; icon: string; description: string }[] = [
  { category: 'conflict', title: 'The Conflict Story', icon: '🤝', description: 'Describe a time you disagreed with a peer or supervisor and resolved it.' },
  { category: 'failure', title: 'The Failure Story', icon: '📉', description: 'Share a genuine mistake and what you learned from it.' },
  { category: 'leadership', title: 'The Leadership Story', icon: '👑', description: 'A time you took the lead to mobilize others, formal title or not.' },
  { category: 'adaptability', title: 'The Adaptability Story', icon: '🌪️', description: 'A time priorities shifted rapidly and you had to adapt.' },
  { category: 'tight-deadline', title: 'The Tight Deadline Story', icon: '⏱️', description: 'A time you were overwhelmed and had to prioritize.' },
  { category: 'difficult-customer', title: 'The Difficult Customer Story', icon: '😠', description: 'A time you handled a difficult stakeholder or customer.' },
  { category: 'data-driven-decision', title: 'Data-Driven Decision', icon: '📊', description: 'A time you made a choice with incomplete or complex data.' },
  { category: 'above-and-beyond', title: 'Above and Beyond', icon: '🚀', description: 'A time you exceeded expectations intrinsically.' },
  { category: 'persuasion', title: 'The Persuasion Story', icon: '🗣️', description: 'A time you used logic or rapport to convince a skeptic.' },
  { category: 'proudest-accomplishment', title: 'Proudest Accomplishment', icon: '🏆', description: 'Your "Hero Story" highlighting your best work.' },
];

export default function StoriesPage() {
  const userService = useUser();
  const notifications = useNotifications();

  const [stories, setStories] = useState<Story[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  // Detail view state
  const [selectedCategory, setSelectedCategory] = useState<CoreStoryCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Story>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allStories, userResume] = await Promise.all([
        userService.getStories(),
        userService.getResume(),
      ]);
      setStories(allStories);
      setResume(userResume);
    } catch (error) {
      console.error('Error loading data:', error);
      await notifications.showError('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  // Helper to find an existing story for a category
  const getStoryForCategory = (category: CoreStoryCategory) => {
    return stories.find(s => s.coreCategory === category) || null;
  };

  // Helper to find an AI match for a category
  const getAiMatchForCategory = (category: CoreStoryCategory): CoreStoryMatch | null => {
    if (!resume?.coreStoryMatches) return null;
    return resume.coreStoryMatches.find(m => m.category === category) || null;
  };

  const handleCategoryClick = (category: CoreStoryCategory) => {
    setSelectedCategory(category);
    setIsEditing(false);
  };

  const handleEdit = (category: CoreStoryCategory) => {
    const existingStory = getStoryForCategory(category);
    const meta = CORE_STORIES.find(c => c.category === category)!;

    if (existingStory) {
      setEditForm(existingStory);
    } else {
      // Initialize new story form
      setEditForm({
        id: crypto.randomUUID(),
        title: meta.title,
        coreCategory: category,
        situation: '',
        task: '',
        action: '',
        result: '',
        tags: [],
      });
    }
    setSelectedCategory(category);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedCategory || !editForm.title) return;

    try {
      const isNew = !stories.find(s => s.id === editForm.id);

      let savedStory: Story;
      if (isNew) {
        savedStory = await userService.createStory(editForm as Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
        setStories([...stories, savedStory]);
      } else {
        savedStory = await userService.updateStory(editForm.id!, editForm);
        setStories(stories.map(s => s.id === savedStory.id ? savedStory : s));
      }

      setIsEditing(false);
      await notifications.showSuccess('Story saved!');
    } catch (error) {
      console.error('Error saving story:', error);
      await notifications.showError('Failed to save story');
    }
  };

  const selectedMeta = useMemo(() =>
    CORE_STORIES.find(c => c.category === selectedCategory),
    [selectedCategory]);

  const existingSelectedStory = selectedCategory ? getStoryForCategory(selectedCategory) : null;
  const aiMatch = selectedCategory ? getAiMatchForCategory(selectedCategory) : null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      <TopNavBar />

      {/* Main Content Area */}
      <div className="flex-1 pt-20 px-8 pb-12 overflow-y-auto w-full md:w-1/2">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Behavioral Core Stories</h1>
            <p className="text-lg text-gray-600 mt-2">
              Master these 10 versatile themes to cover 90% of behavioral interview questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORE_STORIES.map(meta => {
              const story = getStoryForCategory(meta.category);
              const match = getAiMatchForCategory(meta.category);
              const isSelected = selectedCategory === meta.category;

              return (
                <div
                  key={meta.category}
                  onClick={() => handleCategoryClick(meta.category)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                    : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-blue-200'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{meta.icon}</span>
                      <h3 className="font-semibold text-gray-900">{meta.title}</h3>
                    </div>
                    {story ? (
                      <span className="shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                    ) : match ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold tracking-wider uppercase">AI Suggestion</span>
                    ) : (
                      <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">!</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Panel for Details / Editing */}
      <div className="w-full md:w-1/2 border-l border-gray-200 bg-white pt-20 h-screen overflow-y-auto shadow-2xl z-10 hidden md:block">
        {!selectedCategory ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4 text-gray-300">📖</div>
            <h2 className="text-xl font-semibold text-gray-700">Select a Core Story</h2>
            <p className="text-gray-500 mt-2 max-w-sm">Choose a category from the matrix to view suggestions and draft your STAR response.</p>
          </div>
        ) : (
          <div className="p-8 pb-32">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{selectedMeta?.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeta?.title}</h2>
                <p className="text-gray-500">{selectedMeta?.description}</p>
              </div>
            </div>

            {/* AI Suggestion Box */}
            {!isEditing && aiMatch && !existingSelectedStory && (
              <div className="mb-8 p-5 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-5 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                    <span className="text-lg">✨</span>
                    <span>AI Recommended Match</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{aiMatch.relatedExperienceId}</h4>
                  <p className="text-gray-600 text-sm">{aiMatch.reasoning}</p>

                  <button
                    onClick={() => handleEdit(selectedCategory)}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Draft this Story
                  </button>
                </div>
              </div>
            )}

            {/* Read / Edit View */}
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Story Title</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. Launched v2.0 API Migration"
                  />
                </div>

                {/* S.T.A.R. fields */}
                {Object.entries({
                  situation: { label: 'Situation', color: 'blue', desc: 'What was the background? What challenge existed?' },
                  task: { label: 'Task', color: 'purple', desc: 'What was your specific responsibility?' },
                  action: { label: 'Action', color: 'green', desc: 'What steps did you take? Be specific.' },
                  result: { label: 'Result', color: 'orange', desc: 'What was the impact? Quantify if possible.' }
                }).map(([key, meta]) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full bg-${meta.color}-600 flex items-center justify-center text-white font-bold text-xs`}>
                        {meta.label[0]}
                      </div>
                      <label className="text-sm font-semibold text-gray-800">{meta.label}</label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{meta.desc}</p>
                    <textarea
                      value={(editForm as any)[key] || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      rows={key === 'action' ? 4 : 3}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-${meta.color}-500 focus:border-transparent outline-none text-sm`}
                      placeholder={`Draft your ${meta.label.toLowerCase()}...`}
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Save Story
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-2.5 rounded-lg font-semibold transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : existingSelectedStory ? (
              <div className="space-y-8 relative">
                <button
                  onClick={() => handleEdit(selectedCategory)}
                  className="absolute top-0 right-0 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 pr-16">{existingSelectedStory.title}</h3>
                </div>

                {Object.entries({
                  situation: { label: 'Situation', color: 'blue' },
                  task: { label: 'Task', color: 'purple' },
                  action: { label: 'Action', color: 'green' },
                  result: { label: 'Result', color: 'orange' }
                }).map(([key, meta]) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full bg-${meta.color}-600 flex items-center justify-center text-white font-bold text-xs`}>
                        {meta.label[0]}
                      </div>
                      <h4 className="text-base font-semibold text-gray-800">{meta.label}</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm ml-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {(existingSelectedStory as any)[key] || <span className="text-gray-400 italic">No content written yet.</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't drafted a story for this core competency yet.</p>
                <button
                  onClick={() => handleEdit(selectedCategory)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Draft Story Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile-only Panel View (simplistic for current Electron use, but good for responsiveness) */}
      <div className={`md:hidden fixed inset-0 z-40 bg-white pt-20 transition-transform ${selectedCategory ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedCategory && (
          <div className="p-6 overflow-y-auto h-full pb-32">
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-6 text-blue-600 font-medium"
            >
              ← Back to Matrix
            </button>
            {/* Same content essentially goes here, but for brevity we rely on desktop view primarily in Electron */}
            <div className="text-center p-8 text-gray-500">
              Mobile view placeholder: Resize window wider to view the editor side-panel.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
