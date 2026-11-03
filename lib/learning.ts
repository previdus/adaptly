export type TopicId='multiply'|'addition'|'subtraction'|'division'|'hcf'|'lcm';
export const topics:{id:TopicId;name:string;icon:string;sub:string;color:string}[]=[
 {id:'multiply',name:'Multiply Quest',icon:'✖️',sub:'Groups, times tables & carrying',color:'multiply'},
 {id:'addition',name:'Addition',icon:'➕',sub:'Add, regroup & solve stories',color:'addition'},
 {id:'subtraction',name:'Subtraction',icon:'➖',sub:'Take away, regroup & compare',color:'subtraction'},
 {id:'division',name:'Division',icon:'➗',sub:'Share equally & find remainders',color:'division'},
 {id:'hcf',name:'HCF',icon:'🧩',sub:'Find the greatest shared factor',color:'hcf'},
 {id:'lcm',name:'LCM',icon:'🔁',sub:'Find when multiples meet again',color:'lcm'}
];
export const skills=[
 {topic:'multiply' as const,name:'Equal groups',icon:'🍎',sub:'Discover what multiplication means',time:40,vid:'RNxwasijbAo',video:'https://www.khanacademy.org/math/5th-grade-foundations-engageny/5th-m4-engage-ny-foundations/5th-m4-tb-foundations/v/multiplication-intro',help:'3 groups of 4 means 4 + 4 + 4. Every group has the same number.'},
 {topic:'multiply' as const,name:'Arrays & patterns',icon:'🌻',sub:'See the rows. Find the pattern.',time:40,vid:'cDpBtkU2cf8',video:'',help:'Count the rows, then the objects in each row. Multiply them to find the total.'},
 {topic:'multiply' as const,name:'Times-table trails',icon:'⚡',sub:'Build your number superpowers',time:25,vid:'RNxwasijbAo',video:'',help:'Break tricky facts into smaller facts. 7 × 6 = (5 × 6) + (2 × 6) = 30 + 12.'},
 {topic:'multiply' as const,name:'Place-value powers',icon:'🧩',sub:'Make friends with tens & hundreds',time:45,vid:'FJ5qLWP3Fqo',video:'',help:'30 × 4 = 3 tens × 4 = 12 tens = 120.'},
 {topic:'multiply' as const,name:'Multiply without carrying',icon:'🚀',sub:'A little bigger. A lot more exciting.',time:65,vid:'FJ5qLWP3Fqo',video:'',help:'For 23 × 3: 3 × 3 = 9 ones, then 2 × 3 = 6 tens. Answer: 69.'},
 {topic:'multiply' as const,name:'The carrying bridge',icon:'🌉',sub:'Trade ten ones for a brand-new ten',time:90,vid:'FJ5qLWP3Fqo',video:'',help:'For 27 × 3: 7 × 3 = 21. Write 1, carry 2 tens. Then 2 × 3 + 2 = 8 tens. Answer: 81.'},
 {topic:'multiply' as const,name:'Two-digit mountain',icon:'🏔️',sub:'Split, multiply, bring it together',time:120,vid:'RVYwunbpMHA',video:'',help:'For 24 × 12, split 12 into 10 + 2. Add 240 + 48 = 288. Keep the zero in the tens row.'},
 {topic:'multiply' as const,name:'Real-world quests',icon:'🌎',sub:'Use your skills outside the classroom',time:90,vid:'FJ5qLWP3Fqo',video:'',help:'Find how many equal groups there are and how many in each group. Multiply and check the story.'},
 {topic:'addition' as const,name:'Add without regrouping',icon:'🪙',sub:'Line up ones, tens and hundreds',time:30,help:'Add each place-value column. Start with the ones, then tens, then hundreds.'},
 {topic:'addition' as const,name:'Cross the ten',icon:'🌈',sub:'Bundle ten ones into a ten',time:40,help:'When the ones add to ten or more, write the ones digit and carry one ten.'},
 {topic:'addition' as const,name:'Hundreds with carrying',icon:'🏗️',sub:'Regroup across bigger numbers',time:55,help:'Add from right to left. Trade 10 ones for a ten and 10 tens for a hundred.'},
 {topic:'addition' as const,name:'Find the missing addend',icon:'🔎',sub:'What number completes the sum?',time:40,help:'Use the total and the known addend. Subtract to find the missing part.'},
 {topic:'addition' as const,name:'Addition story problems',icon:'🛍️',sub:'Put two amounts together',time:55,help:'Spot the two amounts that are being joined, then add them.'},
 {topic:'subtraction' as const,name:'Subtract without regrouping',icon:'🪙',sub:'Take away one place at a time',time:30,help:'Subtract ones from ones and tens from tens. Keep the columns lined up.'},
 {topic:'subtraction' as const,name:'Regroup across a ten',icon:'🌉',sub:'Trade one ten for ten ones',time:40,help:'If there are not enough ones, trade one ten for ten ones, then subtract.'},
 {topic:'subtraction' as const,name:'Regroup across zero',icon:'🪜',sub:'Make a careful place-value trade',time:55,help:'Trade from the next non-zero place, regrouping through any zero columns.'},
 {topic:'subtraction' as const,name:'Find the missing number',icon:'🕵️',sub:'Work backwards to solve the puzzle',time:40,help:'Use the relationship between subtraction and addition to find the unknown.'},
 {topic:'subtraction' as const,name:'Subtraction story problems',icon:'🎒',sub:'Compare what changed or remains',time:55,help:'Find the starting amount and what changed. Subtract to find what remains.'},
 {topic:'division' as const,name:'Share into equal groups',icon:'🍪',sub:'Make fair groups with none left over',time:35,help:'Share the total equally. Count how many go into each group.'},
 {topic:'division' as const,name:'Division fact trail',icon:'⚡',sub:'Use times tables to divide',time:30,help:'Think of the related multiplication fact: divisor × quotient = dividend.'},
 {topic:'division' as const,name:'Bigger equal shares',icon:'📦',sub:'Divide larger numbers evenly',time:50,help:'Share the tens first, then the ones. Check by multiplying your answer.'},
 {topic:'division' as const,name:'Remainder rescue',icon:'🧺',sub:'Find what is left after sharing',time:45,help:'Make as many complete equal groups as possible. The leftover is the remainder.'},
 {topic:'division' as const,name:'Division story problems',icon:'🚀',sub:'Share or group in real-life puzzles',time:55,help:'Look for the total and the equal group size, then divide.'},
 {topic:'hcf' as const,name:'Factor finder',icon:'🔎',sub:'Spot numbers that divide both',time:35,help:'List the factors of both numbers. Find the factors they share.'},
 {topic:'hcf' as const,name:'Greatest shared factor',icon:'🏆',sub:'Choose the biggest common factor',time:45,help:'Among the common factors, the greatest one is the HCF.'},
 {topic:'hcf' as const,name:'HCF in a story',icon:'🎁',sub:'Make the biggest equal-size groups',time:55,help:'The HCF gives the largest number of equal groups with no leftovers.'},
 {topic:'lcm' as const,name:'Multiple explorer',icon:'🔁',sub:'Count in equal jumps',time:35,help:'List multiples of each number by skip-counting.'},
 {topic:'lcm' as const,name:'Find the first meeting point',icon:'🛤️',sub:'Spot the smallest shared multiple',time:45,help:'Compare the multiples. The smallest positive shared one is the LCM.'},
 {topic:'lcm' as const,name:'LCM in a story',icon:'🎠',sub:'Find when repeating events meet',time:55,help:'Find when both repeating patterns happen together again.'}
];
export const skillsForTopic=(topic:TopicId)=>skills.map((s,i)=>({s,i})).filter(x=>x.s.topic===topic).map(x=>x.i);
export const topicInfo=(id:TopicId)=>topics.find(x=>x.id===id)!;
export type Attempt={skill:number,level:number,correct:boolean,seconds:number,hinted:boolean,at:number,prompt:string,answer:number,given:string};
export type Progress={stage:number,run:number};
export type Student={id:string,name:string,attempts:Attempt[],progress?:Progress,topicProgress?:Partial<Record<TopicId,Progress>>};
export const journey=[
 [0,1],[1,1],[0,2],[1,2],[0,3],[1,3],
 [2,1],[2,2],[2,3],[3,1],[3,2],[3,3],
 [4,1],[4,2],[4,3],[5,1],[5,2],[5,3],
 [7,1],[7,2],[6,1],[6,2],[6,3],[7,3]
].map(([skill,level],stage)=>({skill,level,stage}));
export function journeyFor(topic:TopicId){
 if(topic==='multiply')return journey;
 return skillsForTopic(topic).flatMap((skill,conceptIndex)=>[1,2,3].map((level)=>({skill,level,stage:conceptIndex*3+level-1})));
}
export function stageForTopic(topic:TopicId,stage:number){const path=journeyFor(topic);return path[Math.min(path.length-1,Math.max(0,stage))]}
export function stageFor(stage:number){return journey[Math.min(23,Math.max(0,stage))];}
export function advanceProgress(progress:Progress,attempt:Attempt):Progress{
 if(progress.stage>=24){const run=attempt.correct&&!attempt.hinted?(progress.run+1)%3:0;return {stage:24,run};}
 const {skill,level}=stageFor(progress.stage);
 if(attempt.skill!==skill||attempt.level!==level)return progress;
 const run=attempt.correct&&!attempt.hinted?progress.run+1:0;
 return run>=3?{stage:Math.min(24,progress.stage+1),run:0}:{...progress,run};
}
export function progressFrom(attempts:Attempt[]):Progress{return attempts.reduce(advanceProgress,{stage:0,run:0});}
export function advanceTopicProgress(topic:TopicId,progress:Progress,attempt:Attempt):Progress{
 const path=journeyFor(topic),length=path.length;
 if(progress.stage>=length){const run=attempt.correct&&!attempt.hinted?(progress.run+1)%3:0;return {stage:length,run};}
 const target=path[Math.min(length-1,progress.stage)];
 if(attempt.skill!==target.skill||attempt.level!==target.level)return progress;
 const run=attempt.correct&&!attempt.hinted?progress.run+1:0;
 return run>=3?{stage:Math.min(length,progress.stage+1),run:0}:{...progress,run};
}
export function progressFromTopic(topic:TopicId,attempts:Attempt[]):Progress{return attempts.filter(a=>skills[a.skill]?.topic===topic).reduce((p,a)=>advanceTopicProgress(topic,p,a),{stage:0,run:0});}
export function nextConcept(progress:Progress,attempts:Attempt[],topic:TopicId='multiply'):number{
 const path=journeyFor(topic);
 if(progress.stage<path.length)return path[progress.stage].skill;
 return skillsForTopic(topic).find(i=>!stats(attempts,i).mastered||attempts.filter(a=>a.skill===i&&a.level===3&&a.correct&&!a.hinted).length<3)??-1;
}
export type Question={skill:number,level:number,a:number,b:number,prompt:string,answer:number,explanation:string,visual?:string,topicId?:TopicId};
const rand=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
export function stats(attempts:Attempt[],skill:number){const all=attempts.filter(x=>x.skill===skill);const recent=all.slice(-10);const independent=recent.filter(x=>!x.hinted);const acc=independent.length?independent.filter(x=>x.correct).length/independent.length:0;return {total:all.length,correct:all.filter(x=>x.correct).length,acc,mastered:independent.length>=8&&acc>=.8,level:(()=>{const independent=all.filter(x=>!x.hinted);const current=independent.at(-1)?.level||1;const evidence=independent.filter(x=>x.level===current).slice(-5);const wins=evidence.filter(x=>x.correct).length;return evidence.length>=5&&wins>=4?Math.min(3,current+1):evidence.length>=3&&wins<=1?Math.max(1,current-1):current})(),recent};}
export function selectSkill(attempts:Attempt[],index:number){if(index<8)return index;const scores=skills.map((_,i)=>({i,s:stats(attempts,i)}));const gaps=scores.filter(x=>!x.s.mastered);return (gaps.length?gaps:scores).sort((a,b)=>(a.s.acc+a.s.total*.015)-(b.s.acc+b.s.total*.015))[0].i;}
export function questionTime(q:Pick<Question,'skill'|'level'|'a'|'b'|'prompt'>){
 const topic=skills[q.skill]?.topic;
 if(topic&&topic!=='multiply'){
  const words=q.prompt.split(/\s+/).length,base=topic==='hcf'||topic==='lcm'?23+q.level*7+(String(q.a).length+String(q.b).length)*4:topic==='division'?18+q.level*8+(String(q.a).length+String(q.b).length)*5:17+q.level*9+(String(q.a).length+String(q.b).length)*5;
  return Math.round(Math.max(18,Math.min(100,base+Math.max(0,words-5)*1.3)));
 }
 const digits=String(q.a).length+String(q.b).length;
 let carries=0,c=0;for(const d of String(q.a).split('').reverse()){c=Math.floor((Number(d)*q.b+c)/10);if(c)carries++;}
 const words=q.prompt.split(/\s+/).length;
 const base=q.skill<2?14+q.a*.8+q.b*.6+Math.min(80,q.a*q.b)*.45:q.skill===2?16+(q.a>5?5:0)+(q.b>5?5:0)+(q.a>9||q.b>9?5:0):q.skill===3?25+digits*3:q.skill===4?22+digits*7:q.skill===5?28+digits*7+carries*9:q.skill===6?42+digits*12+carries*5:30+digits*8+words*1.1+carries*6;
 return Math.round(Math.max(18,Math.min(180,base)));
}
export function budget(attempts:Attempt[],skill:number,level:number,question?:Question){
 const q=question??{skill,level,a:level===1?3:8,b:level===1?4:9,prompt:'3 × 4'};const base=questionTime(q);
 const ratios=attempts.filter(x=>x.skill===skill&&x.level===level&&x.correct&&!x.hinted).slice(-8).map(x=>{const n=x.prompt?.match(/\d+/g)?.map(Number);return x.seconds/questionTime(n&&n.length>=2?{skill,level,a:n[0],b:n[1],prompt:x.prompt}:q)}).sort((a,b)=>a-b);
 return Math.round(base*(ratios.length>=3?Math.max(.8,Math.min(2,ratios[Math.floor(ratios.length/2)]*1.5)):1));
}
export function generate(skill:number,level:number,previous:string[]=[],step=0):Question{
 if(skill>=8)return generateArithmetic(skill,level,previous,step);
 let q:Question;let tries=0;
 do{let a=rand(level+1,level+1+Math.min(2,step)),b=rand(level+1,level+2),prompt='',explanation='',visual='';
 if(skill<2){const base=level*2+(skill===1?1:0);a=base+Math.floor(Math.min(2,step)/2);b=base+Math.ceil(Math.min(2,step)/2);if(Math.random()<.5)[a,b]=[b,a];}
 if(skill===0){prompt=`${a} baskets have ${b} apples each. How many apples altogether?`;visual='groups';}
 if(skill===1){prompt=`${a} rows of ${b} stars. How many stars altogether?`;visual='array';}
 if(skill===2){a=rand(level===1?2:level===2?5:9,level===1?4:level===2?8:12);b=rand(level===1?2:level===2?4:8,level===1?5:level===2?8:12);prompt=`${a} × ${b} = ?`;}
 if(skill===3){a=rand(level===1?2:level===2?4:6,level===1?3:level===2?6:9)*(level===3?100:10);b=rand(level===1?2:level===2?4:6,level===1?3:level===2?6:9);prompt=`${a} × ${b} = ?`;}
 if(skill===4){b=rand(level===3?3:2,level===3?4:3);const max=Math.floor(9/b);a=rand(1,max)*10+rand(1,max);if(level>=2)a+=rand(1,max)*100;if(level===3)a+=rand(1,max)*1000;prompt=`${a} × ${b} = ?`;}
 if(skill===5){b=rand(level===1?2:level===2?3:6,level===1?4:level===2?6:9);a=rand(level===1?1:level===2?10:100,level===1?8:level===2?89:899)*10+rand(Math.ceil(10/b),9);prompt=`${a} × ${b} = ?`;}
 if(skill===6){a=rand(level===1?12:level===2?30:60,level===1?29:level===2?59:99);b=rand(level===1?11:level===2?20:50,level===1?19:level===2?39:99);prompt=`${a} × ${b} = ?`;}
 if(skill===7){a=rand(3,level===1?9:29);b=rand(3,level===3?19:9);prompt=[`A space station has ${a} rooms with ${b} plants in each. How many plants?`,`${a} explorers each collect ${b} moon rocks. How many moon rocks altogether?`,`A baker fills ${a} boxes with ${b} cookies each. How many cookies?`][rand(0,2)];}
 if(skill<2)explanation=`${a} equal groups of ${b}: ${Array(a).fill(b).join(' + ')} = ${a*b}.`;
 else if(skill===5){const ones=(a%10)*b;explanation=`Ones: ${a%10} × ${b} = ${ones}. Write ${ones%10}, carry ${Math.floor(ones/10)}. Then ${Math.floor(a/10)} × ${b} + ${Math.floor(ones/10)} = ${Math.floor(a*b/10)}. Answer: ${a*b}.`;}
 else if(skill===6)explanation=`Split ${b} into ${Math.floor(b/10)*10} + ${b%10}. The partial products are ${a*Math.floor(b/10)*10} and ${a*(b%10)}. Add them: ${a*b}.`;
 else explanation=`${a} × ${b} = ${a*b}. ${a>=10?`Split ${a} into ${Math.floor(a/10)*10} + ${a%10}: ${Math.floor(a/10)*10*b} + ${a%10*b} = ${a*b}.`:`Think of ${a} equal groups of ${b}, or count by ${b}, ${a} times.`}`;
 q={skill,level,a,b,prompt,answer:a*b,explanation,visual,topicId:'multiply'};tries++;}while(previous.includes(q.prompt)&&tries<80);return q;
}

