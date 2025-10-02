import React, { useEffect, useState } from 'react'
import { SponsorCreatorButtonProps, Sponsor } from '@/types'
import { SponsorModal } from './SponsorModal'
import { uploadData } from 'aws-amplify/storage'

const SponsorCreatorButton: React.FC<SponsorCreatorButtonProps> = ({
  onNewSponsor,
  sponsorUpdates,
}) => {
  const [sponsor, setSponsor] = useState('')
  const [sponsorImage, setSponsorImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorUpdates || [])
  const [editIndex, setEditIndex] = useState(-1)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (sponsorUpdates) setSponsors(sponsorUpdates)
  }, [sponsorUpdates])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] || null)
  }

  const handleAddSponsor = async () => {
    if (!sponsor) return

    const updatedSponsors = [...sponsors]
    let imagePath = ''

    // Upload file if checked
    if (sponsorImage && imageFile) {
      imagePath = await uploadImage(imageFile) // returns string path
    }

    if (editIndex !== -1) {
      updatedSponsors[editIndex] = {
        ...updatedSponsors[editIndex],
        name: sponsor,
        sponsorImage: sponsorImage,
        image: imagePath || updatedSponsors[editIndex].image,
      }
    } else {
      const newSponsor: Sponsor = {
        id: crypto.randomUUID(),
        name: sponsor,
        sponsorImage: sponsorImage,
        image: imagePath || '',
      }
      updatedSponsors.push(newSponsor)
    }

    setSponsors(updatedSponsors)
    onNewSponsor(updatedSponsors)

    // Reset form
    setSponsor('')
    setImageFile(null)
    setEditIndex(-1)
  }

  const uploadImage = async (file: File, isPublic = true): Promise<string> => {
    const prefix = isPublic ? 'public/' : 'private/'
    const path = `${prefix}${crypto.randomUUID()}-${file.name}`
    try {
      const { result } = await uploadData({
        path,
        data: file,
        options: { contentType: file.type },
      })
      // S3 path or URL
      return (await result).path
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  return (
    <div className="p-4 mt-2 border rounded bg-white shadow-md">
      <p className="mb-2 font-semibold">Enter Sponsors:</p>

      <input
        type="text"
        className="w-full p-2 mb-2 border rounded"
        placeholder="Enter Sponsor Name"
        value={sponsor}
        onChange={(e) => setSponsor(e.target.value)}
      />

      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={sponsorImage}
          onChange={(e) => setSponsorImage(e.target.checked)}
        />
        <span>Include Sponsor Image</span>

        {sponsorImage && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="ml-4"
          />
        )}
      </div>

      <button
        className="w-full p-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        onClick={handleAddSponsor}
      >
        {editIndex !== -1 ? 'Update Sponsor' : 'Add Sponsor'}
      </button>

      <button
        className="w-full p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setModalVisible(true)}
      >
        Show Sponsors
      </button>

      {sponsors && (
        <SponsorModal
          sponsors={sponsors}
          setSponsors={setSponsors}
          setSponsor={setSponsor}
          setEditIndex={setEditIndex}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onNewSponsor={onNewSponsor}
        />
      )}
    </div>
  )
}

export default SponsorCreatorButton
