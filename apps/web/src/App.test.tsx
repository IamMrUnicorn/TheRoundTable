import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: { claims: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  },
}))

import App from './App'

describe('App', () => {
  it('routes signed-out visitors to the magic-link sign-in screen', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /sign in with a magic link/i,
      }),
    ).toBeInTheDocument()
  })
})
