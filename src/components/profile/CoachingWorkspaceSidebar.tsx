import { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown,
    ChevronRight,
    TrendingUp,
    Target,
    CheckSquare,
    Shield,
    History,
    User,
    Plus,
    Circle,
    CheckCircle,
    Clock,
    AlertCircle,
    Save,
    RotateCcw,
} from 'lucide-react';
import type {
    CoachingSessionData,
    CoachingTodo,
    TodoStatus,
    ResumeVersion,
} from '../../types';

interface CoachingWorkspaceSidebarProps {
    sessionData: CoachingSessionData | null;
    onUpdateTodo: (todoId: string, updates: Partial<CoachingTodo>) => void;
    onCreateVersion: (label: string) => void;
}

function CollapsibleSection({
    title,
    icon: Icon,
    badge,
    children,
    defaultOpen = false,
}: {
    title: string;
    icon: React.ElementType;
    badge?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{title}</span>
                </div>
                {badge}
            </button>
            {open && <div className="px-4 pb-3">{children}</div>}
        </div>
    );
}

function GoalProgressBar({ progress, currentValue, targetValue, targetMetric }: {
    progress: number;
    currentValue?: number;
    targetValue?: number;
    targetMetric?: string;
}) {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const barColor = clampedProgress >= 80 ? 'bg-green-500' : clampedProgress >= 40 ? 'bg-blue-500' : 'bg-gray-300';

    return (
        <div>
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-1">
                <div
                    className={`${barColor} transition-all`}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{clampedProgress}%</span>
                {currentValue != null && targetValue != null && targetMetric && (
                    <span>{currentValue}/{targetValue} {targetMetric}</span>
                )}
            </div>
        </div>
    );
}

const todoStatusIcon: Record<TodoStatus, React.ElementType> = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle,
    blocked: AlertCircle,
};

const todoStatusColor: Record<TodoStatus, string> = {
    pending: 'text-gray-400',
    in_progress: 'text-blue-500',
    completed: 'text-green-500',
    blocked: 'text-red-500',
};

