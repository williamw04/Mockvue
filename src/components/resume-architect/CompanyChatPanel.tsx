import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgent } from '../../services';
import { Send, Loader2, Bot, User, Plus, ChevronDown, Trash2, FileText, X, Upload } from 'lucide-react';
import type { AgentSession, ResumeAnalysis, Resume } from '../../types';

interface CompanyChat {
  id: string;
  name: string;
  score?: number;
  jobDescription?: string;
  keywords?: { kw: string; found: boolean }[];
  isActive: boolean;
}

interface CompanyChatPanelProps {
  chats: CompanyChat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onAddChat: (name: string, jobDescription?: string) => void;
  onRemoveChat: (id: string) => void;
  onUploadJobDesc: (text: string) => void;
  analysis: ResumeAnalysis | null;
  resume: Resume | null;
  showDropdown: boolean;
  onToggleDropdown: () => void;
}

export function CompanyChatPanel({
  chats,
  activeChatId,
  onSelectChat,
  onAddChat,
  onRemoveChat,
  onUploadJobDesc,
  analysis,
  resume,
  showDropdown,
  onToggleDropdown,
}: CompanyChatPanelProps) {
  const agentService = useAgent();
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [session, setSession] = useState<AgentSession | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (envApiKey) {
      agentService.setAgentApiKey(envApiKey);
    }
  }, [envApiKey, agentService]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !analysis) return;

    const userMsg = {
      role: 'user' as const,
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      if (!session && envApiKey) {
        const newSession = await agentService.createAssistantSession({
          assistantId: 'resume-assistant',
          title: activeChat?.name || 'Resume Chat',
          resumeAnalysisSnapshot: analysis,
          resumeSnapshot: resume || undefined,
        });
        setSession(newSession);
      }

      if (session) {
        const result = await agentService.runAssistantTurn({
          sessionId: session.id,
          message: text.trim(),
          includeMemory: true,
        });

        const aiMsg = {
          role: 'assistant' as const,
          content: result.reply,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg = {
        role: 'assistant' as const,
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [analysis, session, envApiKey, agentService, resume, activeChat?.name]);

  const handleAddNewChat = useCallback(() => {
    if (newChatName.trim()) {
      onAddChat(newChatName.trim());
      setNewChatName('');
      setShowNewChatForm(false);
    }
  }, [newChatName, onAddChat]);

  const handleUploadFile = useCallback(async () => {
    try {
      const result = await window.electronAPI?.showOpenDialog({
        filters: [{ name: 'Text Files', extensions: ['txt', 'pdf', 'md'] }],
      });
      
      if (result && result.filePath && result.content) {
        onUploadJobDesc(result.content);
      } else if (result && result.filePath) {
        onUploadJobDesc(result.filePath);
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  }, [onUploadJobDesc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const suggestedQuestions = [
    'What keywords from the job description am I missing?',
    'How can I improve my weakest bullet point?',
    'Which experiences should I emphasize for this role?',
  ];

  return (
    <aside className="border-l border-rule bg-card flex flex-col overflow-hidden h-full">
      {/* Header with chat selector */}
      <div className="px-4 py-3 border-b border-rule flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-accent-hi" />
            <span className="font-mono text-[10px] text-accent-hi tracking-widest uppercase">AGENT</span>
          </div>
        </div>

        {/* Chat Selector Dropdown */}
        <button
          onClick={onToggleDropdown}
          className="w-full flex items-center justify-between px-3 py-2 border border-rule rounded-sm bg-bg hover:bg-card transition-colors"
        >
          <span className="text-sm font-medium truncate">{activeChat?.name || 'General Review'}</span>
          <ChevronDown className="w-4 h-4 text-ink-3" />
        </button>

        {showDropdown && (
          <div className="mt-2 border border-rule rounded-sm bg-card shadow-sm">
            {/* Chat List */}
            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                    chat.id === activeChatId ? 'bg-accent-lo text-accent-hi' : 'hover:bg-bg text-ink'
                  }`}
                  onClick={() => {
                    onSelectChat(chat.id);
                    onToggleDropdown();
                  }}
                >
                  <div className="flex items-center gap-2">
                    {chat.jobDescription ? (
                      <FileText className="w-3 h-3 text-accent-hi" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                    <span className="text-sm truncate">{chat.name}</span>
                  </div>
                  {chat.score && (
                    <span className="font-mono text-[10px] font-semibold">{chat.score}</span>
                  )}
                  {chats.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-ink-3 hover:text-ink"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Chat */}
            <div className="border-t border-rule p-2">
              {showNewChatForm ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="Company name..."
                    className="flex-1 px-2 py-1.5 text-sm border border-rule rounded-sm bg-bg focus:outline-none focus:border-accent-hi"
                    autoFocus
                  />
                  <button
                    onClick={handleAddNewChat}
                    className="px-3 py-1.5 bg-accent-hi text-white text-sm rounded-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowNewChatForm(false)}
                    className="px-2 py-1.5 text-ink-3 hover:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewChatForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-accent-hi hover:bg-accent-lo rounded-sm transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Company Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Description Upload (if not present) */}
      {activeChat && !activeChat.jobDescription && (
        <div className="px-4 py-3 border-b border-rule">
          <button
            onClick={handleUploadFile}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-rule rounded-sm text-sm text-ink-2 hover:bg-bg hover:text-ink transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload Job Description
          </button>
        </div>
      )}

      {/* Job Description Preview (if present) */}
      {activeChat?.jobDescription && (
        <div className="px-4 py-2 border-b border-rule bg-bg">
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-accent-hi" />
            <span className="text-xs text-ink-2">Job description loaded</span>
            <button
              onClick={() => onUploadJobDesc('')}
              className="ml-auto p-1 text-ink-3 hover:text-ink"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !sending && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent-lo flex items-center justify-center">
                <Bot className="w-3 h-3 text-accent-hi" />
              </div>
              <div className="flex-1 text-sm text-ink-2">
                <p className="mb-4">
                  {activeChat?.jobDescription
                    ? `I'll help you tailor your resume for ${activeChat.name}. Ask me about keyword coverage, missing skills, or how to reframe your experience.`
                    : 'Ask me anything about your resume — I can help with rewrites, bullet improvements, and interview prep.'}
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] text-ink-3 font-mono tracking-wide uppercase">TRY ASKING</p>
                  {suggestedQuestions.slice(0, activeChat?.jobDescription ? 3 : 2).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left px-3 py-2 text-xs text-ink-2 bg-bg hover:bg-accent-lo hover:text-ink border border-rule rounded-sm transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-accent-hi' : 'bg-accent-lo'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-3 h-3 text-white" />
              ) : (
                <Bot className="w-3 h-3 text-accent-hi" />
              )}
            </div>
            <div className={`max-w-[85%] px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-accent-hi text-white rounded-bl-sm'
                : 'bg-bg text-ink rounded-br-sm border border-rule'
            } rounded-sm`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-lo flex items-center justify-center">
              <Bot className="w-3 h-3 text-accent-hi" />
            </div>
            <div className="bg-bg border border-rule rounded-sm px-3 py-2 text-sm text-ink-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-rule flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your resume..."
            disabled={sending || !analysis}
            className="flex-1 px-3 py-2 text-sm bg-bg border border-rule rounded-sm focus:outline-none focus:border-accent-hi disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim() || !analysis}
            className="px-4 py-2 bg-accent-hi text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}