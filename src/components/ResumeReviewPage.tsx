import { useState, useCallback, useEffect } from 'react';
import { useAgent, useUser, useCoaching } from '../services';
import { TopNavBar } from './TopNavBar';
import { BulletAnalysisCard } from './profile/BulletAnalysisCard';
import { TriggerPointsCard } from './profile/TriggerPointsCard';
import { CandidateProfileSummary } from './profile/CandidateProfileSummary';
import { ResumeChat } from './profile/ResumeChat';
import {
    Zap, Loader2, AlertTriangle, FileText, Target, Layout,
    ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle, XCircle, AlertCircle,
    ListTodo, Trophy,
} from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type {
    Resume, ResumeAnalysis, TriggerPointComfort,
    CandidateProfile, Story, ATSAnalysisResult, AgentSession,
    CoachingSessionData,
} from '../types';

type Tab = 'coaching' | 'bullets' | 'triggers' | 'ats';

const tabs: { key: Tab; label: string; num: number; icon: React.ElementType; color: string }[] = [
    { key: 'coaching', label: 'Coaching', num: 1, icon: Sparkles, color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { key: 'bullets', label: 'Bullet Analysis', num: 2, icon: FileText, color: 'bg-blue-600' },
    { key: 'triggers', label: 'Trigger Points', num: 3, icon: Target, color: 'bg-amber-500' },
    { key: 'ats', label: 'ATS Compatibility', num: 4, icon: Layout, color: 'bg-purple-500' },
];

function ScoreBadge({ score, label }: { score: number; label?: string }) {
    const color =
        score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
            score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-red-600 bg-red-50 border-red-200';

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
            {label && <span className="font-normal text-gray-500">{label}:</span>}
            {score}/100
        </span>
    );
}

