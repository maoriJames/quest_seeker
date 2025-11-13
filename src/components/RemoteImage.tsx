import { useEffect, useState } from 'react'
import { getUrl } from 'aws-amplify/storage'
import { RemoteImageProps } from '@/types'

const RemoteImage = ({
  path,
  fallback,
  className,
  ...imgProps
}: RemoteImageProps) => {
  const [image, setImage] = useState<string>(fallback || '')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)

    if (!path) {
      setImage(fallback || '')
      return
    }

    // Case 1: Local asset or already a valid URL
    if (
      path.startsWith('data:') ||
      path.startsWith('/') ||
      path.startsWith('blob:') ||
      path.includes('.svg') ||
      path.startsWith('http')
    ) {
      setImage(path)
      return
    }

    // Case 2: S3 path — fetch signed URL
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

  return (
    <img
      src={image || fallback}
      className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
      onLoad={() => setLoaded(true)}
      loading="lazy"
      {...imgProps}
    />
  )
}

export default RemoteImage
