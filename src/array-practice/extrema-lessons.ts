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
        '  var max = numbers.get(0);',
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) > max) {',
        '      max = numbers.get(i);',
        '    }',
        '  }',
        '  return max;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 8, valueMin: -12, valueMax: 18 })] }),
      hints: [
        'Giả sử phần tử đầu tiên là lớn nhất: var max = numbers.get(0);',
        'So sánh với các phần tử khác: if (numbers.get(i) > max) { max = numbers.get(i); }'
      ],
      solution: (numbers) => Math.max(...(numbers as number[])),
    },
    {
      id: 'find-min',
      title: '5. find minimum value',
      methodName: 'findMinValue',
      description: 'Return the minimum number in a non-empty array.',
      starterCode: [
        'findMinValue(numbers) {',
        '  var min = numbers.get(0);',
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) < min) {',
        '      min = numbers.get(i);',
        '    }',
        '  }',
        '  return min;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 8, valueMin: -12, valueMax: 18 })] }),
      hints: [
        'Giả sử phần tử đầu tiên là nhỏ nhất: var min = numbers.get(0);',
        'So sánh: if (numbers.get(i) < min) { min = numbers.get(i); }'
      ],
      solution: (numbers) => Math.min(...(numbers as number[])),
    },
    {
      id: 'index-of-max',
      title: '6. find index of maximum value',
      methodName: 'indexOfMaxValue',
      description: 'Return the index of the first maximum value.',
      starterCode: [
        'indexOfMaxValue(numbers) {',
        '  var bestIndex = 0;',
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) > numbers.get(bestIndex)) {',
        '      bestIndex = i;',
        '    }',
        '  }',
        '  return bestIndex;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 })], note: 'If the max repeats, return the first index.' }),
      hints: [
        'Theo dõi vị trí lớn nhất: var bestIndex = 0;',
        'So sánh giá trị tại bestIndex với giá trị tại i: if (numbers.get(i) > numbers.get(bestIndex)) { bestIndex = i; }'
      ],
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
        '  var bestIndex = 0;',
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) < numbers.get(bestIndex)) {',
        '      bestIndex = i;',
        '    }',
        '  }',
        '  return bestIndex;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 })], note: 'If the min repeats, return the first index.' }),
      hints: [
        'Theo dõi vị trí nhỏ nhất: var bestIndex = 0;',
        'So sánh: if (numbers.get(i) < numbers.get(bestIndex)) { bestIndex = i; }'
      ],
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
        '  var max = numbers.get(0);',
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) > max) {',
        '      max = numbers.get(i);',
        '    }',
        '  }',
        '  var count = 0;',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) === max) {',
        '      count += 1;',
        '    }',
        '  }',
        '  return count;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -4, valueMax: 7 })] }),
      hints: [
        'Cách đơn giản nhất là dùng 2 vòng lặp.',
        'Vòng lặp 1: Tìm giá trị lớn nhất (max).',
        'Vòng lặp 2: Đếm số lần giá trị max xuất hiện.'
      ],
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
        '  var counts = {};',
        '  var bestValue = numbers.get(0);',
        '  var bestCount = 0;',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    var value = numbers.get(i);',
        '    counts.put(value, counts.getOrDefault(value, 0) + 1);',
        '    if (counts.get(value) > bestCount || (counts.get(value) === bestCount && value < bestValue)) {',
        '      bestCount = counts.get(value);',
        '      bestValue = value;',
        '    }',
        '  }',
        '  return bestValue;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 5 })], note: 'Tie-breaker: smaller value wins.' }),
      hints: [
        'Tạo map để đếm: var counts = {};',
        'Tăng đếm bằng getOrDefault: counts.put(value, counts.getOrDefault(value, 0) + 1);',
        'Lưu lại giá trị xuất hiện nhiều nhất trong lúc duyệt.'
      ],
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
        '  var unique = [];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (!unique.includes(numbers.get(i))) {',
        '      unique.add(numbers.get(i));',
        '    }',
        '  }',
        '  unique.sort((left, right) => left - right);',
        '  if (unique.size() < 2) {',
        '    return null;',
        '  }',
        '  return mode === "largest" ? unique.get(unique.size() - 2) : unique.get(1);',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -4, valueMax: 8 }), pickOne(rng, ['largest', 'smallest'])],
        note: 'Second means second distinct value.',
      }),
      hints: [
        'Có thể dùng mảng loại bỏ giá trị trùng lặp: unique.add(numbers.get(i));',
        'Sắp xếp lại mảng vừa tìm được: unique.sort((a, b) => a - b);',
        'Lấy vị trí tương ứng từ cuối mảng hoặc đầu mảng tùy theo yêu cầu lớn thứ 2 hay bé thứ 2.'
      ],
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
