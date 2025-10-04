import React from 'react';
import { ProgressStats } from '../types';

interface ProgressChartProps {
  stats: ProgressStats;
  title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ stats, title }) => {
  const total = stats.completed + stats.inProgress + stats.scheduled + stats.pending;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Completed (green) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={`${(stats.completed / total) * 251.2} 251.2`}
              strokeLinecap="round"
            />
            {/* In Progress (blue) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={`${(stats.inProgress / total) * 251.2} 251.2`}
              strokeDashoffset={-((stats.completed / total) * 251.2)}
              strokeLinecap="round"
            />
            {/* Scheduled (orange) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeDasharray={`${(stats.scheduled / total) * 251.2} 251.2`}
              strokeDashoffset={-(((stats.completed + stats.inProgress) / total) * 251.2)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 w-full text-center">
          <div>
            <div className="text-xl font-bold text-gray-900">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{stats.inProgress}</div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{stats.scheduled}</div>
            <div className="text-xs text-gray-500">Scheduled</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;

