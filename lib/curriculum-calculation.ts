import { worked, fractional, decimal } from './curriculum-types';

export function signedDraft(topic: 'negative-numbers' | 'temperature', concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    if (topic === 'negative-numbers' && level === 3) return worked(`How far is −${x} from zero?`, x,
      `|−${x}| = ${x}`, 'Distance from zero is positive even when the direction is negative.');
    const a = topic === 'temperature' && level === 1 ? x : -x;
    const candidate = level === 1 ? (topic === 'temperature' ? y : 0) : level === 2 ? -y : y;
    const b = candidate === a ? candidate + 1 : candidate;
    return worked(topic === 'temperature' ? `Which is warmer, ${a}°C or ${b}°C? Give the temperature number.`
      : `Which number is greater, ${a} or ${b}?`, Math.max(a, b), `${Math.min(a, b)} < ${Math.max(a, b)}`,
      'Greater values are farther right on the number line. Among negative values, the one closer to zero is greater.');
  }
  if (concept === 1) {
    const start = topic === 'temperature' ? (level === 2 ? -y : x) : level === 3 ? x : -x;
    const change = level === 1 ? y : level === 2 ? x + y : -(x + y);
    return worked(topic === 'temperature'
      ? `The temperature is ${start}°C, then ${change > 0 ? 'rises' : 'falls'} by ${Math.abs(change)}°C. What is the new temperature in °C?`
      : `Calculate ${start} ${change > 0 ? '+' : '−'} ${Math.abs(change)}.`, start + change,
      `${start} → ${start + change}`, 'A rise or a positive addition moves right. A fall or a subtraction moves left. Count through zero when necessary.');
  }
  const start = level === 1 ? x : -x;
  const finish = level === 2 ? -y : y;
  if (topic === 'temperature') return worked(`What is the temperature difference between ${start}°C and ${finish}°C?`,
    Math.abs(finish - start), `${Math.max(start, finish)} − (${Math.min(start, finish)})`,
    'Difference is the positive distance between the two values on the number line.');
  const end = level === 1 ? -x + y : -y;
  return worked(level === 3 ? `A temperature changes from −${x}°C to −${y}°C. What is the signed change in °C?`
    : `A temperature begins at ${level === 1 ? -x : x}°C and ${level === 1 ? 'rises' : 'falls'} by ${level === 1 ? y : x + y}°C. What is the final temperature?`,
    level === 3 ? x - y : end,
    level === 3 ? `−${y} − (−${x}) = ${x - y}` : `${level === 1 ? -x : x} → ${end}`,
    level === 3 ? 'Signed change means final minus starting temperature. Positive means a rise and negative means a fall.'
      : 'Start at the original temperature and follow the direction of the change.');
}

export function operationsDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    const expression = level === 1 ? `${x} + ${y} × 3` : level === 2 ? `${x} × ${y} − 2` : `${x} × ${y} + 2 × ${y}`;
    const answer = level === 1 ? x + y * 3 : level === 2 ? x * y - 2 : x * y + 2 * y;
    return worked(`Evaluate ${expression}.`, answer, `${expression} = ${answer}`, 'Complete products before addition or subtraction.');
  }
  if (concept === 1) {
    const expression = level === 1 ? `(${x} + ${y}) × 3` : level === 2 ? `(${x + y} − ${y}) × 3` : `(${x} + ${y}) × 3 − ${y}`;
    const answer = level === 1 ? (x + y) * 3 : level === 2 ? x * 3 : (x + y) * 3 - y;
    return worked(`Evaluate ${expression}.`, answer, `${expression} = ${answer}`, 'Brackets first, then multiplication, then finish any subtraction.');
  }
  const expression = level === 1 ? `${x * y} ÷ ${y} × 2` : level === 2 ? `${x + y} − ${y} + 2` : `${x * y} ÷ ${y} + 2 × ${y}`;
  const answer = level === 1 ? x * 2 : level === 2 ? x + 2 : x + 2 * y;
  return worked(`Evaluate ${expression}.`, answer, `${expression} = ${answer}`,
    'Multiplication and division share priority and go left to right. Addition and subtraction share priority too. Complete the products and quotients first.');
}

export function mentalDraft(concept: number, level: number, index: number) {
  const x = 12 + index % 60;
  const y = 2 + Math.floor(index / 60) % 20;
  if (concept === 0) {
    const base = level === 1 ? 8 : level === 2 ? 98 : x * 10;
    const amount = level === 3 ? y * 10 - 1 : level === 1 ? 2 + index % 8 : y;
    const answer = level === 3 ? base - amount : base + amount;
    return worked(`Calculate ${base} ${level === 3 ? '−' : '+'} ${amount} mentally.`, answer,
      level === 3 ? `${base} − ${y * 10} + 1 = ${answer}` : `${base} + 2 + ${amount - 2} = ${answer}`,
      'Use a friendly ten or hundred, then compensate for the small change you made.');
  }
  if (concept === 1) return worked(level === 1 ? `Double ${x}.` : level === 2 ? `Halve ${2 * x}.` : `Calculate (${2 * x} ÷ 2) × ${y}.`,
    level === 1 ? x * 2 : level === 2 ? x : x * y,
    level === 1 ? `${x} + ${x}` : level === 2 ? `${2 * x} ÷ 2` : `${x} × ${y}`,
    'Doubling makes two equal copies. Halving separates an amount into two equal parts.');
  const multiplier = [9, 11, 99][level - 1];
  return worked(`Calculate ${x} × ${multiplier} mentally.`, x * multiplier,
    multiplier === 11 ? `${x} × 10 + ${x}` : `${x} × ${multiplier + 1} − ${x}`,
    'Use a nearby easy multiplier, then add or remove one copy of the number.');
}

