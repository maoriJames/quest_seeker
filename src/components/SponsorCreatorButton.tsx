import React, { useEffect, useState } from 'react'
import { uploadData } from 'aws-amplify/storage'
import { deleteS3Object } from '@/tools/deleteS3Object'
import { Switch } from './ui/switch'
import RemoteImage from './RemoteImage'
import { SponsorModal } from './SponsorModal'
import { PrizeModal } from './PrizeModal'
import placeHold from '@/assets/images/placeholder_view_vector.svg'
import type { Sponsor, Prize } from '@/types'

interface SponsorPrizeCreatorProps {
  sponsorUpdates?: Sponsor[]
  prizeUpdates?: Prize[]
  onNewSponsor: (sponsors: Sponsor[]) => void
  onNewPrize: (prizes: Prize[]) => void
}

const SponsorPrizeCreator: React.FC<SponsorPrizeCreatorProps> = ({
  sponsorUpdates,
  prizeUpdates,
  onNewSponsor,
  onNewPrize,
}) => {
  // --- Sponsor states ---
  const [sponsor, setSponsor] = useState('')
  const [sponsorImage, setSponsorImage] = useState(false)
  const [currentSponsorImage, setCurrentSponsorImage] = useState<string | null>(
    null
  )
  const [sponsorFile, setSponsorFile] = useState<File | null>(null)
  const [sponsorPreview, setSponsorPreview] = useState<string | null>(null)
  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorUpdates || [])
  const [editSponsorIndex, setEditSponsorIndex] = useState(-1)
  const [sponsorModalVisible, setSponsorModalVisible] = useState(false)

  // --- Prize states ---
  const [prizeEnabled, setPrizeEnabled] = useState(false)
  const [prize, setPrize] = useState('')
  const [prizeImage, setPrizeImage] = useState(false)
  const [prizeFile, setPrizeFile] = useState<File | null>(null)
  const [prizePreview, setPrizePreview] = useState<string | null>(null)
  const [currentPrizeImage, setCurrentPrizeImage] = useState<string | null>(
    null
  )
  const [prizes, setPrizes] = useState<Prize[]>(prizeUpdates || [])
  const [editPrizeIndex, setEditPrizeIndex] = useState(-1)
  const [prizeModalVisible, setPrizeModalVisible] = useState(false)

  // --- Sync updates from props ---
  useEffect(() => {
    if (sponsorUpdates) setSponsors(sponsorUpdates)
  }, [sponsorUpdates])

  useEffect(() => {
    if (prizeUpdates) setPrizes(prizeUpdates)
  }, [prizeUpdates])

  // --- Shared upload function ---
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

  // --- Add or Update Sponsor ---
  const handleAddSponsor = async () => {
    if (!sponsor) return

    const updatedSponsors = [...sponsors]
    let imagePath =
      editSponsorIndex !== -1 ? updatedSponsors[editSponsorIndex].image : ''

    if (sponsorImage && sponsorFile) {
      const uploadedPath = await uploadImage(sponsorFile)
      if (uploadedPath) {
        imagePath = uploadedPath
        if (
          editSponsorIndex !== -1 &&
          currentSponsorImage &&
          currentSponsorImage !== uploadedPath
        ) {
          await deleteS3Object(currentSponsorImage)
        }
      }
    }

    const newSponsor: Sponsor = {
      id:
        editSponsorIndex !== -1
          ? updatedSponsors[editSponsorIndex].id
          : crypto.randomUUID(),
      name: sponsor,
      sponsorImage,
      image: imagePath,
    }

    if (editSponsorIndex !== -1) {
      updatedSponsors[editSponsorIndex] = newSponsor
    } else {
      updatedSponsors.push(newSponsor)
    }

    setSponsors(updatedSponsors)
    onNewSponsor(updatedSponsors)

    // Reset
    setSponsor('')
    setSponsorFile(null)
    setSponsorPreview(null)
    setEditSponsorIndex(-1)
    setCurrentSponsorImage(null)
  }

  // --- Add or Update Prize ---
  const handleAddPrize = async () => {
    if (!prize) return

    const updatedPrizes = [...prizes]
    let imagePath =
      editPrizeIndex !== -1 ? updatedPrizes[editPrizeIndex].image : ''

    if (prizeImage && prizeFile) {
      const uploadedPath = await uploadImage(prizeFile)
      if (uploadedPath) {
        imagePath = uploadedPath
        if (
          editPrizeIndex !== -1 &&
          currentPrizeImage &&
          currentPrizeImage !== uploadedPath
        ) {
          await deleteS3Object(currentPrizeImage)
        }
      }
    }

    const newPrize: Prize = {
      id:
        editPrizeIndex !== -1
          ? updatedPrizes[editPrizeIndex].id
          : crypto.randomUUID(),
      name: prize,
      prizeImage,
      image: imagePath,
      contributor: sponsor, // 👈 link sponsor automatically
    }

    if (editPrizeIndex !== -1) {
      updatedPrizes[editPrizeIndex] = newPrize
    } else {
      updatedPrizes.push(newPrize)
    }

    setPrizes(updatedPrizes)
    onNewPrize(updatedPrizes)

    // Reset
    setPrize('')
    setPrizeFile(null)
    setPrizePreview(null)
    setEditPrizeIndex(-1)
    setCurrentPrizeImage(null)
  }

  // --- Combined Add Both ---
  const handleAddBoth = async () => {
    await handleAddSponsor()
    if (prizeEnabled) {
      await handleAddPrize()
    }
  }

  return (
    <div className="p-4 mt-2 border rounded bg-white shadow-md">
      <p className="mb-2 font-semibold">Enter Sponsor:</p>
      <input
        type="text"
        className="w-full p-2 mb-2 border rounded"
        placeholder="Sponsor Name"
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
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setSponsorFile(file)
              if (file) setSponsorPreview(URL.createObjectURL(file))
            }}
          />
        )}
      </div>

      {sponsorImage && sponsorPreview && (
        <RemoteImage
          path={sponsorPreview || placeHold}
          fallback={placeHold}
          className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-sm"
        />
      )}

      <div className="flex items-center justify-between mt-3 mb-2">
        <p className="font-semibold">Include Prize?</p>
        <Switch checked={prizeEnabled} onCheckedChange={setPrizeEnabled} />
        <span>{prizeEnabled ? 'Yes' : 'No'}</span>
      </div>

      {prizeEnabled && (
        <>
          <p className="mb-2 font-semibold">Enter Prize:</p>
          <input
            type="text"
            className="w-full p-2 mb-2 border rounded"
            placeholder="Prize Name"
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
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setPrizeFile(file)
                  if (file) setPrizePreview(URL.createObjectURL(file))
                }}
              />
            )}
          </div>

          {prizeImage && prizePreview && (
            <RemoteImage
              path={prizePreview || placeHold}
              fallback={placeHold}
              className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-sm"
            />
          )}
        </>
      )}

      <button
        type="button"
        className="w-full p-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        onClick={handleAddBoth}
      >
        {editSponsorIndex !== -1 ? 'Update Sponsor' : 'Add Sponsor'}
        {prizeEnabled && ' + Prize'}
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setSponsorModalVisible(true)}
        >
          Show Sponsors
        </button>
        <button
          type="button"
          className="flex-1 p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setPrizeModalVisible(true)}
        >
          Show Prizes
        </button>
      </div>

      {/* Modals */}
      {sponsorModalVisible && (
        <SponsorModal
          sponsors={sponsors}
          setSponsors={setSponsors}
          setSponsor={setSponsor}
          setPreview={setSponsorPreview}
          setEditIndex={setEditSponsorIndex}
          visible={sponsorModalVisible}
          onClose={() => setSponsorModalVisible(false)}
          onNewSponsor={onNewSponsor}
          handleEdit={(i: number) => {
            const s = sponsors[i]
            setSponsor(s.name)
            setSponsorPreview(s.image || null)
            setSponsorImage(!!s.image)
            setCurrentSponsorImage(s.image || null)
            setEditSponsorIndex(i)
            setSponsorModalVisible(false)
          }}
        />
      )}

      {prizeModalVisible && (
        <PrizeModal
          prizes={prizes}
          setPrizes={setPrizes}
          setPrize={setPrize}
          setPreview={setPrizePreview}
          setEditIndex={setEditPrizeIndex}
          visible={prizeModalVisible}
          onClose={() => setPrizeModalVisible(false)}
          onNewPrize={onNewPrize}
          contributor={sponsor}
          handleEdit={(i: number) => {
            const p = prizes[i]
            setPrize(p.name)
            setPrizePreview(p.image || null)
            setPrizeImage(!!p.image)
            setCurrentPrizeImage(p.image || null)
            setEditPrizeIndex(i)
            setPrizeModalVisible(false)
          }}
        />
      )}
    </div>
  )
}

export default SponsorPrizeCreator
