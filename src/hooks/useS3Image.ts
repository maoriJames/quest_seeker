import { useState, useEffect } from 'react'
import { getUrl } from 'aws-amplify/storage'

export function useS3Image(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }

    // If the path is already a full URL, return it directly
    if (path.startsWith('http')) {
      setUrl(path)
      return
    }

    const fetchUrl = async () => {
      try {
        const result = await getUrl({ path })
        setUrl(result.url.toString()) // <- convert URL -> string
      } catch (err) {
        console.error('Error fetching S3 image URL:', err)
        setUrl(null)
      }
    }

    fetchUrl()
  }, [path])

  return url
}
