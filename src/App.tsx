// All state stays in App with useReducer and goes down as props (no Context, no state library).
import { useReducer } from 'react'
import type { Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

// Text shown on each filter button.
const LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    // The id is created here (the caller), not in the reducer, so the reducer stays pure.
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask}>
      <input name="title" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  )
}

type FilterBarProps = {
  active: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}

// Four buttons; the active one is bold with a dark background (R5), each shows its count (R6).
function FilterBar({ active, counts, dispatch }: FilterBarProps) {
  return (
    <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
      {FILTERS.map((f) => {
        const isActive = f === active
        return (
          <button
            key={f}
            aria-pressed={isActive}
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              fontWeight: isActive ? 'bold' : 'normal',
              background: isActive ? '#1f2937' : '#f3f4f6',
              color: isActive ? 'white' : 'black',
              border: '1px solid #9ca3af',
              borderRadius: 6,
              padding: '4px 10px',
            }}
          >
            {LABELS[f]} ({counts[f]})
          </button>
        )
      })}
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  // Empty-list message (R6).
  if (tasks.length === 0) return <p>No tasks here.</p>
  return (
    <ul>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  // Derived while rendering, never stored in state.
  const visible = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '24px auto' }}>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar active={state.filter} counts={counts} dispatch={dispatch} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => dispatch({ type: 'clearDone' })}>Clear done</button>
        <button
          onClick={() => dispatch({ type: 'undo' })}
          disabled={state.past.length === 0}
        >
          Undo
        </button>
      </div>
      <TaskList tasks={visible} dispatch={dispatch} />
    </main>
  )
}
