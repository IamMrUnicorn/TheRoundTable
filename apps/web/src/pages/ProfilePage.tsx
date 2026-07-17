import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Dices } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { getOwnProfile, updateOwnProfile } from '../features/profiles/profiles'

export function ProfilePage() {
  const { identity } = useAuth()
  const queryClient = useQueryClient()
  const profile = useQuery({
    queryKey: ['profile', identity?.id],
    queryFn: () => getOwnProfile(identity!.id),
    enabled: Boolean(identity),
  })
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  )
  useEffect(() => {
    if (profile.data) {
      setDisplayName(profile.data.display_name)
      setTimezone(profile.data.timezone)
    }
  }, [profile.data])
  const save = useMutation({
    mutationFn: () => updateOwnProfile(identity!.id, displayName, timezone),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
  return (
    <main className="dashboard-page">
      <header className="app-header">
        <Link to="/" className="brand-mark">
          <Dices />
          <span>The Round Table</span>
        </Link>
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Dashboard
        </Link>
      </header>
      <section className="profile-page">
        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            save.mutate()
          }}
        >
          <p className="eyebrow">Your account</p>
          <h1>Profile & preferences</h1>
          <label>
            Display name
            <input
              required
              minLength={1}
              maxLength={80}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          <label>
            Timezone
            <input
              required
              maxLength={100}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            />
            <span>Use an IANA timezone such as America/New_York.</span>
          </label>
          {save.isSuccess && (
            <p className="form-message success">Profile saved.</p>
          )}
          {save.isError && (
            <p className="form-message error">Unable to save your profile.</p>
          )}
          <button disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>
    </main>
  )
}
