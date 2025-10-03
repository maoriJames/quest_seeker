import React from 'react'
import { Sponsor } from '@/types'

interface SponsorModalProps {
  sponsors: Sponsor[]
  setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>
  setSponsor: React.Dispatch<React.SetStateAction<string>>
  setPreview: React.Dispatch<React.SetStateAction<string | null>>
  setEditIndex: React.Dispatch<React.SetStateAction<number>>
  visible: boolean
  onClose: () => void
  onNewSponsor: (updated: Sponsor[]) => void
  handleEdit: (index: number) => void
}

export const SponsorModal: React.FC<SponsorModalProps> = ({
  sponsors,
  setSponsors,
  // setSponsor,
  // setPreview,
  // setEditIndex,
  visible,
  onClose,
  onNewSponsor,
  handleEdit,
}) => {
  if (!visible) return null

  const handleDelete = (index: number) => {
    const updated = [...sponsors]
    updated.splice(index, 1)
    setSponsors(updated)
    onNewSponsor(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Sponsors</h2>
        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {sponsors.map((s, i) => (
            <li
              key={s.id}
              className="flex justify-between items-center border-b pb-1"
            >
              <div className="flex items-center gap-2">
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <span className="truncate">{s.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-green-600 font-bold"
                  onClick={() => handleEdit(i)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 font-bold"
                  onClick={() => handleDelete(i)}
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
