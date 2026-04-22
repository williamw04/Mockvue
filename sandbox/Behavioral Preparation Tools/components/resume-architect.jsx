// Resume Architect — side-by-side diff editor
// Original bullet left · AI rewrite right · accept/reject per bullet
// Right rail: score, missing keywords, story bank links, AI-generated todos

const RA_DATA = {
  scores: {
    general:  { score: 68, label: 'General Strength' },
    northwind:{ score: 72, label: 'Northwind fit',   color: '#d9532b' },
    atlas:    { score: 54, label: 'Atlas fit',        color: '#1e3a8a' },
    pennant:  { score: 31, label: 'Pennant fit',      color: '#3d5a3a' },
  },
  keywords: {
    northwind: [
      { kw: 'Video infrastructure',        found: true  },
      { kw: 'Streaming quality / QoE',     found: false },
      { kw: 'Live events infra',           found: false },
      { kw: 'A/B experimentation',         found: false },
      { kw: 'Cross-platform PM',           found: true  },
      { kw: 'Startup time / rebuffer SLO', found: false },
    ],
    atlas:    [
      { kw: 'Logistics / routing',         found: false },
      { kw: 'Data-driven PM',              found: true  },
      { kw: 'Marketplace experience',      found: false },
    ],
    pennant:  [
      { kw: 'Staff-level IC influence',    found: false },
      { kw: 'Enterprise SaaS',             found: false },
      { kw: 'B2B product',                 found: false },
    ],
  },
  todos: [
    { text: 'Draft "Bias for Impact" story — no bullet covers it', p: 'high' },
    { text: 'Add live-events context to any Helix bullet', p: 'high' },
    { text: 'Add "A/B experimentation" keyword explicitly', p: 'med' },
    { text: 'Quantify Kestrel pricing bullet with revenue if possible', p: 'low' },
  ],
  sections: [
    {
      id: 'summary', title: 'Summary',
      bullets: [
        { id:'s1', original:'Results-driven product manager with 9 years of experience across consumer tech and enterprise software.',
          rewrite:'Senior PM with 9 years building video infrastructure and cross-platform products — most recently cutting rebuffer by 65% and shipping QoE frameworks adopted org-wide.',
          flags:['VAGUE VERB','NO KW'], story:null, cut:false },
      ]
    },
    {
      id: 'helix', title: 'Helix · Sr PM, Playback · 2021–2025',
      bullets: [
        { id:'h1', original:'Led the migration of the video player SDK across four teams.',
          rewrite:'Coordinated 4-team player SDK migration under a 90-day deadline; cut session rebuffer from 22% → 7% and recovered ~$1.4M in at-risk ARR.',
          flags:['VAGUE VERB','NO METRIC'], story:'Helix playback migration', cut:false },
        { id:'h2', original:'Worked with engineering to improve video quality metrics.',
          rewrite:null, flags:['WEAK'], story:null, cut:true,
          cutReason:'Evidence already covered in the SDK migration bullet above. Cutting strengthens the section.' },
        { id:'h3', original:'Managed roadmap for the Playback team.',
          rewrite:'Owned 3-platform Playback roadmap (iOS, Android, web) for a 35-person org; defined quality SLOs now used as the team\'s north-star metrics.',
          flags:['VAGUE VERB','NO METRIC'], story:null, cut:false },
        { id:'h4', original:'Responsible for cross-functional alignment on product launches.',
          rewrite:null, flags:['WEAK','VAGUE VERB'], story:null, cut:true,
          cutReason:'"Responsible for" signals ownership without evidence. Cross-functional proof is stronger in the migration bullet.' },
        { id:'h5', original:'Drove a 22% reduction in rebuffer rates through improved infrastructure.',
          rewrite:'Drove rebuffer rate from 22% → 7% via a 4-team SDK migration; improvement attributed to a 3% drop in subscriber churn quarter-over-quarter.',
          flags:['NO METRIC'], story:'Helix playback migration', cut:false },
        { id:'h6', original:'Led a team of four PMs during the Q3 planning cycle.',
          rewrite:'Introduced a north-star metric framework for 4 PMs; increased shippable roadmap bets from 3 → 5 per quarter while reclaiming 6h/wk per PM.',
          flags:['VAGUE VERB','NO METRIC'], story:'Q3 roadmap autonomy', cut:false },
      ]
    },
    {
      id: 'kestrel', title: 'Kestrel · PM, Ads Infra · 2017–2021',
      bullets: [
        { id:'k1', original:'Managed ad serving pipeline for 3 major clients.',
          rewrite:'Owned ad serving pipeline for 3 enterprise clients ($12M combined ARR); restructured SLAs to cut P0 incidents by 40% over two quarters.',
          flags:['VAGUE VERB','NO METRIC'], story:null, cut:false },
        { id:'k2', original:'Supported new feature launches across engineering teams.',
          rewrite:null, flags:['WEAK','VAGUE VERB'], story:null, cut:true,
          cutReason:'"Supported" signals junior scope. Cut or replace with a specific launch + metric you owned.' },
        { id:'k3', original:'Worked on pricing strategy for premium ad tiers.',
          rewrite:'Designed Van Westendorp pricing study for premium ad tier (n=200); identified +$3 CPM sweet spot; shipped model in Q1 2020.',
          flags:['VAGUE VERB','NO METRIC'], story:'Pricing experiment that failed', cut:false },
      ]
    },
  ],
};

