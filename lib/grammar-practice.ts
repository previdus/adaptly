import type { Question } from './learning';
import { pickPracticeQuestion } from './practice-pool';

const people = [
  'Ava', 'Ravi', 'Nia', 'Omar', 'Kai', 'Maya', 'Leo', 'Zoe', 'Asha', 'Luca',
  'Mina', 'Ben', 'Sara', 'Ivy', 'Noah', 'Mira', 'Ali', 'Theo', 'Amira', 'Leah'
];

const objects = [
  'kite', 'lantern', 'compass', 'map', 'notebook',
  'backpack', 'shell', 'pencil', 'ruler', 'trophy'
];

const actions = [
  ['pack', 'packs', 'packed'], ['find', 'finds', 'found'],
  ['draw', 'draws', 'drew'], ['lift', 'lifts', 'lifted'],
  ['carry', 'carries', 'carried'], ['open', 'opens', 'opened'],
  ['wash', 'washes', 'washed'], ['hide', 'hides', 'hid'],
  ['take', 'takes', 'took'], ['clean', 'cleans', 'cleaned']
];

const places = ['Delhi', 'Lima', 'Cairo', 'Tokyo', 'Pune', 'Dublin', 'Perth', 'Oslo', 'Paris', 'Rome'];
const colours = ['red', 'blue', 'green', 'gold', 'pink', 'purple', 'silver', 'white', 'orange', 'yellow'];
const pluralForms = [
  ['child', 'children'], ['mouse', 'mice'], ['foot', 'feet'], ['tooth', 'teeth'],
  ['goose', 'geese'],  ['woman', 'women'], ['man', 'men'],
  ['ox', 'oxen'], ['leaf', 'leaves'], ['wolf', 'wolves'], ['knife', 'knives']
];

type Draft = Pick<Question, 'prompt' | 'answer' | 'options' | 'explanation'>;
type Choice = [prompt: string, answer: string, wrong: string[], explanation: string];

