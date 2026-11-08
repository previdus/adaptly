import type { Question } from './learning';
import { pickPracticeQuestion } from './practice-pool';

export const extendedMathTopics = [
  {id:'place-value', name:'Place value & number sense', icon:'🔢', concepts:['Place value','Compare numbers','Round and estimate']},
  {id:'fractions', name:'Fractions', icon:'🍕', concepts:['Equal parts','Equivalent fractions','Add like fractions']},
  {id:'decimals', name:'Decimals', icon:'🔬', concepts:['Decimal place value','Compare decimals','Add and subtract decimals']},
  {id:'percentages', name:'Percentages', icon:'💯', concepts:['Out of one hundred','Percent of an amount','Percentage change']},
  {id:'money', name:'Money & shopping', icon:'🛒', concepts:['Count money','Work out change','Unit prices and budgets']},
  {id:'measurement', name:'Measurement', icon:'📏', concepts:['Length conversions','Mass conversions','Capacity conversions']},
  {id:'time', name:'Time & calendars', icon:'🕒', concepts:['Hours and minutes','Elapsed time','Days and weeks']},
  {id:'geometry', name:'Shapes & angles', icon:'📐', concepts:['Polygon sides','Turns and angles','Triangle angles']},
  {id:'area-volume', name:'Perimeter, area & volume', icon:'🧊', concepts:['Rectangle perimeter','Rectangle area','Cuboid volume']},
  {id:'data', name:'Data handling', icon:'📊', concepts:['Read a table','Compare data','Find the mean']},
  {id:'patterns', name:'Patterns & missing numbers', icon:'🧩', concepts:['Growing sequences','Missing terms','Simple equations']},
  {id:'ratio', name:'Ratio & proportion', icon:'⚖️', concepts:['Understand a ratio','Share in a ratio','Scale a recipe']},
  {id:'profit-loss', name:'Profit, loss & discounts', icon:'🏷️', concepts:['Profit and loss amounts','Profit and loss percentages','Discounts and sale prices']},
  {id:'speed', name:'Speed, distance & time', icon:'🚲', concepts:['Distance travelled','Average speed','Journey time']},
  {id:'interest', name:'Simple interest', icon:'🏦', concepts:['One year of interest','Interest over time','Final savings balance']},
  {id:'probability', name:'Probability', icon:'🎲', concepts:['Favourable outcomes','Probability as a fraction','Complementary probability']}
] as const;

export type ExtendedMathTopic = (typeof extendedMathTopics)[number]['id'];
export const isExtendedMathTopic = (id: string | undefined): id is ExtendedMathTopic =>
  extendedMathTopics.some(topic => topic.id === id);

type Draft = {prompt: string; answer: string; work: string; wrong?: string[]};
const format = (value: number) => String(Math.round(value * 10000) / 10000);
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
const fraction = (a: number, b: number) => {
  const divisor = gcd(a, b);
  return b / divisor === 1 ? String(a / divisor) : `${a / divisor}/${b / divisor}`;
};
const make = (prompt: string, answer: number | string, work: string, wrong?: string[]): Draft =>
  ({prompt, answer: typeof answer === 'number' ? format(answer) : answer, work, wrong});

