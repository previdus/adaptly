import { worked, decimal } from './curriculum-types';

export function pieShare(level: number, index: number) {
  if (level === 1) return [[1, 2], [1, 4], [3, 4], [2, 4]][index % 4];
  if (level === 3) return [10 + index % 80, 100];
  const denominator = [3, 4, 5, 6, 8, 10, 12][index % 7];
  return [1 + Math.floor(index / 7) % (denominator - 1), denominator];
}

export function algebraDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    const answer = level === 1 ? `${x}n` : level === 2 ? `${x}n + ${y}` : `${x}n − ${y}`;
    return worked(`Write an expression for ${x} copies of n${level === 1 ? '' : level === 2 ? `, then add ${y}` : `, then subtract ${y}`}.`,
      answer, answer, 'A number beside a letter means multiplication. Apply the stated addition or subtraction afterward.',
      [`n + ${x + y}`, `${x + y}n`, `n − ${x + y}`]);
  }
  if (concept === 1) {
    const answer = level === 1 ? x + y : level === 2 ? x * y + 2 : x * x + y;
    const expression = level === 1 ? `n + ${y}` : level === 2 ? `${y}n + 2` : `n² + ${y}`;
    return worked(`When n = ${x}, evaluate ${expression}.`, answer, `Replace n by ${x}`,
      'Substitute the value for every occurrence of the letter, then use operation order.');
  }
  if (concept === 2) {
    const equation = level === 1 ? `n + ${y} = ${x + y}` : level === 2 ? `${y}n = ${x * y}` : `${y}n + 3 = ${x * y + 3}`;
    if (level === 3) return {
      ...worked(`Solve ${equation}.`, x, equation, 'Undo the addition first, then undo the multiplication.'),
      steps: [
        {visual: equation, text: 'Find the two operations applied to the unknown. Undo them in reverse order.'},
        {visual: `${y}n = ${x * y + 3} − 3 = ${x * y}`, text: 'Subtract three from both sides so that the constant disappears.'},
        {visual: `n = ${x * y} ÷ ${y} = ${x}`, text: `Divide both sides by ${y}.`},
        {visual: `Answer: ${x}; check ${y} × ${x} + 3 = ${x * y + 3}`, text: 'Substitute the answer into the original equation to check both sides match.'}
      ]
    };
    return worked(`Solve ${equation}.`, x,
      level === 1 ? `${x + y} − ${y}` : level === 2 ? `${x * y} ÷ ${y}` : `(${x * y + 3} − 3) ÷ ${y}`,
      'Undo operations in reverse order, applying the same change to both sides.');
  }
  if (level === 1) {
    const yes = x + y > 2 * y;
    return worked(`For n = ${x}, is n + ${y} > ${2 * y} true?`, yes ? 'Yes' : 'No', `${x + y} > ${2 * y}`,
      'Substitute first, then compare the two sides.', [yes ? 'No' : 'Yes', 'True for every n', 'Cannot evaluate']);
  }
  return worked(level === 2 ? `What is the greatest whole number n for which n + ${y} < ${x + y}?`
    : `What is the least whole number n for which n − ${y} > ${x}?`, level === 2 ? x - 1 : x + y + 1,
    level === 2 ? `n < ${x}` : `n > ${x + y}`,
    'A strict inequality excludes the boundary itself. Choose the adjacent permitted whole number.');
}

