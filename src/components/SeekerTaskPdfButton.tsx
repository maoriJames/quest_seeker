import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { Task, PdfUser } from '@/types'
import { Quest } from '@/graphql/API'
import { useEffect, useState } from 'react'

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: 'Helvetica' },
  header: { fontSize: 20, marginBottom: 12, fontWeight: 'bold' },
  subheader: { fontSize: 14, marginBottom: 8, marginTop: 12 },
  taskBlock: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 8,
  },
  taskTitle: { fontSize: 13, fontWeight: 'bold' },
  answerLabel: { marginTop: 4, fontSize: 11, fontWeight: 'bold' },
  answerText: { fontSize: 11, marginTop: 2 },
})

interface SeekerPdfProps {
  quest: Quest
  seekerTasks: Task[]
  user: PdfUser
}

type TaskWithNormalizedImage = Task & {
  normalizedAnswer?: string | null
}

async function normalizeImage(url: string): Promise<string> {
  const img = new window.Image()
  img.crossOrigin = 'anonymous'
  img.src = url

  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  return canvas.toDataURL('image/jpeg', 0.92)
}

export default function SeekerTaskPdfButton({
  quest,
  seekerTasks,
  user,
}: SeekerPdfProps) {
  const [tasks, setTasks] = useState<TaskWithNormalizedImage[]>([])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const normalized = await Promise.all(
        seekerTasks.map(
          async (task): Promise<TaskWithNormalizedImage> => ({
            ...task,
            normalizedAnswer:
              task.isImage && task.answer
                ? await normalizeImage(task.answer)
                : null,
          })
        )
      )

      if (mounted) setTasks(normalized)
    })()

    return () => {
      mounted = false
    }
  }, [seekerTasks])

  if (!tasks.length) return null // or loading indicator

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>{quest.quest_name}</Text>
        <Text>Completed by: {user.full_name}</Text>
        <Text>Date: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.subheader}>Your Task Answers</Text>

        {tasks.map((task, index) => (
          <View key={task.id} style={styles.taskBlock}>
            <Text style={styles.taskTitle}>
              Task {index + 1}: {task.description}
            </Text>

            {task.requiresCaption && (
              <>
                <Text style={styles.answerLabel}>Caption:</Text>
                <Text style={styles.answerText}>
                  {task.caption || 'No caption provided'}
                </Text>
              </>
            )}

            <Text style={styles.answerLabel}>Image:</Text>

            {task.isImage && task.normalizedAnswer && (
              <Image
                src={task.normalizedAnswer}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  marginTop: 6,
                }}
              />
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}
