import { useState } from 'react';
import { Check, X, Pencil, ArrowRight, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import type { StagedChange } from '../../types';

interface ChangeProposalCardProps {
    change: StagedChange;
    onAccept: (changeId: string, modification?: string) => void;
    onReject: (changeId: string) => void;
}

export function ChangeProposalCard({ change, onAccept, onReject }: ChangeProposalCardProps) {
    const [selectedAlt, setSelectedAlt] = useState<string | null>(change.selectedAlternativeId ?? null);
    const [showModify, setShowModify] = useState(false);
    const [modification, setModification] = useState('');
    const [expanded, setExpanded] = useState(true);

    if (change.status !== 'pending') return null;

    const selectedAltObj = change.alternatives?.find(a => a.id === selectedAlt);
    const displayValue = selectedAltObj?.value ?? change.proposedValue;

    return (
        <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden shadow-sm">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-900">Proposed Change</span>
                    <span className="text-xs text-gray-400 capitalize">({change.targetType} {change.operation})</span>
                </div>
                {selectedAltObj?.predictedScore != null && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Predicted: {selectedAltObj.predictedScore}/100
                    </span>
                )}
            </button>

            {expanded && (
                <div className="p-4 space-y-3">
                    <div className="space-y-2">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-xs font-medium text-red-600 mb-1">Before</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{change.beforeValue}</p>
                        </div>
                        <div className="flex justify-center">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-xs font-medium text-green-600 mb-1">After</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{displayValue}</p>
                        </div>
                    </div>

                    {change.alternatives && change.alternatives.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Alternatives</p>
                            <div className="space-y-1.5">
                                {change.alternatives.map((alt, i) => (
                                    <button
                                        key={alt.id}
                                        onClick={() => setSelectedAlt(selectedAlt === alt.id ? null : alt.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg border transition-colors ${
                                            selectedAlt === alt.id
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-surface hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                            selectedAlt === alt.id
                                                ? 'border-blue-500 bg-blue-500 text-white'
                                                : 'border-gray-300 text-gray-400'
                                        }`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <span className="flex-1 truncate">{alt.value}</span>
                                        {alt.predictedScore != null && (
                                            <span className="text-xs text-gray-400">{alt.predictedScore}/100</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {change.rationale && (
                        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600 whitespace-pre-wrap">{change.rationale}</p>
                        </div>
                    )}

                    {showModify && (
                        <div>
                            <textarea
                                value={modification}
                                onChange={(e) => setModification(e.target.value)}
                                placeholder="Enter your modified version..."
                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={() => onAccept(change.id, showModify && modification ? modification : undefined)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Accept
                        </button>
                        <button
                            onClick={() => onReject(change.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Reject
                        </button>
                        <button
                            onClick={() => setShowModify(!showModify)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Modify
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
