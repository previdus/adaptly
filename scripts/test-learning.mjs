import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
const js=ts.transpile(fs.readFileSync('lib/learning.ts','utf8'),{module:ts.ModuleKind.ESNext});
const {generate,stats,budget,selectSkill}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
for(let skill=0;skill<8;skill++)for(let level=1;level<=3;level++)for(let n=0;n<1000;n++){
 const q=generate(skill,level);assert.equal(q.answer,q.a*q.b);assert.ok(Number.isInteger(q.answer)&&q.answer>=0);
 if(skill===4){for(const digit of String(q.a))assert.ok(Number(digit)*q.b<10,'No-carry question requires a carry');}
 if(skill===5)assert.ok((q.a%10)*q.b>=10,'Carry question has no carry');
 if(skill===6)assert.ok(q.a>=10&&q.b>=10);
}
const a=(correct,hinted=false,seconds=10)=>({skill:0,level:1,correct,hinted,seconds});
assert.equal(stats(Array.from({length:8},()=>a(true,true)),0).mastered,false);
assert.equal(stats(Array.from({length:8},()=>a(true)),0).mastered,true);
assert.equal(stats([a(false)],0).mastered,false);
assert.equal(budget([],0,1),40);
assert.equal(budget([a(true,false,30),a(true,false,40),a(true,false,50)],0,1),60);
for(let i=0;i<8;i++)assert.equal(selectSkill([],i),i);
console.log('PASS: 24,000 generated questions, carrying constraints, mastery evidence and adaptive timing.');
