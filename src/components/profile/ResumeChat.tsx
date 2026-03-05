import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgent } from '../../services';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import type { ChatMessage, ResumeAnalysis } from '../../types';

interface ResumeChatProps {
    analysisContext: ResumeAnalysis | null;
}

const suggestedQuestions = [
    'How can I improve my weakest bullet?',
    'What story should I prepare for trigger point #1?',
    'Rewrite my lowest-scored bullet with stronger impact verbs.',
    'What questions might an interviewer ask about my experience?',
];

export function ResumeChat({ analysisContext }: ResumeChatProps) {
    const agentService = useAgent();
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || !envApiKey || !analysisContext) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            const chatHistory = [...messages, userMsg].map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                content: m.content,
            }));

            const reply = await agentService.chatWithResume(chatHistory, analysisContext, envApiKey);

            const aiMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: reply,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }, [envApiKey, analysisContext, messages, agentService]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const disabled = !analysisContext || !envApiKey;

    return (
        <div className="flex flex-col h-full rounded-2xl bg-surface shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Resume Coach</h3>
                        <p className="text-xs text-gray-500">Ask about your resume analysis</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.length === 0 && (
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

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                            {msg.role === 'user'
                                ? <User className="w-3 h-3 text-blue-600" />
                                : <Bot className="w-3 h-3 text-purple-600" />
                            }
                        </div>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3 h-3 text-purple-600" />
                        </div>
                        <div className="px-3 py-2 bg-gray-100 rounded-xl rounded-bl-sm">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
                        disabled={disabled || sending || !input.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
