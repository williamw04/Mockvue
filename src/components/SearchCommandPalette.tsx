import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Clock, ArrowRight } from 'lucide-react';
import { Document } from '../types';
import { useTheme } from '../services/ThemeContext';
import { useStorage } from '../services';

interface SearchCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchCommandPalette: React.FC<SearchCommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const storage = useStorage();

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await storage.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents for search', error);
      }
    };
    
    if (isOpen) {
      fetchDocs();
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, storage]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter documents
  const filteredDocs = useMemo(() => {
    if (!query.trim()) return documents.slice(0, 5); // Show recent 5 if empty

    const lowerQuery = query.toLowerCase();
    return documents.filter(doc => {
      // Simple fuzzy-like scoring could go here, but includes is safe for now
      // We search title, tags, and description
      const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
      const tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const descMatch = doc.description?.toLowerCase().includes(lowerQuery);
      
      return titleMatch || tagMatch || descMatch;
    }).slice(0, 10); // Limit results
  }, [documents, query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredDocs.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredDocs.length) % filteredDocs.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredDocs[selectedIndex]) {
            handleSelect(filteredDocs[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredDocs, selectedIndex]);

  const handleSelect = (id: string) => {
    navigate(`/document/${id}`);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all transform animate-in fade-in zoom-in-95 duration-200 
        ${theme === 'dark' 
          ? 'bg-gray-900/85 border border-gray-700/50 text-white' 
          : 'bg-white/85 border border-gray-200/50 text-gray-900'
        } backdrop-blur-md`}
      >
        {/* Search Input */}
        <div className={`flex items-center px-4 py-4 border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <Search className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-500"
          />
          <div className="flex items-center gap-2">
            <kbd className={`hidden sm:inline-flex items-center h-5 px-2 text-[10px] font-medium rounded border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-gray-400' 
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}>
              ESC
            </kbd>
            <button onClick={onClose} className={`p-1 rounded-md hover:bg-gray-500/10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, index) => (
              <div
                key={doc.id}
                onClick={() => handleSelect(doc.id)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-3 mx-2 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${
                  index === selectedIndex 
                    ? (theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50') 
                    : 'transparent'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${
                    index === selectedIndex 
                      ? (theme === 'dark' ? 'bg-blue-600/30 text-blue-200' : 'bg-blue-100 text-blue-700')
                      : (theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-medium truncate ${
                      index === selectedIndex && theme === 'dark' ? 'text-blue-100' : ''
                    }`}>
                      {doc.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate max-w-[200px]">{doc.description || 'No description'}</span>
                      {doc.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">{doc.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {index === selectedIndex && (
                  <ArrowRight className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-600'}`} />
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              {query ? 'No results found.' : 'Start typing to search...'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-2 border-t text-xs flex items-center justify-between ${
          theme === 'dark' 
            ? 'border-gray-700/50 bg-gray-900/50 text-gray-500' 
            : 'border-gray-200/50 bg-gray-50/50 text-gray-500'
        }`}>
          <div className="flex gap-4">
            <span><strong className="font-medium">↑↓</strong> to navigate</span>
            <span><strong className="font-medium">↵</strong> to select</span>
          </div>
          <div>
            {filteredDocs.length} documents
          </div>
        </div>
      </div>
    </div>
  );
};

