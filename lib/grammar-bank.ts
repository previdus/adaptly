export const ENGLISH_GRAMMAR_SKILL_START = 29;

export type GrammarItem = {
  id: string;
  skill: number;
  level: number;
  concept: string;
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
  seconds: number;
  step: number;
};

type Draft = Pick<GrammarItem, 'prompt' | 'answer' | 'options' | 'explanation'>;
const choose = <T,>(items: readonly T[], index: number) => items[index % items.length];
function item(prompt: string, answer: string, distractors: string[], explanation: string): Draft {
  const choices = [...new Set([answer, ...distractors])].slice(0, 4).filter(choice => choice !== answer);
  const answerIndex = [...prompt].reduce((sum, char) => sum + char.charCodeAt(0), 0) % (choices.length + 1);
  choices.splice(answerIndex, 0, answer);
  const options = choices;
  return { prompt, answer, options, explanation };
}

const nounPeople = ['Maya', 'Leo', 'Asha', 'Noah', 'Ivy', 'Omar', 'Zoe', 'Kai'];
const nounThings = ['backpack', 'lantern', 'shell', 'sketchbook', 'marble', 'compass', 'puzzle', 'trophy'];
const verbs = ['found', 'carried', 'painted', 'packed', 'opened', 'shared', 'spotted', 'built'];
const cities = ['Delhi', 'London', 'Cairo', 'Tokyo', 'Lima', 'Dublin', 'Nairobi', 'Perth'];
const irregularPlurals: Array<[string, string]> = [['child','children'],['mouse','mice'],['tooth','teeth'],['person','people'],['foot','feet'],['goose','geese'],['woman','women'],['man','men'],['leaf','leaves']];

