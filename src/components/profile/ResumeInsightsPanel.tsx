import { useState, useCallback } from 'react';
import { useAgent, useUser } from '../../services';
import { BulletAnalysisCard } from './BulletAnalysisCard';
import { TriggerPointsCard } from './TriggerPointsCard';
import { CandidateProfileSummary } from './CandidateProfileSummary';
import { Zap, ArrowRight, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import type { Resume, ResumeAnalysis, TriggerPointComfort, CandidateProfile, Story } from '../../types';

interface ResumeInsightsPanelProps {
    resume: Resume;
    stories: Story[];
}

type Step = 'setup' | 'bullets' | 'triggers' | 'profile';

export function ResumeInsightsPanel({ resume, stories }: ResumeInsightsPanelProps) {
    const agentService = useAgent();
    const userService = useUser();

    const [step, setStep] = useState<Step>('setup');
    const [apiKey, setApiKey] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleAnalyze = useCallback(async () => {
        if (!apiKey.trim()) {
            setError('Please enter your Gemini API key');
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            const result = await agentService.analyzeResume(resume, apiKey);
            setAnalysis(result);
            setStep('bullets');
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(err instanceof Error ? err.message : 'Analysis failed. Check your API key and try again.');
        } finally {
            setAnalyzing(false);
        }
    }, [apiKey, resume, agentService]);

    const handleUpdateComfort = useCallback((id: string, comfort: TriggerPointComfort, linkedStoryId?: string) => {
        if (!analysis) return;

        setAnalysis({
            ...analysis,
            triggerPoints: analysis.triggerPoints.map(tp =>
                tp.id === id ? { ...tp, userComfort: comfort, linkedStoryId } : tp
            ),
        });
    }, [analysis]);

    const handleSaveProfile = useCallback(async () => {
        if (!analysis) return;

        setSaving(true);
        try {
            const triggerPoints = analysis.triggerPoints;
            const strengths = analysis.bulletAnalyses
                .filter(ba => ba.impactScore >= 7)
                .map(ba => ba.originalBullet);

            const candidateProfile: CandidateProfile = {
                strengths: strengths.slice(0, 8),
                triggerPoints,
                storyReadiness: {
                    covered: triggerPoints.filter(tp => tp.userComfort === 'have_story').length,
                    comfortable: triggerPoints.filter(tp => tp.userComfort === 'comfortable').length,
                    gaps: triggerPoints.filter(tp => tp.userComfort === 'not_comfortable' || !tp.userComfort).length,
                },
                resumeScore: analysis.overallScore,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await userService.saveCandidateProfile(candidateProfile);
            setSaved(true);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save candidate profile');
        } finally {
            setSaving(false);
        }
    }, [analysis, userService]);

    const steps: { key: Step; label: string; num: number }[] = [
        { key: 'bullets', label: 'Bullet Analysis', num: 1 },
        { key: 'triggers', label: 'Trigger Points', num: 2 },
        { key: 'profile', label: 'Candidate Profile', num: 3 },
    ];

    // Group bullet analyses by experience
    const analysesByExperience = analysis
        ? resume.workExperiences.map(exp => ({
            experience: exp,
            analyses: analysis.bulletAnalyses.filter(ba => ba.experienceId === exp.id),
        })).filter(g => g.analyses.length > 0)
        : [];

    return (
        <div className="rounded-2xl p-8 bg-surface shadow-lg" id="resume-insights-panel">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Resume Insights</h2>
                    <p className="text-sm text-gray-500">AI-powered resume analysis for interview readiness</p>
                </div>
            </div>

            {/* Step indicator (not shown on setup) */}
            {step !== 'setup' && (
                <div className="flex items-center gap-2 mb-6">
                    {steps.map((s, i) => (
                        <div key={s.key} className="flex items-center">
                            <button
                                onClick={() => setStep(s.key)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${step === s.key
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === s.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {s.num}
                                </span>
                                {s.label}
                            </button>
                            {i < steps.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-gray-300 mx-1" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Setup step */}
            {step === 'setup' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Enter your Gemini API key to analyze your resume bullets, identify trigger points, and build your interview-ready candidate profile.
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                                placeholder="Gemini API Key"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || !apiKey.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Analyze Resume
                                </>
                            )}
                        </button>
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                </div>
            )}

            {/* Bullet Analysis step */}
            {step === 'bullets' && analysis && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Found <strong>{analysis.bulletAnalyses.reduce((sum, a) => sum + a.issues.length, 0)}</strong> issues across <strong>{analysis.bulletAnalyses.length}</strong> bullets.
                                Overall score: <strong>{analysis.overallScore}/100</strong>
                            </p>
                        </div>
                        <button
                            onClick={() => setStep('triggers')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                            Next: Trigger Points
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {analysesByExperience.map(({ experience, analyses: exAnalyses }) => (
                            <BulletAnalysisCard
                                key={experience.id}
                                experience={experience}
                                analyses={exAnalyses}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Trigger Points step */}
            {step === 'triggers' && analysis && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Found <strong>{analysis.triggerPoints.length}</strong> trigger points a recruiter would likely ask about. Rate your comfort level for each.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('bullets')}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={() => setStep('profile')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                Next: Profile
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <TriggerPointsCard
                        triggerPoints={analysis.triggerPoints}
                        stories={stories}
                        onUpdateComfort={handleUpdateComfort}
                    />
                </div>
            )}

            {/* Candidate Profile step */}
            {step === 'profile' && analysis && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Your candidate profile is compiled based on the analysis. Save it for the Narrative Coach.
                        </p>
                        <button
                            onClick={() => setStep('triggers')}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>

                    <CandidateProfileSummary
                        profile={{
                            strengths: analysis.bulletAnalyses
                                .filter(ba => ba.impactScore >= 7)
                                .map(ba => ba.originalBullet)
                                .slice(0, 8),
                            triggerPoints: analysis.triggerPoints,
                            storyReadiness: {
                                covered: analysis.triggerPoints.filter(tp => tp.userComfort === 'have_story').length,
                                comfortable: analysis.triggerPoints.filter(tp => tp.userComfort === 'comfortable').length,
                                gaps: analysis.triggerPoints.filter(tp => tp.userComfort === 'not_comfortable' || !tp.userComfort).length,
                            },
                            resumeScore: analysis.overallScore,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }}
                        onSave={handleSaveProfile}
                        saving={saving}
                        saved={saved}
                    />

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                </div>
            )}
        </div>
    );
}
