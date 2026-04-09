import '../styles/reset.css';
import '../styles/array-practice.css';

import type { EditorView } from '@codemirror/view';
import { createCodeMirrorEditor, setEditorValue, getEditorValue } from './codemirror-editor';
import { createLessons } from './lessons';
import { deepEqual } from './comparison';
import {
  buildTestSuite,
  cloneValue,
  errorMessage,
  executeStudentCode,
  formatExecutionError,
  formatValue,
} from './runner';
import { renderAppShell, getDomRefs } from './shell';
import { loadPersistedState, savePersistedState } from './storage';
import type { Lesson, ResultRow, SummaryState, TestSuite } from './types';

const STORAGE_KEY = 'visualalg-array-practice-v1';
const TEST_TIMEOUT_MS = 800;

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('App root "#app" was not found.');
}

renderAppShell(app);

const dom = getDomRefs(app);
const lessons = createLessons() as Lesson[];
const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const persisted = loadPersistedState(STORAGE_KEY);
const draftByLesson: Record<string, string> = persisted.draftByLesson || {};
let selectedLessonId = lessonMap.has(persisted.lessonId || '') ? persisted.lessonId || lessons[0]!.id : lessons[0]!.id;
let isRunning = false;

// ─── CodeMirror setup ────────────────────────────────────────────────────────

const initialLesson = lessonMap.get(selectedLessonId)!;
const initialCode = draftByLesson[selectedLessonId] || initialLesson.starterCode;

let cmView: EditorView = createCodeMirrorEditor(
  dom.editorHost,
  initialCode,
  (newValue) => {
    draftByLesson[selectedLessonId] = newValue;
    persistState();
  },
);

// ─── Init ────────────────────────────────────────────────────────────────────

renderLessonOptions();
syncLessonView();
renderIdleSummary();

// ─── Event listeners ─────────────────────────────────────────────────────────

dom.lessonSelect.addEventListener('change', () => {
  persistCurrentDraft();
  selectedLessonId = dom.lessonSelect.value;
  syncLessonView();
  persistState();
  clearResults();
});

dom.resetButton.addEventListener('click', () => {
  const lesson = getSelectedLesson();
  setEditorValue(cmView, lesson.starterCode);
  draftByLesson[selectedLessonId] = lesson.starterCode;
  persistState();
});

dom.solutionButton.addEventListener('click', () => {
  const lesson = getSelectedLesson();
  setEditorValue(cmView, lesson.solutionCode);
  draftByLesson[selectedLessonId] = lesson.solutionCode;
  persistState();
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSelectedLesson(): Lesson {
  const lesson = lessonMap.get(selectedLessonId);
  if (!lesson) {
    throw new Error(`Unknown lesson id: ${selectedLessonId}`);
  }
  return lesson;
}

function persistCurrentDraft(): void {
  draftByLesson[selectedLessonId] = getEditorValue(cmView);
}

function persistState(): void {
  savePersistedState(STORAGE_KEY, {
    lessonId: selectedLessonId,
    draftByLesson,
  });
}

function renderLessonOptions(): void {
  dom.lessonSelect.replaceChildren(
    ...lessons.map((lesson) => {
      const option = document.createElement('option');
      option.value = lesson.id;
      option.textContent = lesson.title;
      return option;
    }),
  );
}

function syncLessonView(): void {
  const lesson = getSelectedLesson();
  dom.lessonSelect.value = lesson.id;
  dom.lessonDescription.textContent = lesson.description;
  dom.methodName.textContent = lesson.methodName;
  dom.testCount.textContent = `${lesson.testCount} total / ${lesson.visibleTestCount} shown`;

  setEditorValue(cmView, draftByLesson[lesson.id] || lesson.starterCode);

  if (lesson.hints && lesson.hints.length > 0) {
    dom.hintPanel.style.display = 'block';
    dom.hintBody.innerHTML = `
      <div class="callout hint-box">
        <ul class="hint-list">
          ${lesson.hints.map((hint) => `<li class="hint-item mono">${hint}</li>`).join('')}
        </ul>
      </div>
    `;
  } else {
    dom.hintPanel.style.display = 'none';
  }

  renderSampleCase(lesson);
}

function renderSampleCase(lesson: Lesson): void {
  const suite = buildTestSuite(lesson) as TestSuite;
  const sample = suite.tests.find((test) => test.isVisible) || suite.tests[0];
  if (!sample) {
    dom.sampleCase.textContent = 'No deterministic sample is available for this lesson.';
    return;
  }
  dom.sampleCase.textContent = `Deterministic sample args: ${formatValue(sample.args)}${sample.note ? ` | Note: ${sample.note}` : ''} | Seed: ${suite.seed}`;
}

function clearResults(): void {
  dom.resultsBody.innerHTML = '<tr><td colspan="7" class="empty">No tests have been executed yet.</td></tr>';
  renderIdleSummary();
}

function renderIdleSummary(): void {
  dom.summaryBadge.className = 'badge idle';
  dom.summaryBadge.textContent = 'Idle';
  dom.summaryMessage.textContent = 'Ready to run generated tests.';
  dom.summaryTotal.textContent = '0';
  dom.summaryPassed.textContent = '0';
  dom.summaryFailed.textContent = '0';
  dom.summarySeed.textContent = '-';
}

async function runSelectedLesson(): Promise<void> {
  const lesson = getSelectedLesson();
  const source = getEditorValue(cmView).trim();

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
  persistState();
  setRunning(true);

  try {
    const suite = buildTestSuite(lesson) as TestSuite;
    const rows: ResultRow[] = [];
    let passed = 0;

    for (const [index, test] of suite.tests.entries()) {
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
          message: `Reference solution failed: ${test.expectedError}`,
          isVisible: test.isVisible,
        });
        continue;
      }

      const execution = await executeStudentCode({
        source,
        methodName: lesson.methodName,
        args: argsForStudent,
        timeoutMs: TEST_TIMEOUT_MS,
      }) as { ok: boolean; error?: string; value?: unknown };

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
      seed: suite.seed,
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
        message: String(errorMessage(error)),
      },
    ]);
  } finally {
    setRunning(false);
  }
}

function setRunning(nextRunning: boolean): void {
  isRunning = nextRunning;
  dom.runButton.disabled = nextRunning;
  dom.solutionButton.disabled = nextRunning;
  dom.resetButton.disabled = nextRunning;
  dom.lessonSelect.disabled = nextRunning;

  // Disable/enable CodeMirror editing
  cmView.contentDOM.contentEditable = nextRunning ? 'false' : 'true';

  if (nextRunning) {
    dom.summaryBadge.className = 'badge idle';
    dom.summaryBadge.textContent = 'Running';
    dom.summaryMessage.textContent = 'Executing generated tests in Web Workers...';
  }
}

function renderSummary(summary: SummaryState): void {
  dom.summaryBadge.className = `badge ${summary.badge}`;
  dom.summaryBadge.textContent = summary.badge.charAt(0).toUpperCase() + summary.badge.slice(1);
  dom.summaryMessage.textContent = summary.message;
  dom.summaryTotal.textContent = String(summary.total);
  dom.summaryPassed.textContent = String(summary.passed);
  dom.summaryFailed.textContent = String(summary.failed);
  dom.summarySeed.textContent = String(summary.seed);
}

function renderRows(rows: ResultRow[]): void {
  dom.resultsBody.replaceChildren(
    ...rows.map((row) => {
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
    }),
  );
}

function createCell(text: string, className?: string): HTMLTableCellElement {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) {
    td.className = className;
  }
  return td;
}
