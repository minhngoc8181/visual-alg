import '../styles/reset.css';
import '../styles/array-practice.css';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('App root "#app" was not found.');
}

app.innerHTML = `
  <main class="page">
    <section class="hero">
      <h1>Algorithm for Basic Arrays</h1>
    </section>

    <section class="grid">
      <div class="stack">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Lesson</h2>
          </div>
          <div class="panel-body">
            <div class="field">
              <select id="lessonSelect" aria-label="Choose a lesson"></select>
            </div>
            <div class="field">
              <span class="field-label">Description</span>
              <p id="lessonDescription" class="lesson-description"></p>
            </div>
            <dl class="meta-list">
              <div class="meta-card">
                <dt>Method</dt>
                <dd id="methodName">-</dd>
              </div>
              <div class="meta-card">
                <dt>Tests per run</dt>
                <dd id="testCount">-</dd>
              </div>
            </dl>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Editor</h2>
          </div>
          <div class="panel-body">
            <div class="field">
              <label for="editor">Starter code</label>
              <textarea id="editor" spellcheck="false"></textarea>
            </div>
            <div class="actions">
              <button id="runButton" class="primary" type="button">Run</button>
              <button id="solutionButton" class="secondary" type="button">Solution</button>
              <button id="resetButton" class="secondary" type="button">Reset Code</button>
            </div>
            <p class="hint">Shortcut: Ctrl + Enter de chay nhanh. Enter tu dong can le, Tab/Shift+Tab de them hoac bot indent.</p>
          </div>
        </article>
      </div>

      <div class="stack">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Run Summary</h2>
          </div>
          <div class="panel-body">
            <div class="summary-top">
              <span id="summaryBadge" class="badge idle">Idle</span>
              <span id="summaryMessage" class="lesson-description">Ready to run generated tests.</span>
            </div>
            <div class="summary-grid">
              <div class="summary-card">
                <span>Total tests</span>
                <strong id="summaryTotal">0</strong>
              </div>
              <div class="summary-card">
                <span>Passed</span>
                <strong id="summaryPassed">0</strong>
              </div>
              <div class="summary-card">
                <span>Failed</span>
                <strong id="summaryFailed">0</strong>
              </div>
              <div class="summary-card">
                <span>Run seed</span>
                <strong id="summarySeed">-</strong>
              </div>
            </div>
            <div id="sampleCase" class="callout">A visible sample test will appear here for the selected lesson.</div>
          </div>
        </article>
      </div>
    </section>

    <section class="panel results-panel">
      <div class="panel-header">
        <h2 class="panel-title">Generated Test Results</h2>
      </div>
      <div class="panel-body table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Status</th>
              <th>Args</th>
              <th>Expected</th>
              <th>Actual</th>
              <th>Note</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody id="resultsBody">
            <tr>
              <td colspan="7" class="empty">No tests have been executed yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
`;

const STORAGE_KEY = 'visualalg-array-practice-v1';
const TEST_TIMEOUT_MS = 800;
const DEFAULT_TOTAL_TESTS = 14;
const DEFAULT_VISIBLE_TESTS = 5;
const CANDIDATE_MULTIPLIER = 8;
const INDENT_UNIT = '  ';

const dom = {
  lessonSelect: document.getElementById('lessonSelect'),
  lessonDescription: document.getElementById('lessonDescription'),
  methodName: document.getElementById('methodName'),
  testCount: document.getElementById('testCount'),
  editor: document.getElementById('editor'),
  runButton: document.getElementById('runButton'),
  solutionButton: document.getElementById('solutionButton'),
  resetButton: document.getElementById('resetButton'),
  summaryBadge: document.getElementById('summaryBadge'),
  summaryMessage: document.getElementById('summaryMessage'),
  summaryTotal: document.getElementById('summaryTotal'),
  summaryPassed: document.getElementById('summaryPassed'),
  summaryFailed: document.getElementById('summaryFailed'),
  summarySeed: document.getElementById('summarySeed'),
  resultsBody: document.getElementById('resultsBody'),
  sampleCase: document.getElementById('sampleCase'),
};

const lessons = createLessons();
const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const persisted = loadState();
const draftByLesson = persisted.draftByLesson || {};
let selectedLessonId = lessonMap.has(persisted.lessonId) ? persisted.lessonId : lessons[0].id;
let isRunning = false;

renderLessonOptions();
syncLessonView();
renderIdleSummary();

dom.lessonSelect.addEventListener('change', () => {
  persistCurrentDraft();
  selectedLessonId = dom.lessonSelect.value;
  syncLessonView();
  saveState();
  clearResults();
});

dom.editor.addEventListener('input', () => {
  draftByLesson[selectedLessonId] = dom.editor.value;
  saveState();
});

dom.editor.addEventListener('keydown', (event) => {
  handleEditorKeydown(event);
});

dom.resetButton.addEventListener('click', () => {
  const lesson = getSelectedLesson();
  dom.editor.value = lesson.starterCode;
  draftByLesson[selectedLessonId] = lesson.starterCode;
  saveState();
});

dom.solutionButton.addEventListener('click', () => {
  const lesson = getSelectedLesson();
  dom.editor.value = lesson.solutionCode;
  draftByLesson[selectedLessonId] = lesson.solutionCode;
  saveState();
});

dom.runButton.addEventListener('click', () => {
  void runSelectedLesson();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault();
    if (!isRunning) {
      void runSelectedLesson();
    }
  }
});

