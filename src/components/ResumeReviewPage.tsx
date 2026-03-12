import { useState, useCallback, useEffect } from 'react';
import { useAgent, useUser } from '../services';
import { TopNavBar } from './TopNavBar';
import { BulletAnalysisCard } from './profile/BulletAnalysisCard';
import { TriggerPointsCard } from './profile/TriggerPointsCard';
import { CandidateProfileSummary } from './profile/CandidateProfileSummary';
import { ResumeChat } from './profile/ResumeChat';
import {
    Zap, Loader2, AlertTriangle, FileText, Target, Shield,
    ArrowRight, ArrowLeft, RefreshCw, Layout, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import type {
    Resume, ResumeAnalysis, TriggerPointComfort,
    CandidateProfile, Story, ATSAnalysisResult,
} from '../types';

type Tab = 'bullets' | 'triggers' | 'profile' | 'ats';

const tabs: { key: Tab; label: string; num: number; icon: React.ElementType; color: string }[] = [
    { key: 'bullets', label: 'Bullet Analysis', num: 1, icon: FileText, color: 'bg-blue-600' },
    { key: 'triggers', label: 'Trigger Points', num: 2, icon: Target, color: 'bg-amber-500' },
    { key: 'profile', label: 'Candidate Strengths', num: 3, icon: Shield, color: 'bg-green-500' },
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

    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    const [resume, setResume] = useState<Resume | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    const [analyzing, setAnalyzing] = useState(false);
    const [atsAnalyzing, setAtsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('bullets');

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Clear cached analysis when resume is replaced
    useEffect(() => {
        if (resume) {
            setAnalysis(null);
            setAtsAnalysis(null);
        }
    }, [resume?.resumePdfPath]);

    // Load data + cached analysis on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [resumeData, storiesData, cachedAnalysis] = await Promise.all([
                    userService.getResume(),
                    userService.getStories(),
                    userService.getResumeAnalysis(),
                ]);
                setResume(resumeData);
                setStories(storiesData || []);

                if (cachedAnalysis) {
                    setAnalysis(cachedAnalysis);
                }
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userService]);

    // Auto-analyze when resume changes (new PDF uploaded or replaced)
    useEffect(() => {
        if (!loading && resume && envApiKey && !analyzing) {
            handleAnalyze();
        }
    }, [loading, resume?.resumePdfPath, resume?.workExperiences?.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-analyze ATS compatibility when resume PDF exists or changes
    useEffect(() => {
        if (!loading && resume?.resumePdfPath) {
            // Clear previous ATS analysis when resume changes
            setAtsAnalysis(null);
            handleAnalyzeAts();
        }
    }, [loading, resume?.resumePdfPath]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnalyzeAts = useCallback(async () => {
        if (!resume?.resumePdfPath) return;

        setAtsAnalyzing(true);
        try {
            const result = await agentService.analyzeAtsCompatibility(resume.resumePdfPath);
            setAtsAnalysis(result);
        } catch (err) {
            console.error('ATS analysis failed:', err);
        } finally {
            setAtsAnalyzing(false);
        }
    }, [resume?.resumePdfPath, agentService]);

    const handleAnalyze = useCallback(async () => {
        if (!resume || !envApiKey) return;

        setAnalyzing(true);
        setError(null);
        setSaved(false);

        try {
            const result = await agentService.analyzeResume(resume, envApiKey);
            setAnalysis(result);
            setActiveTab('bullets');

            // Persist analysis
            await userService.saveResumeAnalysis(result);

            // Auto-save candidate profile so Dashboard shows stats immediately
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

    // Group bullet analyses by experience
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
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopNavBar />
                <div className="container mx-auto p-6 max-w-7xl pt-20">
                    <div className="rounded-2xl p-12 bg-surface shadow-lg text-center">
                        <div className="text-5xl mb-4">📄</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Resume Data</h2>
                        <p className="text-gray-500 mb-4">
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

            <div className="container mx-auto p-6 max-w-[1400px] pt-20">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Resume Review</h1>
                        <p className="text-gray-600">
                            AI-powered analysis of your resume for interview readiness
                            {analysis?.analyzedAt && (
                                <span className="text-gray-400 ml-2">
                                    · Last analyzed {new Date(analysis.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
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
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                                Reanalyze
                            </button>
                        )}
                        {!analysis && !analyzing && (
                            <button
                                onClick={handleAnalyze}
                                disabled={!envApiKey}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all text-sm disabled:opacity-50"
                            >
                                <Zap className="w-4 h-4" />
                                Analyze Resume
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Analyzing spinner */}
                {analyzing && (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Analyzing your resume...</p>
                            <p className="text-sm text-gray-400 mt-1">This may take 10-20 seconds</p>
                        </div>
                    </div>
                )}

                {/* Main content: 2-column layout with tabs */}
                {analysis && !analyzing && (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                        {/* Left column — Tabbed analysis sections */}
                        <div>
                            {/* Tab navigation */}
                            <div className="flex items-center gap-2 mb-6">
                                {tabs.map((tab, i) => (
                                    <div key={tab.key} className="flex items-center">
                                        <button
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === tab.key ? tab.color + ' text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {tab.num}
                                            </span>
                                            {tab.label}
                                        </button>
                                        {i < tabs.length - 1 && (
                                            <ArrowRight className="w-3 h-3 text-gray-300 mx-1" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Tab content */}
                            <div className="rounded-2xl bg-surface shadow-lg border border-gray-100 p-6">
                                {/* Bullet Analysis */}
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

                                {/* Trigger Points */}
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
                                                onClick={() => setActiveTab('profile')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                                            >
                                                Next: Strengths
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Candidate Strengths / Profile */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">Candidate Strengths</h2>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Your compiled profile based on the analysis — high-impact achievements, readiness level, and overall resume score. Save this to unlock the Narrative Coach.
                                                </p>
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
                                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
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

                                {/* ATS Compatibility */}
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
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`text-3xl font-bold ${atsAnalysis.overallScore >= 80 ? 'text-green-600' : atsAnalysis.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {atsAnalysis.overallScore}/100
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {atsAnalysis.overallScore >= 80 ? 'Excellent ATS compatibility' : 
                                                         atsAnalysis.overallScore >= 60 ? 'Good, but could be improved' : 
                                                         'Needs improvement for ATS parsing'}
                                                    </div>
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
                                                                        <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                                            💡 {check.recommendation}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : resume?.resumePdfPath ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                                                <p className="text-gray-600">Analyzing ATS compatibility...</p>
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
                                                onClick={() => setActiveTab('profile')}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right column — Chat */}
                        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-120px)]">
                            <ResumeChat analysisContext={analysis} />
                        </div>
                    </div>
                )}

                {/* Empty state — no API key */}
                {!analysis && !analyzing && !envApiKey && (
                    <div className="rounded-2xl p-12 bg-surface shadow-lg text-center">
                        <div className="text-5xl mb-4">🔑</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">API Key Required</h2>
                        <p className="text-gray-500">
                            Add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">VITE_GEMINI_API_KEY</code> to your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.env</code> file to enable resume analysis.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
