# Task2s.md — Practice Runner Feature

Project: Algorithm for Basic Arrays  
Feature: Write code and run tests in the browser, similar to a very small LeetCode mode  
Tracking style: concrete steps + progress notes

---

## 1. Feature Goal

Add a new browser-only practice mode with the following user flow:

- show heading `Algorithm for Basic Arrays`
- choose one lesson from the array problem list
- show a JavaScript editor with starter method code
- click `Run`
- generate fresh test cases through `genTest`
- compute expected results through `solution`
- validate using `checker`
- show pass/fail feedback per test case

---

## 2. Step-by-Step Implementation Plan

### Step 1 — Update technical design
- [x] Add Practice Runner architecture to `Technical-Design-v1.1.md`
- [x] Define `LessonDefinition` with `genTest`, `solution`, `checker`
- [x] Clarify separation between visualizer mode and practice mode

### Step 2 — Create static browser app shell
- [x] Create app folder
- [x] Add `index.html`
- [x] Add `styles.css`
- [x] Add JavaScript module structure
- [x] Use simple browser-native modules, no React

### Step 3 — Build page layout
- [x] Add heading `Algorithm for Basic Arrays`
- [x] Add `Lesson` dropdown
- [x] Add `Editor` section
- [x] Add `Run` button
- [x] Add summary section
- [x] Add generated test case result table

### Step 4 — Build lesson registry
- [x] Add a central lesson registry file
- [x] Add starter code per lesson
- [x] Add `genTest` per lesson
- [x] Add trusted `solution` per lesson
- [x] Add optional `checker` per lesson

### Step 5 — Implement all requested lessons
- [x] 1. indexOf(value)
- [x] 2. lastIndexOf(value)
- [x] 3. contains(value)
- [x] 4. maximum value
- [x] 5. minimum value
- [x] 6. index of maximum value
- [x] 7. index of minimum value
- [x] 8. sum of all elements
- [x] 9. average of all elements
- [x] 10. count occurrences of a value
- [x] 11. count occurrences of the maximum value
- [x] 12. count unique values
- [x] 13. most frequent value
- [x] 14. reverse array
- [x] 15. sort ascending
- [x] 16. sort descending
- [x] 17. second largest/smallest
- [x] 18. all indices of a value
- [x] 19. sorted check
- [x] 20. remove duplicates
- [x] 21. pairs with target sum
- [x] 22. rotate left/right by k
- [x] 23. longest consecutive run
- [x] 24. merge two sorted arrays
- [x] 25. missing number in sequence

### Step 6 — Implement runner pipeline
- [x] Load selected lesson into editor
- [x] Generate fresh tests on each run
- [x] Compute expected answer from `solution`
- [x] Execute student method
- [x] Compare with `checker` or default deep equality
- [x] Render per-test results

### Step 7 — Add execution safety
- [x] Run student code in a Web Worker
- [x] Add timeout per test
- [x] Report runtime error or time limit exceeded
- [x] Keep main UI responsive

### Step 8 — Add reset and UX helpers
- [x] Add reset code button
- [x] Show lesson description
- [x] Show method name
- [x] Show summary badge: Accepted / Partial / Failed

### Step 9 — Package deliverables
- [x] Update documentation
- [x] Prepare runnable artifact folder
- [x] Prepare zip package

---

## 3. Files Added / Updated

### Updated by replacement copy
- [x] `Technical-Design-v1.1.md`

### Added
- [x] `Task2s.md`
- [x] `algorithm-for-basic-arrays/index.html`
- [x] `algorithm-for-basic-arrays/styles.css`
- [x] `algorithm-for-basic-arrays/js/utils.js`
- [x] `algorithm-for-basic-arrays/js/lessons.js`
- [x] `algorithm-for-basic-arrays/js/app.js`

---

## 4. Notes on Current Decisions

### Editor choice
Current implementation uses a plain `<textarea>` for simplicity and zero dependencies.

Reason:
- fastest path to a working browser-only artifact
- no build complexity
- no framework required

Upgrade path:
- replace with CodeMirror later if syntax highlighting becomes important

### Lesson contract
Each lesson is defined by:
- `genTest`
- `solution`
- optional `checker`

This is the core extension point for future customization.

### Safety
Student code runs in a Web Worker with a timeout.

This is important because:
- buggy code should not freeze the page
- classroom demo should remain responsive

---

## 5. Remaining Nice-to-Have Improvements

- [ ] Replace textarea with CodeMirror
- [ ] Add syntax validation before run
- [ ] Add keyboard shortcut: Ctrl+Enter to run
- [ ] Add sample visible test case above hidden/generated tests
- [ ] Add difficulty tags per lesson
- [ ] Add persistence to local storage
- [ ] Add a separate visualizer mode tab
- [ ] Add step-by-step tracing for a subset of lessons

---

## 6. Progress Notes

### 2026-04-08
- Done:
  - added practice runner design to technical design
  - created static browser app
  - implemented all 25 requested array lessons
  - implemented `genTest + solution + checker`
  - added worker-based test execution with timeout
  - added lesson selector, editor, run, reset, summary, and results table
- In progress:
  - packaging and final review
- Blockers:
  - none
- Next:
  - manual smoke test in browser
  - optional upgrade to CodeMirror or visualizer integration
