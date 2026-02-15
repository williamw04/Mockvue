import { Link } from 'react-router-dom';
import { FileText, Calendar, Trash2 } from 'lucide-react';
import { Document } from '../../types';
import { useTheme } from '../../services/ThemeContext';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { theme } = useTheme();
  
  const questionCount = document.questions.length;
  const answeredCount = document.questions.filter(q => q.response.trim().length > 0).length;
  
  const formatDate = (dateString: string) => {
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
  };

  return (
    <div className={`rounded-lg border transition-all hover:shadow-md ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <Link to={`/document/${document.id}`} className="block p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              {document.title}
            </h3>
          </div>
        </div>
        
        {document.description && (
          <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {document.description}
          </p>
        )}

        <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          <div className="flex items-center gap-4">
            <span>{questionCount} questions</span>
            <span>
              {answeredCount}/{questionCount} answered
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(document.lastModified)}
          </div>
        </div>
      </Link>
      
      <div className={`border-t px-4 py-2 flex justify-end ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this document?')) {
              onDelete(document.id);
            }
          }}
          className={`p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
