// Dashboard variation 1 — Linear Roadmap
// A long horizontal journey rail: Onboarding → Resume → Stories → Sheets → Practice → Interview.
// Station-style "core loop" with live progress + a focused active-stage card below.
// Tone: Coach + Analyst — warm copy, precise numbers.

function MVDashRoadmap() {
  const t = MV_TOKENS;
  const accent = t.accents.ember;
  const [activeStep, setActiveStep] = React.useState('stories');
  const steps = MV_DATA.loop;

  return (
    <div style={{ fontFamily: t.fontSans, background: t.bg, color: t.ink, width:'100%', height:'100%', overflow:'auto' }}>
      {/* Top bar */}
      <MVTopBar accent={accent} />

      {/* Hero greeting */}
      <div style={{ padding:'40px 56px 28px' }}>
        <div style={{ fontFamily:t.fontMono, fontSize:11, letterSpacing:1.5, color:t.ink3, marginBottom:14, textTransform:'uppercase' }}>
          Tuesday · Apr 21 · 09:14
        </div>
        <h1 style={{ fontFamily:t.fontSerif, fontSize:52, fontWeight:400, letterSpacing:-0.8, margin:0, lineHeight:1.05 }}>
          Good morning, Alex.<br/>
          <span style={{ color:t.ink3 }}>Northwind is in 3 days. Here's where you stand.</span>
        </h1>
      </div>

      {/* Linear Roadmap — the showpiece */}
      <div style={{ padding:'24px 56px 12px', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:600, color:t.ink2, letterSpacing:0.3, textTransform:'uppercase' }}>The Core Loop</div>
          <div style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink3 }}>2 of 6 complete · 38% overall</div>
        </div>
        <Roadmap steps={steps} active={activeStep} onSelect={setActiveStep} accent={accent} />
      </div>

      {/* Lower grid: active step detail + upcoming + activity */}
      <div style={{ padding:'40px 56px 56px', display:'grid', gridTemplateColumns:'1.35fr 1fr', gap:32 }}>
        <ActiveStepCard stepId={activeStep} accent={accent} />
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <UpcomingInterviews accent={accent} />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
function MVTopBar({ accent }) {
  const t = MV_TOKENS;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:24, padding:'18px 56px', borderBottom:`1px solid ${t.rule}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:22, height:22, borderRadius:4, background:t.ink, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:5, border:`2px solid ${accent.hi}`, borderRadius:1, borderLeft:'none', borderTop:'none' }}/>
        </div>
        <div style={{ fontFamily:t.fontSerif, fontSize:20, fontWeight:500, letterSpacing:-0.3 }}>Mockvue</div>
      </div>
      <nav style={{ display:'flex', gap:28, fontSize:14, color:t.ink2, marginLeft:32 }}>
        <span style={{ color:t.ink, fontWeight:500, borderBottom:`2px solid ${accent.hi}`, paddingBottom:2 }}>Dashboard</span>
        <span>Resume</span><span>Stories</span><span>Cheat Sheets</span><span>Practice</span>
      </nav>
      <div style={{ flex:1 }}/>
      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:t.ink2 }}>
        <span style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink3 }}>⌘K</span> Search
      </div>
      <div style={{ width:32, height:32, borderRadius:16, background:accent.lo, color:accent.hi, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:13 }}>AM</div>
    </div>
  );
}

// Station-style roadmap
function Roadmap({ steps, active, onSelect, accent }) {
  const t = MV_TOKENS;
  // Progress fill: up to & including last "active"/"done" step
  const totalPct = steps.reduce((s, x) => s + x.pct, 0) / (steps.length * 100) * 100;
  return (
    <div style={{ position:'relative', padding:'16px 0 8px' }}>
      {/* rail */}
      <div style={{ position:'absolute', top:46, left:32, right:32, height:2, background:t.rule }}/>
      <div style={{ position:'absolute', top:46, left:32, width:`calc(${totalPct}% - 64px)`, minWidth:0, height:2, background:accent.hi, transition:'width .6s' }}/>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${steps.length}, 1fr)`, gap:0 }}>
        {steps.map((s, i) => {
          const isActive = s.id === active;
          const done = s.status === 'done';
          const progress = s.status === 'active';
          const locked = s.status === 'locked';
          const color = done ? accent.hi : progress ? accent.hi : locked ? t.ink3 : t.ink2;
          const bg = done ? accent.hi : progress ? '#fff' : locked ? '#fff' : '#fff';
          const border = done ? accent.hi : progress ? accent.hi : t.rule;
          return (
            <button key={s.id} onClick={() => onSelect(s.id)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'16px 0px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
              <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1 }}>STAGE {String(i+1).padStart(2,'0')}</div>
              <div style={{ position:'relative', zIndex:1 }}>
                {progress ? (
                  <MVRing pct={s.pct} size={36} stroke={3} color={accent.hi} track={t.rule}>
                    <span style={{ fontSize:11, fontFamily:t.fontMono, color:accent.hi }}>{s.pct}</span>
                  </MVRing>
                ) : (
                  <div style={{ width:36, height:36, borderRadius:18, background:bg, border:`2px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', color, fontSize:14, fontWeight:600 }}>
                    {done ? '✓' : locked ? <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="5.5" width="8" height="6" rx="1"/><path d="M3 5.5V3.5a2.5 2.5 0 015 0v2"/></svg> : i+1}
                  </div>
                )}
                {isActive && <div style={{ position:'absolute', inset:-6, borderRadius:24, border:`1.5px solid ${accent.hi}`, pointerEvents:'none' }}/>}
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:14, fontWeight:600, color: locked ? t.ink3 : t.ink }}>{s.label}</div>
                <div style={{ fontSize:12, color:t.ink3, marginTop:2, maxWidth:150 }}>{s.caption}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Dynamic active step card — shows Stories detail since active = 'stories'
function ActiveStepCard({ stepId, accent }) {
  const t = MV_TOKENS;
  const step = MV_DATA.loop.find(s => s.id === stepId);
  const isStories = stepId === 'stories';
  const isResume = stepId === 'resume';
  const isSheets = stepId === 'sheets';

  return (
    <div style={{ background:t.card, border:`1px solid ${t.rule}`, padding:28 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:4 }}>
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, letterSpacing:1.5, marginBottom:6 }}>
            ACTIVE · {step.status.toUpperCase()}
          </div>
          <h2 style={{ fontFamily:t.fontSerif, fontSize:32, fontWeight:400, margin:0, letterSpacing:-0.5 }}>
            {step.label}
          </h2>
          <div style={{ fontSize:14, color:t.ink2, marginTop:6 }}>{step.caption}</div>
        </div>
        <MVRing pct={step.pct} size={56} stroke={4} color={accent.hi} track={t.rule}>
          <span style={{ fontSize:13, color:accent.hi, fontWeight:600 }}>{step.pct}%</span>
        </MVRing>
      </div>

      {isStories && <StoriesDetail accent={accent} />}
      {isResume && <ResumeDetail accent={accent} />}
      {isSheets && <SheetsDetail accent={accent} />}
      {!isStories && !isResume && !isSheets && (
        <div style={{ marginTop:24, padding:'24px 0', color:t.ink3, fontSize:14 }}>Select a stage above.</div>
      )}

      <div style={{ display:'flex', gap:8, marginTop:24, paddingTop:20, borderTop:`1px solid ${t.rule}` }}>
        <button style={{ background:accent.hi, color:'#fff', border:'none', padding:'10px 18px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          Continue building stories →
        </button>
        <button style={{ background:'transparent', color:t.ink, border:`1px solid ${t.rule}`, padding:'10px 18px', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          View all 10 categories
        </button>
      </div>
    </div>
  );
}

function StoriesDetail({ accent }) {
  const t = MV_TOKENS;
  const cats = MV_DATA.stories.categories;
  const statusStyle = {
    strong:  { label:'Strong',  c:'#3d8a4a' },
    ok:      { label:'OK',      c:accent.hi },
    weak:    { label:'Thin',    c:'#c7851a' },
    missing: { label:'Missing', c:'#8a857d' },
  };
  return (
    <div style={{ marginTop:28 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:13, color:t.ink2, fontWeight:500 }}>
          <span style={{ fontFamily:t.fontMono, color:t.ink }}>{MV_DATA.stories.built}</span>
          <span style={{ color:t.ink3 }}> / {MV_DATA.stories.target} stories in library</span>
        </div>
        <div style={{ fontSize:11, color:t.ink3, fontFamily:t.fontMono }}>The Rule of 10</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:t.rule, border:`1px solid ${t.rule}` }}>
        {cats.map(c => {
          const s = statusStyle[c.status];
          return (
            <div key={c.key} style={{ background:'#fff', padding:'11px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <MVDot c={s.c} size={7}/>
              <div style={{ flex:1, fontSize:13, color:t.ink }}>{c.name}</div>
              <div style={{ fontSize:11, fontFamily:t.fontMono, color:t.ink3 }}>{c.count > 0 ? `${c.count} saved` : '—'}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:14, padding:'12px 14px', background:accent.lo, fontSize:13, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, letterSpacing:1 }}>COACH</div>
        <div style={{ color:t.ink }}>You're missing <b>Conflict</b> and <b>Customer Obsession</b> — both likely at Northwind.</div>
      </div>
    </div>
  );
}
function ResumeDetail({ accent }) {
  const t = MV_TOKENS; const r = MV_DATA.resume;
  return (
    <div style={{ marginTop:28, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
      <StatBlock big={r.score} small={`/ ${r.target} target`} label="ATS Score" accent={accent.hi}/>
      <StatBlock big={r.hotZones} small="impressive" label="Hot Zones" accent="#3d8a4a"/>
      <StatBlock big={r.vulnerabilities} small="need work" label="Vulnerabilities" accent="#c7851a"/>
    </div>
  );
}
function SheetsDetail({ accent }) {
  const t = MV_TOKENS;
  return <div style={{ marginTop:20, fontSize:14, color:t.ink2 }}>1 of 3 cheat sheets complete. Build Atlas and Pennant before next week.</div>;
}
function StatBlock({ big, small, label, accent }) {
  const t = MV_TOKENS;
  return (
    <div style={{ border:`1px solid ${t.rule}`, padding:14 }}>
      <div style={{ fontSize:10, letterSpacing:1.3, color:t.ink3, fontFamily:t.fontMono, marginBottom:8 }}>{label.toUpperCase()}</div>
      <div style={{ display:'baseline', display:'flex', alignItems:'baseline', gap:8 }}>
        <div style={{ fontFamily:t.fontSerif, fontSize:40, fontWeight:400, color:accent, lineHeight:1 }}>{big}</div>
        <div style={{ fontSize:12, color:t.ink3 }}>{small}</div>
      </div>
    </div>
  );
}

function UpcomingInterviews({ accent }) {
  const t = MV_TOKENS;
  return (
    <div>
      <div style={{ fontSize:13, fontWeight:600, color:t.ink2, letterSpacing:0.3, textTransform:'uppercase', marginBottom:14 }}>Upcoming</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {MV_DATA.companies.map((c, i) => (
          <div key={c.name} style={{ background:t.card, border:`1px solid ${t.rule}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, background: i===0 ? accent.hi : t.ink, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:t.fontSerif, fontSize:18 }}>
              {c.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, color:t.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
              <div style={{ fontSize:12, color:t.ink3 }}>{c.role} · {c.stage}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:t.fontMono, fontSize:11, color: c.days <= 3 ? accent.hi : t.ink2, fontWeight:600 }}>
                {c.days}d
              </div>
              <div style={{ fontSize:10, color:t.ink3, marginTop:2 }}>{c.ready}% ready</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  const t = MV_TOKENS;
  return (
    <div>
      <div style={{ fontSize:13, fontWeight:600, color:t.ink2, letterSpacing:0.3, textTransform:'uppercase', marginBottom:14 }}>Recent</div>
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {MV_DATA.activity.map((a, i) => (
          <div key={i} style={{ padding:'10px 0', borderBottom: i < MV_DATA.activity.length-1 ? `1px solid ${t.rule}` : 'none', display:'flex', gap:12 }}>
            <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, width:54, flexShrink:0, paddingTop:2 }}>{a.when}</div>
            <div style={{ fontSize:13, color:t.ink2, lineHeight:1.45 }}>{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MVDashRoadmap });
