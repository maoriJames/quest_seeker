import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '@aws-amplify/ui-react'
import { CardContent } from './ui/card'
import InlineEditField from './InlineEditField'
import InlineEditTextarea from './InlineEditTextarea'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import { uploadData, remove } from 'aws-amplify/storage'
import type { Profile } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import imageCompression from 'browser-image-compression'

type ProfileProps = {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
}

export default function UpdateAccount({ profile, onUpdate }: ProfileProps) {
  const navigate = useNavigate()

  const [previewImage, setPreviewImage] = useState(profile.image || '')
  const [oldImagePath, setOldImagePath] = useState(profile.image || '')
  const [oldImageThumbPath, setOldImageThumbPath] = useState(
    profile.image || ''
  )

  // ✅ Keep oldImagePath updated when profile changes
  useEffect(() => {
    if (profile.image) {
      setOldImagePath(profile.image)
    }
  }, [profile.image])

  const safeProfile = {
    ...profile,
    my_quests: profile.my_quests ?? [], // ← guarantees it’s an array
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile.id) return

    // Show local preview immediately
    setPreviewImage(URL.createObjectURL(file))

    try {
      // 1️⃣ Upload full image + thumbnail
      const { fullPath, thumbPath } = await uploadImageWithThumbnail(file)
      if (!fullPath || !thumbPath) return

      // 2️⃣ Delete old images if needed
      if (oldImagePath && !oldImagePath.startsWith('http')) {
        try {
          const cleanFull = oldImagePath.startsWith('/')
            ? oldImagePath.slice(1)
            : oldImagePath
          const cleanThumb = oldImageThumbPath?.startsWith('/')
            ? oldImageThumbPath.slice(1)
            : oldImageThumbPath
          if (cleanFull) await remove({ path: cleanFull })
          if (cleanThumb) await remove({ path: cleanThumb })
          console.log('✅ Old images removed')
        } catch (err) {
          console.error('Error deleting old images:', err)
        }
      }

      // 3️⃣ Update state & profile
      setOldImagePath(fullPath)
      setOldImageThumbPath(thumbPath)
      onUpdate({ image: fullPath, image_thumbnail: thumbPath })
    } catch (err) {
      console.error('Error uploading image:', err)
    }
  }

  // Helper function to upload full + thumbnail
  const uploadImageWithThumbnail = async (
    file: File
  ): Promise<{ fullPath: string; thumbPath: string }> => {
    const fullPath = `public/${crypto.randomUUID()}-${file.name}`
    const thumbPath = `public/thumbnails/${crypto.randomUUID()}-${file.name}`

    try {
      // Upload full image
      await uploadData({
        path: fullPath,
        data: file,
        options: { contentType: file.type },
      })

      // Create thumbnail (~200-300px)
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 300,
        maxSizeMB: 0.25,
        useWebWorker: true,
      })

      // Upload thumbnail
      await uploadData({
        path: thumbPath,
        data: compressedFile,
        options: { contentType: file.type },
      })

      return { fullPath, thumbPath }
    } catch (err) {
      console.error('Error uploading image or thumbnail:', err)
      return { fullPath: '', thumbPath: '' }
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
      <CardContent className="flex flex-col gap-4">
        {/* Profile Image */}
        <div className="flex flex-col items-center gap-2">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <RemoteImage
              path={profile.image || placeHold}
              fallback={placeHold}
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2"
          />
        </div>

        {profile.full_name && (
          <InlineEditField
            label="Name"
            value={profile.full_name}
            onSave={(newValue) => onUpdate({ full_name: newValue })}
            required
          />
        )}
        {profile.primary_contact_phone && (
          <InlineEditField
            label="Phone"
            value={profile.primary_contact_phone}
            onSave={(newValue) => onUpdate({ primary_contact_phone: newValue })}
            required
          />
        )}

        {/* Creator-only fields */}
        {profile.role === 'creator' && (
          <>
            <InlineEditField
              label="Organisation Name"
              value={profile.organization_name || ''}
              onSave={(newValue) => onUpdate({ organization_name: newValue })}
              required
            />
            <InlineEditField
              label="Registration Number"
              value={profile.registration_number || ''}
              onSave={(newValue) => onUpdate({ registration_number: newValue })}
              required
            />
            <label className="text-base font-bold">Business Type</label>
            <Select
              value={profile.business_type || ''}
              onValueChange={(newValue) =>
                onUpdate({ business_type: newValue })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Business Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Registered Company">
                  Registered Company
                </SelectItem>
                <SelectItem value="Registered Charity">
                  Registered Charity
                </SelectItem>
                <SelectItem value="Not for Profit">Not for Profit</SelectItem>
                <SelectItem value="Private Company">Private Company</SelectItem>
              </SelectContent>
            </Select>

            <InlineEditTextarea
              label="Organisation Description"
              value={profile.organization_description || ''}
              onSave={(newValue) =>
                onUpdate({ organization_description: newValue })
              }
            />

            <InlineEditField
              label="Primary Contact Name"
              value={profile.primary_contact_name || ''}
              onSave={(newValue) =>
                onUpdate({ primary_contact_name: newValue })
              }
            />
            <InlineEditField
              label="Primary Contact Position"
              value={profile.primary_contact_position || ''}
              onSave={(newValue) =>
                onUpdate({ primary_contact_position: newValue })
              }
            />
            <InlineEditField
              label="Secondary Contact Name"
              value={profile.secondary_contact_name || ''}
              onSave={(newValue) =>
                onUpdate({ secondary_contact_name: newValue })
              }
            />
            <InlineEditField
              label="Secondary Contact Position"
              value={profile.secondary_contact_position || ''}
              onSave={(newValue) =>
                onUpdate({ secondary_contact_position: newValue })
              }
            />
            <InlineEditField
              label="Secondary Contact Phone"
              value={profile.secondary_contact_phone || ''}
              onSave={(newValue) =>
                onUpdate({ secondary_contact_phone: newValue })
              }
            />
          </>
        )}
        <div className="mt-4">
          <h2 className="font-semibold text-lg mb-2">My Quests</h2>
          {safeProfile.my_quests.length === 0 ? (
            <p className="text-gray-500">You haven’t joined any quests yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {safeProfile.my_quests.map((myQuest) => (
                <li key={myQuest.quest_id}>
                  <Link
                    to={`/user/quest/${myQuest.quest_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {myQuest.title}
                  </Link>{' '}
                  ({myQuest.completed ? 'Completed' : 'In Progress'})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Return button */}
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
          onClick={() => navigate('/user/region')}
        >
          Return to Quest Page
        </button>
      </CardContent>
    </Card>
  )
}