export function dataDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    const values = [x, x + y, x + 2 * y];
    return worked(`A line graph has points (Mon, ${values[0]}), (Tue, ${values[1]}), (Wed, ${values[2]}). ${level === 1 ? 'What is Tuesday’s value?' : level === 2 ? 'What is the increase from Monday to Wednesday?' : 'What is the total of the three daily values?'}`,
      level === 1 ? values[1] : level === 2 ? 2 * y : 3 * (x + y),
      level === 1 ? `Tue → ${values[1]}` : level === 2 ? `${values[2]} − ${values[0]}` : values.join(' + '),
      'Read the labelled points first. A change uses subtraction, while a total uses addition.');
  }
  if (concept === 1) {
    const [numerator, denominator] = pieShare(level, index);
    const percent = 10 + index % 80;
    const angle = level === 3 ? percent * 3.6 : 360 * numerator / denominator;
    return worked(level === 3 ? `A pie-chart sector represents ${percent}% of the data. What is its angle in degrees?`
      : `A pie-chart sector represents ${numerator}/${denominator} of the whole. What is its angle in degrees?`, angle,
      level === 3 ? `${percent}/100 × 360` : `${numerator}/${denominator} × 360`,
      'A complete pie is 360 degrees. Multiply the fraction of the data by one full turn.');
  }
  if (concept === 2) {
    const list = level === 1 ? [x, x + y, x + 2 * y] : level === 2 ? [x + 2 * y, x, x + y] : [x, x + y, x + 2 * y, x + 3 * y];
    const ordered = [...list].sort((a, b) => a - b);
    return worked(`Find the median of ${list.join(', ')}.`, level === 3 ? x + 1.5 * y : x + y,
      level === 3 ? `Ordered: ${ordered.join(', ')}; middle pair (${x+y} + ${x+2*y}) ÷ 2 = ${x+1.5*y}` : `Ordered: ${ordered.join(', ')}`,
      level === 3 ? 'With an even count, average the two middle values.' : 'Order the data and choose its middle value.');
  }
  if (level === 2) return worked(`Find the range of ${x}, ${x + y}, ${x + 2 * y}.`, 2 * y,
    `${x + 2 * y} − ${x}`, 'Range is the greatest value minus the least value.');
  const target = index % 2 === 0 ? x : x + 2 * y;
  const values = level === 1 ? [target, target, x + y, x + y + 1] : [target, target, target, x + y, x + y + 1];
  const rotation = index % values.length;
  const list = [...values.slice(rotation), ...values.slice(0, rotation)];
  return worked(`Find the mode of ${list.join(', ')}.`, target, `${target} appears ${level === 1 ? 2 : 3} times`,
    'Mode is the most frequent value, not necessarily the greatest or the middle value.');
}

export function financeDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  const price = x * 100;
  const rate = y;
  if (concept === 0) {
    const base = level === 3 ? price * .8 : price;
    const tax = base * rate / 100;
    return worked(`A price is ₹${price}${level === 3 ? ' before a 20% discount' : ''}. Tax is ${rate}% of the ${level === 3 ? 'discounted' : 'original'} price. Find ${level === 1 ? 'the tax alone' : 'the final price including tax'} in rupees.`,
      level === 1 ? tax : base + tax, `Tax = ${base} × ${rate}/100 = ${decimal(tax)}`,
      level === 1 ? 'Find the specified fraction of the taxable price.' : 'Apply any discount first, calculate tax on the resulting price, then add that tax.');
  }
  if (concept === 1) {
    const subtotal = x * y;
    const extra = level === 1 ? 0 : level === 2 ? 10 : subtotal * .1;
    return worked(`A bill has ${y} items costing ₹${x} each${level === 2 ? ', plus a ₹10 delivery fee' : level === 3 ? ', plus a 10% service charge' : ''}. What is the total in rupees?`,
      subtotal + extra, `Subtotal ${subtotal}; extra ${decimal(extra)}`, 'Multiply item count by unit price before adding a fixed fee or calculating a percentage charge.');
  }
  if (concept === 2) {
    if (level === 1) {
      const unitB = x + (index % 2 === 0 ? 2 : -1);
      const answer = unitB > x ? 'Pack A' : 'Pack B';
      return worked(`Pack A has ${y} items for ₹${x * y}. Pack B has ${y + 1} items for ₹${unitB * (y + 1)}. Which pack has the lower unit price?`,
        answer, `A: ₹${x} per item; B: ₹${unitB} per item`, 'Divide each pack cost by its item count, then compare those unit prices.',
        [answer === 'Pack A' ? 'Pack B' : 'Pack A', 'They have the same unit price', 'Cannot compare']);
    }
    const quantity = y * level;
    return worked(`One shop charges ₹${x} per item and another ₹${x + 2}. ${level === 2 ? 'What is the cheaper total cost for' : 'How much do you save buying'} ${quantity} items${level === 2 ? '?' : ' at the cheaper shop?'}`, level === 2 ? x * quantity : 2 * quantity,
      level === 2 ? `${x} × ${quantity}` : `(${x + 2} − ${x}) × ${quantity}`, 'Compare the prices for the same target quantity.');
  }
  const years = level === 1 ? 1 : 2;
  const compound = price * (1 + rate / 100) ** years;
  const simple = price + price * rate / 100 * years;
  const answer = level === 3 ? compound - simple : compound;
  const result = worked(`₹${price} grows at ${rate}% annually for ${years} year(s). ${level === 3 ? 'How much more interest does annual compounding earn than simple interest?' : 'What is the final balance with annual compounding?'} Round to two decimal places.`,
    Math.round(answer * 100) / 100, level === 3 ? `${decimal(compound)} − ${decimal(simple)}` : `${price} × (1 + ${rate}/100)^${years}`,
    'Compounding applies each new percentage to the updated balance. Simple interest applies it to the original principal every year.');
  const firstYear = price * (1 + rate / 100);
  result.steps = [
    {visual: `Year 1: ${price} + ${price * rate / 100} = ${decimal(firstYear)}`, text: `Find ${rate}% of the original balance, then add it.`},
    ...(years === 2 ? [{visual: `Year 2: ${decimal(firstYear)} × (1 + ${rate}/100) = ${decimal(compound)}`, text: 'Use the updated balance as the base for the second year.'}] : []),
    ...(level === 3 ? [{visual: `Simple balance: ${price} + 2 × ${price * rate / 100} = ${simple}`, text: 'Simple interest uses the original principal in both years. Subtract this balance from the compound balance.'}] : []),
    {visual: `Answer: ${result.answer}`, text: `Round only the final result to two decimal places. The answer is ${result.answer} rupees.`}
  ];
  return result;
}

