import type { RawTestCase } from './types';

export type LessonDefault = {
  defaultReturn: string;
};

export type NumberArrayOptions = {
  lengthMin?: number;
  lengthMax?: number;
  valueMin?: number;
  valueMax?: number;
};

export function createLessonDefaults(lessonId: string): LessonDefault {
  switch (lessonId) {
    case 'index-of':
    case 'last-index-of':
    case 'index-of-max':
    case 'index-of-min':
      return { defaultReturn: '-1' };
    case 'contains-value':
    case 'is-sorted':
      return { defaultReturn: 'false' };
    case 'all-indices':
    case 'reverse-array':
    case 'sort-ascending':
    case 'sort-descending':
    case 'remove-duplicates':
    case 'pairs-with-sum':
    case 'rotate':
    case 'merge-sorted':
      return { defaultReturn: '[]' };
    case 'second-extreme':
      return { defaultReturn: 'null' };
    default:
      return { defaultReturn: '0' };
  }
}

export function createMinimalStarterCode(source: string, defaultReturn: string): string {
  const lines = source.split('\n');
  const signatureLine = lines.find((line) => line.trim()) || 'solve() {';
  const closingLine = lines.slice().reverse().find((line) => line.trim() === '}') || '}';
  return [
    signatureLine,
    `  return ${defaultReturn};`,
    closingLine,
  ].join('\n');
}

export function makeCase(args: unknown[], note?: string): RawTestCase {
  return { args, note };
}

export function repeatPattern(pattern: number[], length: number): number[] {
  const values: number[] = [];
  for (let index = 0; index < length; index += 1) {
    values.push(pattern[index % pattern.length]!);
  }
  return values;
}

export function createLookupArray(length: number, target: number, positions: number[]): number[] {
  const fillers = [-9, -7, -5, -3, -1, 1, 3, 5, 7, 9].filter((value) => value !== target);
  const values: number[] = [];
  for (let index = 0; index < length; index += 1) {
    values.push(fillers[index % fillers.length]!);
  }
  for (const index of positions) {
    if (index >= 0 && index < values.length) {
      values[index] = target;
    }
  }
  return values;
}

export function createSortedFromPattern(pattern: number[], length: number): number[] {
  return repeatPattern(pattern, length).slice().sort((left, right) => left - right);
}

export function createMissingNumberCase(n: number, missing: number): RawTestCase {
  const values: number[] = [];
  for (let value = 0; value <= n; value += 1) {
    if (value !== missing) {
      values.push(value);
    }
  }
  return makeCase([reorderForMissingCase(values)], 'Large deterministic missing-number case.');
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickOne<T>(rng: () => number, values: T[]): T {
  return values[randomInt(rng, 0, values.length - 1)]!;
}

export function createNumberArray(rng: () => number, options: NumberArrayOptions = {}): number[] {
  const length = randomInt(rng, options.lengthMin || 4, options.lengthMax || 8);
  const valueMin = options.valueMin ?? -6;
  const valueMax = options.valueMax ?? 9;
  const numbers: number[] = [];
  for (let index = 0; index < length; index += 1) {
    numbers.push(randomInt(rng, valueMin, valueMax));
  }
  return numbers;
}

export function createSortedArray(rng: () => number, options: NumberArrayOptions = {}): number[] {
  return createNumberArray(rng, options).sort((left, right) => left - right);
}

export function shuffleInPlace<T>(values: T[], rng: () => number): void {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const nextIndex = randomInt(rng, 0, index);
    const temp = values[index]!;
    values[index] = values[nextIndex]!;
    values[nextIndex] = temp;
  }
}

function reorderForMissingCase(values: number[]): number[] {
  const reordered: number[] = [];
  let left = 0;
  let right = values.length - 1;
  while (left <= right) {
    reordered.push(values[right]!);
    if (left !== right) {
      reordered.push(values[left]!);
    }
    left += 1;
    right -= 1;
  }
  return reordered;
}
