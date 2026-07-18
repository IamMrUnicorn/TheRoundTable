import { supabase } from '../../lib/supabase'

export async function listUpcomingSessions(userId: string) {
  const [sessionsResult, attendanceResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*, campaigns(name, timezone)')
      .in('status', ['proposed', 'scheduled', 'active'])
      .gte('ends_at', new Date().toISOString())
      .order('starts_at')
      .limit(8),
    supabase
      .from('session_attendance')
      .select('session_id, response')
      .eq('user_id', userId),
  ])

  if (sessionsResult.error) throw sessionsResult.error
  if (attendanceResult.error) throw attendanceResult.error

  const responses = new Map(
    attendanceResult.data.map(({ response, session_id }) => [
      session_id,
      response,
    ]),
  )

  return sessionsResult.data.map((session) => ({
    ...session,
    attendanceResponse: responses.get(session.id) ?? 'unanswered',
  }))
}

export async function getSchedule(campaignId: number) {
  const [rules, exceptions, sessions, attendance] = await Promise.all([
    supabase
      .from('availability_rules')
      .select('*, profiles(display_name)')
      .eq('campaign_id', campaignId)
      .order('weekday')
      .order('start_minute'),
    supabase
      .from('availability_exceptions')
      .select('*, profiles(display_name)')
      .eq('campaign_id', campaignId)
      .order('starts_at'),
    supabase
      .from('sessions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('starts_at'),
    supabase.from('session_attendance').select('*'),
  ])
  for (const result of [rules, exceptions, sessions, attendance])
    if (result.error) throw result.error
  return {
    rules: rules.data ?? [],
    exceptions: exceptions.data ?? [],
    sessions: sessions.data ?? [],
    attendance: attendance.data ?? [],
  }
}

export async function addAvailabilityRule(input: {
  campaignId: number
  userId: string
  weekday: number
  startMinute: number
  endMinute: number
  preference: string
}) {
  const { error } = await supabase.from('availability_rules').insert({
    campaign_id: input.campaignId,
    user_id: input.userId,
    weekday: input.weekday,
    start_minute: input.startMinute,
    end_minute: input.endMinute,
    preference: input.preference,
  })
  if (error) throw error
}

export async function deleteAvailabilityRule(id: number) {
  const { error } = await supabase
    .from('availability_rules')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function addAvailabilityException(input: {
  campaignId: number
  userId: string
  startsAt: string
  endsAt: string
  availability: string
  note: string
}) {
  const { error } = await supabase.from('availability_exceptions').insert({
    campaign_id: input.campaignId,
    user_id: input.userId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    availability: input.availability,
    note: input.note.trim(),
  })
  if (error) throw error
}

export async function deleteAvailabilityException(id: number) {
  const { error } = await supabase
    .from('availability_exceptions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function createSession(input: {
  campaignId: number
  userId: string
  title: string
  agenda: string
  startsAt: string
  endsAt: string
}) {
  const { error } = await supabase.from('sessions').insert({
    campaign_id: input.campaignId,
    created_by: input.userId,
    title: input.title.trim(),
    agenda: input.agenda.trim(),
    starts_at: input.startsAt,
    ends_at: input.endsAt,
  })
  if (error) throw error
}

export async function respondToSession(
  sessionId: number,
  userId: string,
  response: string,
) {
  const { error } = await supabase.from('session_attendance').upsert(
    {
      session_id: sessionId,
      user_id: userId,
      response,
      responded_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,user_id' },
  )
  if (error) throw error
}

export async function updateSession(
  sessionId: number,
  updates: { ends_at?: string; starts_at?: string; status?: string },
) {
  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
  if (error) throw error
}
