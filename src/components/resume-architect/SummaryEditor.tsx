import { useState, useCallback } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface SummaryEditorProps {
  summary: string;
  onUpdate: (newSummary: string) => void;
}

export function SummaryEditor({ summary, onUpdate }: SummaryEditorProps) {
  const [localValue, setLocalValue] = useState(summary);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value);
      setHasChanges(value !== summary);
    },
    [summary]
  );

  const handleSave = useCallback(() => {
    onUpdate(localValue);
    setHasChanges(false);
  }, [localValue, onUpdate]);

  const handleReset = useCallback(() => {
    setLocalValue(summary);
    setHasChanges(false);
  }, [summary]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-rule">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rule flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-ink">Professional Summary</h2>
            <p className="text-sm text-ink-3 mt-1">
              A brief overview of your professional background and key qualifications.
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink px-3 py-1.5 border border-rule hover:border-ink-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-sm bg-accent-hi text-white px-3 py-1.5 hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="p-6">
          <textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write your professional summary here..."
            className="w-full min-h-[200px] bg-bg border border-rule px-4 py-3 text-[15px] leading-relaxed resize-y focus:outline-none focus:border-ink font-serif"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-ink-3">
            <span>{localValue.length} characters</span>
            {localValue.length > 0 && localValue.length < 50 && (
              <span className="text-amber-600">
                Consider adding more detail (recommended: 100-300 characters)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-bg border border-rule">
        <h3 className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">Tips</h3>
        <ul className="space-y-2 text-sm text-ink-2">
          <li>Keep your summary concise and impactful (2-4 sentences).</li>
          <li>Highlight your most relevant skills and experience for your target role.</li>
          <li>Include key achievements or metrics that demonstrate your value.</li>
          <li>Use active language and avoid generic statements.</li>
        </ul>
      </div>
    </div>
  );
}
