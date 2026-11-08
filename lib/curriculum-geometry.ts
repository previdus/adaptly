import { worked, pointQuestion } from './curriculum-types';

export function linesDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    const description = level === 1 ? `Two horizontal lines pass through heights ${x} cm and ${x + y} cm.`
      : level === 2 ? `A horizontal line meets a vertical line at (${x}, ${y}).`
      : `Two lines intersect at an angle of ${x + y + 10}°.`;
    const answer = level === 1 ? 'Parallel' : level === 2 ? 'Perpendicular' : 'Intersecting but not perpendicular';
    return worked(description + ' How are the lines related?', answer, description,
      'Parallel straight lines have the same direction and never meet. Perpendicular lines meet at 90 degrees.',
      ['Parallel', 'Perpendicular', 'Intersecting but not perpendicular', 'Cannot determine'].filter(item => item !== answer));
  }
  if (concept === 1) {
    if (level === 1) return worked(`A rectangle is ${x} cm long and ${y} cm wide. How many pairs of parallel sides does it have?`, 2,
      'Top ∥ bottom; left ∥ right', 'Opposite sides of every rectangle are parallel, giving two pairs.');
    if (level === 3) return worked(`Segment A joins (0, ${x}) to (${y}, ${x}); segment B joins (0, ${x+y}) to (${y}, ${x+y}). If both are extended as straight lines, how are they related?`,
      'Parallel', 'Both segments have constant, different heights', 'Each segment is horizontal because its two endpoints have the same height. Extending them preserves their directions.',
      ['Perpendicular', 'Intersecting at an acute angle', 'The same line']);
    return worked(`The lines y = ${x} and y = ${x + y} extend forever. How many intersection points do they have?`, 0,
      `y = ${x} ∥ y = ${x + y}`, 'These distinct horizontal lines stay parallel even when extended.');
  }
  const angle = x + y;
  if (level === 3) return worked(`A turn of ${angle}° and a missing turn make a right angle. Find the missing angle in degrees.`, 90 - angle,
    `90 − ${angle} = ${90 - angle}`, 'A right angle is 90 degrees. Subtract the known part.');
  if (level === 1) {
    const prompts = [
      'How many degrees are in a quarter-turn?',
      'How many quarter-turns make one full turn?',
      'A robot faces north and turns clockwise to face east. How many degrees did it turn?'
    ];
    return worked(prompts[index % 3], index % 3 === 1 ? 4 : 90,
      '360° ÷ 4 = 90°', 'A quarter means one of four equal parts. Four right-angle turns make a full turn.');
  }
  const prompts = [
    'What is the angle in degrees where perpendicular lines meet?',
    'Two perpendicular straight lines cross. How many right angles do they form?',
    'How many degrees are in two adjacent right angles at a perpendicular crossing?'
  ];
  return worked(prompts[index % 3], [90, 4, 180][index % 3],
    'Four 90° angles around the crossing', 'Perpendicular lines make four right angles. Each right angle is 90 degrees.');
}

export function symmetryDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  const n = 3 + index % 10;
  if (concept === 0) {
    if (level === 1) return worked(`A non-square rectangle is ${x + y} cm by ${y} cm. How many lines of symmetry does it have?`, 2,
      'Two centre lines: vertical and horizontal', 'A non-square rectangle folds onto itself along its two centre lines. Its diagonals are not mirror lines.');
    if (level === 2) return worked(`A regular polygon has ${n} sides of length ${y} cm. How many lines of symmetry does it have?`, n,
      `${n} regular sides → ${n} mirror lines`, 'A regular polygon has as many reflection symmetry lines as sides.');
    return worked(`A parallelogram has unequal adjacent sides ${x + y} cm and ${y} cm and no right angles. Does it match itself after a half-turn?`,
      'Yes', 'A half-turn swaps opposite vertices', 'Every parallelogram has rotational symmetry of order two.',
      ['No', 'Only after a quarter-turn', 'Only after a reflection']);
  }
  if (concept === 1) {
    if (level === 1) return pointQuestion(`Reflect (${x}, ${y}) across the vertical line x = 0.`, -x, y,
      'The horizontal distance changes direction. The height stays the same.');
    if (level === 2) return pointQuestion(`Reflect (${x}, ${y}) across the horizontal line y = 0.`, x, -y,
      'The vertical distance changes direction. The horizontal coordinate stays the same.');
    return pointQuestion(`Reflect (${x}, ${y}) across the line x = ${x + y}.`, x + 2 * y, y,
      'The original point and its image are the same horizontal distance on opposite sides of the mirror.');
  }
  if (level === 1) return worked(`What is the order of rotational symmetry of a regular ${n}-sided polygon with side length ${y} cm?`, n,
    `${n} matching positions in one full turn`, 'A regular polygon matches once for each side during a full rotation.');
  if (level === 2) return worked(`What is the smallest positive symmetry rotation of a regular ${n}-sided polygon with side length ${y} cm? Give degrees to two decimal places if needed.`,
    Math.round(360 / n * 100) / 100, `360 ÷ ${n}`, 'Divide the full turn equally among the matching positions.');
  return worked(`A non-square rectangle is ${x + y} cm by ${y} cm. Does it match itself after a 90° rotation?`,
    'No', '90° swaps unequal sides; 180° matches', 'A non-square rectangle has half-turn symmetry but not quarter-turn symmetry.',
    ['Yes', 'Only if moved', 'Only if reflected']);
}

