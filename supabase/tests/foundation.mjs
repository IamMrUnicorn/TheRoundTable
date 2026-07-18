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
