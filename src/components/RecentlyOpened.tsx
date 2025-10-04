import React from 'react';
import { Document } from '../types';

interface RecentlyOpenedProps {
  documents: Document[];
}

const RecentlyOpened: React.FC<RecentlyOpenedProps> = ({ documents }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-600">Recently Opened</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
          >
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 flex-1">
                {doc.title}
              </h3>
            </div>
            <p className="text-xs text-gray-500">{doc.lastModified}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyOpened;

