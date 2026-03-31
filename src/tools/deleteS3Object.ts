import { remove } from 'aws-amplify/storage'

export const deleteS3Object = async (path: string) => {
  if (!path) return
  try {
    let key = path
    try {
      const url = new URL(path)
      key = url.pathname.slice(1)
    } catch {
      // already a valid key
    }
    console.log('🗑️ Deleting S3 object:', key)
    await remove({ path: key })
  } catch (err) {
    console.error('Failed to delete S3 object:', err)
  }
}