export default function ResumeReviewPage() {
    const agentService = useAgent();
    const userService = useUser();
    const coachingService = useCoaching();

    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    const [resume, setResume] = useState<Resume | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    const [analyzing, setAnalyzing] = useState(false);
    const [atsAnalyzing, setAtsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('coaching');

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [coachingSessionId, setCoachingSessionId] = useState<string | null>(null);
    const [coachingData, setCoachingData] = useState<CoachingSessionData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resumeData, storiesData, cachedAnalysis, cachedAtsAnalysis] = await Promise.all([
                    userService.getResume(),
                    userService.getStories(),
                    userService.getResumeAnalysis(),
                    userService.getAtsAnalysis(),
                ]);
                setResume(resumeData);
                setStories(storiesData || []);

                if (cachedAnalysis) {
                    setAnalysis(cachedAnalysis);
                }
                if (cachedAtsAnalysis) {
                    setAtsAnalysis(cachedAtsAnalysis);
                }
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userService]);

    useEffect(() => {
        if (!coachingSessionId) {
            setCoachingData(null);
            return;
        }
        let active = true;
        const load = async () => {
            try {
                const data = await coachingService.getSessionData(coachingSessionId);
                if (active) setCoachingData(data);
            } catch {
                if (active) setCoachingData(null);
            }
        };
        load();
        return () => { active = false; };
    }, [coachingSessionId, coachingService]);

    const handleSessionChange = useCallback((session: AgentSession | null) => {
        setCoachingSessionId(session?.id || null);
    }, []);

    const handleAnalyzeAts = useCallback(async () => {
        if (!resume?.resumePdfPath) return;

        setAtsAnalyzing(true);
        try {
            const result = await agentService.analyzeAtsCompatibility(resume.resumePdfPath);
            setAtsAnalysis(result);
            await userService.saveAtsAnalysis(result);
        } catch (err) {
            console.error('ATS analysis failed:', err);
        } finally {
            setAtsAnalyzing(false);
        }
    }, [resume?.resumePdfPath, agentService, userService]);

    const handleAnalyze = useCallback(async () => {
        if (!resume || !envApiKey) return;

        setAnalyzing(true);
        setError(null);
        setSaved(false);

        try {
            const result = await agentService.analyzeResume(resume, envApiKey);
            setAnalysis(result);
            setActiveTab('coaching');

            await userService.saveResumeAnalysis(result);

            const strengths = result.bulletAnalyses
                .filter(ba => ba.impactScore >= 7)
                .map(ba => ba.originalBullet)
                .slice(0, 8);
            const triggerPoints = result.triggerPoints;

            const autoProfile: CandidateProfile = {
                strengths,
                triggerPoints,
                storyReadiness: {
                    covered: triggerPoints.filter(tp => tp.userComfort === 'have_story').length,
                    comfortable: triggerPoints.filter(tp => tp.userComfort === 'comfortable').length,
                    gaps: triggerPoints.filter(tp => !tp.userComfort || tp.userComfort === 'not_comfortable').length,
                },
                resumeScore: result.overallScore,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            await userService.saveCandidateProfile(autoProfile);
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(err instanceof Error ? err.message : 'Analysis failed. Check your API key and try again.');
        } finally {
            setAnalyzing(false);
        }
    }, [resume, envApiKey, agentService, userService]);

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

    const analysesByExperience = analysis && resume
        ? resume.workExperiences.map(exp => ({
            experience: exp,
            analyses: analysis.bulletAnalyses.filter(ba => ba.experienceId === exp.id),
        })).filter(g => g.analyses.length > 0)
        : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopNavBar />
                <LoadingSpinner fullScreen={false} />
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopNavBar />
                <div className="container mx-auto p-4 sm:p-6 max-w-7xl pt-16 sm:pt-20">
                    <div className="rounded-2xl p-6 sm:p-12 bg-surface shadow-lg text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Resume Data</h2>
                        <p className="text-sm sm:text-base text-gray-500 mb-4">
                            Upload your resume in the Profile page to get started with the analysis.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <TopNavBar />

            <div className="container mx-auto p-4 sm:p-6 max-w-[1400px] pt-16 sm:pt-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Resume Review</h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            AI-powered analysis of your resume for interview readiness
                            {analysis?.analyzedAt && (
                                <span className="text-gray-400 ml-2 hidden sm:inline">
                                    · Last analyzed {new Date(analysis.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {analysis && <ScoreBadge score={analysis.overallScore} label="Resume Score" />}
                        {atsAnalysis && (
                            <ScoreBadge score={atsAnalysis.overallScore} label="ATS Score" />
                        )}
                        {atsAnalyzing && (
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing ATS...
                            </span>
                        )}
                        {analysis && envApiKey && (
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Reanalyze</span>
                            </button>
                        )}
                        {!analysis && !analyzing && (
                            <button
                                onClick={handleAnalyze}
                                disabled={!envApiKey}
                                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all text-sm disabled:opacity-50"
                            >
                                <Zap className="w-4 h-4" />
                                Analyze Resume
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {analyzing && (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Analyzing your resume...</p>
                            <p className="text-sm text-gray-400 mt-1">This may take 10-20 seconds</p>
                        </div>
                    </div>
                )}

                {analysis && !analyzing && (
                    <div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6">
                            {tabs.map((tab, i) => (
                                <div key={tab.key} className="flex items-center">
                                    <button
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === tab.key
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === tab.key ? tab.color + ' text-white' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {tab.num}
                                        </span>
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.key === 'coaching' ? 'Coach' : tab.key === 'bullets' ? 'Bullets' : tab.key === 'triggers' ? 'Triggers' : 'ATS'}</span>
                                    </button>
                                    {i < tabs.length - 1 && (
                                        <ArrowRight className="w-3 h-3 text-gray-300 mx-0.5 hidden sm:block" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {activeTab === 'coaching' && (
                            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[400px_1fr] gap-6">
                                <div className="space-y-4 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:sticky lg:top-20">
                                    {analysis && (
                                        <div className="rounded-2xl bg-surface shadow-lg border border-gray-100 p-4 sm:p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-sm font-bold text-gray-900">Coaching Workspace</h3>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                                <div className={`text-2xl font-bold ${analysis.overallScore >= 80 ? 'text-green-600' : analysis.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {analysis.overallScore}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <div className="font-medium text-gray-700">Resume Score</div>
                                                    {analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good, room to improve' : 'Needs work'}
                                                </div>
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
                                                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-3">{error}</p>
                                            )}
                                        </div>
                                    )}

                                    {coachingData && coachingData.goals.length > 0 && (
                                        <div className="rounded-2xl bg-surface shadow-lg border border-gray-100 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Trophy className="w-4 h-4 text-amber-600" />
                                                <h3 className="text-sm font-bold text-gray-900">Goals</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {coachingData.goals.map(goal => (
                                                    <div key={goal.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-gray-800">{goal.title}</span>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                                                goal.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                                goal.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                                                                goal.status === 'abandoned' ? 'bg-gray-100 text-gray-500' :
                                                                'bg-gray-50 text-gray-500'
                                                            }`}>
                                                                {goal.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        {goal.progress > 0 && (
                                                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5">
                                                                <div
                                                                    className="h-1.5 bg-blue-500 rounded-full transition-all"
                                                                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {coachingData && coachingData.todos.length > 0 && (
                                        <div className="rounded-2xl bg-surface shadow-lg border border-gray-100 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ListTodo className="w-4 h-4 text-blue-600" />
                                                <h3 className="text-sm font-bold text-gray-900">Tasks</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {coachingData.todos.map(todo => (
                                                    <div key={todo.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                            todo.status === 'completed' ? 'bg-green-500 border-green-500' :
                                                            todo.status === 'in_progress' ? 'border-blue-400 bg-blue-50' :
                                                            'border-gray-300'
                                                        }`}>
                                                            {todo.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className={`text-xs ${todo.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                            {todo.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-[500px] sm:h-[550px] lg:sticky lg:top-20 lg:h-[calc(100vh-120px)]">
                                    <ResumeChat
                                        analysisContext={analysis}
                                        resumeContext={resume}
                                        onSessionChange={handleSessionChange}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab !== 'coaching' && (
                            <div className="rounded-2xl bg-surface shadow-lg border border-gray-100 p-4 sm:p-6">
                                {activeTab === 'bullets' && (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">Bullet Analysis</h2>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Each resume bullet is evaluated for weak verbs, missing metrics, poor structure, and passive voice. Impact scores show how compelling each achievement is to a recruiter.
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600">
                                            Found <strong>{analysis.bulletAnalyses.reduce((sum, a) => sum + a.issues.length, 0)}</strong> issues across <strong>{analysis.bulletAnalyses.length}</strong> bullets.
                                            Overall score: <strong>{analysis.overallScore}/100</strong>
                                        </p>

                                        <div className="space-y-3">
                                            {analysesByExperience.map(({ experience, analyses: exAnalyses }) => (
                                                <BulletAnalysisCard
                                                    key={experience.id}
                                                    experience={experience}
                                                    analyses={exAnalyses}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={() => setActiveTab('triggers')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                                            >
                                                Next: Trigger Points
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'triggers' && (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">Trigger Points</h2>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    These are aspects of your resume that a recruiter would almost certainly ask about. Rate your comfort level for each — this helps identify where you need to prepare stories.
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600">
                                            Found <strong>{analysis.triggerPoints.length}</strong> trigger points. Rate your comfort level for each.
                                        </p>

                                        <TriggerPointsCard
                                            triggerPoints={analysis.triggerPoints}
                                            stories={stories}
                                            onUpdateComfort={handleUpdateComfort}
                                        />

                                        <div className="flex justify-between pt-2">
                                            <button
                                                onClick={() => setActiveTab('bullets')}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('ats')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                                            >
                                                Next: ATS
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ats' && (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                                                <Layout className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">ATS Compatibility</h2>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Analysis of your resume's formatting for Applicant Tracking System compatibility.
                                                    {resume?.resumePdfPath ? ' Based on your uploaded PDF.' : ' Upload a PDF resume to enable this analysis.'}
                                                </p>
                                            </div>
                                        </div>

                                        {atsAnalysis ? (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`text-3xl font-bold ${atsAnalysis.overallScore >= 80 ? 'text-green-600' : atsAnalysis.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                            {atsAnalysis.overallScore}/100
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {atsAnalysis.overallScore >= 80 ? 'Excellent ATS compatibility' :
                                                             atsAnalysis.overallScore >= 60 ? 'Good, but could be improved' :
                                                             'Needs improvement for ATS parsing'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleAnalyzeAts}
                                                        disabled={atsAnalyzing}
                                                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                                                    >
                                                        <RefreshCw className={`w-3.5 h-3.5 ${atsAnalyzing ? 'animate-spin' : ''}`} />
                                                        Recheck
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {atsAnalysis.checks.map((check, index) => (
                                                        <div
                                                            key={index}
                                                            className={`p-4 rounded-lg border ${
                                                                check.status === 'pass' ? 'bg-green-50 border-green-200' :
                                                                check.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                                                                'bg-red-50 border-red-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {check.status === 'pass' ? (
                                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                                ) : check.status === 'warning' ? (
                                                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                                ) : (
                                                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h3 className="font-semibold text-gray-900">{check.checkName}</h3>
                                                                        <span className={`text-sm font-medium ${
                                                                            check.status === 'pass' ? 'text-green-600' :
                                                                            check.status === 'warning' ? 'text-amber-600' :
                                                                            'text-red-600'
                                                                        }`}>
                                                                            {check.status === 'pass' ? 'Pass' : check.status === 'warning' ? 'Warning' : 'Fail'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mb-1">{check.details}</p>
                                                                    {check.recommendation && (
                                                                        <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                                                                            {check.recommendation}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : atsAnalyzing ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                                                <p className="text-gray-600">Analyzing ATS compatibility...</p>
                                            </div>
                                        ) : resume?.resumePdfPath ? (
                                            <div className="text-center py-8">
                                                <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                <p className="text-gray-600 mb-4">Run ATS compatibility check on your resume PDF.</p>
                                                <button
                                                    onClick={handleAnalyzeAts}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm mx-auto"
                                                >
                                                    <Layout className="w-4 h-4" />
                                                    Check ATS Compatibility
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Layout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>Upload a PDF resume to see ATS compatibility analysis.</p>
                                                <p className="text-sm mt-2">Go to Profile page to upload your resume.</p>
                                            </div>
                                        )}

                                        <div className="flex justify-start pt-2">
                                            <button
                                                onClick={() => setActiveTab('triggers')}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!analysis && !analyzing && !envApiKey && (
                    <div className="rounded-2xl p-6 sm:p-12 bg-surface shadow-lg text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">API Key Required</h2>
                        <p className="text-sm sm:text-base text-gray-500">
                            Add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">VITE_GEMINI_API_KEY</code> to your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">.env</code> file to enable resume analysis.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
