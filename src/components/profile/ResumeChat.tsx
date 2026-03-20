import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgent } from '../../services';
import { Send, Loader2, Bot, User, Sparkles, Plus, MessageSquare, ChevronDown, ChevronRight, Wrench, Pencil, Trash2, Copy, FolderOpen, Check, AlertCircle, Square, Undo2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AgentSession, ChatMessage, ResumeAnalysis, AgentTurnTrace, Resume, AgentStep } from '../../types';

interface ChatMessageWithTrace extends ChatMessage {
    trace?: AgentTurnTrace;
}

interface ResumeChatProps {
    analysisContext: ResumeAnalysis | null;
    resumeContext: Resume | null;
    onSessionChange?: (session: AgentSession | null, analysisSnapshot: ResumeAnalysis | null) => void;
}

const suggestedQuestions = [
    'How can I improve my weakest bullet?',
    'What story should I prepare for trigger point #1?',
    'Rewrite my lowest-scored bullet with stronger impact verbs.',
    'What questions might an interviewer ask about my experience?',
];

function TraceViewer({ trace }: { trace: AgentTurnTrace }) {
    const [expanded, setExpanded] = useState(false);

    if (trace.steps.length === 0) return null;

    return (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xs text-gray-600"
            >
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <Wrench className="w-3 h-3" />
                <span>{trace.totalToolCalls} tool call{trace.totalToolCalls !== 1 ? 's' : ''}</span>
            </button>
            {expanded && (
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                    {trace.steps.map((step, i) => (
                        <div key={step.id || i} className="text-xs">
                            {step.kind === 'tool_call' && (
                                <div className="flex items-center gap-1 text-blue-600">
                                    <Wrench className="w-3 h-3" />
                                    <span className="font-mono">{step.toolName}</span>
                                    {step.toolArgs && Object.keys(step.toolArgs).length > 0 && (
                                        <span className="text-gray-400">
                                            ({JSON.stringify(step.toolArgs).slice(0, 30)}...)
                                        </span>
                                    )}
                                </div>
                            )}
                            {step.kind === 'tool_result' && (
                                <div className="ml-4 text-gray-500">
                                    {step.toolError ? (
                                        <span className="text-red-500">Error: {step.toolError}</span>
                                    ) : (
                                        <span>✓ {Array.isArray(step.toolResult) ? `${step.toolResult.length} results` : 'success'}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StreamingTimeline({ steps }: { steps: AgentStep[] }) {
    if (steps.length === 0) return null;

    return (
        <div className="mb-3 border-l-2 border-blue-200 pl-3 space-y-2">
            {steps.map((step, i) => (
                <div key={step.id || i} className="relative">
                    {step.kind === 'tool_call' && (
                        <div className="flex items-center gap-2">
                            <div className="absolute -left-[17px] w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                            <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                <Wrench className="w-3 h-3" />
                                <span className="font-mono font-medium">{step.toolName}</span>
                                <Loader2 className="w-3 h-3 animate-spin" />
                            </div>
                        </div>
                    )}
                    {step.kind === 'tool_result' && (
                        <div className="flex items-center gap-2 ml-2">
                            <div className="absolute -left-[17px] w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                                {step.toolError ? (
                                    <>
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="text-red-600">Error: {step.toolError}</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3 h-3" />
                                        <span>{Array.isArray(step.toolResult) ? `${step.toolResult.length} results` : 'Complete'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textRef = useRef(text);
    const indexRef = useRef(0);

    useEffect(() => {
        textRef.current = text;
        setIsTyping(true);
    }, [text]);

    useEffect(() => {
        if (!isTyping) return;

        const interval = setInterval(() => {
            if (indexRef.current < textRef.current.length) {
                const chunkSize = Math.min(3, textRef.current.length - indexRef.current);
                setDisplayedText(textRef.current.substring(0, indexRef.current + chunkSize));
                indexRef.current += chunkSize;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [isTyping, speed]);

    useEffect(() => {
        if (text.length > displayedText.length && !isTyping) {
            indexRef.current = displayedText.length;
            setIsTyping(true);
        }
    }, [text, displayedText, isTyping]);

    return <>{displayedText}</>;
}

export function ResumeChat({ analysisContext, resumeContext, onSessionChange }: ResumeChatProps) {
    const agentService = useAgent();
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    const [messages, setMessages] = useState<ChatMessageWithTrace[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [session, setSession] = useState<AgentSession | null>(null);
    const [sessionAnalysis, setSessionAnalysis] = useState<ResumeAnalysis | null>(null);
    const [recentSessions, setRecentSessions] = useState<AgentSession[]>([]);
    const [showSessionPicker, setShowSessionPicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [streamingText, setStreamingText] = useState('');
    const [streamingSteps, setStreamingSteps] = useState<AgentStep[]>([]);
    const [cancelled, setCancelled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);
    const currentSessionIdRef = useRef<string | null>(null);

    useEffect(() => {
        currentSessionIdRef.current = session?.id || null;
    }, [session?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingText]);

    useEffect(() => {
        if (!analysisContext) return;

        let cancelled = false;

        const loadOrCreateSession = async () => {
            try {
                setLoading(true);
                const sessions = await agentService.listAssistantSessions('resume-assistant');

                if (!cancelled) {
                    const sortedSessions = sessions.sort((a, b) => 
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    );
                    setRecentSessions(sortedSessions);

                    if (sortedSessions.length > 0 && sortedSessions[0].status === 'active') {
                        const recentSession = sortedSessions[0];
                        const sessionMessages = await agentService.getSessionMessages(recentSession.id);
                        setSession(recentSession);
                        setSessionAnalysis(recentSession.resumeAnalysisSnapshot as ResumeAnalysis | null);
                        setMessages(sessionMessages.map(msg => ({
                            id: msg.id,
                            role: msg.role,
                            content: msg.content,
                            timestamp: msg.timestamp,
                        })));
                    } else {
                        await createNewSession();
                    }
                }
            } catch (error) {
                console.error('Failed to load sessions:', error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadOrCreateSession();

        return () => {
            cancelled = true;
        };
    }, [analysisContext, agentService]);

    useEffect(() => {
        if (envApiKey) {
            agentService.setAgentApiKey(envApiKey);
        }
    }, [envApiKey, agentService]);

    useEffect(() => {
        if (editingSessionId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingSessionId]);

    useEffect(() => {
        onSessionChange?.(session, sessionAnalysis);
    }, [session, sessionAnalysis, onSessionChange]);

    useEffect(() => {
        if (!window.electronAPI?.onAgentChunk || !window.electronAPI?.onAgentStep) return;

        const unsubscribeChunk = window.electronAPI.onAgentChunk((sessionId, text) => {
            if (sessionId === currentSessionIdRef.current) {
                setStreamingText(prev => prev + text);
            }
        });

        const unsubscribeStep = window.electronAPI.onAgentStep((sessionId, step) => {
            if (sessionId === currentSessionIdRef.current) {
                setStreamingSteps(prev => [...prev, step]);
            }
        });

        return () => {
            unsubscribeChunk();
            unsubscribeStep();
        };
    }, []);

    const createNewSession = useCallback(async (forkFrom?: AgentSession) => {
        if (!analysisContext) return;

        try {
            const newSession = await agentService.createAssistantSession({
                assistantId: 'resume-assistant',
                title: 'New Chat',
                resumeAnalysisSnapshot: forkFrom?.resumeAnalysisSnapshot || analysisContext,
                resumeSnapshot: forkFrom?.resumeSnapshot || resumeContext || undefined,
                forkFromSessionId: forkFrom?.id,
            });
            setSession(newSession);
            setSessionAnalysis((forkFrom?.resumeAnalysisSnapshot as ResumeAnalysis | null) || analysisContext);
            setMessages([]);
            setShowSessionPicker(false);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    }, [analysisContext, resumeContext, agentService]);

    const resumeSession = useCallback(async (existingSession: AgentSession) => {
        try {
            const sessionMessages = await agentService.getSessionMessages(existingSession.id);
            setSession(existingSession);
            setSessionAnalysis(existingSession.resumeAnalysisSnapshot as ResumeAnalysis | null);
            setMessages(sessionMessages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
            })));
            setShowSessionPicker(false);
        } catch (error) {
            console.error('Failed to resume session:', error);
        }
    }, [agentService]);

    const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
        try {
            const updated = await agentService.renameAssistantSession(sessionId, newTitle);
            if (updated) {
                setRecentSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
                if (session?.id === sessionId) {
                    setSession(updated);
                }
            }
            setEditingSessionId(null);
        } catch (error) {
            console.error('Failed to rename session:', error);
        }
    }, [agentService, session]);

    const deleteSession = useCallback(async (sessionId: string) => {
        try {
            const deleted = await agentService.deleteAssistantSession(sessionId);
            if (deleted) {
                const newSessions = recentSessions.filter(s => s.id !== sessionId);
                setRecentSessions(newSessions);
                
                if (session?.id === sessionId) {
                    if (newSessions.length > 0) {
                        await resumeSession(newSessions[0]);
                    } else {
                        await createNewSession();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    }, [agentService, recentSessions, session, resumeSession, createNewSession]);

    const forkSession = useCallback(async (sourceSession: AgentSession) => {
        await createNewSession(sourceSession);
    }, [createNewSession]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || !sessionAnalysis || !session) return;

        const userMsg: ChatMessageWithTrace = {
            id: crypto.randomUUID(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);
        setStreamingText('');
        setStreamingSteps([]);
        setCancelled(false);

        try {
            const turnResult = await agentService.runAssistantTurn({
                sessionId: session.id,
                message: text.trim(),
                includeMemory: true,
            });

            if (!cancelled) {
                setSession(turnResult.session);

                const aiMsg: ChatMessageWithTrace = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: turnResult.reply,
                    timestamp: new Date().toISOString(),
                    trace: turnResult.trace,
                };

                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (err) {
            if (!cancelled) {
                const errorMsg: ChatMessageWithTrace = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } finally {
            setSending(false);
            setStreamingText('');
            setStreamingSteps([]);
            inputRef.current?.focus();
        }
    }, [sessionAnalysis, session, agentService, cancelled]);

    const handleStop = useCallback(() => {
        setCancelled(true);
        setSending(false);
        
        if (streamingText) {
            const partialMsg: ChatMessageWithTrace = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: streamingText + '\n\n_[Stopped]_',
                timestamp: new Date().toISOString(),
                trace: { steps: streamingSteps, totalToolCalls: streamingSteps.filter(s => s.kind === 'tool_call').length },
            };
            setMessages(prev => [...prev, partialMsg]);
        }
        
        setStreamingText('');
        setStreamingSteps([]);
    }, [streamingText, streamingSteps]);

    const handleUndo = useCallback((messageIndex: number) => {
        setMessages(prev => prev.slice(0, messageIndex));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) {
            handleStop();
        } else {
            sendMessage(input);
        }
    };

    const handleRenameSubmit = (sessionId: string) => {
        if (editTitle.trim()) {
            renameSession(sessionId, editTitle.trim());
        }
        setEditingSessionId(null);
    };

    const disabled = !sessionAnalysis || !session || loading;

    if (loading && analysisContext) {
        return (
            <div className="flex flex-col h-full rounded-2xl bg-surface shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full rounded-2xl bg-surface shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Resume Coach</h3>
                            <p className="text-xs text-gray-500">
                                {session ? `${session.messageCount} messages` : 'Ask about your resume analysis'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSessionPicker(!showSessionPicker)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Session options"
                    >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Chats</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {showSessionPicker && (
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Recent Chats</span>
                        <button
                            onClick={() => setShowSessionPicker(false)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Close
                        </button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {recentSessions.map(s => (
                            <div key={s.id} className="relative">
                                {editingSessionId === s.id ? (
                                    <form 
                                        onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(s.id); }}
                                        className="flex items-center gap-1 px-2 py-1"
                                    >
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onBlur={() => handleRenameSubmit(s.id)}
                                            className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </form>
                                ) : (
                                    <div 
                                        className={`group flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                                            s.id === session?.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                        onClick={() => resumeSession(s)}
                                    >
                                        <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate flex-1">{s.title}</span>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingSessionId(s.id); setEditTitle(s.title); }}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Rename"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); forkSession(s); }}
                                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                                title="Duplicate"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => createNewSession()}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                            <span>New Chat</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.length === 0 && !showSessionPicker && !sending && (
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-600">
                                {disabled
                                    ? 'Run the analysis first, then ask me anything about your resume.'
                                    : 'Ask me anything about your resume analysis — I can help with rewrites, interview prep, and strategy.'}
                            </p>
                        </div>

                        {!disabled && (
                            <div className="space-y-2 pl-8">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Try asking:</p>
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="block w-full text-left px-3 py-2 text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-gray-100"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={msg.id} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                            {msg.role === 'user'
                                ? <User className="w-3 h-3 text-blue-600" />
                                : <Bot className="w-3 h-3 text-purple-600" />
                            }
                        </div>
                        <div className={`max-w-[85%] ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            } rounded-xl px-3 py-2 text-sm`}>
                            {msg.role === 'user' ? (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                                <>
                                    <div className="prose prose-sm prose-gray max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                    {msg.trace && <TraceViewer trace={msg.trace} />}
                                </>
                            )}
                        </div>
                        {index === messages.length - 1 && (
                            <button
                                onClick={() => handleUndo(index)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors self-end mb-1"
                                title="Undo"
                            >
                                <Undo2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}

                {sending && (
                    <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3 h-3 text-purple-600" />
                        </div>
                        <div className="max-w-[85%] bg-gray-100 text-gray-800 rounded-xl rounded-bl-sm px-3 py-2 text-sm">
                            <StreamingTimeline steps={streamingSteps} />
                            {streamingText ? (
                                <div className="prose prose-sm prose-gray max-w-none whitespace-pre-wrap">
                                    <TypewriterText text={streamingText} speed={10} />
                                </div>
                            ) : streamingSteps.length === 0 ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Thinking...</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={disabled ? 'Analyze your resume first...' : 'Ask about your resume...'}
                        disabled={disabled || sending}
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={disabled || (!sending && !input.trim())}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            sending 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        title={sending ? 'Stop generating' : 'Send'}
                    >
                        {sending ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </div>
    );
}