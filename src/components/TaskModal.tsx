import { TaskModalProps } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const TaskModal: React.FC<TaskModalProps> = ({
  tasks,
  setTasks,
  setTask,
  setEditIndex,
  visible,
  onClose,
  onNewTask,
}) => {
  const handleEditTask = (index: number) => {
    const taskToEdit = tasks[index].description
    setTask(taskToEdit)
    setEditIndex(index)
    onClose()
  }

  const handleDeleteTask = (index: number) => {
    const updatedTasks = [...tasks]
    updatedTasks.splice(index, 1)
    setTasks(updatedTasks)
    onNewTask(updatedTasks)
  }

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id ?? index}
              className="flex items-center justify-between border p-2 rounded"
            >
              <span className="font-semibold mr-2">
                {task.isImage ? 'IMAGE:' : 'TEXT:'}
              </span>
              <span className="flex-1 truncate">{task.description}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTask(index)}
                  className="text-green-600 font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(index)}
                  className="text-red-600 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