export function reasoningDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    const answer = level === 1 ? x * y + 3 : level === 2 ? x * y - 3 : x;
    return worked(level === 1 ? `There are ${y} packs of ${x} pencils and 3 loose pencils. How many pencils altogether?`
      : level === 2 ? `There are ${y} packs of ${x} pencils. Three pencils are used. How many remain?`
        : `A teacher has ${x * y + 3} pencils. Three are set aside, then the rest shared among ${y} children. How many does each child get?`,
      answer, level === 1 ? `${y} × ${x} + 3` : level === 2 ? `${y} × ${x} − 3` : `(${x * y + 3} − 3) ÷ ${y}`,
      'Translate each change in the story into an operation, then apply them in that order.');
  }
  if (concept === 1) {
    const a = x * 10 + y;
    const b = y * 10 + 3;
    const first = Math.round(a / 10) * 10;
    const second = Math.round(b / 10) * 10;
    return worked(level === 1 ? `Round ${a} to the nearest ten.` : `Estimate ${a} ${level === 2 ? '+' : '×'} ${b} by rounding both numbers to the nearest ten first.`,
      level === 1 ? first : level === 2 ? first + second : first * second,
      level === 1 ? `${a} → ${first}` : `${first} ${level === 2 ? '+' : '×'} ${second}`,
      'Use the stated rounding method so that the estimate is reproducible. A final digit five or greater rounds up.');
  }
  if (level === 1) return worked(`A learner writes ${x} + ${y} = ${x + y + 1}. What is the correct sum?`, x + y,
    `${x} + ${y} = ${x + y}`, 'Recalculate the operation rather than accepting the stated result.');
  if (level === 2) return worked(`A learner adds first in ${x} + ${y} × 3. What is the correct result?`, x + 3 * y,
    `${y} × 3 = ${3 * y}; then add ${x}`, 'Multiplication has priority over addition.');
  return worked(`A learner writes ${x} m = ${x * 10} cm. What is the correct number of centimetres?`, x * 100,
    `${x} × 100 = ${x * 100}`, 'There are one hundred centimetres in each metre.');
}
