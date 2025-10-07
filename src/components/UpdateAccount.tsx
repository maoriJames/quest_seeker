import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@aws-amplify/ui-react'
import { CardContent } from './ui/card'
import InlineEditField from './InlineEditField'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import { uploadData, getUrl } from 'aws-amplify/storage'
import type { Profile } from '@/types'

type ProfileProps = {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
}

export default function UpdateAccount({ profile, onUpdate }: ProfileProps) {
  const navigate = useNavigate()
  const [previewImage, setPreviewImage] = useState(profile.image || '')

  // Handle image selection & upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile.id) return

    setPreviewImage(URL.createObjectURL(file)) // preview locally
    console.log('PreviewImage: ', previewImage)

    try {
      const uploadedUrl = await uploadImage(file)
      if (uploadedUrl) {
        // Update parent profile state & GraphQL backend
        onUpdate({ image: uploadedUrl })
      }
    } catch (err) {
      console.error('Error uploading image:', err)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const prefix = 'public/'
    const path = `${prefix}${crypto.randomUUID()}-${file.name}`

    try {
      await uploadData({
        path,
        data: file,
        options: { contentType: file.type },
      })

      const result = await getUrl({ path })
      return result.url.toString()
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
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

        {/* Inline editable fields */}
        <InlineEditField
          label="Name"
          value={profile.full_name}
          onSave={(newValue) => onUpdate({ full_name: newValue })}
          required
        />
        <InlineEditField
          label="Phone"
          value={profile.primary_contact_phone}
          onSave={(newValue) => onUpdate({ primary_contact_phone: newValue })}
          required
        />

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
            />
            <InlineEditField
              label="Business Type"
              value={profile.business_type || ''}
              onSave={(newValue) => onUpdate({ business_type: newValue })}
            />
            <InlineEditField
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
