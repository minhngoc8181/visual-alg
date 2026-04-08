import { createNumberArray, pickOne } from './lesson-helpers';
import type { LessonConfig } from './types';

export function createExtremaLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'find-max',
      title: '4. find maximum value',
      methodName: 'findMaxValue',
      description: 'Return the maximum number in a non-empty array.',
      starterCode: [
        'findMaxValue(numbers) {',
        '  let max = numbers[0];',
        '  for (let i = 1; i < numbers.length; i += 1) {',
        '    if (numbers[i] > max) {',
        '      max = numbers[i];',
        '    }',
        '  }',
        '  return max;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 8, valueMin: -12, valueMax: 18 })] }),
      solution: (numbers) => Math.max(...(numbers as number[])),
    },
    {
      id: 'find-min',
      title: '5. find minimum value',
      methodName: 'findMinValue',
      description: 'Return the minimum number in a non-empty array.',
      starterCode: [
        'findMinValue(numbers) {',
        '  let min = numbers[0];',
        '  for (let i = 1; i < numbers.length; i += 1) {',
        '    if (numbers[i] < min) {',
        '      min = numbers[i];',
        '    }',
        '  }',
        '  return min;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 8, valueMin: -12, valueMax: 18 })] }),
      solution: (numbers) => Math.min(...(numbers as number[])),
    },
    {
      id: 'index-of-max',
      title: '6. find index of maximum value',
      methodName: 'indexOfMaxValue',
      description: 'Return the index of the first maximum value.',
      starterCode: [
        'indexOfMaxValue(numbers) {',
        '  let bestIndex = 0;',
        '  for (let i = 1; i < numbers.length; i += 1) {',
        '    if (numbers[i] > numbers[bestIndex]) {',
        '      bestIndex = i;',
        '    }',
        '  }',
        '  return bestIndex;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 })], note: 'If the max repeats, return the first index.' }),
      solution: (numbers) => {
        const values = numbers as number[];
        let bestIndex = 0;
        for (let i = 1; i < values.length; i += 1) {
          if (values[i]! > values[bestIndex]!) {
            bestIndex = i;
          }
        }
        return bestIndex;
      },
    },
    {
      id: 'index-of-min',
      title: '7. find index of minimum value',
      methodName: 'indexOfMinValue',
      description: 'Return the index of the first minimum value.',
      starterCode: [
        'indexOfMinValue(numbers) {',
        '  let bestIndex = 0;',
        '  for (let i = 1; i < numbers.length; i += 1) {',
        '    if (numbers[i] < numbers[bestIndex]) {',
        '      bestIndex = i;',
        '    }',
        '  }',
        '  return bestIndex;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 })], note: 'If the min repeats, return the first index.' }),
      solution: (numbers) => {
        const values = numbers as number[];
        let bestIndex = 0;
        for (let i = 1; i < values.length; i += 1) {
          if (values[i]! < values[bestIndex]!) {
            bestIndex = i;
          }
        }
        return bestIndex;
      },
    },
    {
      id: 'count-max-occurrences',
      title: '11. count occurrences of the maximum value',
      methodName: 'countMaxOccurrences',
      description: 'Find the maximum value first, then count how often it appears.',
      starterCode: [
        'countMaxOccurrences(numbers) {',
        '  let max = numbers[0];',
        '  for (let i = 1; i < numbers.length; i += 1) {',
        '    if (numbers[i] > max) {',
        '      max = numbers[i];',
        '    }',
        '  }',
        '  let count = 0;',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    if (numbers[i] === max) {',
        '      count += 1;',
        '    }',
        '  }',
        '  return count;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -4, valueMax: 7 })] }),
      solution: (numbers) => {
        const values = numbers as number[];
        const max = Math.max(...values);
        return values.filter((value: number) => value === max).length;
      },
    },
    {
      id: 'most-frequent',
      title: '13. find value with most occurrences',
      methodName: 'mostFrequentValue',
      description: 'Return the value with the highest frequency. If frequencies tie, return the smaller value.',
      starterCode: [
        'mostFrequentValue(numbers) {',
        '  const counts = {};',
        '  let bestValue = numbers[0];',
        '  let bestCount = 0;',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    const value = numbers[i];',
        '    counts[value] = (counts[value] || 0) + 1;',
        '    if (counts[value] > bestCount || (counts[value] === bestCount && value < bestValue)) {',
        '      bestCount = counts[value];',
        '      bestValue = value;',
        '    }',
        '  }',
        '  return bestValue;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 5 })], note: 'Tie-breaker: smaller value wins.' }),
      solution: (numbers) => {
        const values = numbers as number[];
        const counts = new Map<number, number>();
        let bestValue = values[0]!;
        let bestCount = 0;
        for (const value of values) {
          const nextCount = (counts.get(value) || 0) + 1;
          counts.set(value, nextCount);
          if (nextCount > bestCount || (nextCount === bestCount && value < bestValue)) {
            bestCount = nextCount;
            bestValue = value;
          }
        }
        return bestValue;
      },
    },
    {
      id: 'second-extreme',
      title: '17. second largest/smallest',
      methodName: 'secondExtreme',
      description: 'Return the second distinct largest or smallest value. Mode is either "largest" or "smallest". Return null if no second distinct value exists.',
      starterCode: [
        'secondExtreme(numbers, mode) {',
        '  const unique = [];',
        '  for (let i = 0; i < numbers.length; i += 1) {',
        '    if (!unique.includes(numbers[i])) {',
        '      unique.push(numbers[i]);',
        '    }',
        '  }',
        '  unique.sort((left, right) => left - right);',
        '  if (unique.length < 2) {',
        '    return null;',
        '  }',
        '  return mode === "largest" ? unique[unique.length - 2] : unique[1];',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -4, valueMax: 8 }), pickOne(rng, ['largest', 'smallest'])],
        note: 'Second means second distinct value.',
      }),
      solution: (numbers, mode) => {
        const unique = Array.from(new Set(numbers as number[])).sort((left: number, right: number) => left - right);
        if (unique.length < 2) {
          return null;
        }
        return mode === 'largest' ? unique[unique.length - 2] : unique[1];
      },
    },
  ];
}
