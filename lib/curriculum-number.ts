import { worked, type CurriculumDraft } from './curriculum-types';

export function isPrime(n: number) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor === 0) return false;
  }
  return true;
}

export function nextPrime(n: number) {
  let candidate = n + 1;
  while (!isPrime(candidate)) candidate++;
  return candidate;
}

const symbols: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'],
  [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

export function roman(n: number) {
  let rest = n;
  let result = '';
  for (const [value, symbol] of symbols) {
    while (rest >= value) {
      result += symbol;
      rest -= value;
    }
  }
  return result;
}

export function parityDraft(concept: number, level: number, index: number): CurriculumDraft {
  const n = 1 + index % [20, 100, 1000][level - 1];
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  const a = concept === 1 ? (level === 1 ? 2 * x : 2 * x + 1) : (level === 2 ? 2 * x + 1 : x);
  const b = concept === 1 ? (level === 3 ? 2 * y + 1 : 2 * y) : (level === 1 ? 2 : level === 2 ? 2 * y + 1 : y);
  const value = concept === 0 ? n : concept === 1 ? a + b : a * b;
  const prompt = concept === 0 ? `Is ${n} odd or even?` : `Is ${a} ${concept === 1 ? '+' : '×'} ${b} odd or even?`;
  const answer = value % 2 === 0 ? 'Even' : 'Odd';
  return worked(prompt, answer, `Result ${value}; last digit ${value % 10}`,
    'Even whole numbers form pairs with nothing left over. Their final digit is 0, 2, 4, 6 or 8. Odd numbers leave one unpaired.',
    ['Even', 'Odd', 'Both odd and even', 'Neither odd nor even'].filter(item => item !== answer));
}

export function romanDraft(concept: number, level: number, index: number) {
  const additive = [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18, 20];
  const landmarks = [100, 400, 500, 900, 1000, 444, 499, 999];
  const n = concept === 0 && level === 1 ? additive[index % additive.length]
    : level === 3 ? landmarks[index] ?? 101 + ((index - landmarks.length) * 37) % 900
      : [1, 21][level - 1] + index % [20, 80][level - 1];
  if (concept === 0) return worked(`What number is ${roman(n)}?`, n, `${roman(n)} = ${n}`,
    'Read from left to right. A smaller symbol before a larger one subtracts; otherwise add the values.');
  if (concept === 1) return worked(`Write ${n} in Roman numerals.`, roman(n), `${n} → ${roman(n)}`,
    'Build hundreds, tens and ones. Use IV, IX, XL, XC, CD and CM for the subtractive forms.',
    [roman(n + 1), roman(n + 2), roman(n + 3)]);
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  const a = level === 1 ? x : x + y;
  const result = level === 2 ? a - y : a + y;
  const answer = level === 3 ? y : result;
  const prompt = level === 3 ? `Complete ${roman(a)} + □ = ${roman(a + y)}. Choose the missing Roman number.`
    : `Calculate ${roman(a)} ${level === 2 ? '−' : '+'} ${roman(y)}. Choose the Roman answer.`;
  return worked(prompt, roman(answer), `Whole-number result: ${answer}`,
    'Convert the symbols to whole numbers, complete the operation, then write the answer in Roman numerals.',
    [roman(answer + 1), roman(answer + 2), roman(answer + 3)]);
}

export function factorDraft(concept: number, level: number, index: number) {
  const width = [9, 20, 30][level - 1];
  const x = 2 + index % width;
  const y = 2 + Math.floor(index / width) % [9, 15, 20][level - 1];
  if (concept === 0 && level < 3) return worked(`Complete ${x} × □ = ${x * y}.`, y,
    `${x * y} ÷ ${x} = ${y}`, 'A factor pair multiplies exactly to the target number. Divide by the known factor.');
  if (concept === 0) {
    const target = x * y + Number(index % 2 === 0);
    const yes = target % x === 0;
    return worked(`Is ${x} a factor of ${target}?`, yes ? 'Yes' : 'No', `Remainder: ${target % x}`,
      'A factor divides a number with no remainder.', [yes ? 'No' : 'Yes', 'Only after rounding', 'Cannot determine']);
  }
  if (concept === 1) {
    const answer = level === 1 ? x * (y + 1) : level === 2 ? x * y : y;
    const prompt = level === 1 ? `Which multiple of ${x} comes immediately after ${x * y}?`
      : level === 2 ? `What is the ${y}th positive multiple of ${x}?` : `Find the multiplier: ${x} × □ = ${x * y}.`;
    return worked(prompt, answer, `${x} × ${y} = ${x * y}`,
      level === 1 ? `Add one more ${x} to the current multiple.` : 'Positive multiples count equal jumps of the base number.');
  }
  if (level === 3) {
    const n = 1 + index % 300;
    const factors = Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);
    return worked(`How many positive factors does ${n} have?`, factors.length, factors.join(', '),
      'List each positive divisor once, including one and the number itself. Then count them.');
  }
  if (level === 1) return worked(`Which is a common factor of ${x * y} and ${x * (y + 1)}?`, x,
    `${x * y} = ${x} × ${y}; ${x * (y + 1)} = ${x} × ${y + 1}`,
    'The selected number must divide both amounts exactly.',
    [String(x * (y + 1) + 1), String(x * (y + 1) + 2), String(x * (y + 1) + 3)]);
  return worked(`Which is a common multiple of ${x} and ${y}?`, x * y,
    `${x} × ${y} = ${x * y}`, 'The product is divisible by both numbers.',
    [String(x * y + 1), String(x * y + 2 * x * y + 1), String(x * y + 4 * x * y + 1)]);
}

