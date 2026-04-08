# Algorithm Visualizer for Basic Arrays — Technical Design

Version: 1.0  
Audience: product owner, technical lead, frontend developer  
Primary goal: help students understand basic array algorithms step by step in the browser

---

## 1. Overview

This project is a **browser-only teaching tool** for basic algorithms and simple data structures, optimized for classroom use.

The tool focuses on:

- stepping through code one operation at a time
- highlighting the current line of code
- showing how variables change over time
- showing reads and writes on arrays
- showing pointer/index movement such as `i` and `j`
- making it easy for the instructor to add or customize new algorithms later

The tool will use **Java-like syntax**, but it will **run entirely in the browser** by converting that syntax into a JavaScript subset and executing it with a sandboxed interpreter.

This design intentionally prioritizes:

- simplicity over completeness
- teaching clarity over language fidelity
- customization over general-purpose debugging

---

## 2. Product Goals

## 2.1 Main goal

Help students understand algorithmic thinking for basic array problems through a visual, controllable execution model.

## 2.2 Teaching goals

Students should be able to:

- see which line is running now
- observe how `i`, `j`, `max`, `sum`, `count`, `answer` change
- understand the difference between:
  - reading `arr[i]`
  - writing `arr[i] = ...`
  - comparing values
  - swapping two positions
  - moving loop indices
- replay and reason about an algorithm at a much smaller step granularity than normal execution

## 2.3 Instructor goals

The instructor should be able to:

- add a new algorithm without changing the whole application
- customize starter code and sample input
- define which variables should be displayed
- control the explanation text shown to students
- use predefined demos in class quickly

---

## 3. Scope

## 3.1 In scope for MVP

- browser-only app
- no backend required
- Java-like syntax input
- line-by-line execution
- step controls:
  - Next
  - Run
  - Pause
  - Reset
- visualization for:
  - Array
  - scalar variables
  - index/pointer markers: `i`, `j`, `left`, `right`, `maxIndex`, etc.
- operation log
- explanation panel
- a small library of predefined demos
- easy extension via configuration and small code modules

## 3.2 In scope for phase 2

- List visualization
- Dictionary / map visualization
- student free-edit mode using Java-like syntax
- simple output checking against expected result
- local persistence using browser storage

## 3.3 Out of scope for MVP

- full Java parser
- full Java runtime
- user authentication
- server-side grading
- advanced algorithms already well covered by VisuAlgo
- object-oriented execution model
- general-purpose debugger for arbitrary programs

---

## 4. Design Principles

1. **Browser-first**
   - runs fully in the browser
   - easy deployment to static hosting

2. **Teaching-first**
   - UI must emphasize understanding, not just execution

3. **Deterministic stepping**
   - each user action should correspond to a meaningful, visible state transition

4. **Simple extension model**
   - adding new exercises should be cheap

5. **Safe execution**
   - user code runs in an isolated interpreter rather than in the page environment

6. **Minimal framework burden**
   - avoid React
   - prefer TypeScript + small modules + DOM/SVG

---

## 5. Recommended Technology Stack

## 5.1 Core stack

- **TypeScript**
- **Vite**
- **CodeMirror 6**
- **JS-Interpreter**
- **HTML/CSS/SVG**
- optional lightweight state module written in-house

## 5.2 Why this stack

### TypeScript
- keeps the codebase maintainable as the number of modules grows
- helps define execution events and visualization state clearly

### Vite
- lightweight modern build tool
- good fit for a browser-only TypeScript project
- simple developer experience

### CodeMirror 6
- modern web editor
- supports line decorations and extensions
- good fit for highlighting the currently running line

### JS-Interpreter
- executes JavaScript in a sandbox
- supports stepping through execution
- isolates execution from the main browser environment
- ideal for converting Java-like syntax to a JavaScript subset and then stepping it