function handleEditorKeydown(event) {
  if (event.key === 'Tab') {
    event.preventDefault();
    if (event.shiftKey) {
      outdentSelection(dom.editor);
    } else {
      indentSelection(dom.editor);
    }
    rememberEditorDraft();
    return;
  }

  if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    insertIndentedNewline(dom.editor);
    rememberEditorDraft();
  }
}

function rememberEditorDraft() {
  draftByLesson[selectedLessonId] = dom.editor.value;
  saveState();
}

function insertIndentedNewline(textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const beforeCursor = value.slice(lineStart, start);
  const afterCursor = value.slice(end);
  const baseIndent = beforeCursor.match(/^\s*/)[0];
  const trimmedBefore = beforeCursor.trimEnd();
  const shouldIncreaseIndent = /[\{\[\(]$/.test(trimmedBefore);
  const nextLinePrefix = afterCursor.match(/^\s*[\}\]\)]/);
  const nextLineStartsWithClosing = Boolean(nextLinePrefix);
  const nextIndent = baseIndent + (shouldIncreaseIndent ? INDENT_UNIT : '');

  if (nextLineStartsWithClosing && start === end) {
    const inserted = '\n' + nextIndent + '\n' + baseIndent;
    textarea.setRangeText(inserted, start, end, 'end');
    const caret = start + 1 + nextIndent.length;
    textarea.setSelectionRange(caret, caret);
    return;
  }

  const inserted = '\n' + nextIndent;
  textarea.setRangeText(inserted, start, end, 'end');
  const caret = start + inserted.length;
  textarea.setSelectionRange(caret, caret);
}

function indentSelection(textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  if (start === end) {
    textarea.setRangeText(INDENT_UNIT, start, end, 'end');
    return;
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = value.indexOf('\n', end);
  const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, sliceEnd);
  const lines = block.split('\n');
  const indented = lines.map((line) => INDENT_UNIT + line).join('\n');

  textarea.setRangeText(indented, lineStart, sliceEnd, 'preserve');
  textarea.setSelectionRange(start + INDENT_UNIT.length, end + INDENT_UNIT.length * lines.length);
}

