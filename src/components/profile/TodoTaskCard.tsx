import { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, ChevronDown, ChevronRight, Target } from 'lucide-react';
import type { CoachingTodo } from '../../types';

interface TodoTaskCardProps {
    todo: CoachingTodo;
    onToggle: (todoId: string) => void;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    pending: { icon: Circle, color: 'text-gray-400', label: 'Pending' },
    in_progress: { icon: Clock, color: 'text-blue-500', label: 'In Progress' },
    completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completed' },
    blocked: { icon: AlertCircle, color: 'text-red-500', label: 'Blocked' },
};

export function TodoTaskCard({ todo, onToggle }: TodoTaskCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isCompleted = todo.status === 'completed';
    const config = statusConfig[todo.status] ?? statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <div className={`rounded-lg border transition-colors ${
            isCompleted
                ? 'bg-green-50 border-green-200'
                : 'bg-surface border-gray-200'
        }`}>
            <div className="flex items-center gap-3 px-3 py-2.5">
                <button
                    onClick={() => onToggle(todo.id)}
                    className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
                >
                    {isCompleted
                        ? <CheckCircle className="w-5 h-5" />
                        : <Circle className="w-5 h-5" />
                    }
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {todo.title}
                        </span>
                        {todo.targetType && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full flex-shrink-0">
                                <Target className="w-3 h-3" />
                                {todo.targetType}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                    </span>
                    {todo.description && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>

            {expanded && todo.description && (
                <div className="px-3 pb-2.5 pl-11">
                    <p className="text-xs text-gray-500 whitespace-pre-wrap">{todo.description}</p>
                </div>
            )}
        </div>
    );
}
