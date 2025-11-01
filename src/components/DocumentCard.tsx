import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  compact?: boolean;
  onDelete?: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, compact = false, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on menu button
    if ((e.target as HTMLElement).closest('.menu-button')) {
      return;
    }
    navigate(`/document/${document.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Delete "${document.title}"?`)) {
      onDelete(document.id);
    }
    setShowMenu(false);
  };

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 relative group"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
            {document.title}
          </h3>
          {!compact && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {document.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{document.lastModified}</span>
            <span>{document.wordCount} words</span>
          </div>
        </div>
        
        {/* Menu button - visible on hover */}
        {onDelete && (
          <div className="relative menu-button">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;

