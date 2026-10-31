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
export type Progress={stage:number,run:number};
export type Student={id:string,name:string,attempts:Attempt[],progress?:Progress};
export const journey=[
 [0,1],[1,1],[0,2],[1,2],[0,3],[1,3],
 [2,1],[2,2],[2,3],[3,1],[3,2],[3,3],
 [4,1],[4,2],[4,3],[5,1],[5,2],[5,3],
 [7,1],[7,2],[6,1],[6,2],[6,3],[7,3]
].map(([skill,level],stage)=>({skill,level,stage}));
export function stageFor(stage:number){return journey[Math.min(23,Math.max(0,stage))];}
export function advanceProgress(progress:Progress,attempt:Attempt):Progress{
 if(progress.stage>=24){const run=attempt.correct&&!attempt.hinted?(progress.run+1)%3:0;return {stage:24,run};}
 const {skill,level}=stageFor(progress.stage);
 if(attempt.skill!==skill||attempt.level!==level)return progress;
 const run=attempt.correct&&!attempt.hinted?progress.run+1:0;
 return run>=3?{stage:Math.min(24,progress.stage+1),run:0}:{...progress,run};
}
export function progressFrom(attempts:Attempt[]):Progress{return attempts.reduce(advanceProgress,{stage:0,run:0});}
export function nextConcept(progress:Progress,attempts:Attempt[]):number{
 if(progress.stage<24)return stageFor(progress.stage).skill;
 return skills.findIndex((_,i)=>!stats(attempts,i).mastered||attempts.filter(a=>a.skill===i&&a.level===3&&a.correct&&!a.hinted).length<3);
}
export type Question={skill:number,level:number,a:number,b:number,prompt:string,answer:number,explanation:string,visual?:string};
const rand=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
export function stats(attempts:Attempt[],skill:number){const all=attempts.filter(x=>x.skill===skill);const recent=all.slice(-10);const independent=recent.filter(x=>!x.hinted);const acc=independent.length?independent.filter(x=>x.correct).length/independent.length:0;return {total:all.length,correct:all.filter(x=>x.correct).length,acc,mastered:independent.length>=8&&acc>=.8,level:(()=>{const independent=all.filter(x=>!x.hinted);const current=independent.at(-1)?.level||1;const evidence=independent.filter(x=>x.level===current).slice(-5);const wins=evidence.filter(x=>x.correct).length;return evidence.length>=5&&wins>=4?Math.min(3,current+1):evidence.length>=3&&wins<=1?Math.max(1,current-1):current})(),recent};}
export function selectSkill(attempts:Attempt[],index:number){if(index<8)return index;const scores=skills.map((_,i)=>({i,s:stats(attempts,i)}));const gaps=scores.filter(x=>!x.s.mastered);return (gaps.length?gaps:scores).sort((a,b)=>(a.s.acc+a.s.total*.015)-(b.s.acc+b.s.total*.015))[0].i;}
export function questionTime(q:Pick<Question,'skill'|'level'|'a'|'b'|'prompt'>){
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
 q={skill,level,a,b,prompt,answer:a*b,explanation,visual};tries++;}while(previous.includes(q.prompt)&&tries<80);return q;
}


