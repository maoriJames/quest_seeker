import { useEffect, useState } from 'react'
import { TaskModal } from './TaskModal'
import { TaskCreatorButtonProps, Task } from '@/types'

const TaskCreatorButton: React.FC<TaskCreatorButtonProps> = ({
  onNewTask,
  questUpdates,
}) => {
  const [task, setTask] = useState('')
  const [isImageTask, setIsImageTask] = useState(true)
  const [requiresCaption, setRequiresCaption] = useState(false)
  // const [isChecked, setIsChecked] = useState(false)
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
          requiresCaption,
          caption,
          answer,
        }
      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          description: task,
          isImage: isImageTask,
          requiresCaption, // <-- new property
          caption: '', // reset initially
          answer: '', // reset initially
          completed: false,
        }

        updatedTasks.push(newTask)
      }

      onNewTask(updatedTasks)

      setTask('')
      // setTaskDescription('')
      setEditIndex(-1)
      setRequiresCaption(false)
      setAnswer('')
      setCaption('')
    }
  }

  return (
    <div className="p-4 space-y-4">
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
        <span>Enable Image</span>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={requiresCaption}
          onChange={(e) => setRequiresCaption(e.target.checked)}
        />
        <span>Enable Caption / String Answer</span>
      </div>

      <button
        type="button"
        onClick={handleAddTask}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
      >
        {editIndex !== -1 ? 'Update Task' : 'Add Task'}
      </button>

      <button
        type="button"
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
