// Story Bank Builder — two artboards:
// A · Library Overview — 10-category grid with status
// B · Story Editor — free-write raw story → AI structures into STAR

// ─── Data ────────────────────────────────────────────────────────
const SB_CATEGORIES = [
  { id:'leadership',    name:'Leadership',              icon:'◈', status:'strong', count:2, target:2 },
  { id:'conflict',      name:'Conflict',                icon:'↔', status:'missing',count:0, target:1 },
  { id:'technical',     name:'Technical Challenge',     icon:'⬡', status:'weak',   count:1, target:2 },
  { id:'failure',       name:'Failure / Learning',      icon:'↻', status:'ok',     count:1, target:1 },
  { id:'ambiguity',     name:'Navigating Ambiguity',    icon:'∿', status:'ok',     count:1, target:1 },
  { id:'influence',     name:'Influence w/o Authority', icon:'⇌', status:'ok',     count:1, target:1 },
  { id:'customer',      name:'Customer Obsession',      icon:'◎', status:'missing',count:0, target:1 },
  { id:'growth',        name:'Growth Moment',           icon:'↑', status:'missing',count:0, target:1 },
  { id:'crossfunc',     name:'Cross-functional',        icon:'⊕', status:'missing',count:0, target:1 },
  { id:'prioritization',name:'Prioritization',          icon:'≡', status:'missing',count:0, target:1 },
];

const SB_STORIES = [
  {
    id:'st1', category:'leadership', title:'Helix playback migration',
    tags:['Leadership','Technical','Ownership'],
    raw:'I led a 4-team migration of our video player SDK at Helix. We had 90 days and I had no formal authority over the other teams. I got everyone aligned on a shared doc instead of weekly standups. We shipped 2 weeks early and rebuffer dropped from 22% to 7%.',
    star:{
      s:'Helix video player was on a deprecated SDK; 22% of sessions buffered > 3s.',
      t:'Lead a 4-team migration with no formal authority, on a 90-day deadline.',
      a:'Wrote a shared RFC, moved standups to async, ran weekly unblock-only syncs.',
      r:'Shipped 2 weeks early. Rebuffer fell from 22% → 7%. +$1.4M ARR from churn save.',
    },
    strength:82, companies:['Northwind Media','Atlas Logistics'],
  },
  {
    id:'st2', category:'conflict', title:'VP disagreement on checkout',
    tags:['Conflict','Radical Candor'],
    raw:'VP wanted to ship a checkout redesign before the A/B test finished. I thought it would hurt conversion. I ran a 2-week painted-door test and presented the results 1:1 before escalating. We went with a simpler A/B instead and conversion went up 18%.',
    star:{
      s:'VP wanted a radical checkout rewrite. Data suggested it would tank conversion.',
      t:'Push back with evidence without burning the relationship.',
      a:'Ran a 2-week painted-door test. Presented results 1:1 before escalating.',
      r:'We pursued a simpler A/B instead. +18% on checkout conversion over the quarter.',
    },
    strength:91, companies:['Northwind Media'],
  },
  {
    id:'st3', category:'technical', title:'Vendor migration',
    tags:['Cross-functional','Execution'],
    raw:'Four teams, one vendor contract ending in 90 days. I coordinated without adding any meetings. Just a shared status doc with teams posting deltas async.',
    star:{
      s:'Four teams, one vendor contract ending in 90 days.',
      t:'Coordinate migration without adding standups nobody would attend.',
      a:'Wrote a shared status doc; teams posted deltas async; I reviewed weekly and escalated 2 blockers.',
      r:'Migrated on time, no P0 incidents, saved 180 meeting-hours.',
    },
    strength:74, companies:['Atlas Logistics'],
  },
  {
    id:'st4', category:'failure', title:'Pricing experiment that failed',
    tags:['Failure','Learning'],
    raw:'I ran a pricing test that I was 90% sure would win. It lost badly. I wrote a one-page post-mortem naming my wrong assumption in the first sentence.',
    star:{
      s:'Ran a 4-week pricing test I was 90% sure would win. It lost.',
      t:'Explain the loss to leadership without dressing it up.',
      a:'Wrote a 1-page post-mortem; named my wrong assumption in the first sentence.',
      r:'Shelved the test. Used the learning in the next re-pricing to find a +$3 sweet spot.',
    },
    strength:88, companies:['Northwind Media','Pennant'],
  },
  {
    id:'st5', category:'influence', title:'Q3 roadmap autonomy',
    tags:['Leadership','Context not Control'],
    raw:'My four-PM team waited on me to shape every quarterly plan. I gave each PM a north-star metric plus a 48h decision SLA from me. Roadmap quality went up, I got time back.',
    star:{
      s:'My four-PM team was waiting on me to shape every quarterly plan.',
      t:'Shift from directing to coaching without losing strategic alignment.',
      a:'Gave each PM a north-star metric + a 48h decision SLA from me. No roadmap reviews.',
      r:'Roadmap quality rose (3 → 5 "ship-worthy" bets). I reclaimed 6h/wk.',
    },
    strength:79, companies:['Northwind Media'],
  },
  {
    id:'st6', category:'ambiguity', title:'Onboarding redesign',
    tags:['Customer Obsession','Ambiguity'],
    raw:'New-user D7 retention was flat for three quarters with no clear hypothesis. I shadowed 12 new users, found one uninstrumented friction point, fixed it in two weeks.',
    star:{
      s:'New-user D7 retention was flat for three quarters.',
      t:'Diagnose with no clear hypothesis from leadership.',
      a:'Shadowed 12 new users on calls. Found one friction point in step 3 nobody had instrumented.',
      r:'+9% D7 after a 2-week fix. Instrumentation became team standard.',
    },
    strength:77, companies:['Northwind Media','Atlas Logistics'],
  },
];

