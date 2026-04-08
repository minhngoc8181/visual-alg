# Algorithm Visualizer for Basic Arrays

Browser-only educational tool for stepping through basic array algorithms with a Java-like syntax, normalized into a small JavaScript subset and executed safely with JS-Interpreter.

The workspace now exposes two Vite HTML entries:

- `/` for the main visualizer app
- `/array-algorithms.html` for the practice runner page

## Stack

- TypeScript
- Vite
- CodeMirror 6
- JS-Interpreter
- Plain DOM and CSS

## MVP Included

- lesson selector
- CodeMirror editor with current-line highlight
- controls: Reset, Next, Run, Pause, speed slider
- array visualization with read, write, compare, and swap states
- pointer visualization for index variables such as `i` and `j`
- variables panel grouped by role
- operation log
- explanation panel
- 5 lessons:
  - indexOf(value)
  - find maximum value
  - count occurrences of a value
  - reverse array
  - bubble sort

## Supported Syntax Subset

This app intentionally supports only a narrow Java-like subset.

- simple assignments
- `if`, `while`, `for`, `break`, `continue`
- one-dimensional arrays
- array indexing and `.length`
- primitive declarations such as `int i = 0;`
- `System.out.println(...)` mapped to `print(...)`
- helper `swap(arr, i, j)` for array swaps

Unsupported examples are rejected with friendly validation messages.

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Vite writes both pages to `dist/`:

- `dist/index.html`
- `dist/array-algorithms.html`

Run lint checks:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

## Project Structure

```text
src/
  app/
  editor/
  engine/
  lessons/
  state/
  styles/
  types/
  ui/
  visual/
```

## Execution Pipeline

1. validate the Java-like source against the supported subset
2. normalize declarations and print helpers into a JS-compatible subset
3. instrument the code with semantic runtime hooks
4. execute the instrumented code in JS-Interpreter
5. reduce runtime events into UI state

## Test Coverage

The current test suite covers:

- runtime event utilities
- validator
- normalizer
- instrumenter
- interpreter runner
- reducer behavior
- end-to-end execution of all 5 MVP lessons

## Known Limits

- this is not a full Java parser or runtime
- syntax support is intentionally narrow
- swap visualization currently uses a lightweight pulse rather than a complex motion path
- the bundled `js-interpreter` chunk is large; build still succeeds, but code-splitting would be a sensible next optimization