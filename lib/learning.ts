export const skills=[
 {name:'Equal groups',icon:'🍎',sub:'Discover what multiplication means',time:40,vid:'RNxwasijbAo',video:'https://www.khanacademy.org/math/5th-grade-foundations-engageny/5th-m4-engage-ny-foundations/5th-m4-tb-foundations/v/multiplication-intro',help:'3 groups of 4 means 4 + 4 + 4. Every group has the same number.'},
 {name:'Arrays & patterns',icon:'🌻',sub:'See the rows. Find the pattern.',time:40,vid:'cDpBtkU2cf8',video:'',help:'Count the rows, then the objects in each row. Multiply them to find the total.'},
 {name:'Times-table trails',icon:'⚡',sub:'Build your number superpowers',time:25,vid:'RNxwasijbAo',video:'',help:'Break tricky facts into smaller facts. 7 × 6 = (5 × 6) + (2 × 6) = 30 + 12.'},
 {name:'Place-value powers',icon:'🧩',sub:'Make friends with tens & hundreds',time:45,vid:'FJ5qLWP3Fqo',video:'',help:'30 × 4 = 3 tens × 4 = 12 tens = 120.'},
 {name:'Multiply without carrying',icon:'🚀',sub:'A little bigger. A lot more exciting.',time:65,vid:'FJ5qLWP3Fqo',video:'',help:'For 23 × 3: 3 × 3 = 9 ones, then 2 × 3 = 6 tens. Answer: 69.'},
 {name:'The carrying bridge',icon:'🌉',sub:'Trade ten ones for a brand-new ten',time:90,vid:'FJ5qLWP3Fqo',video:'',help:'For 27 × 3: 7 × 3 = 21. Write 1, carry 2 tens. Then 2 × 3 + 2 = 8 tens. Answer: 81.'},
 {name:'Two-digit mountain',icon:'🏔️',sub:'Split, multiply, bring it together',time:120,vid:'RVYwunbpMHA',video:'',help:'For 24 × 12, split 12 into 10 + 2. Add 240 + 48 = 288. Keep the zero in the tens row.'},
 {name:'Real-world quests',icon:'🌎',sub:'Use your skills outside the classroom',time:90,vid:'FJ5qLWP3Fqo',video:'',help:'Find how many equal groups there are and how many in each group. Multiply and check the story.'}
];
export type Attempt={skill:number,level:number,correct:boolean,seconds:number,hinted:boolean,at:number,prompt:string,answer:number,given:string};
export type Student={id:string,name:string,attempts:Attempt[]};
export type Question={skill:number,level:number,a:number,b:number,prompt:string,answer:number,explanation:string,visual?:string};
const rand=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
export function stats(attempts:Attempt[],skill:number){const all=attempts.filter(x=>x.skill===skill);const recent=all.slice(-10);const independent=recent.filter(x=>!x.hinted);const acc=independent.length?independent.filter(x=>x.correct).length/independent.length:0;return {total:all.length,correct:all.filter(x=>x.correct).length,acc,mastered:independent.length>=8&&acc>=.8,level:(()=>{const independent=all.filter(x=>!x.hinted);const current=independent.at(-1)?.level||1;const evidence=independent.filter(x=>x.level===current).slice(-5);const wins=evidence.filter(x=>x.correct).length;return evidence.length>=5&&wins>=4?Math.min(3,current+1):evidence.length>=3&&wins<=1?Math.max(1,current-1):current})(),recent};}
export function selectSkill(attempts:Attempt[],index:number){if(index<8)return index;const scores=skills.map((_,i)=>({i,s:stats(attempts,i)}));const gaps=scores.filter(x=>!x.s.mastered);return (gaps.length?gaps:scores).sort((a,b)=>(a.s.acc+a.s.total*.015)-(b.s.acc+b.s.total*.015))[0].i;}
export function budget(attempts:Attempt[],skill:number,level:number){const times=attempts.filter(x=>x.skill===skill&&x.level===level&&x.correct&&!x.hinted).slice(-8).map(x=>x.seconds).sort((a,b)=>a-b);const base=skills[skill].time*(1+(level-1)*.25);return Math.round(times.length>=3?Math.max(base*.65,Math.min(base*2,times[Math.floor(times.length/2)]*1.5)):base);}
export function generate(skill:number,level:number,previous:string[]=[]):Question{
 let q:Question;let tries=0;
 do{let a=rand(2,level===1?5:9),b=rand(2,level===1?5:12),prompt='',explanation='',visual='';
 if(skill===0){prompt=`${a} baskets have ${b} apples each. How many apples altogether?`;visual='groups';}
 if(skill===1){prompt=`${a} rows of ${b} stars. How many stars altogether?`;visual='array';}
 if(skill===2){a=rand(level===1?0:3,level===3?12:10);b=rand(2,level===1?5:12);prompt=`${a} × ${b} = ?`;}
 if(skill===3){a=rand(2,9)*(level===3?100:10);b=rand(2,9);prompt=`${a} × ${b} = ?`;}
 if(skill===4){b=rand(2,4);const max=Math.floor(9/b);a=rand(1,max)*10+rand(1,max);if(level===3)a+=rand(1,max)*100;prompt=`${a} × ${b} = ?`;}
 if(skill===5){b=rand(2,9);a=rand(1,level===3?89:8)*10+rand(Math.ceil(10/b),9);prompt=`${a} × ${b} = ?`;}
 if(skill===6){a=rand(12,level===3?89:39);b=rand(11,level===1?19:39);prompt=`${a} × ${b} = ?`;}
 if(skill===7){a=rand(3,level===1?9:29);b=rand(3,level===3?19:9);prompt=[`A space station has ${a} rooms with ${b} plants in each. How many plants?`,`${a} explorers each collect ${b} moon rocks. How many moon rocks altogether?`,`A baker fills ${a} boxes with ${b} cookies each. How many cookies?`][rand(0,2)];}
 if(skill<2)explanation=`${a} equal groups of ${b}: ${Array(a).fill(b).join(' + ')} = ${a*b}.`;
 else if(skill===5){const ones=(a%10)*b;explanation=`Ones: ${a%10} × ${b} = ${ones}. Write ${ones%10}, carry ${Math.floor(ones/10)}. Then ${Math.floor(a/10)} × ${b} + ${Math.floor(ones/10)} = ${Math.floor(a*b/10)}. Answer: ${a*b}.`;}
 else if(skill===6)explanation=`Split ${b} into ${Math.floor(b/10)*10} + ${b%10}. The partial products are ${a*Math.floor(b/10)*10} and ${a*(b%10)}. Add them: ${a*b}.`;
 else explanation=`${a} × ${b} = ${a*b}. ${a>=10?`Split ${a} into ${Math.floor(a/10)*10} + ${a%10}: ${Math.floor(a/10)*10*b} + ${a%10*b} = ${a*b}.`:`Think of ${a} equal groups of ${b}, or count by ${b}, ${a} times.`}`;
 q={skill,level,a,b,prompt,answer:a*b,explanation,visual};tries++;}while(previous.includes(q.prompt)&&tries<80);return q;
}


