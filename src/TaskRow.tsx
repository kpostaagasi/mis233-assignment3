import type { Task } from './taskReducer'

type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
  return (
    <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ flex: 1 }}>{task.title}</span>
      <em>{task.status}</em>
      <button onClick={onNext} aria-label={`Move ${task.title} to the next status`}>Next</button>
      <button onClick={onDelete} aria-label={`Delete ${task.title}`}>Delete</button>
    </li>
  )
}
