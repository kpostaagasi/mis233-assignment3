// Requirement R4: pure helper functions. No React in this file.
import type { Status, Task } from './taskReducer'

export type Filter = 'all' | Status

export const FILTERS: Filter[] = ['all', 'todo', 'in-progress', 'done']

/** Return the tasks to show for the chosen filter. 'all' returns every task. */
export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'all') return tasks
  return tasks.filter((t) => t.status === filter)
}

/** Return how many tasks each filter button would show, for example { all: 3, todo: 1, ... }. */
export function countByFilter(tasks: Task[]): Record<Filter, number> {
  // Start every count at 0, then add 1 to the task's own status.
  const counts: Record<Filter, number> = {
    all: tasks.length,
    todo: 0,
    'in-progress': 0,
    done: 0,
  }
  for (const t of tasks) counts[t.status] += 1
  return counts
}
