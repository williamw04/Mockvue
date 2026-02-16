import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Clock, FileText, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Document } from '../types';

interface RecentlyOpenedProps {
  documents: Document[];
}

function formatRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecentlyOpened({ documents }: RecentlyOpenedProps) {
  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 7);

  if (recentDocs.length === 0) return null;

  return (
    <div className="mb-8 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Recently Opened</h2>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link to="/document">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {recentDocs.map((doc) => (
          <Link key={doc.id} to={`/document/${doc.id}`}>
            <Card className="w-[160px] h-[160px] flex-shrink-0 hover:shadow-md transition-shadow bg-surface border-gray-200">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start gap-2 mb-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="truncate text-sm font-semibold text-gray-900 mb-4">
                    {doc.title}
                  </h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">
                      {formatRelative(doc.lastModified)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFullDate(doc.lastModified)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
