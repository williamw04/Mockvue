import type { ResumeAnalysis } from '../../types';
import { RingProgress } from './RingProgress';

interface CompanyChat {
  id: string;
  name: string;
  score?: number;
  jobDescription?: string;
  keywords?: { kw: string; found: boolean }[];
}

interface InsightsRailProps {
  chat: CompanyChat | undefined;
  analysis: ResumeAnalysis | null;
  hasJobDescription: boolean;
}

export function InsightsRail({ chat, analysis, hasJobDescription }: InsightsRailProps) {
  if (!analysis) {
    return (
      <aside className="border-l border-rule bg-card overflow-y-auto px-5 py-6">
        <div className="text-center text-ink-3 text-sm">
          Run analysis to see insights
        </div>
      </aside>
    );
  }

  const score = hasJobDescription && chat?.score ? chat.score : analysis.overallScore;
  const keywords = hasJobDescription && chat?.keywords ? chat.keywords : [];

  return (
    <aside className="border-l border-rule bg-card overflow-y-auto px-5 py-6 flex flex-col gap-6">
      {/* Score */}
      <div className="text-center">
        <RingProgress percent={score} size={72} stroke={5} color="#d9532b" />
        <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mt-3">
          {hasJobDescription ? 'JOB FIT SCORE' : 'RESUME SCORE'}
        </div>
      </div>

      {/* Keyword Coverage - Only shown if job description uploaded */}
      {hasJobDescription && keywords.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">
            KEYWORD COVERAGE
          </div>
          <div className="space-y-2">
            {keywords.map((kw, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-rule last:border-0">
                <div 
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    kw.found ? 'bg-[#3d8a4a]' : 'bg-[#ef4444]'
                  }`} 
                />
                <span className={`flex-1 text-sm ${kw.found ? 'text-ink' : 'text-[#b91c1c]'}`}>
                  {kw.kw}
                </span>
                {!kw.found && (
                  <span className="font-mono text-[9px] text-[#b91c1c] tracking-wide">
                    MISSING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Todos */}
      <div>
        <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">
          AI TODOS
        </div>
        <div className="space-y-3">
          {analysis.bulletAnalyses
            .filter(b => b.impactScore < 5)
            .slice(0, 4)
            .map((bullet, i) => (
              <div 
                key={i} 
                className="pl-3 border-l-2 border-accent-hi text-sm text-ink-2 leading-relaxed"
              >
                <div className="font-medium text-ink mb-1">
                  Improve bullet: "{bullet.originalBullet.slice(0, 40)}..."
                </div>
                <div className="font-mono text-[9px] text-accent-hi tracking-wide">
                  HIGH PRIORITY
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="border-t border-rule pt-4">
        <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">
          SUMMARY
        </div>
        <div className="space-y-2">
          {[
            ['Bullets analyzed', analysis.bulletAnalyses.length.toString()],
            ['Avg impact score', Math.round(
              analysis.bulletAnalyses.reduce((sum, b) => sum + b.impactScore, 0) / 
              Math.max(analysis.bulletAnalyses.length, 1)
            ).toString()],
            ['Trigger points', analysis.triggerPoints.length.toString()],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm text-ink-2">
              <span>{label}</span>
              <span className="font-semibold text-ink">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}