### Plain DOM/SVG
- sufficient for arrays, variables, list nodes, and dictionary buckets
- simpler than introducing a component framework
- easier to fine-tune for classroom visualization

---

## 6. Existing Tools to Reuse or Reference

The project should not depend fully on existing educational tools, but these tools are highly relevant:

### Python Tutor
Use as:

- a teaching aid immediately
- a UX reference for step-by-step execution
- a benchmark for clarity

Python Tutor already visualizes Java and JavaScript step by step, which confirms the educational value of step execution.

### JSAV / OpenDSA
Use as:

- inspiration for algorithm and data structure visualizations
- optional source of ideas for exercise authoring patterns

### VisuAlgo
Continue using for more advanced algorithms already covered well there.

---

## 7. High-Level Architecture

```text
User code (Java-like syntax)
        |
        v
Normalizer
  - remove types
  - rewrite supported syntax to JS subset
        |
        v
Instrumenter
  - inject line hooks
  - inject array read/write hooks
  - inject pointer movement hooks
        |
        v
Runner
  - execute instrumented code in JS-Interpreter
  - step, run, pause, reset
        |
        v
Event Stream
  - LINE_ENTER
  - SET_VAR
  - READ_ARRAY
  - WRITE_ARRAY
  - COMPARE
  - MOVE_POINTER
  - SWAP
        |
        v
UI State Store
        |
        v
Views
  - Editor
  - Array panel
  - Variables panel
  - Log panel
  - Explanation panel
  - Controls
```

---

## 8. Execution Strategy

The system will **not** try to execute full Java directly.

Instead it will:

1. accept **Java-like syntax**
2. normalize it into a safe JavaScript subset
3. instrument that code to emit visualization events
4. run the result in **JS-Interpreter**
5. update the UI from those events

This approach is intentionally narrower but far more practical for teaching.

---

## 9. Supported Java-like Syntax

## 9.1 Philosophy

Support only a small subset that is enough for basic algorithmic exercises.

The syntax should feel familiar to Java learners but remain easy to normalize.

## 9.2 Supported constructs for MVP

- variable assignment
- `if`, `else`
- `while`
- `for`
- `break`
- `continue`
- array literals
- array indexing
- array length
- comparison operators
- arithmetic operators
- boolean operators
- function-like helpers provided by the environment

## 9.3 Supported examples

```java
arr = [5, 2, 9, 2];
target = 2;
answer = -1;
i = 0;

while (i < arr.length) {
    if (arr[i] == target) {
        answer = i;
        break;
    }
    i = i + 1;
}
```

```java
arr = [3, 8, 1, 6];
max = arr[0];
i = 1;

while (i < arr.length) {
    if (arr[i] > max) {
        max = arr[i];
    }
    i = i + 1;
}
```

## 9.4 Optional Java-style declarations that may be accepted and stripped

These forms may be supported by the normalizer:

```java
int i = 0;
int answer = -1;
int[] arr = [1, 2, 3];
boolean found = false;
```

They will be rewritten to:

```javascript
i = 0;
answer = -1;
arr = [1, 2, 3];
found = false;
```

## 9.5 Syntax not supported in MVP

- classes
- methods defined by users
- generics
- objects
- imports
- Java standard library calls except mapped helpers
- recursion beyond carefully controlled demos
- nested data structures beyond simple arrays in MVP

---

## 10. Normalization Rules

The normalizer converts Java-like code to a JavaScript subset accepted by the interpreter.

## 10.1 Basic rules

- remove primitive type keywords:
  - `int`
  - `double`
  - `float`
  - `long`
  - `boolean`
  - `String`
- remove array type declarations such as `int[]`
- keep control structures:
  - `if`
  - `else`
  - `while`
  - `for`
- keep operators:
  - `+ - * / %`
  - `== != < <= > >=`
  - `&& || !`
- keep `.length`
- map supported print helpers:
  - `print(x)` -> internal helper
  - `System.out.println(x)` -> internal helper
