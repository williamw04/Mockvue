interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-5xl tracking-tight mb-4">You're All Set!</h1>
        <p className="text-ink-2 text-base">Your interview prep workspace is ready</p>
      </div>

      <div className="bg-card border border-rule p-10 mb-8">
        <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
          What's Next?
        </div>
        <h2 className="font-serif text-3xl mb-8">Your Next Steps</h2>

        <div className="space-y-6">
          <div className="flex items-start gap-5 py-4 border-b border-rule">
            <div className="w-8 h-8 rounded-sm bg-accent-hi flex items-center justify-center font-mono text-[11px] font-semibold text-white flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg mb-1">Build More Stories</h3>
              <p className="text-sm text-ink-2">
                Add more experiences to your library. The more stories you have, the better prepared
                you'll be.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 py-4 border-b border-rule">
            <div className="w-8 h-8 rounded-sm bg-accent-hi flex items-center justify-center font-mono text-[11px] font-semibold text-white flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg mb-1">Create Interview Responses</h3>
              <p className="text-sm text-ink-2">
                Use your stories to craft compelling answers to common behavioral questions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 py-4 border-b border-rule">
            <div className="w-8 h-8 rounded-sm bg-accent-hi flex items-center justify-center font-mono text-[11px] font-semibold text-white flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg mb-1">Practice & Refine</h3>
              <p className="text-sm text-ink-2">
                Practice your responses out loud and refine them based on feedback.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 py-4">
            <div className="w-8 h-8 rounded-sm bg-accent-hi flex items-center justify-center font-mono text-[11px] font-semibold text-white flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg mb-1">Ace Your Interviews</h3>
              <p className="text-sm text-ink-2">
                Use your preparation to confidently tackle any behavioral question.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-accent-hi text-white border-none px-8 py-3 text-[13px] font-semibold cursor-pointer"
      >
        Go to Dashboard
      </button>

      <p className="mt-6 text-sm text-ink-3 text-center">
        You can always update your profile and stories from the settings
      </p>
    </div>
  );
}
