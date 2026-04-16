import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function CreatorApplicationForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    experienceLevel: '',
    questIdeas: '',
    whyCreator: '',
    portfolio: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Submit the application to your backend
      // This should create a record with status: 'pending'
      // await submitCreatorApplication(formData)

      // Show success message and redirect
      navigate('/application-submitted')
    } catch (err) {
      console.error('Failed to submit application:', err)
      alert('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Apply to Become a Creator</CardTitle>
          <CardDescription>
            Tell us about yourself and why you'd like to create quests. An admin
            will review your application and notify you of their decision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Input
                id="experienceLevel"
                placeholder="E.g., Beginner, Intermediate, Expert"
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData({ ...formData, experienceLevel: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="questIdeas">Quest Ideas</Label>
              <Textarea
                id="questIdeas"
                placeholder="Share 2-3 quest ideas you'd like to create..."
                value={formData.questIdeas}
                onChange={(e) =>
                  setFormData({ ...formData, questIdeas: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="whyCreator">
                Why do you want to become a creator?
              </Label>
              <Textarea
                id="whyCreator"
                placeholder="Tell us your motivation..."
                value={formData.whyCreator}
                onChange={(e) =>
                  setFormData({ ...formData, whyCreator: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio/Links (Optional)</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://..."
                value={formData.portfolio}
                onChange={(e) =>
                  setFormData({ ...formData, portfolio: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
