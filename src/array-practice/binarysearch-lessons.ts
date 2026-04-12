import {
  createSortedArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createBinarySearchLessonConfigs(): LessonConfig[] {
  return [
    // ─── Classic: Binary Search ──────────────────────────────────────────────
    {
      id: 'binary-search',
      title: '33. binary search',
      methodName: 'binarySearch',
      description:
        'Given a sorted array, find the index of target using binary search. Return -1 if not found.',
      starterCode: [
        'binarySearch(numbers, target) {',
        '  var left = 0;',
        '  var right = numbers.size() - 1;',
        '  while (left <= right) {',
        '    var mid = Math.floor((left + right) / 2);',
        '    if (numbers.get(mid) === target) {',
        '      return mid;',
        '    } else if (numbers.get(mid) < target) {',
        '      left = mid + 1;',
        '    } else {',
        '      right = mid - 1;',
        '    }',
        '  }',
        '  return -1;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 10000, 200000);
        const numbers = createSortedArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: -1000, valueMax: 2000,
        });
        // pick from array or a random miss
        const target = rng() > 0.3
          ? numbers[randomInt(rng, 0, numbers.length - 1)]!
          : randomInt(rng, -1200, 2200);
        return { args: [numbers, target] };
      },
      hints: [
        'Đặt left = 0, right = numbers.size() - 1.',
        'Tính mid = Math.floor((left + right) / 2) để lấy phần nguyên.',
        'So sánh numbers.get(mid) với target:',
        '  === target → return mid',
        '  < target → left = mid + 1',
        '  > target → right = mid - 1',
      ],
      solution: (numbers, target) => {
        const arr = numbers as number[];
        const t = target as number;
        let left = 0;
        let right = arr.length - 1;
        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          if (arr[mid]! === t) {
            return mid;
          } else if (arr[mid]! < t) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }
        return -1;
      },
    },

    // ─── Lower Bound: Find first occurrence ≥ target ─────────────────────────
    {
      id: 'first-occurrence',
      title: '34. lower bound (first index ≥ target)',
      methodName: 'lowerBound',
      description:
        'Given a sorted array (may have duplicates), find the first index where arr[index] >= target. Return arr.size() if all elements are smaller than target.',
      starterCode: [
        'lowerBound(numbers, target) {',
        '  var left = 0;',
        '  var right = numbers.size();',
        '  while (left < right) {',
        '    var mid = Math.floor((left + right) / 2);',
        '    if (numbers.get(mid) < target) {',
        '      left = mid + 1;',
        '    } else {',
        '      right = mid;',
        '    }',
        '  }',
        '  return left;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 10000, 200000);
        const numbers = createSortedArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: -1000, valueMax: 2000,
        });
        const target = randomInt(rng, -1200, 2200);
        return { args: [numbers, target] };
      },
      hints: [
        'Khác binary search thường: right bắt đầu = numbers.size() (không phải size() - 1).',
        'Điều kiện lặp: left < right (không phải left <= right).',
        'Nếu numbers.get(mid) < target → left = mid + 1.',
        'Ngược lại → right = mid (không trừ 1, vì mid có thể là đáp án).',
        'Kết quả: return left;',
      ],
      solution: (numbers, target) => {
        const arr = numbers as number[];
        const t = target as number;
        let left = 0;
        let right = arr.length;
        while (left < right) {
          const mid = Math.floor((left + right) / 2);
          if (arr[mid]! < t) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        return left;
      },
    },
  ];
}
