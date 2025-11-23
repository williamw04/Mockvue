import React, { useEffect, useState } from 'react';
import { ProgressStats } from '../types';
import { useTheme } from '../services/ThemeContext';

interface ProgressChartProps {
  stats: ProgressStats;
  title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ stats, title }) => {
  const { theme } = useTheme();
  const [animatedStats, setAnimatedStats] = useState<ProgressStats>({
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    pending: 0,
  });

  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      // Ease out cubic function for smoother animation
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        completed: Math.round(stats.completed * ease),
        inProgress: Math.round(stats.inProgress * ease),
        scheduled: Math.round(stats.scheduled * ease),
        pending: Math.round(stats.pending * ease),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  // Use the real stats for the total to keep the scale consistent
  const total = stats.completed + stats.inProgress + stats.scheduled + stats.pending;
  
  // Calculate percentages for the side display
  const completedPercentage = total > 0 ? Math.round((stats.completed / total) * 100) : 0;

  return (
    <div className={`rounded-lg p-6 shadow-sm border h-full transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Complete your interview targets</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{completedPercentage}%</div>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
              strokeWidth="12"
            />
            {/* Completed (green) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${(animatedStats.completed / total) * 251.2} 251.2`}
              strokeLinecap="round"
              className="transition-all duration-75" 
            />
            {/* In Progress (orange) - Note: changed to orange to match screenshot */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray={`${(animatedStats.inProgress / total) * 251.2} 251.2`}
              strokeDashoffset={-((animatedStats.completed / total) * 251.2)}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
            {/* Scheduled (blue) - Note: changed to blue to match screenshot */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="12"
              strokeDasharray={`${(animatedStats.scheduled / total) * 251.2} 251.2`}
              strokeDashoffset={-(((animatedStats.completed + animatedStats.inProgress) / total) * 251.2)}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-3xl font-bold transition-all duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {animatedStats.completed}
            </div>
            <div className="text-xs text-gray-500 font-medium">Done</div>
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
            </div>
            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.completed}</div>
          </div>
          
          <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>In Progress</span>
            </div>
            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.inProgress}</div>
          </div>
          
          <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Scheduled</span>
            </div>
            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.scheduled}</div>
          </div>
          
          <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pending</span>
            </div>
            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</div>
          </div>
        </div>
      </div>

      <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-50'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">Overall Progress</span>
          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.completed}/{total}</span>
        </div>
        <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${theme === 'dark' ? 'bg-white' : 'bg-gray-900'}`}
            style={{ width: `${completedPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
