import { useState, useEffect } from 'react'
import { Button } from '@aws-amplify/ui-react'

interface InlineEditFieldProps {
  label: string
  value: string
  onSave: (newValue: string) => void
  required?: boolean
}

export default function InlineEditField({
  label,
  value,
  onSave,
  required = false,
}: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [error, setError] = useState('')

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSave = () => {
    if (required && !inputValue.trim()) {
      setError(`${label} is required`)
      return
    }
    setError('')
    onSave(inputValue)
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <strong>{label}:</strong>
        {editing ? (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`border p-1 rounded flex-1 ${error ? 'border-red-500' : ''}`}
              autoFocus
            />
            <Button size="small" onClick={handleSave}>
              Save
            </Button>
          </>
        ) : (
          <div
            className="flex-1 cursor-pointer border p-1 rounded bg-gray-50"
            onClick={() => setEditing(true)}
          >
            {inputValue || (
              <span className="text-gray-400">Click to update</span>
            )}
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  )
}