// ─── Status config ────────────────────────────────────────────────
const SB_STATUS = {
  strong:  { label:'Strong',  bg:'#f0fdf4', border:'#86efac', dot:'#3d8a4a', text:'#166534' },
  ok:      { label:'OK',      bg:'#fff7ed', border:'#fed7aa', dot:'#c7851a', text:'#9a3412' },
  weak:    { label:'Thin',    bg:'#fffbeb', border:'#fde68a', dot:'#d97706', text:'#92400e' },
  missing: { label:'Missing', bg:'#fafaf8', border:'rgba(26,24,20,0.09)', dot:'#8a857d', text:'#8a857d' },
};

// ─── Library Overview ─────────────────────────────────────────────
function MVStoryLibrary() {
  const t = MV_TOKENS;
  const accent = t.accents.ember;
  const [selected, setSelected] = React.useState(null);
  const built = SB_CATEGORIES.filter(c => c.count > 0).length;

  return (
    <div style={{ fontFamily:t.fontSans, background:t.bg, color:t.ink, width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Top bar */}
      <div style={{ padding:'14px 24px', borderBottom:`1px solid ${t.rule}`, background:'#fff', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:22, height:22, borderRadius:4, background:t.ink, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:5, border:`2px solid ${accent.hi}`, borderRadius:1, borderLeft:'none', borderTop:'none' }}/>
          </div>
          <div style={{ fontFamily:t.fontSerif, fontSize:16, fontWeight:500 }}>Mockvue</div>
          <div style={{ fontSize:12, color:t.ink3 }}>/ <b style={{ color:t.ink }}>Core Stories</b></div>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', gap:16, fontFamily:t.fontMono, fontSize:11, color:t.ink3 }}>
          <span><b style={{ color:t.ink }}>{built}</b> of 10 categories covered</span>
          <span><b style={{ color:t.ink }}>{SB_STORIES.length}</b> stories in library</span>
        </div>
        <button style={{ background:accent.hi, color:'#fff', border:'none', padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          + New story
        </button>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 300px', overflow:'hidden' }}>
        {/* Grid */}
        <div style={{ overflowY:'auto', padding:'28px 28px 48px' }}>
          {/* Rule of 10 header */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:6 }}>THE RULE OF 10</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:14 }}>
              <h2 style={{ fontFamily:t.fontSerif, fontSize:32, fontWeight:400, margin:0, letterSpacing:-0.5 }}>Your Story Library</h2>
              <div style={{ fontSize:13, color:t.ink3 }}>Cover all 10 categories before your first final round.</div>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:6, background:t.rule, borderRadius:3 }}>
                <div style={{ width:`${built/10*100}%`, height:'100%', background:accent.hi, borderRadius:3, transition:'width .5s' }}/>
              </div>
              <div style={{ fontFamily:t.fontMono, fontSize:11, color:accent.hi, fontWeight:600 }}>{built}/10</div>
            </div>
          </div>

          {/* 2-col category grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {SB_CATEGORIES.map(cat => {
              const ss = SB_STATUS[cat.status];
              const stories = SB_STORIES.filter(s => s.category === cat.id);
              const isSelected = selected === cat.id;
              return (
                <div key={cat.id} onClick={() => setSelected(isSelected ? null : cat.id)}
                  style={{ background: ss.bg, border:`1px solid ${isSelected ? accent.hi : ss.border}`,
                    padding:'16px 18px', cursor:'pointer', transition:'border-color .15s',
                    boxShadow: isSelected ? `0 0 0 2px ${accent.hi}22` : 'none' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:8, height:8, borderRadius:4, background:ss.dot, flexShrink:0 }}/>
                      <div style={{ fontSize:14, fontWeight:600, color:t.ink }}>{cat.name}</div>
                    </div>
                    <div style={{ fontFamily:t.fontMono, fontSize:10, color:ss.text, letterSpacing:0.5, padding:'2px 6px',
                      background:'rgba(255,255,255,0.6)', border:`1px solid ${ss.border}` }}>
                      {ss.label.toUpperCase()}
                    </div>
                  </div>

                  {stories.length > 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      {stories.map(st => (
                        <div key={st.id} style={{ padding:'7px 10px', background:'rgba(255,255,255,0.7)',
                          border:`1px solid rgba(255,255,255,0.5)`, display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ flex:1, fontSize:12, color:t.ink, fontWeight:500 }}>{st.title}</div>
                          <StrengthBar pct={st.strength} accent={accent.hi}/>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:'10px 0', display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ fontSize:12, color:t.ink3, fontStyle:'italic' }}>No story yet</div>
                      <button style={{ background:'none', border:`1px dashed ${t.ink3}`, padding:'3px 10px', fontSize:11,
                        color:t.ink3, cursor:'pointer', fontFamily:'inherit' }}>+ Add</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel — details or prompt */}
        <aside style={{ borderLeft:`1px solid ${t.rule}`, background:'#fff', overflowY:'auto', padding:'24px 20px' }}>
          {selected ? <CategoryDetail catId={selected} accent={accent}/> : <LibraryStats accent={accent}/>}
        </aside>
      </div>
    </div>
  );
}

