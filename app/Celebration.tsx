'use client';
import type {CSSProperties} from 'react';
import {celebrationFor} from '../lib/celebrations';
export default function Celebration({correctAnswers,name,levelUp,mastered=false}:{correctAnswers:number,name:string,levelUp:boolean,mastered?:boolean}){
 const effect=celebrationFor(correctAnswers);
 return <div className={`answer-celebration effect-${effect.family} variant-${effect.variant} ${levelUp?'level-up':''}`} role="status" aria-live="polite" data-celebration={effect.id}>
 <div className="celebration-particles" aria-hidden="true">{Array.from({length:levelUp?42:22},(_,i)=>{const angle=i*137.5+effect.variant*32;const radius=100+(i%5)*21+effect.variant*9;return <span key={i} style={{'--x':`${Math.cos(angle*Math.PI/180)*radius}px`,'--y':`${Math.sin(angle*Math.PI/180)*radius}px`,'--delay':`${(i%7)*.045}s`,'--spin':`${(i%2?1:-1)*(140+i*27)}deg`,'--color':effect.colors[i%3],'--left':`${(i*37+effect.variant*11)%100}%`,'--size':`${12+(i%4)*5}px`,'--duration':`${1.1+effect.variant*.11}s`} as CSSProperties}>{levelUp?'★':effect.symbol}</span>})}</div>
 <div className="celebration-center"><div className="celebration-tick"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="43"/><path d="m28 51 15 16 30-34"/></svg></div><h2>{mastered?`You mastered it, ${name}!`:levelUp?`Good job, ${name}!`:`Nice one, ${name}!`}</h2><p>{mastered?'Multiply Quest complete 👑':levelUp?'Level crossed! On to the next adventure.':'✓ Correct · +10 stars'}</p></div>
 </div>
}
