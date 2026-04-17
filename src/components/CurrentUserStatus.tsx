import type { Profile } from '@/types'
import { Button } from './ui/button'
import { useState } from 'react'
import { SegmentedBankInput } from './SegmentedBankInput'
import InlineEditField from './InlineEditField'
import InlineEditTextarea from './InlineEditTextarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useBecomePending } from '@/hooks/useBecomePending'

type ProfileProps = {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
  isProfileComplete: boolean
}

export default function CurrentUserStatus({
  profile,
  onUpdate,
  isProfileComplete,
}: ProfileProps) {
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
  })

  const { submitApplication, isSending } = useBecomePending()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bankDetails.accountName || bankDetails.accountNumber.length < 15) {
      alert('Please enter both the account name and a valid account number.')
      return
    }

    const result = await submitApplication(
      profile,
      bankDetails,
      isProfileComplete,
      onUpdate,
    )

    if (result.success) {
      alert(
        isProfileComplete
          ? 'Bank details sent to admin for verification!'
          : 'Application submitted successfully!',
      )
    } else {
      alert(`Failed to send: ${result.error}`)
    }
  }
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mb-2">
      {/* Pending-only fields */}
      {profile.role === 'pending' && (
        <>
          <div>
            <p>
              Thanks, your application is under review and you will be notified
              when it is reviewed as soon as possible.
            </p>
          </div>
        </>
      )}
      {/* Creator-only fields */}
      {profile.role === 'creator' && (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <SegmentedBankInput onComplete={setBankDetails} initialValue={''} />

            <Button
              type="submit"
              disabled={!isProfileComplete || isSending}
              variant={!isProfileComplete ? 'outline' : 'default'}
            >
              {isSending ? 'Sending...' : 'Submit Bank Details'}
            </Button>
          </form>
        </>
      )}
      {profile.role === 'seeker' && (
        <div className="mb-3 rounded bg-red-100 p-4 text-sm text-red-700 space-y-4">
          <p className="font-bold text-lg">Creator Application Details</p>
          <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
            <>
              <InlineEditField
                label="Organisation Name"
                value={profile.organization_name || ''}
                onSave={(newValue) => onUpdate({ organization_name: newValue })}
                required
              />

              <label className="text-base font-bold">Business Type</label>

              <Select
                key={profile.business_type ?? 'empty'}
                value={profile.business_type || ''}
                onValueChange={(newValue) =>
                  onUpdate({ business_type: newValue })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Business Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registered Company">
                    Registered Company
                  </SelectItem>
                  <SelectItem value="Small Business">Small Business</SelectItem>
                  <SelectItem value="Charitable Trust">
                    Charitable Trust
                  </SelectItem>
                  <SelectItem value="Not for Profit">Not for Profit</SelectItem>
                  <SelectItem value="Whanau Fund Raising">
                    Whanau Fund Raising
                  </SelectItem>
                  <SelectItem value="Registered Charity">
                    Registered Charity
                  </SelectItem>
                </SelectContent>
              </Select>

              {profile.business_type === 'Registered Company' && (
                <InlineEditField
                  label="Registration Number"
                  value={profile.registration_number || ''}
                  onSave={(newValue) =>
                    onUpdate({ registration_number: newValue })
                  }
                  required
                />
              )}

              {profile.business_type === 'Registered Charity' && (
                <InlineEditField
                  label="Registered Charity Number"
                  value={profile.charity_number || ''}
                  onSave={(newValue) => onUpdate({ charity_number: newValue })}
                  required
                />
              )}

              <InlineEditTextarea
                label="Organisation Description"
                value={profile.organization_description || ''}
                onSave={(newValue) =>
                  onUpdate({ organization_description: newValue })
                }
                required
              />

              <InlineEditField
                label="Primary Contact Name"
                value={profile.primary_contact_name || ''}
                onSave={(newValue) =>
                  onUpdate({ primary_contact_name: newValue })
                }
                required
              />
              <InlineEditField
                label="Primary Contact Position"
                value={profile.primary_contact_position || ''}
                onSave={(newValue) =>
                  onUpdate({ primary_contact_position: newValue })
                }
                required
              />
              <InlineEditField
                label="Primary Contact Phone"
                value={profile.primary_contact_phone || ''}
                onSave={(newValue) =>
                  onUpdate({ primary_contact_phone: newValue })
                }
                required
              />
              <InlineEditField
                label="Secondary Contact Name"
                value={profile.secondary_contact_name || ''}
                onSave={(newValue) =>
                  onUpdate({ secondary_contact_name: newValue })
                }
              />
              <InlineEditField
                label="Secondary Contact Position"
                value={profile.secondary_contact_position || ''}
                onSave={(newValue) =>
                  onUpdate({ secondary_contact_position: newValue })
                }
              />
              <InlineEditField
                label="Secondary Contact Phone"
                value={profile.secondary_contact_phone || ''}
                onSave={(newValue) =>
                  onUpdate({ secondary_contact_phone: newValue })
                }
              />
            </>
          </div>
          <hr className="border-red-200" />
          {/* Integrated Bank Section */}
          <div className="space-y-2">
            <label className="text-base font-bold text-black">
              Payout Details
            </label>
            <p className="text-xs text-red-600 mb-2 italic">
              * Bank details are not stored and are sent securely to admin for
              verification.
            </p>

            <div className="bg-white/50 p-3 rounded-lg border border-red-200">
              <SegmentedBankInput
                onComplete={setBankDetails}
                initialValue={''}
              />
            </div>
          </div>

          {/* Final Submission Button */}
          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              disabled={
                !isProfileComplete ||
                !bankDetails.accountName ||
                bankDetails.accountNumber.length < 15 ||
                isSending
              }
              onClick={handleSubmit}
            >
              {isSending
                ? 'Sending Application...'
                : 'Submit Final Application'}
            </Button>

            {!isProfileComplete && (
              <p className="text-[10px] mt-2 text-center text-red-500 uppercase font-bold">
                Please complete all required fields above to submit
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