export function primeDraft(concept: number, level: number, index: number) {
  const n = [1, 21, 101][level - 1] + index % [20, 80, 200][level - 1];
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    const answer = n === 1 ? 'Neither prime nor composite' : isPrime(n) ? 'Prime' : 'Composite';
    const factors = Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);
    return worked(`Classify ${n}.`, answer, `Factors: ${factors.join(', ')}`,
      'A prime has exactly two positive factors, a composite has more than two, and one has only one factor.',
      ['Prime', 'Composite', 'Neither prime nor composite', 'Both prime and composite'].filter(item => item !== answer));
  }
  const primes = level === 1 ? [2, 3, 5, 7] : level === 2 ? [2, 3, 5, 7, 11, 13] : [2, 3, 5, 7, 11, 13, 17, 19];
  const p = primes[index % primes.length];
  const q = primes[Math.floor(index / primes.length) % primes.length];
  if (concept === 1) {
    if (level === 1) return worked(`What is the smallest prime factor of ${p * q}?`, Math.min(p, q),
      `${p * q} = ${p} × ${q}`, 'Test prime divisors from two upward. Stop at the first exact divisor.');
    if (level === 2) return worked(`Which prime number divides ${p * x}?`, p,
      `${p * x} = ${p} × ${x}`, 'The answer must be prime and must divide the target exactly.',
      [String(p * x + 1), String(p * x + 2), String(p * x + 4)]);
    const power = 2 + index % 12;
    return worked(`How many prime factors, counting repetition, occur in 2³ × 3^${power}?`, power + 3,
      `3 + ${power} = ${power + 3}`, 'Each exponent tells how many times that prime factor occurs.');
  }
  if (level === 1) return worked(`What is the first prime greater than ${n}?`, nextPrime(n),
    `Test consecutive numbers after ${n}`, 'A prime has no positive divisor other than one and itself.');
  if (level === 2) return worked(`Find the smallest prime greater than ${x} and less than ${nextPrime(x) + y}.`, nextPrime(x),
    `${x} < ${nextPrime(x)} < ${nextPrime(x) + y}`, 'Test numbers upward from the lower bound.');
  return worked(`Evaluate the prime product ${p} × ${p} × ${q}.`, p * p * q,
    `${p}² × ${q} = ${p * p * q}`, 'A repeated prime remains a separate factor each time it appears.');
}

export function divisibilityDraft(concept: number, level: number, index: number) {
  const divisor = concept === 0 ? [2, 5, 10][level - 1] : concept === 1 ? [3, 9, 3][level - 1] : [6, 4, 12][level - 1];
  const value = (1 + index % 300) * divisor + index % 3;
  if (concept === 1 && level === 3) {
    const sum = 2 + index % 90;
    return worked(`The digits of a number add to ${sum}. What is the smallest nonnegative amount to add to this sum to reach a multiple of 3?`,
      (3 - sum % 3) % 3, `Next multiple of 3 after or at ${sum}`,
      'A digit sum divisible by three indicates that the number is divisible by three. Zero is allowed if the sum already works.');
  }
  const yes = value % divisor === 0;
  const rules: Record<number, string> = {
    2: 'The last digit must be even.', 5: 'The last digit must be zero or five.', 10: 'The last digit must be zero.',
    3: 'The digit sum must be divisible by three.', 9: 'The digit sum must be divisible by nine.',
    6: 'Both the rules for two and three must hold.', 4: 'The last two digits must be divisible by four.',
    12: 'Both the rules for three and four must hold.'
  };
  return worked(`Is ${value} divisible by ${divisor}?`, yes ? 'Yes' : 'No',
    `${value} ÷ ${divisor} leaves remainder ${value % divisor}`, rules[divisor],
    [yes ? 'No' : 'Yes', 'Only after rounding', 'Cannot determine']);
}
