export const celebrationFamilies=['starburst','confetti','bubbles','spiral','fireworks','hearts','comets','rainbow','diamonds','rocket'];
export const celebrationPalettes=[['#ffe38e','#c8b0ff','#90e8d5'],['#ff99bb','#ffda85','#b5a1ff'],['#84ddff','#c7b7ff','#fff1a9'],['#b8ed91','#ffce98','#bca1ff'],['#ffb5f0','#93ebd4','#ffea86']];
export const celebrations=celebrationFamilies.flatMap((family,f)=>celebrationPalettes.map((colors,v)=>({id:f*5+v,family,colors,variant:v,symbol:['★','✦','●','✧','✹','♥','✦','★','◆','🚀'][f]})));
export function celebrationFor(correctAnswers:number){return celebrations[((Math.max(1,correctAnswers)-1)*17)%50];}

export const funnyFriends=[
 {emoji:'🤡',name:'Bubbles the clown',cheer:'Honk honk! Great job',motion:'juggle'},
 {emoji:'🤖',name:'Beep the robot',cheer:'Beep boop! Brilliant',motion:'robot'},
 {emoji:'🦖',name:'Tiny the dinosaur',cheer:'Roar-some work',motion:'stomp'},
 {emoji:'🐸',name:'Hop the frog',cheer:'Hoppy days! Well done',motion:'hop'},
 {emoji:'🦄',name:'Sprinkle the unicorn',cheer:'That was magical',motion:'twirl'},
 {emoji:'🐵',name:'Bananas the monkey',cheer:'Banana-tastic',motion:'swing'},
 {emoji:'😎',name:'Sunny the superstar',cheer:'Too cool! Great job',motion:'groove'},
 {emoji:'🐙',name:'Noodle the octopus',cheer:'Eight high-fives for you',motion:'wobble'},
 {emoji:'🥳',name:'Party Pop',cheer:'Woo-hoo! You did it',motion:'party'},
 {emoji:'🦊',name:'Fizz the fox',cheer:'Clever thinking',motion:'pounce'}
];