function buildDraft(topic: ExtendedMathTopic, concept: number, level: number, x: number, y: number): Draft {
  const scale = 10 ** (level - 1);
  const a = x * scale;
  const b = y;
  switch (topic) {
    case 'place-value': {
      const digit = y % 10;
      const n = a * 100 + digit * 10 + 7;
      if (concept === 0) return make(`In ${n}, what is the value of the digit ${digit} in the tens place?`, digit * 10, `The tens place is worth ten per unit. Multiply ${digit} by 10 to get ${digit * 10}.`);
      if (concept === 1) return make(`Which number is greater: ${a * 10 + y} or ${a * 10 + y + level}?`, a * 10 + y + level, 'Compare the digits from left to right. The shared prefix is equal; compare the remaining value.');
      const unit = 10 ** level;
      return make(`Round ${x * unit + y * (unit / 10)} to the nearest ${unit}.`, Math.round((x * unit + y * unit / 10) / unit) * unit, `Look at the place just to the right of the rounding place. Five or more rounds up; otherwise round down. The rounding unit is ${unit}.`);
    }
    case 'fractions': {
      const denominator = x + y + level;
      const numerator = y;
      if (concept === 0) return make(`A strip has ${denominator} equal parts. ${numerator} are shaded. What fraction is shaded? Choose simplest form.`, fraction(numerator, denominator), `Put shaded parts over all equal parts: ${numerator}/${denominator}. Divide both numbers by their greatest shared factor, ${gcd(numerator, denominator)}.`, [fraction(numerator + 1, denominator), fraction(denominator - numerator, denominator), fraction(numerator, denominator + 1)]);
      if (concept === 1) return make(`Complete the equivalent fraction: ${numerator}/${denominator} = □/${denominator * (level + 1)}.`, numerator * (level + 1), `The denominator was multiplied by ${level + 1}. Multiply the numerator by the same number: ${numerator} × ${level + 1}.`);
      return make(`Add ${x}/${denominator * 2} + ${y}/${denominator * 2}. Choose simplest form.`, fraction(x + y, denominator * 2), `The equal-sized parts have the same denominator. Add the numerators: ${x} + ${y} = ${x + y}. Keep denominator ${denominator * 2}, then simplify.`, [fraction(x + y, denominator * 4), fraction(x, denominator * 2), fraction(x + y + 1, denominator * 2)]);
    }
    case 'decimals': {
      const divisor = 10 ** Math.min(level, 2);
      if (concept === 0) return make(`Write ${x * 10 + y} ${divisor === 10 ? 'tenths' : 'hundredths'} as a decimal.`, (x * 10 + y) / divisor, `One whole has ${divisor} of these parts. Divide ${x * 10 + y} by ${divisor}, keeping each digit in its place.`);
      if (concept === 1) return make(`Which is larger: ${format(x / divisor)} or ${format((x + y) / divisor)}?`, (x + y) / divisor, 'Line up the decimal points and compare digits from left to right. Add trailing zeros if needed.');
      return make(`Calculate ${format(x / divisor)} ${level === 3 ? '−' : '+'} ${format(y / divisor)}.`, (level === 3 ? x - y : x + y) / divisor, 'Line up the decimal points. Add or subtract the matching places, then keep the decimal point in the same column.');
    }
    case 'percentages': {
      const percent = y * 5;
      const amount = x * 20 * level;
      if (concept === 0) return make(`Out of 100 counters, ${x * 2} are blue and ${y} are red. What percentage are blue? Give the number before %.`, x * 2, 'Percent means out of one hundred. When the total is 100, the selected count is the percentage.');
      if (concept === 1) return make(`What is ${percent}% of ${amount}?`, amount * percent / 100, `First find 1%: ${amount} ÷ 100. Then multiply that by ${percent}.`);
      const increase = level !== 2;
      return make(`A price is ${amount}. It ${increase ? 'increases' : 'decreases'} by ${percent}%. What is the new price?`, amount * (1 + (increase ? 1 : -1) * percent / 100), `The change is ${percent}/100 × ${amount} = ${amount * percent / 100}. ${increase ? 'Add' : 'Subtract'} that change ${increase ? 'to' : 'from'} the original price.`);
    }
    case 'money': {
      const price = x * level + y / 10;
      if (concept === 0) return make(`You have ${x} coins worth ₹${level} each and ${y} coins worth ₹2 each. How many rupees altogether?`, x * level + y * 2, 'Multiply each coin value by its count, then add the two amounts.');
      if (concept === 1) return make(`An item costs ₹${format(price)}. You pay ₹${x * level + 10}. How many rupees change should you receive?`, 10 - y / 10, `Subtract the price from the payment: ${x * level + 10} − ${format(price)}.`);
      return make(`A pack of ${y} notebooks costs ₹${x * y * level}. What is the price of one notebook in rupees?`, x * level, `Divide the total cost by the number of identical notebooks: ${x * y * level} ÷ ${y}.`);
    }
    case 'measurement': {
      const units = [['metres','centimetres',100],['kilograms','grams',1000],['litres','millilitres',1000]] as const;
      const [large, small, factor] = units[concept];
      const value = level === 1 ? x : x + y / 10;
      return level === 3
        ? make(`Convert ${format(value * factor)} ${small} to ${large}.`, value, `There are ${factor} ${small} in one ${large.slice(0,-1)}. Divide ${format(value * factor)} by ${factor}.`)
        : make(`Convert ${value} ${large} plus ${y} ${small} to ${small}.`, value * factor + y, `Multiply ${value} by ${factor}, then add the extra ${y} ${small}.`);
    }
    case 'time': {
      if (concept === 0) return make(`Convert ${x * level} hours and ${y * 3} minutes to minutes.`, x * level * 60 + y * 3, 'Each hour has 60 minutes. Multiply the hours by 60 and add the extra minutes.');
      if (concept === 1) {
        const start = (8 + level) * 60 + y * 3;
        const duration = x * level;
        const finish = start + duration;
        const clock = (minutes: number) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
        return make(`A lesson starts at ${clock(start)} and ends at ${clock(finish)} on the same day. How many minutes does it last?`, duration, `Convert both times to minutes after midnight: ${finish} and ${start}. Subtract finish minus start.`);
      }
      return make(`How many days are in ${x * level} weeks and ${y} extra days?`, x * level * 7 + y, 'Each week has seven days. Multiply the weeks by seven and add the extra days.');
    }
    case 'geometry': {
      if (concept === 0) return make(`A regular polygon has ${x + level} sides, each ${y} cm long. How many vertices does it have?`, x + level, 'A polygon has one corner, or vertex, for each side. Side length does not change the number of vertices.');
      if (concept === 1) return make(`An angle turns ${x * 2} degrees, then another ${y} degrees in the same direction. How many more degrees make a ${level === 1 ? 'right angle' : 'straight angle'}?`, (level === 1 ? 90 : 180) - (x * 2 + y), `A ${level === 1 ? 'right' : 'straight'} angle is ${level === 1 ? 90 : 180} degrees. Subtract the given angle.`);
      return make(`A triangle has angles ${x * 2}° and ${y * 3 + level}°. What is its third angle in degrees?`, 180 - x * 2 - y * 3 - level, 'The interior angles of a triangle add to 180 degrees. Add the two known angles, then subtract from 180.');
    }
    case 'area-volume': {
      if (concept === 0) return make(`A rectangle is ${a} cm long and ${b} cm wide. What is its perimeter in cm?`, 2 * (a + b), `The boundary has two lengths and two widths. Calculate 2 × (${a} + ${b}).`);
      if (concept === 1) return make(`A rectangle is ${a} cm long and ${b} cm wide. What is its area in square cm?`, a * b, `Count equal rows of unit squares. Area = length × width = ${a} × ${b}.`);
      return make(`A cuboid measures ${x} cm by ${y} cm by ${level + 1} cm. What is its volume in cubic cm?`, x * y * (level + 1), 'Multiply length by width to find one layer, then multiply by the height to count every layer.');
    }
    case 'data': {
      if (concept === 0) return make(`Books read — Class A: ${a}; Class B: ${y * level}; Class C: ${a + y}. How many did Class B read?`, y * level, 'Find the row labelled Class B. Read its value without combining it with the other rows.');
      if (concept === 1) return make(`A survey records ${a + y} votes for apples and ${y} for pears. How many more votes did apples receive?`, a, `Find the difference: ${a + y} − ${y}.`);
      return make(`Find the mean of ${x * level}, ${x * level + y}, and ${x * level + 2 * y}.`, x * level + y, 'Add the three values and divide by three. The middle of these equally spaced values is their mean.');
    }
    case 'patterns': {
      const jump = y * level;
      if (concept === 0) return make(`Continue the pattern: ${a}, ${a + jump}, ${a + 2 * jump}, □.`, a + 3 * jump, `Each number increases by ${jump}. Add ${jump} to ${a + 2 * jump}.`);
      if (concept === 1) return make(`Fill the gap: ${a}, □, ${a + 2 * jump}, ${a + 3 * jump}.`, a + jump, `The gap between the first and third terms covers two equal jumps. Half of ${2 * jump} is ${jump}.`);
      return make(`Solve ${y} × n + ${level} = ${x * y + level}. What is n?`, x, `Undo the addition first, subtracting ${level}, then divide by ${y}.`);
    }
    case 'ratio': {
      if (concept === 0) return make(`Red and blue beads are in the ratio ${x}:${y}. There are ${y * level} blue beads. How many are red?`, x * level, `Blue has ${y} parts. Each part is worth ${level}. Red has ${x} parts, so multiply ${x} by ${level}.`);
      if (concept === 1) return make(`Share ${(x + y) * (level + 1)} tokens in the ratio ${x}:${y}. How many go to the first share?`, x * (level + 1), `There are ${x + y} parts altogether. Divide the total by that to get ${level + 1} per part, then multiply by ${x}.`);
      return make(`A recipe for ${y} people uses ${x * y} g of flour. How many grams are needed for ${y * (level + 1)} people?`, x * y * (level + 1), `The new number of people is ${level + 1} times the old number. Multiply the flour by that same scale factor.`);
    }
    case 'profit-loss': {
      const cost = x * 100 * level;
      const rate = y * 5;
      if (concept === 0) return make(`An item costs ₹${cost} and sells for ₹${cost + (level === 2 ? -1 : 1) * y * 10}. What is the ${level === 2 ? 'loss' : 'profit'} in rupees?`, y * 10, level === 2 ? 'Selling below cost creates a loss. Subtract selling price from cost price.' : 'Selling above cost creates a profit. Subtract cost price from selling price.');
      if (concept === 1) return make(`An item costs ₹${cost} and sells for ₹${format(cost * (1 + rate / 100))}. What is the profit percentage? Give the number before %.`, rate, `Profit is ${cost * rate / 100}. Divide profit by the original cost ${cost}, then multiply by 100.`);
      return make(`A marked price of ₹${cost} has a ${rate}% discount. What is the sale price in rupees?`, cost * (1 - rate / 100), `The discount is ${rate}/100 × ${cost} = ${cost * rate / 100}. Subtract that from the marked price.`);
    }
    case 'speed': {
      if (concept === 0) return make(`A cyclist travels at ${x * level} km/h for ${y} hours. How far in km?`, x * level * y, 'Distance equals speed multiplied by time. The time is already in hours, matching km per hour.');
      if (concept === 1) return make(`A vehicle travels ${x * y * level} km in ${y} hours. What is its average speed in km/h?`, x * level, 'Average speed equals total distance divided by total time.');
      return make(`A vehicle travels ${x * y * level} km at ${y * level} km/h. How long is the journey in hours?`, x, 'Time equals distance divided by speed. Kilometres divided by kilometres per hour gives hours.');
    }
    case 'interest': {
      const principal = x * 100 * level;
      const years = concept === 0 ? 1 : level + 1;
      const interest = principal * y * years / 100;
      return make(`₹${principal} earns ${y}% simple interest per year for ${years} year(s). What is the ${concept === 2 ? 'final balance' : 'interest earned'} in rupees?`, concept === 2 ? principal + interest : interest, `Simple interest = principal × annual rate × years ÷ 100 = ${principal} × ${y} × ${years} ÷ 100 = ${interest}. ${concept === 2 ? 'Add the original principal to the interest for the final balance.' : 'This is interest only; the original principal is separate.'}`);
    }
    case 'probability': {
      const red = x * level;
      const blue = y;
      const total = red + blue;
      if (concept === 0) return make(`A bag holds ${red} red counters and ${blue} blue counters. How many outcomes give a red counter when one counter is chosen?`, red, 'Each red counter is one favourable outcome. Count the red counters, not all the counters.');
      const selected = concept === 1 ? red : blue;
      return make(`A bag holds ${red} red counters and ${blue} blue counters. All counters are equally likely. What is the probability of ${concept === 1 ? 'red' : 'not red'}? Choose simplest form.`, fraction(selected, total), `There are ${total} equally likely outcomes, and ${selected} are favourable. Probability = favourable ÷ total = ${selected}/${total}, simplified.`, [fraction(selected, total + 1), fraction(selected + 1, total), fraction(selected, total + 2)]);
    }
  }
}

