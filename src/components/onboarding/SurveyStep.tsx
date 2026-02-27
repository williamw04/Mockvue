import { useState } from 'react';
import { LikertValue, SurveyResponse } from '../../types';

interface SurveyStepProps {
    onComplete: (responses: SurveyResponse[]) => void;
}

// ─── Survey Screen Data ──────────────────────────────────────────────

interface SurveyScreen {
    id: string;
    icon: string;
    title: string;
    statement: string;
    valueIcon: string;
    valueTitle: string;
    valuePromise: string;
}

const SCREENS: SurveyScreen[] = [
    {
        id: 'curveball',
        icon: '🎯',
        title: 'The "Curveball" Problem',
        statement:
            'I frequently feel caught off guard or unprepared for the unexpected questions interviewers throw at me.',
        valueIcon: '📚',
        valueTitle: 'Your 10 Core Stories',
        valuePromise:
            "You don't need to memorize 1,000 answers. We will help you build your '10 Core Stories' that can be pivoted to answer almost any behavioral curveball an interviewer throws your way.",
    },
    {
        id: 'feedback-gap',
        icon: '🔍',
        title: 'The "Feedback Gap" Problem',
        statement:
            "Even when I have a story in mind, I often doubt if my answer is structured well or if it's what the interviewer actually wants to hear.",
        valueIcon: '🤖',
        valueTitle: 'AI-Powered Evaluation',
        valuePromise:
            "Stop guessing. Our AI analyzes your responses in real-time to ensure you aren't rambling, highlighting exactly where you need stronger 'Impact Verbs' and quantifiable results.",
    },
    {
        id: 'delivery-pressure',
        icon: '🎤',
        title: 'The "Delivery Under Pressure" Problem',
        statement:
            'I know what I want to say, but I lack a realistic, high-quality way to practice delivering my answers under pressure.',
        valueIcon: '💪',
        valueTitle: 'Build Muscle Memory',
        valuePromise:
            'Build muscle memory before the big day. Use our active-recall Flashcards to lock in your story structure, then jump into our Simulated AI Interview to practice your pacing and tone under real pressure.',
    },
];

// ─── Likert Scale ────────────────────────────────────────────────────

const LIKERT_OPTIONS: { label: string; value: LikertValue }[] = [
    { label: 'Strongly Agree', value: 'strongly-agree' },
    { label: 'Agree', value: 'agree' },
    { label: 'Neutral', value: 'neutral' },
    { label: 'Disagree', value: 'disagree' },
    { label: 'Strongly Disagree', value: 'strongly-disagree' },
];

// ─── Component ───────────────────────────────────────────────────────

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
            // Collect all non-null responses and finish
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

    // Determine if the user "agrees" — used to decide when to show the value card
    const showValue =
        currentValue === 'strongly-agree' ||
        currentValue === 'agree' ||
        currentValue === 'neutral';

    return (
        <div className="max-w-2xl mx-auto">
            {/* Screen indicator dots */}
            <div className="flex justify-center gap-2 mb-8">
                {SCREENS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${i === screenIndex
                            ? 'w-8 bg-blue-600'
                            : i < screenIndex
                                ? 'w-2 bg-blue-400'
                                : 'w-2 bg-gray-300'
                            }`}
                    />
                ))}
            </div>

            {/* Main Card */}
            <div className="rounded-2xl p-8 bg-surface shadow-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">{screen.icon}</div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">{screen.title}</h2>
                    <p className="text-gray-600 text-sm">
                        Question {screenIndex + 1} of {SCREENS.length}
                    </p>
                </div>

                {/* Statement */}
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 mb-8">
                    <p className="text-gray-800 text-center text-lg leading-relaxed italic">
                        "{screen.statement}"
                    </p>
                </div>

                {/* Likert Scale */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {LIKERT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${currentValue === opt.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                : 'bg-surface text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Value Proposition Card — animated in */}
                <div
                    className={`overflow-hidden transition-all duration-500 ease-out ${showValue
                        ? 'max-h-96 opacity-100 translate-y-0'
                        : 'max-h-0 opacity-0 -translate-y-4'
                        }`}
                >
                    {currentValue && (
                        <div className="flex gap-4 p-5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                                {screen.valueIcon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-1">{screen.valueTitle}</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {screen.valuePromise}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Show a softer message when the user disagrees */}
                <div
                    className={`overflow-hidden transition-all duration-500 ease-out ${currentValue && !showValue
                        ? 'max-h-96 opacity-100 translate-y-0'
                        : 'max-h-0 opacity-0 -translate-y-4'
                        }`}
                >
                    {currentValue && !showValue && (
                        <div className="p-5 rounded-xl border border-green-200 bg-green-50 text-center">
                            <p className="text-sm text-green-800">
                                Great — sounds like you're already confident here! We'll still have tools available if you ever need them. 🙌
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={screenIndex === 0}
                    className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${screenIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    ← Back
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!currentValue}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                    {isLast ? 'Continue' : 'Next →'}
                </button>
            </div>
        </div>
    );
}
