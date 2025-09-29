import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'

type AddQuestButtonProps = {
  to: string
}

export default function AddQuestButton({ to }: AddQuestButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return (
    <div className="absolute top-4 right-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleClick}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Create a quest</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Create a quest</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
