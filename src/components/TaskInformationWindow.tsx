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

interface TaskInformationWindowProps {
  questId: string
  tasks: Task[]
}

export default function TaskInformationWindow({
  questId,
  tasks,
}: TaskInformationWindowProps) {
  const { data: currentUserProfile } = useCurrentUserProfile()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [caption, setCaption] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Prefill caption/image if already answered
  useEffect(() => {
    console.log('caption ', caption)
    if (!selectedTask || !currentUserProfile) return

    const myQuestsArray: MyQuest[] =
      typeof currentUserProfile.my_quests === 'string'
        ? JSON.parse(currentUserProfile.my_quests)
        : (currentUserProfile.my_quests ?? [])

    const questEntry = myQuestsArray.find((q) => q.quest_id === questId)
    if (!questEntry) return

    // find the specific task within the quest
    const taskAnswer = questEntry.tasks.find((t) => t.id === selectedTask.id)
    console.log('myQuestsArray ', myQuestsArray)
    console.log('questEntry ', questEntry)
    if (taskAnswer) {
      console.log('taskAnswer = yes')
      setCaption(taskAnswer.caption || '')
      if (taskAnswer.answer && selectedTask.isImage) {
        setPreviewUrl(taskAnswer.answer)
      } else {
        setPreviewUrl(null)
      }
    } else {
      // reset if not found (to avoid showing previous answers)
      console.log('taskAnswer = no')
      setCaption('')
      setPreviewUrl(null)
    }
  }, [selectedTask, currentUserProfile, questId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
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
      await addQuestToProfile(questId, [
        {
          quest_id: questId,
          tasks: [
            {
              id: selectedTask.id,
              caption,
              answer: uploadedPath,
              description: '',
              isImage: false,
              requiresCaption: false,
              completed: false,
            },
          ],
          title: '',
          completed: false,
        },
      ])

      alert('✅ Answer saved successfully!')
    } catch (err) {
      console.error('❌ Failed to save answer:', err)
      alert('❌ Failed to save answer.')
    } finally {
      setCaption('')
      setImageFile(null)
      setPreviewUrl(null)
      setSelectedTask(null)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 shadow-inner max-h-64 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        Your Quest Tasks
      </h2>

      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li
            key={index}
            onClick={() => setSelectedTask(task)}
            className="cursor-pointer p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-yellow-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              {task.description || `Task ${index + 1}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">Click to answer</p>
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
            <DialogTitle className="text-lg font-bold mb-2">
              {selectedTask.description || 'Quest Task'}
            </DialogTitle>
            {selectedTask.requiresCaption && (
              <label className="block mb-4 text-sm font-medium">
                Caption:
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter your caption..."
                />
              </label>
            )}
            {selectedTask.isImage && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Upload Image:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600"
                />
              </div>
            )}

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-20 rounded object-cover mb-2"
              />
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
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
