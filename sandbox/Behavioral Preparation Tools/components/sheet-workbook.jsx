// Cheat sheet variation A — The Living Workbook
// A scrollable, section-numbered document on warm paper.
// All 10 sections present. Left rail = section nav w/ per-section progress.
// Feels like a well-kept notebook, not a SaaS form.

function MVSheetWorkbook() {
  const t = MV_TOKENS;
  const accent = t.accents.ember;
  const s = MV_SHEET;
  const paper = '#faf6ee';

  return (
    <div style={{ fontFamily: t.fontSans, background: t.bg, color: t.ink, width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Top bar */}
      <div style={{ padding:'14px 24px', borderBottom:`1px solid ${t.rule}`, background:'#fff', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:22, height:22, borderRadius:4, background:t.ink, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:5, border:`2px solid ${accent.hi}`, borderRadius:1, borderLeft:'none', borderTop:'none' }}/>
          </div>
          <div style={{ fontFamily:t.fontSerif, fontSize:16, fontWeight:500 }}>Mockvue</div>
          <div style={{ fontSize:12, color:t.ink3 }}>/ Cheat Sheets / <b style={{ color:t.ink }}>Northwind Media</b></div>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1 }}>T–{s.meta.daysOut}d · SAVED {s.meta.lastEdited}</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:t.fontMono, fontSize:11, color:accent.hi, fontWeight:600 }}>{s.meta.ready}% READY</div>
          <button style={{ background:'transparent', border:`1px solid ${t.rule}`, padding:'6px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Export PDF</button>
          <button style={{ background:accent.hi, color:'#fff', border:'none', padding:'6px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Practice →</button>
        </div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'240px 1fr', overflow:'hidden' }}>
        {/* Left nav */}
        <aside style={{ borderRight:`1px solid ${t.rule}`, background:'#fff', overflowY:'auto', padding:'20px 0' }}>
          <div style={{ padding:'0 20px 14px', fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5 }}>SECTIONS</div>
          {MV_SHEET_PROGRESS.map((sec, i) => (
            <div key={sec.id} style={{ padding:'8px 20px', display:'flex', alignItems:'center', gap:10, cursor:'pointer',
              background: i === 2 ? accent.lo : 'transparent',
              borderLeft: i === 2 ? `2px solid ${accent.hi}` : '2px solid transparent',
            }}>
              <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, width:16 }}>{String(sec.n).padStart(2,'0')}</div>
              <div style={{ flex:1, fontSize:13, color: sec.locked ? t.ink3 : t.ink, fontWeight: i === 2 ? 600 : 400 }}>{sec.name}</div>
              {sec.locked ? <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke={t.ink3} strokeWidth="1.2"><rect x="1.5" y="5.5" width="7" height="5.5" rx="1"/><path d="M3 5.5V3.5a2 2 0 014 0v2"/></svg>
                : <span style={{ fontFamily:t.fontMono, fontSize:10, color: sec.pct===100 ? '#3d8a4a' : accent.hi }}>{sec.pct}%</span>}
            </div>
          ))}
          <div style={{ padding:'20px', marginTop:10, borderTop:`1px solid ${t.rule}` }}>
            <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:10 }}>GAPS</div>
            <div style={{ padding:10, background:accent.lo, borderLeft:`2px solid ${accent.hi}`, fontSize:12, color:t.ink, lineHeight:1.45 }}>
              Missing a <b>"Bias for Impact"</b> story. Draft before Wednesday.
            </div>
          </div>
        </aside>

        {/* Document */}
        <div style={{ overflowY:'auto', background:paper }}>
          <div style={{ maxWidth:720, margin:'0 auto', padding:'48px 60px 80px' }}>
            {/* Title */}
            <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:2, color:accent.hi, textTransform:'uppercase' }}>Behavioral Interview Cheat Sheet</div>
            <h1 style={{ fontFamily:t.fontSerif, fontSize:44, fontWeight:400, letterSpacing:-0.8, lineHeight:1.05, margin:'10px 0 6px' }}>
              {s.meta.company}
            </h1>
            <div style={{ fontSize:14, color:t.ink2, fontStyle:'italic', fontFamily:t.fontSerif }}>{s.meta.role} · {s.meta.date}</div>
            <hr style={{ border:'none', borderTop:`2px solid ${t.ink}`, margin:'24px 0 32px' }}/>

            {/* § 1 Company Snapshot */}
            <Section n={1} title="Company Snapshot"/>
            <Dl rows={[
              ['Company', s.snapshot.name],
              ['Industry / Product', s.snapshot.industry],
              ['Business Model', s.snapshot.model],
              ['Key Competitors', s.snapshot.competitors.join(' · ')],
              ['Values / Principles', s.snapshot.values.map((v,i) => <em key={i} style={{ fontFamily:t.fontSerif, marginRight:10 }}>"{v}"</em>)],
            ]}/>
            <SubHead>Recent News (last 3–6 months)</SubHead>
            <ul style={listStyle}>{s.snapshot.news.map((n,i) => <li key={i} style={liStyle}>{n}</li>)}</ul>
            <SubHead>Strategic Direction (inferred)</SubHead>
            <p style={{ ...pStyle, fontStyle:'italic' }}>{s.snapshot.strategy}</p>

            {/* § 2 Role */}
            <Section n={2} title="Role Breakdown"/>
            <Dl rows={[
              ['Role', s.role.title],
              ['Team / Org', s.role.team],
            ]}/>
            <SubHead>Key Responsibilities</SubHead>
            <ul style={listStyle}>{s.role.responsibilities.map((r,i)=><li key={i} style={liStyle}>{r}</li>)}</ul>
            <SubHead>Top Skills Required</SubHead>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18 }}>
              {s.role.skills.map((k,i)=> <span key={i} style={{ padding:'4px 10px', background:'#fff', border:`1px solid ${t.rule}`, fontSize:12 }}>{k}</span>)}
            </div>
            <SubHead>What Success Looks Like</SubHead>
            <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', rowGap:6, columnGap:14, marginBottom:18, fontSize:14, lineHeight:1.5 }}>
              <div style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink3 }}>0–3 MO</div><div>{s.role.success.m3}</div>
              <div style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink3 }}>3–6 MO</div><div>{s.role.success.m6}</div>
              <div style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink3 }}>6–12 MO</div><div>{s.role.success.m12}</div>
            </div>
            <SubHead>Hiring Signals (inferred, weighted)</SubHead>
            <div style={{ border:`1px solid ${t.rule}`, background:'#fff', marginBottom:18 }}>
              {s.role.signals.map((sig, i) => (
                <div key={i} style={{ padding:'10px 14px', borderTop: i>0 ? `1px solid ${t.rule}` : 'none', display:'grid', gridTemplateColumns:'1fr 1fr 60px', gap:12, alignItems:'center', fontSize:13 }}>
                  <div style={{ fontWeight:500 }}>{sig.s}</div>
                  <div style={{ color:t.ink3, fontStyle:'italic' }}>{sig.evidence}</div>
                  <div style={{ fontFamily:t.fontMono, fontSize:10, textAlign:'right', color: sig.p==='High' ? accent.hi : t.ink2 }}>{sig.p.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* § 3 Story Bank — richer */}
            <Section n={3} title="Story Bank" count={s.stories.length}/>
            {s.stories.map((st, i) => <StoryCard key={i} story={st} accent={accent}/>)}

            {/* § 4 Question Mapping */}
            <Section n={4} title="Question Mapping"/>
            <div style={{ border:`1px solid ${t.rule}`, background:'#fff' }}>
              {s.questionMap.map((q, i) => (
                <div key={i} style={{ padding:'14px 16px', borderTop: i>0 ? `1px solid ${t.rule}` : 'none' }}>
                  <div style={{ fontFamily:t.fontSerif, fontSize:15, fontStyle:'italic', marginBottom:8 }}>"{q.q}"</div>
                  <div style={{ display:'flex', gap:20, fontSize:12 }}>
                    <div><span style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, letterSpacing:1, marginRight:6 }}>PRIMARY</span><b>{q.primary}</b></div>
                    <div style={{ color: q.backup ? t.ink2 : t.ink3 }}>
                      <span style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1, marginRight:6 }}>BACKUP</span>
                      {q.backup || <i>— none yet —</i>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* § 5 Alignment */}
            <Section n={5} title="Company-Specific Alignment"/>
            <SubHead>Value → Story</SubHead>
            <div style={{ border:`1px solid ${t.rule}`, background:'#fff', marginBottom:18 }}>
              {s.alignment.valueToStory.map((a, i) => {
                const color = a.strength==='missing' ? accent.hi : a.strength==='strong' ? '#3d8a4a' : t.ink2;
                return (
                  <div key={i} style={{ padding:'12px 14px', borderTop: i>0 ? `1px solid ${t.rule}` : 'none', display:'grid', gridTemplateColumns:'200px 1fr 80px', gap:14, alignItems:'center' }}>
                    <div style={{ fontFamily:t.fontSerif, fontSize:14, fontStyle:'italic' }}>"{a.v}"</div>
                    <div style={{ fontSize:13, color: a.story ? t.ink : accent.hi, fontStyle: a.story ? 'normal' : 'italic' }}>
                      {a.story || '— draft required —'}
                    </div>
                    <div style={{ fontFamily:t.fontMono, fontSize:10, color, textAlign:'right' }}>{a.strength.toUpperCase()}</div>
                  </div>
                );
              })}
            </div>
            <SubHead>Most Relevant Experiences</SubHead>
            <ul style={listStyle}>{s.alignment.mostRelevant.map((x,i)=><li key={i} style={liStyle}>{x}</li>)}</ul>
            <SubHead>Potential Gaps / Risks</SubHead>
            <ul style={listStyle}>{s.alignment.gaps.map((x,i)=><li key={i} style={{ ...liStyle, color:accent.hi }}>{x}</li>)}</ul>

            {/* § 6 */}
            <Section n={6} title="Strengths & Weaknesses"/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:20 }}>
              <div>
                <SubHead>Strengths</SubHead>
                {s.strengthsWeaknesses.strengths.map((x,i)=>(
                  <div key={i} style={{ padding:'10px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:13 }}>
                    <div style={{ fontWeight:600 }}>{x.s}</div>
                    <div style={{ color:t.ink3, fontSize:12, marginTop:2 }}>→ {x.story}</div>
                  </div>
                ))}
              </div>
              <div>
                <SubHead>Weaknesses &amp; Mitigation</SubHead>
                {s.strengthsWeaknesses.weaknesses.map((x,i)=>(
                  <div key={i} style={{ padding:'10px 0', borderBottom:`1px dotted ${t.rule}`, fontSize:13 }}>
                    <div style={{ fontWeight:600 }}>{x.w}</div>
                    <div style={{ color:t.ink2, fontSize:12, marginTop:2, fontStyle:'italic' }}>{x.mit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* § 7 */}
            <Section n={7} title="Key Talking Points"/>
            <TalkingCard label="Tell me about yourself · 30–60s" text={s.talkingPoints.tmay}/>
            <TalkingCard label="Career narrative · 1–2 min"    text={s.talkingPoints.narrative}/>
            <TalkingCard label="Why this company"              text={s.talkingPoints.whyCompany}/>
            <TalkingCard label="Why this role"                 text={s.talkingPoints.whyRole}/>

            {/* § 8 */}
            <Section n={8} title="Questions for Interviewer"/>
            <QGroup title="About the role"    items={s.questionsForInterviewer.role}/>
            <QGroup title="About the team"    items={s.questionsForInterviewer.team}/>
            <QGroup title="About the company" items={s.questionsForInterviewer.company}/>

            {/* § 9 */}
            <Section n={9} title="Logistics & Notes"/>
            <Dl rows={[
              ['Round', s.logistics.round],
              ['When', s.logistics.dates.map(d=>`${d.when} · ${d.type}`).join(' · ')],
            ]}/>
            <SubHead>Interviewers</SubHead>
            <div style={{ border:`1px solid ${t.rule}`, background:'#fff', marginBottom:18 }}>
              {s.logistics.interviewers.map((p,i)=>(
                <div key={i} style={{ padding:'12px 14px', borderTop:i>0?`1px solid ${t.rule}`:'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <b style={{ fontSize:14 }}>{p.name}</b>
                    <span style={{ fontSize:12, color:t.ink3 }}>{p.role}</span>
                  </div>
                  <div style={{ fontSize:12, color:t.ink2, fontStyle:'italic' }}>{p.notes}</div>
                </div>
              ))}
            </div>

            {/* § 10 */}
            <Section n={10} title="Post-Interview Reflection" locked/>
            <div style={{ padding:24, border:`1.5px dashed ${t.ink3}`, background:'rgba(0,0,0,0.02)', textAlign:'center' }}>
              <div style={{ fontSize:13, color:t.ink3, fontFamily:t.fontSerif, fontStyle:'italic' }}>
                Unlocks after Thursday, Apr 24 at 2:45 PM.<br/>
                You'll be prompted to fill: what went well, what didn't, questions you struggled with, stories to add.
              </div>
            </div>

            <div style={{ marginTop:40, paddingTop:20, borderTop:`2px solid ${t.ink}`, display:'flex', justifyContent:'space-between', fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1 }}>
              <div>— END OF BRIEF · MOCKVUE · ALEX MORENO —</div>
              <div>P. 1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── atoms ────────────────────────
const pStyle = { fontSize:14, lineHeight:1.6, color:MV_TOKENS.ink2, margin:'0 0 14px' };
const listStyle = { margin:'0 0 18px', padding:'0 0 0 18px', fontSize:14, lineHeight:1.7, color:MV_TOKENS.ink2 };
const liStyle = { marginBottom:3 };

function Section({ n, title, count, locked }) {
  const t = MV_TOKENS;
  return (
    <div style={{ margin:'34px 0 18px' }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
        <span style={{ fontFamily:t.fontSerif, fontSize:22, fontStyle:'italic', color:t.ink3 }}>§ {n}.</span>
        <h2 style={{ fontFamily:t.fontSerif, fontSize:28, fontWeight:500, margin:0, letterSpacing:-0.4, color: locked ? t.ink3 : t.ink }}>{title}</h2>
        {count && <span style={{ fontSize:12, color:t.ink3, fontFamily:t.fontMono }}>· {count} entries</span>}
        {locked && <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke={t.ink3} strokeWidth="1.3"><rect x="1.5" y="5.5" width="8" height="6" rx="1"/><path d="M3 5.5V3.5a2.5 2.5 0 015 0v2"/></svg>}
      </div>
      <div style={{ height:1, background:t.rule, marginTop:10 }}/>
    </div>
  );
}
function SubHead({ children }) {
  const t = MV_TOKENS;
  return <div style={{ fontFamily:t.fontMono, fontSize:10, letterSpacing:1.5, color:t.ink3, marginBottom:8, textTransform:'uppercase' }}>{children}</div>;
}
function Dl({ rows }) {
  const t = MV_TOKENS;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', rowGap:6, columnGap:16, marginBottom:18 }}>
      {rows.map(([k,v], i) => (
        <React.Fragment key={i}>
          <div style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink3, letterSpacing:0.5, textTransform:'uppercase', paddingTop:3 }}>{k}</div>
          <div style={{ fontSize:14, color:t.ink2, lineHeight:1.5 }}>{v}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
function StoryCard({ story, accent }) {
  const t = MV_TOKENS;
  return (
    <div style={{ background:'#fff', border:`1px solid ${t.rule}`, borderLeft:`3px solid ${accent.hi}`, padding:'16px 18px', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8 }}>
        <h3 style={{ fontFamily:t.fontSerif, fontSize:19, fontWeight:500, margin:0 }}>{story.title}</h3>
        <div style={{ display:'flex', gap:4 }}>
          {story.tags.map((tag,i)=>(
            <span key={i} style={{ fontSize:10, fontFamily:t.fontMono, padding:'2px 6px', background:t.bg, color:t.ink2, letterSpacing:0.5 }}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'18px 1fr', rowGap:6, columnGap:12, fontSize:13, lineHeight:1.55 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, fontWeight:700, paddingTop:2 }}>S</div><div>{story.star.s}</div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, fontWeight:700, paddingTop:2 }}>T</div><div>{story.star.t}</div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, fontWeight:700, paddingTop:2 }}>A</div><div>{story.star.a}</div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:accent.hi, fontWeight:700, paddingTop:2 }}>R</div><div style={{ color:t.ink, fontWeight:500 }}>{story.star.r}</div>
      </div>
      <div style={{ marginTop:10, paddingTop:10, borderTop:`1px dotted ${t.rule}`, fontSize:12, color:t.ink2, fontStyle:'italic' }}>
        Takeaway: {story.takeaway}
      </div>
      {story.followups.length > 0 && (
        <div style={{ marginTop:6, fontSize:11, color:t.ink3 }}>
          Follow-ups · {story.followups.join(' · ')}
        </div>
      )}
    </div>
  );
}
function TalkingCard({ label, text }) {
  const t = MV_TOKENS;
  return (
    <div style={{ background:'#fff', border:`1px solid ${t.rule}`, padding:'14px 16px', marginBottom:12 }}>
      <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:6 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily:t.fontSerif, fontSize:15, lineHeight:1.55, color:t.ink }}>{text}</div>
    </div>
  );
}
function QGroup({ title, items }) {
  const t = MV_TOKENS;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.ink3, letterSpacing:1.5, marginBottom:8, textTransform:'uppercase' }}>{title}</div>
      <ol style={{ margin:0, padding:'0 0 0 20px', fontSize:14, lineHeight:1.65, color:t.ink2, fontFamily:MV_TOKENS.fontSerif }}>
        {items.map((x,i)=><li key={i} style={{ marginBottom:3 }}>"{x}"</li>)}
      </ol>
    </div>
  );
}

Object.assign(window, { MVSheetWorkbook });
