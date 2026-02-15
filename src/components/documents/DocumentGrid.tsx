import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Document } from '../../types';
import { DocumentCard } from './DocumentCard';
import { useTheme } from '../../services/ThemeContext';

interface DocumentGridProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentGrid({ documents, onDelete }: DocumentGridProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Documents
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
        </div>
        <Link
          to="/document"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed rounded-lg ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            No documents yet
          </h3>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