function VersionItem({ version, onRestore }: { version: ResumeVersion; onRestore?: (version: ResumeVersion) => void }) {
    return (
        <div className="flex items-center justify-between py-1.5 group">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-gray-900 font-medium truncate">{version.label}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(version.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs font-medium text-gray-500">{version.score}/100</span>
                {onRestore && (
                    <button
                        onClick={() => onRestore(version)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Restore this version"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function CoachingWorkspaceSidebar({ sessionData, onUpdateTodo, onCreateVersion }: CoachingWorkspaceSidebarProps) {
    const [data, setData] = useState<CoachingSessionData | null>(sessionData);
    const [newVersionLabel, setNewVersionLabel] = useState('');
    const [showVersionInput, setShowVersionInput] = useState(false);

    useEffect(() => {
        setData(sessionData);
    }, [sessionData]);

    const handleTodoToggle = useCallback((todoId: string) => {
        if (!data) return;
        const todo = data.todos.find(t => t.id === todoId);
        if (!todo) return;

        const newStatus: TodoStatus = todo.status === 'completed' ? 'pending' : 'completed';
        const updates: Partial<CoachingTodo> = {
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        };

        onUpdateTodo(todoId, updates);
        setData(prev => prev ? {
            ...prev,
            todos: prev.todos.map(t => t.id === todoId ? { ...t, ...updates } : t),
        } : prev);
    }, [data, onUpdateTodo]);

    const handleCreateVersion = useCallback(() => {
        if (!newVersionLabel.trim()) return;
        onCreateVersion(newVersionLabel.trim());
        setNewVersionLabel('');
        setShowVersionInput(false);
    }, [newVersionLabel, onCreateVersion]);

    const pendingChangesCount = data?.stagedChanges.filter(c => c.status === 'pending').length ?? 0;
    const completedTodos = data?.todos.filter(t => t.status === 'completed').length ?? 0;
    const totalTodos = data?.todos.length ?? 0;

    return (
        <div className="flex flex-col h-full rounded-2xl bg-surface shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Coaching Workspace</h3>
                <p className="text-xs text-gray-500">Goals, tasks, and progress</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {!data ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Target className="w-8 h-8 mb-2" />
                        <p className="text-sm">No active session</p>
                    </div>
                ) : (
                    <>
                        <CollapsibleSection title="User Profile" icon={User} defaultOpen={true}>
                            <div className="space-y-2">
                                {data.userProfile.targetRole && (
                                    <div className="text-xs">
                                        <span className="text-gray-500">Target Role:</span>{' '}
                                        <span className="text-gray-900 font-medium">{data.userProfile.targetRole}</span>
                                    </div>
                                )}
                                {data.userProfile.targetIndustry && (
                                    <div className="text-xs">
                                        <span className="text-gray-500">Industry:</span>{' '}
                                        <span className="text-gray-900 font-medium">{data.userProfile.targetIndustry}</span>
                                    </div>
                                )}
                                {data.userProfile.personalBrand && (
                                    <div className="text-xs">
                                        <span className="text-gray-500">Personal Brand:</span>{' '}
                                        <span className="text-gray-700 whitespace-pre-wrap">{data.userProfile.personalBrand}</span>
                                    </div>
                                )}
                                {data.userProfile.knownStrengths.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {data.userProfile.knownStrengths.slice(0, 6).map((s, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Diagnosis" icon={TrendingUp} defaultOpen={true}>
                            <div className="space-y-3">
                                {data.versions.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Current Score:</span>
                                        <span className={`text-lg font-bold ${
                                            data.versions[0].score >= 70 ? 'text-green-600' :
                                            data.versions[0].score >= 40 ? 'text-amber-600' :
                                            'text-red-600'
                                        }`}>
                                            {data.versions[0].score}/100
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <div className="text-xs text-gray-500">
                                        {data.goals.filter(g => g.status === 'completed').length}/{data.goals.length} goals completed
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {completedTodos}/{totalTodos} todos done
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {data.stagedChanges.filter(c => c.status === 'accepted').length} changes applied
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Goals" icon={Target} defaultOpen={true}>
                            <div className="space-y-3">
                                {data.goals.length === 0 && (
                                    <p className="text-xs text-gray-400">No goals set yet.</p>
                                )}
                                {data.goals.map(goal => (
                                    <div key={goal.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-medium ${goal.status === 'completed' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {goal.title}
                                            </span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                goal.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                goal.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                                                goal.status === 'abandoned' ? 'bg-gray-100 text-gray-400' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {goal.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <GoalProgressBar
                                            progress={goal.progress}
                                            currentValue={goal.currentValue}
                                            targetValue={goal.targetValue}
                                            targetMetric={goal.targetMetric}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Todos"
                            icon={CheckSquare}
                            badge={totalTodos > 0 ? (
                                <span className="text-xs text-gray-400">{completedTodos}/{totalTodos}</span>
                            ) : undefined}
                        >
                            <div className="space-y-1.5">
                                {data.todos.length === 0 && (
                                    <p className="text-xs text-gray-400">No tasks yet.</p>
                                )}
                                {data.todos.map(todo => {
                                    const StatusIcon = todoStatusIcon[todo.status];
                                    const color = todoStatusColor[todo.status];
                                    const isCompleted = todo.status === 'completed';

                                    return (
                                        <div key={todo.id} className="flex items-center gap-2 py-1">
                                            <button
                                                onClick={() => handleTodoToggle(todo.id)}
                                                className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
                                            >
                                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                            </button>
                                            <span className={`flex-1 text-xs truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {todo.title}
                                            </span>
                                            <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Candidate Strengths"
                            icon={Shield}
                            badge={pendingChangesCount > 0 ? (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                    {pendingChangesCount} pending
                                </span>
                            ) : undefined}
                        >
                            {data.userProfile.knownStrengths.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {data.userProfile.knownStrengths.map((strength, i) => (
                                        <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                            {strength}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">No strengths identified yet.</p>
                            )}
                            {data.userProfile.knownWeaknesses.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Areas to Improve</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.userProfile.knownWeaknesses.map((w, i) => (
                                            <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CollapsibleSection>

                        <CollapsibleSection title="Version History" icon={History}>
                            <div className="space-y-0.5">
                                {data.versions.length === 0 && (
                                    <p className="text-xs text-gray-400">No versions saved.</p>
                                )}
                                {data.versions.map(v => (
                                    <VersionItem key={v.id} version={v} />
                                ))}
                            </div>
                            {showVersionInput ? (
                                <div className="mt-2 flex items-center gap-1.5">
                                    <input
                                        type="text"
                                        value={newVersionLabel}
                                        onChange={(e) => setNewVersionLabel(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateVersion(); }}
                                        placeholder="Version label..."
                                        className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCreateVersion}
                                        disabled={!newVersionLabel.trim()}
                                        className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors"
                                    >
                                        <Save className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowVersionInput(true)}
                                    className="mt-2 flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    Save Version
                                </button>
                            )}
                        </CollapsibleSection>
                    </>
                )}
            </div>
        </div>
    );
}
