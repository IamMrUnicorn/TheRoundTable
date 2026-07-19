import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FlowBreadcrumbs({
  campaignId,
  current,
}: {
  campaignId?: number
  current: 'party' | 'schedule' | 'room' | 'play'
}) {
  const steps: { id: typeof current; label: string; to?: string }[] = [
    {
      id: 'party',
      label: 'Party',
      to: campaignId ? `/campaigns/${campaignId}` : '/parties',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      to: campaignId ? `/campaigns/${campaignId}/schedule` : '/calendar',
    },
    { id: 'room', label: 'Waiting / prep' },
    { id: 'play', label: 'Play' },
  ]
  const currentIndex = steps.findIndex((step) => step.id === current)
  return (
    <nav className="flow-breadcrumbs" aria-label="Session workflow">
      {steps.map((step, index) => (
        <span
          className={
            index === currentIndex
              ? 'current'
              : index < currentIndex
                ? 'complete'
                : ''
          }
          key={step.id}
        >
          {index > 0 && <ChevronRight />}
          {step.to && index <= currentIndex ? (
            <Link to={step.to}>{step.label}</Link>
          ) : (
            <b>{step.label}</b>
          )}
        </span>
      ))}
    </nav>
  )
}
