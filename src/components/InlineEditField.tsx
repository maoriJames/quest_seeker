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
              onBlur={handleSave} // optional: auto-save on blur
              autoFocus
              className={`border p-1 rounded flex-1 ${error ? 'border-red-500' : ''}`}
            />
            <Button size="small" onClick={handleSave}>
              Save
            </Button>
          </>
        ) : (
          <input
            type="text"
            value={inputValue}
            placeholder="Click to update"
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave} // optional: auto-save on blur
            autoFocus
            className={`border p-1 rounded flex-1 ${error ? 'border-red-500' : ''}`}
          />
        )}
      </div>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  )
}
