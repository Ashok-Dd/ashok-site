import { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Code2, Server, Cpu, Brain, Wrench, Zap, X, Target } from 'lucide-react';
import PortalTrigger from './PortalTrigger';
import SkillShooter from './SkillShooter';
import { categoriesData } from '../../data';

// ─── SHARED DATA ─────────────────────────────────────────────────────────────


const allSkills = categoriesData.flatMap(cat =>
  cat.skills.map(skill => ({ skill, category: cat.id }))
);


// ═══════════════════════════════════════════════════════════════════════════
// SKILLS SECTION
// ═══════════════════════════════════════════════════════════════════════════
export default function Skills() {
  const [isVisible,        setIsVisible]       = useState(false);
  const [selectedCategory, setSelectedCategory]= useState('all');
  const [displayedSkills,  setDisplayedSkills] = useState(allSkills);
  const [currentPage,      setCurrentPage]     = useState(1);
  const [gameActive,       setGameActive]      = useState(false);
  const [transitioning,    setTransitioning]   = useState(false);
  const skillsPerPage = 8;

  const sectionRef = useRef();
  const overlayRef = useRef();

  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setIsVisible(true);}),{threshold:.1});
    const el=document.getElementById('skills');if(el)obs.observe(el);return()=>obs.disconnect();
  },[]);

  useEffect(()=>{
    setCurrentPage(1);
    if(selectedCategory==='all'){setDisplayedSkills(allSkills);return;}
    const cat=categoriesData.find(c=>c.id===selectedCategory);
    setDisplayedSkills(cat?cat.skills.map(s=>({skill:s,category:cat.id})):[]);
  },[selectedCategory]);

  const totalPages    = Math.ceil(displayedSkills.length/skillsPerPage);
  const currentSkills = displayedSkills.slice((currentPage-1)*skillsPerPage,currentPage*skillsPerPage);

  const enterGame = useCallback(()=>{
    if(transitioning)return;
    setTransitioning(true);
    const sec=sectionRef.current;
    sec.style.transition='transform .5s ease-in, opacity .5s ease-in';
    sec.style.transform='scale(1.05)';sec.style.opacity='0';
    const ov=overlayRef.current;
    ov.style.display='block';ov.style.transition='none';ov.style.clipPath='circle(0% at 50% 50%)';
    setTimeout(()=>{ov.style.transition='clip-path .7s cubic-bezier(.76,0,.24,1)';ov.style.clipPath='circle(150% at 50% 50%)';},50);
    setTimeout(()=>{setGameActive(true);setTransitioning(false);},750);
  },[transitioning]);

  const exitGame = useCallback(()=>{
    setGameActive(false);
    const ov=overlayRef.current,sec=sectionRef.current;
    ov.style.transition='clip-path .5s cubic-bezier(.76,0,.24,1)';ov.style.clipPath='circle(0% at 50% 50%)';
    sec.style.transition='transform .55s ease-out, opacity .55s ease-out';sec.style.transform='scale(1)';sec.style.opacity='1';
    setTimeout(()=>{ov.style.display='none';},520);
  },[]);

  // ── pagination button styles using CSS vars ──
  const pageBtn = (active) => ({
    width:40,height:40,borderRadius:'var(--radius-sm)',fontWeight:700,cursor:'pointer',fontSize:13,
    transition:'all var(--transition-base)',fontFamily:'inherit',
    background: active ? 'linear-gradient(135deg,var(--color-accent-dark),var(--color-accent))' : 'rgba(26,188,156,.07)',
    border: active ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border-accent)',
    color: active ? 'var(--color-bg-primary)' : 'var(--color-accent)',
    boxShadow: active ? 'var(--shadow-accent)' : 'none',
    transform: active ? 'scale(1.08)' : 'scale(1)',
  });

  const arrowBtn = (disabled) => ({
    padding:'8px 14px',borderRadius:'var(--radius-sm)',cursor:disabled?'not-allowed':'pointer',
    background:'rgba(26,188,156,.07)',border:'1.5px solid var(--color-border-accent)',
    color:'var(--color-accent)',opacity:disabled?.3:1,transition:'all var(--transition-base)',
    fontSize:14,fontFamily:'inherit',
  });

  return (
    <>

      {/* ── IRIS OVERLAY ── */}
      <div ref={overlayRef} style={{display:'none',position:'fixed',inset:0,zIndex:9998,background:'var(--color-bg-primary)',clipPath:'circle(0% at 50% 50%)',pointerEvents:'none'}}/>

      {/* ── GAME LAYER ── */}
      {gameActive&&(<div style={{position:'fixed',inset:0,zIndex:9999}}><SkillShooter onExit={exitGame}/></div>)}

      {/* ════════════════════════════════════════
          SECTION
      ════════════════════════════════════════ */}
      <section
        ref={sectionRef}
        id="skills"
        style={{
          minHeight:'100vh',
          background:'var(--color-bg-primary)',
          color:'var(--color-text-primary)',
          position:'relative',
          overflow:'hidden',
          paddingTop:80,
          paddingBottom:80,
          marginTop:-30,
        }}
      >
        {/* Ambient blobs */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,var(--color-bg-primary) 0%,rgba(26,188,156,.03) 50%,var(--color-bg-primary) 100%)'}}/>
          <div style={{position:'absolute',top:'18%',left:'12%',width:440,height:440,background:'radial-gradient(circle,rgba(26,188,156,.06) 0%,transparent 70%)',borderRadius:'50%',filter:'blur(40px)',animation:'pulse 4s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'18%',right:'12%',width:360,height:360,background:'radial-gradient(circle,rgba(26,188,156,.04) 0%,transparent 70%)',borderRadius:'50%',filter:'blur(40px)',animation:'pulse 4s ease-in-out infinite',animationDelay:'1.8s'}}/>
        </div>

        {/* Grid */}
        <div style={{position:'absolute',inset:0,opacity:.055,pointerEvents:'none'}}>
          <svg width="100%" height="100%">
            <defs><pattern id="sk-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--color-accent)" strokeWidth=".6"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#sk-grid)"/>
          </svg>
        </div>

        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1}}>

          {/* ── HEADER ── */}
          <div style={{
            textAlign:'center',marginBottom:52,
            opacity:isVisible?1:0,transform:isVisible?'translateY(0)':'translateY(-18px)',
            transition:'opacity .9s ease, transform .9s ease',
          }}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'.45em',color:'var(--color-accent)',marginBottom:14,opacity:.75}}>
              ◈ TECHNICAL EXPERTISE ◈
            </p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginBottom:10}}>
              {/* <Flame style={{width:34,height:34,color:'var(--color-accent)',filter:'drop-shadow(0 0 8px var(--color-accent-glow))',animation:'pulse 2s ease-in-out infinite'}}/> */}
              <h2 style={{
                fontFamily:'var(--font-display)',fontSize:'clamp(2.2rem,6vw,4.5rem)',
                fontWeight:900,letterSpacing:'.06em',margin:0,
                background:'linear-gradient(135deg,var(--color-text-primary) 25%,var(--color-accent))',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
              }}>Skills</h2>
              {/* <Flame style={{width:34,height:34,color:'var(--color-accent)',filter:'drop-shadow(0 0 8px var(--color-accent-glow))',animation:'pulse 2s ease-in-out infinite',animationDelay:'.4s'}}/> */}
            </div>
            {/* accent underline */}
            <div style={{width:52,height:3,borderRadius:99,background:'linear-gradient(90deg,var(--color-accent),var(--color-accent-light))',margin:'0 auto 14px'}}/>
            <p style={{color:'var(--color-text-secondary)',fontSize:15,letterSpacing:'.04em'}}>
              Click the center or any node to explore
            </p>
          </div>

          {/* ── DESKTOP: chakra + panel ── */}
          <div className="skills-two-col ">

            {/* CHAKRA */}
            <div className="skills-chakra-wrap ">
              <div style={{position:'relative',width:500,height:500}}>
                {/* rings */}
                {[0,8,16].map((ins,i)=>(
                  <div key={i} style={{position:'absolute',inset:ins,borderRadius:'50%',border:`1.5px solid rgba(26,188,156,${.28-i*.08})`}}/>
                ))}

                {/* center hex */}
                <div
                  style={{
                    position:'absolute',top:'50%',left:'50%',
                    transform:`translate(-50%,-50%) scale(${selectedCategory==='all'?1.1:1})`,
                    cursor:'pointer',transition:'transform var(--transition-spring)',zIndex:2,
                  }}
                  onClick={()=>setSelectedCategory('all')}
                >
                  <div style={{
                    width:128,height:128,
                    background:'linear-gradient(135deg,var(--color-accent-dark),var(--color-accent),var(--color-accent-light))',
                    clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                    border:selectedCategory==='all'?'3px solid var(--color-accent-light)':'3px solid rgba(26,188,156,.35)',
                    boxShadow:selectedCategory==='all'?'var(--shadow-glow)':'var(--shadow-accent)',
                    transition:'all var(--transition-base)',
                  }}>
                    <Zap style={{width:34,height:34,color:'var(--color-bg-primary)',marginBottom:4}}/>
                    <span style={{fontFamily:'var(--font-display)',fontSize:10,fontWeight:700,color:'var(--color-bg-primary)',letterSpacing:'.1em'}}>SKILLS</span>
                  </div>
                </div>

                {/* category nodes */}
                {categoriesData.map((cat,idx)=>{
                  const Icon=cat.icon, isSel=selectedCategory===cat.id;
                  return (
                    <div key={cat.id} style={{position:'absolute',top:'50%',left:'50%',cursor:'pointer',animation:`revolve 20s linear infinite`,animationDelay:`${-idx*4}s`,zIndex:isSel?10:1}} onClick={()=>setSelectedCategory(cat.id)}>
                      <div className="cat-node" style={{
                        width:96,height:96,
                        background:isSel?'linear-gradient(135deg,var(--color-accent-dark),var(--color-accent))':'linear-gradient(135deg,var(--color-bg-elevated),var(--color-bg-sunken))',
                        clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                        border:isSel?'2.5px solid var(--color-accent-light)':'2px solid var(--color-border-accent)',
                        boxShadow:isSel?'var(--shadow-glow)':'none',
                        animation:'counterRev 20s linear infinite',animationDelay:`${-idx*4}s`,
                        transition:'all var(--transition-base)',
                      }}>
                        <Icon style={{width:24,height:24,color:isSel?'var(--color-bg-primary)':'var(--color-accent)',marginBottom:3}}/>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:'.06em',textAlign:'center',fontFamily:'var(--font-mono)',color:isSel?'var(--color-bg-primary)':'var(--color-text-secondary)'}}>{cat.name}</span>
                      </div>
                      {isSel&&<div className="cat-ping-ring"/>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SKILLS PANEL */}
            <div>
              <div className='max-md:hidden' style={{
                background:'var(--color-bg-glass)',
                backdropFilter:'blur(var(--blur-lg))',
                WebkitBackdropFilter:'blur(var(--blur-lg))',
                border:'1px solid var(--color-border-accent)',
                borderRadius:'var(--radius-xl)',
                padding:32,minHeight:500,
                boxShadow:'var(--shadow-lg)',
              }}>
                {/* header */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:22}}>
                  <div>
                    <h3 style={{
                      fontFamily:'var(--font-display)',fontSize:'clamp(1.3rem,2.2vw,1.9rem)',fontWeight:700,margin:0,
                      background:'linear-gradient(90deg,var(--color-accent),var(--color-accent-light))',
                      WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                    }}>
                      {selectedCategory==='all'?'All Skills':categoriesData.find(c=>c.id===selectedCategory)?.name}
                    </h3>
                    <p style={{margin:'4px 0 0',fontSize:11,color:'var(--color-text-muted)',fontFamily:'var(--font-mono)',letterSpacing:'.18em'}}>
                      {displayedSkills.length} skills mastered
                    </p>
                  </div>
                  {selectedCategory!=='all'&&(
                    <button
                      onClick={()=>setSelectedCategory('all')}
                      style={{background:'transparent',border:'1px solid var(--color-border)',borderRadius:'var(--radius-sm)',padding:'4px 8px',color:'var(--color-text-muted)',cursor:'pointer',display:'flex',alignItems:'center',transition:'all var(--transition-base)'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--color-accent)';e.currentTarget.style.color='var(--color-accent)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.color='var(--color-text-muted)';}}
                    ><X style={{width:16,height:16}}/></button>
                  )}
                </div>

                {/* grid */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
                  {currentSkills.map((item,idx)=>(
                    <div key={`${item.category}-${idx}`} className="sk-card" style={{opacity:0,animation:`spillIn .4s ease-out ${idx*.05}s forwards`}}>
                      <span className="sk-card-label">{item.skill}</span>
                    </div>
                  ))}
                </div>

                {/* pagination */}
                {totalPages>1&&(
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    <button style={arrowBtn(currentPage===1)} disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>←</button>
                    {[...Array(totalPages)].map((_,i)=>(<button key={i} style={pageBtn(currentPage===i+1)} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>))}
                    <button style={arrowBtn(currentPage===totalPages)} disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>→</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── MOBILE: small chakra + panel stacked ── */}
          <div className="skills-mobile-only">
            <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
              <div style={{position:'relative',width:300,height:300}}>
                {[0,6].map((ins,i)=>(<div key={i} style={{position:'absolute',inset:ins,borderRadius:'50%',border:`1.5px solid rgba(26,188,156,${.28-i*.1})`}}/>))}
                <div style={{position:'absolute',top:'50%',left:'50%',transform:`translate(-50%,-50%) scale(${selectedCategory==='all'?1.1:1})`,cursor:'pointer',transition:'transform var(--transition-spring)',zIndex:2}} onClick={()=>setSelectedCategory('all')}>
                  <div style={{width:76,height:76,background:'linear-gradient(135deg,var(--color-accent-dark),var(--color-accent))',clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:selectedCategory==='all'?'2px solid var(--color-accent-light)':'2px solid rgba(26,188,156,.35)',boxShadow:'var(--shadow-accent)'}}>
                    <Zap style={{width:22,height:22,color:'var(--color-bg-primary)',marginBottom:2}}/>
                    <span style={{fontFamily:'var(--font-display)',fontSize:7,fontWeight:700,color:'var(--color-bg-primary)'}}>SKILLS</span>
                  </div>
                </div>
                {categoriesData.map((cat,idx)=>{const Icon=cat.icon,isSel=selectedCategory===cat.id;return(
                  <div key={cat.id} style={{position:'absolute',top:'50%',left:'50%',cursor:'pointer',animation:`revolve 20s linear infinite`,animationDelay:`${-idx*4}s`}} onClick={()=>setSelectedCategory(cat.id)}>
                    <div style={{width:60,height:60,background:isSel?'linear-gradient(135deg,var(--color-accent-dark),var(--color-accent))':'var(--color-bg-elevated)',clipPath:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:isSel?'2px solid var(--color-accent-light)':'1px solid var(--color-border-accent)',animation:'counterRev 20s linear infinite',animationDelay:`${-idx*4}s`}}>
                      <Icon style={{width:16,height:16,color:isSel?'var(--color-bg-primary)':'var(--color-accent)',marginBottom:2}}/><span style={{fontSize:7,color:isSel?'var(--color-bg-primary)':'var(--color-text-secondary)',textAlign:'center'}}>{cat.name}</span>
                    </div>
                  </div>
                );})}
              </div>
            </div>
            <div style={{background:'var(--color-bg-glass)',backdropFilter:'blur(var(--blur-md))',border:'1px solid var(--color-border-accent)',borderRadius:'var(--radius-lg)',padding:18}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div>
                  <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.15rem',fontWeight:700,margin:0,background:'linear-gradient(90deg,var(--color-accent),var(--color-accent-light))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{selectedCategory==='all'?'All Skills':categoriesData.find(c=>c.id===selectedCategory)?.name}</h3>
                  <p style={{margin:'3px 0 0',fontSize:11,color:'var(--color-text-muted)',fontFamily:'var(--font-mono)'}}>{displayedSkills.length} skills</p>
                </div>
                {selectedCategory!=='all'&&<button onClick={()=>setSelectedCategory('all')} style={{background:'transparent',border:'none',color:'var(--color-text-muted)',cursor:'pointer'}}><X style={{width:16,height:16}}/></button>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {currentSkills.map((item,idx)=>(<div key={`${item.category}-${idx}`} className="sk-card" style={{opacity:0,animation:`spillIn .4s ease-out ${idx*.05}s forwards`}}><span className="sk-card-label" style={{fontSize:12}}>{item.skill}</span></div>))}
              </div>
              {totalPages>1&&(
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:14}}>
                  <button style={{...arrowBtn(currentPage===1),padding:'6px 10px'}} disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>←</button>
                  {[...Array(totalPages)].map((_,i)=>(<button key={i} style={{...pageBtn(currentPage===i+1),width:32,height:32,fontSize:12}} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>))}
                  <button style={{...arrowBtn(currentPage===totalPages),padding:'6px 10px'}} disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>→</button>
                </div>
              )}
            </div>
          </div>

          {/* ── STATS ── */}
          <div style={{
            display:'flex',justifyContent:'center',alignItems:'center',gap:0,marginTop:56,
            opacity:isVisible?1:0,transform:isVisible?'translateY(0)':'translateY(14px)',
            transition:'opacity 1s ease 1s,transform 1s ease 1s',
          }}>
            {[{value:allSkills.length,label:'Total Skills'},{value:categoriesData.length,label:'Categories'}].map((stat,i)=>(
              <div key={stat.label} style={{display:'flex',alignItems:'center',gap:40}}>
                {i>0&&<div style={{width:1,height:56,background:'linear-gradient(180deg,transparent,var(--color-accent),transparent)',margin:'0 8px'}}/>}
                <div style={{textAlign:'center',padding:'0 32px'}}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,background:'linear-gradient(135deg,var(--color-accent),var(--color-accent-light))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1}}>{stat.value}</div>
                  <div style={{marginTop:6,fontSize:11,color:'var(--color-text-muted)',letterSpacing:'.18em',fontFamily:'var(--font-mono)'}}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── PORTAL TRIGGER ── */}
          <div className="portal-row" style={{
            opacity:isVisible?1:0,transform:isVisible?'translateY(0)':'translateY(18px)',
            transition:'opacity 1s ease .5s,transform 1s ease .5s',
          }}>
            <PortalTrigger onClick={enterGame}/>
          </div>
        </div>
      </section>
    </>
  );
}