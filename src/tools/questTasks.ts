import { Task } from '@/types'

/**
 * Safely parses the quest_tasks field from the backend.
 * Returns an empty array if it's missing or invalid JSON.
 */
export function parseQuestTasks(quest_tasks?: string | null): Task[] {
  if (!quest_tasks) return []
  try {
    const parsed = JSON.parse(quest_tasks)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Safely serializes Task[] for GraphQL mutation.
 */
export function serializeQuestTasks(tasks: Task[]): string {
  try {
    return JSON.stringify(tasks)
  } catch {
    return '[]'
  }
}
