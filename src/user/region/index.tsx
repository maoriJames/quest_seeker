// import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native'
// import { useState } from 'react'
import PickRegion from '../../components/pickRegion'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import logo from '@/assets/images/logo_trans.png'
import bg from '@/assets/images/background_main.png'
// import { useCurrentUserProfile } from '@/api/profiles'
// import { ActivityIndicator } from 'react-native-paper'

// type RouteParams = {
//   selectedRegion: string
// }

export default function RegionPage() {
  // const [selectedRegion, setSelectedRegion] = useState('')
  // const [seekerName, setSeekerName] = useState('')
  // const router = useRouter()
  // const {
  //   currentProfile,
  //   error,
  //   isLoading: currentLoading,
  // } = useCurrentUserProfile()
  // const findQuests = () => {
  //   router.push({ pathname: `/(user)/home`, params: { selectedRegion } })
  // }

  // const fetchCurrentName = async () => {
  //   try {
  //     const fetchedId = currentProfile?.full_name
  //     if (fetchedId === undefined) {
  //       throw new Error('my_quests is undefined')
  //     }
  //     return fetchedId
  //   } catch (error) {
  //     console.error('Error fetching quests:', error)
  //     throw error
  //   }
  // }

  // async function main() {
  //   try {
  //     if (!currentProfile) {
  //       // console.error('currentProfile is null or undefined')
  //       return
  //     }
  //     const currentName = await fetchCurrentName()
  //     setSeekerName(currentName)
  //   } catch (error) {
  //     console.log('Error:', error)
  //   }
  // }

  // main()

  // if (currentLoading) {
  //   return <ActivityIndicator />
  // }
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <CardContent>
          <p className="text-xl font-semibold mb-4">Welcome Back User!</p>

          <img
            src={logo}
            alt="logo"
            className="w-3/5 aspect-square mx-auto mb-6"
          />

          <PickRegion />

          <Link to="/user/home/">
            <Button className="w-full mt-6">Show me quests</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
