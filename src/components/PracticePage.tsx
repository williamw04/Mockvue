import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { useDocuments, useUser } from '../services';
import { Document, Story } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Mic, MessageSquare, FileText, ChevronRight } from 'lucide-react';

type PracticeMode = 'voice-interview' | 'flashcards' | 'story-review';

export default function PracticePage() {
  const documentService = useDocuments();
  const userService = useUser();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<Document | null>(null);
  const [showModeSelection, setShowModeSelection] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
        
        const storiesData = await userService.getStories();
        setStories(storiesData);
      } catch (error) {
        console.error('Error loading practice data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [documentService, userService]);

  const handleSheetSelect = (doc: Document) => {
    setSelectedSheet(doc);
    setShowModeSelection(true);
  };

  const handleModeSelect = (mode: PracticeMode) => {
    if (mode === 'voice-interview') {
      navigate('/practice/voice', { state: { prepSheet: selectedSheet } });
    } else if (mode === 'flashcards') {
      navigate('/practice/flashcards', { state: { prepSheet: selectedSheet } });
    } else if (mode === 'story-review') {
      navigate('/practice/stories', { state: { prepSheet: selectedSheet } });
    }
  };

  const handleBack = () => {
    if (showModeSelection) {
      setShowModeSelection(false);
    } else {
      setSelectedSheet(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const practiceModes = [
    {
      id: 'voice-interview' as PracticeMode,
      title: 'Voice Interview Simulation',
      description: 'Practice with an AI interviewer using your microphone. Real-time conversation with follow-up questions.',
      icon: Mic,
      available: stories.length >= 3,
      badge: 'NEW',
    },
    {
      id: 'flashcards' as PracticeMode,
      title: 'Question Flashcards',
      description: 'Quick review of questions from your prep sheet. Flip to see suggested story and key points.',
      icon: FileText,
      available: (selectedSheet?.questions && selectedSheet.questions.length > 0),
      badge: null,
    },
    {
      id: 'story-review' as PracticeMode,
      title: 'Story Delivery Practice',
      description: 'Practice delivering your STAR stories. Record yourself and review against your prepared notes.',
      icon: MessageSquare,
      available: stories.length > 0,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
      <TopNavBar />
      
      <div className="px-14 py-10 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
            Practice Tools
          </div>
          <h1 className="font-serif text-[44px] font-normal tracking-tight m-0 leading-tight mb-3">
            Practice Mode
          </h1>
          <div className="text-[15px] text-ink-2 max-w-xl">
            Select a prep sheet to practice with. Each sheet contains questions, stories, and talking points tailored to that company and role.
          </div>
        </div>

        {/* Quick Access - Start Voice Practice */}
        {!showModeSelection && (
          <div className="bg-accent-lo border border-accent-hi/30 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-2xl mb-1">Quick Start: Voice Interview</div>
                <div className="text-[13px] text-ink-2">
                  Jump directly into a voice interview simulation to test the feature.
                </div>
              </div>
              <button
                onClick={() => navigate('/practice/voice')}
                className="bg-accent-hi text-white border-none px-5 py-3 text-[13px] font-semibold cursor-pointer flex items-center gap-2 font-sans hover:opacity-90 transition-opacity"
              >
                <Mic className="w-4 h-4" />
                Start Voice Practice
              </button>
            </div>
          </div>
        )}

        {/* Sheet Selection */}
        {!showModeSelection && (
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <div className="font-mono text-[11px] text-ink-3 uppercase tracking-wide">
                {documents.length} prep sheets available
              </div>
              {stories.length > 0 && (
                <div className="font-mono text-[11px] text-ink-3">
                  {stories.length} stories ready
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSheetSelect(doc)}
                  className="bg-card border border-rule p-6 hover:border-accent-hi/30 transition-colors cursor-pointer group text-left w-full"
                >
                  <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
                    {doc.tags?.[0] || 'Prep Sheet'}
                  </div>
                  <h2 className="font-serif text-2xl m-0 mb-1 group-hover:text-accent-hi transition-colors">
                    {doc.title}
                  </h2>
                  <div className="text-[13px] text-ink-2 mb-4 line-clamp-2">
                    {doc.description || 'No description provided.'}
                  </div>
                  
                  <div className="flex items-center gap-3 border-t border-rule pt-4 mt-auto">
                    <div className="font-mono text-[10px] text-ink-3 uppercase">
                      {doc.questions?.length || 0} questions
                    </div>
                    <div className="font-mono text-[10px] text-ink-3">
                      ·
                    </div>
                    <div className="font-mono text-[10px] text-ink-3 uppercase">
                      Last edited {new Date(doc.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-accent-hi text-[13px] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Start practicing</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
              
              {documents.length === 0 && (
                <div className="col-span-full py-16 text-center border border-rule border-dashed bg-card text-ink-3">
                  <div className="font-serif text-xl mb-2 text-ink-2">No Prep Sheets yet</div>
                  <div className="text-[14px] mb-4">Create a prep sheet first to start practicing.</div>
                  <button
                    onClick={() => navigate('/document/new')}
                    className="bg-accent-hi text-white border-none px-4 py-2 text-[13px] font-semibold cursor-pointer font-sans hover:opacity-90 transition-opacity"
                  >
                    Create Prep Sheet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode Selection */}
        {showModeSelection && selectedSheet && (
          <div>
            <button
              onClick={handleBack}
              className="text-[13px] text-ink-3 hover:text-ink transition-colors mb-6 flex items-center gap-1"
            >
              ← Back to sheet selection
            </button>

            <div className="bg-card border border-rule p-7 mb-8">
              <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
                Selected Prep Sheet
              </div>
              <h2 className="font-serif text-3xl m-0 mb-1">{selectedSheet.title}</h2>
              <div className="text-[13px] text-ink-2">
                {selectedSheet.description || `${selectedSheet.questions?.length || 0} questions prepared`}
              </div>
            </div>

            <div className="font-mono text-[11px] text-ink-3 uppercase tracking-wide mb-4">
              Choose practice mode
            </div>

            <div className="grid grid-cols-1 gap-4">
              {practiceModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => mode.available && handleModeSelect(mode.id)}
                    disabled={!mode.available}
                    className={`bg-card border border-rule p-6 transition-colors cursor-pointer group text-left w-full flex items-start gap-5 ${
                      mode.available 
                        ? 'hover:border-accent-hi/30' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                      mode.available ? 'bg-accent-lo text-accent-hi' : 'bg-bg text-ink-3'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-xl m-0 group-hover:text-accent-hi transition-colors">
                          {mode.title}
                        </h3>
                        {mode.badge && (
                          <span className="font-mono text-[10px] bg-accent-hi text-white px-1.5 py-0.5 uppercase tracking-wider">
                            {mode.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-ink-2">
                        {mode.description}
                      </div>
                      {!mode.available && (
                        <div className="font-mono text-[11px] text-ink-3 mt-2">
                          {mode.id === 'voice-interview' && 'Requires at least 3 stories'}
                          {mode.id === 'flashcards' && 'Requires questions in prep sheet'}
                          {mode.id === 'story-review' && 'Requires at least 1 story'}
                        </div>
                      )}
                    </div>
                    
                    {mode.available && (
                      <div className="flex items-center gap-1 text-accent-hi text-[13px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <span>Start</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Resume/Stories readiness warning */}
            {stories.length < 3 && (
              <div className="mt-8 p-5 bg-accent-lo border border-rule">
                <div className="font-serif text-lg mb-1">Add more stories for voice practice</div>
                <div className="text-[13px] text-ink-2 mb-3">
                  Voice interview simulation requires at least 3 STAR stories to provide realistic conversation flow.
                </div>
                <button
                  onClick={() => navigate('/stories')}
                  className="bg-transparent text-ink border border-rule px-4 py-2 text-[13px] cursor-pointer hover:bg-bg transition-colors font-sans"
                >
                  Go to Stories →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}