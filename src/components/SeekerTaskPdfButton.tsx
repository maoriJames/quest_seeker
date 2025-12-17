import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Task, PdfUser } from '@/types'
import { Quest } from '@/graphql/API'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  taskBlock: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 8,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  answerLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  answerText: {
    fontSize: 11,
    marginTop: 2,
  },
})

interface SeekerPdfProps {
  quest: Quest
  seekerTasks: Task[]
  user: PdfUser
}

export default function SeekerTaskPdfButton({
  quest,
  seekerTasks,
  user,
}: SeekerPdfProps) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>{quest.quest_name}</Text>
        <Text>Completed by: {user.full_name}</Text>
        <Text>Date: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.subheader}>Your Task Answers</Text>

        {seekerTasks.map((task, index) => (
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

            <Text style={styles.answerLabel}>Answer:</Text>
            <RemoteImage
              path={task.answer || placeHold}
              fallback={placeHold}
              className="w-12 h-12 rounded-full object-cover"
            />
          </View>
        ))}
      </Page>
    </Document>
  )
}
