import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Document } from '../../types';
import { DocumentCard } from './DocumentCard';

interface DocumentGridProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentGrid({ documents, onDelete }: DocumentGridProps) {
  return (
    <div className="rounded-2xl p-6 shadow-lg bg-surface">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Documents
            </h2>
            <p className="text-sm text-gray-600">
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
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            No documents yet
          </h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
