import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

export default function HomeButton() {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/user/region')
  }
  return (
    <Button onClick={handleClick} size="default" className="px-4 py-2">
      Home
    </Button>
  )
}
