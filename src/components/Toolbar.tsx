import React from 'react'
import { Button } from '@/components/ui/button' // if you're using shadcn/ui or similar
import { cn } from '@/lib/utils' // optional helper for combining classes

interface ToolbarButton {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: 'default' | 'outline' | 'destructive' | 'ghost'
}

interface ToolbarProps {
  buttons: ToolbarButton[]
  className?: string
}

export const Toolbar: React.FC<ToolbarProps> = ({ buttons, className }) => {
  return (
    <div
      className={cn(
        'flex justify-evenly items-center w-full p-2 border rounded-md bg-black shadow-sm',
        className
      )}
    >
      {buttons.map((btn, i) => (
        <Button
          key={i}
          onClick={btn.onClick || (() => console.log(`${btn.label} clicked`))}
          variant={btn.variant || 'default'}
          className="flex items-center gap-2 bg-yellow-500 text-black-600"
        >
          {btn.icon}
          {btn.label}
        </Button>
      ))}
    </div>
  )
}
