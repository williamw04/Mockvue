import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { MoreHorizontal, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Document } from '../types';

interface DashboardDocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

function getPreview(doc: Document): string {
  if (doc.description) return doc.description;
  const firstQ = doc.questions[0];
  if (firstQ?.response) return firstQ.response;
  if (firstQ?.text) return firstQ.text;
  return 'No content yet';
}

function getWordCount(doc: Document): number {
  let text = doc.description || '';
  for (const q of doc.questions) {
    text += ' ' + q.text + ' ' + q.response;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function DashboardDocumentCard({ document, onDelete }: DashboardDocumentCardProps) {
  const preview = getPreview(document);
  const wordCount = getWordCount(document);
  const lastModified = formatDate(document.lastModified);

  return (
    <Card className="group hover:shadow-md transition-shadow bg-surface border-gray-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <Link
          to={`/document/${document.id}`}
          className="flex items-center space-x-2 flex-1 min-w-0"
        >
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <h3 className="truncate font-semibold text-gray-900">{document.title}</h3>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 rounded-md hover:bg-gray-100 inline-flex items-center justify-center">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/document/${document.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('Are you sure you want to delete this document?')) {
                  onDelete(document.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to={`/document/${document.id}`} className="block">
          <p className="text-gray-500 line-clamp-3 leading-relaxed text-sm">{preview}</p>
        </Link>
        <div className="flex flex-wrap gap-1">
          {document.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-700 border-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-400">{lastModified}</span>
          <span className="text-sm text-gray-400">{wordCount} words</span>
        </div>
      </CardContent>
    </Card>
  );
}