export function fractionDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const d = 3 + Math.floor(index / 30) % 15;
  const numerator = 1 + x % (d - 1);
  if (concept === 0) {
    const top = x * d + numerator;
    if (level === 1) return worked(`How many whole units are contained in ${top}/${d}?`, x,
      `${top} = ${x} × ${d} + ${numerator}`, 'Each complete denominator-sized group makes one whole.');
    if (level === 2) return fractional(`After removing the whole units from ${top}/${d}, what fractional part remains? Simplify.`,
      numerator, d, `${top} = ${x} × ${d} + ${numerator}`, 'The remainder stays over the original denominator.');
    return worked(`Write ${x} and ${numerator}/${d} as an improper fraction with denominator ${d}. What is its numerator?`, top,
      `${x} × ${d} + ${numerator} = ${top}`, 'Multiply the whole part by the denominator, then add the numerator.');
  }
  if (concept === 1) {
    const otherD = level === 1 ? d * 2 : d + 1;
    const otherN = 1 + x % (otherD - 1);
    const left = numerator * otherD;
    const right = otherN * d;
    const subtract = level === 3;
    const first = subtract && left < right ? `${otherN}/${otherD}` : `${numerator}/${d}`;
    const second = subtract && left < right ? `${numerator}/${d}` : `${otherN}/${otherD}`;
    return fractional(`Calculate ${first} ${subtract ? '−' : '+'} ${second}. Simplify.`,
      subtract ? Math.abs(left - right) : left + right, d * otherD,
      `Common denominator ${d * otherD}; numerators ${left} and ${right}`,
      'Make the pieces the same size before adding or subtracting numerators.');
  }
  if (concept === 2) {
    const otherN = level === 1 ? x : level === 2 ? 1 : 2;
    const otherD = level === 1 ? 1 : x + 3;
    return fractional(`Calculate ${numerator}/${d} × ${otherN}/${otherD}. Simplify.`,
      numerator * otherN, d * otherD, `(${numerator} × ${otherN}) / (${d} × ${otherD})`,
      'Multiply numerators together and denominators together, then simplify the product.');
  }
  if (level === 1) return worked(`How many portions of size 1/${d} fit into ${x} wholes?`, x * d,
    `${x} ÷ (1/${d}) = ${x} × ${d}`, 'Each whole contains one denominator-sized set of small portions.');
  if (level === 2) return fractional(`Calculate ${numerator}/${d} ÷ ${x}. Simplify.`, numerator, d * x,
    `${numerator}/${d} × 1/${x}`, 'Dividing a fraction by a whole number multiplies its denominator by that number.');
  return fractional(`Calculate ${numerator}/${d} ÷ ${d - 1}/${x}. Simplify.`, numerator * x, d * (d - 1),
    `${numerator}/${d} × ${x}/${d - 1}`, 'Keep the first fraction and multiply by the reciprocal of the second.');
}

export function decimalDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 60;
  const y = 2 + Math.floor(index / 60) % 15;
  if (concept === 0) {
    const a = x / (level === 2 ? 100 : 10);
    const b = level === 3 ? y / 10 : y;
    return worked(`Calculate ${decimal(a)} × ${decimal(b)}.`, a * b,
      `${decimal(a)} × ${decimal(b)} = ${decimal(a * b)}`,
      'Multiply the digits as whole numbers, then account for all decimal places from both factors.');
  }
  if (concept === 1) {
    const divisor = level === 1 ? y : level === 2 ? y / 10 : y / 100;
    const dividend = divisor * x / 10;
    return worked(`Calculate ${decimal(dividend)} ÷ ${decimal(divisor)}.`, x / 10,
      `${decimal(dividend)} ÷ ${decimal(divisor)} = ${decimal(x / 10)}`,
      'Multiply both numbers by the same power of ten until the divisor is a whole number. The quotient stays unchanged.');
  }
  if (level < 3) {
    const denominator = level === 1 ? 3 : 9;
    const numerator = 1 + index % (denominator - 1);
    const digit = level === 1 ? numerator * 3 : numerator;
    const answer = `0.${digit}${digit}${digit}…`;
    if (level === 1 && index % 4 >= 2) {
      const top = index % 2 + 1;
      const repeated = top * 3;
      return fractional(`Which fraction equals 0.${repeated}${repeated}${repeated}…? The dots mean the digit repeats forever.`,
        top, 3, `${top} ÷ 3 = 0.${repeated}${repeated}${repeated}…`,
        'Thirds produce recurring decimals. One third repeats three; two thirds repeat six.');
    }
    return worked(`Write ${numerator}/${denominator} as a recurring decimal. Dots mean the digit repeats forever.`, answer,
      `${numerator} ÷ ${denominator}`, 'Long division repeats a remainder, so the same digit keeps recurring.',
      [`0.${digit}`, `0.0${digit}${digit}…`, `0.${digit + 1}${digit + 1}${digit + 1}…`]);
  }
  const denominator = [2, 4, 5, 8, 3, 6, 7, 9][index % 8];
  const numerator = 1 + Math.floor(index / 8) % 30;
  let a = numerator;
  let b = denominator;
  while (b) { const rest = a % b; a = b; b = rest; }
  let reduced = denominator / a;
  while (reduced % 2 === 0) reduced /= 2;
  while (reduced % 5 === 0) reduced /= 5;
  const answer = reduced === 1 ? 'Terminating' : 'Recurring';
  return worked(`Does the decimal for ${numerator}/${denominator} terminate or recur?`, answer,
    `Reduced denominator: ${denominator / a}`,
    'After simplification, a denominator containing only prime factors two and five terminates. Another prime factor produces recurrence.',
    [answer === 'Terminating' ? 'Recurring' : 'Terminating', 'Not a number', 'Cannot determine']);
}
