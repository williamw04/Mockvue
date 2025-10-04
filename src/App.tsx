import React, { useEffect } from 'react';
import RecentlyOpened from './components/RecentlyOpened';
import ProgressChart from './components/ProgressChart';
import CalendarWidget from './components/CalendarWidget';
import DocumentGrid from './components/DocumentGrid';
import { Document, CalendarEvent, ProgressStats } from './types';
import { useElectron } from './hooks/useElectron';

// Mock data
const recentDocuments: Document[] = [
  { id: '1', title: 'Project Planning Meeting', description: '', tags: [], wordCount: 0, lastModified: '2 hours ago' },
  { id: '2', title: 'Weekend Recipe Ideas', description: '', tags: [], wordCount: 0, lastModified: '1 day ago' },
  { id: '3', title: 'Book Club Discussion: The Library', description: '', tags: [], wordCount: 0, lastModified: '3 days ago' },
  { id: '4', title: 'Travel Itinerary - Japan', description: '', tags: [], wordCount: 0, lastModified: '1 week ago' },
  { id: '5', title: 'Learning Notes: React', description: '', tags: [], wordCount: 0, lastModified: '1 week ago' },
  { id: '6', title: 'Garden Planning for Spring', description: '', tags: [], wordCount: 0, lastModified: '2 weeks ago' },
];

const progressStats: ProgressStats = {
  completed: 24,
  inProgress: 8,
  scheduled: 12,
  pending: 6,
};

const calendarEvents: CalendarEvent[] = [
  { id: '1', time: '9:00 AM', title: 'User interview with Sarah M.', type: 'error' },
  { id: '2', time: '11:00 AM', title: 'Review interview transcripts', type: 'info' },
  { id: '3', time: '2:00 PM', title: 'Update research findings', type: 'warning' },
  { id: '4', time: '3:30 PM', title: "Schedule next week's interviews", type: 'warning' },
  { id: '5', time: '4:30 PM', title: 'Prepare PM interview questions', type: 'success' },
];

const allDocuments: Document[] = [
  {
    id: 'd1',
    title: 'Project Planning Meeting',
    description: 'Discussed the upcoming product launch timeline and key milestones. The team agreed on...',
    tags: ['work', 'meetings', 'planning'],
    wordCount: 1247,
    lastModified: '2 hours ago',
  },
  {
    id: 'd2',
    title: 'Weekend Recipe Ideas',
    description: 'Collecting some delicious recipes to try this weekend. Found an interesting pasta...',
    tags: ['personal', 'cooking', 'recipes'],
    wordCount: 892,
    lastModified: '1 day ago',
  },
  {
    id: 'd3',
    title: 'Book Club Discussion: The Library',
    description: "Notes from our book club discussion about Matt Haig's 'The Midnight Library'. Key...",
    tags: ['books', 'discussion', 'philosophy'],
    wordCount: 1560,
    lastModified: '3 days ago',
  },
  {
    id: 'd4',
    title: 'Travel Itinerary - Japan',
    description: 'Planning our two-week trip to Japan in the spring. Day 1-3: Tokyo (Shibuya,...',
    tags: ['travel', 'japan', 'itinerary'],
    wordCount: 2134,
    lastModified: '1 week ago',
  },
  {
    id: 'd5',
    title: 'Learning Notes: React',
    description: 'Deep dive into React hooks and their use cases, useState for state management, useEffect...',
    tags: ['programming', 'react', 'learning'],
    wordCount: 587,
    lastModified: '1 week ago',
  },
  {
    id: 'd6',
    title: 'Garden Planning for Spring',
    description: 'Ideas for the spring garden layout. Want to plant tomatoes, basil, and peppers in the sunny...',
    tags: ['gardening', 'planning', 'spring'],
    wordCount: 743,
    lastModified: '2 weeks ago',
  },
];

const App: React.FC = () => {
  const totalWords = allDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
  const { isElectron } = useElectron();

  useEffect(() => {
    if (isElectron) {
      console.log('Running in Electron!');
      // TODO: Load real data from Electron API
      // const documents = await window.electronAPI?.getDocuments();
    } else {
      console.log('Running in browser');
    }
  }, [isElectron]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Recently Opened */}
        <RecentlyOpened documents={recentDocuments} />

        {/* Progress and Calendar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ProgressChart stats={progressStats} title="Interview Progress" />
          <CalendarWidget events={calendarEvents} date="1/5" />
        </div>

        {/* Documents Grid */}
        <DocumentGrid documents={allDocuments} totalWords={totalWords} />
      </div>
    </div>
  );
};

export default App;