function draft(index: number, person: string, object: string, variant: number): Choice {
  const [base, present, past] = actions[variant % actions.length];
  const place = places[variant];
  const colour = colours[variant];
  const inclusive = people.indexOf(person) % 2 === 0;
  const partners = inclusive ? "I" : "my friend";
  const recipients = inclusive ? "me" : "my friend";
  const statement = `${person} packed the ${object}.`;
  const question = `Did ${person} pack the ${object}?`;
  const second = `the ${object} was ready`;
  const complete = `${person} packed the ${object}, and ${second}.`;

  switch (index) {
    case 0: return [`Which word names a thing in “${statement}”?`, object, [person, 'packed', 'the'], 'A noun can name a thing.'];
    case 1: return [`Which word names a specific place in “${person} visits ${place}”?`, place, [person, 'visits'], 'A specific place name is a proper noun.'];
    case 2: {
      const [singular, plural] = pluralForms[variant];
      return [`What is the plural of “${singular}”?`, plural, [singular + 's', singular + 'es'], `More than one ${singular} means ${plural}.`];
    }
    case 3: return [
      `${person} and ${partners} found a ${object}. Which pronoun can replace the subject?`,
      inclusive ? 'we' : 'they', inclusive ? ['they', 'us', 'them'] : ['we', 'us', 'them'],
      'Use “we” if the speaker is part of the subject. Use “they” for other people.'
    ];
    case 4: return [
      `A guide showed ${person} and ${recipients} a ${object}. Which pronoun replaces the two people shown the object?`,
      inclusive ? 'us' : 'them', inclusive ? ['we', 'them', 'they'] : ['we', 'us', 'they'],
      'Use an object pronoun here. “Us” includes the speaker, while “them” refers to other people.'
    ];
    case 5: return [
      `This ${object} belongs to ${person} and ${recipients}. It is ___.`,
      inclusive ? 'ours' : 'theirs', [inclusive ? 'theirs' : 'ours', 'our', 'their'],
      '“Ours” and “theirs” show ownership and can stand on their own.'
    ];
    case 6: return [`Which word tells the action in “${statement}”?`, 'packed', [person, object, 'the'], 'An action verb tells what someone did.'];
    case 7: return [`Yesterday, ${person} ___ the ${object}.`, past, [present, `will ${base}`], '“Yesterday” calls for the past tense.'];
    case 8: return [`Rewrite in the future tense: “${person} ${past} the ${object}.” Tomorrow, ${person} ___ the ${object}.`, `will ${base}`, [past, present], '“Will” followed by the base verb can express future time.'];
    case 9: return [`Which word describes the ${object} in “${person} packed the ${colour} ${object}”?`, colour, [person, 'packed', object], 'An adjective describes a noun.'];
    case 10: return [`Which adjective fits? ${person} carried the ___ ${object}.`, colour, ['carefully', 'beneath', 'carried'], 'Use an adjective before the noun to describe it.'];
    case 11: return [`Which adverb tells how ${person} packed the ${object}?`, 'carefully', ['careful', 'care', 'the'], 'An adverb can tell how an action happened.'];
    case 12: return [`Every day, ${person} ___ the ${object}.`, present, [base], 'A singular third-person subject uses the singular present form.'];
    case 13: return [`${person} and I ___ the ${object} every day.`, base, [present], 'A subject made of two people takes the plural present form.'];
    case 14: return [`${person} is setting up a display. Choose the verb: The pile of ${object}s ___ on the table.`, 'rests', ['rest', 'are resting'], '“Pile” is the singular subject. The words after “of” do not change its number.'];
    case 15: return [`Which is a complete sentence about ${person} and the ${object}?`, statement, [`${person} with the ${object}.`, `After ${person} packed the ${object}.`], 'A complete sentence expresses a whole thought.'];
    case 16: return [`Join these ideas with a word that shows a choice: ${person} could pack the ${object} ___ leave it behind.`, 'or', ['and', 'because', 'so'], '“Or” presents alternatives.'];
    case 17: return [`Which version correctly joins the two complete thoughts about ${person} and the ${object}?`, complete, [`${person} packed the ${object} ${second}.`, `${person}, packed the ${object} and ${second}.`], 'A comma before “and” can join two complete clauses.'];
    case 18:
      if (inclusive) return [
        `Choose the end mark for this statement: “${statement.slice(0, -1)}___”`,
        '.', ['?', ','], 'A statement ends in a full stop.'
      ];
      return [`Choose the end mark: “${question.slice(0, -1)}___”`, '?', ['.', ','], 'A direct question ends in a question mark.'];
    case 19: return [`Fix the capitals: “${person.toLowerCase()} took a ${object} to ${place.toLowerCase()}.”`, `${person} took a ${object} to ${place}.`, [`${person} took a ${object} to ${place.toLowerCase()}.`, `${person.toLowerCase()} took a ${object} to ${place}.`], 'Capitalize the first word and proper names.'];
    case 20: return [`Which sentence correctly shortens “did not”? ${person} did not pack the ${object}.`, `${person} didn't pack the ${object}.`, [`${person} did'nt pack the ${object}.`, `${person} didnt pack the ${object}.`], 'The apostrophe in “didn’t” replaces the missing o in “not.”'];
    case 21: return [`Which word joins these ideas to show a contrast? ${person} wanted to bring the ${object}, ___ forgot it at home.`, 'but', ['and', 'or', 'so'], '“But” signals a contrast.'];
    case 22: return [`Which option tells where? ${person} left the ${object} ___ the desk.`, 'on', ['quickly', 'because', 'but'], '“On” is a preposition that can tell where something is.'];
    default: return [`Which word introduces the reason? ${person} brought the ${object} ___ the class needed it.`, 'because', ['although', 'after', 'unless'], '“Because” introduces a reason.'];
  }
}

function makeDraft(index: number, person: string, object: string, variant: number, slot: number): Draft {
  const [prompt, answer, wrong, explanation] = draft(index, person, object, variant);
  const options = [...wrong];
  options.splice(slot % (options.length + 1), 0, answer);
  return { prompt, answer, options, explanation };
}

const pools = new Map<number, Draft[]>();

export function grammarPractice(skill: number, level: number, previous: string[]): Question {
  const index = (skill - 29) * 3 + level - 1;
  let pool = pools.get(index);
  if (!pool) {
    pool = index === 2
      ? pluralForms.map((_, variant) => makeDraft(index, '', '', variant, variant))
      : people.flatMap((person, i) => objects.map((object, j) =>
          makeDraft(index, person, object, j, i + j)
        ));
    pools.set(index, pool);
  }
  const question = pickPracticeQuestion(pool, previous);
  return { ...question, options: [...question.options!], skill, level, a: 0, b: 0, topicId: 'english' };
}
