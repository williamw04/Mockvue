import React from 'react';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  compact?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, compact = false }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
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
      </div>
    </div>
  );
};

export default DocumentCard;

