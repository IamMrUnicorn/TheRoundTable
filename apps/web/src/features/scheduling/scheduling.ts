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

export async function getNextCampaignSession(campaignId: number) {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .in('status', ['proposed', 'scheduled', 'active'])
    .gte('ends_at', new Date().toISOString())
    .order('starts_at')
    .limit(1)
    .maybeSingle()

  if (sessionError) throw sessionError
  if (!session) return null

  const { data: attendance, error: attendanceError } = await supabase
    .from('session_attendance')
    .select('response, user_id')
    .eq('session_id', session.id)

  if (attendanceError) throw attendanceError
  return { ...session, attendance: attendance ?? [] }
}

export async function getCampaignAvailabilitySummary(campaignId: number) {
  const [membersResult, rulesResult, exceptionsResult] = await Promise.all([
    supabase
      .from('campaign_members')
      .select('user_id')
      .eq('campaign_id', campaignId)
      .eq('status', 'active'),
    supabase
      .from('availability_rules')
      .select('preference, user_id')
      .eq('campaign_id', campaignId),
    supabase
      .from('availability_exceptions')
      .select('availability, user_id')
      .eq('campaign_id', campaignId)
      .gte('ends_at', new Date().toISOString()),
  ])

  if (membersResult.error) throw membersResult.error
  if (rulesResult.error) throw rulesResult.error
  if (exceptionsResult.error) throw exceptionsResult.error

  const activeMembers = new Set(
    membersResult.data.map((member) => member.user_id),
  )
  const exceptionCounts = { available: 0, preferred: 0, unavailable: 0 }
  for (const exception of exceptionsResult.data) {
    if (
      activeMembers.has(exception.user_id) &&
      exception.availability in exceptionCounts
    )
      exceptionCounts[exception.availability as keyof typeof exceptionCounts] +=
        1
  }

  const activeRules = rulesResult.data.filter((rule) =>
    activeMembers.has(rule.user_id),
  )

  return {
    configuredMembers: new Set(activeRules.map((rule) => rule.user_id)).size,
    preferredWindows: activeRules.filter(
      (rule) => rule.preference === 'preferred',
    ).length,
    exceptionCounts,
  }
}

export async function listCampaignSessionHistory(campaignId: number) {
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .in('status', ['completed', 'cancelled'])
    .order('starts_at', { ascending: false })
    .limit(8)

  if (sessionsError) throw sessionsError
  if (!sessions.length) return []

  const sessionIds = sessions.map((session) => session.id)
  const { data: attendance, error: attendanceError } = await supabase
    .from('session_attendance')
    .select('response, session_id')
    .in('session_id', sessionIds)

  if (attendanceError) throw attendanceError

  return sessions.map((session) => {
    const responses = (attendance ?? []).filter(
      (response) => response.session_id === session.id,
    )
    return {
      ...session,
      attending: responses.filter(
        (response) => response.response === 'attending',
      ).length,
      responses: responses.length,
    }
  })
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
