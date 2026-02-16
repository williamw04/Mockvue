import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import ProgressChart from './ProgressChart';
import { DailyTasks } from './DailyTasks';
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
import { ProgressStats, Document } from '../types';
import { useDocuments, useNotifications } from '../services';
import { seedDocumentsIfEmpty } from '../utils/seedDocuments';
import { Plus, Grid3X3, List, FileText, Search, ArrowUpDown } from 'lucide-react';

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

export function Dashboard() {
  const documentService = useDocuments();
  const notifications = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortValue>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadData = useCallback(async () => {
    try {
      const userDocuments = await documentService.getDocuments();
      setDocuments(userDocuments);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [documentService]);

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-8">
          <ProgressChart stats={progressStats} title="Interview Progress" />
          <DailyTasks />
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
