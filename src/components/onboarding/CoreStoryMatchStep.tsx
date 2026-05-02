/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useUser, useNotifications } from '../../services';
import { CoreStoryMatch, Story, CoreStoryCategory } from '../../types';

interface Props {
  onComplete: () => void;
}

const CATEGORY_LABELS: Record<CoreStoryCategory, string> = {
  conflict: 'The Conflict Story',
  failure: 'The Failure Story',
  leadership: 'The Leadership Story',
  adaptability: 'The Adaptability Story',
  'tight-deadline': 'The Tight Deadline Story',
  'difficult-customer': 'The Difficult Customer Story',
  'data-driven-decision': 'Data-Driven Decision',
  'above-and-beyond': 'Above and Beyond',
  persuasion: 'The Persuasion Story',
  'proudest-accomplishment': 'Proudest Accomplishment',
};

export default function CoreStoryMatchStep({ onComplete }: Props) {
  const userService = useUser();
  const notifications = useNotifications();
  const [matches, setMatches] = useState<CoreStoryMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedMatches, setSelectedMatches] = useState<Set<CoreStoryCategory>>(new Set());

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const resume = await userService.getResume();
      if (resume?.coreStoryMatches && resume.coreStoryMatches.length > 0) {
        const topMatches = resume.coreStoryMatches.slice(0, 3);
        setMatches(topMatches);
        setSelectedMatches(new Set(topMatches.map((m) => m.category)));
      }
    } catch (error) {
      console.error('Failed to load resume matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (category: CoreStoryCategory) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedMatches(newSelected);
  };

  const handleContinue = async () => {
    if (selectedMatches.size > 0) {
      setSaving(true);
      try {
        const storiesToCreate = matches
          .filter((m) => selectedMatches.has(m.category))
          .map(
            (m) =>
              ({
                id: crypto.randomUUID(),
                title: `[Draft] ${CATEGORY_LABELS[m.category]}: ${m.relatedExperienceId}`,
                coreCategory: m.category,
                situation: `(Imported suggestion based on: ${m.relatedExperienceId})\n\nAI Notes: ${m.reasoning}`,
                task: '',
                action: '',
                result: '',
                tags: [],
              }) as Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
          );

        for (const story of storiesToCreate) {
          await userService.createStory(story);
        }

        await notifications.showSuccess(
          `Added ${storiesToCreate.length} story drafts to your library!`
        );
      } catch (error) {
        console.error('Error saving stories:', error);
        await notifications.showError('Failed to add some stories.');
      } finally {
        setSaving(false);
      }
    }
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-hi"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-rule p-10">
          <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
            No Matches Found
          </div>
          <h2 className="font-serif text-2xl mb-4">AI Story Matches</h2>
          <p className="text-ink-2 text-sm mb-6">
            We couldn't generate story matches based on the parsed data. Let's finish up!
          </p>
          <button
            onClick={onComplete}
            className="bg-accent-hi text-white border-none px-6 py-3 text-[13px] font-semibold cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-5xl tracking-tight mb-4">AI Story Matches</h1>
        <p className="text-ink-2 text-base">
          We found some great experiences in your resume that map perfectly to the Behavioral Core
          Stories. Let's start building your library!
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {matches.map((match) => {
          const isSelected = selectedMatches.has(match.category);
          return (
            <div
              key={match.category}
              onClick={() => toggleSelection(match.category)}
              className={`bg-card border cursor-pointer transition-all ${
                isSelected ? 'border-accent-hi bg-accent-lo' : 'border-rule hover:border-accent-hi'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div
                    className={`shrink-0 w-6 h-6 rounded-sm border flex justify-center items-center mt-0.5 transition-colors ${
                      isSelected ? 'bg-accent-hi border-accent-hi text-white' : 'border-rule bg-bg'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg mb-2">{CATEGORY_LABELS[match.category]}</h3>
                    <div className="inline-block px-2 py-1 bg-accent-lo text-accent-hi text-xs font-mono tracking-wide mb-3">
                      Based on: {match.relatedExperienceId}
                    </div>
                    <div className="bg-bg border border-rule p-4">
                      <p className="text-sm text-ink-2 leading-relaxed">
                        <span className="font-medium text-ink">AI Notes: </span>
                        {match.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={saving}
        className="w-full bg-accent-hi text-white border-none px-6 py-3 text-[13px] font-semibold cursor-pointer disabled:bg-ink-3 disabled:cursor-not-allowed"
      >
        {saving
          ? 'Saving...'
          : selectedMatches.size > 0
            ? `Add ${selectedMatches.size} Stories & Continue`
            : 'Skip for now'}
      </button>
    </div>
  );
}
