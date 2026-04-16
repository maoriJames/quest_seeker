import InlineEditField from './InlineEditField'
import InlineEditTextarea from './InlineEditTextarea'
import type { Profile } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

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
            onValueChange={(newValue) => onUpdate({ business_type: newValue })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Registered Company">
                Registered Company
              </SelectItem>
              <SelectItem value="Small Business">Small Business</SelectItem>
              <SelectItem value="Charitable Trust">Charitable Trust</SelectItem>
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
              onSave={(newValue) => onUpdate({ registration_number: newValue })}
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
            onSave={(newValue) => onUpdate({ primary_contact_name: newValue })}
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
            onSave={(newValue) => onUpdate({ primary_contact_phone: newValue })}
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
      )}
      {!isProfileComplete && (
        <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
          Please complete:
          <ul className="list-disc ml-5">
            {!profile.full_name && <li>Name</li>}
            {!profile.phone && <li>Phone</li>}
            {!profile.about_me && <li>About Me</li>}
            {profile.role === 'creator' && !profile.organization_name && (
              <li>Organisation Name</li>
            )}
            {profile.role === 'creator' && !profile.business_type && (
              <li>Business Type</li>
            )}
            {profile.role === 'creator' &&
              profile.business_type === 'Registered Company' &&
              !profile.registration_number && <li>Registration Number</li>}

            {profile.role === 'creator' &&
              profile.business_type === 'Registered Charity' &&
              !profile.charity_number && <li>Registered Charity Number</li>}
            {profile.role === 'creator' &&
              !profile.organization_description && (
                <li>Organization Description</li>
              )}
            {profile.role === 'creator' && !profile.primary_contact_name && (
              <li>Primary Contact Name</li>
            )}
            {profile.role === 'creator' &&
              !profile.primary_contact_position && (
                <li>Primary Contact Position</li>
              )}
            {profile.role === 'creator' && !profile.primary_contact_phone && (
              <li>Primary Contact Phone</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
