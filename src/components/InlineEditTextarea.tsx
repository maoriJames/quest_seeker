import { useState, useEffect } from 'react'
import { Button } from '@aws-amplify/ui-react'

interface InlineEditTextareaProps {
  label: string
  value: string
  onSave: (newValue: string) => void
  required?: boolean
}

export default function InlineEditTextarea({
  label,
  value,
  onSave,
  required = false,
}: InlineEditTextareaProps) {
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
            <textarea
              className={`border p-1 rounded flex-1 ${error ? 'border-red-500' : ''}`}
              rows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleSave}
            />
            <Button size="small" onClick={handleSave}>
              Save
            </Button>
          </>
        ) : (
          <textarea
            className={`border p-1 rounded flex-1 ${error ? 'border-red-500' : ''}`}
            rows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
          />
        )}
      </div>
    </div>
  )
}
