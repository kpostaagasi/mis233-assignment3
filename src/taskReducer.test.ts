// Bonus 2: tests for the reducer and the filter helpers (no React needed).
import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State, type Task } from './taskReducer'
import { filterTasks, countByFilter } from './filter'

const a: Task = { id: 'a', title: 'Read slides', status: 'todo' }
const b: Task = { id: 'b', title: 'Write reducer', status: 'in-progress' }
const c: Task = { id: 'c', title: 'Take screenshots', status: 'done' }
const three: State = { tasks: [a, b, c], filter: 'all', past: [] }

describe('taskReducer', () => {
  it('add appends a todo task', () => {
    const s = taskReducer(initialState, { type: 'add', id: 'x', title: 'New' })
    expect(s.tasks).toEqual([{ id: 'x', title: 'New', status: 'todo' }])
  })

  it('advance three times returns to todo', () => {
    let s = three
    for (let i = 0; i < 3; i++) s = taskReducer(s, { type: 'advance', id: 'a' })
    expect(s.tasks[0].status).toBe('todo')
  })

  it('remove deletes the task', () => {
    const s = taskReducer(three, { type: 'remove', id: 'b' })
    expect(s.tasks.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('setFilter changes only the filter', () => {
    const s = taskReducer(three, { type: 'setFilter', filter: 'done' })
    expect(s.filter).toBe('done')
    expect(s.tasks).toBe(three.tasks)
  })

  it('clearDone removes done tasks and keeps the filter', () => {
    const start: State = { ...three, filter: 'todo' }
    const s = taskReducer(start, { type: 'clearDone' })
    expect(s.tasks.map((t) => t.id)).toEqual(['a', 'b'])
    expect(s.filter).toBe('todo')
  })

  it('clearDone with nothing done keeps all tasks', () => {
    const s = taskReducer({ ...three, tasks: [a, b] }, { type: 'clearDone' })
    expect(s.tasks).toEqual([a, b])
  })

  it('unknown id changes nothing in the list', () => {
    expect(taskReducer(three, { type: 'advance', id: 'zzz' }).tasks).toEqual(three.tasks)
    expect(taskReducer(three, { type: 'remove', id: 'zzz' }).tasks).toEqual(three.tasks)
  })

  it('does not change the old state', () => {
    const frozen = Object.freeze({ ...three, tasks: Object.freeze([...three.tasks]) }) as State
    const copy = structuredClone(frozen)
    taskReducer(frozen, { type: 'advance', id: 'a' })
    taskReducer(frozen, { type: 'clearDone' })
    expect(frozen).toEqual(copy)
  })

  it('undo brings back the cleared tasks and does nothing when empty', () => {
    const cleared = taskReducer(three, { type: 'clearDone' })
    const back = taskReducer(cleared, { type: 'undo' })
    expect(back.tasks).toEqual(three.tasks)
    expect(taskReducer(initialState, { type: 'undo' })).toBe(initialState)
  })

  it('setFilter is not undoable', () => {
    const s = taskReducer(three, { type: 'setFilter', filter: 'done' })
    expect(s.past).toHaveLength(0)
  })
})

describe('filter helpers', () => {
  it('filterTasks returns every task for all, matching ones otherwise', () => {
    expect(filterTasks(three.tasks, 'all')).toHaveLength(3)
    expect(filterTasks(three.tasks, 'done')).toEqual([c])
  })

  it('works on an empty list', () => {
    expect(filterTasks([], 'todo')).toEqual([])
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
  })

  it('countByFilter counts each status, also after a delete', () => {
    expect(countByFilter(three.tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
    const s = taskReducer(three, { type: 'remove', id: 'c' })
    expect(countByFilter(s.tasks)).toEqual({ all: 2, todo: 1, 'in-progress': 1, done: 0 })
  })
})