- support swap helper for teaching-oriented array lessons:
  - `swap(arr, i, j)` -> internal runtime helper that emits `SWAP`

## 10.2 Normalizer constraints

The normalizer is **not** a full parser initially.

For MVP it can be built as a small staged transformer using:

- token cleanup
- controlled regex rewrites
- a narrow syntax validator

Later, if needed, it can evolve into a parser-based pipeline.

## 10.3 Validation errors

The system should reject unsupported syntax with friendly messages such as:

- `Classes are not supported in this mode.`
- `Only one-dimensional arrays are supported in this lesson.`
- `Method declarations are not supported yet.`
- `Please use Java-like syntax without imports.`

---

## 11. Instrumentation Strategy

The tool must visualize more than just line execution. It must also understand key algorithmic actions.

Instrumentation will inject hooks into normalized code so the runtime produces meaningful events.

## 11.1 Event categories

- line execution
- variable assignment
- array access
- comparison
- pointer movement
- swap
- logging/explanation

## 11.2 Core event types

```ts
type RuntimeEvent =
  | { type: 'LINE_ENTER'; line: number }
  | { type: 'SET_VAR'; name: string; value: unknown }
  | { type: 'READ_ARRAY'; arrayName: string; index: number; value: unknown }
  | { type: 'WRITE_ARRAY'; arrayName: string; index: number; value: unknown }
  | { type: 'COMPARE'; left: unknown; operator: string; right: unknown; result: boolean }
  | { type: 'MOVE_POINTER'; name: string; index: number }
  | { type: 'SWAP'; arrayName: string; i: number; j: number }
  | { type: 'PRINT'; text: string }
  | { type: 'FINISH' }
  | { type: 'ERROR'; message: string };
```

## 11.3 Example instrumentation idea

Source:

```java
if (arr[i] == target) {
    answer = i;
}
```

Possible transformed behavior:

1. emit `LINE_ENTER`
2. emit `READ_ARRAY(arr, i, arr[i])`
3. emit `COMPARE(arr[i], '==', target, result)`
4. if true:
   - emit `SET_VAR(answer, i)`

## 11.4 Pointer movement rule

Variables designated as pointers or indices should trigger `MOVE_POINTER`.

Examples:
- `i = i + 1`
- `j = j - 1`
- `left = mid + 1`

This should be configured per lesson or per algorithm definition because not every integer variable is a pointer.

---

## 12. Runtime Model

## 12.1 Runner states

```ts
type RunnerState =
  | 'idle'
  | 'ready'
  | 'running'
  | 'paused'
  | 'finished'
  | 'error';
```

## 12.2 Runner responsibilities

- initialize interpreter
- perform one step
- run continuously with speed control
- pause
- reset to initial state
- capture emitted events
- coordinate UI updates

## 12.3 Step semantics

There are two possible step semantics:

### Option A — interpreter step
- one UI click performs one interpreter step
- too low-level for education in some cases

### Option B — semantic step
- one UI click advances until the next meaningful event boundary
- much better for teaching

**Recommendation:** implement **semantic step** for the student-facing tool.

That means `Next` should usually correspond to a meaningful visible action such as:
- line change
- variable update
- array read/write
- comparison
- swap

---

## 13. UI Design

## 13.1 Main layout

Recommended desktop layout:

```text
+--------------------------------------------------------------+
| Toolbar: lesson selector | reset | next | run | pause | speed|
+--------------------------+-------------------+---------------+
| Code Editor              | Data Visualization               |
|                          | - Array view                     |
| highlighted current line | - Pointer markers                |
|                          | - Variables panel                |
+--------------------------+----------------------------------+
| Operation Log            | Explanation Panel                |
+--------------------------------------------------------------+
```

## 13.2 UI components

### A. Lesson selector
- choose predefined algorithm demo

