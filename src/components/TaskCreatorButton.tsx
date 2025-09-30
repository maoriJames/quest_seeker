import { useEffect, useState } from 'react'
import { TaskModal } from './TaskModal'
import { TaskCreatorButtonProps, Task } from '@/types'

const TaskCreatorButton: React.FC<TaskCreatorButtonProps> = ({
  onNewTask,
  questUpdates,
}) => {
  const [task, setTask] = useState('')
  // const [taskDescription, setTaskDescription] = useState('')
  const [isImageTask, setIsImageTask] = useState(true)
  const [isChecked, setIsChecked] = useState(false)
  const [answer, setAnswer] = useState('')
  const [caption, setCaption] = useState('')
  const [tasks, setTasks] = useState<Task[]>(questUpdates)

  const [editIndex, setEditIndex] = useState(-1)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    setTasks(questUpdates)
  }, [questUpdates])

  const handleAddTask = () => {
    if (task) {
      const updatedTasks = [...tasks]

      if (editIndex !== -1) {
        updatedTasks[editIndex] = {
          ...updatedTasks[editIndex],
          description: task,
          // shortDescription: taskDescription,
          isImage: isImageTask,
          isChecked,
          caption,
          answer,
        }
      } else {
        const newTask: Task = {
          id: Date.now(),
          description: task,
          // shortDescription: taskDescription,
          isImage: isImageTask,
          isChecked,
          caption,
          answer,
        }
        updatedTasks.push(newTask)
      }

      onNewTask(updatedTasks)

      setTask('')
      // setTaskDescription('')
      setEditIndex(-1)
      setIsChecked(false)
      setAnswer('')
      setCaption('')
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* <div>
        <label className="block font-semibold mb-1">
          Short Task Description
        </label>
        <input
          type="text"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value.slice(0, 20))}
          className="w-full border rounded p-2"
          placeholder="Enter short task description"
        />
      </div> */}

      <div>
        <label className="block font-semibold mb-1">
          Full Task Description
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Enter full task"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isImageTask}
          onChange={(e) => setIsImageTask(e.target.checked)}
        />
        <span>
          {isImageTask ? 'TYPE OF TASK: IMAGE' : 'TYPE OF TASK: TEXT'}
        </span>
      </div>

      <button
        onClick={handleAddTask}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
      >
        {editIndex !== -1 ? 'Update Task' : 'Add Task'}
      </button>

      <button
        onClick={() => setModalVisible(true)}
        className="text-black underline"
      >
        Show Tasks
      </button>

      <TaskModal
        tasks={tasks}
        setTasks={setTasks}
        setTask={setTask}
        setEditIndex={setEditIndex}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onNewTask={onNewTask}
      />
    </div>
  )
}

export default TaskCreatorButton
