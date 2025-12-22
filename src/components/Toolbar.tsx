import React, { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { HiMenu, HiX } from 'react-icons/hi'

interface ToolbarProps {
  children: ReactNode
  className?: string
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop */}
      <div className="hidden md:flex justify-evenly items-center w-full p-2 border rounded-md bg-black shadow-sm">
        {children}
      </div>

      {/* Mobile header */}
      <div className="md:hidden relative z-50 bg-black p-2 shadow-sm flex justify-between items-center">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="text-yellow-500 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Slide-in panel */}
        <div
          className={cn(
            'absolute top-[56px] left-0 w-64 p-4 bg-black rounded-r-xl shadow-xl transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-[120%]'
          )}
        >
          <div className="flex flex-col gap-2" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