### B. Code editor
- editable or read-only depending on mode
- current line highlight
- optional error markers
- inline syntax validation area for unsupported Java-like constructs

### C. Array view
- one row of cells
- each cell shows index and value
- recently read cell briefly highlighted
- recently written cell more strongly highlighted

### D. Pointer markers
- labels such as `i`, `j`, `maxIndex`
- displayed above or below the array cells

### E. Variables panel
- current scalar values
- grouped into:
  - inputs
  - loop indices
  - accumulators
  - outputs

### F. Operation log
Examples:
- `Read arr[2] = 9`
- `Compare 9 > 5 => true`
- `Set max = 9`
- `Move i to 3`

### G. Explanation panel
Teacher-friendly explanation text mapped from event types and algorithm context.

### H. Controls
- Reset
- Next
- Run
- Pause
- speed slider

Current implementation note:
- lesson selector stays in the header
- execution controls live inside the array panel footer for shorter mouse travel
- keyboard shortcuts are supported: `N`, `R`, `P`, `Esc`

---

## 14. Visualization Rules

## 14.1 Array visualization

Each cell should display:
- index
- value

States:
- normal
- active-read
- active-write
- compared
- swapped

## 14.2 Variables visualization

Variables should be displayed with current value and optional badge:
- input
- pointer
- accumulator
- result

## 14.3 Pointer visualization

Pointers should:
- move clearly between indices
- be able to stack when multiple pointers point to the same cell
- be color-coded consistently

## 14.4 Animation rules

Animations should be short and instructional, not decorative.

Recommended durations:
- pointer move: 150–250 ms
- read flash: 120–180 ms
- write flash: 180–250 ms
- swap animation: 250–400 ms

Animations must never block stepping precision.

Current implementation note:
- swap animation uses a lightweight directional slide on the two active cells rather than a full path-based motion system

---

## 15. Algorithm Definition Format

To make the tool extensible, each predefined exercise should be defined declaratively.

## 15.1 Proposed interface

```ts
export interface LessonDefinition {
  id: string;
  title: string;
  description: string;
  category: 'array' | 'list' | 'dictionary';
  starterCode: string;
  initialBindings: Record<string, unknown>;
  watchedVariables: string[];
  pointerVariables: string[];
  primaryStructure: 'array' | 'list' | 'dictionary';
  explanationMap?: Partial<Record<RuntimeEvent['type'], string | ((event: RuntimeEvent) => string)>>;
  expectedOutputDescription?: string;
}
```

## 15.2 Example

```ts
export const indexOfLesson: LessonDefinition = {
  id: 'array-index-of',
  title: 'indexOf(value)',
  description: 'Find the first index where target appears in the array.',
  category: 'array',
  starterCode: `arr = [5, 2, 9, 2];
target = 2;
answer = -1;
i = 0;

while (i < arr.length) {
    if (arr[i] == target) {
        answer = i;
        break;
    }
    i = i + 1;
}`,
  initialBindings: {},
  watchedVariables: ['target', 'answer', 'i'],
  pointerVariables: ['i'],
  primaryStructure: 'array'
};
```

---

## 16. MVP Lesson Set

These lessons are recommended for the first demo release.

## 16.1 `indexOf(value)`
Concepts:
- linear scan
- index variable
- comparison
- early exit

## 16.2 `contains(value)`
Concepts:
- boolean result
- early return or flag

## 16.3 `find maximum value`
Concepts:
- current best value
- conditional update

## 16.4 `find index of maximum value`
Concepts:
- tracking index vs tracking value

## 16.5 `sum of all elements`
Concepts:
- accumulation

## 16.6 `count occurrences of a value`
Concepts:
- counting pattern

## 16.7 `reverse array`
Concepts:
- two pointers
- symmetric swap

## 16.8 `bubble sort`
Concepts:
- nested loops
- comparison + swap
- repeated passes

For the very first demo build, it is acceptable to implement only:

