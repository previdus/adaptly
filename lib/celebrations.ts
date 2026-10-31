export const celebrationFamilies=['starburst','confetti','bubbles','spiral','fireworks','hearts','comets','rainbow','diamonds','rocket'];
export const celebrationPalettes=[['#ffe38e','#c8b0ff','#90e8d5'],['#ff99bb','#ffda85','#b5a1ff'],['#84ddff','#c7b7ff','#fff1a9'],['#b8ed91','#ffce98','#bca1ff'],['#ffb5f0','#93ebd4','#ffea86']];
export const celebrations=celebrationFamilies.flatMap((family,f)=>celebrationPalettes.map((colors,v)=>({id:f*5+v,family,colors,variant:v,symbol:['★','✦','●','✧','✹','♥','✦','★','◆','🚀'][f]})));
export function celebrationFor(correctAnswers:number){return celebrations[((Math.max(1,correctAnswers)-1)*17)%50];}
