import type { CurriculumTopicId } from './curriculum-catalog';
import { worked } from './curriculum-types';

const names = ['Ava', 'Ravi', 'Mina', 'Omar', 'Kai', 'Maya', 'Leo', 'Zoe', 'Asha', 'Luca', 'Ben', 'Sara', 'Ivy', 'Noah', 'Mira', 'Ali', 'Theo', 'Leah', 'Nia', 'Amira'];
const nouns = ['book', 'kite', 'ball', 'drum', 'map', 'box', 'coin', 'hat', 'pen', 'torch', 'bag', 'cup'];
const plural = (noun: string) => noun === 'box' ? 'boxes' : noun + 's';

function articleDraft(concept: number, level: number, name: string, noun: string, index: number) {
  if (concept === 0) {
    const words = level === 1 ? ['book', 'kite', 'ball', 'map', 'cup', 'pen']
      : level === 2 ? ['apple', 'egg', 'umbrella', 'orange', 'insect', 'envelope']
        : ['hour', 'honest person', 'university', 'uniform', 'European visitor', 'one-way ticket'];
    const item = words[Math.floor(index / names.length) % words.length];
    const answer = level === 1 ? 'a' : level === 2 ? 'an' : ['hour', 'honest person'].includes(item) ? 'an' : 'a';
    return worked(`First mention of one unspecified item: ${name} saw ___ ${item}. Choose a or an.`, answer,
      `${answer} ${item}`, 'Use an before a vowel sound and a before a consonant sound. Listen to the first sound, not just the first letter.',
      [answer === 'a' ? 'an' : 'a', 'both a and an', 'neither a nor an']);
  }
  if (concept === 1) {
    const prompt = level === 1 ? `${name} found a ${noun}. ___ ${noun} was blue.`
      : level === 2 ? `There is only one ${noun} on this desk. ${name} picked up ___ ${noun} on this desk.`
        : `${name} has already mentioned a ${noun}. Referring to that same item, ${name} says, "I like ___ ${noun}."`;
    return worked(`Choose the article for the known item: ${prompt}`, 'the', `the ${noun}`,
      'The points to an item the listener can identify, including an item already mentioned or the only item in a specified setting.',
      ['a', 'an', 'no article']);
  }
  if (level === 3) return worked(`Speaking about ${plural(noun)} in general, ${name} says, "___ ${plural(noun)[0].toUpperCase() + plural(noun).slice(1)} can be useful." Which article belongs at the start?`,
    'No article', plural(noun), 'A general plural can stand without an article. The would refer to a particular group, and a or an requires a singular countable noun.',
    ['a', 'an', 'the']);
  return worked(level === 1 ? `No item has been mentioned before. ${name} buys one unspecified ${noun}. Complete: ${name} buys ___ ${noun}.`
    : `${name} bought a ${noun}. Complete the next mention of that same item: ___ ${noun} was useful.`,
    level === 1 ? 'a' : 'The', `${level === 1 ? 'a' : 'The'} ${noun}`,
    'First mention of one unspecified countable item uses a or an. The next mention of that known item uses the.',
    level === 1 ? ['an', 'the', 'no article'] : ['A', 'An', 'No article']);
}

