import { useEffect, useState } from 'react'
import { getUrl } from 'aws-amplify/storage'
import { RemoteImageProps } from '@/types'

const RemoteImage = ({ path, fallback, ...imgProps }: RemoteImageProps) => {
  const [image, setImage] = useState<string>(fallback || '')

  useEffect(() => {
    if (!path) {
      setImage(fallback || '')
      return
    }

    // ✅ Case 1: Local asset or data URL — use directly
    if (
      path.startsWith('data:') || // base64 or inline SVGs
      path.startsWith('/') || // local /assets/
      path.startsWith('blob:') || // browser object URLs
      path.includes('.svg') || // imported SVGs
      path.startsWith('http') // already a valid URL
    ) {
      setImage(path)
      return
    }

    // ✅ Case 2: S3 path — fetch signed URL
    ;(async () => {
      try {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        const { url } = await getUrl({ path: cleanPath })
        setImage(url.toString())
      } catch (err) {
        console.error('Error fetching signed URL:', err)
        setImage(fallback || '')
      }
    })()
  }, [path, fallback])

  return <img src={image || fallback} {...imgProps} />
}

export default RemoteImage
