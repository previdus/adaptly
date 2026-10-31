'use client';
import type {CSSProperties} from 'react';
import {celebrationFor,funnyFriends} from '../lib/celebrations';
export default function Celebration({correctAnswers,name,levelUp,mastered=false}:{correctAnswers:number,name:string,levelUp:boolean,mastered?:boolean}){
 const effect=celebrationFor(correctAnswers);
 const friend=funnyFriends[Math.floor(effect.id/5)];
 return <div className={`answer-celebration effect-${effect.family} variant-${effect.variant} ${levelUp?'level-up':''}`} role="status" aria-live="polite" data-celebration={effect.id}>
 <div className="celebration-particles" aria-hidden="true">{Array.from({length:levelUp?42:22},(_,i)=>{const angle=i*137.5+effect.variant*32;const radius=100+(i%5)*21+effect.variant*9;return <span key={i} style={{'--x':`${Math.cos(angle*Math.PI/180)*radius}px`,'--y':`${Math.sin(angle*Math.PI/180)*radius}px`,'--delay':`${(i%7)*.045}s`,'--spin':`${(i%2?1:-1)*(140+i*27)}deg`,'--color':effect.colors[i%3],'--left':`${(i*37+effect.variant*11)%100}%`,'--size':`${12+(i%4)*5}px`,'--duration':`${1.1+effect.variant*.11}s`} as CSSProperties}>{levelUp?'★':effect.symbol}</span>})}</div>
 <div className="celebration-center"><div className={'funny-friend friend-'+friend.motion}><span role="img" aria-label={friend.name}>{friend.emoji}</span><span className="friend-sparkle spark-left">✦</span><span className="friend-sparkle spark-right">✧</span></div><div className="celebration-speech"><span className="friend-name">{friend.name.toUpperCase()} SAYS…</span><h2>{mastered?`You mastered it, ${name}!`:`${friend.cheer}, ${name}!`}</h2><p>{mastered?'Multiply Quest complete! You found the treasure 👑':levelUp?'A new level! Your adventure is growing 🌟':'You earned a star! Here comes your next question.'}</p><div className="friend-answer-tick">✓</div></div></div>
 </div>
}
