import React from 'react'
import { SponsorModalProps } from '@/types'

export const SponsorModal: React.FC<SponsorModalProps> = ({
  sponsors,
  setSponsors,
  setSponsor,
  setEditIndex,
  visible,
  onClose,
  onNewSponsor,
}) => {
  if (!visible) return null

  const handleEditSponsor = (index: number) => {
    const sponsorToEdit = sponsors[index].name
    // const sponsorImageToEdit = sponsors[index].image // removed
    setSponsor(sponsorToEdit)
    setEditIndex(index)
    onClose()
  }

  const handleDeleteSponsor = (index: number) => {
    const updatedSponsors = [...sponsors]
    updatedSponsors.splice(index, 1)
    setSponsors(updatedSponsors)
    onNewSponsor(updatedSponsors)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Sponsors</h2>
        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {sponsors.map((sponsor, index) => (
            <li
              key={sponsor.id}
              className="flex justify-between items-center border-b pb-1"
            >
              <span className="truncate">{sponsor.name}</span>
              <div className="flex gap-2">
                <button
                  className="text-green-600 font-bold"
                  onClick={() => handleEditSponsor(index)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 font-bold"
                  onClick={() => handleDeleteSponsor(index)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 w-full bg-red-600 text-white font-bold py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}
