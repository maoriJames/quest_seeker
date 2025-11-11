import { Task } from '@/types'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'

interface TaskPreviewProps {
  tasks: Task[]
}

export default function TaskPreview({ tasks }: TaskPreviewProps) {
  if (!tasks || tasks.length === 0) return null

  const previewTasks = tasks.slice(0, 3) // first three tasks

  return (
    <div className="border rounded-lg p-4 bg-gray-50 shadow-inner max-h-64 lg:w-[450px] w-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Task Preview</h2>

      <ul className="space-y-2">
        {previewTasks.map((task) => (
          <li
            key={task.id}
            className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {task.description && (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  {task.description.length > 100
                    ? task.description.slice(0, 100) + '…'
                    : task.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Join this quest to answer!
                </p>
              </>
            )}
            {task.isImage && task.answer && (
              <RemoteImage
                path={task.answer}
                fallback={placeHold}
                className="h-16 w-16 rounded object-cover mt-2"
              />
            )}
          </li>
        ))}
      </ul>

      {tasks.length > 3 && (
        <p className="text-xs text-gray-400 italic mt-2">
          …and {tasks.length - 3} more tasks
        </p>
      )}
    </div>
  )
}
