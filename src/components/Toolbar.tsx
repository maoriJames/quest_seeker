import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HiMenu, HiX } from 'react-icons/hi'

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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Toolbar */}
      <div className="hidden md:flex justify-evenly items-center w-full p-2 border rounded-md bg-black shadow-sm">
        {buttons.map((btn, i) => (
          <Button
            key={i}
            onClick={btn.onClick || (() => console.log(`${btn.label} clicked`))}
            variant={btn.variant || 'default'}
            className="flex items-center gap-2 bg-yellow-500 text-black hover:bg-yellow-600 transition"
          >
            {btn.icon}
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Mobile Toolbar Header */}
      <div className="flex md:hidden justify-between items-center p-2 border rounded-md bg-black shadow-sm">
        {/* <div className="text-white font-bold">Menu</div> */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          'flex flex-col md:hidden gap-2 mt-2 bg-black p-2 rounded-md shadow-sm overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {buttons.map((btn, i) => (
          <Button
            key={i}
            onClick={() => {
              btn.onClick?.()
              setIsOpen(false) // close menu after click
            }}
            variant={btn.variant || 'default'}
            className="flex items-center gap-2 bg-yellow-500 text-black hover:bg-yellow-600 transition w-full justify-center"
          >
            {btn.icon}
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