const FLAG_STYLE = {
  'VAGUE VERB': { bg:'#fef3c7', color:'#b45309' },
  'NO METRIC':  { bg:'#ffedd5', color:'#c2410c' },
  'NO KW':      { bg:'#fde8e0', color:'#d9532b' },
  'WEAK':       { bg:'#fee2e2', color:'#b91c1c' },
};

function MVResumeArchitect() {
  const t = MV_TOKENS;
  const accent = t.accents.ember;
  const [states, setStates] = React.useState({}); // bulletId → 'accepted'|'rejected'|'cut'
  const [expanded, setExpanded] = React.useState('h1');
  const [company, setCompany] = React.useState('northwind');
  const [mode, setMode] = React.useState('diff'); // 'diff' | 'agent'
  const [activeSection, setActiveSection] = React.useState('helix');

  const setBullet = (id, val) => setStates(s => ({ ...s, [id]: val }));

  const allBullets = RA_DATA.sections.flatMap(s => s.bullets);
  const accepted = allBullets.filter(b => states[b.id] === 'accepted' || states[b.id] === 'cut').length;
  const total = allBullets.length;
  const progress = Math.round(accepted / total * 100);
  const score = RA_DATA.scores[company] || RA_DATA.scores.general;
  const kws = RA_DATA.keywords[company] || [];

  return (
    <div style={{ fontFamily:t.fontSans, background:t.bg, color:t.ink, width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* ── Top bar ── */}
      <div style={{ padding:'14px 24px', borderBottom:`1px solid ${t.rule}`, background:'#fff', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:22, height:22, borderRadius:4, background:t.ink, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:5, border:`2px solid ${accent.hi}`, borderRadius:1, borderLeft:'none', borderTop:'none' }}/>
          </div>
          <div style={{ fontFamily:t.fontSerif, fontSize:16, fontWeight:500 }}>Mockvue</div>
          <div style={{ fontSize:12, color:t.ink3 }}>/ <b style={{ color:t.ink }}>Resume Architect</b></div>
        </div>

        <div style={{ width:1, height:20, background:t.rule }}/>

        {/* Mode toggle */}
        <div style={{ display:'flex', background:t.bg, border:`1px solid ${t.rule}`, borderRadius:2, padding:2, gap:2 }}>
          {[['diff','Diff Editor'],['agent','Agent Mode']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{ padding:'5px 12px', fontSize:12, fontWeight:600, border:'none', cursor:'pointer', borderRadius:1,
              background: mode===m ? t.ink : 'transparent', color: mode===m ? '#fff' : t.ink3, fontFamily:'inherit' }}>{label}</button>
          ))}
        </div>

        <div style={{ flex:1 }}/>

        {/* Company score selector */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {Object.entries(RA_DATA.scores).map(([key, s]) => (
            <button key={key} onClick={() => setCompany(key)} style={{ padding:'5px 10px', fontSize:11, fontFamily:t.fontMono, border:`1px solid ${company===key ? (s.color||t.ink) : t.rule}`,
              background: company===key ? (s.color ? s.color+'14' : t.bg) : 'transparent',
              color: company===key ? (s.color||t.ink) : t.ink3, cursor:'pointer', letterSpacing:0.5 }}>
              {s.label} · <b>{s.score}</b>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:120, height:4, background:t.rule, borderRadius:2 }}>
            <div style={{ width:`${progress}%`, height:'100%', background:accent.hi, borderRadius:2, transition:'width .4s' }}/>
          </div>
          <div style={{ fontFamily:t.fontMono, fontSize:11, color:accent.hi, fontWeight:600 }}>{progress}%</div>
        </div>

        <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1 }}>LAST EDITED 2 DAYS AGO</div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'200px 1fr 260px', overflow:'hidden' }}>
          {/* ── Section nav ── */}
          <aside style={{ borderRight:`1px solid ${t.rule}`, background:'#fff', overflowY:'auto', padding:'20px 0' }}>
            <div style={{ padding:'0 18px 12px', fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5 }}>SECTIONS</div>
            {RA_DATA.sections.map(sec => {
              const done = sec.bullets.filter(b => states[b.id]).length;
              const pct  = Math.round(done/sec.bullets.length*100);
              return (
                <div key={sec.id} onClick={() => setActiveSection(sec.id)}
                  style={{ padding:'10px 18px', cursor:'pointer', borderLeft:`2px solid ${activeSection===sec.id ? accent.hi : 'transparent'}`,
                    background: activeSection===sec.id ? accent.lo : 'transparent' }}>
                  <div style={{ fontSize:13, fontWeight: activeSection===sec.id?600:400, marginBottom:4 }}>{sec.title.split('·')[0].trim()}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ flex:1, height:3, background:t.rule }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: pct===100 ? '#3d8a4a' : accent.hi }}/>
                    </div>
                    <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3 }}>{done}/{sec.bullets.length}</div>
                  </div>
                </div>
              );
            })}

            <div style={{ padding:'20px 18px 0', borderTop:`1px solid ${t.rule}`, marginTop:10 }}>
              <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:8 }}>STATS</div>
              {[['Bullets','22'],['Unquantified','7'],['Cut suggested','3'],['Accepted',`${accepted}`]].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5, color:t.ink2 }}>
                  <span>{k}</span><b style={{ color:t.ink }}>{v}</b>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Diff editor ── */}
          <main style={{ overflowY:'auto', padding:'28px 28px 60px' }}>
            {mode === 'agent' && <InsightsStrip score={score} kws={kws} accent={accent}/>}
            {RA_DATA.sections.filter(s => s.id === activeSection).map(sec => (
              <div key={sec.id}>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:4 }}>EXPERIENCE</div>
                  <h2 style={{ fontFamily:t.fontSerif, fontSize:26, fontWeight:500, margin:0, letterSpacing:-0.4 }}>{sec.title}</h2>
                </div>

                {/* Column headers */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:10 }}>
                  <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3 }}>ORIGINAL</div>
                  <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:accent.hi }}>AI REWRITE</div>
                </div>

                {sec.bullets.map(bullet => {
                  const st = states[bullet.id];
                  const isExp = expanded === bullet.id;
                  const isDone = st === 'accepted' || st === 'rejected' || st === 'cut';
                  return (
                    <div key={bullet.id} style={{ marginBottom:10 }}>
                      <div onClick={() => setExpanded(isExp ? null : bullet.id)}
                        style={{ cursor:'pointer', border:`1px solid ${isExp ? accent.hi : t.rule}`, background: isDone ? '#fafaf8' : '#fff',
                          borderRadius:0, transition:'border-color .15s', opacity: isDone ? 0.65 : 1 }}>
                        {/* Bullet header */}
                        <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                          {/* Status orb */}
                          <div style={{ width:10, height:10, borderRadius:5, flexShrink:0,
                            background: st==='accepted' ? '#3d8a4a' : st==='cut' ? '#9ca3af' : st==='rejected' ? t.ink3 : bullet.cut ? '#ef4444' : accent.hi }}/>
                          <div style={{ flex:1, fontSize:13, color: isDone ? t.ink3 : t.ink, lineHeight:1.45,
                            textDecoration: st==='cut' ? 'line-through' : 'none', fontStyle: isDone?'italic':'normal' }}>
                            {bullet.original}
                          </div>
                          <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                            {bullet.cut && <Chip label="CUT" bg="#fee2e2" color="#b91c1c"/>}
                            {!bullet.cut && bullet.flags.map(f => <Chip key={f} label={f} {...(FLAG_STYLE[f]||{})}/>)}
                          </div>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={t.ink3} strokeWidth="1.5" strokeLinecap="round"
                            style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition:'.2s', flexShrink:0 }}>
                            <path d="M2 4l4 4 4-4"/>
                          </svg>
                        </div>

                        {/* Expanded diff */}
                        {isExp && (
                          <div style={{ borderTop:`1px solid ${t.rule}`, padding:'14px 14px 16px' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                              {/* Original */}
                              <div style={{ padding:12, background:t.bg, borderLeft:`3px solid ${t.rule}`, fontSize:14, lineHeight:1.6, color:t.ink2 }}>
                                {bullet.original}
                              </div>
                              {/* Rewrite */}
                              {bullet.cut ? (
                                <div style={{ padding:12, background:'#fef2f2', borderLeft:`3px solid #ef4444`, fontSize:14, lineHeight:1.6, color:'#b91c1c' }}>
                                  <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1, marginBottom:6, color:'#ef4444' }}>SUGGESTED CUT</div>
                                  {bullet.cutReason}
                                </div>
                              ) : (
                                <div style={{ padding:12, background:accent.lo, borderLeft:`3px solid ${accent.hi}`, fontSize:14, lineHeight:1.6, color:t.ink }}>
                                  {bullet.rewrite}
                                </div>
                              )}
                            </div>

                            {/* Story link */}
                            {bullet.story && (
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, fontSize:12, color:t.ink3 }}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={accent.hi} strokeWidth="1.5"><circle cx="6" cy="6" r="5"/><path d="M6 4v4M4 6h4" strokeLinecap="round"/></svg>
                                <span>Maps to story: <b style={{ color:accent.hi }}>{bullet.story}</b></span>
                              </div>
                            )}

                            {/* Actions */}
                            <div style={{ display:'flex', gap:8 }}>
                              {bullet.cut ? (
                                <button onClick={e=>{e.stopPropagation();setBullet(bullet.id,'cut');setExpanded(null);}}
                                  style={btnStyle('#ef4444','#fff')}>Confirm cut</button>
                              ) : (
                                <button onClick={e=>{e.stopPropagation();setBullet(bullet.id,'accepted');setExpanded(null);}}
                                  style={btnStyle(accent.hi,'#fff')}>Accept rewrite ✓</button>
                              )}
                              <button onClick={e=>{e.stopPropagation();setBullet(bullet.id,'rejected');setExpanded(null);}}
                                style={btnStyle('transparent',t.ink3, t.rule)}>Keep original</button>
                              <button onClick={e=>{e.stopPropagation();setBullet(bullet.id,undefined);}}
                                style={{ ...btnStyle('transparent',t.ink3), border:'none' }}>Reset</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </main>

          {mode === 'agent'
            ? <AgentChatPanel accent={accent}/>
            : <InsightsRail score={score} kws={kws} accent={accent}/>
          }
        </div>
    </div>
  );
}

