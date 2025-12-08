import { useState, useEffect } from 'react'
import { Task, MyQuest } from '@/types'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from '@radix-ui/react-dialog'
import { uploadData } from 'aws-amplify/storage'
import { useCurrentUserProfile } from '@/hooks/userProfiles'
import { addQuestToProfile } from '@/hooks/addQuestToProfile'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'
import { QuestStatus } from '@/graphql/API'

interface TaskInformationWindowProps {
  questId: string
  tasks: Task[]
  userTasks?: MyQuest[] // new prop
  onTasksUpdated?: () => void
  readOnly?: boolean
}

export default function TaskInformationWindow({
  questId,
  tasks,
  userTasks,
  readOnly = false,
  onTasksUpdated,
}: TaskInformationWindowProps) {
  const { data: currentUserProfile } = useCurrentUserProfile()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editableTasks, setEditableTasks] = useState<Task[]>([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const getCurrentCoords = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`
        setLocation(coords)

        if (selectedTask) {
          handleLocationChange(selectedTask.id, coords)
        }
      },
      (err) => {
        alert('Failed to get location: ' + err.message)
      },
      { enableHighAccuracy: true }
    )
  }

  // Prefill when a task is selected
  useEffect(() => {
    // Initialize editableTasks from tasks + userTasks
    setEditableTasks(
      tasks.map((task) => {
        const userEntry = userTasks?.find((q) => q.quest_id === questId)
        const existingAnswer = userEntry?.tasks?.find((t) => t.id === task.id)
        return {
          ...task,
          caption: existingAnswer?.caption || '',
          answer: existingAnswer?.answer || '',
          location: existingAnswer?.location || '',
        }
      })
    )
  }, [tasks, userTasks, questId])

  useEffect(() => {
    if (!selectedTask) return
    const task = editableTasks.find((t) => t.id === selectedTask.id)
    setCaption(task?.caption || '')
    setPreviewUrl(task?.answer || '')
    setLocation(task?.location || '')
    setEditableTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id ? { ...t, completed: true } : t
      )
    )
  }, [selectedTask, editableTasks])

  const handleCaptionChange = (taskId: string, value: string) => {
    setEditableTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, caption: value } : t))
    )
  }

  const handleAnswerChange = (taskId: string, answer: string) => {
    setEditableTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, answer } : t))
    )
  }

  const handleLocationChange = (taskId: string, location: string) => {
    setEditableTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, location } : t))
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    const tempUrl = file ? URL.createObjectURL(file) : null
    setPreviewUrl(tempUrl) // show temporary preview immediately

    // Optional: store temp path in editableTasks for optimistic UI
    if (selectedTask && tempUrl) {
      handleAnswerChange(selectedTask.id, tempUrl)
    }
  }

  const uploadImage = async (file: File, isPublic = true): Promise<string> => {
    const prefix = isPublic ? 'public/' : 'private/'
    const path = `${prefix}${crypto.randomUUID()}-${file.name}`
    try {
      const { result } = await uploadData({
        path,
        data: file,
        options: { contentType: file.type },
      })
      return (await result).path
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  const handleSave = async () => {
    if (!selectedTask || !currentUserProfile) return

    let uploadedPath = ''
    if (selectedTask.isImage && imageFile) {
      uploadedPath = await uploadImage(imageFile)
    }

    try {
      setSaving(true)

      // 🔥 1. Determine if this specific task is now complete
      const taskIsCompleted = (() => {
        if (selectedTask.isImage) return !!uploadedPath
        if (selectedTask.requiresCaption) return caption.trim().length > 0
        if (selectedTask.isLocation) return location.trim().length > 0
        return true
      })()

      // 🔥 2. Build updated task entry for DB
      const updatedTaskEntry = {
        id: selectedTask.id,
        caption,
        answer: uploadedPath,
        location,
        description: selectedTask.description || '',
        isImage: selectedTask.isImage,
        requiresCaption: selectedTask.requiresCaption,
        isLocation: selectedTask.isLocation,
        completed: taskIsCompleted,
      }

      // 🔥 3. Compute quest-wide `completed` state AFTER updating this task
      const allCompleted = editableTasks
        .map((t) =>
          t.id === selectedTask.id ? { ...t, completed: taskIsCompleted } : t
        )
        .every((t) => t.completed)

      // 🔥 4. Save everything to the profile
      await addQuestToProfile(questId, [
        {
          quest_id: questId,
          tasks: [updatedTaskEntry],
          title: '',
          completed: allCompleted, // 👈 quest becomes complete if all tasks are done
          quest_status: QuestStatus.published,
        },
      ])

      alert('✅ Answer saved successfully!')

      // 🔥 5. Optimistic UI update
      setEditableTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, completed: taskIsCompleted } : t
        )
      )

      if (onTasksUpdated) await onTasksUpdated()

      setSelectedTask(null)
    } catch (err) {
      console.error('❌ Failed to save answer:', err)
      alert('❌ Failed to save answer.')
    } finally {
      setSaving(false)
      setImageFile(null)
    }
  }

  // console.log('PreviewUrl: ', previewUrl)
  return (
    <div className="border rounded-lg p-4 bg-gray-50 shadow-inner max-h-64 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        Your Quest Tasks
      </h2>

      <ul className="space-y-2">
        {editableTasks.map((task, index) => (
          <li
            key={index}
            onClick={() => setSelectedTask(task)}
            className="cursor-pointer p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-yellow-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              {task.description || `Task ${index + 1}`}
            </p>
            {task.answer || task.caption ? (
              <p className="flex items-center text-sm text-green-600 mt-1">
                <span className="mr-1">✅</span> Task Answered
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Click to answer</p>
            )}
          </li>
        ))}
      </ul>

      {selectedTask && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        >
          <DialogOverlay className="fixed inset-0 bg-black/30 z-40" />
          <DialogContent className="fixed top-1/2 left-1/2 z-50 max-w-md w-full bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2">
            {/* Top row: Title + Close button */}
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-lg font-bold">
                {selectedTask.description || 'Quest Task'}
              </DialogTitle>
              <DialogClose asChild>
                <button
                  onClick={() => setSelectedTask(null)}
                  aria-label="Close"
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </DialogClose>
            </div>
            {selectedTask.requiresCaption && (
              <label className="block mb-4 text-sm font-medium">
                Caption:
                <TooltipProvider>
                  <Tooltip>
                    {/* Only show tooltip if the button is disabled because of readOnly */}
                    <TooltipTrigger asChild>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => {
                          setCaption(e.target.value)
                          if (selectedTask)
                            handleCaptionChange(selectedTask.id, e.target.value)
                        }}
                        className={`border p-1 rounded w-full ${readOnly ? 'bg-gray-100' : ''}`}
                        placeholder="Enter your caption..."
                        disabled={readOnly} // disables input for owner
                      />
                    </TooltipTrigger>
                    {readOnly && (
                      <TooltipContent
                        side="top"
                        className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                      >
                        Owners cannot answer tasks on quests they have created
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </label>
            )}
            {selectedTask.isImage && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Upload Image:
                </label>
                <TooltipProvider>
                  <Tooltip>
                    {/* Only show tooltip if the button is disabled because of readOnly */}
                    <TooltipTrigger asChild>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`border p-1 rounded w-full ${readOnly ? 'bg-gray-100' : ''}`}
                        disabled={readOnly} // disables input for owner
                      />
                    </TooltipTrigger>
                    {readOnly && (
                      <TooltipContent
                        side="top"
                        className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                      >
                        Owners cannot answer tasks on quests they have created
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                {previewUrl ? (
                  <RemoteImage
                    path={previewUrl}
                    fallback={placeHold}
                    className="h-20 w-20 rounded object-cover mb-2"
                  />
                ) : (
                  <RemoteImage
                    path={previewUrl || placeHold}
                    fallback={placeHold}
                    className="h-20 w-20 rounded object-cover mb-2"
                  />
                )}
              </div>
            )}
            {selectedTask.isLocation && (
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">
                  Location:
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocation(value)
                      if (selectedTask)
                        handleLocationChange(selectedTask.id, value)
                    }}
                    className={`border p-1 rounded w-full ${readOnly ? 'bg-gray-100' : ''}`}
                    placeholder="Press button to fill coordinates"
                    disabled={readOnly}
                  />

                  <button
                    onClick={getCurrentCoords}
                    disabled={readOnly}
                    className={`px-3 py-1 rounded text-white ${
                      readOnly
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Use My Location
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </DialogClose>
              <TooltipProvider>
                <Tooltip>
                  {/* Only show tooltip if the button is disabled because of readOnly */}
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSave}
                      disabled={saving || readOnly}
                      className={`px-4 py-2 rounded text-white ${
                        saving || readOnly
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </TooltipTrigger>
                  {readOnly && (
                    <TooltipContent
                      side="top"
                      className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                    >
                      Owners cannot save tasks on quests they have created
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
