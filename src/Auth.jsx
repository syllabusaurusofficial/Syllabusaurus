import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage(
        mode === 'login'
          ? 'Login successful.'
          : 'Account created. Check your email if confirmation is required.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Syllabusaurus</h1>
        <p>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
          </button>
        </form>

        {message && <p>{message}</p>}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setMessage('')
          }}
        >
          {mode === 'login'
            ? 'Create a new account'
            : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}
