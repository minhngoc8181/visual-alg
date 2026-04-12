import {
  createNumberArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createPrefixSumLessonConfigs(): LessonConfig[] {
  return [
    // ─── Basic: Build prefix sum array ───────────────────────────────────────
    {
      id: 'build-prefix-sum',
      title: '31. build prefix sum array',
      methodName: 'buildPrefixSum',
      description:
        'Given an array of n numbers, return a prefix sum array of length n+1 where prefix[0] = 0 and prefix[i] = sum of elements from index 0 to i-1.',
      starterCode: [
        'buildPrefixSum(numbers) {',
        '  var prefix = [0];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    prefix.add(prefix.get(i) + numbers.get(i));',
        '  }',
        '  return prefix;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 4, 10)
          : randomInt(rng, 1000, 100000);
        return {
          args: [createNumberArray(rng, { lengthMin: len, lengthMax: len, valueMin: -100, valueMax: 200 })],
        };
      },
      hints: [
        'Khởi tạo: var prefix = [0]; (phần tử đầu luôn bằng 0).',
        'Duyệt qua mảng: prefix.add(prefix.get(i) + numbers.get(i));',
        'Mảng prefix sẽ có size() = numbers.size() + 1.',
      ],
      solution: (numbers) => {
        const arr = numbers as number[];
        const prefix: number[] = [0];
        for (let i = 0; i < arr.length; i += 1) {
          prefix.push(prefix[i]! + arr[i]!);
        }
        return prefix;
      },
    },

    // ─── Applied: Range sum queries ──────────────────────────────────────────
    {
      id: 'range-sum-queries',
      title: '32. range sum queries (prefix sum)',
      methodName: 'rangeSumQueries',
      description:
        'Given an array and a list of queries [l, r], return an array of answers where each answer is the sum of elements from index l to r (inclusive). Use prefix sum for efficiency.',
      starterCode: [
        'rangeSumQueries(numbers, queries) {',
        '  var prefix = [0];',
        '  for (var i = 0; i < numbers.size(); i += 1) {',
        '    prefix.add(prefix.get(i) + numbers.get(i));',
        '  }',
        '  var results = [];',
        '  for (var q = 0; q < queries.size(); q += 1) {',
        '    var l = queries.get(q).get(0);',
        '    var r = queries.get(q).get(1);',
        '    results.add(prefix.get(r + 1) - prefix.get(l));',
        '  }',
        '  return results;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const arrLen = context.preferSmall
          ? randomInt(rng, 5, 10)
          : randomInt(rng, 10000, 100000);
        const numbers = createNumberArray(rng, {
          lengthMin: arrLen, lengthMax: arrLen,
          valueMin: -100, valueMax: 200,
        });
        const queryCount = context.preferSmall
          ? randomInt(rng, 2, 5)
          : randomInt(rng, 100, 10000);
        const queries: number[][] = [];
        for (let q = 0; q < queryCount; q += 1) {
          const l = randomInt(rng, 0, numbers.length - 2);
          const r = randomInt(rng, l, numbers.length - 1);
          queries.push([l, r]);
        }
        return { args: [numbers, queries] };
      },
      hints: [
        'Bước 1: Xây dựng mảng prefix sum (giống bài 31).',
        'Bước 2: Với mỗi query [l, r]: kết quả = prefix.get(r + 1) - prefix.get(l).',
        'Công thức: sum(l..r) = prefix[r+1] - prefix[l].',
      ],
      solution: (numbers, queries) => {
        const arr = numbers as number[];
        const qs = queries as number[][];
        const prefix: number[] = [0];
        for (let i = 0; i < arr.length; i += 1) {
          prefix.push(prefix[i]! + arr[i]!);
        }
        return qs.map(([l, r]) => prefix[r! + 1]! - prefix[l!]!);
      },
    },
  ];
}
