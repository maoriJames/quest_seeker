import { useEffect, useState } from 'react'
import { RemoteImageProps } from '@/types'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3' // AWS SDK v3
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
})

const RemoteImage = ({ path, fallback, ...imgProps }: RemoteImageProps) => {
  const [image, setImage] = useState<string>('')

  useEffect(() => {
    if (!path) return

    ;(async () => {
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
          Key: path,
        })
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }) // 1 hour
        setImage(url)
      } catch (error) {
        console.error('Error getting S3 image URL:', error)
      }
    })()
  }, [path])

  return (
    <img
      src={image || fallback}
      alt={imgProps.alt ?? 'remote image'}
      {...imgProps}
    />
  )
}

export default RemoteImage
