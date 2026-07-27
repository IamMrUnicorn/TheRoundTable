import { X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'

export function PlayToolDrawer({
  children,
  description,
  onClose,
  title,
}: {
  children: ReactNode
  description: string
  onClose: () => void
  title: string
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('drawer-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('drawer-open')
    }
  }, [onClose])

  return (
    <div
      className="play-tool-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        className="play-tool-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-tool-drawer-title"
      >
        <header>
          <div>
            <p className="eyebrow">Live action tool</p>
            <h2 id="play-tool-drawer-title">{title}</h2>
            <span>{description}</span>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <div className="play-tool-drawer-content">{children}</div>
      </aside>
    </div>
  )
}
