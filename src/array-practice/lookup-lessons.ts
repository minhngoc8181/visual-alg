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
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) === target) {',
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
      hints: [
        'Dùng vòng lặp for từ 0 đến mảng.size() - 1',
        'if (numbers.get(i) === target) { return i; }',
      ],
      solution: (numbers, target) => (numbers as number[]).indexOf(target as number),
    },
    {
      id: 'last-index-of',
      title: '2. lastIndexOf(value)',
      methodName: 'lastIndexOfValue',
      description: 'Return the last index where target appears, or -1 if it does not exist.',
      starterCode: [
        'lastIndexOfValue(numbers, target) {',
        '  for (var i = numbers.size() - 1; i >= 0; i -= 1) {',
        '    if (numbers.get(i) === target) {',
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
      hints: [
        'Dùng vòng lặp for chạy ngược từ cuối mảng:',
        'for (var i = numbers.size() - 1; i >= 0; i -= 1) { ... }'
      ],
      solution: (numbers, target) => (numbers as number[]).lastIndexOf(target as number),
    },
    {
      id: 'contains-value',
      title: '3. contains(value)',
      methodName: 'containsValue',
      description: 'Return true when target exists in the array, otherwise false.',
      starterCode: [
        'containsValue(numbers, target) {',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) === target) {',
        '      return true;',
        '    }',
        '  }',
        '  return false;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 }), randomInt(rng, -5, 9)],
      }),
      hints: [
        'Dùng vòng lặp tìm kiếm. Nếu thấy trả về true ngay lập tức.',
        'Kết thúc vòng lặp không thấy thì trả về false.'
      ],
      solution: (numbers, target) => (numbers as number[]).includes(target as number),
    },
    {
      id: 'count-occurrences',
      title: '10. count occurrences of a specific value',
      methodName: 'countOccurrences',
      description: 'Count how many times target appears.',
      starterCode: [
        'countOccurrences(numbers, target) {',
        '  var count = 0;',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) === target) {',
        '      count += 1;',
        '    }',
        '  }',
        '  return count;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 6 }), randomInt(rng, -2, 6)],
      }),
      hints: [
        'Khởi tạo biến đếm: var count = 0;',
        'Mỗi khi tìm thấy target thì: count += 1;'
      ],
      solution: (numbers, target) => (numbers as number[]).filter((value: number) => value === (target as number)).length,
    },
    {
      id: 'all-indices',
      title: '18. find all indices where a value appears',
      methodName: 'allIndicesOfValue',
      description: 'Return an array containing every index where target appears.',
      starterCode: [
        'allIndicesOfValue(numbers, target) {',
        '  var indices = [];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) === target) {',
        '      indices.add(i);',
        '    }',
        '  }',
        '  return indices;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 5 }), randomInt(rng, -2, 5)] }),
      hints: [
        'Khởi tạo mảng rỗng: var indices = [];',
        'Thêm index vào kết quả: indices.add(i);'
      ],
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
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) < numbers.get(i - 1)) {',
        '      return false;',
        '    }',
        '  }',
        '  return true;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [rng() > 0.5 ? createSortedArray(rng, { lengthMin: 4, lengthMax: 8 }) : createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -8, valueMax: 10 })],
      }),
      hints: [
        'Kiểm tra từng cặp liền kề: if (numbers.get(i) < numbers.get(i - 1)) { return false; }',
        'Nếu không có vi phạm nào sau vòng lặp thì mảng đã sắp xếp (return true).'
      ],
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