function determinerDraft(concept: number, level: number, name: string, noun: string) {
  if (concept === 0) {
    const answer = level === 1 ? 'This' : level === 2 ? 'These' : 'Those';
    const prompt = level === 1 ? `I am holding one ${noun}. ___ ${noun} belongs to ${name}.`
      : level === 2 ? `The ${plural(noun)} are here in my hands. ___ ${plural(noun)} belong to ${name}.`
        : `The ${plural(noun)} are far away, across the room. ___ ${plural(noun)} belong to ${name}.`;
    return worked(`Choose the demonstrative: ${prompt}`, answer, `${answer} = ${level === 1 ? 'one near' : level === 2 ? 'several near' : 'several far'}`,
      'This and that are singular. These and those are plural. This and these indicate near objects; that and those indicate distant objects.',
      ['This', 'That', 'These', 'Those'].filter(item => item !== answer));
  }
  if (concept === 1) {
    const answer = level === 1 ? 'many' : level === 2 ? 'much' : 'Each';
    const prompt = level === 1 ? `${name} asks, "How ___ ${plural(noun)} are there?"`
      : level === 2 ? `${name} asks, "How ___ water is in the cup?"`
        : `Talking about every item separately, ${name} says, "___ ${noun} needs a label."`;
    return worked(prompt, answer, level === 1 ? `${plural(noun)} are countable` : level === 2 ? 'Water is uncountable here' : `Each + singular ${noun}`,
      'Many goes with plural countable nouns. Much goes with uncountable quantities. Each singles out every member and takes a singular noun.',
      level === 3 ? ['Many', 'Much', 'These'] : [level === 1 ? 'much' : 'many', 'each', 'these']);
  }
  const answer = level === 1 ? 'some' : level === 2 ? 'any' : 'enough';
  const prompt = level === 1 ? `${name} bought ___ ${plural(noun)} yesterday. Choose the ordinary positive quantity word.`
    : level === 2 ? `${name} did not buy ___ ${plural(noun)} yesterday.`
      : `${name} needs three ${plural(noun)} and has exactly three. There are ___ for the task.`;
  return worked(prompt, answer, answer, 'Some is ordinary in positive statements. Any is ordinary in negative statements. Enough means the available amount meets the stated need.',
    level === 3 ? ['too few', 'none', 'one'] : [level === 1 ? 'any' : 'some', 'each', 'this']);
}

function prepositionDraft(concept: number, level: number, name: string, noun: string, index: number) {
  if (concept === 0) {
    const answer = level === 1 ? 'under' : level === 2 ? 'inside' : 'between';
    const prompt = level === 1 ? `${name}'s ${noun} is directly below the table, not touching its top. It is ___ the table.`
      : level === 2 ? `${name} put the ${noun} completely within the closed box. It is ___ the box.`
        : `${name} placed the ${noun} in the gap separating exactly two boxes. It is ___ the two boxes.`;
    return worked(prompt, answer, answer, 'Use the location clue. Under means below, inside means within, and between describes the stated gap separating two objects.',
      ['under', 'inside', 'between', 'above'].filter(item => item !== answer));
  }
  if (concept === 1) {
    const times = [['at', `${1 + index % 12}:30`], ['on', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(index / 20) % 5]], ['in', ['January', 'March', 'May', 'July', 'October'][Math.floor(index / 20) % 5]]];
    const [answer, time] = times[level - 1];
    return worked(`${name} will collect the ${noun} ___ ${time}. Choose the time preposition.`, answer,
      `${answer} ${time}`, 'Use at for a clock time, on for a named day, and in for a month.',
      ['at', 'on', 'in', 'under'].filter(item => item !== answer));
  }
  const answer = level === 1 ? 'into' : level === 2 ? 'across' : 'through';
  const prompt = level === 1 ? `${name} moved the ${noun} from outside to within the box. The ${noun} went ___ the box.`
    : level === 2 ? `${name} carried the ${noun} from one side of the bridge to the other over its surface. ${name} went ___ the bridge.`
      : `${name} carried the ${noun} through a hole in the fence. The ${noun} passed ___ the opening.`;
  return worked(prompt, answer, answer, 'Into indicates entering, across indicates crossing a surface, and through indicates passing within an opening.',
    ['into', 'across', 'through', 'beside'].filter(item => item !== answer));
}

