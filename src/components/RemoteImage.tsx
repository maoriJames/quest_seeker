import { useEffect, useState } from 'react'
import { getUrl } from 'aws-amplify/storage'
import { RemoteImageProps } from '@/types'

const RemoteImage = ({ path, fallback, ...imgProps }: RemoteImageProps) => {
  const [image, setImage] = useState<string>('')
  useEffect(() => {
    if (!path) return

    // If path is already a full URL, just use it
    if (path.startsWith('http')) {
      setImage(path)
      return
    }

    ;(async () => {
      try {
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        const { url } = await getUrl({
          path: cleanPath,
          options: { expiresIn: 300 },
        })
        setImage(url.toString())
      } catch (err) {
        console.error('Error fetching signed URL:', err)
      }
    })()
  }, [path])

  return <img src={image || fallback} {...imgProps} />
}

export default RemoteImage
