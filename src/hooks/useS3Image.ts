// src/hooks/useS3Image.ts
import { useState, useEffect } from 'react'
import { getUrl } from 'aws-amplify/storage'

/**
 * Custom hook to resolve an S3 Storage path into a signed URL for previewing
 * @param path - The S3 storage key (e.g. "public/uuid-filename.png")
 * @returns a string URL or null if not available
 */
export function useS3Image(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }

    const fetchUrl = async () => {
      try {
        const { url } = await getUrl({ path })
        setUrl(url.toString())
      } catch (err) {
        console.error('Error fetching S3 image URL:', err)
        setUrl(null)
      }
    }

    fetchUrl()
  }, [path])

  return url
}
