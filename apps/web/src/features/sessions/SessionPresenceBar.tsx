import { Circle, Clock3, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../../lib/supabase'

type PresenceMember = { displayName: string; userId: string }

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')
}

export function SessionPresenceBar({
  displayName,
  members,
  sessionId,
  startsAt,
  status,
  userId,
}: {
  displayName: string
  members: PresenceMember[]
  sessionId: number
  startsAt: string
  status: string
  userId: string
}) {
  const [connection, setConnection] = useState('connecting')
  const [onlineIds, setOnlineIds] = useState<string[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const channel = supabase.channel(`session-presence:${sessionId}`, {
      config: { presence: { key: userId } },
    })
    const sync = () => {
      const state = channel.presenceState<Record<string, unknown>>()
      setOnlineIds(Object.keys(state))
    }
    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe(async (nextStatus) => {
        setConnection(nextStatus.toLowerCase())
        if (nextStatus === 'SUBSCRIBED') {
          setConnection('live')
          await channel.track({
            displayName,
            joinedAt: new Date().toISOString(),
            userId,
          })
        }
      })
    return () => {
      void channel.untrack()
      void supabase.removeChannel(channel)
    }
  }, [displayName, sessionId, userId])

  const sortedMembers = useMemo(
    () =>
      [...members].sort(
        (a, b) =>
          Number(onlineIds.includes(b.userId)) -
            Number(onlineIds.includes(a.userId)) ||
          a.displayName.localeCompare(b.displayName),
      ),
    [members, onlineIds],
  )
  const difference = now - Date.parse(startsAt)

  return (
    <section className="session-presence-bar" aria-label="Session presence">
      <div className={`presence-connection ${connection}`}>
        {connection === 'live' ? <Wifi /> : <WifiOff />}
        <span>{connection === 'live' ? 'Room connected' : connection}</span>
      </div>
      <div className="presence-members">
        {sortedMembers.map((member) => {
          const online = onlineIds.includes(member.userId)
          return (
            <span key={member.userId} className={online ? 'online' : ''}>
              <Circle fill="currentColor" /> {member.displayName}
            </span>
          )
        })}
      </div>
      <div className="session-clock">
        <Clock3 />
        <span>
          {difference >= 0 ? 'Elapsed' : 'Starts in'}{' '}
          <strong>{formatDuration(Math.abs(difference))}</strong>
          {status === 'paused' && ' · paused'}
        </span>
      </div>
    </section>
  )
}
