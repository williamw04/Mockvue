export const MV_SHEET = {
  meta: {
    company: 'Northwind Media',
    role: 'Senior PM, Playback',
    date: 'Thu Apr 24, 2:00 PM PT',
    daysOut: 3,
    ready: 82,
    lastEdited: '2m ago',
  },
  // § 1
  snapshot: {
    name: 'Northwind Media',
    industry: 'Subscription streaming · video',
    model: "D2C subscription + ad-supported tier (launched Q4 '25)",
    competitors: ['Tube+', 'Vantage', 'Kestrel', 'Stagebox'],
    values: [
      'Radical Candor',
      'Context not Control',
      'Highly Aligned · Loosely Coupled',
      'Bias for Impact',
    ],
    news: [
      "Q2 '25 — first profitable quarter, +14% retention after live sports tier",
      "Feb '26 — acquired Stagebox (live events infra) for $340M",
      "Mar '26 — laid off 4% of Growth org; doubled down on Playback quality",
    ],
    strategy: 'Moving from "more content" to "better playback" — infra & quality over new tiers.',
  },
  // § 2
  role: {
    title: 'Senior Product Manager, Playback',
    team: 'Playback org · ~35 people · reports to Rita Chen (HM)',
    responsibilities: [
      'Own the player surface across web, mobile, TV',
      'Partner with video infra on buffering / startup-time SLOs',
      'Drive the live-events playback roadmap post-Stagebox',
    ],
    skills: [
      'Video/streaming domain depth',
      'Cross-functional leadership',
      'Experimentation & metrics rigor',
      'Technical fluency w/ infra teams',
    ],
    success: {
      m3: 'Shipped one quality win; earned trust w/ infra leads',
      m6: 'Owned playback roadmap for one platform end-to-end',
      m12: 'Moved startup-time or rebuffer rate by a measurable %',
    },
    signals: [
      {
        s: 'Video infrastructure domain experience',
        evidence: 'JD mentions "streaming infra" 3x',
        p: 'High',
      },
      {
        s: 'Shipped launches with measurable KPIs',
        evidence: 'JD asks for "numerate PMs"',
        p: 'High',
      },
      {
        s: 'Comfort operating without tight guidance',
        evidence: '"Context not Control" value',
        p: 'Medium',
      },
      { s: 'Cross-team influence at scale', evidence: 'Role spans 3 platforms', p: 'Medium' },
    ],
  },
  // § 3
  stories: [
    {
      title: 'Helix playback migration',
      tags: ['Leadership', 'Technical', 'Ownership'],
      star: {
        s: 'Helix video player was on a deprecated SDK; 22% of sessions buffered > 3s.',
        t: 'Lead a 4-team migration with no formal authority, on a 90-day deadline.',
        a: 'Wrote a shared RFC, moved standups to async, ran weekly unblock-only syncs.',
        r: 'Shipped 2 weeks early. Rebuffer fell from 22% → 7%. +$1.4M ARR from churn save.',
      },
      takeaway: 'Async docs > sync meetings when work is parallelizable.',
      followups: [
        'What would you do differently? — start infra-team syncs earlier.',
        'Deep dive: the one week we slipped on TV.',
      ],
    },
    {
      title: 'VP disagreement on checkout',
      tags: ['Conflict', 'Radical Candor'],
      star: {
        s: 'VP wanted a radical checkout rewrite. Data suggested it would tank conversion.',
        t: 'Push back with evidence without burning the relationship.',
        a: 'Ran a 2-week painted-door test. Presented results 1:1 before escalating.',
        r: 'We pursued a simpler A/B instead. +18% on checkout conversion over the quarter.',
      },
      takeaway: 'Candor travels farther when you bring a test, not just an opinion.',
      followups: ['What if the test had agreed with the VP?'],
    },
    {
      title: 'Q3 roadmap autonomy',
      tags: ['Leadership', 'Context not Control'],
      star: {
        s: 'My four-PM team was waiting on me to shape every quarterly plan.',
        t: 'Shift from directing to coaching without losing strategic alignment.',
        a: 'Gave each PM a north-star metric + a 48h decision SLA from me. No roadmap reviews.',
        r: 'Roadmap quality rose (3 → 5 "ship-worthy" bets). I reclaimed 6h/wk.',
      },
      takeaway: 'Clarity of goal > clarity of plan.',
      followups: [],
    },
    {
      title: 'Vendor migration',
      tags: ['Cross-functional', 'Aligned · Loosely Coupled'],
      star: {
        s: 'We needed to swap our transcoding vendor across 4 product teams in one quarter.',
        t: 'Coordinate without pulling everyone into weekly sync.',
        a: 'One shared doc w/ SLAs per team. Weekly unblock-only call. Status by emoji, not slides.',
        r: 'Zero missed cutover dates. Teams later adopted the format for other cross-functional work.',
      },
      takeaway: 'Meetings are a tax. Pay it only on the ambiguous parts.',
      followups: [],
    },
    {
      title: 'Pricing experiment that failed',
      tags: ['Failure', 'Learning'],
      star: {
        s: 'Ran a 4-week pricing test that I was 90% sure would win. It lost.',
        t: 'Explain the loss to leadership without dressing it up.',
        a: 'Wrote a 1-page post-mortem; named my wrong assumption in the first sentence.',
        r: 'Shelved the test. Learned "price framing" ≠ "perceived value." Used the learning in the next re-pricing.',
      },
      takeaway: 'Short post-mortems get read; long ones get filed.',
      followups: ['Which assumption specifically was wrong?'],
    },
    {
      title: 'Onboarding redesign',
      tags: ['Customer Obsession', 'Ambiguity'],
      star: {
        s: 'New-user D7 retention was flat for three quarters.',
        t: 'Diagnose w/ no clear hypothesis from leadership.',
        a: 'Shadowed 12 new users on calls. Found one friction point in step 3 nobody had instrumented.',
        r: '+9% D7 after a 2-week fix. Instrumentation became team standard.',
      },
      takeaway: 'Watch the user before you look at the chart.',
      followups: [],
    },
  ],
  // § 4
  questionMap: [
    {
      q: 'Tell me about a time you disagreed with your manager.',
      primary: 'VP disagreement on checkout',
      backup: 'Pricing experiment that failed',
    },
    {
      q: 'Walk me through a cross-functional launch.',
      primary: 'Helix playback migration',
      backup: 'Vendor migration',
    },
    {
      q: 'A time you gave up control to empower a team.',
      primary: 'Q3 roadmap autonomy',
      backup: 'Vendor migration',
    },
    {
      q: 'Tell me about a launch that failed.',
      primary: 'Pricing experiment that failed',
      backup: null,
    },
    { q: 'How do you know your customers?', primary: 'Onboarding redesign', backup: null },
    {
      q: "Biggest technical decision you've owned?",
      primary: 'Helix playback migration',
      backup: null,
    },
  ],
  // § 5
  alignment: {
    valueToStory: [
      { v: 'Radical Candor', story: 'VP disagreement on checkout', strength: 'strong' },
      { v: 'Context not Control', story: 'Q3 roadmap autonomy', strength: 'strong' },
      { v: 'Aligned · Loosely Coupled', story: 'Vendor migration', strength: 'ok' },
      { v: 'Bias for Impact', story: null, strength: 'missing' },
    ],
    mostRelevant: [
      'Helix playback migration (direct domain match — video + infra)',
      'Q3 roadmap autonomy (matches "Context not Control")',
    ],
    gaps: [
      'No "Bias for Impact" story that moves a clear KPI in <30 days',
      'Limited exposure to live-events infra (post-Stagebox focus)',
    ],
  },
  // § 6
  strengthsWeaknesses: {
    strengths: [
      { s: 'Streaming-domain depth (5 yrs @ Helix)', story: 'Helix playback migration' },
      { s: 'Numerate; always runs experiments', story: 'Pricing experiment that failed' },
      { s: 'Builds trust with eng quickly', story: 'Vendor migration' },
    ],
    weaknesses: [
      {
        w: 'Under-indexed on live-events experience',
        mit: 'Read Stagebox acquisition memo; prepped 2 hypothetical tests to propose.',
      },
      {
        w: 'Can be slow on written updates',
        mit: 'For the last two launches, sent a Monday 3-line status. Framed as a habit, not a one-off.',
      },
    ],
  },
  // § 7
  talkingPoints: {
    tmay: "I'm Alex, a PM who has spent five years living inside video infrastructure — most recently leading a playback migration at Helix that cut rebuffer by two thirds. I'm here because Playback is the best team in the industry for the work I actually want to do.",
    narrative:
      'Started on ads infra at Kestrel, moved to playback at Helix in 2021, ran a four-PM team for the last 18 months. Through-line: I like product problems where the infra matters, and I like teams small enough that PMs still write code-adjacent specs.',
    whyCompany:
      "Northwind made the bet I would have made — quality over tiers. The Stagebox acquisition tells me Playback gets serious live-events investment, and that's a rare domain problem I want to own.",
    whyRole:
      'Three platforms, a quality-first mandate, and a manager (Rita) who has shipped what I want to learn. This role is where my Helix learnings compound.',
  },
  // § 8
  questionsForInterviewer: {
    role: [
      'What does "success at 6 months" look like for the person who nails this role?',
      'Where do you expect the playback roadmap to hit its first hard trade-off?',
    ],
    team: [
      'How has "Radical Candor" actually played out on Playback in the last month?',
      "What's one team ritual you'd change if you could?",
    ],
    company: [
      "How does post-Stagebox live-events investment show up in Playback's roadmap?",
      "What's the honest weakness of Northwind's product strategy right now?",
    ],
  },
  // § 9
  logistics: {
    dates: [{ when: 'Thu Apr 24 · 2:00 PM PT', type: 'Onsite panel (virtual)' }],
    interviewers: [
      {
        name: 'Rita Chen',
        role: 'Director of Product, Playback (HM)',
        notes: 'Behavioral-heavy. Known for the "disagree w/ manager" question.',
      },
      {
        name: 'Marcus Vohra',
        role: 'Dir Engineering, Playback',
        notes: 'Will probe technical trade-offs. Likes numbers.',
      },
      {
        name: 'Priya Shah',
        role: 'Sr PM, Playback',
        notes: 'Peer check — cultural fit + collab style.',
      },
      {
        name: 'TBD',
        role: 'Product case interviewer',
        notes: '20-min case. Likely playback-related.',
      },
    ],
    round: 'Final round · 4 interviews · 2h total',
  },
  // § 10
  reflection: {
    went: '—',
    didnt: '—',
    struggled: '—',
    toAdd: '—',
    locked: true,
  },
};

export const MV_SHEET_PROGRESS = [
  { id: 'snapshot', n: 1, name: 'Company Snapshot', pct: 100 },
  { id: 'role', n: 2, name: 'Role Breakdown', pct: 100 },
  { id: 'stories', n: 3, name: 'Story Bank', pct: 86 },
  { id: 'questionmap', n: 4, name: 'Question Mapping', pct: 72 },
  { id: 'alignment', n: 5, name: 'Company Alignment', pct: 75 },
  { id: 'strengths', n: 6, name: 'Strengths & Weakness', pct: 90 },
  { id: 'talking', n: 7, name: 'Key Talking Points', pct: 100 },
  { id: 'ask', n: 8, name: 'Questions for Them', pct: 100 },
  { id: 'logistics', n: 9, name: 'Logistics', pct: 92 },
  { id: 'reflection', n: 10, name: 'Post-Interview', pct: 0, locked: true },
];
