// Extra edge-case tests for the pure helpers in filter.ts.
import { describe, it, expect } from 'vitest'
import { filterTasks, countByFilter, FILTERS } from './filter'
import type { Task } from './taskReducer'

const tasks: Task[] = [
  { id: '1', title: 'A', status: 'todo' },
  { id: '2', title: 'B', status: 'todo' },
  { id: '3', title: 'C', status: 'in-progress' },
]

describe('filterTasks edge cases', () => {
  it('returns an empty list when no task has that status', () => {
    expect(filterTasks(tasks, 'done')).toEqual([])
  })

  it('keeps the original order of the tasks', () => {
    expect(filterTasks(tasks, 'todo').map((t) => t.id)).toEqual(['1', '2'])
  })

  it('does not change the input array', () => {
    const copy = structuredClone(tasks)
    filterTasks(tasks, 'in-progress')
    expect(tasks).toEqual(copy)
  })
})

describe('countByFilter edge cases', () => {
  it('has a number for every filter button', () => {
    const counts = countByFilter(tasks)
    for (const f of FILTERS) expect(typeof counts[f]).toBe('number')
  })

  it('the three status counts add up to all', () => {
    const c = countByFilter(tasks)
    expect(c.todo + c['in-progress'] + c.done).toBe(c.all)
  })

  it('matches filterTasks for every filter', () => {
    const c = countByFilter(tasks)
    for (const f of FILTERS) expect(c[f]).toBe(filterTasks(tasks, f).length)
  })
})
