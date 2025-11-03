import React, { useEffect, useState } from 'react'
import { PrizeCreatorButtonProps, Prize } from '@/types'
import { uploadData } from 'aws-amplify/storage'
import { PrizeModal } from './PrizeModal'
import { deleteS3Object } from '@/tools/deleteS3Object'
import RemoteImage from './RemoteImage'
import placeHold from '@/assets/images/placeholder_view_vector.svg'

const PrizeCreatorButton: React.FC<PrizeCreatorButtonProps> = ({
  onNewPrize,
  prizeUpdates,
  prizeContributor,
}) => {
  const [prize, setPrize] = useState('')
  const [prizeImage, setPrizeImage] = useState(false)
  const [contributor, setContributor] = useState(prizeContributor)
  const [currentImageFile, setCurrentImageFile] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [prizes, setPrizes] = useState<Prize[]>(prizeUpdates || [])
  const [editIndex, setEditIndex] = useState(-1)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    if (prizeUpdates) setPrizes(prizeUpdates)
  }, [prizeUpdates])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) setPreviewUrl(URL.createObjectURL(file))
    else setPreviewUrl(null)
  }

  const handleAddPrize = async () => {
    if (!prize) return

    const updatedPrizes = [...prizes]
    let imagePath = editIndex !== -1 ? updatedPrizes[editIndex].image : ''

    // Upload file if checked
    if (prizeImage && imageFile) {
      const uploadedPath = await uploadImage(imageFile) // S3 path string
      if (uploadedPath) {
        imagePath = uploadedPath

        // Delete old image if editing and image changed
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
      id: editIndex !== -1 ? updatedPrizes[editIndex].id : crypto.randomUUID(),
      name: prize,
      prizeImage,
      image: imagePath,
      contributor,
    }

    if (editIndex !== -1) {
      updatedPrizes[editIndex] = newPrize
    } else {
      updatedPrizes.push(newPrize)
    }

    setPrizes(updatedPrizes)
    onNewPrize(updatedPrizes)

    // reset form
    setPrize('')
    setImageFile(null)
    setPreviewUrl(null)
    setEditIndex(-1)
    setCurrentImageFile(null)
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
    setPrize(prizes[index].name)
    setPreviewUrl(prizes[index].image || null)
    setPrizeImage(!!prizes[index].image)
    setContributor(prizeContributor)
    setCurrentImageFile(prizes[index].image || null) // save old image
    setModalVisible(false)
  }

  // console.log('current Prize: ', prizes)
  return (
    <>
      <p className="mb-2 font-semibold">Enter Prizes:</p>

      <input
        type="text"
        className="w-full p-2 mb-2 border rounded"
        placeholder="Enter Prize Name"
        value={prize}
        onChange={(e) => setPrize(e.target.value)}
      />

      {/* <input
        type="text"
        className="w-full p-2 mb-2 border rounded"
        placeholder="Enter Prize Contributor"
        value={contributor}
        onChange={(e) => setContributor(e.target.value)}
      /> */}

      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={prizeImage}
          onChange={(e) => setPrizeImage(e.target.checked)}
        />
        <span>Include Sponsor Image</span>

        {prizeImage && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="ml-4"
          />
        )}
      </div>

      {prizeImage && previewUrl && (
        <RemoteImage
          path={previewUrl || placeHold}
          fallback={placeHold}
          className="max-w-[100px] max-h-[100px] w-auto h-auto object-contain rounded-sm"
        />
      )}

      <button
        type="button"
        className="w-full p-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        onClick={handleAddPrize}
      >
        {editIndex !== -1 ? 'Update Prize' : 'Add Prize'}
      </button>

      <button
        type="button"
        className="w-full p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setModalVisible(true)}
      >
        Show Prizes
      </button>

      {prizes && (
        <PrizeModal
          prizes={prizes}
          setPrizes={setPrizes}
          setPrize={setPrize}
          setPreview={setPreviewUrl} // renamed for clarity
          setEditIndex={setEditIndex}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onNewPrize={onNewPrize}
          contributor={contributor}
          handleEdit={handleEdit} // pass edit handler
        />
      )}
    </>
  )
}

export default PrizeCreatorButton