function conjunctionDraft(concept: number, level: number, name: string, noun: string) {
  const answer = concept === 0 ? ['and', 'but', 'or'][level - 1]
    : concept === 1 ? ['because', 'so', 'Although'][level - 1] : ['before', 'after', 'until'][level - 1];
  const prompts = [
    [
      `Add a second action: ${name} packed the ${noun} ___ picked up the bag.`,
      `Show contrast: ${name} wanted to bring the ${noun}, ___ forgot it.`,
      `Offer a choice: ${name} could bring the ${noun} ___ leave it behind.`
    ],
    [
      `Introduce the reason: ${name} brought the ${noun} ___ the class needed it.`,
      `Introduce the result: The class needed a ${noun}, ___ ${name} brought one.`,
      `Show a concession: ___ the ${noun} was heavy, ${name} carried it.`
    ],
    [
      `${name} packed the ${noun} first and left second. Complete: ${name} packed it ___ leaving.`,
      `${name} ate first, then packed the ${noun}. Complete: ${name} packed it ___ eating.`,
      `${name} kept holding the ${noun} up to the moment the teacher arrived. Complete: ${name} held it ___ the teacher arrived.`
    ]
  ];
  const choices = concept === 0 ? ['and', 'but', 'or', 'under']
    : concept === 1 ? ['because', 'so', 'Although', 'under'] : ['before', 'after', 'until', 'because'];
  const reasons = concept === 0 ? ['And adds an idea.', 'But introduces contrast.', 'Or offers alternatives.']
    : concept === 1 ? ['Because introduces the cause.', 'So introduces a result.', 'Although introduces something true despite the contrasting main idea.']
      : ['Before places one event earlier.', 'After places an event later.', 'Until marks the endpoint of a continuing action.'];
  return worked(prompts[concept][level - 1], answer, answer, reasons[level - 1], choices.filter(item => item !== answer));
}

function tenseDraft(concept: number, level: number, name: string, noun: string) {
  if (concept === 0) {
    const answer = ['packs', 'packed', 'will pack'][level - 1];
    const cue = ['Every day', 'Yesterday', 'Tomorrow'][level - 1];
    return worked(`${cue}, ${name} ___ the ${noun}.`, answer, `${cue} → ${answer}`,
      'The time clue tells whether the action is a present habit, a completed past event, or a future event.',
      ['packs', 'packed', 'will pack', 'packing'].filter(item => item !== answer));
  }
  if (concept === 1) {
    const answer = ['is packing', 'was packing', 'will be packing'][level - 1];
    const cue = ['Right now', 'At this time yesterday', 'At this time tomorrow'][level - 1];
    return worked(`${cue}, ${name} ___ the ${noun}. Choose the continuous form.`, answer, answer,
      'Continuous forms use the appropriate form of be plus an ing verb to show an ongoing action.',
      ['is packing', 'was packing', 'will be packing', 'has packed'].filter(item => item !== answer));
  }
  const answer = ['has packed', 'have packed', 'had packed'][level - 1];
  const prompt = level === 1 ? `${name} ___ the ${noun} already. Choose the present perfect form.`
    : level === 2 ? `${name} and I ___ the ${noun} already. Choose the present perfect form.`
      : `By the time the teacher arrived yesterday, ${name} ___ the ${noun}. Choose the past perfect form.`;
  return worked(prompt, answer, answer, 'Perfect forms combine has, have or had with a past participle. Has agrees with a singular third-person subject, have with a plural subject, and had marks the earlier of two past events.',
    ['has packed', 'have packed', 'had packed', 'packing'].filter(item => item !== answer));
}

