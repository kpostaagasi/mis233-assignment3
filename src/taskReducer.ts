// Kamil Postaağası, 2023501030
// MIS 233 Assignment 3: Task Manager with a Reducer
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

// The whole app state lives here. `past` keeps earlier task lists for Undo (Bonus 1).
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }

// Every action is one object type with its own `type` string (a discriminated union).
export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

// Starting state: no tasks, filter 'all', nothing to undo.
export const initialState: State = { tasks: [], filter: 'all', past: [] }

// Which status comes after which (done wraps back to todo).
const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

// Helper: build the next state when the task list changes.
// The old list is pushed onto `past` so Undo can bring it back.
function withTasks(state: State, tasks: Task[]): State {
  return { ...state, tasks, past: [...state.past, state.tasks] }
}

// Pure reducer: same input gives same output, never changes `state`,
// no Math.random / Date.now / crypto calls (the caller makes the id).
export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return withTasks(state, [
        ...state.tasks,
        { id: action.id, title: action.title, status: 'todo' },
      ])
    case 'advance':
      return withTasks(
        state,
        state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
      )
    case 'remove':
      return withTasks(
        state,
        state.tasks.filter((t) => t.id !== action.id),
      )
    case 'setFilter':
      // Only the filter changes; tasks stay the same and this is not undoable.
      return { ...state, filter: action.filter }
    case 'clearDone':
      // Remove every done task, keep the filter.
      return withTasks(
        state,
        state.tasks.filter((t) => t.status !== 'done'),
      )
    case 'undo': {
      // Nothing to undo: return the same state unchanged.
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return { ...state, tasks: previous, past: state.past.slice(0, -1) }
    }
    default: {
      // Exhaustiveness check: if a new action type is added to Action
      // and not handled above, `action` is not `never` here and tsc fails.
      const unhandled: never = action
      return unhandled
    }
  }
}
