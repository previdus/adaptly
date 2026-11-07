import type { TopicId } from './learning';

type Fact = { a: number; b: number; answer: number | string; prompt: string; skill?: number };

function columnSteps(a: number, b: number, subtract: boolean) {
  const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];
  let transfer = 0;
  const steps: string[] = [];
  const width = Math.max(String(a).length, String(b).length);
  for (let column = 0; column < width; column++) {
    const place = 10 ** column;
    const x = Math.floor(a / place) % 10;
    const y = Math.floor(b / place) % 10;
    const name = names[column] ?? `place ${place}`;
    if (subtract) {
      const available = x - transfer;
      const borrow = available < y;
      const adjusted = available + (borrow ? 10 : 0);
      steps.push(`${name}: ${x}${transfer ? ' minus the 1 already traded' : ''}${borrow ? ' is too small, so trade 1 from the next place for 10 here' : ''}. ${adjusted} − ${y} = ${adjusted - y}.`);
      transfer = Number(borrow);
    } else {
      const sum = x + y + transfer;
      const carry = Math.floor(sum / 10);
      steps.push(`${name}: ${x} + ${y}${transfer ? ' + 1 carried in' : ''} = ${sum}. Write ${sum % 10}${carry ? ' and carry 1 to the next place' : ''}.`);
      transfer = carry;
    }
  }
  if (!subtract && transfer) steps.push('Write the final carried 1 in the next place.');
  return steps.join(' ');
}

function commonFactor(a: number, b: number): number {
  return b ? commonFactor(b, a % b) : a;
}

export function mathsExplanation(topic: TopicId, q: Fact) {
  const { a, b, answer, prompt, skill } = q;
  const start = `The answer is ${answer}. `;
  if (topic === 'addition') {
    if (skill === 11 || prompt.includes('□')) {
      return start + `The total is ${a + b} and the known part is ${a}. Find the missing part: ${a + b} − ${a} = ${b}. Check by adding: ${a} + ${b} = ${a + b}.`;
    }
    return start + `Combine the two amounts. Work from right to left. ${columnSteps(a, b, false)} Reading the digits gives ${a + b}. Check: ${a + b} − ${b} = ${a}.`;
  }
  if (topic === 'subtraction') {
    if (skill === 16 || prompt.includes('□')) {
      return start + `The starting amount is ${a} and the result is ${a - b}. The amount taken away is ${a} − ${a - b} = ${b}. Check: ${a} − ${b} = ${a - b}.`;
    }
    return start + `Find what remains or the difference between the amounts. Work from right to left. ${columnSteps(a, b, true)} Check by adding back: ${a - b} + ${b} = ${a}.`;
  }
  if (topic === 'multiply') {
    if (a < 10 && b < 10) {
      return start + `There are ${a} equal groups of ${b}. Add ${b} once for each group: ${Array(a).fill(b).join(' + ')} = ${a * b}. Multiplication is a shorter way to write this equal-group addition.`;
    }
    const tens = Math.floor(a / 10) * 10;
    const ones = a % 10;
    return start + `Split ${a} into ${tens} + ${ones}. Multiply both parts by ${b}: ${tens} × ${b} = ${tens * b}, and ${ones} × ${b} = ${ones * b}. Add the partial products: ${tens * b} + ${ones * b} = ${a * b}. Check by dividing ${a * b} by ${b}: the result is ${a}.`;
  }
  if (topic === 'division') {
    const full = Math.floor(a / b);
    const remainder = a % b;
    const work = `${b} × ${full} = ${b * full}, and ${a} − ${b * full} = ${remainder}. `;
    if (skill === 21 || prompt.toLowerCase().includes('remainder')) {
      return start + work + `The question asks for what is left, so report ${remainder}, not the ${full} complete groups. A remainder must be smaller than the group size ${b}.`;
    }
    if (prompt.includes('fewest boxes')) {
      return start + work + `There are ${full} full boxes and ${remainder} items still needing a place. One more box holds those leftovers, so use ${full + 1} boxes.`;
    }
    return start + work + `You can make ${full} complete groups of ${b}${remainder ? `, with ${remainder} left over. The question asks for the complete groups, so leave the remainder out of the group count` : ', with nothing left over. For equal sharing among ' + b + ' groups, each gets ' + full}. Check that ${b} × ${full} + ${remainder} = ${a}.`;
  }
  if (topic === 'hcf') {
    if (skill === 23) {
      return start + `A factor divides a number exactly. The missing divisor satisfies □ × ${a / b} = ${a}. Since ${b} × ${a / b} = ${a}, the missing factor is ${b}.`;
    }
    const factors: number[] = [];
    for (let divisor = 1; divisor <= Math.min(a, b); divisor++) {
      if (a % divisor === 0 && b % divisor === 0) factors.push(divisor);
    }
    return start + `The shared factors are ${factors.join(', ')}. The greatest is ${commonFactor(a, b)}. Both numbers divide by it with no remainder: ${a} ÷ ${answer} = ${a / Number(answer)} and ${b} ÷ ${answer} = ${b / Number(answer)}. For equal cuts, this gives the longest piece that fits both lengths exactly.`;
  }
  if (skill === 26) {
    return start + `A positive multiple comes from multiplying by a counting number. After ${b} equal jumps of ${a}, you reach ${a} × ${b} = ${a * b}. Each jump adds another ${a}.`;
  }
  const gcd = commonFactor(a, b);
  const lcm = a / gcd * b;
  return start + `The two lists of multiples first meet at ${lcm}: ${a} × ${lcm / a} = ${lcm}, and ${b} × ${lcm / b} = ${lcm}. To find that first meeting, divide one number by their HCF ${gcd}, then multiply by the other: (${a} ÷ ${gcd}) × ${b} = ${lcm}. For repeating events starting together, this is how long until they next coincide.`;
}
