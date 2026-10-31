'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import {celebrationFor,funnyFriends,LEVEL_LOADING_START} from '../lib/celebrations';
export default function Celebration({correctAnswers,name,levelUp,mastered=false,nextLevel=2}:{correctAnswers:number,name:string,levelUp:boolean,mastered?:boolean,nextLevel?:number}){
 const effect=celebrationFor(correctAnswers);
 const friend=funnyFriends[Math.floor(effect.id/5)];
 const [loading,setLoading]=useState(false);
 useEffect(()=>{if(!levelUp||mastered)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const timer=setTimeout(()=>setLoading(true),reduced?600:LEVEL_LOADING_START);return()=>clearTimeout(timer)},[levelUp,mastered]);
 if(levelUp&&!mastered)return <div className={'level-unlock-show '+(loading?'is-loading':'is-revealing')} role="status" aria-live="polite">
  <div className="unlock-sunburst" aria-hidden="true"/>
  <div className="unlock-star-shower" aria-hidden="true">{Array.from({length:38},(_,i)=><span key={i} style={{'--left':`${(i*37)%100}%`,'--wait':`${(i%8)*.13}s`,'--drift':`${(i%2?-1:1)*(25+i*3)}px`,'--turn':`${i*31}deg`,'--size':`${12+i%5*6}px`} as CSSProperties}>{i%4===0?'✦':'★'}</span>)}</div>
  <div className="unlock-stage"><div className="unlock-ribbon">THREE STARS. ONE BIG VICTORY!</div><div className="unlock-trophy-scene"><span className="unlock-wing wing-left">🌟</span><div className="unlock-super-badge"><span className="unlock-crown">👑</span><small>{loading?'NEXT LEVEL':'LEVEL CLEARED'}</small><strong key={loading?'next':'cleared'}>{loading?nextLevel:Math.max(1,nextLevel-1)}</strong><div className="unlock-three-stars">★ ★ ★</div></div><span className="unlock-wing wing-right">🌟</span><span className="unlock-rocket">🚀</span></div>
   <h2>{loading?`Level ${nextLevel}, here we come!`:`Amazing, ${name}!`}</h2><p>{loading?'A fresh adventure is almost ready.':'You unlocked a brand-new adventure!'}</p>
   <div className="next-level-loader"><span className="loader-label">{loading?'Loading next level…':'Celebrating your superpower…'}<span className="loader-dots" aria-hidden="true"><i/><i/><i/></span></span><div className="unlock-loading-track"><span/></div><small>{loading?'Get your thinking cap ready 🧠':'Ready for your next little “I did it!”?'}</small></div>
  </div>
 </div>;
 return <div className={`answer-celebration effect-${effect.family} variant-${effect.variant} ${levelUp?'level-up':''}`} role="status" aria-live="polite" data-celebration={effect.id}>
 <div className="celebration-particles" aria-hidden="true">{Array.from({length:levelUp?42:22},(_,i)=>{const angle=i*137.5+effect.variant*32;const radius=100+(i%5)*21+effect.variant*9;return <span key={i} style={{'--x':`${Math.cos(angle*Math.PI/180)*radius}px`,'--y':`${Math.sin(angle*Math.PI/180)*radius}px`,'--delay':`${(i%7)*.045}s`,'--spin':`${(i%2?1:-1)*(140+i*27)}deg`,'--color':effect.colors[i%3],'--left':`${(i*37+effect.variant*11)%100}%`,'--size':`${12+(i%4)*5}px`,'--duration':`${1.1+effect.variant*.11}s`} as CSSProperties}>{levelUp?'★':effect.symbol}</span>})}</div>
 <div className="celebration-center"><div className={'funny-friend friend-'+friend.motion}><span role="img" aria-label={friend.name}>{friend.emoji}</span><span className="friend-sparkle spark-left">✦</span><span className="friend-sparkle spark-right">✧</span></div><div className="celebration-speech"><span className="friend-name">{friend.name.toUpperCase()} SAYS…</span><h2>{mastered?`You mastered it, ${name}!`:`${friend.cheer}, ${name}!`}</h2><p>{mastered?'Multiply Quest complete! You found the treasure 👑':levelUp?'A new level! Your adventure is growing 🌟':'Brilliant thinking! Here comes your next question.'}</p><div className="friend-answer-tick">✓</div></div></div>
 </div>
}
