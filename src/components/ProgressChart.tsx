import React from 'react';
import { ProgressStats } from '../types';
import { Card, CardContent } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Progress } from './ui/progress';

interface ProgressChartProps {
  stats: ProgressStats;
  title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ stats, title }) => {
  const chartData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
    { name: 'Scheduled', value: stats.scheduled, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#d1d5db' }
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const completedPercentage = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
  
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">Track your progress</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{completedPercentage}%</div>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                    paddingAngle={1}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.completed}</div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {chartData.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 hover:scale-125" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Overall Progress</span>
            <span className="text-sm font-medium">{stats.completed}/{total}</span>
          </div>
          <Progress value={completedPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;

