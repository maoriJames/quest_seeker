import { Dispatch, SetStateAction, ImgHTMLAttributes } from 'react'

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

export type Task = {
  id: number
  description: string
  isImage: boolean
  isChecked: boolean
  caption: string
  answer: string
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

export type RemoteImageProps = {
  path?: string | null
  fallback: string
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>

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

export type Sponsor = {
  id: string
  name: string
  sponsorImage: boolean
  image: string
}

export interface SponsorModalProps {
  sponsors: Array<{
    id: string
    name: string
    sponsorImage: boolean
    image: string // string now
  }>
  setSponsors: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; sponsorImage: boolean; image: string }>
    >
  >
  setSponsor: React.Dispatch<React.SetStateAction<string>>
  // setImage: React.Dispatch<React.SetStateAction<File | null>>
  setEditIndex: React.Dispatch<React.SetStateAction<number>>
  visible: boolean
  onClose: () => void
  onNewSponsor: OnNewSponsorFunction
}

export interface SponsorCreatorButtonProps {
  sponsorUpdates: Sponsor[]
  onNewSponsor: OnNewSponsorFunction
}

export type OnNewSponsorFunction = (updatedSponsors: Sponsor[]) => void

export type Prize = {
  id: string
  name: string
  contributor: string
}

export type OnNewTaskFunction = (updatedTasks: Task[]) => void

// export type OnNewPrizeFunction = (updatedPrizes: Prize[]) => void

// export interface PrizeCreatorButtonProps {
//   prizeUpdates: Prize[]
//   onNewPrize: OnNewPrizeFunction
// }

// export type MyQuest = {
//   questId: uuid
// }
