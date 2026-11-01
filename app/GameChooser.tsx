'use client';
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,BarChart3,BookOpen,Check,ChevronRight,CircleHelp,Clock3,Heart,Medal,ShieldCheck,Sparkles,Star,Target,Timer,TrendingUp,Users,X,Zap} from 'lucide-react';
import {skills,stats,type Attempt} from '../lib/learning';
import './game-chooser.css';

type Game='level'|'sprint'|'arena';
type Props={level:number;rank:string;percent:number;mastered:boolean;run:number;attempts:Attempt[];focusSkillIndex:number;onLevelUp:()=>void;onSprint:()=>void;onArena:()=>void;onDetails:()=>void};
const gameNames:Record<Game,string>={level:'Level Up',sprint:'Speed Sprint',arena:'Last Star Standing'};

export default function GameChooser({level,rank,percent,mastered,run,attempts,focusSkillIndex,onLevelUp,onSprint,onArena,onDetails}:Props){
 const [intro,setIntro]=useState<Game|null>(null),[mounted,setMounted]=useState(false);
 const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null),returnFocus=useRef<HTMLElement|null>(null),suppressFocusIntro=useRef(false);
 useEffect(()=>setMounted(true),[]);
 function openIntro(game:Game){if(hoverTimer.current)clearTimeout(hoverTimer.current);returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setIntro(game)}
 function closeIntro(){setIntro(null);suppressFocusIntro.current=true;requestAnimationFrame(()=>{returnFocus.current?.focus({preventScroll:true});setTimeout(()=>{suppressFocusIntro.current=false},0)})}
 function hoverCard(game:Game){if(hoverTimer.current)clearTimeout(hoverTimer.current);hoverTimer.current=setTimeout(()=>openIntro(game),420)}
 function leaveCard(){if(hoverTimer.current){clearTimeout(hoverTimer.current);hoverTimer.current=null}}
 function focusIntro(e:React.FocusEvent<HTMLButtonElement>,game:Game){if(suppressFocusIntro.current){suppressFocusIntro.current=false;return}if(e.currentTarget.matches(':focus-visible'))openIntro(game)}
 useEffect(()=>{
  if(!intro)return;
  const priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  function keydown(e:KeyboardEvent){if(e.key==='Escape'){e.preventDefault();closeIntro();return}if(e.key!=='Tab')return;const items=[...document.querySelectorAll<HTMLElement>('.game-intro-dialog button:not([disabled])')];if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  document.addEventListener('keydown',keydown);return()=>{document.body.style.overflow=priorOverflow;document.removeEventListener('keydown',keydown)};
 },[intro]);
 const snapshots=skills.map((skill,index)=>({skill,...stats(attempts,index)}));
 const secureCount=snapshots.filter(x=>x.mastered).length;
 const recent=attempts.filter(x=>!x.hinted).slice(-10),recentAccuracy=recent.length?Math.round(recent.filter(x=>x.correct).length/recent.length*100):null;
 const launch:Record<Game,()=>void>={level:onLevelUp,sprint:onSprint,arena:onArena};
 const cards:[Game,string,string,string,string][]=[
  ['level','🌱','ADAPTIVE · YOUR PATH','Find your level',mastered?'Mastered':`Level ${level} of 24`],
  ['sprint','🚀','SOLO · PERSONAL BEST','Race against time','60-second challenge'],
  ['arena','⚡','2–8 PLAYERS · LIVE','Compete with friends','3 hearts each']
 ];
 return <section className="game-chooser" aria-labelledby="multiply-quest-title">
  <header className="game-chooser-heading"><span className="game-chooser-kicker">✦ MULTIPLY QUEST · YOUR ARCADE ✦</span><h1 id="multiply-quest-title">Choose your way to play</h1><p>Find your level, race the clock, or take on your friends.</p></header>
  <div className="game-chooser-grid">
   {cards.map(([game,emoji,label,subtitle,meta])=><article key={game} className={`chooser-card chooser-${game}`} onMouseEnter={()=>hoverCard(game)} onMouseLeave={leaveCard}>
    <button type="button" className="chooser-play" onClick={launch[game]} onFocus={e=>focusIntro(e,game)} aria-label={`Play ${gameNames[game]}`}>
     <span className="chooser-art"><span className={`chooser-hero-emoji ${game}`}>{emoji}</span>{game==='level'?<><span className="chooser-spark">✦</span><span className="chooser-multiply">×</span></>:game==='sprint'?<><span className="chooser-clock">60s</span><span className="chooser-multiply">★</span></>:<><span className="chooser-hearts">♥ ♥ ♥</span><span className="chooser-multiply">×</span></>}</span>
     <span className="chooser-label">{label}</span><strong>{gameNames[game]}</strong><em>{subtitle}</em>
     {game==='level'?<><span className="chooser-progress-label">{meta} <i>· {rank}</i></span><span className="chooser-track" role="progressbar" aria-label="Progress through Multiply Quest" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}><i style={{width:`${percent}%`}}/></span></>:<span className="chooser-short-copy">{game==='sprint'?'How many can you solve in one minute?':'Fastest correct keeps a heart.'}</span>}
     <span className="chooser-cta">{game==='level'?'Continue your journey':game==='sprint'?'Start a sprint':'Enter the arena'} <ArrowRight size={16}/></span>
    </button>
    <button type="button" className="chooser-about" onClick={()=>openIntro(game)} onFocus={e=>focusIntro(e,game)} aria-label={`How ${gameNames[game]} helps`}><CircleHelp size={14}/><span>How it helps</span></button>
   </article>)}
  </div>
  <button className="chooser-details" onClick={onDetails}>Grown-up guide · What Multiply Quest covers <ChevronRight size={15}/></button>
  {mounted&&intro&&createPortal(<div className={`game-intro-backdrop intro-${intro}`} onMouseDown={e=>{if(e.target===e.currentTarget)closeIntro()}}>
   <section className="game-intro-dialog" role="dialog" aria-modal="true" aria-labelledby="game-intro-title" aria-describedby="game-intro-copy">
    <div className="game-intro-top"><div className="intro-brand"><span>×</span> MULTIPLY QUEST</div><button className="intro-close" onClick={closeIntro} aria-label="Close introduction" autoFocus><X size={20}/><span>Close</span></button></div>
    <div className="game-intro-content">
     <div className="intro-main">
      <span className="intro-eyebrow"><Sparkles size={15}/> A GAME THAT BUILDS MATHS CONFIDENCE</span>
      <div className="intro-title-row"><span className="intro-game-icon" aria-hidden="true">{intro==='level'?'🌱':intro==='sprint'?'🚀':'⚡'}</span><div><small>{intro==='level'?'YOUR PERSONAL LEARNING PATH':intro==='sprint'?'YOUR ONE-MINUTE CHALLENGE':'THE FRIENDS SHOWDOWN'}</small><h1 id="game-intro-title">{gameNames[intro]}</h1></div></div>
      <p id="game-intro-copy" className="intro-copy">{intro==='level'?'Every child starts somewhere different. The questions follow what they show they know: three confident answers open the next step; a tricky answer brings more practice on that concept.':intro==='sprint'?'A playful one-minute round builds quick multiplication recall. Accurate answers and answer streaks grow the score, and every round gives the child a personal best to chase.':'Friends race to answer the same multiplication question. The quickest correct answer keeps a heart; the other active players lose one. When a player is out, they can still watch the race.'}</p>
      {intro==='level'?<div className="intro-live-stats" aria-label="Current learning progress">
       <div><span>YOUR LEVEL</span><b>{mastered?'24 / 24':`${level} / 24`}</b><small>{mastered?'Mastery evidence achieved':rank}</small></div>
       <div><span>NEXT STEP</span><b>{run} <i>/ 3</i></b><small>independent correct answers</small></div>
       <div><span>SKILLS WITH EVIDENCE</span><b>{secureCount} <i>/ 8</i></b><small>shown secure in recent practice</small></div>
       <div><span>RECENT ACCURACY</span><b>{recentAccuracy===null?'—':`${recentAccuracy}%`}</b><small>{recent.length?`last ${recent.length} independent answers`:'appears after practice'}</small></div>
      </div>:<div className="intro-live-stats" aria-label="Game rules and round stats">{intro==='sprint'?<><div><span>ROUND</span><b>60 <i>sec</i></b><small>race the clock</small></div><div><span>CORRECT</span><b>+10 <i>pts</i></b><small>plus time bonus</small></div><div><span>STREAK</span><b>+20 <i>max</i></b><small>bonus points</small></div><div><span>TRACK</span><b>Score</b><small>right answers · streak</small></div></>:<><div><span>RACERS</span><b>2–8</b><small>friends or family</small></div><div><span>START WITH</span><b>3 <i>♥</i></b><small>lives for each player</small></div><div><span>ROUND</span><b>Shared</b><small>one question · one timer</small></div><div><span>AFTER ELIMINATION</span><b>Watch</b><small>stay for the showdown</small></div></>}</div>}
      <div className="intro-actions"><button className="intro-play" onClick={()=>{closeIntro();launch[intro]();}}>{intro==='level'?'Start my path':intro==='sprint'?'Start my sprint':'Play with friends'} <ArrowRight size={19}/></button><span><ShieldCheck size={15}/> {intro==='level'?'Your progress is saved as you learn':'Practice stays playful and low pressure'}</span></div>
     </div>
     <div className="intro-visual-column">
      {intro==='level'?<div className="intro-path-visual" aria-label="Answers shape the next learning step">
       <div className="path-visual-head"><span>ONE STEP AT A TIME</span><b>YOUR PATH</b></div>
       <div className="path-question"><span className="path-bubble">🍎 🍎 🍎</span><strong>3 groups of 4</strong><small>Try a question</small></div>
       <div className="path-split"><i/><i/></div>
       <div className="path-branches"><div className="path-branch ready"><span>✨</span><b>3 right in a row</b><small>Meet the next challenge</small><ArrowRight size={17}/></div><div className="path-branch practice"><span>🌱</span><b>Need another try?</b><small>Practise this idea again</small><BookOpen size={17}/></div></div>
       <div className="path-foot"><span>📚</span><b>8 multiplication concepts</b><small>from equal groups to real-world problems</small></div>
      </div>:intro==='sprint'?<div className="intro-sprint-visual"><div className="sprint-visual-stars"><span>✦</span><span>★</span><span>✧</span><span>✦</span></div><div className="sprint-big-timer"><Timer size={26}/><b>60</b><small>SECONDS</small></div><div className="sprint-equation"><span>7 × 8</span><i>?</i><span>56</span></div><div className="sprint-result-cards"><div><Zap size={17}/><b>Quick</b><small>time bonus</small></div><div><TrendingUp size={17}/><b>On a roll</b><small>streak bonus</small></div><div><Medal size={17}/><b>New best?</b><small>beat your score</small></div></div><div className="sprint-visual-ribbon">YOUR SCORE · RIGHT ANSWERS · BEST STREAK</div></div>:<div className="intro-arena-visual"><div className="arena-visual-title"><span>ROUND 04</span><b>WHO'S STILL IN?</b></div><div className="arena-racers"><div><span>👧</span><small>YOU</small><b>♥ ♥ ♥</b></div><div><span>🧑‍🚀</span><small>FRIEND</small><b>♥ ♥</b></div><div><span>🦊</span><small>RACER</small><b>♥</b></div></div><div className="arena-visual-question"><span>FIRST TO SOLVE</span><b>8 × 7 <i>= ?</i></b><div className="arena-race-line"><span/><i>⚡</i><span/></div></div><div className="arena-visual-winner">⚡ Fast + correct keeps your heart</div><div className="arena-visual-spectator">🎟️ OUT? Grab a front-row seat and watch!</div></div>}
      <div className="intro-skills"><h2><Target size={17}/> {intro==='level'?'A growing multiplication toolkit':'Skills this game lets kids practise'}</h2>{intro==='level'?<div className="intro-skill-list">{snapshots.map(({skill,acc,total,mastered:secure},index)=>{const focus=index===focusSkillIndex&&!mastered;return <div className={`intro-skill ${focus?'is-focus':''}`} key={skill.name}><span className="intro-skill-icon">{skill.icon}</span><span className="intro-skill-name">{skill.name}<small>{focus?'Up next':total===0?'Not explored yet':secure?'Secure evidence':`${Math.round(acc*100)}% recent accuracy`}</small></span><span className={`skill-state ${focus?'focus':secure?'secure':total?'growing':'new'}`}>{focus?'→':secure?'✓':total?'↗':'·'}</span></div>})}</div>:<div className="intro-skill-chips">{(intro==='sprint'?['⚡ Quick recall','🎯 Accurate answers','🔥 Build a streak','🧠 Focus under time']:['🧠 Multiplication recall','🎯 Accuracy under pressure','⚡ Quick thinking','🤝 Friendly competition']).map(item=><span key={item}>{item}</span>)}</div>}
       {intro==='level'&&<p className="intro-evidence-note"><BarChart3 size={14}/> Recent accuracy uses independent answers only. “Secure” needs repeated evidence; new skills stay “Not explored.”</p>}
       {intro!=='level'&&<p className="intro-evidence-note"><BarChart3 size={14}/> After each round, see the score, correct answers and streak—or the lives and standings.</p>}
      </div>
     </div>
    </div>
   </section>
  </div>,document.body)}
 </section>
}
