import type { DomRefs } from './types';

export function renderAppShell(container: HTMLElement): void {
  container.innerHTML = `
    <main class="page">
      <section class="hero">
        <h1>Basic Algorithms on Arrays</h1>
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
}

export function getDomRefs(root: ParentNode = document): DomRefs {
  return {
    lessonSelect: mustElement<HTMLSelectElement>(root, '#lessonSelect'),
    lessonDescription: mustElement<HTMLParagraphElement>(root, '#lessonDescription'),
    methodName: mustElement<HTMLElement>(root, '#methodName'),
    testCount: mustElement<HTMLElement>(root, '#testCount'),
    editor: mustElement<HTMLTextAreaElement>(root, '#editor'),
    runButton: mustElement<HTMLButtonElement>(root, '#runButton'),
    solutionButton: mustElement<HTMLButtonElement>(root, '#solutionButton'),
    resetButton: mustElement<HTMLButtonElement>(root, '#resetButton'),
    summaryBadge: mustElement<HTMLSpanElement>(root, '#summaryBadge'),
    summaryMessage: mustElement<HTMLSpanElement>(root, '#summaryMessage'),
    summaryTotal: mustElement<HTMLElement>(root, '#summaryTotal'),
    summaryPassed: mustElement<HTMLElement>(root, '#summaryPassed'),
    summaryFailed: mustElement<HTMLElement>(root, '#summaryFailed'),
    summarySeed: mustElement<HTMLElement>(root, '#summarySeed'),
    resultsBody: mustElement<HTMLTableSectionElement>(root, '#resultsBody'),
    sampleCase: mustElement<HTMLDivElement>(root, '#sampleCase'),
  };
}

function mustElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}
