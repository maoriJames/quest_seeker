import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HiMenu, HiX } from 'react-icons/hi'

interface ToolbarButton {
  label: React.ReactNode
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

      {/* Mobile Slide-In Menu Under Header */}
      <div className="fixed inset-x-0 top-0 z-40 md:hidden">
        {/* Keep toolbar visible on top */}
        <div className="relative z-50">
          <div className="flex justify-between items-center p-2 border rounded-md bg-black shadow-sm">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-yellow-500 focus:outline-none"
            >
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Content area BELOW toolbar */}
        <div className="relative z-40">
          {/* Backdrop below the toolbar */}
          <div
            onClick={() => setIsOpen(false)}
            className={cn(
              'absolute inset-x-0 top-0 bottom-0 bg-black/50 transition-opacity',
              isOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            )}
          />

          <div
            className={cn(
              'absolute top-[56px] left-0 h-[calc(100%-56px)] w-64 transition-transform',
              isOpen ? 'translate-x-0' : '-translate-x-[280px]'
            )}
          >
            {/* Background behind buttons */}
            <div className="absolute inset-0 bg-black shadow-lg rounded-md"></div>

            {/* Button container */}
            <div className="relative z-10 flex flex-col gap-2 p-4">
              {buttons.map((btn, i) => (
                <Button
                  key={i}
                  onClick={() => {
                    btn.onClick?.()
                    setIsOpen(false)
                  }}
                  variant={btn.variant || 'default'}
                  className="flex items-center gap-2 bg-yellow-500 text-black hover:bg-yellow-600 transition w-full justify-start"
                >
                  {btn.icon}
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