const gcd=(x:number,y:number):number=>y?gcd(y,x%y):x;
const lcm=(x:number,y:number)=>x/gcd(x,y)*y;
function generateArithmetic(skill:number,level:number,previous:string[]=[],step=0):Question{
 const topic=skills[skill].topic;let q:Question,tries=0,seed=((skill+1)*7919+(level+1)*104729+(previous.length+1)*15485863+(step+1)*37)%2147483647;
 const rand=(min:number,max:number)=>{seed=seed*48271%2147483647;return min+seed%(max-min+1)};
 do{
  let a=0,b=0,answer=0,prompt='',explanation='',visual:string|undefined;
  const scale=level===1?1:level===2?10:100;
  if(skill===8){a=rand(12,38)*scale;b=rand(11,59)*scale;while(a%10+b%10>=10)b-=b%10;prompt=`${a} + ${b} = ?`;answer=a+b;explanation=`Add the ones, then the tens and hundreds: ${a} + ${b} = ${answer}.`;}
  else if(skill===9){const onesA=rand(2,8),onesB=rand(10-onesA,9);a=rand(2,8)*scale*10+onesA;b=rand(1,6)*scale*10+onesB;prompt=`${a} + ${b} = ?`;answer=a+b;explanation=`The ones make ${onesA+onesB}, so trade 10 ones for 1 ten. ${a} + ${b} = ${answer}.`;}
  else if(skill===10){a=rand(214,684)*(level===1?1:level===2?2:10);b=rand(126,589)*(level===1?1:level===2?2:10);prompt=`${a} + ${b} = ?`;answer=a+b;explanation=`Add from the ones column, regrouping each time a column reaches 10. The total is ${answer}.`;}
  else if(skill===11){a=rand(8,45)*scale;b=rand(12,53)*scale;const total=a+b;answer=b;prompt=`${a} + □ = ${total}. What goes in the box?`;explanation=`The missing addend is the total minus the known part: ${total} − ${a} = ${b}.`;}
  else if(skill===12){a=rand(12,89)*(level===1?1:level===2?2:10);b=rand(13,76)*(level===1?1:level===2?2:10);answer=a+b;prompt=[`A library has ${a} storybooks and ${b} fact books. How many books altogether?`,`A space crew collects ${a} blue stars and ${b} gold stars. How many stars did they collect?`,`There are ${a} children at the park and ${b} more arrive. How many children are there now?`][rand(0,2)];explanation=`Put the two amounts together: ${a} + ${b} = ${answer}.`;}
  else if(skill===13){const tensA=rand(4,8),onesA=rand(2,8),tensB=rand(1,tensA-1),onesB=rand(0,onesA);a=(tensA*10+onesA)*scale;b=(tensB*10+onesB)*scale;prompt=`${a} − ${b} = ?`;answer=a-b;explanation=`Subtract each place-value column: ${a} − ${b} = ${answer}.`;}
  else if(skill===14){const onesA=rand(0,5),onesB=rand(onesA+1,9);a=rand(5,8)*scale*10+onesA;b=rand(1,4)*scale*10+onesB;if(b>=a)b=a-1;prompt=`${a} − ${b} = ?`;answer=a-b;explanation=`Trade 1 ten for 10 ones. Now subtract the ones, then the tens: ${answer}.`;}
  else if(skill===15){if(level===1){const h=rand(4,9);a=h*100+rand(0,9);b=(h-1)*100+rand(11,99);}else if(level===2){const t=rand(3,8);a=t*1000+rand(0,9);b=(t-1)*1000+rand(1,9)*100+rand(11,99);}else{const t=rand(3,9);a=t*10000+rand(0,9);b=(t-1)*10000+rand(10,99)*100+rand(11,99);}prompt=`${a} − ${b} = ?`;answer=a-b;explanation=`Regroup from the next non-zero place across the zero: ${a} − ${b} = ${answer}.`;}
  else if(skill===16){a=rand(48,99)*(level===1?1:level===2?10:100);b=rand(16,47)*(level===1?1:level===2?10:100);const total=a+b;answer=b;prompt=`${total} − □ = ${a}. Find the missing number.`;explanation=`The missing number is ${total} − ${a} = ${b}. Check: ${total} − ${b} = ${a}.`;}
  else if(skill===17){a=rand(28,96)*(level===1?1:level===2?2:10);b=rand(11,Math.max(12,a-1))*(level===1?1:level===2?1:2);if(b>=a)b=a-1;answer=a-b;prompt=[`A game has ${a} stars. ${b} are used to open a prize. How many stars remain?`,`A coach brings ${a} cones and sets out ${b}. How many cones are still in the bag?`,`A train travels ${a} km. It has ${b} km left. How far has it travelled?`][rand(0,2)];explanation=`Find the difference: ${a} − ${b} = ${answer}.`;}
  else if(skill===18||skill===19){b=rand(2,level===1?5:level===2?9:12);answer=rand(2,level===1?8:level===2?12:18);a=b*answer;prompt=skill===18?`Share ${a} cookies equally into ${b} bags. How many in each bag?`:`${a} ÷ ${b} = ?`;explanation=`Use the related fact ${b} × ${answer} = ${a}. So ${a} ÷ ${b} = ${answer}.`;}
  else if(skill===20){b=rand(2,level===1?6:level===2?9:12);answer=rand(level===1?6:level===2?12:20,level===1?15:level===2?40:99);a=b*answer;prompt=`${a} ÷ ${b} = ?`;explanation=`${b} goes into ${a} exactly ${answer} times. Check: ${answer} × ${b} = ${a}.`;}
  else if(skill===21||skill===22){b=rand(3,level===1?6:level===2?9:12);answer=rand(3,level===1?12:level===2?24:60);const rem=skill===21?rand(1,b-1):0;a=b*answer+rem;prompt=skill===21?`What is the remainder when ${a} is divided by ${b}?`:[`A ${a}-piece art kit is shared among ${b} tables. How many pieces can each table get?`,`A coach shares ${a} badges equally among ${b} teams. How many badges per team?`,`Put ${a} marbles into boxes of ${b}. How many full boxes can you fill?`][rand(0,2)];explanation=skill===21?`${b} × ${answer} = ${b*answer}, with ${rem} left over. The remainder is ${rem}.`:`${a} ÷ ${b} = ${answer}. Check with ${answer} × ${b} = ${a}.`;if(skill===21)answer=rem;}
  else if(skill===23||skill===24||skill===25){const pairs=[[2,3],[2,5],[3,4],[3,5],[4,5],[5,6],[4,7],[5,7],[6,7],[7,8],[8,9],[9,10],[11,12],[8,15],[12,18],[14,21],[18,24],[20,30],[24,36],[27,45]];const [x,y]=pairs[rand(0,pairs.length-1)];const factor=rand(2,level===1?5:level===2?8:12);a=x*factor;b=y*factor;answer=gcd(a,b);prompt=skill===25?`Two ribbons are ${a} cm and ${b} cm long. What is the greatest equal length you can cut with no waste?`:skill===23?`Which is the greatest number that divides both ${a} and ${b}?`:`Find the HCF of ${a} and ${b}.`;explanation=`Common factors of ${a} and ${b} include ${answer}. No larger shared factor fits, so HCF = ${answer}.`;}
  else {const pairs=[[2,3],[2,5],[3,4],[3,5],[4,5],[5,6],[4,7],[5,7],[6,7],[7,8],[8,9],[9,10],[11,12],[8,15],[12,18],[14,21],[18,24],[20,30],[24,36],[27,45]];const [x,y]=pairs[rand(0,pairs.length-1)];const factor=rand(2,level===1?4:level===2?6:9);a=x*factor;b=y*factor;answer=lcm(a,b);prompt=skill===28?`One bell rings every ${a} minutes and another every ${b}. After how many minutes will they ring together?`:skill===26?`List the first positive multiple shared by ${a} and ${b}.`:`Find the LCM of ${a} and ${b}.`;explanation=`The smallest positive number in both times tables is ${answer}, so LCM = ${answer}.`;}
  q={skill,level,a,b,prompt,answer,explanation,visual,topicId:topic};tries++;
 }while(previous.includes(q.prompt)&&tries<80);
 return q;
}