function StrengthBar({ pct, accent }) {
  const t = MV_TOKENS;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ width:48, height:3, background:t.rule }}>
        <div style={{ width:`${pct}%`, height:'100%', background: pct >= 80 ? '#3d8a4a' : pct >= 60 ? accent : '#c7851a' }}/>
      </div>
      <div style={{ fontFamily:MV_TOKENS.fontMono, fontSize:10, color:MV_TOKENS.ink3, width:24 }}>{pct}</div>
    </div>
  );
}

function CategoryDetail({ catId, accent }) {
  const t = MV_TOKENS;
  const cat = SB_CATEGORIES.find(c => c.id === catId);
  const stories = SB_STORIES.filter(s => s.category === catId);
  const ss = SB_STATUS[cat.status];

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:ss.text, letterSpacing:1.5, marginBottom:6 }}>
          {ss.label.toUpperCase()} · {stories.length} OF {cat.target} STORIES
        </div>
        <h3 style={{ fontFamily:t.fontSerif, fontSize:24, fontWeight:500, margin:0, letterSpacing:-0.3 }}>{cat.name}</h3>
      </div>

      {stories.map(st => (
        <div key={st.id} style={{ marginBottom:16, padding:'14px', background:t.bg, border:`1px solid ${t.rule}` }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>{st.title}</div>
          <div style={{ display:'grid', gridTemplateColumns:'16px 1fr', rowGap:5, columnGap:8, fontSize:12, color:t.ink2 }}>
            {[['S',st.star.s],['T',st.star.t],['A',st.star.a],['R',st.star.r]].map(([k,v])=>(
              <React.Fragment key={k}>
                <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, fontWeight:700, paddingTop:2 }}>{k}</div>
                <div style={{ lineHeight:1.45, color: k==='R' ? t.ink : t.ink2, fontWeight: k==='R' ? 500 : 400 }}>{v}</div>
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px dotted ${t.rule}`, display:'flex', gap:6 }}>
            {st.companies.map((c,i) => (
              <span key={i} style={{ fontSize:10, fontFamily:t.fontMono, padding:'2px 7px', background:'#fff', border:`1px solid ${t.rule}`, color:t.ink3 }}>{c}</span>
            ))}
          </div>
        </div>
      ))}

      {stories.length === 0 && (
        <div style={{ padding:'20px 0', textAlign:'center' }}>
          <div style={{ fontFamily:t.fontSerif, fontSize:15, color:t.ink3, fontStyle:'italic', marginBottom:12 }}>
            No stories in this category yet.
          </div>
          <button style={{ background:accent.hi, color:'#fff', border:'none', padding:'9px 16px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            + Build a {cat.name} story
          </button>
        </div>
      )}
    </div>
  );
}

function LibraryStats({ accent }) {
  const t = MV_TOKENS;
  const missing = SB_CATEGORIES.filter(c => c.status === 'missing');
  const weak    = SB_CATEGORIES.filter(c => c.status === 'weak');
  return (
    <div>
      <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:14 }}>OVERVIEW</div>

      {/* Donut-ish counts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
        {[
          { label:'Strong', count: SB_CATEGORIES.filter(c=>c.status==='strong').length, c:'#3d8a4a', bg:'#f0fdf4' },
          { label:'OK',     count: SB_CATEGORIES.filter(c=>c.status==='ok').length,     c:'#c7851a', bg:'#fff7ed' },
          { label:'Thin',   count: SB_CATEGORIES.filter(c=>c.status==='weak').length,   c:'#d97706', bg:'#fffbeb' },
          { label:'Missing',count: SB_CATEGORIES.filter(c=>c.status==='missing').length,c:'#8a857d', bg:'#fafaf8' },
        ].map(x => (
          <div key={x.label} style={{ padding:'12px', background:x.bg, border:`1px solid ${t.rule}`, textAlign:'center' }}>
            <div style={{ fontFamily:t.fontSerif, fontSize:32, fontWeight:400, color:x.c, lineHeight:1 }}>{x.count}</div>
            <div style={{ fontFamily:t.fontMono, fontSize:9, color:x.c, letterSpacing:1.5, marginTop:4 }}>{x.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {missing.length > 0 && (
        <>
          <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:accent.hi, marginBottom:10 }}>MISSING · BUILD THESE FIRST</div>
          {missing.map(c => (
            <div key={c.id} style={{ padding:'8px 0', borderBottom:`1px dotted ${t.rule}`, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
              <span style={{ color:t.ink }}>{c.name}</span>
              <button style={{ background:'none', border:`1px solid ${t.rule}`, padding:'3px 8px', fontSize:11,
                color:t.ink3, cursor:'pointer', fontFamily:'inherit' }}>+ Add</button>
            </div>
          ))}
        </>
      )}

      {weak.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:'#d97706', marginBottom:10 }}>THIN · ADD A SECOND STORY</div>
          {weak.map(c => (
            <div key={c.id} style={{ padding:'8px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:13, color:t.ink2 }}>
              {c.name} · {c.count} of {c.target}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:24, padding:14, background:accent.lo, borderLeft:`3px solid ${accent.hi}`, fontSize:13, lineHeight:1.5 }}>
        <b>Click any category</b> to see its stories, or add a new one.
      </div>
    </div>
  );
}

// ─── Story Editor ─────────────────────────────────────────────────
function MVStoryEditor() {
  const t = MV_TOKENS;
  const accent = t.accents.ember;
  const [phase, setPhase] = React.useState('raw'); // 'raw' | 'structured' | 'done'
  const [category, setCategory] = React.useState('conflict');
  const [raw, setRaw] = React.useState('');
  const [star, setStar] = React.useState({ s:'', t:'', a:'', r:'' });
  const [title, setTitle] = React.useState('');

  const exampleRaw = SB_STORIES.find(s => s.category === 'conflict')?.raw || '';

  const handleExtract = () => {
    const story = SB_STORIES.find(s => s.category === category) || SB_STORIES[1];
    setStar(story.star);
    setTitle(story.title);
    setPhase('structured');
  };

  return (
    <div style={{ fontFamily:t.fontSans, background:t.bg, color:t.ink, width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Top bar */}
      <div style={{ padding:'14px 24px', borderBottom:`1px solid ${t.rule}`, background:'#fff', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:22, height:22, borderRadius:4, background:t.ink, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:5, border:`2px solid ${accent.hi}`, borderRadius:1, borderLeft:'none', borderTop:'none' }}/>
          </div>
          <div style={{ fontFamily:t.fontSerif, fontSize:16, fontWeight:500 }}>Mockvue</div>
          <div style={{ fontSize:12, color:t.ink3 }}>/ Core Stories / <b style={{ color:t.ink }}>New Story</b></div>
        </div>
        <div style={{ flex:1 }}/>
        {/* Phase stepper */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {[['raw','1 · Dump it'],['structured','2 · Review STAR'],['done','3 · Save']].map(([p,label], i) => {
            const phases = ['raw','structured','done'];
            const cur = phases.indexOf(phase);
            const idx = phases.indexOf(p);
            const done = cur > idx;
            const active = cur === idx;
            return (
              <React.Fragment key={p}>
                {i > 0 && <div style={{ width:20, height:1, background: done ? accent.hi : t.rule }}/>}
                <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:0.5,
                  color: active ? accent.hi : done ? '#3d8a4a' : t.ink3, fontWeight: active ? 700 : 400 }}>
                  {done ? '✓ ' : ''}{label}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 280px', overflow:'hidden' }}>
        {/* Main editor area */}
        <div style={{ overflowY:'auto', padding:'32px 36px 60px' }}>
          {phase === 'raw' && (
            <RawPhase raw={raw} setRaw={setRaw} category={category} setCategory={setCategory}
              onExtract={handleExtract} example={exampleRaw} accent={accent}/>
          )}
          {phase === 'structured' && (
            <StructuredPhase star={star} setStar={setStar} title={title} setTitle={setTitle}
              category={category} accent={accent} onSave={() => setPhase('done')} onBack={() => setPhase('raw')} raw={raw}/>
          )}
          {phase === 'done' && (
            <DonePhase star={star} title={title} category={category} accent={accent}
              onAnother={() => { setPhase('raw'); setRaw(''); setStar({s:'',t:'',a:'',r:''}); setTitle(''); }}/>
          )}
        </div>

        {/* Right rail — tips + company links */}
        <aside style={{ borderLeft:`1px solid ${t.rule}`, background:'#fff', overflowY:'auto', padding:'24px 18px' }}>
          <EditorRail phase={phase} category={category} accent={accent} star={star}/>
        </aside>
      </div>
    </div>
  );
}

// Phase 1 — free write
function RawPhase({ raw, setRaw, category, setCategory, onExtract, example, accent }) {
  const t = MV_TOKENS;
  return (
    <div>
      <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:8 }}>STEP 1 OF 3</div>
      <h2 style={{ fontFamily:t.fontSerif, fontSize:36, fontWeight:400, margin:'0 0 8px', letterSpacing:-0.6 }}>
        Dump the story. Don't edit.
      </h2>
      <p style={{ fontSize:14, color:t.ink2, lineHeight:1.6, margin:'0 0 28px', maxWidth:540 }}>
        Write what happened in plain English — messy is fine. Include any numbers you remember, even rough ones.
        Mockvue will extract the STAR structure for you.
      </p>

      {/* Category picker */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:8 }}>CATEGORY</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {SB_CATEGORIES.map(c => {
            const ss = SB_STATUS[c.status];
            return (
              <button key={c.id} onClick={() => setCategory(c.id)}
                style={{ padding:'5px 12px', fontSize:12, fontFamily:'inherit', cursor:'pointer', border:`1px solid ${category===c.id ? accent.hi : ss.border}`,
                  background: category===c.id ? accent.lo : ss.bg,
                  color: category===c.id ? accent.hi : t.ink2, fontWeight: category===c.id ? 600 : 400 }}>
                {c.name}
                {c.status==='missing' && <span style={{ marginLeft:6, fontSize:10, color:ss.dot }}>●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text area */}
      <div style={{ position:'relative' }}>
        <textarea value={raw} onChange={e => setRaw(e.target.value)}
          placeholder={`e.g. "${example}"`}
          style={{ width:'100%', minHeight:220, padding:'16px', fontSize:14, lineHeight:1.7, fontFamily:t.fontSans,
            border:`1px solid ${t.rule}`, background:'#fff', resize:'vertical', outline:'none', color:t.ink,
            boxSizing:'border-box' }}/>
        <div style={{ position:'absolute', bottom:10, right:10, fontFamily:t.fontMono, fontSize:10, color:t.ink3 }}>
          {raw.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      <div style={{ marginTop:20, display:'flex', gap:10, alignItems:'center' }}>
        <button onClick={onExtract} disabled={raw.trim().length < 20}
          style={{ padding:'11px 22px', background: raw.trim().length >= 20 ? t.ink : t.rule,
            color: raw.trim().length >= 20 ? '#fff' : t.ink3, border:'none', fontSize:14, fontWeight:600,
            cursor: raw.trim().length >= 20 ? 'pointer' : 'default', fontFamily:'inherit' }}>
          Extract STAR structure →
        </button>
        <div style={{ fontSize:12, color:t.ink3 }}>
          {raw.trim().length < 20 ? 'Write at least a few sentences first.' : 'AI will parse this into S · T · A · R.'}
        </div>
      </div>
    </div>
  );
}

// Phase 2 — review structured STAR
function StructuredPhase({ star, setStar, title, setTitle, category, accent, onSave, onBack, raw }) {
  const t = MV_TOKENS;
  const cat = SB_CATEGORIES.find(c => c.id === category);
  const updateStar = (key, val) => setStar(s => ({ ...s, [key]: val }));

  return (
    <div>
      <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:8 }}>STEP 2 OF 3</div>
      <h2 style={{ fontFamily:t.fontSerif, fontSize:36, fontWeight:400, margin:'0 0 6px', letterSpacing:-0.6 }}>
        Review the structure.
      </h2>
      <p style={{ fontSize:14, color:t.ink2, lineHeight:1.6, margin:'0 0 24px' }}>
        Mockvue extracted your STAR. Edit any field — especially the <b>Result</b>; add a number if you haven't yet.
      </p>

      {/* Source bubble */}
      <div style={{ marginBottom:24, padding:'12px 14px', background:t.bg, border:`1px solid ${t.rule}`,
        fontSize:12, color:t.ink3, fontStyle:'italic', lineHeight:1.55, position:'relative' }}>
        <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.ink3, letterSpacing:1.5, fontStyle:'normal', marginBottom:4 }}>YOUR ORIGINAL</div>
        {raw || SB_STORIES.find(s=>s.category===category)?.raw}
      </div>

      {/* Title */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:6 }}>STORY TITLE</div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Give it a short, memorable name…"
          style={{ width:'100%', padding:'10px 12px', fontSize:15, fontFamily:t.fontSerif, fontWeight:500,
            border:`1px solid ${t.rule}`, background:'#fff', outline:'none', color:t.ink, boxSizing:'border-box' }}/>
      </div>

      {/* STAR fields */}
      {[
        { key:'s', label:'Situation', hint:'Set the scene. What was broken, unclear, or at risk?' },
        { key:'t', label:'Task',      hint:'What were you specifically responsible for solving?' },
        { key:'a', label:'Action',    hint:'What did YOU do? Be specific. Use "I" not "we".' },
        { key:'r', label:'Result',    hint:'What changed? A number makes this land.' },
      ].map(field => (
        <div key={field.key} style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:6 }}>
            <div style={{ fontFamily:t.fontMono, fontSize:14, color:accent.hi, fontWeight:700, width:18 }}>{field.key.toUpperCase()}</div>
            <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3 }}>{field.label.toUpperCase()}</div>
            <div style={{ fontSize:11, color:t.ink3, fontStyle:'italic' }}>{field.hint}</div>
          </div>
          <textarea value={star[field.key]} onChange={e => updateStar(field.key, e.target.value)}
            style={{ width:'100%', padding:'12px', fontSize:13, lineHeight:1.6, fontFamily:t.fontSans,
              border:`1px solid ${field.key==='r' && !star[field.key].match(/\d/) ? accent.hi : t.rule}`,
              background: field.key==='r' ? accent.lo : '#fff',
              resize:'none', outline:'none', color:t.ink, minHeight:68, boxSizing:'border-box' }}/>
          {field.key==='r' && star[field.key] && !star[field.key].match(/\d/) && (
            <div style={{ fontSize:11, color:accent.hi, marginTop:4, fontFamily:t.fontMono, letterSpacing:0.5 }}>
              ↑ No number detected — try adding a %, $, or timeframe.
            </div>
          )}
        </div>
      ))}

      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <button onClick={onSave} style={{ padding:'11px 22px', background:accent.hi, color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          Save to Story Bank ✓
        </button>
        <button onClick={onBack} style={{ padding:'11px 16px', background:'transparent', color:t.ink3, border:`1px solid ${t.rule}`, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          ← Edit raw
        </button>
      </div>
    </div>
  );
}

// Phase 3 — saved confirmation
function DonePhase({ star, title, category, accent, onAnother }) {
  const t = MV_TOKENS;
  const cat = SB_CATEGORIES.find(c => c.id === category);
  return (
    <div>
      <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:'#3d8a4a', marginBottom:12 }}>✓ SAVED TO LIBRARY</div>
      <h2 style={{ fontFamily:t.fontSerif, fontSize:36, fontWeight:400, margin:'0 0 6px', letterSpacing:-0.6 }}>{title}</h2>
      <div style={{ fontSize:13, color:t.ink3, marginBottom:28, fontFamily:t.fontMono, letterSpacing:0.5 }}>{cat?.name.toUpperCase()}</div>

      {/* Final story card */}
      <div style={{ background:'#fff', border:`1px solid ${t.rule}`, borderTop:`3px solid ${accent.hi}`, padding:'20px 22px', marginBottom:28 }}>
        <div style={{ display:'grid', gridTemplateColumns:'20px 1fr', rowGap:10, columnGap:12, fontSize:14, lineHeight:1.6 }}>
          {[['S',star.s],['T',star.t],['A',star.a],['R',star.r]].map(([k,v])=>(
            <React.Fragment key={k}>
              <div style={{ fontFamily:t.fontMono, fontSize:11, color:accent.hi, fontWeight:700, paddingTop:3 }}>{k}</div>
              <div style={{ color: k==='R' ? t.ink : t.ink2, fontWeight: k==='R' ? 600 : 400 }}>{v}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onAnother} style={{ padding:'11px 20px', background:accent.hi, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          + Add another story
        </button>
        <button style={{ padding:'11px 16px', background:'transparent', color:t.ink, border:`1px solid ${t.rule}`, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          Go to library →
        </button>
      </div>
    </div>
  );
}

// Right rail in editor — tips + company signal
function EditorRail({ phase, category, accent, star }) {
  const t = MV_TOKENS;
  const cat = SB_CATEGORIES.find(c => c.id === category);
  const ss = SB_STATUS[cat?.status || 'missing'];
  const companiesNeedingThis = MV_DATA.companies.filter(c => {
    if (category === 'conflict')   return true;
    if (category === 'leadership') return c.days <= 7;
    return false;
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      {/* Category status */}
      <div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:10 }}>CATEGORY STATUS</div>
        <div style={{ padding:'12px 14px', background:ss.bg, border:`1px solid ${ss.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:4, background:ss.dot }}/>
            <div style={{ fontSize:14, fontWeight:600 }}>{cat?.name}</div>
          </div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, color:ss.text, letterSpacing:1 }}>{ss.label.toUpperCase()} · {cat?.count} OF {cat?.target}</div>
        </div>
      </div>

      {/* Why this matters */}
      {phase === 'raw' && (
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:10 }}>WHY THIS CATEGORY</div>
          <div style={{ fontFamily:t.fontSerif, fontSize:14, lineHeight:1.6, color:t.ink2, fontStyle:'italic' }}>
            {category==='conflict' && '"Tell me about a disagreement with a peer or manager" is asked in 80%+ of behavioral panels. Having a rehearsed story with clean resolution is non-negotiable.'}
            {category==='leadership' && 'Leadership stories test how you move people and decisions — even without authority. Two strong ones cover most panels.'}
            {category==='technical' && 'Interviewers use this to gauge how deeply you can engage with engineering trade-offs. One specific story beats generic process talk.'}
            {!['conflict','leadership','technical'].includes(category) && 'Having a rehearsed, metric-rich story in this category prevents a common gap interviewers will probe.'}
          </div>
        </div>
      )}

      {/* STAR tips in structured phase */}
      {phase === 'structured' && (
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:10 }}>WHAT MAKES A STRONG RESULT</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { check: star.r.match(/\d/),             ok:'Has a number',       no:'Add a %, $, time, or count' },
              { check: star.r.length > 40,              ok:'Enough detail',      no:'Expand — aim for 1–2 sentences' },
              { check: !star.r.toLowerCase().includes('we'), ok:'Uses "I"',      no:'"We" hides your contribution' },
            ].map((x,i) => (
              <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', fontSize:12 }}>
                <div style={{ width:16, height:16, borderRadius:8, background: x.check ? '#3d8a4a' : t.rule,
                  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, flexShrink:0, marginTop:1 }}>
                  {x.check ? '✓' : ''}
                </div>
                <div style={{ color: x.check ? '#3d8a4a' : t.ink3 }}>{x.check ? x.ok : x.no}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companies that need this */}
      {companiesNeedingThis.length > 0 && (
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:10 }}>COMPANIES THAT NEED THIS</div>
          {companiesNeedingThis.map((c,i) => (
            <div key={i} style={{ padding:'8px 0', borderBottom:`1px dotted ${t.rule}`, display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span>{c.name}</span>
              <span style={{ fontFamily:t.fontMono, fontSize:10, color: c.days<=3 ? accent.hi : t.ink3 }}>T-{c.days}d</span>
            </div>
          ))}
        </div>
      )}

      {/* Follow-up prompts */}
      {phase === 'done' && (
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:10 }}>LIKELY FOLLOW-UPS</div>
          {['What would you do differently?', 'How did you handle pushback?', 'What was the hardest part?'].map((q,i)=>(
            <div key={i} style={{ padding:'7px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:13, fontFamily:t.fontSerif, fontStyle:'italic', color:t.ink2 }}>"{q}"</div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MVStoryLibrary, MVStoryEditor });
