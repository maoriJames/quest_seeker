import { useState } from 'react'
import { Link } from 'react-router-dom'

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
      {/* Title (instead of <Stack.Screen>) */}
      <h1 className="title">Sign in</h1>

      <img className="image" src="/assets/images/title_trans.png" alt="Logo" />

      <label className="label">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jon@gmail.com"
        className="input"
      />

      <label className="label">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••"
        className="input"
      />

      <button onClick={signInWithEmail} disabled={loading} className="button">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <Link to="/sign-up" className="text-button">
        Create an account
      </Link>
    </div>
  )
}
