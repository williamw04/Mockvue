import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import ProgressChart from './ProgressChart';
import { RecentlyOpened } from './RecentlyOpened';
import { DashboardDocumentCard } from './DashboardDocumentCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ProgressStats, Document, CandidateProfile } from '../types';
import { useDocuments, useNotifications, useUser } from '../services';
import { seedDocumentsIfEmpty } from '../utils/seedDocuments';
import { Plus, Grid3X3, List, FileText, Search, ArrowUpDown, Zap, ArrowRight, Target, Shield, TrendingUp } from 'lucide-react';

const progressStats: ProgressStats = {
  completed: 24,
  inProgress: 8,
  scheduled: 12,
  pending: 6,
};

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'Title A-Z' },
] as const;

type SortValue = (typeof sortOptions)[number]['value'];

function ResumeScoreWidget({ candidateProfile, analysisScore }: { candidateProfile: CandidateProfile | null; analysisScore: number | null }) {
  const score = candidateProfile?.resumeScore ?? analysisScore ?? 0;
  const hasScore = candidateProfile !== null || analysisScore !== null;

  // SVG circular progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = hasScore ? (score / 100) * circumference : 0;

  const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const scoreBg = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-amber-50' : 'bg-red-50';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';

  return (
    <Link
      to="/resume-review"
      className="block rounded-2xl bg-surface p-6 shadow-lg hover:shadow-xl transition-all group border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Resume Score</h3>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>

      {hasScore ? (
        <div className="flex items-center gap-6">
          {/* Circular Score */}
          <div className="relative flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={radius} fill="none"
                stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{score}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Rating</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full`} style={{ backgroundColor: scoreColor }} />
                <p className="text-sm font-semibold text-gray-900">{scoreLabel}</p>
              </div>
            </div>

            {candidateProfile && (
              <div className="grid grid-cols-2 gap-2">
                <div className={`${scoreBg} rounded-lg px-2.5 py-1.5`}>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-gray-700">{candidateProfile.strengths.length}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Strengths</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-medium text-gray-700">{candidateProfile.storyReadiness.gaps}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Gaps</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-blue-600 group-hover:text-blue-700 transition-colors">
              <TrendingUp className="w-3 h-3" />
              <span>Improve your score →</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state — CTA */
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-gray-800 text-sm font-medium mb-1">Get your resume scored</p>
          <p className="text-gray-400 text-xs mb-3">AI analysis finds weak spots recruiters notice</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
            Analyze now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      )}
    </Link>
  );
}

export function Dashboard() {
  const documentService = useDocuments();
  const notifications = useNotifications();
  const userService = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadData = useCallback(async () => {
    try {
      const [userDocuments, cp, cachedAnalysis] = await Promise.all([
        documentService.getDocuments(),
        userService.getCandidateProfile(),
        userService.getResumeAnalysis(),
      ]);
      setDocuments(userDocuments);
      setCandidateProfile(cp);
      if (cachedAnalysis) {
        setAnalysisScore(cachedAnalysis.overallScore);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [documentService, userService]);

  useEffect(() => {
    const init = async () => {
      await seedDocumentsIfEmpty(documentService);
      await loadData();
    };
    init();
  }, [documentService, loadData]);

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      await notifications.showSuccess('Document deleted');
      const userDocuments = await documentService.getDocuments();
      setDocuments(userDocuments);
    } catch (err) {
      console.error('Error deleting document:', err);
      await notifications.showError('Failed to delete document');
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
          case 'oldest':
            return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [documents, searchQuery, sortBy]);

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? 'Sort';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavBar />

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Documents</h1>
          <p className="text-gray-600">Manage and organize your interview prep documents</p>
        </div>

        {/* Recently Opened */}
        <RecentlyOpened documents={documents} />

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-8">
          <ProgressChart stats={progressStats} title="Interview Progress" />
          <ResumeScoreWidget candidateProfile={candidateProfile} analysisScore={analysisScore} />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[160px] justify-between border-gray-200 bg-surface text-gray-700"
                >
                  <span className="truncate">{currentSortLabel}</span>
                  <ArrowUpDown className="w-4 h-4 ml-2 flex-shrink-0 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-gray-200 rounded-lg bg-surface">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Link to="/document">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </Link>
          </div>
        </div>

        {/* Documents Grid / List */}
        {filteredDocuments.length === 0 ? (
          documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-surface">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2 text-gray-700">No documents yet</h3>
              <p className="text-sm mb-4 text-gray-500">
                Create your first Q&A document to get started
              </p>
              <Link
                to="/document"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Document
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No documents found</p>
            </div>
          )
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filteredDocuments.map((doc) => (
              <DashboardDocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
