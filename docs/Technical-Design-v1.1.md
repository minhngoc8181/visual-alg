# Algorithm Visualizer for Basic Arrays — Technical Design

Version: 1.1  
Audience: product owner, technical lead, frontend developer  
Primary goal: help students understand basic array algorithms step by step in the browser, and practice them with a lightweight LeetCode-like runner

---

## 1. Overview

This project is a **browser-only teaching tool** for basic algorithms and simple data structures, optimized for classroom use.

The tool now has **two complementary modes**:

1. **Visualizer mode**
   - stepping through code one operation at a time
   - highlighting the current line of code
   - showing how variables change over time
   - showing reads and writes on arrays
   - showing pointer/index movement such as `i` and `j`

2. **Practice runner mode**
   - students select one lesson
   - students write a small JavaScript method in the browser
   - the browser generates fresh test cases
   - the browser computes expected answers using a trusted reference solution
   - the browser compares the student answer with the expected answer
   - the browser displays accepted / partial / failed with per-test details

This design intentionally prioritizes:

- simplicity over completeness
- teaching clarity over language fidelity
- customization over general-purpose debugging
- browser-only delivery with no backend in the first release

---

## 2. Product Goals

### 2.1 Main goal

Help students understand algorithmic thinking for basic array problems through:

- step-by-step visualization in class
- direct coding practice with immediate feedback outside or during class

### 2.2 Teaching goals

Students should be able to:

- see which line is running now
- observe how `i`, `j`, `max`, `sum`, `count`, `answer` change
- understand reads, writes, comparisons, swaps, and pointer movement
- solve warm-up array exercises repeatedly with randomized test cases
- connect algorithm ideas with code implementation quickly

### 2.3 Instructor goals

The instructor should be able to:

- add a new algorithm without changing the whole application
- customize starter code and sample input
- define which variables should be displayed in visualizer mode
- define `genTest`, `solution`, and `checker` for practice mode
- use predefined demos in class quickly
- extend the lesson list with minimal code changes

---

## 3. Scope

### 3.1 In scope for MVP

- browser-only app
- no backend required
- static hosting friendly
- lesson selector
- editor for JavaScript method syntax
- Run button
- generated test cases per run
- per-test pass/fail result table
- summary badge: Accepted / Partial / Failed
- practice lesson registry with `genTest`, `solution`, `checker`
- visualizer mode remains part of long-term architecture but may be implemented separately from the practice runner MVP

### 3.2 In scope for phase 2

- step-by-step visualizer integrated into the same app shell
- CodeMirror editor
- hidden/public testcase split
- local persistence with browser storage
- syntax validation before run
- support for List and Dictionary in visualizer mode

### 3.3 Out of scope for MVP

- full Java parser
- full Java runtime
- user authentication
- server-side grading
- advanced algorithms already covered well by VisuAlgo
- object-oriented execution model
- general-purpose debugger for arbitrary programs

---

## 4. Design Principles

1. **Browser-first**
   - runs fully in the browser
   - easy deployment to static hosting

2. **Teaching-first**
   - UI must emphasize understanding, not just execution

3. **Practice-first for warm-up mode**
   - a lesson should be solvable in one small function
   - feedback should appear quickly

4. **Deterministic official answers**
   - each lesson must have a trusted reference solution
   - tie cases must be explicitly defined

5. **Simple extension model**
   - adding new exercises should be cheap

6. **Safe execution**
   - student code should not freeze the main page

7. **Minimal framework burden**
   - avoid React
   - prefer small modules + DOM/CSS

---

## 5. Recommended Technology Stack

### 5.1 Core stack

- **HTML/CSS/JavaScript modules** for the first practice runner implementation
- optional future migration to **TypeScript + Vite** when the project grows
- **Web Worker** for isolated student-code execution
- optional future **CodeMirror 6** editor upgrade
- optional future **JS-Interpreter** integration for visualizer mode

### 5.2 Why this stack

#### Plain JavaScript modules
- lowest setup cost
- easiest to open locally or deploy to static hosting
- good fit for the first browser-only artifact

#### Web Worker
- student code runs off the main UI thread
- prevents page freeze from infinite loops
- allows timeout-based cancellation

#### Optional CodeMirror later
- useful once syntax highlighting and better editing UX become important
- not required for the first working version

#### Optional JS-Interpreter later
- valuable for visualizer mode with step-by-step execution
- not required for the current LeetCode-like practice runner

---

## 6. Two-Mode Architecture

```text
Shared Lesson Registry
  ├─ Practice Runner Mode
  │    ├─ Lesson selector
  │    ├─ Starter code editor
  │    ├─ genTest
  │    ├─ solution
  │    ├─ checker
  │    └─ Result table
  │
  └─ Visualizer Mode (future / parallel)
       ├─ Normalizer
       ├─ Instrumenter
       ├─ Runner
       ├─ Event stream
       └─ Array / variable / pointer panels
```

This separation is intentional.

- **Practice runner mode** is for coding and checking
- **Visualizer mode** is for stepping and explaining

They can share lesson metadata and utility code later, but should not be forced into one runtime model too early.

