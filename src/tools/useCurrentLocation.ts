import { useEffect, useState } from 'react'

export function useCurrentLocation() {
  const [location, setLocation] = useState<{
    lat: number | null
    lng: number | null
    error?: string
  }>({
    lat: null,
    lng: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: 'Geolocation not supported' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => {
        setLocation((prev) => ({ ...prev, error: err.message }))
      },
      {
        enableHighAccuracy: true,
      }
    )
  }, [])

  return location
}
