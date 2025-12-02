import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'

export default function Leader() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4">
          <div>Leader Board</div>
        </CardContent>
      </Card>
    </div>
  )
}
