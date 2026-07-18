import { useQuery } from '@tanstack/react-query'
import { Activity } from 'lucide-react'
import { listCampaignActivity } from './activity'

export function CampaignActivityPanel({ campaignId }: { campaignId: number }) {
  const feed = useQuery({
    queryKey: ['campaign-activity', campaignId],
    queryFn: () => listCampaignActivity(campaignId),
  })
  return (
    <section className="activity-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Recent changes</p>
          <h2>Campaign activity</h2>
        </div>
        <Activity />
      </div>
      {feed.isLoading && (
        <p className="muted-copy">Gathering recent activity…</p>
      )}
      {feed.data?.length === 0 && (
        <p className="muted-copy">No activity yet.</p>
      )}
      <div className="activity-list">
        {feed.data?.map((item) => (
          <article key={item.id}>
            <span>{item.kind}</span>
            <div>
              <strong>{item.label}</strong>
              <small>
                {item.detail} · {new Date(item.at).toLocaleString()}
              </small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