function subjectDraft(concept: number, level: number, name: string, noun: string) {
  const subject = level === 1 ? name : level === 2 ? `The ${noun}` : `The box of ${plural(noun)}`;
  const predicate = level === 1 ? `packed the ${noun}` : level === 2 ? 'is bright blue' : 'rests on the desk';
  const sentence = concept === 1 ? `${subject} ${predicate}.` : `${subject} rests on the desk.`;
  if (concept === 0) return worked(`Find the complete subject in “${sentence}” (${name}'s classroom).`, subject,
    `[${subject}] rests on the desk`, 'The subject tells who or what the sentence is about. Keep its describing phrase attached.',
    ['rests on the desk', 'on the desk', 'the desk']);
  if (concept === 1) return worked(`Find the complete predicate in “${sentence}” (${name}'s classroom).`, predicate,
    `${subject} [${predicate}]`, 'The predicate begins with the main verb and tells what the subject does or is.',
    [subject, 'the desk', 'bright']);
  if (level === 1) return worked(`Choose the subject that completes the sentence: ___ packed the ${noun}.`, name,
    `${name} → packed the ${noun}`, 'The subject names who does the action. A location or time phrase cannot replace that subject.',
    ['Quickly', 'After lunch', 'Under the desk']);
  if (level === 2) return worked(`Complete the subject with a predicate: The ${noun} ___. (${name}'s story)`, 'fell off the desk',
    `The ${noun} → fell off the desk`, 'A predicate needs a main verb and tells what the subject did or was.',
    [`near ${name}`, 'on the desk', 'after lunch']);
  const answer = `After lunch, ${name} packed the ${noun}.`;
  return worked(`Choose the complete sentence about ${name} and the ${noun}.`, answer, answer,
    'A complete sentence has a subject and a main predicate. An after clause alone leaves the reader waiting.',
    [`${name} with the ${noun}.`, `After ${name} packed the ${noun}.`, `The ${noun} on the desk.`]);
}

function sentenceTypeDraft(concept: number, level: number, name: string, noun: string) {
  if (concept === 0) {
    const answer = ['Statement', 'Question', 'Command'][level - 1];
    const sentence = [`${name} packed the ${noun}.`, `Did ${name} pack the ${noun}?`, `${name}, pack the ${noun}.`][level - 1];
    return worked(`What is the purpose of “${sentence}”?`, answer, sentence,
      'A statement tells, a question asks, and a command directs someone to do something.',
      ['Statement', 'Question', 'Command', 'Exclamation'].filter(item => item !== answer));
  }
  if (concept === 1) {
    const answer = level === 1 ? `Did ${name} pack the ${noun}?` : level === 2 ? `${name}, could you please pack the ${noun}?` : `What a beautiful ${noun}!`;
    return worked(`Choose ${level === 1 ? 'the question about whether the packing happened' : level === 2 ? 'the polite request to pack the item' : 'an exclamation about the item'}. The person is ${name} and the item is a ${noun}.`,
      answer, answer, 'Choose the wording that serves the requested purpose and uses the appropriate end mark.',
      [`${name} packed the ${noun}.`, `The ${noun} is on the desk.`, `${name} is here.`]);
  }
  const sentence = level === 1 ? `${name} packed the ${noun}.`
    : level === 2 ? `${name} packed the ${noun}, and the teacher checked the bag.`
      : `After ${name} packed the ${noun}, the teacher checked the bag.`;
  const answer = ['Simple', 'Compound', 'Complex'][level - 1];
  return worked(`Classify the structure of “${sentence}”`, answer, sentence,
    'A simple sentence has one independent clause. A compound sentence joins independent clauses. A complex sentence combines a dependent clause and an independent clause.',
    ['Simple', 'Compound', 'Complex', 'Fragment'].filter(item => item !== answer));
}

