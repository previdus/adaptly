'use client';
import {ArrowRight,BarChart3,Brain,Clock3,Flame,Heart,Medal,Users,Zap} from 'lucide-react';
import './adaptive-story.css';

function PaceRoad(){return <div className="story-pace-art" aria-hidden="true">
 <div className="pace-marker pace-two"><span>🦊</span><b>2 min</b></div>
 <div className="pace-marker pace-twenty"><span>🐻</span><b>20 min</b></div>
 <svg className="pace-paths" viewBox="0 0 420 160" preserveAspectRatio="none"><path d="M18 34 C145 34 158 80 278 80"/><path d="M18 126 C145 126 158 80 278 80"/><path className="path-dots" d="M18 34 C145 34 158 80 278 80"/><path className="path-dots second" d="M18 126 C145 126 158 80 278 80"/></svg>
 <div className="pace-finish"><span>🏆</span><small>THEIR NEXT STEP</small></div>
 <span className="pace-spark pace-spark-one">✦</span><span className="pace-spark pace-spark-two">✧</span>
 </div>}

function QuestionSteps(){return <div className="story-steps-art" aria-label="Example addition questions moving from easier to more challenging">
 <div className="steps-label"><span>QUESTION PATH</span><b>one step at a time</b></div>
 <div className="steps-stair"><div className="step-tile step-one"><small>WARM UP</small><b>14 + 3</b><span>= 17</span></div><div className="step-tile step-two"><small>BUILD</small><b>34 + 28</b><span>= 62</span></div><div className="step-tile step-three"><small>NEXT UP</small><b>248 + 175</b><span className="step-glint">✦</span></div></div>
 <div className="steps-unlock"><div className="unlock-lights"><i/><i/><i/></div><span>3 independent correct → next step</span><ArrowRight size={15}/></div>
 </div>}

function CarryReport(){return <div className="story-report-art" aria-label="Illustrative example of concept-level parent reporting">
 <div className="mini-report-top"><span><BarChart3 size={15}/> LEARNING SNAPSHOT</span><i>EXAMPLE</i></div>
 <div className="mini-concept"><span className="mini-bridge">🌉</span><div><small>CONCEPT</small><b>Addition with carrying</b></div><span className="mini-signal">Still developing</span></div>
 <div className="mini-math"><span className="carry-ten"><small>CARRY</small>1</span><b>248 + 175</b><span className="carry-answer">423</span></div>
 <div className="mini-report-foot"><span>Next focus</span><b>Regrouping into a new ten <ArrowRight size={13}/></b></div>
 </div>}

export default function AdaptiveStory(){return <section className="adaptive-story" aria-labelledby="adaptive-story-title">
 <header className="story-heading"><div><span className="story-eyebrow"><Brain size={14}/> THE ADAPTLY WAY</span><h2 id="adaptive-story-title">One goal. A path that fits.</h2><p>Across six maths topics, learning grows one personal next step at a time.</p></div><PaceRoad/></header>
 <div className="story-chapters">
  <article className="story-chapter chapter-pace"><span className="chapter-number">01 <i>PACE</i></span><QuestionSteps/><h3>Every child moves differently.</h3><p>Some click in 2 minutes. Others need 20. Questions follow their understanding—not the class clock.</p><div className="chapter-takeaway"><Clock3 size={15}/> No one-size-fits-all pace</div></article>
  <article className="story-chapter chapter-focus"><span className="chapter-number">02 <i>FOCUS</i></span><CarryReport/><h3>Find the sticky step.</h3><p>If carrying is tricky in addition, more practice returns to that skill. A short lesson can help—then it’s back to trying.</p><div className="chapter-takeaway"><Zap size={15}/> Growth by concept, not guesswork</div></article>
  <article className="story-chapter chapter-grownups"><span className="chapter-number">03 <i>CLARITY</i></span><div className="story-adult-art"><div className="adult-person parent-person"><span>👩‍🏫</span><b>TEACHER</b></div><div className="adult-board"><span>THE NEXT STEP</span><div><i>✓</i><b>Concept strengths</b></div><div><i>↗</i><b>Where to focus</b></div><div><i>★</i><b>Accuracy & evidence</b></div></div><div className="adult-person family-person"><span>👨‍👧</span><b>PARENT</b></div></div><h3>Grown-ups see where to help.</h3><p>Parents and teachers get a clear view of each concept: what’s steady, what needs practice, and what to try next.</p><div className="chapter-takeaway"><Heart size={15}/> A kinder, clearer next step</div></article>
 </div>
 <footer className="story-play-bridge"><div className="play-bridge-heading"><span>UNDERSTAND <ArrowRight size={14}/> MASTER <ArrowRight size={14}/> PLAY</span><b>Learning that builds beyond the lesson.</b></div><div className="play-benefits"><div><span className="benefit-icon benefit-level"><Medal size={19}/></span><span><b>Level Up</b><small>Measure & master</small></span></div><div><span className="benefit-icon benefit-speed"><Flame size={19}/></span><span><b>Speed Sprint</b><small>Speed & accuracy</small></span></div><div><span className="benefit-icon benefit-friends"><Users size={19}/></span><span><b>Last Star Standing</b><small>Friendly peer challenge</small></span></div></div><p>Learn at your pace. Race when you’re ready.</p></footer>
 </section>}
