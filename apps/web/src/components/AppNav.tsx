import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Shield, UserRound, Users } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { listCampaigns } from '../features/campaigns/campaigns'
import { listUpcomingSessions } from '../features/scheduling/scheduling'
import { BrandLogo } from './BrandLogo'

const eighteenHours = 18 * 60 * 60 * 1000

export function AppNav() {
  const { identity } = useAuth()
  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })
  const sessions = useQuery({
    queryKey: ['upcoming-sessions', identity?.id],
    queryFn: () => listUpcomingSessions(identity!.id),
    enabled: Boolean(identity),
    refetchInterval: 60_000,
  })

  if (!identity) return null

  const now = Date.now()
  const eligible = sessions.data
    ?.filter(
      (session) =>
        ['active', 'paused'].includes(session.status) ||
        (new Date(session.starts_at).getTime() >= now &&
          new Date(session.starts_at).getTime() <= now + eighteenHours),
    )
    .sort((a, b) => {
      if (
        ['active', 'paused'].includes(a.status) &&
        !['active', 'paused'].includes(b.status)
      )
        return -1
      if (
        ['active', 'paused'].includes(b.status) &&
        !['active', 'paused'].includes(a.status)
      )
        return 1
      return Date.parse(a.starts_at) - Date.parse(b.starts_at)
    })[0]
  const role = campaigns.data?.find(
    (campaign) => campaign.id === eligible?.campaign_id,
  )?.membershipRole
  const currentLabel = eligible
    ? role === 'owner' || role === 'game_master'
      ? ['active', 'paused'].includes(eligible.status)
        ? 'Live session'
        : 'DM prep'
      : ['active', 'paused'].includes(eligible.status)
        ? 'Live session'
        : 'Waiting room'
    : 'Current session'

  return (
    <header className="global-app-nav">
      <Link to="/" className="brand-mark" aria-label="The Round Table home">
        <BrandLogo />
        <span>The Round Table</span>
      </Link>
      <nav aria-label="Primary navigation">
        <NavLink to="/characters">
          <UserRound size={17} /> Characters
        </NavLink>
        <NavLink to="/parties">
          <Users size={17} /> Parties
        </NavLink>
        <NavLink to="/calendar">
          <CalendarDays size={17} /> Calendar
        </NavLink>
        {eligible ? (
          <NavLink
            className="current-session-link"
            to={`/campaigns/${eligible.campaign_id}/sessions/${eligible.id}`}
          >
            <Shield size={17} /> {currentLabel}
          </NavLink>
        ) : (
          <span
            className="disabled-nav-link"
            title="No session is active or starting within 18 hours"
          >
            <Shield size={17} /> Current session
          </span>
        )}
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </header>
  )
}
