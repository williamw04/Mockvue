import { ChevronDown } from 'lucide-react';
import type { BulletAnalysis } from '../../types';

interface BulletState {
  status: 'pending' | 'accepted' | 'rejected' | 'cut';
}

interface Section {
  id: string;
  title: string;
  bullets: BulletAnalysis[];
}

interface FlagColors {
  [key: string]: { bg: string; color: string };
}

interface BulletDiffEditorProps {
  section: Section | undefined;
  bulletStates: Record<string, BulletState>;
  expandedBullet: string | null;
  onExpand: (id: string | null) => void;
  onSetBulletState: (id: string, status: BulletState['status']) => void;
  flagColors: FlagColors;
}

function Chip({ label, bg = 'bg-bg', color = 'text-ink-2' }: { label: string; bg?: string; color?: string }) {
  return (
    <span className={`${bg} ${color} font-mono text-[9px] px-1.5 py-0.5 tracking-wide whitespace-nowrap`}>
      {label}
    </span>
  );
}

export function BulletDiffEditor({
  section,
  bulletStates,
  expandedBullet,
  onExpand,
  onSetBulletState,
  flagColors,
}: BulletDiffEditorProps) {
  if (!section) {
    return (
      <div className="text-center py-20 text-ink-3">
        Select a section to view bullets
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-5">
        <div className="font-mono text-[10px] tracking-widest text-ink-3 uppercase mb-2">
          EXPERIENCE
        </div>
        <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">
          {section.title}
        </h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="font-mono text-[10px] tracking-widest text-ink-3 uppercase">
          ORIGINAL
        </div>
        <div className="font-mono text-[10px] tracking-widest text-accent-hi uppercase">
          AI REWRITE
        </div>
      </div>

      {/* Bullets */}
      <div className="space-y-3">
        {section.bullets.map((bullet) => {
          const bulletId = `${bullet.experienceId}-${bullet.bulletIndex}`;
          const state = bulletStates[bulletId] || { status: 'pending' };
          const isExpanded = expandedBullet === bulletId;
          const isDone = state.status !== 'pending';

          const issueTypes: string[] = [];
          if (bullet.issues.some(i => i.type === 'weak_verb')) issueTypes.push('VAGUE VERB');
          if (bullet.issues.some(i => i.type === 'no_metrics')) issueTypes.push('NO METRIC');
          if (bullet.issues.some(i => i.type === 'too_brief')) issueTypes.push('WEAK');

          return (
            <div key={bulletId} className="mb-3">
              <div
                onClick={() => onExpand(isExpanded ? null : bulletId)}
                className={`cursor-pointer border transition-colors ${
                  isExpanded ? 'border-accent-hi' : 'border-rule'
                } ${isDone ? 'bg-bg opacity-65' : 'bg-card'}`}
              >
                {/* Bullet Header */}
                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Status Orb */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      state.status === 'accepted' ? 'bg-[#3d8a4a]' :
                      state.status === 'cut' ? 'bg-ink-3' :
                      state.status === 'rejected' ? 'bg-ink-3' :
                      'bg-accent-hi'
                    }`}
                  />

                  {/* Original Text */}
                  <div className={`flex-1 text-sm ${
                    isDone ? 'text-ink-3 italic' : 'text-ink'
                  } ${state.status === 'cut' ? 'line-through' : ''}`}>
                    {bullet.originalBullet}
                  </div>

                  {/* Flags */}
                  <div className="flex gap-1.5 shrink-0">
                    {issueTypes.map(flag => (
                      <Chip
                        key={flag}
                        label={flag}
                        bg={flagColors[flag]?.bg}
                        color={flagColors[flag]?.color}
                      />
                    ))}
                  </div>

                  {/* Expand Chevron */}
                  <ChevronDown
                    className={`w-3 h-3 text-ink-3 shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Expanded Diff */}
                {isExpanded && (
                  <div className="border-t border-rule px-4 py-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Original */}
                      <div className="px-3 py-3 bg-bg border-l-3 border-rule text-sm leading-relaxed text-ink-2">
                        {bullet.originalBullet}
                      </div>
                      {/* Rewrite */}
                      <div className="px-3 py-3 bg-accent-lo border-l-3 border-accent-hi text-sm leading-relaxed text-ink">
                        {bullet.suggestedRewrite}
                      </div>
                    </div>

                    {/* Issues */}
                    {bullet.issues.length > 0 && (
                      <div className="mb-4">
                        <div className="font-mono text-[10px] tracking-widest text-ink-3 uppercase mb-2">
                          ISSUES
                        </div>
                        <ul className="text-sm text-ink-2 space-y-1">
                          {bullet.issues.map(issue => (
                            <li key={issue.type}>
                              <span className="font-semibold text-ink">{issue.message}</span>
                              {issue.suggestion && (
                                <span className="text-ink-3 ml-2">→ {issue.suggestion}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetBulletState(bulletId, 'accepted'); }}
                        className="bg-accent-hi text-white px-4 py-2 text-xs font-semibold hover:opacity-90"
                      >
                        Accept rewrite ✓
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetBulletState(bulletId, 'rejected'); }}
                        className="bg-transparent text-ink-3 border border-rule px-4 py-2 text-xs font-semibold hover:bg-bg"
                      >
                        Keep original
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetBulletState(bulletId, 'pending'); }}
                        className="bg-transparent text-ink-3 px-3 py-2 text-xs"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}