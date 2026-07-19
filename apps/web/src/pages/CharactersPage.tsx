import { useQuery } from '@tanstack/react-query'
import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { listOwnedCharacters } from '../features/characters/characters'

export function CharactersPage() {
  const { identity } = useAuth()
  const characters = useQuery({
    queryKey: ['characters', identity?.id],
    queryFn: () => listOwnedCharacters(identity!.id),
    enabled: Boolean(identity),
  })
  return (
    <main className="dashboard-page simple-hub-page">
      <section className="dashboard-content">
        <div className="dashboard-heading compact-heading">
          <div>
            <p className="eyebrow">Your collection</p>
            <h1>Characters</h1>
            <p>Open a sheet or create a character from the Parties page.</p>
          </div>
          <Link className="card-link" to="/parties">
            Create a character
          </Link>
        </div>
        <div className="campaign-grid">
          {characters.data?.map((character) => (
            <Link
              className="campaign-card"
              to={`/characters/${character.id}`}
              key={character.id}
            >
              <UserRound aria-hidden="true" />
              <h2>{character.name}</h2>
              <p>
                {[character.ancestry, character.class_name]
                  .filter(Boolean)
                  .join(' · ') || 'Unwritten adventurer'}
              </p>
            </Link>
          ))}
          {!characters.isLoading && !characters.data?.length && (
            <div className="empty-state">
              <UserRound />
              <h2>No characters yet</h2>
              <p>Create your first character from Parties.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
