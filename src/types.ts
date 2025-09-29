// import { Dispatch, ReactNode, SetStateAction } from 'react'

export type Quest = {
  id: string
  quest_name: string
  quest_details: string
  quest_start?: string
  quest_end?: string | null
  quest_image?: string | null
  quest_entry?: number | null
  region?: string | null
  creator_id?: string | null
}

export type Profile = {
  id: string
  organization_name: string
  registration_number: string
  business_type: string
  organization_description: string
  primary_contact_name: string
  primary_contact_position: string
  primary_contact_phone: string
  secondary_contact_name: string
  secondary_contact_position: string
  secondary_contact_phone: string
  image: string
}

// export interface MyComponentProps {
//   children: ReactNode
// }

// export interface TaskModalProps {
//   tasks: Array<{ id: number; description: string; isImage: boolean }>
//   setTasks: Dispatch<
//     SetStateAction<Array<{ id: number; description: string; isImage: boolean }>>
//   >
//   setTask: Dispatch<SetStateAction<string>>
//   setEditIndex: Dispatch<SetStateAction<number>>
//   visible: boolean
//   onClose: () => void
//   onNewTask: OnNewTaskFunction
// }
// export interface SponsorModalProps {
//   sponsors: Array<{
//     id: string
//     name: string
//     sponsorImage: boolean
//     image: string
//   }>
//   setSponsors: Dispatch<
//     SetStateAction<
//       Array<{ id: string; name: string; sponsorImage: boolean; image: string }>
//     >
//   >
//   setSponsor: Dispatch<SetStateAction<string>>
//   setImage: Dispatch<SetStateAction<string | null>>
//   setEditIndex: Dispatch<SetStateAction<number>>
//   visible: boolean
//   onClose: () => void
//   onNewSponsor: OnNewSponsorFunction
// }

// export interface PrizeModalProps {
//   prizes: Array<{
//     id: string
//     name: string
//     contributor: string
//   }>
//   setPrizes: Dispatch<
//     SetStateAction<Array<{ id: string; name: string; contributor: string }>>
//   >
//   setPrize: Dispatch<SetStateAction<string>>
//   setContributor: Dispatch<SetStateAction<string>>
//   setEditIndex: Dispatch<SetStateAction<number>>
//   visible: boolean
//   onClose: () => void
//   onNewPrize: OnNewPrizeFunction
// }

export type Task = {
  id: number
  description: string
  isImage: boolean
  isChecked: boolean
  caption: string
  answer: string
}

export type Sponsor = {
  id: string
  name: string
  sponsorImage: boolean
  image: string
}

export type Prize = {
  id: string
  name: string
  contributor: string
}

// export type OnNewTaskFunction = (updatedTasks: Task[]) => void

// export type OnNewSponsorFunction = (updatedSponsors: Sponsor[]) => void

// export type OnNewPrizeFunction = (updatedPrizes: Prize[]) => void

// export interface TaskCreatorButtonProps {
//   questUpdates: Task[]
//   onNewTask: OnNewTaskFunction
// }

// export interface SponsorCreatorButtonProps {
//   sponsorUpdates: Sponsor[]
//   onNewSponsor: OnNewSponsorFunction
// }

// export interface PrizeCreatorButtonProps {
//   prizeUpdates: Prize[]
//   onNewPrize: OnNewPrizeFunction
// }

// export type MyQuest = {
//   questId: uuid
// }
