import type { PlannedTestCaseFactory, RawTestCase } from './types';
import {
  createLookupArray,
  createMissingNumberCase,
  createSortedFromPattern,
  makeCase,
  repeatPattern,
} from './lesson-helpers';

export type CoveragePlan = {
  visibleCases: Array<RawTestCase | PlannedTestCaseFactory>;
  hiddenCases: Array<RawTestCase | PlannedTestCaseFactory>;
};

export function createCoveragePlan(lessonId: string): CoveragePlan {
  switch (lessonId) {
    case 'index-of':
    case 'last-index-of':
    case 'contains-value':
    case 'count-occurrences':
    case 'all-indices':
      return lookupCoveragePlan();
    case 'find-max':
    case 'find-min':
      return extremaValueCoveragePlan();
    case 'index-of-max':
      return extremaIndexCoveragePlan('max');
    case 'index-of-min':
      return extremaIndexCoveragePlan('min');
    case 'sum-all':
    case 'average':
      return aggregateCoveragePlan();
    case 'count-max-occurrences':
      return countMaxCoveragePlan();
    case 'count-unique':
      return countUniqueCoveragePlan();
    case 'most-frequent':
      return mostFrequentCoveragePlan();
    case 'reverse-array':
    case 'sort-ascending':
    case 'sort-descending':
    case 'remove-duplicates':
      return transformCoveragePlan();
    case 'second-extreme':
      return secondExtremeCoveragePlan();
    case 'is-sorted':
      return sortedCheckCoveragePlan();
    case 'pairs-with-sum':
      return pairSumCoveragePlan();
    case 'rotate':
      return rotateCoveragePlan();
    case 'longest-run':
      return runCoveragePlan();
    case 'merge-sorted':
      return mergeCoveragePlan();
    case 'missing-number':
      return missingNumberCoveragePlan();
    default:
      return { visibleCases: [], hiddenCases: [] };
  }
}

function lookupCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[8, 2, 5, 2, 9], 2], 'Target repeats. This catches first-index vs last-index mistakes.'),
      makeCase([[4, 7, 1, 6], 9], 'Target is absent.'),
      makeCase([[3, 3, 3, 3], 3], 'Every position matches the target.'),
      makeCase([[6, 1, 9, 4, 5], 5], 'Target appears only at the last index.'),
      makeCase([[2, 7, 2, 9, 2, 1], 2], 'Multiple hits appear across the array.'),
    ],
    hiddenCases: [
      makeCase([createLookupArray(22, 7, []), 7], 'Large array with no match.'),
      makeCase([createLookupArray(24, 5, [0, 11, 20]), 5], 'Large array with repeated target including index 0.'),
      makeCase([createLookupArray(26, 4, [25]), 4], 'Large array with target only at the last index.'),
      makeCase([createLookupArray(28, -2, [0, 1, 2, 3]), -2], 'Large array with a target cluster at the front.'),
      makeCase([createLookupArray(28, 6, [22, 23, 24, 25]), 6], 'Large array with a target cluster near the end.'),
      makeCase([createLookupArray(30, 3, [1, 6, 11, 16, 21, 26]), 3], 'Alternating target placements.'),
      makeCase([createLookupArray(32, -4, [17]), -4], 'Single match in the middle of a large array.'),
      makeCase([createLookupArray(34, 8, [4, 8, 12, 16, 20, 24, 28]), 8], 'Many repeated matches across a large array.'),
      makeCase([createLookupArray(36, 0, []), 0], 'Long absent-target scan with mixed values.'),
    ],
  };
}

function extremaValueCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[3, 8, 1, 6]], 'Mixed values with a clear internal extreme.'),
      makeCase([[-4, -9, -2, -9]], 'Negative values only.'),
      makeCase([[5, 5, 5, 5]], 'All values are equal.'),
      makeCase([[0, 7, 0, 3, 7, 2]], 'The extreme value repeats.'),
      makeCase([[9, 1, 8, 2, 7, 3]], 'Extreme value appears at the start.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([4, 1, 9, 3, 8, 2], 18)], 'Long alternating pattern.'),
      makeCase([repeatPattern([-5, -2, -9, -1, -7], 20)], 'Long negative-only pattern.'),
      makeCase([repeatPattern([6, 6, 6, 6, 6], 22)], 'Large uniform array.'),
      makeCase([repeatPattern([0, 14, 1, 13, 2, 12], 24)], 'High values appear in many positions.'),
      makeCase([repeatPattern([11, 3, 10, 4, 9, 5], 26)], 'Large zig-zag pattern.'),
      makeCase([repeatPattern([-8, 2, -7, 3, -6, 4], 28)], 'Mixed signs in a longer array.'),
      makeCase([repeatPattern([5, 1, 5, 2, 5, 3], 30)], 'Repeated extreme candidates.'),
      makeCase([repeatPattern([9, 8, 7, 6, 5, 4, 3], 32)], 'Descending-heavy pattern.'),
      makeCase([repeatPattern([1, 2, 3, 4, 5, 6, 20], 34)], 'Extreme value repeats at predictable intervals.'),
    ],
  };
}

function extremaIndexCoveragePlan(kind: 'max' | 'min'): CoveragePlan {
  const visibleCases = kind === 'max'
    ? [
      makeCase([[7, 1, 7, 3, 7]], 'Maximum repeats. Return the first maximum index.'),
      makeCase([[2, 9, 4, 9, 1]], 'Maximum repeats away from index 0.'),
      makeCase([[-1, -5, -1, -3]], 'Negative values with repeated maximum.'),
      makeCase([[0, 2, 4, 6]], 'Maximum appears at the last index.'),
      makeCase([[5, 5, 5, 5]], 'All values equal. The first index wins.'),
    ]
    : [
      makeCase([[1, -7, 3, -7, 4]], 'Minimum repeats. Return the first minimum index.'),
      makeCase([[2, 9, 4, 1, 1]], 'Minimum repeats near the end.'),
      makeCase([[-5, -5, -1, -3]], 'Negative values with repeated minimum.'),
      makeCase([[6, 4, 2, 0]], 'Minimum appears at the last index.'),
      makeCase([[5, 5, 5, 5]], 'All values equal. The first index wins.'),
    ];

  const hiddenCases = kind === 'max'
    ? [
      makeCase([repeatPattern([9, 1, 9, 2, 9, 3], 24)], 'Large array with many tied maxima.'),
      makeCase([repeatPattern([4, 12, 7, 12, 2, 12], 26)], 'Tied maxima should still return the first maximum index.'),
      makeCase([repeatPattern([-1, -4, -1, -5, -1], 28)], 'Repeated negative maxima.'),
      makeCase([repeatPattern([0, 1, 2, 3, 20], 30)], 'Maximum near the tail in a large array.'),
      makeCase([repeatPattern([13, 13, 8, 7, 6], 32)], 'Maximum starts immediately at index 0.'),
      makeCase([repeatPattern([5, 11, 11, 10, 9], 34)], 'First repeated maximum must be chosen.'),
      makeCase([repeatPattern([3, 14, 1, 14, 2, 14, 0], 36)], 'Large repeated maxima with gaps.'),
      makeCase([repeatPattern([8, 7, 6, 5, 4, 3, 2, 1], 38)], 'Descending segments repeated.'),
      makeCase([repeatPattern([10, 0, 9, 0, 8, 0, 10], 40)], 'The first top value is not the last top value.'),
    ]
    : [
      makeCase([repeatPattern([-9, 1, -9, 2, -9, 3], 24)], 'Large array with many tied minima.'),
      makeCase([repeatPattern([4, -12, 7, -12, 2, -12], 26)], 'Tied minima should still return the first minimum index.'),
      makeCase([repeatPattern([-8, -8, -1, -5, -1], 28)], 'Repeated minima at the front.'),
      makeCase([repeatPattern([20, 3, 2, 1, 0], 30)], 'Minimum near the tail in a large array.'),
      makeCase([repeatPattern([-13, -13, 8, 7, 6], 32)], 'Minimum starts immediately at index 0.'),
      makeCase([repeatPattern([5, -11, -11, 10, 9], 34)], 'First repeated minimum must be chosen.'),
      makeCase([repeatPattern([3, -14, 1, -14, 2, -14, 0], 36)], 'Large repeated minima with gaps.'),
      makeCase([repeatPattern([8, 7, 6, 5, 4, 3, 2, -1], 38)], 'Minimum appears in the repeated tail.'),
      makeCase([repeatPattern([-10, 0, -9, 0, -8, 0, -10], 40)], 'The first lowest value is not the last lowest value.'),
    ];

  return { visibleCases, hiddenCases };
}

function aggregateCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 2, 3, 4]], 'Simple increasing sequence.'),
      makeCase([[-5, 10, -5, 10]], 'Positive and negative values balance out.'),
      makeCase([[0, 0, 0, 0]], 'All zero values.'),
      makeCase([[7, 7, 7]], 'All values equal.'),
      makeCase([[-3, -1, -4, -2]], 'Negative-only array.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([1, 2, 3, 4, 5], 20)], 'Long increasing pattern.'),
      makeCase([repeatPattern([-6, 9, -4, 7, -2, 5], 22)], 'Long mixed-sign pattern.'),
      makeCase([repeatPattern([10, 10, 10, 10], 24)], 'Large uniform array.'),
      makeCase([repeatPattern([0, 1, 0, 1, 0, 1], 26)], 'Binary-like accumulation pattern.'),
      makeCase([repeatPattern([-8, -7, -6, -5], 28)], 'Large negative-only array.'),
      makeCase([repeatPattern([3, 1, 4, 1, 5, 9], 30)], 'Repeated digits pattern.'),
      makeCase([repeatPattern([12, -3, 8, -1, 4], 32)], 'Long mixed weights.'),
      makeCase([repeatPattern([2, 2, 2, 9, 9, 9], 34)], 'Grouped repeated values.'),
      makeCase([repeatPattern([15, -10, 5, -10, 15], 36)], 'Repeated compensation pattern.'),
    ],
  };
}

function countMaxCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 9, 2, 9, 3]], 'Maximum appears twice.'),
      makeCase([[5, 5, 5, 5]], 'Every element is the maximum.'),
      makeCase([[-1, -3, -1, -2]], 'Negative values with repeated maximum.'),
      makeCase([[0, 7, 7, 7, 1]], 'Maximum appears in the middle cluster.'),
      makeCase([[4, 2, 4, 1, 4, 3]], 'Maximum repeats across the array.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([9, 1, 9, 2, 9], 22)], 'Large repeated maximum pattern.'),
      makeCase([repeatPattern([6, 6, 6, 6], 24)], 'Large uniform array.'),
      makeCase([repeatPattern([-2, -7, -2, -6], 26)], 'Negative-only repeated maximum.'),
      makeCase([repeatPattern([12, 3, 12, 4, 12, 5], 28)], 'Maximum appears in many separated positions.'),
      makeCase([repeatPattern([0, 8, 1, 8, 2, 8], 30)], 'Alternating maximum pattern.'),
      makeCase([repeatPattern([7, 7, 3, 2, 1], 32)], 'Maximum cluster at the front.'),
      makeCase([repeatPattern([1, 2, 3, 4, 10], 34)], 'Maximum repeats in tail-aligned segments.'),
      makeCase([repeatPattern([5, 11, 5, 11, 5, 11], 36)], 'Two values compete but one remains maximum.'),
      makeCase([repeatPattern([4, 13, 4, 13, 4, 13, 4], 38)], 'Many repeated maxima in a large array.'),
    ],
  };
}

function countUniqueCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 2, 3, 4]], 'All values are unique.'),
      makeCase([[5, 5, 5, 5]], 'Only one unique value exists.'),
      makeCase([[1, 2, 1, 2, 3]], 'Mixed duplicates and unique values.'),
      makeCase([[-1, 0, 1, 0, -1]], 'Negative and positive duplicates.'),
      makeCase([[3, 3, 2, 1, 2, 4]], 'New values keep appearing late.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([1, 2, 3, 4, 5], 20)], 'Repeated cycle with five unique values.'),
      makeCase([repeatPattern([7, 7, 7, 7], 22)], 'Large single-value array.'),
      makeCase([repeatPattern([-3, -2, -1, 0, 1, 2], 24)], 'Large multi-sign cycle.'),
      makeCase([repeatPattern([5, 1, 5, 2, 5, 3, 5, 4], 26)], 'One frequent value with several rare values.'),
      makeCase([repeatPattern([9, 8, 7, 6, 5, 4, 3, 2], 28)], 'Long descending repeated cycle.'),
      makeCase([repeatPattern([0, 1, 0, 2, 0, 3, 0, 4], 30)], 'Zero repeats between distinct values.'),
      makeCase([repeatPattern([11, 10, 11, 9, 11, 8], 32)], 'Unique count stays small despite long input.'),
      makeCase([repeatPattern([4, 4, 3, 3, 2, 2, 1, 1], 34)], 'Pairs of duplicates only.'),
      makeCase([repeatPattern([12, -12, 6, -6, 3, -3], 36)], 'Sign-paired unique values.'),
    ],
  };
}

function mostFrequentCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[2, 2, 3, 3, 3, 1]], 'Clear most frequent value.'),
      makeCase([[5, 1, 5, 1, 2]], 'Frequency tie. The smaller value must win.'),
      makeCase([[-2, -2, -1, -1, -1, 0]], 'Negative values with a clear winner.'),
      makeCase([[4, 4, 4, 4]], 'All values are the same.'),
      makeCase([[3, 2, 3, 2, 1, 1, 1]], 'Late cluster overtakes earlier ties.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([7, 7, 7, 2, 3], 22)], 'Large clear-winner pattern.'),
      makeCase([repeatPattern([9, 1, 9, 1, 2, 2], 24)], 'Tie must resolve to the smaller value.'),
      makeCase([repeatPattern([-5, -5, -4, -4, -4, -3], 26)], 'Negative winner with repeated challengers.'),
      makeCase([repeatPattern([6, 6, 6, 6], 28)], 'Uniform large array.'),
      makeCase([repeatPattern([8, 3, 8, 3, 8, 2, 2], 30)], 'Winner appears in separated clusters.'),
      makeCase([repeatPattern([4, 1, 4, 1, 4, 1], 32)], 'Perfect tie between two values. Smaller value must win.'),
      makeCase([repeatPattern([0, 0, 5, 5, 5, 2], 34)], 'Later cluster becomes the winner.'),
      makeCase([repeatPattern([11, 10, 11, 10, 11, 9], 36)], 'One value edges out a near tie.'),
      makeCase([repeatPattern([3, 3, 2, 2, 1, 1, 1], 38)], 'Winner is not the numerically largest value.'),
    ],
  };
}

function transformCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[4, 1, 3, 2]], 'Small unsorted even-length array.'),
      makeCase([[5, 5, 2, 2, 1]], 'Duplicates must be handled correctly.'),
      makeCase([[-3, 0, 2, -1]], 'Mixed sign values.'),
      makeCase([[9, 8, 7, 6, 5]], 'Reverse-sorted array.'),
      makeCase([[1, 2, 3, 4]], 'Already sorted ascending array.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([9, 1, 8, 2, 7, 3], 20)], 'Long alternating pattern.'),
      makeCase([repeatPattern([5, 5, 4, 4, 3, 3, 2, 2], 22)], 'Long duplicated blocks.'),
      makeCase([repeatPattern([-4, 6, -3, 5, -2, 4], 24)], 'Long mixed-sign pattern.'),
      makeCase([repeatPattern([12, 11, 10, 9, 8, 7], 26)], 'Large descending pattern.'),
      makeCase([repeatPattern([1, 2, 3, 4, 5, 6], 28)], 'Large ascending pattern.'),
      makeCase([repeatPattern([2, 1, 2, 1, 2, 1], 30)], 'Alternating duplicates.'),
      makeCase([repeatPattern([0, 7, 0, 6, 0, 5], 32)], 'Zeros interleaved with descending peaks.'),
      makeCase([repeatPattern([15, -1, 14, -2, 13, -3], 34)], 'Large oscillating pattern.'),
      makeCase([repeatPattern([4, 4, 4, 4, 4], 36)], 'Large uniform array.'),
    ],
  };
}

function secondExtremeCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[4, 1, 9, 2, 9], 'largest'], 'Second distinct largest should ignore duplicates.'),
      makeCase([[4, 1, 9, 2, 9], 'smallest'], 'Second distinct smallest should ignore duplicates.'),
      makeCase([[5, 5, 5, 5], 'largest'], 'No second distinct value exists.'),
      makeCase([[1, 2, 3, 4], 'largest'], 'Strictly increasing values.'),
      makeCase([[1, 2, 3, 4], 'smallest'], 'Strictly increasing values for second smallest.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([10, 1, 9, 2, 8, 3], 20), 'largest'], 'Large alternating values.'),
      makeCase([repeatPattern([10, 1, 9, 2, 8, 3], 20), 'smallest'], 'Large alternating values for second smallest.'),
      makeCase([repeatPattern([7, 7, 7, 7], 22), 'largest'], 'Large array with no second distinct value.'),
      makeCase([repeatPattern([-5, -1, -4, -2, -3], 24), 'largest'], 'Negative values for second largest.'),
      makeCase([repeatPattern([-5, -1, -4, -2, -3], 24), 'smallest'], 'Negative values for second smallest.'),
      makeCase([repeatPattern([12, 5, 12, 4, 11, 3], 26), 'largest'], 'Duplicates of the largest value should not change the answer.'),
      makeCase([repeatPattern([2, 2, 1, 1, 0, 0], 28), 'smallest'], 'Repeated low values still need distinct ranking.'),
      makeCase([repeatPattern([15, 14, 13, 12, 11], 30), 'largest'], 'Descending values with many distinct candidates.'),
      makeCase([repeatPattern([0, 1, 2, 3, 4], 32), 'smallest'], 'Ascending values with many distinct candidates.'),
    ],
  };
}

function sortedCheckCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 2, 3, 4]], 'Strictly increasing array.'),
      makeCase([[1, 1, 2, 2, 3]], 'Non-decreasing with duplicates.'),
      makeCase([[1, 3, 2, 4]], 'Single inversion in the middle.'),
      makeCase([[4, 3, 2, 1]], 'Strictly decreasing array.'),
      makeCase([[1, 2, 3, 5, 4]], 'Inversion near the end.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([1, 2, 3, 4, 5], 20)], 'Long sorted repeated pattern.'),
      makeCase([repeatPattern([0, 0, 1, 1, 2, 2], 22)], 'Long non-decreasing duplicates.'),
      makeCase([repeatPattern([5, 4, 3, 2, 1], 24)], 'Large decreasing pattern.'),
      makeCase([[0, 1, 2, 3, 4, 5, 6, 7, 6, 9, 10, 11]], 'Single drop in an otherwise sorted array.'),
      makeCase([[1, 2, 3, 4, 5, 4, 6, 7, 8, 9, 10]], 'Middle inversion in a longer array.'),
      makeCase([repeatPattern([-5, -4, -3, -2, -1], 26)], 'Large negative sorted pattern.'),
      makeCase([repeatPattern([2, 2, 2, 2], 28)], 'All equal values.'),
      makeCase([[1, 2, 3, 4, 5, 6, 7, 8, 0]], 'Tail inversion should fail.'),
      makeCase([[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], 'Completely decreasing long array.'),
    ],
  };
}

function pairSumCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 2, 3, 4, 5], 6], 'Two distinct pairs exist.'),
      makeCase([[3, 3, 3, 3], 6], 'Duplicate values form one unique pair.'),
      makeCase([[-1, 0, 1, 2, -2], 0], 'Negative and positive values combine to the target.'),
      makeCase([[5, 7, 9], 4], 'No pair matches the target.'),
      makeCase([[1, 5, 1, 5, 2, 4], 6], 'Duplicate inputs should not create duplicate pairs.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([1, 9, 2, 8, 3, 7, 4, 6], 20), 10], 'Many candidate pairs exist.'),
      makeCase([repeatPattern([5, 5, 5, 5, 5], 22), 10], 'Only one unique duplicated pair should remain.'),
      makeCase([repeatPattern([-3, 3, -2, 2, -1, 1], 24), 0], 'Balanced negative-positive pairs.'),
      makeCase([repeatPattern([10, 11, 12, 13], 26), 5], 'Large array with no valid pairs.'),
      makeCase([repeatPattern([0, 6, 1, 5, 2, 4, 3, 3], 28), 6], 'Pairs include equal-value pair [3, 3].'),
      makeCase([repeatPattern([7, -1, 8, -2, 9, -3], 30), 6], 'Mixed-sign target pairs.'),
      makeCase([repeatPattern([4, 2, 4, 2, 1, 5], 32), 6], 'Duplicate value pairs should still be unique.'),
      makeCase([repeatPattern([12, 0, 12, 0, 6, 6], 34), 12], 'Unique output pairs despite heavy duplication.'),
      makeCase([repeatPattern([3, 14, 4, 13, 5, 12], 36), 17], 'Many different pair values sum to the same target.'),
    ],
  };
}

function rotateCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 2, 3, 4, 5], 1, 'left'], 'Basic left rotation by 1.'),
      makeCase([[1, 2, 3, 4, 5], 2, 'right'], 'Basic right rotation by 2.'),
      makeCase([[1, 2, 3, 4], 4, 'left'], 'Rotation by the array length changes nothing.'),
      makeCase([[9, 8, 7, 6], 6, 'right'], 'k larger than length should wrap around.'),
      makeCase([[1, 1, 2, 2, 3], 3, 'left'], 'Duplicates should stay in the correct order after rotation.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([1, 2, 3, 4, 5, 6], 18), 5, 'left'], 'Long left rotation.'),
      makeCase([repeatPattern([9, 8, 7, 6, 5, 4], 20), 7, 'right'], 'Long right rotation with wrap-around.'),
      makeCase([repeatPattern([3, 3, 2, 2, 1, 1], 22), 0, 'left'], 'Zero rotation.'),
      makeCase([repeatPattern([-4, -3, -2, -1, 0, 1], 24), 13, 'left'], 'Large left rotation with mixed signs.'),
      makeCase([repeatPattern([5, 0, 5, 0, 5, 0], 26), 8, 'right'], 'Heavy duplication with right rotation.'),
      makeCase([repeatPattern([10, 20, 30, 40], 28), 15, 'left'], 'k much larger than the array length.'),
      makeCase([repeatPattern([7, 6, 5, 4, 3], 30), 9, 'right'], 'Large descending pattern.'),
      makeCase([repeatPattern([2, 1, 2, 1, 2, 1], 32), 11, 'left'], 'Alternating duplicates with wrap-around.'),
      makeCase([repeatPattern([1, 2, 3, 4, 5], 34), 17, 'right'], 'Odd multiple of length plus offset.'),
    ],
  };
}

function runCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 1, 2, 2, 2, 3]], 'The longest run is in the middle.'),
      makeCase([[4, 4, 4, 4]], 'Entire array is one run.'),
      makeCase([[1, 2, 3, 4]], 'No repeated neighbors.'),
      makeCase([[5, 5, 1, 1, 1, 1, 2]], 'Longest run appears later.'),
      makeCase([[0, 0, 1, 1, 1, 0, 0]], 'Different runs of different lengths.'),
    ],
    hiddenCases: [
      makeCase([repeatPattern([1, 1, 1, 2, 2, 3], 24)], 'Several long runs repeat.'),
      makeCase([repeatPattern([4, 4, 4, 4, 4], 26)], 'Large uniform array.'),
      makeCase([repeatPattern([0, 1, 0, 1, 0, 1], 28)], 'Alternating values keep run length at 1.'),
      makeCase([repeatPattern([3, 3, 2, 2, 2, 2, 1], 30)], 'Long internal run dominates.'),
      makeCase([repeatPattern([5, 5, 5, 1, 1, 1, 1, 1], 32)], 'Long tail run.'),
      makeCase([repeatPattern([-2, -2, -2, -2, 0, 0], 34)], 'Negative uniform prefix.'),
      makeCase([repeatPattern([7, 6, 6, 6, 5, 5, 5, 5], 36)], 'Competing medium and long runs.'),
      makeCase([repeatPattern([8, 8, 8, 8, 8, 1, 2], 38)], 'Dominant front run in a long array.'),
      makeCase([repeatPattern([9, 0, 0, 0, 9, 9, 9, 9], 40)], 'Later run beats earlier run.'),
    ],
  };
}

function mergeCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 3, 5], [2, 4, 6]], 'Interleaving sorted arrays.'),
      makeCase([[-3, -1, 2], [-2, 0, 4]], 'Negative and positive values.'),
      makeCase([[1, 1, 3], [1, 2, 2]], 'Duplicates appear in both inputs.'),
      makeCase([[1, 2, 3], [4, 5, 6]], 'All left values are smaller.'),
      makeCase([[2, 4, 6], [1, 3, 5]], 'All right values are smaller.'),
    ],
    hiddenCases: [
      makeCase([createSortedFromPattern([1, 4, 7], 12), createSortedFromPattern([2, 5, 8], 12)], 'Large interleaving merge.'),
      makeCase([createSortedFromPattern([-6, -3, 0], 14), createSortedFromPattern([-5, -2, 1], 14)], 'Large mixed-sign merge.'),
      makeCase([createSortedFromPattern([1, 1, 1], 16), createSortedFromPattern([1, 1, 1], 16)], 'Heavy duplication in both arrays.'),
      makeCase([createSortedFromPattern([1, 2, 3], 18), createSortedFromPattern([10, 11, 12], 18)], 'Separated value ranges.'),
      makeCase([createSortedFromPattern([10, 11, 12], 20), createSortedFromPattern([1, 2, 3], 20)], 'Right side entirely smaller.'),
      makeCase([createSortedFromPattern([0, 2, 4, 6], 22), createSortedFromPattern([1, 3, 5, 7], 22)], 'Dense interleaving.'),
      makeCase([createSortedFromPattern([-10, -10, -5], 24), createSortedFromPattern([-9, -9, -4], 24)], 'Repeated negatives in both arrays.'),
      makeCase([createSortedFromPattern([2, 6, 10], 26), createSortedFromPattern([3, 7, 11], 26)], 'Long staggered merge.'),
      makeCase([createSortedFromPattern([5, 15, 25], 28), createSortedFromPattern([0, 10, 20], 28)], 'Sparse sorted buckets.'),
    ],
  };
}

function missingNumberCoveragePlan(): CoveragePlan {
  return {
    visibleCases: [
      makeCase([[1, 2, 3, 4]], 'Missing value is 0.'),
      makeCase([[0, 1, 2, 3]], 'Missing value is n.'),
      makeCase([[0, 1, 3, 4]], 'Missing value is in the middle.'),
      makeCase([[4, 2, 1, 0]], 'Input order is shuffled.'),
      makeCase([[1, 0]], 'Shortest valid non-trivial case.'),
    ],
    hiddenCases: [
      createMissingNumberCase(12, 0),
      createMissingNumberCase(14, 14),
      createMissingNumberCase(16, 7),
      createMissingNumberCase(18, 3),
      createMissingNumberCase(20, 11),
      createMissingNumberCase(22, 19),
      createMissingNumberCase(24, 5),
      createMissingNumberCase(26, 13),
      createMissingNumberCase(28, 27),
    ],
  };
}
