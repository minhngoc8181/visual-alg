# Tasks.md — Algorithm Visualizer Project

Project: Basic Array Algorithm Visualizer  
Status baseline: in progress  
Tracking style: checkbox + notes + owner + priority

---

## 1. Project Setup

- [x] Initialize repository structure
  - Owner: Frontend
  - Priority: High
  - Notes:
    - create TypeScript project
    - configure Vite
    - define folder layout from technical design

- [x] Configure TypeScript, linting, and formatting
  - Owner: Frontend
  - Priority: High
  - Notes:
    - tsconfig
    - ESLint
    - Prettier or equivalent
    - npm scripts

- [x] Create base application shell
  - Owner: Frontend
  - Priority: High
  - Notes:
    - top toolbar
    - left editor panel
    - right visualization panel
    - bottom log / explanation panels

---

## 2. Editor Layer

- [x] Integrate CodeMirror 6
  - Owner: Frontend
  - Priority: High

- [x] Add current-line highlighting support
  - Owner: Frontend
  - Priority: High

- [x] Add editable / read-only mode toggle
  - Owner: Frontend
  - Priority: Medium

- [x] Add syntax error display area
  - Owner: Frontend
  - Priority: Medium

---

## 3. State and Event Model

- [x] Define global app state types
  - Owner: Frontend
  - Priority: High
  - Deliverables:
    - runner state
    - lesson state
    - visualization state

- [x] Define runtime event types
  - Owner: Frontend
  - Priority: High
  - Deliverables:
    - LINE_ENTER
    - SET_VAR
    - READ_ARRAY
    - WRITE_ARRAY
    - COMPARE
    - MOVE_POINTER
    - SWAP
    - PRINT
    - FINISH
    - ERROR

- [x] Implement event playback reducer
  - Owner: Frontend
  - Priority: High
  - Notes:
    - reducer should apply one event at a time to UI state

---

## 4. Visualization UI

### 4.1 Array

- [x] Build array renderer
  - Owner: Frontend
  - Priority: High
  - Notes:
    - show index and value
    - support active read/write styling

- [x] Build pointer renderer
  - Owner: Frontend
  - Priority: High
  - Notes:
    - support `i`, `j`, `left`, `right`, `maxIndex`
    - multiple pointers may point to one cell

- [x] Add swap animation
  - Owner: Frontend
  - Priority: Medium

### 4.2 Variables

- [x] Build variables panel
  - Owner: Frontend
  - Priority: High

- [x] Group variables by role
  - Owner: Frontend
  - Priority: Medium
  - Notes:
    - input
    - pointer
    - accumulator
    - result

### 4.3 Panels

- [x] Build operation log panel
  - Owner: Frontend
  - Priority: High

- [x] Build explanation panel
  - Owner: Frontend
  - Priority: High

- [x] Build toolbar controls
  - Owner: Frontend
  - Priority: High
  - Controls:
    - reset
    - next
    - run
    - pause
    - speed

---

## 5. Lesson System

- [x] Define `LessonDefinition` interface
  - Owner: Frontend
  - Priority: High

- [x] Build lesson registry
  - Owner: Frontend
  - Priority: High

- [x] Build lesson selector UI
  - Owner: Frontend
  - Priority: Medium

- [x] Support watched variables and pointer variables per lesson
  - Owner: Frontend
  - Priority: High

- [x] Support explanation mapping per lesson
  - Owner: Frontend
  - Priority: Medium

---

## 6. Execution Pipeline

### 6.1 Validator

- [x] Implement syntax subset validator
  - Owner: Engine
  - Priority: High
  - Notes:
    - reject unsupported constructs early
    - return friendly messages

### 6.2 Normalizer

- [x] Implement removal of simple type declarations
  - Owner: Engine
  - Priority: High
  - Examples:
    - `int i = 0;`
    - `boolean found = false;`
    - `int[] arr = [1, 2, 3];`

- [x] Implement Java-like to JS-subset rewrite rules
  - Owner: Engine
  - Priority: High

- [x] Map print helpers to internal runtime API
  - Owner: Engine
  - Priority: Medium

### 6.3 Instrumenter

- [x] Inject `LINE_ENTER` hooks
  - Owner: Engine
  - Priority: High

- [x] Inject array read hooks
  - Owner: Engine
  - Priority: High

- [x] Inject array write hooks
  - Owner: Engine
  - Priority: High

- [x] Inject compare hooks
  - Owner: Engine
  - Priority: Medium

- [x] Detect pointer moves for configured variables
  - Owner: Engine
  - Priority: Medium

- [x] Detect swap operations
  - Owner: Engine
  - Priority: Medium

### 6.4 Runner

- [x] Integrate JS-Interpreter
  - Owner: Engine
  - Priority: High

- [x] Implement `Next` step
  - Owner: Engine
  - Priority: High

- [x] Implement `Run`
  - Owner: Engine
  - Priority: High

