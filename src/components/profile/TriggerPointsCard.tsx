import type { TriggerPoint, TriggerPointComfort, Story } from '../../types';
import { Target, MessageCircle, AlertCircle, Link2 } from 'lucide-react';

interface TriggerPointsCardProps {
    triggerPoints: TriggerPoint[];
    stories: Story[];
    onUpdateComfort: (id: string, comfort: TriggerPointComfort, linkedStoryId?: string) => void;
}

const comfortOptions: { value: TriggerPointComfort; label: string; icon: React.ReactNode; color: string }[] = [
    {
        value: 'have_story',
        label: 'I have a story',
        icon: <MessageCircle className="w-3.5 h-3.5" />,
        color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
    },
    {
        value: 'comfortable',
        label: 'Can discuss',
        icon: <Target className="w-3.5 h-3.5" />,
        color: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
    },
    {
        value: 'not_comfortable',
        label: 'Need prep',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
    },
];

export function TriggerPointsCard({ triggerPoints, stories, onUpdateComfort }: TriggerPointsCardProps) {
    const readiness = {
        covered: triggerPoints.filter(tp => tp.userComfort === 'have_story').length,
        comfortable: triggerPoints.filter(tp => tp.userComfort === 'comfortable').length,
        gaps: triggerPoints.filter(tp => tp.userComfort === 'not_comfortable').length,
        unset: triggerPoints.filter(tp => !tp.userComfort).length,
    };

    return (
        <div className="space-y-4">
            {/* Readiness summary */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">{readiness.covered} covered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600">{readiness.comfortable} can discuss</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">{readiness.gaps} need prep</span>
                </div>
                {readiness.unset > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-sm text-gray-600">{readiness.unset} unrated</span>
                    </div>
                )}
            </div>

            {/* Trigger point cards */}
            <div className="space-y-3">
                {triggerPoints.map((tp) => (
                    <div
                        key={tp.id}
                        className="rounded-xl border border-gray-200 bg-surface p-4 transition-all"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Target className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{tp.description}</p>
                                <p className="text-xs text-gray-500 mt-1">{tp.whyItMatters}</p>
                            </div>
                        </div>

                        {/* Comfort selector */}
                        <div className="flex items-center gap-2 ml-11">
                            {comfortOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => onUpdateComfort(tp.id, opt.value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${tp.userComfort === opt.value
                                            ? opt.color + ' ring-1 ring-offset-1'
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Story linker (shown when "have_story" is selected) */}
                        {tp.userComfort === 'have_story' && (
                            <div className="mt-3 ml-11">
                                <div className="flex items-center gap-2">
                                    <Link2 className="w-3.5 h-3.5 text-gray-400" />
                                    <select
                                        value={tp.linkedStoryId || ''}
                                        onChange={(e) => onUpdateComfort(tp.id, 'have_story', e.target.value || undefined)}
                                        className="text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-gray-700"
                                    >
                                        <option value="">Link a Core Story...</option>
                                        {stories.map((story) => (
                                            <option key={story.id} value={story.id}>{story.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