function outdentSelection(textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  if (start === end) {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const beforeCursor = value.slice(lineStart, start);
    if (beforeCursor.endsWith(INDENT_UNIT)) {
      textarea.setRangeText('', start - INDENT_UNIT.length, start, 'end');
    } else if (beforeCursor.endsWith('\t')) {
      textarea.setRangeText('', start - 1, start, 'end');
    }
    return;
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = value.indexOf('\n', end);
  const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, sliceEnd);
  const lines = block.split('\n');
  let removedCharacters = 0;
  const outdented = lines.map((line) => {
    if (line.startsWith(INDENT_UNIT)) {
      removedCharacters += INDENT_UNIT.length;
      return line.slice(INDENT_UNIT.length);
    }
    if (line.startsWith('\t')) {
      removedCharacters += 1;
      return line.slice(1);
    }
    return line;
  }).join('\n');

  const firstLineRemoved = lines[0].startsWith(INDENT_UNIT) ? INDENT_UNIT.length : lines[0].startsWith('\t') ? 1 : 0;
  textarea.setRangeText(outdented, lineStart, sliceEnd, 'preserve');
  textarea.setSelectionRange(Math.max(lineStart, start - firstLineRemoved), Math.max(lineStart, end - removedCharacters));
}
        function createLessons() {
          const arrayLesson = (config) => {
            const lessonDefaults = createLessonDefaults(config.id);
            const solutionCode = config.solutionCode || config.starterCode;
            return {
              ...createCoveragePlan(config.id),
              ...config,
              starterCode: createMinimalStarterCode(solutionCode, lessonDefaults.defaultReturn),
              solutionCode,
              testCount: config.testCount || DEFAULT_TOTAL_TESTS,
              visibleTestCount: config.visibleTestCount || DEFAULT_VISIBLE_TESTS,
            };
          };

          return [
            arrayLesson({
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
              solution: (numbers, target) => numbers.indexOf(target),
            }),
            arrayLesson({
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
              solution: (numbers, target) => numbers.lastIndexOf(target),
            }),
            arrayLesson({
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
              solution: (numbers, target) => numbers.includes(target),
            }),
            arrayLesson({
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
              solution: (numbers) => Math.max(...numbers),
            }),
            arrayLesson({
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
              solution: (numbers) => Math.min(...numbers),
            }),
            arrayLesson({
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
                let bestIndex = 0;
                for (let i = 1; i < numbers.length; i += 1) {
                  if (numbers[i] > numbers[bestIndex]) {
                    bestIndex = i;
                  }
                }
                return bestIndex;
              },
            }),
            arrayLesson({
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
                let bestIndex = 0;
                for (let i = 1; i < numbers.length; i += 1) {
                  if (numbers[i] < numbers[bestIndex]) {
                    bestIndex = i;
                  }
                }
                return bestIndex;
              },
            }),
            arrayLesson({
              id: 'sum-all',
              title: '8. calculate sum of all elements',
              methodName: 'sumAllElements',
              description: 'Return the sum of all array elements.',
              starterCode: [
                'sumAllElements(numbers) {',
                '  let sum = 0;',
                '  for (let i = 0; i < numbers.length; i += 1) {',
                '    sum += numbers[i];',
                '  }',
                '  return sum;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -8, valueMax: 12 })] }),
              solution: (numbers) => numbers.reduce((sum, value) => sum + value, 0),
            }),
            arrayLesson({
              id: 'average',
              title: '9. calculate average of all elements',
              methodName: 'averageOfElements',
              description: 'Return the arithmetic mean of a non-empty array.',
              starterCode: [
                'averageOfElements(numbers) {',
                '  let sum = 0;',
                '  for (let i = 0; i < numbers.length; i += 1) {',
                '    sum += numbers[i];',
                '  }',
                '  return sum / numbers.length;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 7, valueMin: -10, valueMax: 14 })], note: 'Use the exact average, not rounded.' }),
              solution: (numbers) => numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
              checker: ({ actual, expected }) => ({
                pass: typeof actual === 'number' && Math.abs(actual - expected) < 1e-9,
                message: 'Average must match the exact arithmetic mean.',
              }),
            }),
            arrayLesson({
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
              solution: (numbers, target) => numbers.filter((value) => value === target).length,
            }),
            arrayLesson({
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
                const max = Math.max(...numbers);
                return numbers.filter((value) => value === max).length;
              },
            }),
            arrayLesson({
              id: 'count-unique',
              title: '12. count unique values in array',
              methodName: 'countUniqueValues',
              description: 'Return how many distinct values appear in the array.',
              starterCode: [
                'countUniqueValues(numbers) {',
                '  const seen = [];',
                '  for (let i = 0; i < numbers.length; i += 1) {',
                '    if (!seen.includes(numbers[i])) {',
                '      seen.push(numbers[i]);',
                '    }',
                '  }',
                '  return seen.length;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -3, valueMax: 5 })] }),
              solution: (numbers) => new Set(numbers).size,
            }),
            arrayLesson({
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
                const counts = new Map();
                let bestValue = numbers[0];
                let bestCount = 0;
                for (const value of numbers) {
                  const nextCount = (counts.get(value) || 0) + 1;
                  counts.set(value, nextCount);
                  if (nextCount > bestCount || (nextCount === bestCount && value < bestValue)) {
                    bestCount = nextCount;
                    bestValue = value;
                  }
                }
                return bestValue;
              },
            }),
            arrayLesson({
              id: 'reverse-array',
              title: '14. reverse array',
              methodName: 'reverseArray',
              description: 'Return a new array with the elements in reverse order.',
              starterCode: [
                'reverseArray(numbers) {',
                '  const reversed = [];',
                '  for (let i = numbers.length - 1; i >= 0; i -= 1) {',
                '    reversed.push(numbers[i]);',
                '  }',
                '  return reversed;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9 })] }),
              solution: (numbers) => numbers.slice().reverse(),
            }),
            arrayLesson({
              id: 'sort-ascending',
              title: '15. sort ascending',
              methodName: 'sortAscending',
              description: 'Return a new array sorted from smallest to largest.',
              starterCode: [
                'sortAscending(numbers) {',
                '  const sorted = numbers.slice();',
                '  for (let i = 0; i < sorted.length - 1; i += 1) {',
                '    for (let j = 0; j < sorted.length - 1 - i; j += 1) {',
                '      if (sorted[j] > sorted[j + 1]) {',
                '        const temp = sorted[j];',
                '        sorted[j] = sorted[j + 1];',
                '        sorted[j + 1] = temp;',
                '      }',
                '    }',
                '  }',
                '  return sorted;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -9, valueMax: 12 })] }),
              solution: (numbers) => numbers.slice().sort((left, right) => left - right),
            }),
            arrayLesson({
              id: 'sort-descending',
              title: '16. sort descending',
              methodName: 'sortDescending',
              description: 'Return a new array sorted from largest to smallest.',
              starterCode: [
                'sortDescending(numbers) {',
                '  const sorted = numbers.slice();',
                '  for (let i = 0; i < sorted.length - 1; i += 1) {',
                '    for (let j = 0; j < sorted.length - 1 - i; j += 1) {',
                '      if (sorted[j] < sorted[j + 1]) {',
                '        const temp = sorted[j];',
                '        sorted[j] = sorted[j + 1];',
                '        sorted[j + 1] = temp;',
                '      }',
                '    }',
                '  }',
                '  return sorted;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -9, valueMax: 12 })] }),
              solution: (numbers) => numbers.slice().sort((left, right) => right - left),
            }),
            arrayLesson({
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
                const unique = Array.from(new Set(numbers)).sort((left, right) => left - right);
                if (unique.length < 2) {
                  return null;
                }
                return mode === 'largest' ? unique[unique.length - 2] : unique[1];
              },
            }),
            arrayLesson({
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
                const indices = [];
                for (let i = 0; i < numbers.length; i += 1) {
                  if (numbers[i] === target) {
                    indices.push(i);
                  }
                }
                return indices;
              },
            }),
            arrayLesson({
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
                for (let i = 1; i < numbers.length; i += 1) {
                  if (numbers[i] < numbers[i - 1]) {
                    return false;
                  }
                }
                return true;
              },
            }),
            arrayLesson({
              id: 'remove-duplicates',
              title: '20. remove duplicates',
              methodName: 'removeDuplicates',
              description: 'Return a new array keeping only the first occurrence of each value.',
              starterCode: [
                'removeDuplicates(numbers) {',
                '  const result = [];',
                '  for (let i = 0; i < numbers.length; i += 1) {',
                '    if (!result.includes(numbers[i])) {',
                '      result.push(numbers[i]);',
                '    }',
                '  }',
                '  return result;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 6, lengthMax: 10, valueMin: -3, valueMax: 4 })] }),
              solution: (numbers) => Array.from(new Set(numbers)),
            }),
            arrayLesson({
              id: 'pairs-with-sum',
              title: '21. find pairs that sum to target',
              methodName: 'pairsWithTargetSum',
              description: 'Return unique value pairs [a, b] such that a + b equals target, with a <= b. Order of pairs in the output does not matter.',
              starterCode: [
                'pairsWithTargetSum(numbers, target) {',
                '  const pairs = [];',
                '  for (let i = 0; i < numbers.length; i += 1) {',
                '    for (let j = i + 1; j < numbers.length; j += 1) {',
                '      if (numbers[i] + numbers[j] === target) {',
                '        const pair = numbers[i] <= numbers[j] ? [numbers[i], numbers[j]] : [numbers[j], numbers[i]];',
                '        const key = pair[0] + ":" + pair[1];',
                '        let seen = false;',
                '        for (let k = 0; k < pairs.length; k += 1) {',
                '          if (pairs[k][0] + ":" + pairs[k][1] === key) {',
                '            seen = true;',
                '            break;',
                '          }',
                '        }',
                '        if (!seen) {',
                '          pairs.push(pair);',
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
              solution: (numbers, target) => {
                const pairSet = new Set();
                for (let i = 0; i < numbers.length; i += 1) {
                  for (let j = i + 1; j < numbers.length; j += 1) {
                    if (numbers[i] + numbers[j] === target) {
                      const left = Math.min(numbers[i], numbers[j]);
                      const right = Math.max(numbers[i], numbers[j]);
                      pairSet.add(JSON.stringify([left, right]));
                    }
                  }
                }
                return Array.from(pairSet, (entry) => JSON.parse(entry));
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
            }),
            arrayLesson({
              id: 'rotate',
              title: '22. rotate left or right by k',
              methodName: 'rotateArray',
              description: 'Return a new array rotated left or right by k positions.',
              starterCode: [
                'rotateArray(numbers, k, direction) {',
                '  const length = numbers.length;',
                '  const shift = ((k % length) + length) % length;',
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
              solution: (numbers, k, direction) => {
                const length = numbers.length;
                const shift = ((k % length) + length) % length;
                if (shift === 0) {
                  return numbers.slice();
                }
                if (direction === 'left') {
                  return numbers.slice(shift).concat(numbers.slice(0, shift));
                }
                return numbers.slice(length - shift).concat(numbers.slice(0, length - shift));
              },
            }),
            arrayLesson({
              id: 'longest-run',
              title: '23. find the longest consecutive identical run',
              methodName: 'longestConsecutiveRun',
              description: 'Return the length of the longest streak of equal neighboring values.',
              starterCode: [
                'longestConsecutiveRun(numbers) {',
                '  let best = 1;',
                '  let current = 1;',
                '  for (let i = 1; i < numbers.length; i += 1) {',
                '    if (numbers[i] === numbers[i - 1]) {',
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
              solution: (numbers) => {
                let best = 1;
                let current = 1;
                for (let i = 1; i < numbers.length; i += 1) {
                  if (numbers[i] === numbers[i - 1]) {
                    current += 1;
                    best = Math.max(best, current);
                  } else {
                    current = 1;
                  }
                }
                return best;
              },
            }),
            arrayLesson({
              id: 'merge-sorted',
              title: '24. merge two sorted arrays',
              methodName: 'mergeSortedArrays',
              description: 'Merge two already sorted arrays into one sorted result.',
              starterCode: [
                'mergeSortedArrays(left, right) {',
                '  const merged = [];',
                '  let i = 0;',
                '  let j = 0;',
                '  while (i < left.length && j < right.length) {',
                '    if (left[i] <= right[j]) {',
                '      merged.push(left[i]);',
                '      i += 1;',
                '    } else {',
                '      merged.push(right[j]);',
                '      j += 1;',
                '    }',
                '  }',
                '  while (i < left.length) {',
                '    merged.push(left[i]);',
                '    i += 1;',
                '  }',
                '  while (j < right.length) {',
                '    merged.push(right[j]);',
                '    j += 1;',
                '  }',
                '  return merged;',
                '}',
              ].join('\n'),
              genTest: (rng) => ({
                args: [createSortedArray(rng, { lengthMin: 3, lengthMax: 6, valueMin: -6, valueMax: 8 }), createSortedArray(rng, { lengthMin: 3, lengthMax: 6, valueMin: -6, valueMax: 8 })],
              }),
              solution: (left, right) => left.concat(right).sort((a, b) => a - b),
            }),
            arrayLesson({
              id: 'missing-number',
              title: '25. find the missing number in a sequence',
              methodName: 'missingNumber',
              description: 'The array contains every number from 0 to n except one. Return the missing number.',
              starterCode: [
                'missingNumber(numbers) {',
                '  const n = numbers.length;',
                '  let expected = (n * (n + 1)) / 2;',
                '  let actual = 0;',
                '  for (let i = 0; i < numbers.length; i += 1) {',
                '    actual += numbers[i];',
                '  }',
                '  return expected - actual;',
                '}',
              ].join('\n'),
              genTest: (rng) => {
                const n = randomInt(rng, 4, 9);
                const missing = randomInt(rng, 0, n);
                const numbers = [];
                for (let value = 0; value <= n; value += 1) {
                  if (value !== missing) {
                    numbers.push(value);
                  }
                }
                shuffleInPlace(numbers, rng);
                return { args: [numbers], note: 'Input order is not guaranteed.' };
              },
              solution: (numbers) => {
                const n = numbers.length;
                const expected = (n * (n + 1)) / 2;
                const actual = numbers.reduce((sum, value) => sum + value, 0);
                return expected - actual;
              },
            }),
          ];
        }

        function getSelectedLesson() {
          return lessonMap.get(selectedLessonId);
        }

        function renderLessonOptions() {
          dom.lessonSelect.replaceChildren(...lessons.map((lesson) => {
            const option = document.createElement('option');
            option.value = lesson.id;
            option.textContent = lesson.title;
            return option;
          }));
        }

        function syncLessonView() {
          const lesson = getSelectedLesson();
          dom.lessonSelect.value = lesson.id;
          dom.lessonDescription.textContent = lesson.description;
          dom.methodName.textContent = lesson.methodName;
          dom.testCount.textContent = String(lesson.testCount) + ' total / ' + String(lesson.visibleTestCount) + ' shown';
          dom.editor.value = draftByLesson[lesson.id] || lesson.starterCode;
          renderSampleCase(lesson);
        }

        function renderSampleCase(lesson) {
          const suite = buildTestSuite(lesson);
          const sample = suite.tests.find((test) => test.isVisible) || suite.tests[0];
          dom.sampleCase.textContent = 'Deterministic sample args: ' + formatValue(sample.args) + (sample.note ? ' | Note: ' + sample.note : '') + ' | Seed: ' + suite.seed;
        }

        function persistCurrentDraft() {
          draftByLesson[selectedLessonId] = dom.editor.value;
        }

        function loadState() {
          try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          } catch {
            return {};
          }
        }

        function saveState() {
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                lessonId: selectedLessonId,
                draftByLesson,
              }),
            );
          } catch {
            return;
          }
        }

        function clearResults() {
          dom.resultsBody.innerHTML = '<tr><td colspan="7" class="empty">No tests have been executed yet.</td></tr>';
          renderIdleSummary();
        }

        function renderIdleSummary() {
          dom.summaryBadge.className = 'badge idle';
          dom.summaryBadge.textContent = 'Idle';
          dom.summaryMessage.textContent = 'Ready to run generated tests.';
          dom.summaryTotal.textContent = '0';
          dom.summaryPassed.textContent = '0';
          dom.summaryFailed.textContent = '0';
          dom.summarySeed.textContent = '-';
        }

        async function runSelectedLesson() {
          const lesson = getSelectedLesson();
          const source = dom.editor.value.trim();

          if (!source) {
            renderSummary({ badge: 'failed', message: 'Editor is empty.', total: 0, passed: 0, failed: 0, seed: '-' });
            renderRows([
              {
                index: 1,
                status: 'failed',
                args: '-',
                expected: '-',
                actual: '-',
                note: '',
                message: 'Enter a method body before running.',
              },
            ]);
            return;
          }

          persistCurrentDraft();
          saveState();
          setRunning(true);

          try {
            const suite = buildTestSuite(lesson);
            const seed = suite.seed;
            const tests = suite.tests;

            const rows = [];
            let passed = 0;

            for (let index = 0; index < tests.length; index += 1) {
              const test = tests[index];
              const argsForStudent = cloneValue(test.args);
              const expected = test.expected;
              if (test.expectedError) {
                rows.push({
                  index: index + 1,
                  status: 'failed',
                  args: test.isVisible ? formatValue(test.args) : 'Hidden validation test',
                  expected: test.isVisible ? '[solution error]' : 'Hidden',
                  actual: '-',
                  note: test.isVisible ? (test.note || '') : 'Hidden large validation',
                  message: 'Reference solution failed: ' + test.expectedError,
                  isVisible: test.isVisible,
                });
                continue;
              }

              const execution = await executeStudentCode({
                source,
                methodName: lesson.methodName,
                args: argsForStudent,
                timeoutMs: TEST_TIMEOUT_MS,
              });

              let actualDisplay = test.isVisible ? '-' : 'Hidden';
              let pass = false;
              let message = '';

              if (!execution.ok) {
                message = formatExecutionError(execution.error);
              } else {
                actualDisplay = test.isVisible ? formatValue(execution.value) : 'Hidden';
                const checkerResult = lesson.checker
                  ? lesson.checker({ actual: execution.value, expected, test })
                  : { pass: deepEqual(execution.value, expected), message: 'Output must match the reference result.' };
                pass = Boolean(checkerResult.pass);
                message = pass
                  ? (test.isVisible ? 'Accepted.' : 'Hidden validation passed.')
                  : checkerResult.message || 'Output did not match expected value.';
              }

              if (pass) {
                passed += 1;
              }

              rows.push({
                index: index + 1,
                status: pass ? 'passed' : 'failed',
                args: test.isVisible ? formatValue(test.args) : 'Hidden validation test',
                expected: test.isVisible ? formatValue(expected) : 'Hidden',
                actual: actualDisplay,
                note: test.isVisible ? (test.note || '') : 'Hidden large validation',
                message,
                isVisible: test.isVisible,
              });
            }

            renderRows(rows);
            renderSummary({
              badge: passed === rows.length ? 'accepted' : passed === 0 ? 'failed' : 'partial',
              message:
                passed === rows.length
                  ? 'All generated tests passed.'
                  : passed === 0
                    ? 'No generated test passed.'
                    : 'Some generated tests passed, but there are still mismatches.',
              total: rows.length,
              passed,
              failed: rows.length - passed,
              seed,
            });
          } catch (error) {
            renderSummary({ badge: 'failed', message: 'Run aborted because of an unexpected error.', total: 0, passed: 0, failed: 0, seed: '-' });
            renderRows([
              {
                index: 1,
                status: 'failed',
                args: '-',
                expected: '-',
                actual: '-',
                note: '',
                message: errorMessage(error),
              },
            ]);
          } finally {
            setRunning(false);
          }
        }

        function setRunning(nextRunning) {
          isRunning = nextRunning;
          dom.runButton.disabled = nextRunning;
          dom.solutionButton.disabled = nextRunning;
          dom.resetButton.disabled = nextRunning;
          dom.lessonSelect.disabled = nextRunning;
          dom.editor.disabled = nextRunning;
          if (nextRunning) {
            dom.summaryBadge.className = 'badge idle';
            dom.summaryBadge.textContent = 'Running';
            dom.summaryMessage.textContent = 'Executing generated tests in Web Workers...';
          }
        }

        function renderSummary(summary) {
          dom.summaryBadge.className = 'badge ' + summary.badge;
          dom.summaryBadge.textContent = summary.badge.charAt(0).toUpperCase() + summary.badge.slice(1);
          dom.summaryMessage.textContent = summary.message;
          dom.summaryTotal.textContent = String(summary.total);
          dom.summaryPassed.textContent = String(summary.passed);
          dom.summaryFailed.textContent = String(summary.failed);
          dom.summarySeed.textContent = String(summary.seed);
        }

        function renderRows(rows) {
          dom.resultsBody.replaceChildren(...rows.map((row) => {
            const tr = document.createElement('tr');
            tr.append(
              createCell(String(row.index)),
              createCell(row.status === 'passed' ? 'PASS' : 'FAIL', row.status === 'passed' ? 'status-pass' : 'status-fail'),
              createCell(row.args, 'mono'),
              createCell(row.expected, 'mono'),
              createCell(row.actual, 'mono'),
              createCell(row.note),
              createCell(row.message),
            );
            return tr;
          }));
        }

        function createCell(text, className) {
          const td = document.createElement('td');
          td.textContent = text;
          if (className) {
            td.className = className;
          }
          return td;
        }

        function buildTestSuite(lesson) {
          const seed = stableHash('suite:' + lesson.id);
          const visibleCount = Math.min(lesson.visibleTestCount, lesson.testCount);
          const hiddenCount = Math.max(0, lesson.testCount - visibleCount);
          const plannedVisible = materializePlannedTests(lesson, lesson.visibleCases || [], 'visible');
          const visibleCandidates = createCandidatePool(lesson, stableHash('visible:' + lesson.id), Math.max(visibleCount * CANDIDATE_MULTIPLIER, 24), true);
          const visibleTests = selectPlannedAndDiverseTests(plannedVisible, visibleCandidates, visibleCount, new Set()).map((candidate) => ({ ...candidate, isVisible: true }));
          const usedSignatures = new Set(visibleTests.map((test) => test.signature));
          const plannedHidden = materializePlannedTests(lesson, lesson.hiddenCases || [], 'hidden');
          const hiddenCandidates = createCandidatePool(lesson, stableHash('hidden:' + lesson.id), Math.max(hiddenCount * CANDIDATE_MULTIPLIER, 40), false);
          const hiddenTests = selectPlannedAndDiverseTests(plannedHidden, hiddenCandidates, hiddenCount, usedSignatures).map((candidate) => ({ ...candidate, isVisible: false }));
          return {
            seed,
            tests: visibleTests.concat(hiddenTests),
          };
        }

        function materializePlannedTests(lesson, entries, phase) {
          const rng = createRng(stableHash('planned:' + phase + ':' + lesson.id));
          return entries.map((entry, index) => {
            const rawTest = typeof entry === 'function'
              ? entry(rng, { lessonId: lesson.id, index, phase })
              : entry;
            return decorateTestCase(lesson, rawTest);
          });
        }

        function createCandidatePool(lesson, seed, count, preferSmall) {
          const rng = createRng(seed);
          const candidates = [];
          for (let index = 0; index < count; index += 1) {
            const rawTest = lesson.genTest(rng, { preferSmall, index, seed });
            candidates.push(decorateTestCase(lesson, rawTest));
          }
          candidates.sort((left, right) => {
            if (preferSmall && left.sizeScore !== right.sizeScore) {
              return left.sizeScore - right.sizeScore;
            }
            if (!preferSmall && left.sizeScore !== right.sizeScore) {
              return right.sizeScore - left.sizeScore;
            }
            return left.signature.localeCompare(right.signature);
          });
          return candidates;
        }

        function decorateTestCase(lesson, rawTest) {
          const expectedResult = getExpectedResult(lesson, rawTest);
          return {
            ...rawTest,
            expected: expectedResult.expected,
            expectedError: expectedResult.error,
            category: classifyTestOutcome(expectedResult.expected, rawTest),
            signature: createTestSignature(rawTest),
            sizeScore: estimateTestSize(rawTest),
          };
        }

        function getExpectedResult(lesson, test) {
          try {
            return {
              expected: lesson.solution(...cloneValue(test.args)),
              error: '',
            };
          } catch (error) {
            return {
              expected: '[solution error]',
              error: errorMessage(error),
            };
          }
        }

        function selectDiverseTests(candidates, count, excludedSignatures) {
          const selected = [];
          const usedCategories = new Set();
          const blocked = excludedSignatures || new Set();

          for (const candidate of candidates) {
            if (selected.length >= count) {
              break;
            }
            if (blocked.has(candidate.signature) || usedCategories.has(candidate.category)) {
              continue;
            }
            selected.push(candidate);
            usedCategories.add(candidate.category);
            blocked.add(candidate.signature);
          }

          for (const candidate of candidates) {
            if (selected.length >= count) {
              break;
            }
            if (blocked.has(candidate.signature)) {
              continue;
            }
            selected.push(candidate);
            blocked.add(candidate.signature);
          }

          return selected;
        }

        function selectPlannedAndDiverseTests(planned, candidates, count, excludedSignatures) {
          const selected = [];
          const blocked = excludedSignatures || new Set();

          for (const candidate of planned) {
            if (selected.length >= count) {
              break;
            }
            if (blocked.has(candidate.signature)) {
              continue;
            }
            selected.push(candidate);
            blocked.add(candidate.signature);
          }

          if (selected.length >= count) {
            return selected;
          }

          return selected.concat(selectDiverseTests(candidates, count - selected.length, blocked));
        }

        function createCoveragePlan(lessonId) {
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

        function createLessonDefaults(lessonId) {
          switch (lessonId) {
            case 'index-of':
            case 'last-index-of':
            case 'index-of-max':
            case 'index-of-min':
              return { defaultReturn: '-1' };
            case 'contains-value':
            case 'is-sorted':
              return { defaultReturn: 'false' };
            case 'all-indices':
            case 'reverse-array':
            case 'sort-ascending':
            case 'sort-descending':
            case 'remove-duplicates':
            case 'pairs-with-sum':
            case 'rotate':
            case 'merge-sorted':
              return { defaultReturn: '[]' };
            case 'second-extreme':
              return { defaultReturn: 'null' };
            default:
              return { defaultReturn: '0' };
          }
        }

        function createMinimalStarterCode(source, defaultReturn) {
          const lines = source.split('\n');
          const signatureLine = lines.find((line) => line.trim()) || 'solve() {';
          const closingLine = lines.slice().reverse().find((line) => line.trim() === '}') || '}';
          return [
            signatureLine,
            '  return ' + defaultReturn + ';',
            closingLine,
          ].join('\n');
        }

        function lookupCoveragePlan() {
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

        function extremaValueCoveragePlan() {
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

        function extremaIndexCoveragePlan(kind) {
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

        function aggregateCoveragePlan() {
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

        function countMaxCoveragePlan() {
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

        function countUniqueCoveragePlan() {
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

        function mostFrequentCoveragePlan() {
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

        function transformCoveragePlan() {
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

        function secondExtremeCoveragePlan() {
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

        function sortedCheckCoveragePlan() {
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

        function pairSumCoveragePlan() {
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

        function rotateCoveragePlan() {
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

        function runCoveragePlan() {
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

        function mergeCoveragePlan() {
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

        function missingNumberCoveragePlan() {
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

        function makeCase(args, note) {
          return { args, note };
        }

        function repeatPattern(pattern, length) {
          const values = [];
          for (let index = 0; index < length; index += 1) {
            values.push(pattern[index % pattern.length]);
          }
          return values;
        }

        function createLookupArray(length, target, positions) {
          const fillers = [-9, -7, -5, -3, -1, 1, 3, 5, 7, 9].filter((value) => value !== target);
          const values = [];
          for (let index = 0; index < length; index += 1) {
            values.push(fillers[index % fillers.length]);
          }
          for (const index of positions) {
            if (index >= 0 && index < values.length) {
              values[index] = target;
            }
          }
          return values;
        }

        function createSortedFromPattern(pattern, length) {
          return repeatPattern(pattern, length).slice().sort((left, right) => left - right);
        }

        function createMissingNumberCase(n, missing) {
          const values = [];
          for (let value = 0; value <= n; value += 1) {
            if (value !== missing) {
              values.push(value);
            }
          }
          return makeCase([reorderForMissingCase(values)], 'Large deterministic missing-number case.');
        }

        function reorderForMissingCase(values) {
          const reordered = [];
          let left = 0;
          let right = values.length - 1;
          while (left <= right) {
            reordered.push(values[right]);
            if (left !== right) {
              reordered.push(values[left]);
            }
            left += 1;
            right -= 1;
          }
          return reordered;
        }

        function classifyTestOutcome(expected, test) {
          if (typeof expected === 'number') {
            if (expected === -1) {
              return 'number:-1';
            }
            if (expected === 0) {
              return 'number:0';
            }
            if (expected > 0) {
              return 'number:positive';
            }
            return 'number:negative';
          }
          if (typeof expected === 'boolean') {
            return 'boolean:' + expected;
          }
          if (expected === null) {
            return 'null';
          }
          if (Array.isArray(expected)) {
            return 'array:length:' + expected.length + ':args:' + bucketSize(estimateTestSize(test));
          }
          return typeof expected + ':' + String(expected).slice(0, 20);
        }

        function createTestSignature(test) {
          return JSON.stringify(test.args);
        }

        function estimateTestSize(test) {
          return measureValueSize(test.args) + (test.note ? test.note.length : 0);
        }

        function measureValueSize(value) {
          if (Array.isArray(value)) {
            return value.reduce((sum, item) => sum + measureValueSize(item), value.length);
          }
          if (value && typeof value === 'object') {
            return Object.values(value).reduce((sum, item) => sum + measureValueSize(item), Object.keys(value).length);
          }
          if (typeof value === 'string') {
            return value.length;
          }
          return 1;
        }

        function bucketSize(size) {
          if (size <= 8) {
            return 'small';
          }
          if (size <= 18) {
            return 'medium';
          }
          return 'large';
        }

        function executeStudentCode({ source, methodName, args, timeoutMs }) {
          return new Promise((resolve) => {
            const workerSource = `
self.onmessage = async (event) => {
  const { source, methodName, args } = event.data;
  try {
    const student = Function('"use strict"; return ({' + source + '});')();
    const method = student[methodName];
    if (typeof method !== 'function') {
      throw new Error('Method "' + methodName + '" was not defined.');
    }
    const result = await method.apply(student, args);
    self.postMessage({ ok: true, value: result });
  } catch (error) {
    self.postMessage({ ok: false, error: error && error.message ? error.message : String(error) });
  }
};`;
            const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
            const worker = new Worker(workerUrl);

            const timer = window.setTimeout(() => {
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
              resolve({ ok: false, error: 'Time limit exceeded.' });
            }, timeoutMs);

            worker.onmessage = (event) => {
              window.clearTimeout(timer);
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
              resolve(event.data);
            };

            worker.onerror = (event) => {
              window.clearTimeout(timer);
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
              resolve({ ok: false, error: event.message || 'Worker execution failed.' });
            };

            worker.postMessage({ source, methodName, args });
          });
        }

        function createRng(seed) {
          let state = seed >>> 0;
          return () => {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 4294967296;
          };
        }

        function stableHash(text) {
          let hash = 2166136261;
          for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return hash >>> 0;
        }

        function randomInt(rng, min, max) {
          return Math.floor(rng() * (max - min + 1)) + min;
        }

        function pickOne(rng, values) {
          return values[randomInt(rng, 0, values.length - 1)];
        }

        function createNumberArray(rng, options = {}) {
          const length = randomInt(rng, options.lengthMin || 4, options.lengthMax || 8);
          const valueMin = options.valueMin ?? -6;
          const valueMax = options.valueMax ?? 9;
          const numbers = [];
          for (let index = 0; index < length; index += 1) {
            numbers.push(randomInt(rng, valueMin, valueMax));
          }
          return numbers;
        }

        function createSortedArray(rng, options = {}) {
          return createNumberArray(rng, options).sort((left, right) => left - right);
        }

        function shuffleInPlace(values, rng) {
          for (let index = values.length - 1; index > 0; index -= 1) {
            const nextIndex = randomInt(rng, 0, index);
            const temp = values[index];
            values[index] = values[nextIndex];
            values[nextIndex] = temp;
          }
        }

        function cloneValue(value) {
          if (typeof structuredClone === 'function') {
            return structuredClone(value);
          }
          return JSON.parse(JSON.stringify(value));
        }

        function normalizePairs(value) {
          if (!Array.isArray(value)) {
            return null;
          }
          if (!value.every((entry) => Array.isArray(entry) && entry.length === 2 && entry.every((item) => typeof item === 'number'))) {
            return null;
          }
          return value
            .map((entry) => [Math.min(entry[0], entry[1]), Math.max(entry[0], entry[1])])
            .sort((left, right) => (left[0] - right[0]) || (left[1] - right[1]));
        }

        function deepEqual(left, right) {
          if (Object.is(left, right)) {
            return true;
          }
          if (Array.isArray(left) && Array.isArray(right)) {
            if (left.length !== right.length) {
              return false;
            }
            for (let index = 0; index < left.length; index += 1) {
              if (!deepEqual(left[index], right[index])) {
                return false;
              }
            }
            return true;
          }
          if (left && right && typeof left === 'object' && typeof right === 'object') {
            const leftKeys = Object.keys(left);
            const rightKeys = Object.keys(right);
            if (leftKeys.length !== rightKeys.length) {
              return false;
            }
            for (const key of leftKeys) {
              if (!deepEqual(left[key], right[key])) {
                return false;
              }
            }
            return true;
          }
          return false;
        }

        function formatValue(value) {
          if (typeof value === 'string') {
            return value;
          }
          if (value === undefined) {
            return 'undefined';
          }
          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        }

        function formatExecutionError(message) {
          const text = String(message || 'Unknown execution error.');
          const notDefinedMatch = text.match(/^([A-Za-z_$][\w$]*) is not defined$/);
          if (notDefinedMatch) {
            const variableName = notDefinedMatch[1];
            return 'Variable "' + variableName + '" chua duoc khai bao. Hay them let hoac const, vi du: let ' + variableName + ' = ...;';
          }
          return text;
        }

        function errorMessage(error) {
          return error && error.message ? error.message : String(error);
        }
