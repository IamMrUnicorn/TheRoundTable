import { type FormEvent, useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { BrandLogo } from '../components/BrandLogo'

export function SignInPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (signInError) {
      setError(signInError.message)
    } else {
      setMessage('Your invitation is on its way. Check your email to enter.')
      setEmail('')
    }

    setIsSubmitting(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-labelledby="welcome-title">
        <div className="brand-mark">
          <BrandLogo />
          <span>The Round Table</span>
        </div>
        <div>
          <p className="eyebrow">A shared home for every adventure</p>
          <h1 id="welcome-title">Gather your party. Tell your story.</h1>
          <p className="lede">
            Build heroes, prepare encounters, and keep every player connected
            from the first roll to the final chapter.
          </p>
        </div>
        <p className="edition-label">V5 · A new campaign begins</p>
      </section>

      <section className="auth-panel" aria-labelledby="sign-in-title">
        <div className="auth-card">
          <p className="eyebrow">Take your seat</p>
          <h2 id="sign-in-title">Sign in with a magic link</h2>
          <p>
            No password to remember. We’ll send a secure link to your inbox.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className="input-shell">
              <Mail aria-hidden="true" size={19} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="adventurer@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send magic link'}
              {!isSubmitting && <ArrowRight aria-hidden="true" size={18} />}
            </button>
          </form>

          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
        </div>
      </section>
    </main>
  )
}
