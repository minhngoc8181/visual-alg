import { deepEqual, normalizePairs } from './comparison';
import {
  createNumberArray,
  createSortedArray,
  pickOne,
  randomInt,
  shuffleInPlace,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createTransformLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'reverse-array',
      title: '14. reverse array',
      methodName: 'reverseArray',
      description: 'Return a new array with the elements in reverse order.',
      starterCode: [
        'reverseArray(numbers) {',
        '  var reversed = [];',
        '  for (var i = numbers.size() - 1; i >= 0; i -= 1) {',
        '    reversed.add(numbers.get(i));',
        '  }',
        '  return reversed;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9 })] }),
      hints: [
        'Tạo mảng kết quả: var reversed = [];',
        'Duyệt ngược mảng gốc và thêm vào: for (var i = numbers.size() - 1; i >= 0; i -= 1) { reversed.add(numbers.get(i)); }'
      ],
      solution: (numbers) => (numbers as number[]).slice().reverse(),
    },
    {
      id: 'sort-ascending',
      title: '15. sort ascending',
      methodName: 'sortAscending',
      description: 'Return a new array sorted from smallest to largest.',
      starterCode: [
        'sortAscending(numbers) {',
        '  var sorted = numbers.slice();',
        '  for (var i = 0; i < sorted.size() - 1; i += 1) {',
        '    for (var j = 0; j < sorted.size() - 1 - i; j += 1) {',
        '      if (sorted.get(j) > sorted.get(j + 1)) {',
        '        var temp = sorted.get(j);',
        '        sorted.set(j, sorted.get(j + 1));',
        '        sorted.set(j + 1, temp);',
        '      }',
        '    }',
        '  }',
        '  return sorted;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -9, valueMax: 12 })] }),
      hints: [
        'Có thể dùng thuật toán nổi bọt (Bubble Sort) với 2 vòng lặp lồng nhau.',
        'Đổi chỗ hai phần tử: var temp = sorted.get(j); sorted.set(j, sorted.get(j + 1)); sorted.set(j + 1, temp);'
      ],
      solution: (numbers) => (numbers as number[]).slice().sort((left: number, right: number) => left - right),
    },
    {
      id: 'sort-descending',
      title: '16. sort descending',
      methodName: 'sortDescending',
      description: 'Return a new array sorted from largest to smallest.',
      starterCode: [
        'sortDescending(numbers) {',
        '  var sorted = numbers.slice();',
        '  for (var i = 0; i < sorted.size() - 1; i += 1) {',
        '    for (var j = 0; j < sorted.size() - 1 - i; j += 1) {',
        '      if (sorted.get(j) < sorted.get(j + 1)) {',
        '        var temp = sorted.get(j);',
        '        sorted.set(j, sorted.get(j + 1));',
        '        sorted.set(j + 1, temp);',
        '      }',
        '    }',
        '  }',
        '  return sorted;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -9, valueMax: 12 })] }),
      hints: [
        'Tương tự sắp xếp tăng dần, nhưng đổi chiều so sánh thành: if (sorted.get(j) < sorted.get(j + 1))'
      ],
      solution: (numbers) => (numbers as number[]).slice().sort((left: number, right: number) => right - left),
    },
    {
      id: 'remove-duplicates',
      title: '20. remove duplicates',
      methodName: 'removeDuplicates',
      description: 'Return a new array keeping only the first occurrence of each value.',
      starterCode: [
        'removeDuplicates(numbers) {',
        '  var result = [];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    if (!result.includes(numbers.get(i))) {',
        '      result.add(numbers.get(i));',
        '    }',
        '  }',
        '  return result;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 6, lengthMax: 10, valueMin: -3, valueMax: 4 })] }),
      hints: [
        'Khởi tạo mảng kết quả: var result = [];',
        'Chỉ thêm vào result nếu giá trị đó chưa có: if (!result.includes(numbers.get(i)))'
      ],
      solution: (numbers) => Array.from(new Set(numbers as number[])),
    },
    {
      id: 'pairs-with-sum',
      title: '21. find pairs that sum to target',
      methodName: 'pairsWithTargetSum',
      description: 'Return unique value pairs [a, b] such that a + b equals target, with a <= b. Order of pairs in the output does not matter.',
      starterCode: [
        'pairsWithTargetSum(numbers, target) {',
        '  var pairs = [];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    for (var j = i + 1; j < numbers.size(); j += 1) {',
        '      if (numbers.get(i) + numbers.get(j) === target) {',
        '        var pair = numbers.get(i) <= numbers.get(j) ? [numbers.get(i), numbers.get(j)] : [numbers.get(j), numbers.get(i)];',
        '        var key = pair[0] + ":" + pair[1];',
        '        var seen = false;',
        '        for (var k = 0; k < pairs.size(); k += 1) {',
        '          if (pairs.get(k)[0] + ":" + pairs.get(k)[1] === key) {',
        '            seen = true;',
        '            break;',
        '          }',
        '        }',
        '        if (!seen) {',
        '          pairs.add(pair);',
        '        }',
        '      }',
        '    }',
        '  }',
        '  return pairs;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 9, valueMin: -3, valueMax: 9 }), randomInt(rng, 0, 10)],
        note: 'Pairs are unique by value, not by index order.',
      }),
      hints: [
        'Dùng 2 vòng lặp lồng nhau đễ xét từng cặp: cho i từ 0.., j từ i + 1..',
        'Cẩn thận ghi nhận cặp duy nhất để tránh trùng lặp vào mảng kết quả.'
      ],
      solution: (numbers, target) => {
        const values = numbers as number[];
        const desired = target as number;
        const pairSet = new Set<string>();
        for (let i = 0; i < values.length; i += 1) {
          for (let j = i + 1; j < values.length; j += 1) {
            if (values[i]! + values[j]! === desired) {
              const left = Math.min(values[i]!, values[j]!);
              const right = Math.max(values[i]!, values[j]!);
              pairSet.add(JSON.stringify([left, right]));
            }
          }
        }
        return Array.from(pairSet, (entry: string) => JSON.parse(entry) as [number, number]);
      },
      checker: ({ actual, expected }) => {
        const normalizedActual = normalizePairs(actual);
        const normalizedExpected = normalizePairs(expected);
        const pass = deepEqual(normalizedActual, normalizedExpected);
        return {
          pass,
          message: 'Return unique value pairs [a, b] with a <= b. Pair order is ignored.',
        };
      },
    },
    {
      id: 'rotate',
      title: '22. rotate left or right by k',
      methodName: 'rotateArray',
      description: 'Return a new array rotated left or right by k positions.',
      starterCode: [
        'rotateArray(numbers, k, direction) {',
        '  var length = numbers.size();',
        '  var shift = ((k % length) + length) % length;',
        '  if (shift === 0) {',
        '    return numbers.slice();',
        '  }',
        '  if (direction === "left") {',
        '    return numbers.slice(shift).concat(numbers.slice(0, shift));',
        '  }',
        '  return numbers.slice(length - shift).concat(numbers.slice(0, length - shift));',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 }), randomInt(rng, 0, 12), pickOne(rng, ['left', 'right'])],
      }),
      hints: [
        'Xử lý số lần dịch k có thể lớn hơn độ dài mảng: var shift = ((k % length) + length) % length;',
        'Tách mảng bằng slice và nối lại bằng concat.'
      ],
      solution: (numbers, k, direction) => {
        const values = numbers as number[];
        const shiftBase = k as number;
        const directionValue = direction as 'left' | 'right';
        const length = values.length;
        const shift = ((shiftBase % length) + length) % length;
        if (shift === 0) {
          return values.slice();
        }
        if (directionValue === 'left') {
          return values.slice(shift).concat(values.slice(0, shift));
        }
        return values.slice(length - shift).concat(values.slice(0, length - shift));
      },
    },
    {
      id: 'longest-run',
      title: '23. find the longest consecutive identical run',
      methodName: 'longestConsecutiveRun',
      description: 'Return the length of the longest streak of equal neighboring values.',
      starterCode: [
        'longestConsecutiveRun(numbers) {',
        '  var best = 1;',
        '  var current = 1;',
        '  for (var i = 1; i < numbers.size(); i += 1) {',
        '    if (numbers.get(i) === numbers.get(i - 1)) {',
        '      current += 1;',
        '      if (current > best) {',
        '        best = current;',
        '      }',
        '    } else {',
        '      current = 1;',
        '    }',
        '  }',
        '  return best;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: 0, valueMax: 4 })] }),
      hints: [
        'Giữ một chuỗi hiện tại và chuỗi dài nhất: var best = 1; var current = 1;',
        'Cộng dồn current nếu numbers.get(i) === numbers.get(i-1), ngược lại reset current về 1.'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        let best = 1;
        let current = 1;
        for (let i = 1; i < values.length; i += 1) {
          if (values[i] === values[i - 1]) {
            current += 1;
            best = Math.max(best, current);
          } else {
            current = 1;
          }
        }
        return best;
      },
    },
    {
      id: 'merge-sorted',
      title: '24. merge two sorted arrays',
      methodName: 'mergeSortedArrays',
      description: 'Merge two already sorted arrays into one sorted result.',
      starterCode: [
        'mergeSortedArrays(left, right) {',
        '  var merged = [];',
        '  var i = 0;',
        '  var j = 0;',
        '  while (i < left.size() && j < right.size()) {',
        '    if (left.get(i) <= right.get(j)) {',
        '      merged.add(left.get(i));',
        '      i += 1;',
        '    } else {',
        '      merged.add(right.get(j));',
        '      j += 1;',
        '    }',
        '  }',
        '  while (i < left.size()) {',
        '    merged.add(left.get(i));',
        '    i += 1;',
        '  }',
        '  while (j < right.size()) {',
        '    merged.add(right.get(j));',
        '    j += 1;',
        '  }',
        '  return merged;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createSortedArray(rng, { lengthMin: 3, lengthMax: 6, valueMin: -6, valueMax: 8 }), createSortedArray(rng, { lengthMin: 3, lengthMax: 6, valueMin: -6, valueMax: 8 })],
      }),
      hints: [
        'Chạy 2 con trỏ i và j song song trên hai mảng left và right.',
        'So sánh left.get(i) và right.get(j), lấy số nhỏ hơn thêm vào mảng merged.',
        'Sau vòng lặp, đừng quên add() các phần tử còn lại của mảng kia.'
      ],
      solution: (left, right) => (left as number[]).concat(right as number[]).sort((a: number, b: number) => a - b),
    },
    {
      id: 'missing-number',
      title: '25. find the missing number in a sequence',
      methodName: 'missingNumber',
      description: 'The array contains every number from 0 to n except one. Return the missing number.',
      starterCode: [
        'missingNumber(numbers) {',
        '  var n = numbers.size();',
        '  var expected = (n * (n + 1)) / 2;',
        '  var actual = 0;',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    actual += numbers.get(i);',
        '  }',
        '  return expected - actual;',
        '}',
      ].join('\n'),
      genTest: (rng) => {
        const n = randomInt(rng, 4, 9);
        const missing = randomInt(rng, 0, n);
        const numbers: number[] = [];
        for (let value = 0; value <= n; value += 1) {
          if (value !== missing) {
            numbers.push(value);
          }
        }
        shuffleInPlace(numbers, rng);
        return { args: [numbers], note: 'Input order is not guaranteed.' };
      },
      hints: [
        'Cách hiệu quả là tính tổng dãy đầy đủ bằng công thức: n * (n + 1) / 2',
        'Tính tổng thực tế mảng truyền vào, hiệu hai tổng sẽ ra số bị thiếu.'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        const n = values.length;
        const expected = (n * (n + 1)) / 2;
        const actual = values.reduce((sum: number, value: number) => sum + value, 0);
        return expected - actual;
      },
    },
  ];
}
