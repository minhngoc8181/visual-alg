import {
  createNumberArray,
  createSortedArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createLookupLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'index-of',
      title: '1. indexOf(value)',
      methodName: 'indexOfValue',
      description: 'Return the first index where target appears, or -1 if it does not exist.',
      starterCode: [
        'indexOfValue(numbers, target) {',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    if (numbers[i] === target) {',
        '      return i;',
        '    }',
        '  }',
        '  return -1;',
        '}',
      ].join('\n'),
      genTest: (rng) => {
        const numbers = createNumberArray(rng, { lengthMin: 4, lengthMax: 9 });
        const target = randomInt(rng, -5, 9);
        return { args: [numbers, target], note: 'First occurrence wins.' };
      },
      solution: (numbers, target) => (numbers as number[]).indexOf(target as number),
    },
    {
      id: 'last-index-of',
      title: '2. lastIndexOf(value)',
      methodName: 'lastIndexOfValue',
      description: 'Return the last index where target appears, or -1 if it does not exist.',
      starterCode: [
        'lastIndexOfValue(numbers, target) {',
        '  for (let i = numbers.length - 1; i >= 0; i -= 1) {',
        '    if (numbers[i] === target) {',
        '      return i;',
        '    }',
        '  }',
        '  return -1;',
        '}',
      ].join('\n'),
      genTest: (rng) => {
        const numbers = createNumberArray(rng, { lengthMin: 4, lengthMax: 9 });
        const target = randomInt(rng, -5, 9);
        return { args: [numbers, target], note: 'Last occurrence wins.' };
      },
      solution: (numbers, target) => (numbers as number[]).lastIndexOf(target as number),
    },
    {
      id: 'contains-value',
      title: '3. contains(value)',
      methodName: 'containsValue',
      description: 'Return true when target exists in the array, otherwise false.',
      starterCode: [
        'containsValue(numbers, target) {',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    if (numbers[i] === target) {',
        '      return true;',
        '    }',
        '  }',
        '  return false;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 }), randomInt(rng, -5, 9)],
      }),
      solution: (numbers, target) => (numbers as number[]).includes(target as number),
    },
    {
      id: 'count-occurrences',
      title: '10. count occurrences of a specific value',
      methodName: 'countOccurrences',
      description: 'Count how many times target appears.',
      starterCode: [
        'countOccurrences(numbers, target) {',
        '  let count = 0;',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    if (numbers[i] === target) {',
        '      count += 1;',
        '    }',
        '  }',
        '  return count;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 6 }), randomInt(rng, -2, 6)],
      }),
      solution: (numbers, target) => (numbers as number[]).filter((value: number) => value === (target as number)).length,
    },
    {
      id: 'all-indices',
      title: '18. find all indices where a value appears',
      methodName: 'allIndicesOfValue',
      description: 'Return an array containing every index where target appears.',
      starterCode: [
        'allIndicesOfValue(numbers, target) {',
        '  const indices = [];',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    if (numbers[i] === target) {',
        '      indices.push(i);',
        '    }',
        '  }',
        '  return indices;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 5 }), randomInt(rng, -2, 5)] }),
      solution: (numbers, target) => {
        const indices: number[] = [];
        for (let i = 0; i < (numbers as number[]).length; i += 1) {
          if ((numbers as number[])[i] === target) {
            indices.push(i);
          }
        }
        return indices;
      },
    },
    {
      id: 'is-sorted',
      title: '19. check if array is sorted',
      methodName: 'isSortedAscending',
      description: 'Return true when the array is already sorted in non-decreasing order.',
      starterCode: [
        'isSortedAscending(numbers) {',
        '  for (let i = 1; i < numbers.length; i += 1) {',
        '    if (numbers[i] < numbers[i - 1]) {',
        '      return false;',
        '    }',
        '  }',
        '  return true;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [rng() > 0.5 ? createSortedArray(rng, { lengthMin: 4, lengthMax: 8 }) : createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -8, valueMax: 10 })],
      }),
      solution: (numbers) => {
        const values = numbers as number[];
        for (let i = 1; i < values.length; i += 1) {
          if (values[i]! < values[i - 1]!) {
            return false;
          }
        }
        return true;
      },
    },
  ];
}
