// Shared tokens + helpers for Mockvue dashboard variations.
// All variations share a neutral warm off-white canvas; each variation picks
// its own accent. No brand lookalikes — original identity.

const MV_TOKENS = {
  // neutral palette — warm, editorial
  bg: '#faf7f2',
  ink: '#1a1814',
  ink2: '#4a4640',
  ink3: '#8a857d',
  rule: 'rgba(26,24,20,0.09)',
  card: '#ffffff',
  // accents (swappable per variation)
  accents: {
    ember:    { hi: '#d9532b', lo: '#f4e4d8', name: 'Ember' },
    moss:     { hi: '#3d5a3a', lo: '#e4ead8', name: 'Moss' },
    cobalt:   { hi: '#1e3a8a', lo: '#dde4f2', name: 'Cobalt' },
    graphite: { hi: '#1a1814', lo: '#e8e4db', name: 'Graphite' },
    clay:     { hi: '#8b4513', lo: '#f0e6d6', name: 'Clay' },
  },
  fontSerif: '"Spectral", "Iowan Old Style", Georgia, serif',
  fontSans: '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontMono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
};

// Sample data used across all variations — consistent "Alex" persona.
const MV_DATA = {
  user: { name: 'Alex Moreno', role: 'Senior Product Manager', initials: 'AM' },
  resume: {
    score: 68,
    target: 85,
    hotZones: 4,
    vulnerabilities: 3,
    lastEdited: '2 days ago',
    bulletCount: 22,
    unquantified: 7,
  },
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
  companies: [
    { name: 'Northwind Media', role: 'Sr. PM, Playback', when: 'Thu · 2:00 PM', days: 3, ready: 82, stage: 'final round', tone: 'ember' },
    { name: 'Atlas Logistics', role: 'PM, Routing', when: 'Next Tue · 10:30 AM', days: 7, ready: 54, stage: 'hiring manager', tone: 'cobalt' },
    { name: 'Pennant', role: 'Staff PM', when: 'Apr 29 · 11:00 AM', days: 10, ready: 31, stage: 'recruiter screen', tone: 'moss' },
  ],
  loop: [
    { id: 'onboard',  label: 'Onboarding',     caption: 'Profile & first resume pass',      status: 'done',    pct: 100 },
    { id: 'resume',   label: 'Resume',         caption: 'Analyze & tighten bullet points',  status: 'active',  pct: 64 },
    { id: 'stories',  label: 'Core Stories',   caption: 'Build your library of 10',         status: 'active',  pct: 60 },
    { id: 'sheets',   label: 'Cheat Sheets',   caption: 'Map stories to each company',      status: 'next',    pct: 33 },
    { id: 'practice', label: 'Practice',       caption: 'Flashcards, mocks, voice agent',   status: 'locked',  pct: 0 },
    { id: 'ready',    label: 'Interview',      caption: 'Walk in prepared',                 status: 'locked',  pct: 0 },
  ],
  activity: [
    { kind: 'resume', text: 'Rewrote bullet: "Led redesign" → "Led redesign of $4.2M checkout flow; +18% conversion"', when: '12m ago' },
    { kind: 'story',  text: 'New story saved · Technical Challenge · "Vendor migration"', when: '1h ago' },
    { kind: 'sheet',  text: 'Created cheat sheet · Northwind Media', when: 'Yesterday' },
    { kind: 'resume', text: 'AI flagged 3 vague verbs in Experience §', when: 'Yesterday' },
  ],
};

// Small status dot
function MVDot({ c, size = 8 }) {
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:size, background:c, flexShrink:0 }} />;
}

// Mini concentric ring for progress
function MVRing({ pct, size = 40, stroke = 3, color = '#1a1814', track = 'rgba(0,0,0,0.08)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)} strokeLinecap="round" style={{ transition:'stroke-dashoffset .6s' }} />
      </svg>
      {children && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize: size*0.28, fontWeight:600 }}>{children}</div>}
    </div>
  );
}

// Monospace placeholder surface (for document rails etc.)
function MVPlaceholder({ label, height = 120, tone = '#e8e4db' }) {
  return (
    <div style={{
      height, width:'100%',
      backgroundImage: `repeating-linear-gradient(-45deg, ${tone} 0 8px, transparent 8px 18px)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color: '#8a857d', fontFamily: MV_TOKENS.fontMono, fontSize: 11, letterSpacing: 0.5,
      border: `1px solid ${tone}`,
    }}>{label}</div>
  );
}

Object.assign(window, { MV_TOKENS, MV_DATA, MVDot, MVRing, MVPlaceholder });
