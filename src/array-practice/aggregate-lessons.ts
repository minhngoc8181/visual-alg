import { createNumberArray } from './lesson-helpers';
import type { LessonConfig } from './types';

export function createAggregateLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'sum-all',
      title: '8. calculate sum of all elements',
      methodName: 'sumAllElements',
      description: 'Return the sum of all array elements.',
      starterCode: [
        'sumAllElements(numbers) {',
        '  var sum = 0;',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    sum += numbers.get(i);',
        '  }',
        '  return sum;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -8, valueMax: 12 })] }),
      hints: [
        'Khởi tạo biến tổng: var sum = 0;',
        'Cộng dồn trong vòng lặp: sum += numbers.get(i);'
      ],
      solution: (numbers) => (numbers as number[]).reduce((sum: number, value: number) => sum + value, 0),
    },
    {
      id: 'average',
      title: '9. calculate average of all elements',
      methodName: 'averageOfElements',
      description: 'Return the arithmetic mean of a non-empty array.',
      starterCode: [
        'averageOfElements(numbers) {',
        '  var sum = 0;',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    sum += numbers.get(i);',
        '  }',
        '  return sum / numbers.size();',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 7, valueMin: -10, valueMax: 14 })], note: 'Use the exact average, not rounded.' }),
      hints: [
        'Tính tổng giống bài sum-all.',
        'Chia cho độ dài mảng: return sum / numbers.size();'
      ],
      solution: (numbers) => (numbers as number[]).reduce((sum: number, value: number) => sum + value, 0) / (numbers as number[]).length,
      checker: ({ actual, expected }) => ({
        pass: typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9,
        message: 'Average must match the exact arithmetic mean.',
      }),
    },
    {
      id: 'count-unique',
      title: '12. count unique values in array',
      methodName: 'countUniqueValues',
      description: 'Return how many distinct values appear in the array.',
      starterCode: [
        'countUniqueValues(numbers) {',
        '  var seen = [];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (!seen.includes(numbers.get(i))) {',
        '      seen.add(numbers.get(i));',
        '    }',
        '  }',
        '  return seen.size();',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -3, valueMax: 5 })] }),
      hints: [
        'Khởi tạo mảng lưu các giá trị đã thấy: var seen = [];',
        'Nếu chưa thấy thì thêm vào: if (!seen.includes(numbers.get(i))) { seen.add(numbers.get(i)); }',
        'Trả về seen.size();'
      ],
      solution: (numbers) => new Set(numbers as number[]).size,
    },
  ];
}