---

## 7. Practice Runner UI

The page should contain:

1. Heading:
   - `Algorithm for Basic Arrays`

2. Lesson selector:
   - label `Lesson`
   - dropdown with all supported problems

3. Editor section:
   - label `Editor`
   - prefilled function/method stub
   - student writes code directly in the browser

4. Action button:
   - `Run`

5. Result summary:
   - status badge
   - total tests
   - passed tests
   - failed tests
   - run seed

6. Result table:
   - test index
   - status
   - args
   - expected output
   - actual output
   - message

---

## 8. Lesson Contract

Each practice lesson is defined by a registry object.

```ts
type LessonDefinition = {
  id: string;
  title: string;
  methodName: string;
  description: string;
  starterCode: string;
  testCount: number;
  genTest: (rng: RandomFn) => GeneratedTest;
  solution: (...args: unknown[]) => unknown;
  checker?: (ctx: CheckerContext) => CheckerResult;
}
```

Supporting types:

```ts
type GeneratedTest = {
  args: unknown[];
  note?: string;
}

type CheckerContext = {
  actual: unknown;
  expected: unknown;
  test: GeneratedTest;
}

type CheckerResult = {
  pass: boolean;
  message?: string;
}
```

### 8.1 Why `genTest + solution + checker`

This model is the key extensibility point.

#### `genTest`
Builds one input case.

Examples:
- random array with duplicates
- sorted array
- array plus target value
- rotated array parameters
- merge input arrays

#### `solution`
Trusted official implementation.

Responsibilities:
- compute expected output
- define official tie-breaking behavior
- act as the source of truth for checking

#### `checker`
Optional custom validation.

Needed when:
- floating-point comparison needs tolerance
- order of output pairs should not matter
- output must be normalized before comparison

---

## 9. Practice Runner Execution Flow

```text
Select lesson
  -> load starter code
  -> user edits code
  -> click Run
  -> generate N tests via genTest
  -> compute expected outputs via solution
  -> execute student method on each test
  -> validate using checker or default equality
  -> render summary and per-test rows
```

---

## 10. Practice Runner Safety Model

Student code must not run directly on the main UI thread.

### Recommended model

For each test case:

1. create a Web Worker
2. send the student source code, method name, and test args
3. compile the method wrapper inside the worker
4. execute the selected method
5. return actual output or runtime error
6. terminate the worker after completion
7. terminate early if timeout is exceeded

### Benefits

- page remains responsive
- infinite loops do not lock the UI
- runtime errors are isolated and reportable
- timeout behavior is explicit and teachable

### Limitation

This is still not a secure sandbox for hostile code.

For classroom/local educational use it is acceptable. For public untrusted execution at scale, a server-side sandbox would be needed later.

---

## 11. Language Format for Practice Mode

The editor accepts **JavaScript method shorthand** that looks close to Java method syntax.

Example:

```js
indexOf(numbers, target) {
  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] === target) return i;
  }
  return -1;
}
```

This format is chosen because:

- it is easy to execute in-browser
- it is visually close enough to Java methods for introductory algorithm practice
- it keeps the student focused on the algorithm instead of setup code

---

## 12. Return Contract Strategy

To keep checking simple and reliable, each lesson should define a clear return contract.

Examples:

- `indexOf` -> returns a number
- `contains` -> returns a boolean
- `reverseArray` -> returns a new array
- `mergeSortedArrays` -> returns a new sorted array
- `longestConsecutiveRun` -> returns a number

For practice mode, prefer **returning a result** instead of mutating the input array.

This reduces ambiguity and makes the checker easier to maintain.

---

## 13. Initial Practice Lesson Set

The current practice runner should support these lessons:

1. `indexOf(value)`
2. `lastIndexOf(value)`
3. `contains(value)`
4. find maximum value
5. find minimum value
6. find index of maximum value
7. find index of minimum value
8. calculate sum of all elements
9. calculate average of all elements
10. count occurrences of a specific value
11. count occurrences of the maximum value
12. count unique values in array
13. find value with most occurrences
14. reverse array
15. sort ascending
16. sort descending
17. second largest/smallest
18. find all indices where a value appears
19. check if array is sorted
20. remove duplicates
21. find pairs that sum to target
22. rotate left or right by k
23. find the longest consecutive identical run
24. merge two sorted arrays
25. find the missing number in a sequence

---

## 14. Definition of Done for Practice Runner MVP

The feature is complete when:

- the app runs as a static browser page
- the heading is `Algorithm for Basic Arrays`
- the lesson dropdown works
- the editor preloads starter code
- clicking `Run` generates fresh tests
- each test uses `genTest`
- expected answers come from `solution`
- validation uses `checker` or default equality
- the result summary shows Accepted / Partial / Failed
- the results table shows args, expected, actual, and note
- a Web Worker timeout prevents UI freeze

---

## 15. Recommended Next Steps

1. Add a sample visible testcase above generated tests
2. Replace textarea with CodeMirror when needed
3. Save last selected lesson and code to local storage
4. Add a visualizer tab for selected lessons
5. Share utility functions between practice and visualizer modes
