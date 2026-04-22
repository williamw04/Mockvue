import { useState, useEffect } from 'react';
import { TopNavBar } from './TopNavBar';
import { useUser } from '../services';
import { UserProfile } from '../types';

// Mock Data from shared.jsx
const MV_DATA = {
  loop: [
    {
      id: 'onboard',
      label: 'Onboarding',
      caption: 'Profile & first resume pass',
      status: 'done',
      pct: 100,
    },
    {
      id: 'resume',
      label: 'Resume',
      caption: 'Analyze & tighten bullet points',
      status: 'active',
      pct: 64,
    },
    {
      id: 'stories',
      label: 'Core Stories',
      caption: 'Build your library of 10',
      status: 'active',
      pct: 60,
    },
    {
      id: 'sheets',
      label: 'Cheat Sheets',
      caption: 'Map stories to each company',
      status: 'next',
      pct: 33,
    },
    {
      id: 'practice',
      label: 'Practice',
      caption: 'Flashcards, mocks, voice agent',
      status: 'locked',
      pct: 0,
    },
    { id: 'ready', label: 'Interview', caption: 'Walk in prepared', status: 'locked', pct: 0 },
  ],
  stories: {
    built: 6,
    target: 10,
    categories: [
      { key: 'leadership', name: 'Leadership', count: 2, status: 'strong' },
      { key: 'conflict', name: 'Conflict', count: 0, status: 'missing' },
      { key: 'technical', name: 'Technical Challenge', count: 1, status: 'weak' },
      { key: 'failure', name: 'Failure / Learning', count: 1, status: 'ok' },
      { key: 'ambiguity', name: 'Ambiguity', count: 1, status: 'ok' },
      { key: 'influence', name: 'Influence w/o Authority', count: 1, status: 'ok' },
      { key: 'customer', name: 'Customer Obsession', count: 0, status: 'missing' },
      { key: 'growth', name: 'Growth Moment', count: 0, status: 'missing' },
      { key: 'crossfunc', name: 'Cross-functional', count: 0, status: 'missing' },
      { key: 'prioritization', name: 'Prioritization', count: 0, status: 'missing' },
    ],
  },
  resume: {
    score: 68,
    target: 85,
    hotZones: 4,
    vulnerabilities: 3,
  },
  companies: [
    {
      name: 'Northwind Media',
      role: 'Sr. PM, Playback',
      when: 'Thu · 2:00 PM',
      days: 3,
      ready: 82,
      stage: 'final round',
      tone: 'ember',
    },
    {
      name: 'Atlas Logistics',
      role: 'PM, Routing',
      when: 'Next Tue · 10:30 AM',
      days: 7,
      ready: 54,
      stage: 'hiring manager',
      tone: 'cobalt',
    },
    {
      name: 'Pennant',
      role: 'Staff PM',
      when: 'Apr 29 · 11:00 AM',
      days: 10,
      ready: 31,
      stage: 'recruiter screen',
      tone: 'moss',
    },
  ],
  activity: [
    {
      kind: 'resume',
      text: 'Rewrote bullet: "Led redesign" → "Led redesign of $4.2M checkout flow; +18% conversion"',
      when: '12m ago',
    },
    {
      kind: 'story',
      text: 'New story saved · Technical Challenge · "Vendor migration"',
      when: '1h ago',
    },
    { kind: 'sheet', text: 'Created cheat sheet · Northwind Media', when: 'Yesterday' },
    { kind: 'resume', text: 'AI flagged 3 vague verbs in Experience §', when: 'Yesterday' },
  ],
};

