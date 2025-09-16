import QuestListItem from '@/components/QuestListItem'
import { useSeekerQuests } from '@/hooks/userQuests'
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  const [seekerName, setSeekerName] = useState('')
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [seekerEmail, setSeekerEmail] = useState('')
  const [seekerPhone, setSeekerPhone] = useState('')
  const [profileId, setProfileId] = useState('')
  const {
    currentProfile,
    error: profile,
    isLoading: currentLoading,
  } = useCurrentUserProfile()
  const { data: quests, error, isLoading } = useSeekerQuests()
  const { mutate: updateProfile } = useUpdateProfile()

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible)
  }

  const onUpdate = async () => {
    updateProfile(
      {
        id: profileId,
        seekerName: seekerName,
        primaryContactPhone: seekerPhone,
      },
      {
        onSuccess: () => {
          window.alert('Update Successful!')
          setDetailsVisible(!detailsVisible)
        },
      }
    )
  }

  useEffect(() => {
    const fetchCurrentId = async () => {
      try {
        console.log('What is the currentProfile', currentProfile)
        const id = currentProfile?.id
        if (!id) {
          console.log('Cant find the id')
        } else setProfileId(id)
      } catch (error) {
        console.error('Error fetching quests:', error)
        throw error
      }
    }
    const fetchCurrentUser = async () => {
      try {
        const fetchedName = currentProfile?.full_name
        if (fetchedName === undefined || !fetchedName) {
          setSeekerName('Update Name')
        } else setSeekerName(fetchedName)
      } catch (error) {
        console.error('Error fetching quests:', error)
        throw error
      }
    }
    const fetchCurrentEmail = async () => {
      try {
        const fetchedEmail = currentProfile?.email
        if (fetchedEmail === undefined || !fetchedEmail) {
          setSeekerEmail('Update Email')
        } else setSeekerEmail(fetchedEmail)
      } catch (error) {
        console.error('Error fetching quests:', error)
        throw error
      }
    }
    const fetchCurrentPhone = async () => {
      try {
        const fetchedPhone = currentProfile?.primary_contact_phone
        if (fetchedPhone === undefined || !fetchedPhone) {
          setSeekerPhone('Update Phone')
        } else setSeekerPhone(fetchedPhone)
      } catch (error) {
        console.error('Error fetching quests:', error)
        throw error
      }
    }
    fetchCurrentId()
    fetchCurrentUser()
    fetchCurrentEmail()
    fetchCurrentPhone()
  }, [currentProfile])

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <CardContent>
          <div>
            <p>Name: {seekerName}</p>
            <p>Email: {seekerEmail}</p>
            <p>Phone: {seekerPhone}</p>
          </div>
          <Button onClick={toggleDetails}>Update Details</Button>
          {detailsVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg relative">
                <button
                  className="absolute top-2 right-2"
                  onClick={toggleDetails}
                >
                  ✖
                </button>

                <div className="flex flex-col gap-4">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={seekerName}
                    onChange={(e) => setSeekerName(e.target.value)}
                    className="border p-2 rounded"
                  />

                  <label>Phone:</label>
                  <input
                    type="text"
                    value={seekerPhone}
                    onChange={(e) => setSeekerPhone(e.target.value)}
                    className="border p-2 rounded"
                  />

                  <Button onClick={onUpdate}>Update</Button>
                </div>
              </div>
            </div>
          )}
          {error ? (
            <p>Failed to fetch quests...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {quests?.map((quest) => (
                <QuestListItem key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
