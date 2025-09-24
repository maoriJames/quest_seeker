import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/userProfiles'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import bg from '@/assets/images/background_main.png'
import { useNavigate } from 'react-router-dom'

export default function AccountPage() {
  const { currentProfile } = useCurrentUserProfile()
  const { mutate: updateProfile } = useUpdateProfile({
    onSuccess: () => {
      setDetailsVisible(false)
      window.alert('Profile updated successfully!')
    },
  })

  const [detailsVisible, setDetailsVisible] = useState(false)
  const [profileId, setProfileId] = useState('')
  const [seekerName, setSeekerName] = useState('')
  const [seekerPhone, setSeekerPhone] = useState('')

  // Load current profile data when it changes
  useEffect(() => {
    if (!currentProfile) return
    setProfileId(currentProfile.id)
    setSeekerName(currentProfile.full_name ?? 'Update Name')
    setSeekerPhone(currentProfile.primary_contact_phone ?? 'Update Phone')
  }, [currentProfile])

  const toggleDetails = () => setDetailsVisible(!detailsVisible)

  const navigate = useNavigate()

  const onUpdate = () => {
    if (!profileId) return
    updateProfile({
      input: {
        id: profileId,
        full_name: seekerName,
        primary_contact_phone: seekerPhone,
      },
    })
  }

  const onReturn = () => {
    navigate('/user/region')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <CardContent>
          <div>
            <p>Name: {seekerName}</p>
            <p>Phone: {seekerPhone}</p>
          </div>
          <Button onClick={toggleDetails}>Update Details</Button>
          <Button onClick={onReturn}>Return to Quest Page</Button>
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
        </CardContent>
      </Card>
    </div>
  )
}