- [x] Implement `Pause`
  - Owner: Engine
  - Priority: High

- [x] Implement `Reset`
  - Owner: Engine
  - Priority: High

- [x] Add max-step guard
  - Owner: Engine
  - Priority: High

- [x] Emit runtime errors cleanly
  - Owner: Engine
  - Priority: High

---

## 7. MVP Lessons

### Lesson 1 — indexOf(value)

- [x] Create lesson definition
- [x] Prepare starter code
- [x] Verify pointer `i`
- [x] Verify found / not found scenarios
- [x] Add explanation text

### Lesson 2 — find maximum value

- [x] Create lesson definition
- [x] Verify `max` updates
- [x] Add explanation text

### Lesson 3 — count occurrences

- [x] Create lesson definition
- [x] Verify `count` updates
- [x] Add explanation text

### Lesson 4 — reverse array

- [x] Create lesson definition
- [x] Verify pointers `i` and `j`
- [x] Verify swap visualization
- [x] Add explanation text

### Lesson 5 — bubble sort

- [x] Create lesson definition
- [x] Verify nested loop stepping
- [x] Verify compare and swap log
- [x] Add explanation text

---

## 8. Testing

### 8.1 Unit Tests

- [x] Test validator on supported syntax
- [x] Test validator on unsupported syntax
- [x] Test normalizer rewrite cases
- [x] Test instrumentation output
- [x] Test event reducer logic

### 8.2 Integration Tests

- [x] Load lesson and render initial state
- [x] Step through `indexOf`
- [x] Step through `reverse`
- [x] Reset after partial execution
- [x] Run to completion
- [x] Pause during execution

### 8.3 Manual Classroom Tests

- [ ] Projector readability check
- [ ] Keyboard-only control check
- [ ] Dark mode / light mode readability
- [ ] Verify that first-time students can follow `indexOf` without explanation from developer

---

## 9. UX and Polish

- [x] Add visual legend for colors and markers
  - Owner: Frontend
  - Priority: Medium

- [x] Add keyboard shortcuts
  - Owner: Frontend
  - Priority: Medium

- [x] Add welcome lesson / intro screen
  - Owner: Frontend
  - Priority: Low

- [x] Add local storage persistence
  - Owner: Frontend
  - Priority: Low

- [x] Add copy / reset lesson code button
  - Owner: Frontend
  - Priority: Low

---

## 10. Documentation

- [x] Keep `Technical-Design.md` updated
  - Owner: Lead
  - Priority: High

- [x] Add developer setup guide
  - Owner: Lead
  - Priority: Medium

- [x] Add authoring guide for new lessons
  - Owner: Lead
  - Priority: Medium
  - Notes:
    - how to define lesson metadata
    - how to mark pointer variables
    - how to add explanations
    - how to test a lesson

---

## 11. Definition of Done for MVP

Mark MVP complete only when all items below are true:

- [x] App runs locally with one command
- [x] No backend required
- [x] Current line highlighting works
- [x] Next / Run / Pause / Reset work
- [x] Array visualization updates correctly
- [x] Pointer markers move correctly
- [x] Variables panel updates correctly
- [x] Operation log is understandable
- [x] At least 5 lessons are available
- [x] Basic tests pass
- [ ] One real classroom demo is completed successfully

---

## 12. Suggested Sprint Breakdown

## Sprint 1
- project setup
- layout
- CodeMirror
- fake array renderer
- fake variables panel

## Sprint 2
- runtime event model
- event playback
- pointer rendering
- log and explanation panels

## Sprint 3
- validator
- normalizer
- JS-Interpreter integration
- first real executable lesson

## Sprint 4
- first 5 lessons
- bug fixes
- UX polish
- tests

---

## 13. Backlog After MVP

- [ ] Student free-edit mode
- [ ] Auto-check expected output
- [ ] List visualization
- [ ] Dictionary visualization
- [ ] Predict-the-next-step quiz mode
- [ ] Shareable lesson links
- [ ] Export / import lesson definitions

---

## 14. Progress Notes

Use this section during implementation.

### YYYY-MM-DD
- Done:
- In progress:
- Blockers:
- Next:

### 2026-04-08
- Done:
  - scaffolded Vite + TypeScript project structure
  - integrated CodeMirror 6 with current-line highlighting
  - implemented runtime events, app state, reducer, and visualization panels
  - added validator, normalizer, instrumenter, and JS-Interpreter runner
  - implemented 5 MVP lessons and end-to-end lesson execution tests
  - added README and developer setup instructions
- In progress:
  - polish and remaining medium/low priority UX items
- Blockers:
  - browser automation was not available for deep visual inspection of the running page
  - `js-interpreter` increases the client bundle size significantly
- Next:
  - add syntax error panel in the editor area
  - add editable/read-only mode toggle
  - add broader scenario coverage and integration/browser tests

### YYYY-MM-DD
- Done:
- In progress:
- Blockers:
- Next: