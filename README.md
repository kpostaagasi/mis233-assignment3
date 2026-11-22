# Assignment 3: Task Manager with a Reducer

**Name:** Kamil Postaağası
**Student number:** 2023501030

MIS 233 Web Based Application Programming, Fall 2026.

## Run it

```
npm install
npm run dev       # development server
npm run build     # strict type check + build
npm test          # Vitest tests (Bonus 2)
```

## What changed

- `src/taskReducer.ts`: state is now `{ tasks, filter, past }`. `State`, `initialState`
  and `taskReducer(state, action)` are exported. New actions: `setFilter`, `clearDone`, `undo`.
  The `switch` ends with a `never` check, so a new action that is not handled breaks the build.
- `src/filter.ts`: `filterTasks` and `countByFilter`, plain functions with no React.
- `src/App.tsx`: `useReducer(taskReducer, initialState)`, plus `FilterBar` (four buttons with
  counts, active one highlighted), a Clear done button, an Undo button and a "No tasks here."
  message. The visible list and the counts are computed while rendering, not stored.

Screenshots are in `screenshots/` (all.png, todo.png, in-progress.png, done.png).

## Bonus 1: Undo

The state is `{ tasks: Task[]; filter: Filter; past: Task[][] }`. Every action that changes the
task list (add, advance, remove, clearDone) pushes the old list onto `past`, and `undo` pops the
last one back into `tasks`. `setFilter` does not touch `past`, so changing the filter is not
undoable, and the Undo button is disabled while `past` is empty.

## Bonus 2: Tests

Tests are in `src/taskReducer.test.ts` (every action, advance three times back to todo, old state
not changed, unknown id, empty list, clearDone with nothing done, counts after a delete, undo).

Output of `npx vitest run --reporter=verbose` (same tests as `npm test`):

```
RUN  v5.1.1 assignment3

 ✓ src/taskReducer.test.ts > taskReducer > add appends a todo task 1ms
 ✓ src/taskReducer.test.ts > taskReducer > advance three times returns to todo 0ms
 ✓ src/taskReducer.test.ts > taskReducer > remove deletes the task 0ms
 ✓ src/taskReducer.test.ts > taskReducer > setFilter changes only the filter 0ms
 ✓ src/taskReducer.test.ts > taskReducer > clearDone removes done tasks and keeps the filter 0ms
 ✓ src/taskReducer.test.ts > taskReducer > clearDone with nothing done keeps all tasks 0ms
 ✓ src/taskReducer.test.ts > taskReducer > unknown id changes nothing in the list 0ms
 ✓ src/taskReducer.test.ts > taskReducer > does not change the old state 0ms
 ✓ src/taskReducer.test.ts > taskReducer > undo brings back the cleared tasks and does nothing when empty 0ms
 ✓ src/taskReducer.test.ts > taskReducer > setFilter is not undoable 1ms
 ✓ src/taskReducer.test.ts > filter helpers > filterTasks returns every task for all, matching ones otherwise 0ms
 ✓ src/taskReducer.test.ts > filter helpers > works on an empty list 0ms
 ✓ src/taskReducer.test.ts > filter helpers > countByFilter counts each status, also after a delete 0ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  16:38:40
   Duration  110ms (import 34%, transform 31%, tests 22%, worker 13%)
```

## Bonus 3: Explain your reducer

The reducer has to be pure because React decides whether to re-render by comparing the old
state with the new one by reference. If I mutate the old state, for example with
`state.tasks.push(t)` and then return `state`, React gets the same object back, thinks nothing
changed, and the screen does not update. It also breaks Undo, because the lists I saved in
`past` would be changed too. In development React (StrictMode) even calls the reducer twice to
catch this kind of side effect.

The id is created by the caller (`crypto.randomUUID()` in `AddForm`) and not by the reducer,
because a reducer must return the same result for the same state and action. If the reducer
made the id, calling it twice would give two different tasks, and my tests could not predict
the result. Keeping randomness outside means the reducer is easy to test with fixed ids like
`'a'` and `'b'`.

The visible list and the counts are derived while rendering with `filterTasks` and
`countByFilter`. If I stored `filteredTasks` or `counts` in state, I would have to update them
in every action. If I forgot one, say in `remove`, the button would still show `Done (1)` after
I deleted the only done task, so the screen would show stale numbers. Deriving them means there
is only one source of truth, `state.tasks`.

Moving the filter into the reducer state made `clearDone` simpler: one action removes the done
tasks and the filter is kept, all in one place, and the whole screen state is in one object.
The harder part was that the state type became bigger, and every case now has to copy the
other fields with `...state`, so forgetting the spread would lose the filter.
