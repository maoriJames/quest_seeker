import React, { useEffect, useState } from 'react'
import { SponsorCreatorButtonProps, Sponsor } from '@/types'
import { SponsorModal } from './SponsorModal'
import { uploadData } from 'aws-amplify/storage'
// import { Switch } from './ui/switch'
// import PrizeCreatorButton from './PrizeCreatorButton'
import { deleteS3Object } from '@/tools/deleteS3Object'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
// import { PrizeModal } from './PrizeModal'

const SponsorCreatorButton: React.FC<SponsorCreatorButtonProps> = ({
  sponsorUpdates,
  onNewSponsor,
}) => {
  const [sponsor, setSponsor] = useState('')
  const [sponsorImage, setSponsorImage] = useState(false)
  const [currentSponsorImage, setCurrentSponsorImage] = useState<string | null>(
    null
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorUpdates || [])
  const [editIndex, setEditIndex] = useState(-1)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (sponsorUpdates) setSponsors(sponsorUpdates)
  }, [sponsorUpdates])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) setPreviewUrl(URL.createObjectURL(file))
    else setPreviewUrl(null)
  }

  const handleAddSponsor = async () => {
    if (!sponsor) return

    // ---------------- Add/Update Sponsor ----------------
    const updatedSponsors = [...sponsors]
    let sponsorImagePath =
      editIndex !== -1 ? updatedSponsors[editIndex].image : ''

    if (sponsorImage && imageFile) {
      const uploadedPath = await uploadImage(imageFile)
      if (uploadedPath) {
        sponsorImagePath = uploadedPath

        // Delete old image if editing
        if (
          editIndex !== -1 &&
          currentSponsorImage &&
          currentSponsorImage !== uploadedPath
        ) {
          await deleteS3Object(currentSponsorImage)
        }
      }
    }

    const newSponsor: Sponsor = {
      id:
        editIndex !== -1 ? updatedSponsors[editIndex].id : crypto.randomUUID(),
      name: sponsor,
      sponsorImage,
      image: sponsorImagePath,
    }

    if (editIndex !== -1) {
      updatedSponsors[editIndex] = newSponsor
    } else {
      updatedSponsors.push(newSponsor)
    }

    setSponsors(updatedSponsors)
    onNewSponsor(updatedSponsors)
    setSponsor('')
    setImageFile(null)
    setPreviewUrl(null)
    setEditIndex(-1)
    setCurrentSponsorImage(null)
    setSponsorImage(false)
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
      return (await result).path
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  const handleEdit = (index: number) => {
    setEditIndex(index)
    const s = sponsors[index]
    setSponsor(s.name)
    setPreviewUrl(s.image || null)
    setSponsorImage(!!s.image)
    setCurrentSponsorImage(s.image || null) // save old image
    setModalVisible(false)
  }

  return (
    <div className="p-4 mt-2 border rounded bg-white shadow-md">
      <div className="flex items-center justify-between w-full">
        <p className="mb-2 font-semibold">Enter Sponsors:</p>
      </div>

      <input
        type="text"
        className="w-full p-2 mb-2 border rounded"
        placeholder="Enter Sponsor Name"
        value={sponsor}
        onChange={(e) => setSponsor(e.target.value)}
      />

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 mb-2 ">
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

        {sponsorImage && previewUrl && (
          <RemoteImage
            path={previewUrl || placeHold}
            fallback={placeHold}
            className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-sm"
          />
        )}
      </div>

      {/* Add Sponsor button */}
      <button
        type="button"
        className="w-full p-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        onClick={handleAddSponsor}
      >
        {editIndex !== -1 ? 'Update Sponsor' : 'Add Sponsor'}
      </button>

      {/* Show Sponsors button */}
      <button
        type="button"
        className="w-full p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setModalVisible(true)}
      >
        {'Show Sponsors'}
      </button>

      {sponsors && (
        <SponsorModal
          sponsors={sponsors}
          setSponsors={setSponsors}
          setSponsor={setSponsor}
          setPreview={setPreviewUrl} // renamed for clarity
          setEditIndex={setEditIndex}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onNewSponsor={onNewSponsor}
          handleEdit={handleEdit} // pass edit handler
        />
      )}
    </div>
  )
}

export default SponsorCreatorButton
