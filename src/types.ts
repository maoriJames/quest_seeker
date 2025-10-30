import { Dispatch, SetStateAction, ImgHTMLAttributes } from 'react'

// ---------------- Quests ----------------
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

// ---------------- Profiles ----------------
export type Role = 'seeker' | 'creator'

export type Profile = {
  id: string
  full_name: string
  email: string
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
  role: Role
  my_quests?: MyQuest[]
}

// ---------------- Tasks ----------------
export type Task = {
  id: string
  description: string
  isImage: boolean
  requiresCaption: boolean
  caption: string
  answer: string
  completed: boolean
}

export interface TaskModalProps {
  tasks: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  setTask: Dispatch<SetStateAction<string>>
  setEditIndex: Dispatch<SetStateAction<number>>
  visible: boolean
  onClose: () => void
  onNewTask: OnNewTaskFunction
}

export interface TaskCreatorButtonProps {
  questUpdates: Task[]
  onNewTask: OnNewTaskFunction
}

export type OnNewTaskFunction = (updatedTasks: Task[]) => void

export type MyQuest = {
  quest_id: string
  title: string | undefined
  tasks: Task[]
  progress?: number
  completed: boolean
}

// ---------------- Remote Image ----------------
export type RemoteImageProps = {
  path?: string | null
  fallback: string
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>

// ---------------- Sponsors ----------------
export type Sponsor = {
  id: string
  name: string
  sponsorImage: boolean
  image: string // string path/URL
}

// export interface SponsorModalProps {
//   sponsors: Sponsor[]
//   setSponsors: Dispatch<SetStateAction<Sponsor[]>>
//   setSponsor: Dispatch<SetStateAction<string>>
//   setPreview: Dispatch<SetStateAction<string | null>> // renamed from setImage
//   setEditIndex: Dispatch<SetStateAction<number>>
//   visible: boolean
//   onClose: () => void
//   onNewSponsor: OnNewSponsorFunction
//   handleEdit?: (index: number) => void // optional if you pass edit handler
// }

export interface SponsorCreatorButtonProps {
  sponsorUpdates: Sponsor[]
  onNewSponsor: OnNewSponsorFunction
}

export type OnNewSponsorFunction = (updatedSponsors: Sponsor[]) => void

// ---------------- Prizes ----------------
export type Prize = {
  id: string
  name: string
  prizeImage: boolean
  image: string
  contributor: string
}

// export interface PrizeModalProps {
//   prizes: Prize[]
//   setPrizes: Dispatch<SetStateAction<Prize[]>>
//   setPrize: Dispatch<SetStateAction<string>>
//   setContributor: Dispatch<SetStateAction<string>>
//   setPreview: Dispatch<SetStateAction<string | null>> // renamed from setImage
//   setEditIndex: Dispatch<SetStateAction<number>>
//   visible: boolean
//   onClose: () => void
//   OnNewPrize: OnNewPrizeFunction
//   handleEdit?: (index: number) => void // optional if you pass edit handler
// }

export interface PrizeCreatorButtonProps {
  prizeUpdates: Prize[]
  onNewPrize: OnNewPrizeFunction
  prizeContributor: string
}

export type OnNewPrizeFunction = (updatedPrizes: Prize[]) => void
// ---------------- Optional future prize types ----------------
// export type OnNewPrizeFunction = (updatedPrizes: Prize[]) => void
// export interface PrizeCreatorButtonProps {
//   prizeUpdates: Prize[]
//   onNewPrize: OnNewPrizeFunction
// }
