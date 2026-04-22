import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MV_SHEET, MV_SHEET_PROGRESS } from './mock-sheet-data';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network load
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <LoadingSpinner />;

  const s = MV_SHEET;

  return (
    <div className="font-sans bg-bg text-ink w-full h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-3.5 border-b border-rule bg-card flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-5 h-5 rounded bg-ink relative overflow-hidden cursor-pointer"
            onClick={() => navigate('/document')}
            title="Back to Cheat Sheets"
          >
            <div className="absolute inset-[4px] border-2 border-accent-hi rounded-[1px] border-l-0 border-t-0" />
          </div>
          <div className="font-serif text-[16px] font-medium cursor-pointer" onClick={() => navigate('/document')}>
            Mockvue
          </div>
          <div className="text-[12px] text-ink-3">
            / Cheat Sheets / <b className="text-ink">{s.meta.company}</b>
          </div>
        </div>
        <div className="flex-1" />
        <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
          T–{s.meta.daysOut}d · SAVED {s.meta.lastEdited}
        </div>
        <div className="flex items-center gap-2.5 ml-2">
          <div className="font-mono text-[11px] text-accent-hi font-semibold tracking-wide">
            {s.meta.ready}% READY
          </div>
          <button className="bg-transparent border border-rule px-3 py-1.5 text-[12px] cursor-pointer font-sans text-ink hover:bg-bg transition-colors">
            Export PDF
          </button>
          <button className="bg-accent-hi text-white border-none px-3 py-1.5 text-[12px] font-semibold cursor-pointer font-sans hover:opacity-90 transition-opacity">
            Practice →
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[240px_1fr] overflow-hidden">
        {/* Left nav */}
        <aside className="border-r border-rule bg-card overflow-y-auto py-5">
          <button 
            onClick={() => navigate('/document')}
            className="flex items-center gap-2 px-5 mb-5 text-[12px] text-ink-2 hover:text-ink transition-colors font-sans"
          >
            ← Back to all sheets
          </button>
          
          <div className="px-5 pb-3.5 font-mono text-[10px] text-ink-3 tracking-[1.5px]">
            SECTIONS
          </div>
          {MV_SHEET_PROGRESS.map((sec, i) => {
            const isActive = i === 2; // Hardcode "Story Bank" as active for the prototype demo
            return (
              <div 
                key={sec.id} 
                className={`px-5 py-2 flex items-center gap-2.5 cursor-pointer border-l-2 transition-colors ${
                  isActive ? 'bg-accent-lo border-accent-hi' : 'bg-transparent border-transparent hover:bg-bg'
                }`}
              >
                <div className="font-mono text-[10px] text-ink-3 w-4">
                  {String(sec.n).padStart(2, '0')}
                </div>
                <div className={`flex-1 text-[13px] ${sec.locked ? 'text-ink-3' : 'text-ink'} ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {sec.name}
                </div>
                {sec.locked ? (
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ink-3">
                    <rect x="1.5" y="5.5" width="7" height="5.5" rx="1" />
                    <path d="M3 5.5V3.5a2 2 0 014 0v2" />
                  </svg>
                ) : (
                  <span className={`font-mono text-[10px] ${sec.pct === 100 ? 'text-[#3d8a4a]' : 'text-accent-hi'}`}>
                    {sec.pct}%
                  </span>
                )}
              </div>
            );
          })}
          <div className="p-5 mt-2.5 border-t border-rule">
            <div className="font-mono text-[10px] text-ink-3 tracking-[1.5px] mb-2.5">
              GAPS
            </div>
            <div className="p-2.5 bg-accent-lo border-l-2 border-accent-hi text-[12px] text-ink leading-relaxed">
              Missing a <b className="font-semibold">"Bias for Impact"</b> story. Draft before Wednesday.
            </div>
          </div>
        </aside>

        {/* Document Pane */}
        <div className="overflow-y-auto bg-bg">
          <div className="max-w-[720px] mx-auto px-[60px] py-[48px] pb-[80px]">
            {/* Title */}
            <div className="font-mono text-[10px] tracking-[2px] text-accent-hi uppercase">
              Behavioral Interview Cheat Sheet
            </div>
            <h1 className="font-serif text-[44px] font-normal tracking-[-0.8px] leading-[1.05] mt-2.5 mb-1.5 text-ink">
              {s.meta.company}
            </h1>
            <div className="text-[14px] text-ink-2 italic font-serif">
              {s.meta.role} · {s.meta.date}
            </div>
            <hr className="border-none border-t-2 border-ink my-6 mb-8" />

            {/* § 1 Company Snapshot */}
            <Section n={1} title="Company Snapshot" />
            <Dl rows={[
              ['Company', s.snapshot.name],
              ['Industry / Product', s.snapshot.industry],
              ['Business Model', s.snapshot.model],
              ['Key Competitors', s.snapshot.competitors.join(' · ')],
              ['Values / Principles', s.snapshot.values.map((v, i) => <em key={i} className="font-serif mr-2.5">"{v}"</em>)],
            ]} />
            <SubHead>Recent News (last 3–6 months)</SubHead>
            <ul className="m-0 mb-4.5 pl-4.5 text-[14px] leading-[1.7] text-ink-2 list-disc">
              {s.snapshot.news.map((n, i) => <li key={i} className="mb-0.5">{n}</li>)}
            </ul>
            <SubHead>Strategic Direction (inferred)</SubHead>
            <p className="text-[14px] leading-[1.6] text-ink-2 m-0 mb-3.5 italic">
              {s.snapshot.strategy}
            </p>

            {/* § 2 Role */}
            <Section n={2} title="Role Breakdown" />
            <Dl rows={[
              ['Role', s.role.title],
              ['Team / Org', s.role.team],
            ]} />
            <SubHead>Key Responsibilities</SubHead>
            <ul className="m-0 mb-4.5 pl-4.5 text-[14px] leading-[1.7] text-ink-2 list-disc">
              {s.role.responsibilities.map((r, i) => <li key={i} className="mb-0.5">{r}</li>)}
            </ul>
            <SubHead>Top Skills Required</SubHead>
            <div className="flex flex-wrap gap-1.5 mb-4.5">
              {s.role.skills.map((k, i) => (
                <span key={i} className="px-2.5 py-1 bg-card border border-rule text-[12px] text-ink">
                  {k}
                </span>
              ))}
            </div>
            <SubHead>What Success Looks Like</SubHead>
            <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-3.5 mb-4.5 text-[14px] leading-relaxed text-ink-2">
              <div className="font-mono text-[11px] text-ink-3">0–3 MO</div><div>{s.role.success.m3}</div>
              <div className="font-mono text-[11px] text-ink-3">3–6 MO</div><div>{s.role.success.m6}</div>
              <div className="font-mono text-[11px] text-ink-3">6–12 MO</div><div>{s.role.success.m12}</div>
            </div>
            <SubHead>Hiring Signals (inferred, weighted)</SubHead>
            <div className="border border-rule bg-card mb-4.5">
              {s.role.signals.map((sig, i) => (
                <div key={i} className={`p-2.5 px-3.5 ${i > 0 ? 'border-t border-rule' : ''} grid grid-cols-[1fr_1fr_60px] gap-3 items-center text-[13px]`}>
                  <div className="font-medium text-ink">{sig.s}</div>
                  <div className="text-ink-3 italic">{sig.evidence}</div>
                  <div className={`font-mono text-[10px] text-right ${sig.p === 'High' ? 'text-accent-hi' : 'text-ink-2'}`}>
                    {sig.p.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* § 3 Story Bank */}
            <Section n={3} title="Story Bank" count={s.stories.length} />
            {s.stories.map((st, i) => <StoryCard key={i} story={st} />)}

            {/* § 4 Question Mapping */}
            <Section n={4} title="Question Mapping" />
            <div className="border border-rule bg-card">
              {s.questionMap.map((q, i) => (
                <div key={i} className={`p-3.5 px-4 ${i > 0 ? 'border-t border-rule' : ''}`}>
                  <div className="font-serif text-[15px] italic mb-2 text-ink">"{q.q}"</div>
                  <div className="flex gap-5 text-[12px]">
                    <div>
                      <span className="font-mono text-[10px] text-accent-hi tracking-[1px] mr-1.5">PRIMARY</span>
                      <b className="font-semibold text-ink">{q.primary}</b>
                    </div>
                    <div className={q.backup ? 'text-ink-2' : 'text-ink-3'}>
                      <span className="font-mono text-[10px] text-ink-3 tracking-[1px] mr-1.5">BACKUP</span>
                      {q.backup || <i className="italic">— none yet —</i>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* § 5 Alignment */}
            <Section n={5} title="Company-Specific Alignment" />
            <SubHead>Value → Story</SubHead>
            <div className="border border-rule bg-card mb-4.5">
              {s.alignment.valueToStory.map((a, i) => {
                const colorClass = a.strength === 'missing' ? 'text-accent-hi' : a.strength === 'strong' ? 'text-[#3d8a4a]' : 'text-ink-2';
                return (
                  <div key={i} className={`p-3 px-3.5 ${i > 0 ? 'border-t border-rule' : ''} grid grid-cols-[200px_1fr_80px] gap-3.5 items-center`}>
                    <div className="font-serif text-[14px] italic text-ink">"{a.v}"</div>
                    <div className={`text-[13px] ${a.story ? 'text-ink not-italic' : 'text-accent-hi italic'}`}>
                      {a.story || '— draft required —'}
                    </div>
                    <div className={`font-mono text-[10px] text-right ${colorClass}`}>
                      {a.strength.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
            <SubHead>Most Relevant Experiences</SubHead>
            <ul className="m-0 mb-4.5 pl-4.5 text-[14px] leading-[1.7] text-ink-2 list-disc">
              {s.alignment.mostRelevant.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}
            </ul>
            <SubHead>Potential Gaps / Risks</SubHead>
            <ul className="m-0 mb-4.5 pl-4.5 text-[14px] leading-[1.7] text-accent-hi list-disc">
              {s.alignment.gaps.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}
            </ul>

            {/* § 6 Strengths & Weaknesses */}
            <Section n={6} title="Strengths & Weaknesses" />
            <div className="grid grid-cols-2 gap-4.5 mb-5">
              <div>
                <SubHead>Strengths</SubHead>
                {s.strengthsWeaknesses.strengths.map((x, i) => (
                  <div key={i} className="py-2.5 border-b border-dotted border-rule text-[13px]">
                    <div className="font-semibold text-ink">{x.s}</div>
                    <div className="text-ink-3 text-[12px] mt-0.5">→ {x.story}</div>
                  </div>
                ))}
              </div>
              <div>
                <SubHead>Weaknesses & Mitigation</SubHead>
                {s.strengthsWeaknesses.weaknesses.map((x, i) => (
                  <div key={i} className="py-2.5 border-b border-dotted border-rule text-[13px]">
                    <div className="font-semibold text-ink">{x.w}</div>
                    <div className="text-ink-2 text-[12px] mt-0.5 italic">{x.mit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* § 7 Talking Points */}
            <Section n={7} title="Key Talking Points" />
            <TalkingCard label="Tell me about yourself · 30–60s" text={s.talkingPoints.tmay} />
            <TalkingCard label="Career narrative · 1–2 min" text={s.talkingPoints.narrative} />
            <TalkingCard label="Why this company" text={s.talkingPoints.whyCompany} />
            <TalkingCard label="Why this role" text={s.talkingPoints.whyRole} />

            {/* § 8 Questions for Interviewer */}
            <Section n={8} title="Questions for Interviewer" />
            <QGroup title="About the role" items={s.questionsForInterviewer.role} />
            <QGroup title="About the team" items={s.questionsForInterviewer.team} />
            <QGroup title="About the company" items={s.questionsForInterviewer.company} />

            {/* § 9 Logistics */}
            <Section n={9} title="Logistics & Notes" />
            <Dl rows={[
              ['Round', s.logistics.round],
              ['When', s.logistics.dates.map(d => `${d.when} · ${d.type}`).join(' · ')],
            ]} />
            <SubHead>Interviewers</SubHead>
            <div className="border border-rule bg-card mb-4.5">
              {s.logistics.interviewers.map((p, i) => (
                <div key={i} className={`p-3 px-3.5 ${i > 0 ? 'border-t border-rule' : ''}`}>
                  <div className="flex justify-between mb-1">
                    <b className="text-[14px] text-ink">{p.name}</b>
                    <span className="text-[12px] text-ink-3">{p.role}</span>
                  </div>
                  <div className="text-[12px] text-ink-2 italic">{p.notes}</div>
                </div>
              ))}
            </div>

            {/* § 10 Reflection */}
            <Section n={10} title="Post-Interview Reflection" locked />
            <div className="p-6 border-[1.5px] border-dashed border-ink-3 bg-[rgba(0,0,0,0.02)] text-center">
              <div className="text-[13px] text-ink-3 font-serif italic">
                Unlocks after Thursday, Apr 24 at 2:45 PM.<br />
                You'll be prompted to fill: what went well, what didn't, questions you struggled with, stories to add.
              </div>
            </div>

            <div className="mt-10 pt-5 border-t-2 border-ink flex justify-between font-mono text-[10px] text-ink-3 tracking-[1px] uppercase">
              <div>— END OF BRIEF · MOCKVUE · {s.snapshot.name} —</div>
              <div>P. 1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── atoms ────────────────────────

function Section({ n, title, count, locked }: any) {
  return (
    <div className="my-[34px] mb-[18px]">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-[22px] italic text-ink-3">§ {n}.</span>
        <h2 className={`font-serif text-[28px] font-medium m-0 tracking-[-0.4px] ${locked ? 'text-ink-3' : 'text-ink'}`}>
          {title}
        </h2>
        {count && <span className="text-[12px] text-ink-3 font-mono">· {count} entries</span>}
        {locked && (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ink-3">
            <rect x="1.5" y="5.5" width="8" height="6" rx="1" />
            <path d="M3 5.5V3.5a2.5 2.5 0 015 0v2" />
          </svg>
        )}
      </div>
      <div className="h-[1px] bg-rule mt-2.5" />
    </div>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[1.5px] text-ink-3 mb-2 uppercase">
      {children}
    </div>
  );
}

function Dl({ rows }: { rows: [string, any][] }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-y-1.5 gap-x-4 mb-4.5">
      {rows.map(([k, v], i) => (
        <Fragment key={i}>
          <div className="font-mono text-[11px] text-ink-3 tracking-[0.5px] uppercase pt-[3px]">
            {k}
          </div>
          <div className="text-[14px] text-ink-2 leading-relaxed">
            {v}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function StoryCard({ story }: any) {
  return (
    <div className="bg-card border border-rule border-l-[3px] border-l-accent-hi p-4 px-4.5 mb-3.5">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-serif text-[19px] font-medium m-0 text-ink">{story.title}</h3>
        <div className="flex gap-1">
          {story.tags.map((tag: string, i: number) => (
            <span key={i} className="text-[10px] font-mono py-[2px] px-1.5 bg-bg text-ink-2 tracking-[0.5px]">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[18px_1fr] gap-y-1.5 gap-x-3 text-[13px] leading-[1.55]">
        <div className="font-mono text-[10px] text-accent-hi font-bold pt-[2px]">S</div>
        <div className="text-ink-2">{story.star.s}</div>
        <div className="font-mono text-[10px] text-accent-hi font-bold pt-[2px]">T</div>
        <div className="text-ink-2">{story.star.t}</div>
        <div className="font-mono text-[10px] text-accent-hi font-bold pt-[2px]">A</div>
        <div className="text-ink-2">{story.star.a}</div>
        <div className="font-mono text-[10px] text-accent-hi font-bold pt-[2px]">R</div>
        <div className="text-ink font-medium">{story.star.r}</div>
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-dotted border-rule text-[12px] text-ink-2 italic">
        Takeaway: {story.takeaway}
      </div>
      {story.followups.length > 0 && (
        <div className="mt-1.5 text-[11px] text-ink-3">
          Follow-ups · {story.followups.join(' · ')}
        </div>
      )}
    </div>
  );
}

function TalkingCard({ label, text }: any) {
  return (
    <div className="bg-card border border-rule p-3.5 px-4 mb-3">
      <div className="font-mono text-[10px] text-ink-3 tracking-[1.5px] mb-1.5 uppercase">
        {label}
      </div>
      <div className="font-serif text-[15px] leading-[1.55] text-ink">
        {text}
      </div>
    </div>
  );
}

function QGroup({ title, items }: any) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] text-ink-3 tracking-[1.5px] mb-2 uppercase">
        {title}
      </div>
      <ol className="m-0 pl-5 text-[14px] leading-[1.65] text-ink-2 font-serif list-decimal">
        {items.map((x: string, i: number) => (
          <li key={i} className="mb-[3px]">"{x}"</li>
        ))}
      </ol>
    </div>
  );
}