function makeDraft(concept: number, level: number, variant: number): Draft {
  if (concept === 0) {
    if (level === 1) {
      const person = choose(nounPeople, variant), thing = choose(nounThings, variant + 3), verb = choose(verbs, variant + 2);
      return item(`“${person} ${verb} the ${thing}.” Which word names a thing?`, thing, [person, verb, 'quickly'], `A ${thing} is a thing, so it is a noun. ${verb} tells the action.`);
    }
    if (level === 2) {
      const person = choose(nounPeople, variant), city = choose(cities, variant);
      return item(`Which word names a specific place in “${person} visits ${city}”?`, city, [person, 'visits', 'place'], `${city} is the name of one particular place, so it is a proper noun and begins with a capital letter.`);
    }
    const [singular, plural] = irregularPlurals[variant];
    return item(`What is the plural of “${singular}”?`, plural, [singular + 's', singular + 'es', singular + 'ed'], `The plural of ${singular} is ${plural}. This is an irregular plural, so it changes in a special way.`);
  }
  if (concept === 1) {
    if (level === 1) {
      const names = [['Ava','She'],['Ben','He'],['Mina','She'],['Arun','He'],['Nia','She'],['Ravi','He'],['Luca','He'],['Sara','She']];
      const [name, pronoun] = names[variant];
      return item(`${name} found a kite. ___ carried it home.`, pronoun, ['They', pronoun === 'She' ? 'He' : 'She', 'It'], `${pronoun} takes the place of ${name}'s name. A word that stands in for a noun is a pronoun.`);
    }
    if (level === 2) {
      const teams = ['the dancers','the cousins','the birds','the players','the twins','the robots','the puppies','the hikers'];
      const subject = choose(teams, variant);
      return item(`The coach waved to ${subject}. The coach waved to ___.`, 'them', ['they','we','their'], `“Them” is the object pronoun used after “to.” “They” is used as a subject.`);
    }
    const owners = [['Mia','hers'],['Sam','his'],['the twins','theirs'],['Ravi','his'],['Nina','hers'],['the team','theirs'],['Asha','hers'],['Leo','his'],['the friends','theirs']];
    const [owner, pronoun] = owners[variant];
    return item(`This water bottle belongs to ${owner}. It is ___.`, pronoun, ['her','their','them'], `“${pronoun}” shows that the bottle belongs to ${owner}. It is a possessive pronoun.`);
  }
  if (concept === 2) {
    const actionPairs = [['puppy','wiggles'],['astronaut','floats'],['parrot','squawks'],['skater','glides'],['rabbit','hops'],['chef','stirs'],['sailor','waves'],['dragon','snores']];
    if (level === 1) {
      const [subject, action] = actionPairs[variant];
      return item(`In “The ${subject} ${action} happily,” which word shows the action?`, action, [subject, 'happily', 'the'], `“${action}” tells what the ${subject} does. It is the action verb.`);
    }
    const tenseRows = [
      ['Yesterday, Nia ___ a kite.','flew','flies','will fly'],['Today, the puppy ___ in the garden.','plays','played','will play'],['Tomorrow, we ___ a castle.','will build','built','builds'],['Last night, Omar ___ a story.','read','reads','will read'],
      ['Every day, the sun ___ in the east.','rises','rose','will rise'],['Next week, the class ___ a play.','will perform','performed','performs'],['Yesterday, the frogs ___ into the pond.','jumped','jump','will jump'],['Today, I ___ my lunch with a friend.','share','shared','will share']
    ];
    if (level === 2) { const [prompt, answer, a, b] = tenseRows[variant]; return item(prompt, answer, [a,b], `“${answer}” matches the time word in the sentence.`); }
    const futureRows = [
      ['Tomorrow, the team ___ the game.','will win','won','wins'],['Next Saturday, Maya ___ her cousins.','will visit','visited','visits'],['Later, the clouds ___ away.','will float','floated','float'],['In a minute, I ___ the door.','will open','opened','opens'],
      ['Next year, we ___ a new class.','will join','joined','join'],['Soon, the baby birds ___ the nest.','will leave','left','leave'],['Tomorrow morning, Dad ___ pancakes.','will make','made','makes'],['Next month, the museum ___ a dinosaur show.','will have','had','has'],['After lunch, Kai ___ his model rocket.','will launch','launched','launches']
    ];
    const [prompt, answer, a, b] = futureRows[variant]; return item(prompt, answer, [a,b], `“Will ${answer.slice(5)}” tells us the action is going to happen in the future.`);
  }
  if (concept === 3) {
    if (level === 1) {
      const rows = [['The fluffy rabbit hopped.','fluffy','rabbit','hopped'],['A shiny shell rested on the sand.','shiny','shell','rested'],['The brave pilot waved.','brave','pilot','waved'],['A tiny frog sat on a log.','tiny','frog','sat'],['The crunchy apple fell.','crunchy','apple','fell'],['A sleepy dragon yawned.','sleepy','dragon','yawned'],['The colorful kite soared.','colorful','kite','soared'],['A gentle breeze blew.','gentle','breeze','blew']];
      const [sentence, answer, a, b] = rows[variant]; return item(`Which word describes a noun in “${sentence}”?`, answer, [a,b,'quickly'], `“${answer}” describes what the noun is like. It is an adjective.`);
    }
    if (level === 2) {
      const rows = [['The ___ puppy wagged its tail.','playful','playfully','play'],['We saw a ___ rainbow.','bright','brightly','brightness'],['A ___ breeze moved the leaves.','cool','coolly','coolness'],['She wore a ___ hat.','striped','stripedly','stripe'],['The ___ astronaut waved.','cheerful','cheerfully','cheer'],['A ___ turtle crossed the path.','slow','slowly','slowness'],['He found a ___ stone.','smooth','smoothly','smoothness'],['The ___ kitten purred.','tiny','tinily','tininess']];
      const [prompt, answer, a, b] = rows[variant]; return item(prompt, answer, [a,b,'under'], `“${answer}” describes the noun that follows it, so an adjective fits here.`);
    }
    const rows = [['The turtle walked ___.','slowly','slow','slowness'],['The drummer played ___.','loudly','loud','loudness'],['The children laughed ___.','happily','happy','happiness'],['The skater moved ___.','gracefully','graceful','grace'],['The puppy waited ___.','patiently','patient','patience'],['The bird sang ___.','sweetly','sweet','sweetness'],['The robot moved ___.','carefully','careful','care'],['The team worked ___.','together','togetherness','togetherly'],['The rabbit hopped ___.','quickly','quick','quickness']];
    const [prompt, answer, a, b] = rows[variant]; return item(prompt, answer, [a,b,'bright'], `“${answer}” tells how the action happened. It is an adverb.`);
  }
  if (concept === 4) {
    const rows = [
      ['The cat ___ on the mat.','sits','sit'],['My brother ___ his bike.','rides','ride'],['That bird ___ a nest.','builds','build'],['A puppy ___ when it is happy.','wags','wag'],
      ['The chef ___ a tasty soup.','makes','make'],['This train ___ at the station.','stops','stop'],['Our teacher ___ a story.','reads','read'],['The little frog ___ high.','jumps','jump'],
      ['The cats ___ on the mat.','sit','sits'],['My friends ___ their bikes.','ride','rides'],['Those birds ___ nests.','build','builds'],['The puppies ___ when they are happy.','wag','wags'],
      ['The chefs ___ tasty soup.','make','makes'],['These trains ___ at the station.','stop','stops'],['Our teachers ___ stories.','read','reads'],['The frogs ___ high.','jump','jumps'],
      ['The basket of apples ___ on the table.','rests','rest'],['A box of crayons ___ beside the book.','waits','wait'],['The team of dancers ___ together.','practises','practise'],['The flock of birds ___ over the lake.','flies','fly'],
      ['A stack of books ___ near the desk.','stands','stand'],['The bag of marbles ___ very heavy.','is','are'],['My pair of boots ___ by the door.','waits','wait'],['A bunch of grapes ___ in the bowl.','sits','sit'],['The row of houses ___ blue doors.','has','have']
    ];
    const [prompt, answer, alternative] = rows[(level-1)*8+variant]; return item(prompt, answer, [alternative, alternative==='is'?'am':'are', alternative==='sits'?'sit':'sits'], `Find the subject first. The subject here is “${prompt.split(' ___')[0].replace(/^The |^My |^That |^A |^This |^Our |^The little |^Those |^These /,'')}”; the matching verb is “${answer}.”`);
  }
  if (concept === 5) {
    if (level === 1) {
      const rows = [['The moon shines at night.','The moon shines at night.','The moon at night.','Shines at night.','the moon'],['Milo rides his scooter.','Milo rides his scooter.','Milo on his scooter.','Rides the red scooter.','Milo’s scooter'],['A tiny bird sings.','A tiny bird sings.','A tiny bird.','Sings in the tree.','a little bird'],['We baked a cake.','We baked a cake.','After the big party.','Baked a cake.','baking a cake'],['The bell rang loudly.','The bell rang loudly.','When the bell rang.','The loud bell.','the bell'],['Our class planted seeds.','Our class planted seeds.','Our class in the garden.','Planted small seeds.','the class garden'],['A rainbow appeared.','A rainbow appeared.','After the rain shower.','A bright rainbow.','a rainbow'],['The robot can dance.','The robot can dance.','The robot with blue lights.','Can dance so well.','a dancing robot']];
      const [stem, answer, a, b, topic] = rows[variant]; return item(`Which group of words gives a complete thought about ${topic}?`, answer, [a,b,choose(['Beside the old tree.','After the game ended.','With a big smile.','Under the soft blanket.'],variant)], `“${answer}” has a subject and a verb and shares a complete thought.`);
    }
    if (level === 2) {
      const rows = [['The rain stopped, ___ we went outside.','so','because','but'],['I packed my book ___ my pencil.','and','because','under'],['Would you like an apple ___ a pear?','or','so','behind'],['The puppy was tired, ___ it kept playing.','but','because','under'],['We stayed inside ___ the storm was loud.','because','or','on'],['Maya wanted to skate, ___ the path was wet.','but','and','under'],['I can read the map ___ find the trail.','and','because','under'],['The sun came out, ___ the picnic began.','so','or','below']];
      const [prompt, answer, a, b] = rows[variant]; return item(`Choose the best joining word: ${prompt}`, answer, [a,b,'although'], `“${answer}” joins the ideas in a way that makes their meaning clear.`);
    }
    const rows = [['Choose the sentence with correct punctuation.','Milo packed a bag, and he left.','Milo packed a bag he left.','Milo, packed a bag and he left'],['Choose the sentence with correct punctuation.','The rain stopped, so we went out.','The rain stopped so we went out','The rain, stopped so we went out.'],['Choose the sentence with correct punctuation.','I was tired, but I finished my book.','I was tired but, I finished my book.','I was tired I finished my book.'],['Choose the sentence with correct punctuation.','Asha fed the dog, and Ben filled its bowl.','Asha fed the dog Ben filled its bowl.','Asha, fed the dog and Ben filled its bowl.'],['Choose the sentence with correct punctuation.','The bell rang, so the class lined up.','The bell rang so, the class lined up.','The bell rang the class lined up.'],['Choose the sentence with correct punctuation.','We could walk, or we could ride our bikes.','We could walk or, we could ride our bikes.','We could walk we could ride our bikes.'],['Choose the sentence with correct punctuation.','Kai lost his key, but he found it later.','Kai lost his key but, he found it later.','Kai lost his key he found it later.'],['Choose the sentence with correct punctuation.','The lights went out, so we found a torch.','The lights went out so, we found a torch.','The lights went out we found a torch.'],['Choose the sentence with correct punctuation.','I drew a dragon, and my sister colored it.','I drew a dragon and, my sister colored it.','I drew a dragon my sister colored it.']];
    const [prompt, answer, a, b] = rows[variant]; return item(`Add the comma in the right place: “${answer.replace(',', '')}”`, answer, [a,b], `A comma and a joining word connect these two complete ideas clearly.`);
  }
  if (concept === 6) {
    if (level === 1) {
      const rows = [['How bright the moon is','!'],['Where is my blue notebook','?'],['We are going to the park',' .'],['Can the puppy do a trick','?'],['That was an amazing goal','!'],['My sister likes to draw',' .'],['What time does the bus come','?'],['Look at that tall tree','!']];
      const [words, mark] = rows[variant]; const answer = mark.trim();
      return item(`Choose the end mark: “${words}___”`, answer, ['.', '?', '!'].filter(x=>x!==answer), answer==='?'?'A question asks something. End it with a question mark.':answer==='!'?'This sentence shows strong feeling. An exclamation mark fits.':'A statement tells something. End it with a full stop.');
    }
    if (level === 2) {
      const rows = [['maya went to delhi.','Maya went to Delhi.','maya went to Delhi.','Maya went to delhi.'],['we saw the taj mahal.','We saw the Taj Mahal.','we saw the Taj Mahal.','We saw the taj mahal.'],['on monday, ali visited london.','On Monday, Ali visited London.','On monday, ali visited London.','on Monday, Ali visited london.'],['my friend sara lives in mumbai.','My friend Sara lives in Mumbai.','my friend Sara lives in Mumbai.','My friend sara lives in mumbai.'],['the nile is a very long river.','The Nile is a very long river.','the Nile is a very long river.','The nile is a very long river.'],['in april, we will visit paris.','In April, we will visit Paris.','In april, we will visit paris.','in April, we will visit Paris.'],['mr. singh teaches our class.','Mr. Singh teaches our class.','mr. Singh teaches our class.','Mr. singh teaches our class.'],['zoe read a book on friday.','Zoe read a book on Friday.','zoe read a book on Friday.','Zoe read a book on friday.']];
      const [original, answer, a, b] = rows[variant]; return item(`Choose the sentence with capitals fixed: “${original}”`, answer, [a,b,'No capitals are needed.'], 'Begin a sentence with a capital. Names of people, places, and days also begin with capitals.');
    }
    const rows = [['Which list uses commas correctly for a fruit salad?','apples, pears, and plums','apples pears, and plums','apples, pears and, plums'],['Which sentence uses commas correctly?','We packed socks, snacks, and maps.','We packed socks snacks, and maps.','We packed, socks, snacks and maps.'],['Choose the correct contraction for “do not.”',"don't",'doesnt','dont'],['Choose the correct contraction for “we are.”',"we're",'were','werent'],['Choose the correct contraction for “I am.”',"I'm",'Im','Ive'],['Choose the correct contraction for “cannot.”',"can't",'cant','cannt'],['Which list uses commas correctly for a rainbow?','red, blue, and gold','red blue, and gold','red, blue and, gold'],['Choose the correct contraction for “they are.”',"they're",'their','theyve'],['Choose the correct contraction for “she is.”',"she's",'shes','shes’']];
    const [prompt, answer, a, b] = rows[variant]; return item(prompt, answer, [a,b,'No punctuation'], 'Commas separate items in a list. An apostrophe marks the letters left out of a contraction.');
  }
  if (concept === 7) {
    if (level === 1) {
      const rows = [['I wanted to play ___ it started to rain.','but','and','or'],['Would you like grapes ___ strawberries?','or','but','and'],['The puppy barked ___ the doorbell rang.','and','or','under'],['We could draw ___ we could build a model.','or','but','because'],['Mira was hungry ___ she made a sandwich.','so','or','under'],['The path was muddy ___ we wore boots.','so','but','under'],['I wanted to go outside ___ it was raining.','but','or','under'],['We can read a story ___ play a word game.','or','so','under']];
      const [prompt, answer, a, b] = rows[variant]; return item(`Pick the joining word: ${prompt}`, answer, [a,b,'beneath'], `“${answer}” joins the two ideas in this sentence.`);
    }
    if (level === 2) {
      const rows = [['The puppy is hiding ___ the table.','under','because','but'],['We put the books ___ the shelf.','on','so','and'],['The fish swam ___ the cave.','inside','or','because'],['The shoes are ___ the bed.','beside','but','so'],['A butterfly landed ___ my hand.','on','and','because'],['The rabbit hopped ___ the log.','over','or','so'],['The kite flew ___ the trees.','above','but','and'],['The ball rolled ___ the sofa.','behind','because','or']];
      const [prompt, answer, a, b] = rows[variant]; return item(`Choose a word that tells where: ${prompt}`, answer, [a,b,'quickly'], `“${answer}” is a preposition that tells where the ${prompt.includes('puppy')?'puppy':'object'} is.`);
    }
    const rows = [['We wore raincoats ___ it was raining.','because','under','or'],['The bell rang, ___ class began.','so','beneath','because'],['___ the trail was steep, we kept going.','Although','Under','And'],['The puppy wagged its tail ___ it saw Maya.','when','below','or'],['We can play outside ___ the storm has passed.','after','under','but'],['I will read my book ___ I finish my snack.','when','beneath','or'],['The team cheered ___ the runner crossed the line.','when','under','but'],['___ the sun came out, we ate in the garden.','After','Behind','Or'],['I brought an umbrella ___ the clouds looked dark.','because','below','or']];
    const [prompt, answer, a, b] = rows[variant]; return item(`Choose the word that best connects the ideas: ${prompt}`, answer, [a,b,'quickly'], `“${answer}” connects the two ideas and shows their relationship.`);
  }
  return item('Choose the best answer.','yes',['no','maybe','later'],'Keep exploring!');
}

