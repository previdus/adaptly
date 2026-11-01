export type ArenaQuestion={id:string;concept:string;prompt:string;a:number;b:number;answer:number;seconds:number;step:number};

// A fixed, balanced 200-question bank. Each block moves from concrete models
// to number facts, place value, carrying, two-digit products, and stories.
const bank:ArenaQuestion[]=[];
const add=(block:string,concept:string,a:number,b:number,prompt:string,seconds:number,step:number)=>bank.push({id:`${block}-${String(bank.filter(q=>q.id.startsWith(block+'-')).length+1).padStart(2,'0')}`,concept,prompt,a,b,answer:a*b,seconds,step});

const groupPairs:[[number,number],...Array<[number,number]>]=[[2,3],[2,4],[2,5],[2,6],[2,7],[3,2],[3,4],[3,5],[3,6],[3,7],[4,2],[4,3],[4,5],[4,6],[4,7],[5,2],[5,3],[5,4],[5,6],[5,7],[6,2],[6,3],[6,4],[6,5],[6,7]];
for(const [i,[a,b]] of groupPairs.entries())add('groups','Equal groups',a,b,`There are ${a} baskets with ${b} apples in each. How many apples altogether?`,22+i%3,1);

const arrayPairs:[[number,number],...Array<[number,number]>]=[[2,4],[2,5],[2,6],[2,7],[2,8],[3,3],[3,4],[3,5],[3,6],[3,7],[4,3],[4,4],[4,5],[4,6],[4,7],[5,3],[5,4],[5,5],[5,6],[5,7],[6,3],[6,4],[6,5],[6,6],[6,7]];
for(const [i,[a,b]] of arrayPairs.entries())add('arrays','Arrays & patterns',a,b,`A garden has ${a} rows of ${b} sunflowers. How many flowers are there?`,20+i%4,1);

const factPairs:[[number,number],...Array<[number,number]>]=[[2,8],[3,8],[4,8],[5,8],[6,8],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[9,3],[9,4],[9,5],[9,6]];
for(const [i,[a,b]] of factPairs.entries())add('facts','Times-table trails',a,b,`${a} × ${b} = ?`,18+i%4,2);

const placePairs:[[number,number],...Array<[number,number]>]=[[20,3],[30,4],[40,5],[50,6],[60,7],[70,8],[80,9],[90,2],[20,7],[30,8],[40,9],[50,3],[60,4],[70,5],[80,6],[90,7],[200,3],[300,4],[400,5],[500,6],[600,7],[700,8],[800,9],[900,2],[400,8]];
for(const [i,[a,b]] of placePairs.entries())add('place','Place-value powers',a,b,`${a} × ${b} = ?`,23+i%5,3);

const noCarryPairs:[[number,number],...Array<[number,number]>]=[[21,3],[22,4],[23,3],[24,2],[31,3],[32,3],[33,2],[34,2],[41,2],[42,2],[43,2],[44,2],[51,3],[52,3],[53,3],[61,3],[62,3],[63,3],[71,2],[72,2],[81,2],[82,2],[91,2],[101,3],[111,3]];
for(const [i,[a,b]] of noCarryPairs.entries())add('nocarry','Multiply without carrying',a,b,`${a} × ${b} = ?`,25+i%5,3);

const carryPairs:[[number,number],...Array<[number,number]>]=[[27,3],[38,4],[46,5],[57,6],[68,7],[79,8],[86,9],[94,7],[125,4],[136,5],[247,3],[358,4],[469,5],[578,6],[689,7],[794,8],[827,9],[936,4],[248,7],[359,8],[468,9],[579,3],[687,4],[798,5],[906,7]];
for(const [i,[a,b]] of carryPairs.entries())add('carry','The carrying bridge',a,b,`${a} × ${b} = ?`,28+i%6,4);

const mountainPairs:[[number,number],...Array<[number,number]>]=[[12,12],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,12],[21,13],[22,14],[23,15],[24,16],[25,17],[26,18],[27,19],[28,12],[29,13],[31,14],[32,15],[33,16],[34,17],[35,18],[36,19],[42,23],[48,26]];
for(const [i,[a,b]] of mountainPairs.entries())add('mountain','Two-digit mountain',a,b,`${a} × ${b} = ?`,32+i%7,5);

const storyPairs:[[number,number],...Array<[number,number]>]=[[4,8],[6,7],[8,9],[7,12],[9,8],[12,6],[14,5],[11,9],[15,7],[18,6],[16,8],[21,4],[24,5],[13,12],[17,8],[19,7],[22,6],[25,9],[28,4],[32,3],[23,11],[26,12],[34,8],[42,7],[36,9]];
const stories=[(a:number,b:number)=>`A rocket crew packs ${a} snack bags with ${b} treats in each. How many treats do they pack?`,(a:number,b:number)=>`There are ${a} teams with ${b} players on every team. How many players altogether?`,(a:number,b:number)=>`A maker builds ${a} toy robots with ${b} wheels each. How many wheels are needed?`,(a:number,b:number)=>`A library sets out ${a} piles of ${b} books. How many books are on display?`,(a:number,b:number)=>`A dragon collects ${a} treasure chests with ${b} gems inside each. How many gems?`];
for(const [i,[a,b]] of storyPairs.entries())add('stories','Real-world quests',a,b,stories[i%stories.length](a,b),24+i%7,5);

if(bank.length!==200)throw new Error(`Multiply Arena bank expected 200 questions, received ${bank.length}`);
if(new Set(bank.map(q=>q.id)).size!==200||new Set(bank.map(q=>q.prompt)).size!==200)throw new Error('Multiply Arena questions must have unique IDs and prompts.');
if(bank.some(q=>q.answer!==q.a*q.b||!q.prompt.trim()||q.seconds<18))throw new Error('Multiply Arena question data is incomplete.');
export const MULTIPLY_QUESTION_BANK:readonly ArenaQuestion[]=Object.freeze(bank);
