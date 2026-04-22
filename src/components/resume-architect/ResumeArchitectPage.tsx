import { useState, useCallback, useEffect } from 'react';
import { useAgent, useUser } from '../../services';
import { TopNavBar } from '../TopNavBar';
import { SectionNav } from './SectionNav';
import { BulletDiffEditor } from './BulletDiffEditor';
import { CompanyChatPanel } from './CompanyChatPanel';
import { InsightsRail } from './InsightsRail';
import { JobDescriptionUpload } from './JobDescriptionUpload';
import { Loader2, FileText } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Resume, ResumeAnalysis, BulletAnalysis } from '../../types';

type Mode = 'diff' | 'agent';

interface CompanyChat {
  id: string;
  name: string;
  color?: string;
  score?: number;
  jobDescription?: string;
  keywords?: { kw: string; found: boolean }[];
  isActive: boolean;
}

const FLAG_COLORS: Record<string, { bg: string; color: string }> = {
  'VAGUE VERB': { bg: 'bg-[#fef3c7]', color: 'text-[#b45309]' },
  'NO METRIC': { bg: 'bg-[#ffedd5]', color: 'text-[#c2410c]' },
  'NO KW': { bg: 'bg-[#fde8e0]', color: 'text-[#d9532b]' },
  WEAK: { bg: 'bg-[#fee2e2]', color: 'text-[#b91c1c]' },
};

interface BulletState {
  status: 'pending' | 'accepted' | 'rejected' | 'cut';
}