- `indexOf`
- `find maximum value`
- `count occurrences`
- `reverse array`
- `bubble sort`

---

## 17. Data Structures Beyond Array

## 17.1 List
Phase 2:
- support array-backed list or simple linked representation
- useful for teaching insert/remove

## 17.2 Dictionary
Phase 2:
- show key-value pairs
- basic operations:
  - set
  - get
  - containsKey
  - delete

These should be visualized after the array model is stable.

---

## 18. File and Module Structure

Recommended project layout:

```text
/src
  /app
    bootstrap.ts
    config.ts

  /editor
    editor.ts
    highlighting.ts

  /engine
    normalizer.ts
    validator.ts
    instrumenter.ts
    interpreter-runner.ts
    runtime-events.ts

  /lessons
    lesson-types.ts
    array-index-of.ts
    array-find-max.ts
    array-count-occurrences.ts
    array-reverse.ts
    array-bubble-sort.ts
    registry.ts

  /state
    app-state.ts
    runner-state.ts
    reducers.ts

  /ui
    toolbar.ts
    layout.ts
    panels/

  /ui/panels
    code-panel.ts
    array-panel.ts
    variables-panel.ts
    log-panel.ts
    explanation-panel.ts

  /visual
    array-renderer.ts
    pointer-renderer.ts
    variable-renderer.ts
    animation.ts

  /styles
    reset.css
    app.css
    editor.css
    visual.css

  main.ts
```

---

## 19. Error Handling

## 19.1 Syntax and validation errors
Examples:
- unsupported syntax
- malformed loops
- multidimensional arrays
- undeclared lesson constraints

These errors should be shown clearly in the editor area.

Current implementation note:
- validation errors are rendered below the editor and execution controls are disabled until the source is valid

## 19.2 Runtime errors
Examples:
- out-of-range array access
- division by zero
- invalid transformed code

These errors should:
- stop execution
- highlight the offending line if possible
- display a friendly explanation

## 19.3 Instructor mode vs student mode
In instructor mode:
- show more technical error details

In student mode:
- show simpler language

---

## 20. Performance Considerations

The target problems are small classroom examples, so performance is not the main bottleneck.

Still, the system should:

- keep arrays small in MVP demos
- avoid excessive DOM repainting
- batch UI updates per semantic step
- use requestAnimationFrame for visual transitions where needed

The chosen interpreter is slower than native execution, but that is acceptable for short algorithm visualizations because clarity matters more than throughput.

---

## 21. Security Considerations

Because the tool executes user-provided code-like input in the browser, execution must remain isolated.

Security principles:

- do not run user code via `eval`
- do not expose browser globals directly
- execute via JS-Interpreter only
- register only controlled helper APIs
- bound execution steps to avoid infinite loops
- provide a maximum step count, for example:
  - 10,000 steps in student mode
  - configurable in instructor mode

---

## 22. Testing Strategy

## 22.1 Unit tests
Test:
- normalization
- validation
- instrumentation
- event emission
- lesson registry

## 22.2 Integration tests
Test:
- loading a lesson
- clicking Next repeatedly
- line highlight sync
- variable panel updates
- array read/write highlights
- reset correctness

## 22.3 Acceptance tests
Manual or automated checks:
- `indexOf` behaves correctly on:
  - found at first index
  - found at middle index
  - not found
- `reverse` behaves correctly on:
  - even length
  - odd length
  - single element
- `bubbleSort` shows swaps correctly

---

## 23. Accessibility and Classroom UX

Recommended improvements:

- keyboard shortcuts:
  - `N` for Next
  - `R` for Run
  - `P` for Pause
  - `Esc` for Reset
- large visual target areas for classroom projection
- dark mode and light mode
- readable fonts
- high-contrast current-line highlight

Current implementation note:
- a visual legend is shown inside the array panel for read, write, compare, swap, and pointer states

---

## 24. Future Extensions

