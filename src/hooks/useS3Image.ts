import { useState, useEffect } from 'react'
import { getUrl } from 'aws-amplify/storage'

const REGION = 'ap-southeast-2'
const BUCKET = 'amplify-amplifyvitereactt-amplifyquestseekerbucket-beyjfgpn1vr2'

export function useS3Image(path?: string | null) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }

    // Already a full URL → just use it
    if (path.startsWith('http')) {
      setUrl(path)
      return
    }

    // If image is public, build a permanent direct S3 URL
    if (path.startsWith('public/')) {
      const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${path}`
      setUrl(publicUrl)
      return
    }

    // Otherwise, fallback to a signed URL (for private/protected images)
    const fetchSignedUrl = async () => {
      try {
        const { url } = await getUrl({ path })
        setUrl(url.toString())
      } catch (err) {
        console.error('Error fetching S3 image URL:', err)
        setUrl(null)
      }
    }

    fetchSignedUrl()
  }, [path])

  return url
}