export function extendedQuestion(topic: ExtendedMathTopic, concept: number, level: number, index: number): Question {
  const x = 12 + index % 20;
  const y = 2 + Math.floor(index / 20);
  const draft = buildDraft(topic, concept, level, x, y);
  const choices = new Set([draft.answer, ...(draft.wrong ?? [])]);
  let offset = 1;
  while (choices.size < 4) {
    const value = Number(draft.answer);
    choices.add(Number.isFinite(value) ? format(value + offset) : `Not enough information${offset === 1 ? '' : ' — check the total'}`);
    offset++;
  }
  const options = [...choices].slice(0, 4);
  const answerIndex = options.indexOf(draft.answer);
  options.splice(answerIndex, 1);
  options.splice(index % 4, 0, draft.answer);
  return {
    skill: 37 + extendedMathTopics.findIndex(item => item.id === topic) * 3 + concept,
    topicId: topic, level, a: x, b: y, prompt: draft.prompt,
    answer: draft.answer, options,
    explanation: `The answer is ${draft.answer}. ${draft.work} Check that the result uses the unit requested in the question.`
  };
}

const pools = new Map<string, Question[]>();
export function extendedPractice(topic: ExtendedMathTopic, skill: number, level: number, previous: string[]) {
  const concept = (skill - 37) % 3;
  const key = `${topic}:${concept}:${level}`;
  const pool = pools.get(key) ?? Array.from({length:200}, (_, i) => extendedQuestion(topic, concept, level, i));
  pools.set(key, pool);
  return { ...pickPracticeQuestion(pool, previous) };
}
