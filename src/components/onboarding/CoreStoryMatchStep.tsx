import { useState, useEffect } from 'react';
import { useUser, useNotifications } from '../../services';
import { CoreStoryMatch, Story, CoreStoryCategory } from '../../types';

interface Props {
    onComplete: () => void;
}

const CATEGORY_LABELS: Record<CoreStoryCategory, string> = {
    'conflict': 'The Conflict Story',
    'failure': 'The Failure Story',
    'leadership': 'The Leadership Story',
    'adaptability': 'The Adaptability Story',
    'tight-deadline': 'The Tight Deadline Story',
    'difficult-customer': 'The Difficult Customer Story',
    'data-driven-decision': 'Data-Driven Decision',
    'above-and-beyond': 'Above and Beyond',
    'persuasion': 'The Persuasion Story',
    'proudest-accomplishment': 'Proudest Accomplishment',
};

export default function CoreStoryMatchStep({ onComplete }: Props) {
    const userService = useUser();
    const notifications = useNotifications();
    const [matches, setMatches] = useState<CoreStoryMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Track which suggestions the user wants to add to their library
    const [selectedMatches, setSelectedMatches] = useState<Set<CoreStoryCategory>>(new Set());

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            const resume = await userService.getResume();
            if (resume?.coreStoryMatches && resume.coreStoryMatches.length > 0) {
                // Just take the top 3 as suggestions so we don't overwhelm the user
                const topMatches = resume.coreStoryMatches.slice(0, 3);
                setMatches(topMatches);
                // Pre-select them
                setSelectedMatches(new Set(topMatches.map(m => m.category)));
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
                    .filter(m => selectedMatches.has(m.category))
                    .map(m => ({
                        id: crypto.randomUUID(),
                        title: `[Draft] ${CATEGORY_LABELS[m.category]}: ${m.relatedExperienceId}`,
                        coreCategory: m.category,
                        situation: `(Imported suggestion based on: ${m.relatedExperienceId})\n\nAI Notes: ${m.reasoning}`,
                        task: '',
                        action: '',
                        result: '',
                        tags: [],
                    } as Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>));

                // Create the stories
                for (const story of storiesToCreate) {
                    await userService.createStory(story);
                }

                await notifications.showSuccess(`Added ${storiesToCreate.length} story drafts to your library!`);
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If AI didn't return any matches, we can just auto-skip this step
    if (matches.length === 0) {
        return (
            <div className="text-center p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">No AI Story Matches Found</h2>
                <p className="text-gray-600 mb-6">We couldn't generate story matches based on the parsed data. Let's finish up!</p>
                <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">✨</div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900">AI Story Matches</h1>
                <p className="text-lg text-gray-600">
                    We found some great experiences in your resume that map perfectly to the Behavioral Core Stories. Let's start building your library!
                </p>
            </div>

            <div className="space-y-4 mb-8">
                {matches.map((match) => {
                    const isSelected = selectedMatches.has(match.category);
                    return (
                        <div
                            key={match.category}
                            onClick={() => toggleSelection(match.category)}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                ? 'border-blue-600 bg-blue-50/30 shadow-md'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`shrink-0 w-6 h-6 rounded border flex justify-center items-center mt-1 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                    {isSelected && <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{CATEGORY_LABELS[match.category]}</h3>
                                    <div className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded mb-3">
                                        Based on: {match.relatedExperienceId}
                                    </div>
                                    <p className="text-sm text-gray-700 bg-white border rounded p-3">
                                        <strong>AI Notes: </strong>
                                        {match.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg disabled:opacity-50"
                >
                    {saving ? 'Saving...' : selectedMatches.size > 0 ? `Add ${selectedMatches.size} Stories & Continue` : 'Skip for now'}
                </button>
            </div>
        </div>
    );
}
