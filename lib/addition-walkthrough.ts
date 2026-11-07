export type AdditionStep = {
  kind: 'intro' | 'column' | 'carry' | 'finish';
  column: number;
  text: string;
  digit?: number;
  carryIn?: number;
  carryOut?: number;
};

export function additionWalkthrough(a: number, b: number, missing = false): AdditionStep[] {
  const total = a + b;
  const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  const steps: AdditionStep[] = [{
    kind: 'intro', column: -1,
    text: missing
      ? `The total is ${total}. ${total} minus ${a} is ${b}, the missing part. Let's check by adding ${a} and ${b}.`
      : `Let's add ${a} and ${b}. Line up the ones, tens, and hundreds. Start on the right, with the ones.`
  }];
  let carry = 0;
  const width = Math.max(String(a).length, String(b).length);
  for (let column = 0; column < width; column++) {
    const x = Math.floor(a / 10 ** column) % 10;
    const y = Math.floor(b / 10 ** column) % 10;
    const sum = x + y + carry;
    const carryOut = Math.floor(sum / 10);
    steps.push({
      kind: 'column', column, digit: sum % 10, carryIn: carry, carryOut,
      text: `In the ${names[column]}, ${x} plus ${y}${carry ? ', plus the 1 we carried,' : ''} is ${sum}. Write ${sum % 10} in the ${names[column]} place.`
    });
    if (carryOut) steps.push({
      kind: 'carry', column: column + 1, carryOut,
      text: `Ten ${names[column]} make one ${names[column + 1] ?? 'unit in the next place'}. Carry that 1 to the next column on the left.`
    });
    carry = carryOut;
  }
  steps.push({kind: 'finish', column: -1, text: `Read the answer from left to right: ${total}. ${a} plus ${b} equals ${total}. Well done working through each place!`});
  return steps;
}