// SVG Ring Component
function MVRing({
  pct,
  size = 40,
  stroke = 3,
  color = '#1a1814',
  track = 'rgba(26,24,20,0.09)',
  children,
}: any) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s' }}
        />
      </svg>
      {children && (
        <div
          className="absolute inset-0 flex items-center justify-center font-semibold"
          style={{ fontSize: size * 0.28 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MVDot({ c, size = 8 }: { c: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: size,
        background: c,
        flexShrink: 0,
      }}
    />
  );
}

export function Dashboard() {
  const [activeStep, setActiveStep] = useState('stories');
  const steps = MV_DATA.loop;

  // Real data integrations
  const userService = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    userService.getUserProfile().then(setProfile).catch(console.error);
  }, [userService]);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopNavBar />

      {/* Hero greeting */}
      <div className="px-14 py-10 pb-7">
        <div className="font-mono text-[11px] tracking-wider text-ink-3 mb-3.5 uppercase">
          Tuesday · Apr 21 · 09:14
        </div>
        <h1 className="font-serif text-[52px] font-normal tracking-tight m-0 leading-tight">
          Good morning, {profile?.name?.split(' ')[0] || 'Alex'}.<br />
          <span className="text-ink-3">Northwind is in 3 days. Here's where you stand.</span>
        </h1>
      </div>

      {/* Linear Roadmap */}
      <div className="px-14 py-6 pb-3 relative">
        <div className="flex items-baseline justify-between mb-6">
          <div className="text-[13px] font-semibold text-ink-2 tracking-wide uppercase">
            The Core Loop
          </div>
          <div className="font-mono text-[11px] text-ink-3">2 of 6 complete · 38% overall</div>
        </div>
        <Roadmap steps={steps} active={activeStep} onSelect={setActiveStep} />
      </div>

      {/* Lower grid */}
      <div className="px-14 py-10 pb-14 grid grid-cols-[1.35fr_1fr] gap-8">
        <ActiveStepCard stepId={activeStep} />
        <div className="flex flex-col gap-6">
          <UpcomingInterviews />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

function Roadmap({ steps, active, onSelect }: any) {
  const totalPct = (steps.reduce((s: number, x: any) => s + x.pct, 0) / (steps.length * 100)) * 100;

  return (
    <div className="relative py-4 pb-2">
      {/* Rails */}
      <div className="absolute top-[46px] left-8 right-8 h-[2px] bg-rule" />
      <div
        className="absolute top-[46px] left-8 h-[2px] bg-accent-hi transition-all duration-500"
        style={{ width: `calc(${totalPct}% - 64px)`, minWidth: 0 }}
      />
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((s: any, i: number) => {
          const isActive = s.id === active;
          const done = s.status === 'done';
          const progress = s.status === 'active';
          const locked = s.status === 'locked';
          const color = done ? '#d9532b' : progress ? '#d9532b' : locked ? '#8a857d' : '#4a4640';
          const bg = done ? '#d9532b' : '#fff';
          const border = done ? '#d9532b' : progress ? '#d9532b' : 'rgba(26,24,20,0.09)';

          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="bg-transparent border-none cursor-pointer py-4 flex flex-col items-center justify-start gap-3 relative group"
            >
              <div className="font-mono text-[10px] text-ink-3 tracking-widest">
                STAGE {String(i + 1).padStart(2, '0')}
              </div>
              <div className="relative z-10">
                {progress ? (
                  <MVRing pct={s.pct} size={36} stroke={3} color="#d9532b">
                    <span className="text-[11px] font-mono text-accent-hi">{s.pct}</span>
                  </MVRing>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-semibold transition-colors"
                    style={{
                      background: bg,
                      border: `2px solid ${border}`,
                      color: done ? '#fff' : color,
                    }}
                  >
                    {done ? (
                      '✓'
                    ) : locked ? (
                      <svg
                        width="11"
                        height="13"
                        viewBox="0 0 11 13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      >
                        <rect x="1.5" y="5.5" width="8" height="6" rx="1" />
                        <path d="M3 5.5V3.5a2.5 2.5 0 015 0v2" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                )}
                {isActive && (
                  <div className="absolute -inset-1.5 rounded-full border-[1.5px] border-accent-hi pointer-events-none" />
                )}
              </div>
              <div className="text-center">
                <div className={`text-[14px] font-semibold ${locked ? 'text-ink-3' : 'text-ink'}`}>
                  {s.label}
                </div>
                <div className="text-[12px] text-ink-3 mt-0.5 max-w-[150px]">{s.caption}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActiveStepCard({ stepId }: { stepId: string }) {
  const step = MV_DATA.loop.find((s) => s.id === stepId)!;
  const isStories = stepId === 'stories';
  const isResume = stepId === 'resume';
  const isSheets = stepId === 'sheets';

  return (
    <div className="bg-card border border-rule p-7 h-fit">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="font-mono text-[10px] text-accent-hi tracking-widest mb-1.5">
            ACTIVE · {step.status.toUpperCase()}
          </div>
          <h2 className="font-serif text-[32px] font-normal m-0 tracking-tight leading-tight">
            {step.label}
          </h2>
          <div className="text-[14px] text-ink-2 mt-1.5">{step.caption}</div>
        </div>
        <MVRing pct={step.pct} size={56} stroke={4} color="#d9532b">
          <span className="text-[13px] text-accent-hi font-semibold">{step.pct}%</span>
        </MVRing>
      </div>

      {isStories && <StoriesDetail />}
      {isResume && <ResumeDetail />}
      {isSheets && <SheetsDetail />}
      {!isStories && !isResume && !isSheets && (
        <div className="mt-6 py-6 text-ink-3 text-[14px]">Select a stage above.</div>
      )}

      <div className="flex gap-2 mt-6 pt-5 border-t border-rule">
        <button className="bg-accent-hi text-white border-none px-4.5 py-2.5 text-[13px] font-semibold cursor-pointer font-sans">
          Continue building {isStories ? 'stories' : isResume ? 'resume' : 'sheets'} →
        </button>
        <button className="bg-transparent text-ink border border-rule px-4.5 py-2.5 text-[13px] cursor-pointer font-sans hover:bg-bg transition-colors">
          View all 10 categories
        </button>
      </div>
    </div>
  );
}

function StoriesDetail() {
  const cats = MV_DATA.stories.categories;
  const statusStyle: Record<string, { label: string; c: string }> = {
    strong: { label: 'Strong', c: '#3d8a4a' },
    ok: { label: 'OK', c: '#d9532b' }, // accent.hi
    weak: { label: 'Thin', c: '#c7851a' },
    missing: { label: 'Missing', c: '#8a857d' },
  };

  return (
    <div className="mt-7">
      <div className="flex items-baseline justify-between mb-3.5">
        <div className="text-[13px] text-ink-2 font-medium">
          <span className="font-mono text-ink text-[14px]">{MV_DATA.stories.built}</span>
          <span className="text-ink-3"> / {MV_DATA.stories.target} stories in library</span>
        </div>
        <div className="text-[11px] text-ink-3 font-mono tracking-wide">The Rule of 10</div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
        {cats.map((c) => {
          const s = statusStyle[c.status];
          return (
            <div key={c.key} className="bg-white px-3.5 py-2.5 flex items-center gap-2.5">
              <MVDot c={s.c} size={7} />
              <div className="flex-1 text-[13px] text-ink truncate">{c.name}</div>
              <div className="text-[11px] font-mono text-ink-3">
                {c.count > 0 ? `${c.count} saved` : '—'}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3.5 p-3 bg-accent-lo text-[13px] flex items-center gap-2.5">
        <div className="font-mono text-[10px] text-accent-hi tracking-widest font-semibold">
          COACH
        </div>
        <div className="text-ink">
          You're missing <b className="font-semibold">Conflict</b> and{' '}
          <b className="font-semibold">Customer Obsession</b> — both likely at Northwind.
        </div>
      </div>
    </div>
  );
}

function ResumeDetail() {
  const r = MV_DATA.resume;
  return (
    <div className="mt-7 grid grid-cols-3 gap-4">
      <StatBlock big={r.score} small={`/ ${r.target} target`} label="ATS Score" color="#d9532b" />
      <StatBlock big={r.hotZones} small="impressive" label="Hot Zones" color="#3d8a4a" />
      <StatBlock
        big={r.vulnerabilities}
        small="need work"
        label="Vulnerabilities"
        color="#c7851a"
      />
    </div>
  );
}

function SheetsDetail() {
  return (
    <div className="mt-5 text-[14px] text-ink-2">
      1 of 3 cheat sheets complete. Build Atlas and Pennant before next week.
    </div>
  );
}

function StatBlock({ big, small, label, color }: any) {
  return (
    <div className="border border-rule p-3.5">
      <div className="text-[10px] tracking-widest text-ink-3 font-mono mb-2 uppercase">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="font-serif text-[40px] font-normal leading-none" style={{ color }}>
          {big}
        </div>
        <div className="text-[12px] text-ink-3">{small}</div>
      </div>
    </div>
  );
}

function UpcomingInterviews() {
  return (
    <div>
      <div className="text-[13px] font-semibold text-ink-2 tracking-wide uppercase mb-3.5">
        Upcoming
      </div>
      <div className="flex flex-col gap-2.5">
        {MV_DATA.companies.map((c, i) => (
          <div
            key={c.name}
            className="bg-card border border-rule px-4 py-3.5 flex items-center gap-3.5 hover:bg-bg transition-colors cursor-pointer"
          >
            <div
              className={`w-11 h-11 flex items-center justify-center font-serif text-lg text-white ${i === 0 ? 'bg-accent-hi' : 'bg-ink'}`}
            >
              {c.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-ink truncate">{c.name}</div>
              <div className="text-[12px] text-ink-3 truncate">
                {c.role} · {c.stage}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-mono text-[11px] font-semibold ${c.days <= 3 ? 'text-accent-hi' : 'text-ink-2'}`}
              >
                {c.days}d
              </div>
              <div className="text-[10px] text-ink-3 mt-0.5">{c.ready}% ready</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div>
      <div className="text-[13px] font-semibold text-ink-2 tracking-wide uppercase mb-3.5">
        Recent
      </div>
      <div className="flex flex-col gap-0.5">
        {MV_DATA.activity.map((a, i) => (
          <div
            key={i}
            className={`py-2.5 flex gap-3 ${i < MV_DATA.activity.length - 1 ? 'border-b border-rule' : ''}`}
          >
            <div className="font-mono text-[10px] text-ink-3 w-[54px] shrink-0 pt-0.5">
              {a.when}
            </div>
            <div className="text-[13px] text-ink-2 leading-relaxed">{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