function possessiveDraft(concept: number, level: number, name: string, noun: string) {
  if (concept === 0) {
    const owner = level === 1 ? name : 'the teacher';
    const answer = level === 1 ? `${name}'s ${noun}` : `the teacher's ${noun}`;
    return worked(`The ${noun} belongs to ${owner}. Choose the possessive phrase.`, answer, answer,
      'For one owner, add apostrophe s to the owner noun. A plain s would make a plural instead of showing ownership.',
      level === 1 ? [`${name}s ${noun}`, `${name}s' ${noun}`, `${name} ${noun}`] : [`the teachers ${noun}`, `the teachers' ${noun}`, `the teacher ${noun}`]);
  }
  if (concept === 1) {
    const irregular = level === 2;
    const owner = irregular ? 'children' : 'teachers';
    const answer = irregular ? `the children's ${noun}` : `the teachers' ${noun}`;
    return worked(`In ${name}'s story, one ${noun} belongs jointly to several ${owner}. Choose the possessive phrase.`, answer, answer,
      irregular ? 'Children is already plural without an s, so add apostrophe s.' : 'Teachers already ends in the plural s, so put the apostrophe after that s.',
      irregular ? [`the childrens ${noun}`, `the childrens' ${noun}`, `the child ${noun}`] : [`the teacher's ${noun}`, `the teachers ${noun}`, `the teacher ${noun}`]);
  }
  const answer = level === 1 ? 'its' : level === 2 ? 'their' : 'theirs';
  const prompt = level === 1 ? `${name} says the robot owns a ${noun}. The robot packed ___ ${noun}. Choose the possessive.`
    : level === 2 ? `${name} and a friend own a ${noun}. They packed ___ ${noun}.`
      : `${name} and a friend own the ${noun}. The ${noun} is ___.`;
  return worked(prompt, answer, answer, 'Its is possessive without an apostrophe. Their comes before a noun, while theirs stands on its own.',
    level === 1 ? ["it's", 'it', 'they'] : level === 2 ? ['theirs', 'they', 'them'] : ['their', 'they', 'them']);
}

function speechDraft(concept: number, level: number, name: string, noun: string) {
  const spoken = `I packed the ${noun}.`;
  if (concept === 0 && level === 1) return worked(`${name} said, “${spoken}” Which words did ${name} actually speak?`, spoken,
    `“${spoken}”`, 'Speech marks surround the speaker’s exact words. The reporting clause tells who spoke.',
    [`${name} said`, 'said', `${name} said, ${spoken}`]);
  if (concept === 0) {
    const answer = `“${spoken}”`;
    return worked(`Put speech marks around ${name}'s spoken sentence and use its starting capital: ${spoken.toLowerCase()}`, answer,
      answer, 'Enclose only the spoken sentence, begin it with a capital, and keep its full stop inside the closing speech mark.',
      [`“${spoken.toLowerCase()}”`, `“I” packed the ${noun}.`, `I packed “the ${noun}”.`]);
  }
  if (concept === 1) {
    const quote = level === 1 ? `I packed the ${noun}` : level === 2 ? `Where is the ${noun}` : `What a lovely ${noun}`;
    const mark = level === 1 ? ',' : level === 2 ? '?' : '!';
    const answer = `“${quote}${mark}” said ${name}.`;
    return worked(`Choose correct direct-speech punctuation for ${name}'s ${level === 1 ? 'statement' : level === 2 ? 'question' : 'exclamation'}: ${quote}`, answer,
      answer, 'Before a following reporting clause, a statement takes a comma inside its speech marks. A question or exclamation keeps its own end mark inside the marks.',
      [`“${quote}”${mark} said ${name}.`, `“${quote}.” Said ${name}.`, `${quote}${mark} said ${name}.`]);
  }
  if (level === 2) {
    const quote = `Where is the ${noun}?`;
    const answer = `${name} asked, “${quote}”`;
    return worked(`Choose the direct question with its question mark inside the speech marks. The speaker is ${name}.`, answer, answer,
      'When a quoted question follows a reporting clause, put the reporting comma before the opening speech mark and the question mark inside the closing mark.',
      [`${name} asked, “Where is the ${noun}”?`, `${name} asked “${quote}”`, `${name} asked, “Where is the ${noun}.”`]);
  }
  const answer = `${name} said, “${spoken}”`;
  return worked(level === 1
    ? `Choose the correctly punctuated reporting clause first: ${name} said the exact words “${spoken}”`
    : `Which option is a direct quotation of ${name}'s exact words “${spoken}”, rather than a reported version?`, answer,
    answer, 'Use a comma after the reporting clause, then put the exact spoken words and their end mark inside speech marks.',
    [`${name} said “${spoken}”`, `${name} said, “I packed the ${noun}”.`, `${name} said that the ${noun} was packed.`]);
}

