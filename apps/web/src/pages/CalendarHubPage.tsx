import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { listCampaigns } from '../features/campaigns/campaigns'

export function CalendarHubPage() {
  const { identity } = useAuth()
  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })
  return (
    <main className="dashboard-page simple-hub-page">
      <section className="dashboard-content">
        <div className="dashboard-heading compact-heading">
          <div>
            <p className="eyebrow">Scheduling hub</p>
            <h1>Calendar</h1>
            <p>
              Choose a party to set availability, compare overlap, and manage
              sessions.
            </p>
          </div>
        </div>
        <div className="campaign-grid">
          {campaigns.data?.map((campaign) => (
            <Link
              className="campaign-card"
              key={campaign.id}
              to={`/campaigns/${campaign.id}/schedule`}
            >
              <CalendarDays />
              <h2>{campaign.name}</h2>
              <p>Open availability and session calendar</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