// ── Shared insights content ────────────────────────────────────────

// Vertical rail — shown in diff mode (right sidebar)
function InsightsRail({ score, kws, accent }) {
  const t = MV_TOKENS;
  return (
    <aside style={{ borderLeft:`1px solid ${t.rule}`, background:'#fff', overflowY:'auto', padding:'24px 18px', display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ textAlign:'center' }}>
        <MVRing pct={score.score} size={72} stroke={5} color={score.color||accent.hi} track={t.rule}>
          <span style={{ fontFamily:t.fontMono, fontSize:13, fontWeight:700 }}>{score.score}</span>
        </MVRing>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginTop:8 }}>{score.label.toUpperCase()}</div>
      </div>
      {kws.length > 0 && (
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>KEYWORD COVERAGE</div>
          {kws.map((k,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:12 }}>
              <div style={{ width:8, height:8, borderRadius:4, background: k.found ? '#3d8a4a' : '#ef4444', flexShrink:0 }}/>
              <span style={{ color: k.found ? t.ink : '#b91c1c', flex:1 }}>{k.kw}</span>
              {!k.found && <span style={{ fontFamily:t.fontMono, fontSize:9, color:'#b91c1c', letterSpacing:0.5 }}>MISSING</span>}
            </div>
          ))}
        </div>
      )}
      <div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>STORY BANK LINKS</div>
        {[...new Set(RA_DATA.sections.flatMap(s=>s.bullets).filter(b=>b.story).map(b=>b.story))].map((story,i)=>(
          <div key={i} style={{ padding:'7px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:12 }}>
            <div style={{ color:accent.hi, fontWeight:600 }}>{story}</div>
            <div style={{ color:t.ink3, fontSize:11, marginTop:2 }}>
              {RA_DATA.sections.flatMap(s=>s.bullets).filter(b=>b.story===story).length} bullet{RA_DATA.sections.flatMap(s=>s.bullets).filter(b=>b.story===story).length>1?'s':''} reference this
            </div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>AI TODOS</div>
        {RA_DATA.todos.map((todo,i)=>(
          <div key={i} style={{ padding:'8px 0 8px 10px', borderLeft:`2px solid ${todo.p==='high'?accent.hi:todo.p==='med'?'#c7851a':t.rule}`, marginBottom:8, fontSize:12, lineHeight:1.45, color:t.ink2 }}>
            {todo.text}
            <div style={{ fontFamily:t.fontMono, fontSize:9, color:todo.p==='high'?accent.hi:todo.p==='med'?'#c7851a':t.ink3, marginTop:3, letterSpacing:0.5 }}>{todo.p.toUpperCase()} PRIORITY</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// Horizontal strip — shown above the diff in agent mode
function InsightsStrip({ score, kws, accent }) {
  const t = MV_TOKENS;
  const allBullets = RA_DATA.sections.flatMap(s=>s.bullets);
  const stories = [...new Set(allBullets.filter(b=>b.story).map(b=>b.story))];
  return (
    <div style={{ marginBottom:24, display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr', gap:12, alignItems:'start' }}>
      {/* Score */}
      <div style={{ background:'#fff', border:`1px solid ${t.rule}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
        <MVRing pct={score.score} size={52} stroke={4} color={score.color||accent.hi} track={t.rule}>
          <span style={{ fontFamily:t.fontMono, fontSize:11, fontWeight:700 }}>{score.score}</span>
        </MVRing>
        <div>
          <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.ink3, letterSpacing:1.5, marginBottom:3 }}>FIT SCORE</div>
          <div style={{ fontSize:13, fontWeight:600 }}>{score.label}</div>
        </div>
      </div>
      {/* Keywords */}
      <div style={{ background:'#fff', border:`1px solid ${t.rule}`, padding:'14px 16px' }}>
        <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>KEYWORD COVERAGE</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {kws.slice(0,4).map((k,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12 }}>
              <div style={{ width:7, height:7, borderRadius:4, background: k.found ? '#3d8a4a' : '#ef4444', flexShrink:0 }}/>
              <span style={{ color: k.found ? t.ink2 : '#b91c1c', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{k.kw}</span>
              {!k.found && <span style={{ fontFamily:t.fontMono, fontSize:9, color:'#b91c1c' }}>MISSING</span>}
            </div>
          ))}
          {kws.length > 4 && <div style={{ fontSize:11, color:t.ink3 }}>+{kws.length-4} more</div>}
        </div>
      </div>
      {/* Story bank */}
      <div style={{ background:'#fff', border:`1px solid ${t.rule}`, padding:'14px 16px' }}>
        <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>STORY BANK LINKS</div>
        {stories.map((story,i)=>(
          <div key={i} style={{ padding:'4px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:12, color:accent.hi, fontWeight:500 }}>{story}</div>
        ))}
      </div>
      {/* Todos */}
      <div style={{ background:'#fff', border:`1px solid ${t.rule}`, padding:'14px 16px' }}>
        <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>AI TODOS</div>
        {RA_DATA.todos.map((todo,i)=>(
          <div key={i} style={{ padding:'5px 0 5px 8px', borderLeft:`2px solid ${todo.p==='high'?accent.hi:todo.p==='med'?'#c7851a':t.rule}`, marginBottom:6, fontSize:11, lineHeight:1.4, color:t.ink2 }}>
            {todo.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Atoms ──────────────────────────────────────
function Chip({ label, bg='#f3f4f6', color='#6b7280' }) {
  return <span style={{ fontFamily:MV_TOKENS.fontMono, fontSize:9, padding:'2px 6px', background:bg, color, letterSpacing:0.5, whiteSpace:'nowrap', flexShrink:0 }}>{label}</span>;
}

function btnStyle(bg, color, borderColor) {
  return { background:bg, color, border:`1px solid ${borderColor||bg}`, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' };
}

// ── Agent chat panel — right sidebar in agent mode ────────────────
const AGENT_PROMPTS = [
  { from:'agent', text:'Hi Alex! I don\'t see a resume yet. Let\'s build one. Tell me about your most recent role — what was the title and the team?' },
  { from:'user',  text:'I was Sr PM, Playback at Helix. Team of about 35.' },
  { from:'agent', text:'Great. What were the two or three biggest things you shipped there — and do any of them have a number attached? (users, revenue, latency, anything)' },
  { from:'user',  text:'I led a player SDK migration that cut rebuffer rates from 22% to 7%. Also owned the 3-platform roadmap and mentored 4 PMs.' },
  { from:'agent', text:'That\'s strong. Here\'s a draft bullet for the migration — does this feel right?\n\n→ "Coordinated 4-team player SDK migration under a 90-day deadline; cut session rebuffer from 22% → 7% and recovered ~$1.4M in at-risk ARR."' },
];

function AgentChatPanel({ accent }) {
  const t = MV_TOKENS;
  const [msgs, setMsgs] = React.useState(AGENT_PROMPTS.slice(0,1));
  const [step, setStep] = React.useState(1);
  const [input, setInput] = React.useState('');

  const advance = () => {
    if (step >= AGENT_PROMPTS.length) return;
    const next = AGENT_PROMPTS[step];
    setMsgs(m => [...m, next]);
    setStep(s => s + 1);
    setInput('');
    setTimeout(() => {
      setStep(s => {
        if (s < AGENT_PROMPTS.length && AGENT_PROMPTS[s].from === 'agent') {
          setMsgs(m => [...m, AGENT_PROMPTS[s]]);
          return s + 1;
        }
        return s;
      });
    }, 600);
  };

  return (
    <aside style={{ borderLeft:`1px solid ${t.rule}`, background:'#fff', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${t.rule}`, flexShrink:0 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:accent.hi, marginBottom:2 }}>AGENT</div>
        <div style={{ fontSize:13, fontWeight:600 }}>Resume Builder</div>
        <div style={{ fontSize:11, color:t.ink3, marginTop:2 }}>Answering builds your resume live →</div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', display:'flex', flexDirection:'column', gap:12 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', gap:8, flexDirection: m.from==='user' ? 'row-reverse' : 'row', alignItems:'flex-start' }}>
            <div style={{ width:24, height:24, borderRadius:12, background: m.from==='agent' ? t.ink : accent.hi, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontFamily:t.fontMono, color:'#fff', letterSpacing:0.3 }}>
              {m.from==='agent' ? 'AI' : 'AM'}
            </div>
            <div style={{ maxWidth:'82%', padding:'10px 12px', fontSize:12, lineHeight:1.6, whiteSpace:'pre-wrap',
              background: m.from==='user' ? accent.lo : t.bg,
              border:`1px solid ${m.from==='user' ? accent.hi+'50' : t.rule}`,
              color: t.ink }}>
              {m.text}
            </div>
          </div>
        ))}
        {step >= AGENT_PROMPTS.length && (
          <div style={{ padding:10, border:`1px solid #3d8a4a`, background:'#f0fdf4', color:'#166534', fontSize:11, lineHeight:1.5 }}>
            Draft complete. The diff editor above shows your bullets — accept or refine each one.
          </div>
        )}
      </div>

      {/* Input */}
      {step < AGENT_PROMPTS.length && (
        <div style={{ padding:'12px 14px', borderTop:`1px solid ${t.rule}`, flexShrink:0, display:'flex', gap:8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && advance()}
            placeholder="Type your answer…"
            style={{ flex:1, padding:'8px 10px', border:`1px solid ${t.rule}`, fontFamily:'inherit', fontSize:12, background:t.bg, outline:'none' }}/>
          <button onClick={advance}
            style={{ padding:'8px 14px', background:accent.hi, color:'#fff', border:'none', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            →
          </button>
        </div>
      )}
    </aside>
  );
}

Object.assign(window, { MVResumeArchitect });