function editingDraft(concept: number, level: number, name: string, noun: string) {
  if (concept === 0) {
    const answer = level === 1 ? `${name} packed the ${noun}.` : level === 2 ? `${name} packs the ${noun} every day.` : `Yesterday, ${name} took the ${noun}.`;
    const wrong = level === 1 ? `${name.toLowerCase()} packed the ${noun}.` : level === 2 ? `${name} pack the ${noun} every day.` : `Yesterday, ${name} taked the ${noun}.`;
    return worked(`Fix the one error: “${wrong}”`, answer, answer,
      level === 1 ? 'Start the sentence and the person’s name with a capital.' : level === 2 ? 'A singular third-person subject takes packs in the simple present.' : 'The irregular past tense of take is took.',
      [wrong, `${name} packing the ${noun}.`, `The ${noun} by ${name}.`]);
  }
  const answer = concept === 1 && level === 1 ? `Yesterday, ${name} packed the ${noun} and carried it home.`
    : concept === 1 && level === 2 ? `${name} and I found the ${noun}. We carried it home.`
      : concept === 1 ? `${name} packed the ${noun}.`
        : level === 1 ? `${name} packed the ${noun}.` : level === 2 ? `${name} packs the ${noun}.` : `${name}'s ${noun} is here.`;
  const original = concept === 1 && level === 1 ? `Yesterday, ${name} packed the ${noun} and carries it home.`
    : concept === 1 && level === 2 ? `${name} and I found the ${noun}. Us carried it home.`
      : concept === 1 ? `${name} packed the the ${noun}.`
        : level === 1 ? `${name.toLowerCase()} packed the ${noun}` : level === 2 ? `${name.toLowerCase()} pack the ${noun}.` : `${name.toLowerCase()}s ${noun} is here.`;
  return worked(`Choose the corrected passage: “${original}”`, answer, answer,
    concept === 1 ? 'Keep the time reference and pronoun role consistent, and remove accidental repetition.' : 'Check sentence-start capitals, agreement and apostrophes in turn.',
    [original, `The ${noun} by ${name}.`, `After ${name} packed the ${noun}.`]);
}

function adjectiveDraft(concept: number, level: number, name: string, noun: string, index: number) {
  const row = Math.floor(index / names.length) % 6;
  if (concept === 0) {
    const adjective = level === 1 ? ['red', 'blue', 'green', 'gold', 'pink', 'white'][row] : ['small', 'tiny', 'large', 'huge', 'little', 'big'][row];
    const sentence = level === 3 ? `${name}'s ${noun} is ${adjective}.` : `${name} carried the ${adjective} ${noun}.`;
    return worked(`Which word describes the ${noun} in “${sentence}”?`, adjective, `${adjective} → ${noun}`,
      'An adjective describes a noun. It can stand before the noun or follow a linking verb such as is.',
      [name, noun, level === 3 ? 'is' : 'carried']);
  }
  const rows = concept === 1
    ? level === 1 ? [['small', 'smaller'], ['large', 'larger'], ['light', 'lighter'], ['soft', 'softer'], ['bright', 'brighter'], ['dark', 'darker']]
      : level === 2 ? [['colourful', 'more colourful'], ['beautiful', 'more beautiful'], ['expensive', 'more expensive'], ['useful', 'more useful'], ['delicate', 'more delicate'], ['interesting', 'more interesting']]
        : [['good', 'better'], ['bad', 'worse'], ['far', 'farther']]
    : level === 1 ? [['small', 'smallest'], ['large', 'largest'], ['light', 'lightest'], ['soft', 'softest'], ['bright', 'brightest'], ['dark', 'darkest']]
      : level === 2 ? [['colourful', 'most colourful'], ['beautiful', 'most beautiful'], ['expensive', 'most expensive'], ['useful', 'most useful'], ['delicate', 'most delicate'], ['interesting', 'most interesting']]
        : [['good', 'best'], ['bad', 'worst'], ['far', 'farthest']];
  const [base, answer] = rows[row % rows.length];
  return worked(`For ${name}'s ${noun}, choose the ${concept === 1 ? 'comparative to compare two' : 'superlative to compare three or more'} form of “${base}”.`, answer,
    `${base} → ${answer}`, concept === 1 ? 'Comparatives compare two. Some take er, some use more, and irregular forms change the word.' : 'Superlatives identify the greatest degree in a group. Some take est, some use most, and others are irregular.',
    [base, `${base}ly`, concept === 1 ? `most ${base}` : `more ${base}`]);
}