export function coordinateDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) {
    if (level === 3) return pointQuestion(`A point is ${x} units right and ${y} units up from the origin. Write its coordinates.`, x, y,
      'Write the horizontal coordinate first and the vertical coordinate second.');
    return worked(`For point (${x}, ${y}), what is its ${level === 1 ? 'x' : 'y'} coordinate?`, level === 1 ? x : y,
      `(${x}, ${y}) means (horizontal, vertical)`, 'An ordered pair always records horizontal position first.');
  }
  if (concept === 1) return pointQuestion(`Move (${x}, ${y}) ${level === 2 ? '3 units up' : '2 units right'}${level === 3 ? ' and 3 units up' : ''}. Where does it land?`,
    x + (level === 2 ? 0 : 2), y + (level === 1 ? 0 : 3), 'Right changes x. Up changes y. Keep any coordinate that did not change.');
  if (level === 1) return worked(`What is the horizontal distance from (${x}, ${y}) to (${x + y}, ${y})?`, y,
    `${x + y} − ${x} = ${y}`, 'The heights match, so subtract only horizontal coordinates.');
  if (level === 2) return worked(`What is the vertical distance from (${x}, ${y}) to (${x}, ${y + x})?`, x,
    `${y + x} − ${y} = ${x}`, 'The horizontal coordinates match, so subtract vertical coordinates.');
  return pointQuestion(`Find the midpoint of (0, ${y}) and (${2 * x}, ${y + 2}).`, x, y + 1,
    'Average the x coordinates and the y coordinates separately.');
}

export function transformationDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (concept === 0) return pointQuestion(`Translate (${x}, ${y}) by ${level === 1 ? '(2, 0)' : level === 2 ? '(0, 3)' : '(-2, 3)'}.`,
    x + (level === 1 ? 2 : level === 3 ? -2 : 0), y + (level === 1 ? 0 : 3),
    'Add the horizontal translation to x and the vertical translation to y.');
  if (concept === 1) return pointQuestion(`Reflect (${x}, ${y}) across ${level === 1 ? 'the y axis' : level === 2 ? 'the x axis' : 'the line y = x'}.`,
    level === 1 ? -x : level === 2 ? x : y, level === 1 ? y : level === 2 ? -y : x,
    'A vertical mirror reverses x, a horizontal mirror reverses y, and the line y = x swaps x and y.');
  return pointQuestion(`Rotate (${x}, ${y}) ${level === 1 ? '180°' : level === 2 ? '90° anticlockwise' : '90° clockwise'} about the origin.`,
    level === 1 ? -x : level === 2 ? -y : y, level === 1 ? -y : level === 2 ? x : -x,
    level === 1 ? 'A half-turn reverses both coordinates.' : level === 2 ? 'An anticlockwise quarter-turn maps (x,y) to (-y,x).'
      : 'A clockwise quarter-turn maps (x,y) to (y,-x).');
}

export function unitsDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  const factor = concept === 0 ? 100 : 1000;
  const large = ['m', 'kg', 'L'][concept];
  const small = ['cm', 'g', 'mL'][concept];
  const extra = y * (concept === 0 ? 2 : 20);
  if (level === 1) return worked(`Convert ${x} ${large} and ${extra} ${small} to ${small}.`, x * factor + extra,
    `${x} × ${factor} + ${extra}`, 'Convert the large units into small units, then add the extra amount.');
  if (level === 2) return worked(`Subtract ${extra} ${small} from ${x} ${large}. Give the answer in ${small}.`, x * factor - extra,
    `${x} × ${factor} − ${extra}`, 'Use the same unit for both quantities before subtracting.');
  return worked(`Write ${x * factor + extra} ${small} in ${large} as a decimal.`, x + extra / factor,
    `${x * factor + extra} ÷ ${factor}`, 'Divide by the number of small units in one large unit.');
}

export function scaleDraft(concept: number, level: number, index: number) {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  const factor = level === 1 ? 1 : y;
  if (concept === 0) return worked(level === 3
    ? `A plan has scale 1:${y * 100}. A line is ${x} cm on the plan. What is its real length in centimetres?`
    : `One centimetre on a plan represents ${factor} metres. A line is ${x} cm on the plan. What is its real length in metres?`,
    level === 3 ? x * y * 100 : x * factor,
    level === 3 ? `${x} × ${y * 100}` : `${x} × ${factor}`,
    'Multiply the drawing length by the real distance represented by one drawing unit.');
  if (concept === 1) return worked(level === 3
    ? `One centimetre on a plan represents ${y} metres. A real length is ${x * y * 100} cm. How many centimetres on the plan?`
    : `One centimetre on a plan represents ${factor} metres. A real length is ${x * factor} m. How many centimetres on the plan?`,
    x, level === 3 ? `${x * y * 100} ÷ 100 ÷ ${y} = ${x}` : `${x * factor} ÷ ${factor} = ${x}`,
    'First express the real length in the scale’s units, then divide by the real distance per drawing centimetre.');
  if (level === 1) return pointQuestion(`A rectangle is ${x} cm by ${y} cm. Double both lengths. Give (length, width) in centimetres.`,
    2 * x, 2 * y, 'Apply the length scale factor separately to both dimensions.');
  const length = x * y;
  const width = (x + 1) * y;
  return worked(`A plan rectangle is ${x} cm by ${x + 1} cm. One plan centimetre represents ${y} metres. Find its real ${level === 2 ? 'perimeter in metres' : 'area in square metres'}.`,
    level === 2 ? 2 * (length + width) : length * width,
    level === 2 ? `2 × (${length} + ${width})` : `${length} × ${width}`,
    'Scale both side lengths first. Perimeter adds the boundaries; area multiplies the two dimensions.');
}
