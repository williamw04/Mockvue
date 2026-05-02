import type { BulletAnalysis, WorkExperience } from '../../types';
import { AlertTriangle, CheckCircle, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface BulletAnalysisCardProps {
    experience: WorkExperience;
    analyses: BulletAnalysis[];
}

const issueLabels: Record<string, { label: string; color: string }> = {
    weak_verb: { label: 'Weak Verb', color: 'bg-red-100 text-red-700' },
    no_metrics: { label: 'No Metrics', color: 'bg-amber-100 text-amber-700' },
    too_brief: { label: 'Too Brief', color: 'bg-orange-100 text-orange-700' },
    bad_structure: { label: 'Structure', color: 'bg-purple-100 text-purple-700' },
    passive_voice: { label: 'Passive', color: 'bg-rose-100 text-rose-700' },
};

function ImpactScoreBadge({ score }: { score: number }) {
    const color =
        score >= 7 ? 'bg-green-100 text-green-700 border-green-200' :
            score >= 4 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                'bg-red-100 text-red-700 border-red-200';

    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${color}`}>
            {score}/10
        </span>
    );
}

export function BulletAnalysisCard({ experience, analyses }: BulletAnalysisCardProps) {
    const [expanded, setExpanded] = useState(true);
    const [showRewrites, setShowRewrites] = useState<Record<number, boolean>>({});

    const toggleRewrite = (index: number) => {
        setShowRewrites(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const issueCount = analyses.reduce((sum, a) => sum + a.issues.length, 0);
    const avgScore = analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.impactScore, 0) / analyses.length)
        : 0;

    return (
        <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <div>
                        <h4 className="font-semibold text-gray-900">{experience.position}</h4>
                        <p className="text-sm text-blue-600">{experience.company}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {issueCount > 0 ? (
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {issueCount} issue{issueCount > 1 ? 's' : ''}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Clean
                        </span>
                    )}
                    <ImpactScoreBadge score={avgScore} />
                </div>
            </button>

            {/* Bullets */}
            {expanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {analyses.map((analysis, i) => (
                        <div key={i} className="p-4 pl-11">
                            {/* Original bullet */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <p className="text-sm text-gray-700 flex-1">
                                    <span className="text-gray-400 mr-2">•</span>
                                    {analysis.originalBullet}
                                </p>
                                <ImpactScoreBadge score={analysis.impactScore} />
                            </div>

                            {/* Issue badges */}
                            {analysis.issues.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {analysis.issues.map((issue, j) => {
                                        const label = issueLabels[issue.type] || { label: issue.type, color: 'bg-gray-100 text-gray-700' };
                                        return (
                                            <span
                                                key={j}
                                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${label.color}`}
                                                title={issue.message}
                                            >
                                                {label.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Suggested rewrite toggle */}
                            {analysis.suggestedRewrite && (
                                <button
                                    onClick={() => toggleRewrite(i)}
                                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors mt-1"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {showRewrites[i] ? 'Hide suggestion' : 'Show AI suggestion'}
                                </button>
                            )}

                            {/* Rewrite diff */}
                            {showRewrites[i] && analysis.suggestedRewrite && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs font-medium text-blue-700 mb-1">✨ Suggested rewrite:</p>
                                    <p className="text-sm text-blue-900">{analysis.suggestedRewrite}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
