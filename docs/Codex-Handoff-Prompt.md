# Codex Handoff Prompt

Use this prompt in Codex to start implementation from the provided technical design.

---

You are implementing a browser-only educational tool called **Algorithm Visualizer for Basic Arrays**.

## Goal

Build a small web app that helps students understand basic array algorithms step by step.

## Constraints

- browser-only
- TypeScript
- Vite
- no React
- use CodeMirror 6 for the editor
- use JS-Interpreter for execution
- plain DOM/CSS/SVG for UI
- input language is **Java-like syntax**, normalized into a JavaScript subset
- focus on teaching clarity, not full Java support

## Features required for MVP

- lesson selector
- code editor
- current-line highlight
- controls:
  - Reset
  - Next
  - Run
  - Pause
- array visualization
- pointer/index visualization (`i`, `j`, etc.)
- variables panel
- operation log
- explanation panel
- first 5 lessons:
  - indexOf(value)
  - find maximum value
  - count occurrences of a value
  - reverse array
  - bubble sort

## Architecture requirements

Implement these modules:

- `engine/validator.ts`
- `engine/normalizer.ts`
- `engine/instrumenter.ts`
- `engine/interpreter-runner.ts`
- `engine/runtime-events.ts`
- `lessons/registry.ts`
- `lessons/*.ts`
- `ui/panels/*.ts`
- `visual/*.ts`

## Important design rules

1. Do not implement full Java.
2. Support only a small Java-like syntax subset.
3. Keep runtime safe by executing only in JS-Interpreter.
4. Emit semantic runtime events such as:
   - `LINE_ENTER`
   - `SET_VAR`
   - `READ_ARRAY`
   - `WRITE_ARRAY`
   - `COMPARE`
   - `MOVE_POINTER`
   - `SWAP`
   - `FINISH`
   - `ERROR`
5. The UI must update from events rather than from direct execution state.
6. Start with arrays only. Do not implement List or Dictionary yet.
7. Favor maintainability and clean file organization.

## Build order

1. scaffold Vite + TypeScript project
2. add static layout
3. integrate CodeMirror
4. implement array and variable views with fake data
5. define runtime event types and reducer
6. integrate JS-Interpreter
7. implement normalizer and validator
8. implement first working lesson: `indexOf`
9. implement the remaining 4 MVP lessons
10. add polishing and tests

## Deliverables

- working local app
- clear project structure
- README with setup instructions
- simple but clean UI
- comments only where helpful
- no overengineering

Now start by scaffolding the project structure and implementing the static UI shell plus runtime event type definitions.