export default function ResumeArchitectPage() {
  const agentService = useAgent();
  const userService = useUser();
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const [mode, setMode] = useState<Mode>('diff');
  const [activeSection, setActiveSection] = useState<string>('summary');
  const [bulletStates, setBulletStates] = useState<Record<string, BulletState>>({});
  const [expandedBullet, setExpandedBullet] = useState<string | null>(null);

  const [companyChats, setCompanyChats] = useState<CompanyChat[]>([
    { id: 'general', name: 'General Review', isActive: true },
  ]);
  const [activeChatId, setActiveChatId] = useState<string>('general');
  const [showChatDropdown, setShowChatDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resumeData = await userService.getResume();
        setResume(resumeData);

        const cachedAnalysis = await userService.getResumeAnalysis();
        if (cachedAnalysis) {
          setAnalysis(cachedAnalysis);
          if (cachedAnalysis.bulletAnalyses.length > 0) {
            const firstExpId = cachedAnalysis.bulletAnalyses[0].experienceId;
            setActiveSection(firstExpId);
          }
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
    if (envApiKey) {
      agentService.setAgentApiKey(envApiKey);
    }
  }, [envApiKey, agentService]);

  const handleAnalyze = useCallback(async () => {
    if (!resume || !envApiKey) return;

    setAnalyzing(true);
    try {
      const result = await agentService.analyzeResume(resume, envApiKey);
      setAnalysis(result);
      if (result.bulletAnalyses.length > 0) {
        setActiveSection(result.bulletAnalyses[0].experienceId);
      }
      await userService.saveResumeAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  }, [resume, envApiKey, agentService, userService]);

  const handleSetBulletState = useCallback((bulletId: string, status: BulletState['status']) => {
    setBulletStates((prev) => ({ ...prev, [bulletId]: { status } }));
    setExpandedBullet(null);
  }, []);

  const handleAddCompanyChat = useCallback((name: string, jobDescription?: string) => {
    const newChat: CompanyChat = {
      id: crypto.randomUUID(),
      name,
      jobDescription,
      isActive: true,
    };
    setCompanyChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
    setShowChatDropdown(false);
  }, []);

  const handleRemoveCompanyChat = useCallback(
    (chatId: string) => {
      setCompanyChats((prev) => {
        const filtered = prev.filter((c) => c.id !== chatId);
        if (chatId === activeChatId && filtered.length > 0) {
          setActiveChatId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeChatId]
  );

  const handleUploadJobDescription = useCallback((chatId: string, text: string) => {
    setCompanyChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, jobDescription: text } : c))
    );
  }, []);

  const activeChat = companyChats.find((c) => c.id === activeChatId) || companyChats[0];

  const allBullets = analysis?.bulletAnalyses || [];
  const acceptedCount = allBullets.filter(
    (b) => bulletStates[b.experienceId + '-' + b.bulletIndex]?.status !== 'pending'
  ).length;
  const totalCount = allBullets.length;
  const progressPercent = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  const sections: { id: string; title: string; bullets: BulletAnalysis[] }[] = [];
  if (resume && analysis) {
    resume.workExperiences.forEach((exp) => {
      const expBullets = analysis.bulletAnalyses.filter((b) => b.experienceId === exp.id);
      if (expBullets.length > 0) {
        sections.push({
          id: exp.id,
          title: `${exp.company} · ${exp.position} · ${exp.startDate.slice(0, 4)}${exp.endDate ? '–' + exp.endDate.slice(0, 4) : '–Present'}`,
          bullets: expBullets,
        });
      }
    });
  }

  const activeSectionData = sections.find((s) => s.id === activeSection);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <TopNavBar />
        <LoadingSpinner fullScreen={false} />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-bg">
        <TopNavBar />
        <div className="px-14 py-8 max-w-3xl mx-auto">
          <div className="bg-card border border-rule p-10 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-ink-3" />
            <h2 className="font-serif text-2xl font-medium text-ink mb-2">No Resume Uploaded</h2>
            <p className="text-sm text-ink-2 mb-6">
              Upload your resume in the Profile page to get started with the architect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden">
      <TopNavBar />

      {/* Top Bar */}
      <div className="px-6 py-3 bg-card border-b border-rule flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
            RESUME ARCHITECT
          </span>
        </div>

        <div className="w-px h-4 bg-rule" />

        {/* Mode Toggle */}
        <div className="flex bg-bg border border-rule rounded-sm p-0.5 gap-0.5">
          {(['diff', 'agent'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === m ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {m === 'diff' ? 'Diff Editor' : 'Agent Mode'}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 bg-rule rounded-sm">
            <div
              className="h-full bg-accent-hi rounded-sm transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-accent-hi font-semibold">
            {progressPercent}%
          </span>
        </div>

        <span className="font-mono text-[10px] text-ink-3 tracking-wider">
          {analysis
            ? `ANALYZED ${new Date(analysis.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'NOT ANALYZED'}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[200px_1fr_260px] overflow-hidden">
        {/* Section Nav Sidebar */}
        <SectionNav
          sections={sections}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          bulletStates={bulletStates}
        />

        {/* Main Panel */}
        <main className="overflow-y-auto px-7 py-6 bg-bg">
          {mode === 'agent' && !analyzing && activeChat && (
            <div className="mb-6">
              <JobDescriptionUpload
                chat={activeChat}
                onUpload={(text) => handleUploadJobDescription(activeChat.id, text)}
              />
            </div>
          )}

          {!analysis && !analyzing && (
            <div className="bg-card border border-rule p-10 text-center max-w-xl mx-auto">
              <div className="w-10 h-10 rounded-sm bg-ink mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-hi" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-ink mb-2">Analyze Your Resume</h2>
              <p className="text-sm text-ink-2 mb-6">
                Run the analysis to see bullet-by-bullet suggestions and keyword coverage.
              </p>
              <button
                onClick={handleAnalyze}
                disabled={!envApiKey}
                className="bg-accent-hi text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {envApiKey ? 'Analyze Resume' : 'API Key Required'}
              </button>
            </div>
          )}

          {analyzing && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-accent-hi animate-spin mx-auto mb-4" />
                <p className="text-sm text-ink-2 font-medium">Analyzing your resume...</p>
                <p className="text-xs text-ink-3 mt-1">This may take 10-20 seconds</p>
              </div>
            </div>
          )}

          {analysis && !analyzing && activeSectionData && (
            <BulletDiffEditor
              section={activeSectionData}
              bulletStates={bulletStates}
              expandedBullet={expandedBullet}
              onExpand={setExpandedBullet}
              onSetBulletState={handleSetBulletState}
              flagColors={FLAG_COLORS}
            />
          )}
        </main>

        {/* Right Rail */}
        {mode === 'agent' ? (
          <CompanyChatPanel
            chats={companyChats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onAddChat={handleAddCompanyChat}
            onRemoveChat={handleRemoveCompanyChat}
            onUploadJobDesc={(text) => handleUploadJobDescription(activeChatId, text)}
            analysis={analysis}
            resume={resume}
            showDropdown={showChatDropdown}
            onToggleDropdown={() => setShowChatDropdown(!showChatDropdown)}
          />
        ) : (
          <InsightsRail
            chat={activeChat}
            analysis={analysis}
            hasJobDescription={Boolean(activeChat.jobDescription)}
          />
        )}
      </div>
    </div>
  );
}
