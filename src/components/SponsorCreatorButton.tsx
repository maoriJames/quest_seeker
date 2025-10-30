import React, { useEffect, useState } from 'react'
import { SponsorCreatorButtonProps, Sponsor, Prize } from '@/types'
import { SponsorModal } from './SponsorModal'
import { uploadData } from 'aws-amplify/storage'
import { Switch } from './ui/switch'
import PrizeCreatorButton from './PrizeCreatorButton'

const SponsorCreatorButton: React.FC<SponsorCreatorButtonProps> = ({
  onNewSponsor,
  sponsorUpdates,
}) => {
  const [sponsor, setSponsor] = useState('')
  const [sponsorImage, setSponsorImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [prizeEnabled, setPrizeEnabled] = useState(false)
  const [prizes, setPrizes] = useState<Prize[]>([])
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

    const updatedSponsors = [...sponsors]
    let imagePath = editIndex !== -1 ? updatedSponsors[editIndex].image : ''

    // Upload file if checked
    if (sponsorImage && imageFile) {
      imagePath = await uploadImage(imageFile) // S3 path string
    }

    const newSponsor: Sponsor = {
      id:
        editIndex !== -1 ? updatedSponsors[editIndex].id : crypto.randomUUID(),
      name: sponsor,
      sponsorImage,
      image: imagePath,
    }

    if (editIndex !== -1) {
      updatedSponsors[editIndex] = newSponsor
    } else {
      updatedSponsors.push(newSponsor)
    }

    setSponsors(updatedSponsors)
    onNewSponsor(updatedSponsors)

    // reset form
    setSponsor('')
    setImageFile(null)
    setPreviewUrl(null)
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
      return (await result).path
    } catch (err) {
      console.error('Error uploading file:', err)
      return ''
    }
  }

  const handleEdit = (index: number) => {
    setEditIndex(index)
    setSponsor(sponsors[index].name)
    setPreviewUrl(sponsors[index].image || null)
    setSponsorImage(!!sponsors[index].image)
    setModalVisible(false)
  }

  return (
    <div className="p-4 mt-2 border rounded bg-white shadow-md">
      <div className="flex items-center justify-between w-full">
        <p className="mb-2 font-semibold">Enter Sponsors:</p>

        <div className="flex items-center gap-2">
          <p className="mb-2 font-semibold">
            Prizes affiliated with this sponsor?
          </p>
          <Switch checked={prizeEnabled} onCheckedChange={setPrizeEnabled} />
          <span>{prizeEnabled ? 'Yo' : 'No'}</span>
        </div>
      </div>

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

      {sponsorImage && previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="h-20 w-20 rounded object-cover mb-2"
        />
      )}

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
      {prizeEnabled && (
        <PrizeCreatorButton
          prizeUpdates={prizes}
          onNewPrize={setPrizes}
          prizeContributor={sponsor}
        />
      )}
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
