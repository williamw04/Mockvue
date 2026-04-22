import type { BulletAnalysis } from '../../types';

interface BulletState {
  status: 'pending' | 'accepted' | 'rejected' | 'cut';
}

interface Section {
  id: string;
  title: string;
  bullets: BulletAnalysis[];
}

interface SectionNavProps {
  sections: Section[];
  activeSection: string;
  onSelectSection: (id: string) => void;
  bulletStates: Record<string, BulletState>;
}

export function SectionNav({
  sections,
  activeSection,
  onSelectSection,
  bulletStates,
}: SectionNavProps) {
  const stats = {
    bullets: sections.reduce((sum, s) => sum + s.bullets.length, 0),
    accepted: sections.reduce(
      (sum, s) =>
        sum +
        s.bullets.filter(
          (b) => bulletStates[b.experienceId + '-' + b.bulletIndex]?.status !== 'pending'
        ).length,
      0
    ),
  };

  return (
    <aside className="border-r border-rule bg-card overflow-y-auto py-5">
      <div className="px-4 pb-3 font-mono text-[10px] text-ink-3 tracking-widest uppercase">
        SECTIONS
      </div>

      {sections.map((section) => {
        const doneCount = section.bullets.filter(
          (b) => bulletStates[b.experienceId + '-' + b.bulletIndex]?.status !== 'pending'
        ).length;
        const percent = Math.round((doneCount / section.bullets.length) * 100);

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            className={`px-4 py-3 cursor-pointer border-l-2 transition-colors ${
              activeSection === section.id
                ? 'border-accent-hi bg-accent-lo'
                : 'border-transparent hover:bg-bg'
            }`}
          >
            <div className={`text-sm mb-2 ${activeSection === section.id ? 'font-semibold' : ''}`}>
              {section.title.split('·')[0].trim()}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-rule rounded-sm">
                <div
                  className={`h-full rounded-sm transition-all ${percent === 100 ? 'bg-[#3d8a4a]' : 'bg-accent-hi'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-ink-3">
                {doneCount}/{section.bullets.length}
              </span>
            </div>
          </div>
        );
      })}

      <div className="px-4 pt-4 mt-4 border-t border-rule">
        <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">STATS</div>
        <div className="space-y-2">
          {[
            ['Bullets', stats.bullets.toString()],
            ['Accepted', stats.accepted.toString()],
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
