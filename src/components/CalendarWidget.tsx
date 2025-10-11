import React from 'react';
import { CalendarEvent } from '../types';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  date: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, date }) => {
  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-orange-500';
      case 'success':
        return 'border-green-500';
      case 'info':
      default:
        return 'border-gray-400';
    }
  };

  const getEventDot = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'success':
        return 'bg-green-500';
      case 'info':
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-900">Today's Calendar</h2>
        </div>
        <span className="text-xs font-medium text-gray-500">{date}</span>
      </div>
      
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className={`flex items-start gap-3 pb-3 border-l-2 pl-3 ${getEventColor(event.type)}`}>
            <div className={`w-2 h-2 rounded-full ${getEventDot(event.type)} mt-1.5 -ml-[17px]`}></div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 mb-1">{event.time}</div>
              <div className="text-sm text-gray-900">{event.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;