## 24.1 Student edit mode
Allow students to modify starter code and visualize their own variations.

## 24.2 Auto-check mode
After execution finishes, compare result variables or array state to expected output.

## 24.3 Exercise mode
Prompt students with:
- predict next step
- fill missing line
- identify bug
- choose correct loop invariant

## 24.4 Persistence
Store last opened lesson and code in local storage.

## 24.5 Shareable lesson links
Encode lesson ID and sample data in the URL.

---

## 25. Risks and Mitigations

## Risk 1: Normalizer too weak
Mitigation:
- keep syntax subset intentionally small
- validate early
- reject unsupported syntax clearly

## Risk 2: Instrumentation becomes brittle
Mitigation:
- start with lesson-specific supported patterns
- keep test coverage on transformed snippets
- introduce a parser later only if necessary

## Risk 3: UI becomes too generic and less helpful
Mitigation:
- prioritize array-specific visualization and explanations in MVP
- avoid trying to support all structures at once

## Risk 4: Infinite loops in user code
Mitigation:
- max step guard
- pause with warning
- reset option

---

## 26. Acceptance Criteria for MVP

The MVP is accepted when:

1. The app runs fully in the browser from a static build.
2. The user can open one of the predefined lessons.
3. The code editor shows the lesson code.
4. Clicking `Next` advances execution in meaningful teaching steps.
5. The currently running line is highlighted.
6. The array visualization updates correctly on reads, writes, and swaps.
7. Pointer variables like `i` and `j` are shown at the correct indices.
8. Scalar variables are updated correctly.
9. Reset restores the initial state.
10. At least 5 demo algorithms are available.

---

## 27. Suggested Delivery Plan

## Milestone 1 — Foundation
- project setup
- editor
- static layout
- runner skeleton
- line highlight

## Milestone 2 — Array visualization
- array renderer
- variable panel
- pointer rendering
- log panel

## Milestone 3 — Execution pipeline
- normalizer
- validator
- instrumenter
- JS-Interpreter integration
- semantic stepping

## Milestone 4 — Lesson pack
- first 5 lessons
- explanations
- polishing

## Milestone 5 — Hardening
- error handling
- tests
- classroom UX tuning

---

## 28. Recommended Development Order

1. Build static layout with fake data
2. Build array panel and pointer panel
3. Integrate CodeMirror with current-line highlight
4. Implement lesson registry
5. Build runner with fake events
6. Implement runtime event playback from fake scripts
7. Integrate JS-Interpreter
8. Add normalizer
9. Add minimal instrumentation
10. Connect real runtime events to UI
11. Add first 2 lessons
12. Add remaining MVP lessons
13. Add tests and polish

This order reduces risk because UI and event model can be validated before language execution is complete.

---

## 29. Notes for the Developer

- Do not attempt full Java support early.
- Keep the event model stable.
- Favor correctness and clarity over clever parsing.
- Build the array experience first.
- Only after array lessons feel excellent should list/dictionary be added.

---

## 30. Reference Notes

These references justify the recommended approach:

- **CodeMirror** is a web code editor component with an extensible API and module-based integration, suitable for current-line highlighting and editor customization.
- **JS-Interpreter** is a sandboxed JavaScript interpreter that can execute arbitrary ES5 code line by line in isolation and safety.
- **Python Tutor** already visualizes Java and JavaScript code step by step, which validates the educational usefulness of step-based code execution.
- **OpenAI Codex** can work as an AI coding agent across ChatGPT-connected surfaces and local/cloud workflows, making it suitable as an implementation assistant after this design is approved.

---

## 31. Final Recommendation

Build the product as a **small browser-native teaching tool** with:

- TypeScript
- CodeMirror 6
- JS-Interpreter
- plain DOM/SVG
- Java-like syntax normalized into JavaScript subset

This is the best balance between:

- ease of implementation
- classroom usefulness
- long-term extensibility
- low operational complexity
