import { useEffect, useState } from 'react'
import { getUrl } from 'aws-amplify/storage'
import { RemoteImageProps } from '@/types'

const RemoteImage = ({ path, fallback, ...imgProps }: RemoteImageProps) => {
  const [image, setImage] = useState<string>('')

  useEffect(() => {
    if (!path) return

    ;(async () => {
      try {
        const { url } = await getUrl({
          path,
          options: { expiresIn: 300 }, // 5 minutes
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
