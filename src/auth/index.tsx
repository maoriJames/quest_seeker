import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const signInWithEmail = async () => {
    setLoading(true)
    try {
      // your Supabase / Amplify / API login call here
      console.log('Signing in with', email, password)
    } catch (err) {
      alert('Error signing in: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="container">
      <Card className="max-w-md mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <img
            src="src/assets/images/title_trans.png"
            alt="Title"
            className="w-48 mx-auto mb-4"
          />

          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="jon@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Label htmlFor="email">Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="input"
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={signInWithEmail}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </CardFooter>
      </Card>
      <Link to="/sign-up" className="text-button">
        Create an account
      </Link>
    </div>
  )
}
