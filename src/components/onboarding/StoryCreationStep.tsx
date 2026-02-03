import { useState, useEffect } from 'react';
import { useTheme } from '../../services/ThemeContext';
import { useUser, useNotifications } from '../../services';
import { Story } from '../../types';

interface StoryCreationStepProps {
  onComplete: () => void;
}

interface StoryForm {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
}

const commonTags = [
  'Leadership',
  'Problem-Solving',
  'Teamwork',
  'Communication',
  'Conflict Resolution',
  'Innovation',
  'Time Management',
  'Adaptability',
  'Customer Focus',
  'Technical Skills',
];

const storyPrompts = [
  'Tell me about a time you faced a significant challenge at work',
  'Describe a situation where you had to work with a difficult team member',
  'Share an example of when you had to meet a tight deadline',
  'Tell me about a time you improved a process or system',
  'Describe a situation where you demonstrated leadership',
];

export default function StoryCreationStep({ onComplete }: StoryCreationStepProps) {
  const { theme } = useTheme();
  const userService = useUser();
  const notifications = useNotifications();
  
  const [stories, setStories] = useState<StoryForm[]>([
    { title: '', situation: '', task: '', action: '', result: '', tags: [] }
  ]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStories, setSavedStories] = useState<Story[]>([]);

  useEffect(() => {
    loadExistingStories();
  }, []);

  const loadExistingStories = async () => {
    try {
      const existingStories = await userService.getStories();
      setSavedStories(existingStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const currentStory = stories[currentStoryIndex];

  const updateStory = (field: keyof StoryForm, value: string | string[]) => {
    const updated = [...stories];
    updated[currentStoryIndex] = { ...updated[currentStoryIndex], [field]: value };
    setStories(updated);
  };

  const toggleTag = (tag: string) => {
    const currentTags = currentStory.tags || [];
    const updated = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateStory('tags', updated);
  };

  const addNewStory = () => {
    setStories([...stories, { title: '', situation: '', task: '', action: '', result: '', tags: [] }]);
    setCurrentStoryIndex(stories.length);
  };

  const saveCurrentStory = async () => {
    if (!isStoryComplete(currentStory)) {
      await notifications.showError('Please fill in all STAR fields');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await userService.createStory({
        title: currentStory.title,
        situation: currentStory.situation,
        task: currentStory.task,
        action: currentStory.action,
        result: currentStory.result,
        tags: currentStory.tags,
      });
      
      setSavedStories([...savedStories, saved]);
      await notifications.showSuccess('Story saved! ✓');
      
      // Clear current story
      const updated = [...stories];
      updated[currentStoryIndex] = { title: '', situation: '', task: '', action: '', result: '', tags: [] };
      setStories(updated);
    } catch (error) {
      console.error('Error saving story:', error);
      await notifications.showError('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };

  const isStoryComplete = (story: StoryForm) => {
    return story.title.trim() && story.situation.trim() && story.task.trim() && 
           story.action.trim() && story.result.trim();
  };

  const canProceed = savedStories.length >= 3;

  const handleComplete = () => {
    if (canProceed) {
      onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📚</div>
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Create Your Stories
        </h1>
        <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Build a library of experiences using the STAR method
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          canProceed
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          <span className="font-semibold">{savedStories.length} / 3</span>
          <span className="text-sm">stories completed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Story Editor */}
        <div className="lg:col-span-2">
          <div className={`rounded-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Story Title *
              </label>
              <input
                type="text"
                value={currentStory.title}
                onChange={(e) => updateStory('title', e.target.value)}
                placeholder="Give your story a memorable title"
                className={`w-full px-4 py-3 rounded-lg border text-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* STAR Method Fields */}
            <div className="space-y-6">
              {/* Situation */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    S
                  </div>
                  <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Situation - Set the context *
                  </label>
                </div>
                <textarea
                  value={currentStory.situation}
                  onChange={(e) => updateStory('situation', e.target.value)}
                  placeholder="Describe the situation or challenge you faced. Where were you? What was happening?"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Task */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    T
                  </div>
                  <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Task - What was your responsibility? *
                  </label>
                </div>
                <textarea
                  value={currentStory.task}
                  onChange={(e) => updateStory('task', e.target.value)}
                  placeholder="What was your specific role or responsibility in this situation?"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Action */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Action - What did you do? *
                  </label>
                </div>
                <textarea
                  value={currentStory.action}
                  onChange={(e) => updateStory('action', e.target.value)}
                  placeholder="Describe the specific actions you took. Focus on YOUR contributions."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Result */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    R
                  </div>
                  <label className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Result - What was the outcome? *
                  </label>
                </div>
                <textarea
                  value={currentStory.result}
                  onChange={(e) => updateStory('result', e.target.value)}
                  placeholder="What happened as a result? Include metrics and quantifiable impact if possible."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        currentStory.tags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={saveCurrentStory}
                disabled={isSaving || !isStoryComplete(currentStory)}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Story'}
              </button>
              {savedStories.length > 0 && (
                <button
                  onClick={addNewStory}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  + New Story
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              💡 Tips
            </h3>
            <ul className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Be specific and use numbers when possible</li>
              <li>• Focus on YOUR actions, not the team's</li>
              <li>• Include the impact of your work</li>
              <li>• Keep each story 1-2 minutes when spoken</li>
            </ul>
          </div>

          {/* Saved Stories */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ✓ Saved Stories ({savedStories.length})
            </h3>
            {savedStories.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No stories saved yet
              </p>
            ) : (
              <div className="space-y-2">
                {savedStories.map((story) => (
                  <div
                    key={story.id}
                    className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {story.title}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Common Questions */}
          <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🎯 Story Ideas
            </h3>
            <ul className={`space-y-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {storyPrompts.map((prompt, i) => (
                <li key={i}>• {prompt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {canProceed && (
        <div className="mt-8 text-center">
          <button
            onClick={handleComplete}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-colors shadow-lg"
          >
            Continue to Next Step →
          </button>
        </div>
      )}
    </div>
  );
}