const conceptNames = ['Noun Detectives','Pronoun Substitutes','Verb Time Machine','Adjective & Adverb Studio','Subject–Verb Match','Sentence Builder','Capital & Punctuation Crew','Joining Words & Prepositions'];
const counts = [8,8,9];
const bank: GrammarItem[] = [];
for (let concept=0; concept<conceptNames.length; concept++) {
  for (let level=1; level<=3; level++) {
    for (let variant=0; variant<counts[level-1]; variant++) {
      const draft=makeDraft(concept,level,variant), prompt=draft.prompt;
      const seconds=Math.round(Math.min(75,25+level*6+Math.ceil(prompt.split(/\s+/).length*1.1)));
      bank.push({id:`english-${String(bank.length+1).padStart(3,'0')}`,skill:ENGLISH_GRAMMAR_SKILL_START+concept,level,concept:conceptNames[concept],prompt,answer:draft.answer,options:draft.options,explanation:draft.explanation,seconds,step:concept*3+level});
    }
  }
}

export const ENGLISH_GRAMMAR_QUESTION_BANK: readonly GrammarItem[] = Object.freeze(bank);
export function grammarQuestionFor(skill: number, level: number, previous: string[] = [], step=0) {
  const concept=skill-ENGLISH_GRAMMAR_SKILL_START;
  const candidates=bank.filter(q=>q.skill===skill&&q.level===level);
  const offset=Math.abs((previous.length*7+step*3+Date.now())%Math.max(1,candidates.length));
  const q=[...candidates.slice(offset),...candidates.slice(0,offset)].find(candidate=>!previous.includes(candidate.prompt))??candidates[offset];
  return {skill,level,a:0,b:0,prompt:q.prompt,answer:q.answer,explanation:q.explanation,options:[...q.options],topicId:'english' as const};
}
