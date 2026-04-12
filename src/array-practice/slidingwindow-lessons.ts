import {
  createPositiveArray,
  createNumberArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createSlidingWindowLessonConfigs(): LessonConfig[] {
  return [
    // ─── Fixed Size: Max sum of subarray of size k ───────────────────────────
    {
      id: 'max-sum-subarray-k',
      title: '29. max sum of subarray of size k',
      methodName: 'maxSumSubarrayK',
      description:
        'Given an array and integer k, return the maximum sum of any contiguous subarray of exactly k elements.',
      starterCode: [
        'maxSumSubarrayK(numbers, k) {',
        '  var windowSum = 0;',
        '  for (var i = 0; i < k; i += 1) {',
        '    windowSum += numbers.get(i);',
        '  }',
        '  var maxSum = windowSum;',
        '  for (var i = k; i < numbers.size(); i += 1) {',
        '    windowSum += numbers.get(i) - numbers.get(i - k);',
        '    if (windowSum > maxSum) {',
        '      maxSum = windowSum;',
        '    }',
        '  }',
        '  return maxSum;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 1000, 100000);
        const numbers = createNumberArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: -100, valueMax: 200,
        });
        const k = context.preferSmall
          ? randomInt(rng, 2, Math.min(numbers.length, 5))
          : randomInt(rng, 2, Math.min(numbers.length, 1000));
        return { args: [numbers, k] };
      },
      hints: [
        'Tính tổng k phần tử đầu tiên: windowSum = sum(0..k-1).',
        'Trượt cửa sổ sang phải 1 bước: cộng phần tử mới, trừ phần tử bị loại.',
        'windowSum += numbers.get(i) - numbers.get(i - k);',
        'Cập nhật maxSum nếu windowSum lớn hơn.',
      ],
      solution: (numbers, k) => {
        const arr = numbers as number[];
        const size = k as number;
        let windowSum = 0;
        for (let i = 0; i < size; i += 1) {
          windowSum += arr[i]!;
        }
        let maxSum = windowSum;
        for (let i = size; i < arr.length; i += 1) {
          windowSum += arr[i]! - arr[i - size]!;
          if (windowSum > maxSum) {
            maxSum = windowSum;
          }
        }
        return maxSum;
      },
    },

    // ─── Variable Size: Shortest subarray with sum ≥ target ──────────────────
    {
      id: 'shortest-subarray-sum',
      title: '30. shortest subarray with sum ≥ target',
      methodName: 'shortestSubarraySum',
      description:
        'Given an array of positive integers and a target, return the length of the shortest contiguous subarray whose sum is ≥ target. Return 0 if no such subarray exists.',
      starterCode: [
        'shortestSubarraySum(numbers, target) {',
        '  var left = 0;',
        '  var currentSum = 0;',
        '  var minLen = numbers.size() + 1;',
        '  for (var right = 0; right < numbers.size(); right += 1) {',
        '    currentSum += numbers.get(right);',
        '    while (currentSum >= target) {',
        '      var windowLen = right - left + 1;',
        '      if (windowLen < minLen) {',
        '        minLen = windowLen;',
        '      }',
        '      currentSum -= numbers.get(left);',
        '      left += 1;',
        '    }',
        '  }',
        '  if (minLen > numbers.size()) {',
        '    return 0;',
        '  }',
        '  return minLen;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 1000, 100000);
        const numbers = createPositiveArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: 1, valueMax: 100,
        });
        const totalSum = numbers.reduce((s, v) => s + v, 0);
        // sometimes pick a reachable target, sometimes unreachable
        const target = rng() > 0.2
          ? randomInt(rng, 3, Math.min(totalSum, context.preferSmall ? 30 : 5000))
          : totalSum + randomInt(rng, 1, 5);
        return { args: [numbers, target] };
      },
      hints: [
        'Dùng cửa sổ trượt kích thước thay đổi: mở rộng bên phải, thu hẹp bên trái.',
        'Mở rộng: cộng numbers.get(right) vào currentSum.',
        'Thu hẹp: khi currentSum ≥ target, cập nhật minLen rồi trừ numbers.get(left), tăng left.',
        'Trả 0 nếu minLen không bao giờ được cập nhật.',
      ],
      solution: (numbers, target) => {
        const arr = numbers as number[];
        const t = target as number;
        let left = 0;
        let currentSum = 0;
        let minLen = arr.length + 1;
        for (let right = 0; right < arr.length; right += 1) {
          currentSum += arr[right]!;
          while (currentSum >= t) {
            const windowLen = right - left + 1;
            if (windowLen < minLen) {
              minLen = windowLen;
            }
            currentSum -= arr[left]!;
            left += 1;
          }
        }
        return minLen > arr.length ? 0 : minLen;
      },
    },
  ];
}
