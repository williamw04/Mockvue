import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Document } from '../types';
import DocumentCard from './DocumentCard';
import { useTheme } from '../services/ThemeContext';

interface DocumentGridProps {
  documents: Document[];
  totalWords: number;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  onSearchClick?: () => void;
}

type SortOption = 'recent' | 'alphabetical' | 'wordCount';

const DocumentGrid: React.FC<DocumentGridProps> = ({ 
  documents, 
  totalWords,
  onDelete,
  onRefresh,
  onSearchClick,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Sort documents based on selected option
  const sortedDocuments = useMemo(() => {
    const docs = [...documents];
    
    switch (sortBy) {
      case 'alphabetical':
        return docs.sort((a, b) => a.title.localeCompare(b.title));
      case 'wordCount':
        return docs.sort((a, b) => b.wordCount - a.wordCount);
      case 'recent':
      default:
        return docs; // Already sorted by recent in Dashboard
    }
  }, [documents, sortBy]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };

  const handleDocumentClick = (id: string) => {
    navigate(`/document/${id}`);
  };

  return (
    <>
      <div className={`rounded-lg p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Documents</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {documents.length} documents • {totalWords.toLocaleString()} total words
            </p>
          </div>
          <Link to="/document">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Document
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              onClick={onSearchClick}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-colors flex items-center justify-between cursor-text ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>Search documents...</span>
              <div className="flex items-center gap-1">
                <kbd className={`hidden sm:inline-flex items-center h-5 px-1.5 text-[10px] font-medium rounded border ${
                  theme === 'dark' 
                    ? 'bg-gray-900 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="recent">Most Recent</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="wordCount">Word Count</option>
            </select>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className={`p-2 border rounded-lg transition-colors ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-white text-gray-600'}`}
                title="Refresh documents"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {sortedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">
              No documents yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDocuments.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                id={doc.id}
                title={doc.title}
                preview={doc.description || (doc.content ? doc.content.substring(0, 100) + '...' : '')} 
                lastModified={doc.lastModified}
                tags={doc.tags}
                wordCount={doc.wordCount}
                onClick={() => handleDocumentClick(doc.id)}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentGrid;
