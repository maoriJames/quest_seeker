import React, { useEffect, useState } from 'react'
import { SponsorCreatorButtonProps, Sponsor, Prize } from '@/types'
import { SponsorModal } from './SponsorModal'
import { uploadData } from 'aws-amplify/storage'
import { Switch } from './ui/switch'
// import PrizeCreatorButton from './PrizeCreatorButton'
import { deleteS3Object } from '@/tools/deleteS3Object'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import { PrizeModal } from './PrizeModal'

const SponsorCreatorButton: React.FC<SponsorCreatorButtonProps> = ({
  sponsorUpdates,
  onNewSponsor,
  prizeEnabled,
  onPrizeToggle,
  prizeUpdates,
  onNewPrize,
}) => {
  const [prize, setPrize] = useState('')
  const [prizeImage, setPrizeImage] = useState(false)
  const [sponsor, setSponsor] = useState('')
  const [sponsorImage, setSponsorImage] = useState(false)
  const [currentSponsorImage, setCurrentSponsorImage] = useState<string | null>(
    null
  )
  const [currentImageFile, setCurrentImageFile] = useState<string | null>(null)
  const [contributor, setContributor] = useState(sponsor)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePrizeFile, setImagePrizeFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewPrizeUrl, setPreviewPrizeUrl] = useState<string | null>(null)
  const [prizes, setPrizes] = useState<Prize[]>(prizeUpdates || [])
  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorUpdates || [])
  const [editIndex, setEditIndex] = useState(-1)
  const [modalVisible, setModalVisible] = useState(false)
  const [prizeModalVisible, setPrizeModalVisible] = useState(false)

  useEffect(() => {
    if (sponsorUpdates) setSponsors(sponsorUpdates)
  }, [sponsorUpdates])

  useEffect(() => {
    if (prizeUpdates) setPrizes(prizeUpdates)
  }, [prizeUpdates])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) setPreviewUrl(URL.createObjectURL(file))
    else setPreviewUrl(null)
  }

  const handlePrizeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImagePrizeFile(file)
    if (file) setPreviewPrizeUrl(URL.createObjectURL(file))
    else setPreviewPrizeUrl(null)
  }

  const handleAddSponsorAndPrizes = async () => {
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

    // ---------------- Add/Update Prize ----------------
    if (prize) {
      const updatedPrizes = [...prizes]
      let prizeImagePath =
        editIndex !== -1 ? updatedPrizes[editIndex].image : ''
      // console.log('Image Prize File', imagePrizeFile)
      if (prizeImage && imagePrizeFile) {
        const uploadedPath = await uploadImage(imagePrizeFile)
        if (uploadedPath) {
          prizeImagePath = uploadedPath
          // console.log('prize image path', prizeImagePath)
          if (
            editIndex !== -1 &&
            currentImageFile &&
            currentImageFile !== uploadedPath
          ) {
            await deleteS3Object(currentImageFile)
          }
        }
      }

      const newPrize: Prize = {
        id:
          editIndex !== -1 ? updatedPrizes[editIndex].id : crypto.randomUUID(),
        name: prize,
        prizeImage,
        image: prizeImagePath,
        contributor: sponsor,
      }
      console.log('newPrize', newPrize)
      if (editIndex !== -1) {
        updatedPrizes[editIndex] = newPrize
      } else {
        updatedPrizes.push(newPrize)
      }

      setPrizes(updatedPrizes)
      onNewPrize(updatedPrizes)
    }

    // ---------------- Reset Form ----------------
    setSponsor('')
    setImageFile(null)
    setPreviewUrl(null)
    setPrize('')
    setImagePrizeFile(null)
    setPreviewPrizeUrl(null)
    setEditIndex(-1)
    setCurrentSponsorImage(null)
    setCurrentImageFile(null)
    setSponsorImage(false)
    setPrizeImage(false)
    onPrizeToggle(false)
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

  const handlePrizeEdit = (index: number) => {
    setEditIndex(index)
    setPrize(prizes[index].name)
    setPreviewUrl(prizes[index].image || null)
    setPrizeImage(!!prizes[index].image)
    setContributor(contributor)
    setCurrentImageFile(prizes[index].image || null) // save old image
    setPrizeModalVisible(false)
  }

  // console.log('sponsor for contributor: ', sponsor)
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
        <div className="flex items-center gap-2">
          <p className="mb-2 font-semibold">
            Prizes affiliated with this sponsor?
          </p>
          <Switch
            checked={prizeEnabled}
            onCheckedChange={(checked) => onPrizeToggle(checked)}
          />
          <span>{prizeEnabled ? 'Yes' : 'No'}</span>
        </div>

        {sponsorImage && previewUrl && (
          <RemoteImage
            path={previewUrl || placeHold}
            fallback={placeHold}
            className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-sm"
          />
        )}
      </div>
      {prizeEnabled && (
        <>
          <p className="mb-2 font-semibold">Enter Prizes:</p>

          <input
            type="text"
            className="w-full p-2 mb-2 border rounded"
            placeholder="Enter Prize Name"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
          />

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={prizeImage}
              onChange={(e) => setPrizeImage(e.target.checked)}
            />
            <span>Include Prize Image</span>

            {prizeImage && (
              <input
                type="file"
                accept="image/*"
                onChange={handlePrizeImageChange}
                className="ml-4"
              />
            )}
          </div>

          {prizeImage && previewPrizeUrl && (
            <RemoteImage
              path={previewPrizeUrl || placeHold}
              fallback={placeHold}
              className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-sm"
            />
          )}

          {prizes && (
            <PrizeModal
              prizes={prizes}
              setPrizes={setPrizes}
              setPrize={setPrize}
              setPreview={setPreviewUrl} // renamed for clarity
              setEditIndex={setEditIndex}
              visible={prizeModalVisible}
              onClose={() => setPrizeModalVisible(false)}
              onNewPrize={onNewPrize}
              contributor={sponsor}
              handlePrizeEdit={handlePrizeEdit} // pass edit handler
            />
          )}
        </>
      )}
      {/* Add Sponsor button */}
      <button
        type="button"
        className="w-full p-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        onClick={handleAddSponsorAndPrizes}
      >
        {prizeEnabled
          ? editIndex !== -1
            ? 'Update Sponsor & Prize'
            : 'Add Sponsor & Prize'
          : editIndex !== -1
            ? 'Update Sponsor'
            : 'Add Sponsor'}
      </button>

      {/* Show Sponsors button */}
      <button
        type="button"
        className="w-full p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setModalVisible(true)}
      >
        {prizeEnabled ? 'Show Sponsors & Prizes' : 'Show Sponsors'}
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
