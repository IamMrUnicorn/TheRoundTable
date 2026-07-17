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
