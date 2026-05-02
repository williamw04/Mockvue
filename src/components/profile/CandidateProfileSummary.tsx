import type { CandidateProfile, TriggerPoint } from '../../types';
import { Shield, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

interface CandidateProfileSummaryProps {
    profile: CandidateProfile;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
    const color =
        score >= 70 ? 'text-green-600' :
            score >= 40 ? 'text-amber-600' :
                'text-red-600';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${score}, 100`}
                        className={color}
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
                    {score}
                </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
    );
}

function ReadinessBar({ covered, comfortable, gaps }: { covered: number; comfortable: number; gaps: number }) {
    const total = covered + comfortable + gaps;
    if (total === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                {covered > 0 && (
                    <div
                        className="bg-green-500 transition-all"
                        style={{ width: `${(covered / total) * 100}%` }}
                    />
                )}
                {comfortable > 0 && (
                    <div
                        className="bg-amber-400 transition-all"
                        style={{ width: `${(comfortable / total) * 100}%` }}
                    />
                )}
                {gaps > 0 && (
                    <div
                        className="bg-red-400 transition-all"
                        style={{ width: `${(gaps / total) * 100}%` }}
                    />
                )}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {covered} story ready
                </div>
                <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {comfortable} can discuss
                </div>
                <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" />
                    {gaps} need prep
                </div>
            </div>
        </div>
    );
}

export function CandidateProfileSummary({ profile, onSave, saving, saved }: CandidateProfileSummaryProps) {
    return (
        <div className="space-y-6">
            {/* Score + Readiness */}
            <div className="flex items-start gap-8 p-6 bg-gray-50 rounded-xl">
                <ScoreGauge score={profile.resumeScore} label="Resume Score" />
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3">Interview Readiness</h4>
                    <ReadinessBar
                        covered={profile.storyReadiness.covered}
                        comfortable={profile.storyReadiness.comfortable}
                        gaps={profile.storyReadiness.gaps}
                    />
                </div>
            </div>

            {/* Strengths */}
            {profile.strengths.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Key Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {profile.strengths.map((strength, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200"
                            >
                                {strength}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Trigger points that need attention */}
            {profile.triggerPoints.filter((tp: TriggerPoint) => tp.userComfort === 'not_comfortable').length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Areas Needing Preparation
                    </h4>
                    <ul className="space-y-2">
                        {profile.triggerPoints
                            .filter((tp: TriggerPoint) => tp.userComfort === 'not_comfortable')
                            .map((tp: TriggerPoint) => (
                                <li key={tp.id} className="flex items-start gap-2 text-sm text-gray-700 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    {tp.description}
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* Save / Success */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {saved ? (
                    <div className="flex items-center gap-2 text-green-600">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Profile saved — ready for the Narrative Coach!</span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        Save your profile to make it available for the Narrative Coach.
                    </p>
                )}
                <button
                    onClick={onSave}
                    disabled={saving || saved}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Candidate Profile'}
                </button>
            </div>
        </div>
    );
}
