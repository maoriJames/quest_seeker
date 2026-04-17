import { useRef, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

// 1. Updated interface to handle both values
interface BankDetails {
  accountName: string
  accountNumber: string
}

interface BankInputProps {
  onComplete: (details: BankDetails) => void
  initialValue?: string // Format: "Name|00-0000-0000000-00"
}

export const SegmentedBankInput = ({
  onComplete,
  initialValue,
}: BankInputProps) => {
  const [accountName, setAccountName] = useState('')
  const [segments, setSegments] = useState({
    bank: '',
    branch: '',
    account: '',
    suffix: '',
  })

  const refs = {
    bank: useRef<HTMLInputElement>(null),
    branch: useRef<HTMLInputElement>(null),
    account: useRef<HTMLInputElement>(null),
    suffix: useRef<HTMLInputElement>(null),
  }

  // 2. Updated useEffect to handle pre-filling name and number
  useEffect(() => {
    if (initialValue && initialValue.includes('|')) {
      const [name, fullNumber] = initialValue.split('|')
      setAccountName(name)
      const parts = fullNumber.split('-')
      setSegments({
        bank: parts[0] || '',
        branch: parts[1] || '',
        account: parts[2] || '',
        suffix: parts[3] || '',
      })
    }
  }, [initialValue])

  // Helper to sync changes back to the parent
  const emitChange = (
    currentName: string,
    currentSegments: typeof segments,
  ) => {
    onComplete({
      accountName: currentName,
      accountNumber: `${currentSegments.bank}-${currentSegments.branch}-${currentSegments.account}-${currentSegments.suffix}`,
    })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setAccountName(newName)
    emitChange(newName, segments)
  }

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof segments,
    maxLength: number,
    nextKey: keyof typeof segments | null,
  ) => {
    const val = e.target.value.replace(/\D/g, '')
    const updatedSegments = { ...segments, [key]: val }
    setSegments(updatedSegments)

    if (val.length >= maxLength && nextKey) {
      refs[nextKey].current?.focus()
    }

    emitChange(accountName, updatedSegments)
  }

  return (
    <div className="flex flex-col gap-4">
      {' '}
      {/* Increased gap for layout */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Name of Account
        </label>
        <Input
          className="w-full max-w-sm"
          placeholder="e.g. J SMITH"
          value={accountName}
          onChange={handleNameChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Bank Account Number
        </label>
        <div className="flex items-center gap-1 md:gap-2">
          <Input
            ref={refs.bank}
            className="w-12 px-1 text-center"
            placeholder="00"
            maxLength={2}
            inputMode="numeric"
            value={segments.bank}
            onChange={(e) => handleNumberChange(e, 'bank', 2, 'branch')}
          />
          <span className="text-gray-400">-</span>
          <Input
            ref={refs.branch}
            className="w-16 px-1 text-center"
            placeholder="0000"
            maxLength={4}
            inputMode="numeric"
            value={segments.branch}
            onChange={(e) => handleNumberChange(e, 'branch', 4, 'account')}
          />
          <span className="text-gray-400">-</span>
          <Input
            ref={refs.account}
            className="w-28 px-1 text-center"
            placeholder="0000000"
            maxLength={7}
            inputMode="numeric"
            value={segments.account}
            onChange={(e) => handleNumberChange(e, 'account', 7, 'suffix')}
          />
          <span className="text-gray-400">-</span>
          <Input
            ref={refs.suffix}
            className="w-14 px-1 text-center"
            placeholder="00"
            maxLength={3}
            inputMode="numeric"
            value={segments.suffix}
            onChange={(e) => handleNumberChange(e, 'suffix', 3, null)}
          />
        </div>
      </div>
    </div>
  )
}