function adverbDraft(concept: number, level: number, name: string, noun: string) {
  if (concept === 0) {
    const answer = level === 3 ? 'well' : 'carefully';
    const sentence = level === 1 ? `${name} packed the ${noun} carefully.` : `${name} packed the ${noun} ___.`;
    return worked(level === 1 ? `Which word tells how in “${sentence}”?` : `Choose the adverb: ${sentence}${level === 3 ? ' It means the task was done successfully.' : ''}`,
      answer, `${answer} → packed`, 'An adverb describes the action. Carefully tells how. Well, rather than the adjective good, describes doing something successfully.',
      level === 3 ? ['good', 'goodness', 'the'] : ['careful', 'care', 'the']);
  }
  if (concept === 1) {
    const answer = level === 1 ? 'Yesterday' : level === 2 ? 'often' : `${name} often packs the ${noun}.`;
    return worked(level === 1 ? `Which word tells when in “Yesterday, ${name} packed the ${noun}”?`
      : level === 2 ? `Which word tells how frequently in “${name} often packs the ${noun}”?`
        : `Put “often” before the main verb in “${name} packs the ${noun}”.`, answer,
      String(answer), 'Time adverbs tell when. Frequency adverbs tell how often and usually go before the main verb in a simple statement.',
      level === 3 ? [`Often packs ${name} the ${noun}.`, `${name} packs often the ${noun}.`, `${name} the often packs ${noun}.`] : [name, 'packs', noun]);
  }
  const answer = ['very', 'too', 'almost'][level - 1];
  const sentence = level === 1 ? `${name}'s ${noun} is ___ bright. Choose the word meaning intensely bright, without saying it is excessive.`
    : level === 2 ? `${name} cannot lift the ${noun} because it is ___ heavy. Choose the word meaning heavier than can be managed.`
      : `${name} has ___ finished packing the ${noun}, but a little remains. Choose the word meaning nearly.`;
  return worked(sentence, answer, answer, 'Very strengthens a description, too signals more than the situation allows, and almost means nearly but not completely.',
    ['very', 'too', 'almost', 'under'].filter(item => item !== answer));
}

export function curriculumEnglishDraft(topic: CurriculumTopicId, concept: number, level: number, index: number) {
  const name = names[index % names.length];
  const noun = nouns[Math.floor(index / names.length) % nouns.length];
  switch (topic) {
    case 'english-articles': return articleDraft(concept, level, name, noun, index);
    case 'english-determiners': return determinerDraft(concept, level, name, noun);
    case 'english-prepositions': return prepositionDraft(concept, level, name, noun, index);
    case 'english-conjunctions': return conjunctionDraft(concept, level, name, noun);
    case 'english-tenses': return tenseDraft(concept, level, name, noun);
    case 'english-subject-predicate': return subjectDraft(concept, level, name, noun);
    case 'english-sentence-types': return sentenceTypeDraft(concept, level, name, noun);
    case 'english-possessives': return possessiveDraft(concept, level, name, noun);
    case 'english-direct-speech': return speechDraft(concept, level, name, noun);
    case 'english-editing': return editingDraft(concept, level, name, noun);
    case 'english-adjectives': return adjectiveDraft(concept, level, name, noun, index);
    case 'english-adverbs': return adverbDraft(concept, level, name, noun);
    default: throw new Error('No English generator registered for ' + topic);
  }
}
