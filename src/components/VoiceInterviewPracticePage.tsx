import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { useUser } from '../services';
import { Document, Resume, Story } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle, ChevronLeft } from 'lucide-react';

type SessionState = 'idle' | 'connecting' | 'active' | 'paused' | 'ended';

interface TranscriptEntry {
  speaker: 'candidate' | 'interviewer';
  text: string;
  timestamp: string;
}

function getElectronAPI() {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }
  return window.electronAPI;
}

export default function VoiceInterviewPracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userService = useUser();

  const prepSheet = location.state?.prepSheet as Document | undefined;

  const [resume, setResume] = useState<Resume | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState<string>('opening');

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletRef = useRef<AudioWorkletNode | null>(null);

  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const resumeData = await userService.getResume();
        setResume(resumeData);

        const storiesData = await userService.getStories();
        setStories(storiesData);

        if (!prepSheet) {
          setError('No prep sheet selected. Please select a prep sheet first.');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load interview data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userService, prepSheet]);

  const startSession = async () => {
    if (!prepSheet || !resume) {
      setError('Missing prep sheet or resume data.');
      return;
    }

    setSessionState('connecting');
    setError(null);
    setTranscript([]);

    try {
      const api = getElectronAPI();
      const newSessionId = `voice-${Date.now()}`;
      setSessionId(newSessionId);

      const interviewConfig = buildInterviewConfig(prepSheet, resume, stories);

      const result = await api.voiceInterviewStreamingCreate({
        sessionId: newSessionId,
        deepgramApiKey: import.meta.env.VITE_DEEPGRAM_API_KEY || '',
        geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        interviewConfig,
      });

      if (!result.success) {
        throw new Error('Failed to create voice interview session');
      }

      setupEventListeners(newSessionId);

      await api.voiceInterviewStreamingStart(newSessionId);

      await initializeAudioCapture(newSessionId);

      setSessionState('active');
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview session');
      setSessionState('idle');
    }
  };

  const buildInterviewConfig = (sheet: Document, resumeData: Resume, storiesData: Story[]) => {
    const role = sheet.title.includes(' - ')
      ? sheet.title.split(' - ')[1]?.trim() || sheet.title
      : sheet.title;
    const company = sheet.title.includes(' - ')
      ? sheet.title.split(' - ')[0]?.trim() || 'Company'
      : sheet.title;

    return {
      persona: {
        style: 'neutral-professional',
        company: company,
        role: role,
        seniority: 'senior',
        name: 'Interviewer',
      },
      jobDescription: {
        title: role,
        company: company,
        summary: sheet.description || 'Interview preparation for this role.',
        responsibilities: [],
        requirements: { required: [], preferred: [] },
      },
      candidateResume: resumeData,
      candidateStories: storiesData,
      candidateSummary: resumeData.summary || undefined,
      rubric: {
        criteria: [
          {
            name: 'Communication',
            description: 'Clear and structured responses',
            weight: 25,
            probingAreas: [],
            redFlags: [],
            greenFlags: [],
          },
          {
            name: 'Problem Solving',
            description: 'Approach to challenges',
            weight: 25,
            probingAreas: [],
            redFlags: [],
            greenFlags: [],
          },
          {
            name: 'Story Delivery',
            description: 'STAR structure and impact',
            weight: 25,
            probingAreas: [],
            redFlags: [],
            greenFlags: [],
          },
          {
            name: 'Role Fit',
            description: 'Alignment with role requirements',
            weight: 25,
            probingAreas: [],
            redFlags: [],
            greenFlags: [],
          },
        ],
        overallPassThreshold: 70,
        focusAreas: [],
      },
      conversationRules: {
        maxFollowupDepth: 2,
        minAnswerLengthBeforeProbe: 50,
        silenceThresholdMs: 3000,
        interruptAllowed: true,
        transitionHints: [],
        moveOnSignals: [],
      },
      plan: {
        questions:
          sheet.questions?.map((q, i) => ({
            id: `q-${i}`,
            category: 'behavioral',
            phase: i < 2 ? 'opening' : i < 4 ? 'behavioral-deep' : 'closing',
            question: q.text,
            followupPrompts: [],
            evaluationCriteria: [],
            timeBudgetMinutes: 5,
            priority: i,
          })) || [],
        totalDurationMinutes: 30,
        phaseOrder: ['opening', 'behavioral-deep', 'closing'],
        openingPrompt: `Hello, I'll be conducting your interview for the ${role} position. Let's start with you telling me about yourself and your background.`,
        closingPrompt:
          'Thank you for your time today. Do you have any questions for me before we wrap up?',
      },
    };
  };

  const setupEventListeners = (_sessionId: string) => {
    const api = getElectronAPI();

    const unsubTranscript = api.onVoiceInterviewCandidateTranscript((_, text, isFinal) => {
      if (isFinal) {
        setTranscript((prev) => [
          ...prev,
          {
            speaker: 'candidate',
            text,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    });
    cleanupFunctionsRef.current.push(unsubTranscript);

    const unsubResponse = api.onVoiceInterviewInterviewerResponse((_, text) => {
      setTranscript((prev) => [
        ...prev,
        {
          speaker: 'interviewer',
          text,
          timestamp: new Date().toISOString(),
        },
      ]);
    });
    cleanupFunctionsRef.current.push(unsubResponse);

    const unsubAudio = api.onVoiceInterviewAudioOutput((_, audioBase64) => {
      playAudioChunk(audioBase64);
    });
    cleanupFunctionsRef.current.push(unsubAudio);

    const unsubState = api.onVoiceInterviewStateChange((_, state) => {
      if (state && typeof state === 'object' && 'currentPhase' in state) {
        setInterviewPhase((state as { currentPhase: string }).currentPhase);
      }
    });
    cleanupFunctionsRef.current.push(unsubState);

    const unsubPhase = api.onVoiceInterviewPhaseChange((_, _from, to) => {
      setInterviewPhase(to);
    });
    cleanupFunctionsRef.current.push(unsubPhase);

    const unsubError = api.onVoiceInterviewError((_, errorMsg) => {
      setError(errorMsg);
    });
    cleanupFunctionsRef.current.push(unsubError);

    const unsubReady = api.onVoiceInterviewSessionReady(() => {
      console.log('Voice interview session ready');
    });
    cleanupFunctionsRef.current.push(unsubReady);

    const unsubEnded = api.onVoiceInterviewSessionEnded(() => {
      setSessionState('ended');
      stopAudioCapture();
    });
    cleanupFunctionsRef.current.push(unsubEnded);
  };

  const initializeAudioCapture = async (currentSessionId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Note: AudioWorklet requires a separate file - for now we'll use a simple approach
      // This is a placeholder - in production you'd need an audio-processor.js worklet file
      const analyzer = audioContextRef.current.createAnalyser();
      source.connect(analyzer);

      // For demo purposes, we'll simulate audio capture with intervals
      // In production, this would use AudioWorklet for proper streaming
      setIsRecording(true);

      console.log('Audio capture initialized for session:', currentSessionId);
    } catch (err) {
      console.error('Error initializing audio:', err);
      setError('Failed to access microphone. Please grant microphone permissions.');
    }
  };

  const stopAudioCapture = () => {
    if (audioWorkletRef.current) {
      audioWorkletRef.current.disconnect();
      audioWorkletRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      audioContextRef.current.decodeAudioData(
        bytes.buffer,
        (buffer) => {
          if (audioContextRef.current) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start();
          }
        },
        (err) => {
          console.error('Error decoding audio:', err);
        }
      );
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const pauseSession = async () => {
    if (!sessionId) return;

    try {
      const api = getElectronAPI();
      await api.voiceInterviewStreamingPause(sessionId);
      setSessionState('paused');
      stopAudioCapture();
    } catch (err) {
      console.error('Error pausing session:', err);
    }
  };

  const resumeSession = async () => {
    if (!sessionId) return;

    try {
      const api = getElectronAPI();
      await api.voiceInterviewStreamingResume(sessionId);
      await initializeAudioCapture(sessionId);
      setSessionState('active');
    } catch (err) {
      console.error('Error resuming session:', err);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const api = getElectronAPI();
      await api.voiceInterviewStreamingEnd(sessionId);
      stopAudioCapture();

      cleanupFunctionsRef.current.forEach((fn) => fn());
      cleanupFunctionsRef.current = [];

      setSessionState('ended');
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  const interruptSession = async () => {
    if (!sessionId) return;

    try {
      const api = getElectronAPI();
      await api.voiceInterviewStreamingInterrupt(sessionId);
    } catch (err) {
      console.error('Error interrupting session:', err);
    }
  };

  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach((fn) => fn());
      stopAudioCapture();
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!prepSheet) {
    return (
      <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
        <TopNavBar />
        <div className="px-14 py-10 max-w-5xl">
          <div className="flex items-center gap-2 text-ink-3 mb-6">
            <button onClick={() => navigate('/practice')} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Practice
            </button>
          </div>
          <div className="bg-card border border-rule p-8">
            <div className="flex items-center gap-3 text-accent-hi mb-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-serif text-2xl">No Prep Sheet Selected</span>
            </div>
            <div className="text-ink-2 mb-4">
              Please select a prep sheet from the practice page to start a voice interview.
            </div>
            <button
              onClick={() => navigate('/practice')}
              className="bg-accent-hi text-white border-none px-4 py-2 text-[13px] font-semibold cursor-pointer"
            >
              Go to Practice Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
      <TopNavBar />

      <div className="px-14 py-10 max-w-5xl">
        <div className="flex items-center gap-2 text-ink-3 mb-6">
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1 hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Practice
          </button>
        </div>

        <div className="mb-8">
          <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
            Voice Interview Simulation
          </div>
          <h1 className="font-serif text-[44px] font-normal tracking-tight m-0 leading-tight mb-3">
            {prepSheet.title}
          </h1>
          <div className="text-[15px] text-ink-2">
            Practice a mock interview with an AI interviewer. Speak naturally and receive follow-up
            questions based on your responses.
          </div>
        </div>

        {error && (
          <div className="bg-accent-lo border border-accent-hi/30 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-accent-hi" />
            <div className="text-ink">{error}</div>
          </div>
        )}

        {/* Session Status Card */}
        <div className="bg-card border border-rule p-7 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-1">
                Interview Status
              </div>
              <div className="font-serif text-2xl">
                {sessionState === 'idle' && 'Ready to Start'}
                {sessionState === 'connecting' && 'Connecting...'}
                {sessionState === 'active' && `In Progress - ${interviewPhase} phase`}
                {sessionState === 'paused' && 'Paused'}
                {sessionState === 'ended' && 'Session Complete'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sessionState === 'idle' && (
                <button
                  onClick={startSession}
                  className="bg-accent-hi text-white border-none px-5 py-3 text-[13px] font-semibold cursor-pointer flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Start Interview
                </button>
              )}

              {sessionState === 'active' && (
                <>
                  <button
                    onClick={interruptSession}
                    className="bg-transparent text-ink border border-rule px-3 py-2 text-[13px] cursor-pointer"
                  >
                    Interrupt
                  </button>
                  <button
                    onClick={pauseSession}
                    className="bg-transparent text-ink border border-rule px-3 py-2 text-[13px] cursor-pointer"
                  >
                    Pause
                  </button>
                  <button
                    onClick={endSession}
                    className="bg-ink text-white border-none px-3 py-2 text-[13px] cursor-pointer flex items-center gap-1"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End
                  </button>
                </>
              )}

              {sessionState === 'paused' && (
                <>
                  <button
                    onClick={resumeSession}
                    className="bg-accent-hi text-white border-none px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Resume
                  </button>
                  <button
                    onClick={endSession}
                    className="bg-ink text-white border-none px-3 py-2 text-[13px] cursor-pointer"
                  >
                    End Session
                  </button>
                </>
              )}

              {sessionState === 'ended' && (
                <button
                  onClick={() => {
                    setSessionState('idle');
                    setTranscript([]);
                    setSessionId(null);
                  }}
                  className="bg-accent-hi text-white border-none px-4 py-2 text-[13px] font-semibold cursor-pointer"
                >
                  Start New Session
                </button>
              )}
            </div>
          </div>

          {/* Microphone Indicator */}
          {sessionState === 'active' && (
            <div className="flex items-center gap-4 border-t border-rule pt-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isRecording ? 'bg-accent-hi text-white animate-pulse' : 'bg-bg text-ink-3'
                }`}
              >
                {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-mono text-[11px] text-ink-3 uppercase">
                  {isRecording ? 'Listening...' : 'Microphone Off'}
                </div>
                <div className="text-[13px] text-ink-2">
                  Speak naturally. The interviewer will respond after you finish.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="bg-card border border-rule p-6">
            <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-4">
              Conversation Transcript
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${entry.speaker === 'interviewer' ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      entry.speaker === 'interviewer'
                        ? 'bg-accent-lo text-accent-hi'
                        : 'bg-bg text-ink-2'
                    }`}
                  >
                    {entry.speaker === 'interviewer' ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${
                      entry.speaker === 'interviewer' ? 'text-left' : 'text-right'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 ${
                        entry.speaker === 'interviewer'
                          ? 'bg-bg border border-rule'
                          : 'bg-accent-lo'
                      }`}
                    >
                      <div className="text-[13px]">{entry.text}</div>
                    </div>
                    <div className="font-mono text-[10px] text-ink-3 mt-1">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        {sessionState === 'idle' && (
          <div className="bg-card border border-rule p-6 mt-6">
            <div className="font-serif text-lg mb-3">Tips for Voice Interview Practice</div>
            <ul className="space-y-2 text-[14px] text-ink-2">
              <li>Speak clearly and at a natural pace - the AI transcribes in real-time</li>
              <li>After answering, pause briefly to let the interviewer respond</li>
              <li>Use STAR format for behavioral questions (Situation, Task, Action, Result)</li>
              <li>You can interrupt the interviewer if needed using the button above</li>
              <li>The interview typically lasts 20-30 minutes with multiple phases</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
