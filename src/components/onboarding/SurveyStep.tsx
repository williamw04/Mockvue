import { useState } from 'react';
import { LikertValue, SurveyResponse } from '../../types';

interface SurveyStepProps {
  onComplete: (responses: SurveyResponse[]) => void;
}

interface SurveyScreen {
  id: string;
  title: string;
  statement: string;
  valueTitle: string;
  valuePromise: string;
}

const SCREENS: SurveyScreen[] = [
  {
    id: 'curveball',
    title: 'The "Curveball" Problem',
    statement:
      'I frequently feel caught off guard or unprepared for the unexpected questions interviewers throw at me.',
    valueTitle: 'Your 10 Core Stories',
    valuePromise:
      "You don't need to memorize 1,000 answers. We will help you build your '10 Core Stories' that can be pivoted to answer almost any behavioral curveball an interviewer throws your way.",
  },
  {
    id: 'feedback-gap',
    title: 'The "Feedback Gap" Problem',
    statement:
      "Even when I have a story in mind, I often doubt if my answer is structured well or if it's what the interviewer actually wants to hear.",
    valueTitle: 'AI-Powered Evaluation',
    valuePromise:
      "Stop guessing. Our AI analyzes your responses in real-time to ensure you aren't rambling, highlighting exactly where you need stronger 'Impact Verbs' and quantifiable results.",
  },
  {
    id: 'delivery-pressure',
    title: 'The "Delivery Under Pressure" Problem',
    statement:
      'I know what I want to say, but I lack a realistic, high-quality way to practice delivering my answers under pressure.',
    valueTitle: 'Build Muscle Memory',
    valuePromise:
      'Build muscle memory before the big day. Use our active-recall Flashcards to lock in your story structure, then jump into our Simulated AI Interview to practice your pacing and tone under real pressure.',
  },
];

const LIKERT_OPTIONS: { label: string; value: LikertValue }[] = [
  { label: 'Exactly', value: 'strongly-agree' },
  { label: 'A little', value: 'agree' },
  { label: 'Somewhat', value: 'neutral' },
  { label: 'Barely', value: 'disagree' },
  { label: 'Not at all', value: 'strongly-disagree' },
];

export default function SurveyStep({ onComplete }: SurveyStepProps) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [responses, setResponses] = useState<(LikertValue | null)[]>([null, null, null]);

  const screen = SCREENS[screenIndex];
  const currentValue = responses[screenIndex];
  const isLast = screenIndex === SCREENS.length - 1;

  const handleSelect = (value: LikertValue) => {
    setResponses((prev) => {
      const next = [...prev];
      next[screenIndex] = value;
      return next;
    });
  };

  const handleNext = () => {
    if (isLast) {
      const surveyResponses: SurveyResponse[] = SCREENS.map((s, i) => ({
        questionId: s.id,
        value: responses[i]!,
      }));
      onComplete(surveyResponses);
    } else {
      setScreenIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (screenIndex > 0) setScreenIndex((prev) => prev - 1);
  };

  const showValue =
    currentValue === 'strongly-agree' || currentValue === 'agree' || currentValue === 'neutral';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-center gap-3 mb-10">
        {SCREENS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-sm transition-all duration-300 ${
              i === screenIndex
                ? 'w-8 bg-accent-hi'
                : i < screenIndex
                  ? 'w-2 bg-accent-hi'
                  : 'w-2 bg-rule'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border border-rule p-8">
          <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-3">
            Question {screenIndex + 1} of {SCREENS.length}
          </div>
          <h2 className="font-serif text-2xl mb-4">{screen.title}</h2>
          <p className="text-ink-2 text-sm leading-relaxed italic mb-8">"{screen.statement}"</p>

          <div className="space-y-3">
            {LIKERT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-4 py-3 text-left text-sm border transition-all duration-200 ${
                  currentValue === opt.value
                    ? 'bg-accent-hi text-white border-accent-hi'
                    : 'bg-bg text-ink border-rule hover:border-accent-hi'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-out ${
            showValue ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {showValue && currentValue && (
            <div className="bg-card border border-rule p-8 h-full">
              <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">
                How Mockvue Helps
              </div>
              <h3 className="font-serif text-xl mb-4 text-accent-hi">{screen.valueTitle}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{screen.valuePromise}</p>
            </div>
          )}

          {!showValue && currentValue && (
            <div className="bg-card border border-rule p-8 h-full">
              <p className="text-sm text-ink-2 text-center leading-relaxed">
                Great — sounds like you're already confident here! We'll still have tools available
                if you ever need them.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-10">
        <button
          type="button"
          onClick={handleBack}
          disabled={screenIndex === 0}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            screenIndex === 0 ? 'text-ink-3 cursor-not-allowed' : 'text-ink hover:bg-accent-lo'
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!currentValue}
          className="bg-accent-hi text-white border-none px-6 py-2.5 text-[13px] font-semibold cursor-pointer disabled:bg-ink-3 disabled:cursor-not-allowed"
        >
          {isLast ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  );
}
