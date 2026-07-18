import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'

const status = JSON.parse(
  execFileSync('./node_modules/.bin/supabase', ['status', '--output', 'json'], {
    encoding: 'utf8',
  }),
)

async function request(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`${status.API_URL}${path}`, {
    method,
    headers: {
      apikey: status.PUBLISHABLE_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Prefer: 'return=representation',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  return { data, response }
}

async function signUp(email) {
  const { data, response } = await request('/auth/v1/signup', {
    body: { email, password: 'local-test-password' },
    method: 'POST',
  })

  assert.equal(response.status, 200)
  assert.ok(data.access_token)
  assert.ok(data.user?.id)

  return { id: data.user.id, token: data.access_token }
}

const runId = Date.now()
const ownerEmail = `owner-${runId}@example.com`
const owner = await signUp(ownerEmail)
const outsider = await signUp(`outsider-${runId}@example.com`)
const inviteeEmail = `invitee-${runId}@example.com`
const invitee = await signUp(inviteeEmail)

const { data: ownProfile, response: ownProfileResponse } = await request(
  '/rest/v1/profiles?select=id,display_name',
  { token: owner.token },
)
assert.equal(ownProfileResponse.status, 200)
assert.deepEqual(ownProfile, [
  { id: owner.id, display_name: ownerEmail.split('@')[0] },
])

const { data: campaignRows, response: campaignResponse } = await request(
  '/rest/v1/campaigns',
  {
    token: owner.token,
    method: 'POST',
    body: {
      owner_id: owner.id,
      name: 'The First Table',
      slug: `the-first-table-${runId}`,
    },
  },
)
assert.equal(campaignResponse.status, 201)
assert.equal(campaignRows.length, 1)

const campaignId = campaignRows[0].id
assert.match(campaignRows[0].invite_code, /^[A-F0-9]{8}$/)

const { data: ownerMembership, response: membershipResponse } = await request(
  `/rest/v1/campaign_members?campaign_id=eq.${campaignId}&user_id=eq.${owner.id}&select=role,status`,
  { token: owner.token },
)
assert.equal(membershipResponse.status, 200)
assert.deepEqual(ownerMembership, [{ role: 'owner', status: 'active' }])

const { data: invitationRows, response: invitationResponse } = await request('/rest/v1/campaign_invitations', {
  token: owner.token,
  method: 'POST',
  body: { campaign_id: campaignId, invited_by: owner.id, invited_email: inviteeEmail, role: 'observer' },
})
assert.equal(invitationResponse.status, 201)

const { data: inviteeInvitations, response: inviteeInvitationsResponse } = await request('/rest/v1/campaign_invitations?select=token,role,status', { token: invitee.token })
assert.equal(inviteeInvitationsResponse.status, 200)
assert.equal(inviteeInvitations[0].role, 'observer')

const { data: acceptedCampaignId, response: acceptInvitationResponse } = await request('/rest/v1/rpc/respond_campaign_invitation', { token: invitee.token, method: 'POST', body: { invitation_token: invitationRows[0].token, should_accept: true } })
assert.equal(acceptInvitationResponse.status, 200)
assert.equal(acceptedCampaignId, campaignId)

const { data: outsiderCampaigns, response: outsiderCampaignResponse } =
  await request('/rest/v1/campaigns?select=id', { token: outsider.token })
assert.equal(outsiderCampaignResponse.status, 200)
assert.deepEqual(outsiderCampaigns, [])

const { data: joinedCampaignId, response: joinResponse } = await request(
  '/rest/v1/rpc/join_campaign',
  {
    token: outsider.token,
    method: 'POST',
    body: { campaign_code: campaignRows[0].invite_code.toLowerCase() },
  },
)
assert.equal(joinResponse.status, 200)
assert.equal(joinedCampaignId, campaignId)

const { data: joinedCampaigns, response: joinedCampaignResponse } =
  await request('/rest/v1/campaigns?select=id', { token: outsider.token })
assert.equal(joinedCampaignResponse.status, 200)
assert.deepEqual(joinedCampaigns, [{ id: campaignId }])

const { data: sharedProfiles, response: sharedProfilesResponse } = await request(
  `/rest/v1/profiles?id=eq.${owner.id}&select=id,display_name`,
  { token: outsider.token },
)
assert.equal(sharedProfilesResponse.status, 200)
assert.deepEqual(sharedProfiles, [
  { id: owner.id, display_name: ownerEmail.split('@')[0] },
])

const { data: characterRows, response: characterResponse } = await request(
  '/rest/v1/characters',
  {
    token: owner.token,
    method: 'POST',
    body: {
      owner_id: owner.id,
      campaign_id: campaignId,
      name: 'Ember Vale',
      ancestry: 'Human',
      class_name: 'Fighter',
    },
  },
)
assert.equal(characterResponse.status, 201)
assert.equal(characterRows[0].name, 'Ember Vale')

const characterId = characterRows[0].id
const { data: partyCharacters, response: partyCharactersResponse } =
  await request(
    `/rest/v1/characters?campaign_id=eq.${campaignId}&select=id,name`,
    { token: outsider.token },
  )
assert.equal(partyCharactersResponse.status, 200)
assert.deepEqual(partyCharacters, [{ id: characterId, name: 'Ember Vale' }])

const { data: forbiddenCampaignUpdate, response: forbiddenCampaignUpdateResponse } =
  await request(`/rest/v1/campaigns?id=eq.${campaignId}`, {
    token: outsider.token,
    method: 'PATCH',
    body: { cadence: 'monthly' },
  })
assert.equal(forbiddenCampaignUpdateResponse.status, 200)
assert.deepEqual(forbiddenCampaignUpdate, [])

const { data: roleUpdate, response: roleUpdateResponse } = await request(
  `/rest/v1/campaign_members?campaign_id=eq.${campaignId}&user_id=eq.${outsider.id}`,
  {
    token: owner.token,
    method: 'PATCH',
    body: { role: 'game_master' },
  },
)
assert.equal(roleUpdateResponse.status, 200)
assert.equal(roleUpdate[0].role, 'game_master')

const { data: availabilityRows, response: availabilityResponse } = await request(
  '/rest/v1/availability_rules',
  {
    token: outsider.token,
    method: 'POST',
    body: { campaign_id: campaignId, user_id: outsider.id, weekday: 6, start_minute: 1080, end_minute: 1320, preference: 'preferred' },
  },
)
assert.equal(availabilityResponse.status, 201)
assert.equal(availabilityRows[0].weekday, 6)

const start = new Date(Date.now() + 86_400_000)
const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
const { data: sessionRows, response: sessionResponse } = await request('/rest/v1/sessions', {
  token: outsider.token,
  method: 'POST',
  body: { campaign_id: campaignId, created_by: outsider.id, title: 'The next chapter', starts_at: start.toISOString(), ends_at: end.toISOString() },
})
assert.equal(sessionResponse.status, 201)
assert.equal(sessionRows[0].title, 'The next chapter')

const { response: attendanceResponse } = await request('/rest/v1/session_attendance', {
  token: owner.token,
  method: 'POST',
  body: { session_id: sessionRows[0].id, user_id: owner.id, response: 'attending', responded_at: new Date().toISOString() },
})
assert.equal(attendanceResponse.status, 201)

const { data: announcementRows, response: announcementResponse } = await request('/rest/v1/campaign_announcements', {
  token: outsider.token,
  method: 'POST',
  body: { campaign_id: campaignId, author_id: outsider.id, title: 'Session update', body: 'Bring your characters.', is_pinned: true },
})
assert.equal(announcementResponse.status, 201)
assert.equal(announcementRows[0].is_pinned, true)

const { data: visibleAnnouncements, response: visibleAnnouncementsResponse } = await request(`/rest/v1/campaign_announcements?campaign_id=eq.${campaignId}&select=title`, { token: owner.token })
assert.equal(visibleAnnouncementsResponse.status, 200)
assert.deepEqual(visibleAnnouncements, [{ title: 'Session update' }])

const { data: sharedDocumentRows, response: sharedDocumentResponse } = await request('/rest/v1/campaign_documents', {
  token: invitee.token,
  method: 'POST',
  body: { campaign_id: campaignId, author_id: invitee.id, kind: 'note', visibility: 'shared', title: 'Party clues', body: 'The northern gate bears a silver mark.' },
})
assert.equal(sharedDocumentResponse.status, 201)
assert.equal(sharedDocumentRows[0].title, 'Party clues')

const { data: privateDocumentRows, response: privateDocumentResponse } = await request('/rest/v1/campaign_documents', {
  token: outsider.token,
  method: 'POST',
  body: { campaign_id: campaignId, author_id: outsider.id, kind: 'note', visibility: 'game_master', title: 'Hidden antagonist', body: 'The steward is the traitor.', is_pinned: true },
})
assert.equal(privateDocumentResponse.status, 201)
assert.equal(privateDocumentRows[0].visibility, 'game_master')

const { data: memberDocuments, response: memberDocumentsResponse } = await request(`/rest/v1/campaign_documents?campaign_id=eq.${campaignId}&select=title,visibility`, { token: invitee.token })
assert.equal(memberDocumentsResponse.status, 200)
assert.deepEqual(memberDocuments, [{ title: 'Party clues', visibility: 'shared' }])

const { data: managerDocuments, response: managerDocumentsResponse } = await request(`/rest/v1/campaign_documents?campaign_id=eq.${campaignId}&select=title,visibility&order=title.asc`, { token: owner.token })
assert.equal(managerDocumentsResponse.status, 200)
assert.deepEqual(managerDocuments, [
  { title: 'Hidden antagonist', visibility: 'game_master' },
  { title: 'Party clues', visibility: 'shared' },
])

const { response: forbiddenPinnedDocumentResponse } = await request('/rest/v1/campaign_documents', {
  token: invitee.token,
  method: 'POST',
  body: { campaign_id: campaignId, author_id: invitee.id, kind: 'resource', visibility: 'shared', title: 'Unauthorized pin', url: 'https://example.com', is_pinned: true },
})
assert.equal(forbiddenPinnedDocumentResponse.status, 403)

const { response: unsafeResourceResponse } = await request('/rest/v1/campaign_documents', {
  token: outsider.token,
  method: 'POST',
  body: { campaign_id: campaignId, author_id: outsider.id, kind: 'resource', visibility: 'shared', title: 'Unsafe resource', url: 'javascript:alert(1)' },
})
assert.equal(unsafeResourceResponse.status, 400)

const { data: ownerNotifications, response: ownerNotificationsResponse } = await request('/rest/v1/notifications?select=kind,title&order=created_at.asc', { token: owner.token })
assert.equal(ownerNotificationsResponse.status, 200)
assert.ok(ownerNotifications.some((item) => item.kind === 'session_proposed'))
assert.ok(ownerNotifications.some((item) => item.kind === 'announcement' && item.title === 'Session update'))

const { data: leakedNotifications, response: leakedNotificationsResponse } = await request(`/rest/v1/notifications?recipient_id=eq.${owner.id}&select=id`, { token: outsider.token })
assert.equal(leakedNotificationsResponse.status, 200)
assert.deepEqual(leakedNotifications, [])

const { data: forbiddenUpdate, response: forbiddenUpdateResponse } =
  await request(`/rest/v1/characters?id=eq.${characterId}`, {
    token: outsider.token,
    method: 'PATCH',
    body: { name: 'Stolen Hero' },
  })
assert.equal(forbiddenUpdateResponse.status, 200)
assert.deepEqual(forbiddenUpdate, [])

const { response: invalidJoinResponse } = await request(
  '/rest/v1/rpc/join_campaign',
  {
    token: outsider.token,
    method: 'POST',
    body: { campaign_code: 'DEADBEEF' },
  },
)
assert.equal(invalidJoinResponse.status, 400)

const { response: anonymousProfileResponse } = await request(
  '/rest/v1/profiles?select=id',
)
assert.ok([401, 403].includes(anonymousProfileResponse.status))

console.log('Foundation integration checks passed')
