import { getSiteName } from '../lib/site'

export function Footer() {
  const siteName = getSiteName()
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-divider" aria-hidden="true" />
        <div className="site-footer-row">
          <div className="site-footer-copy">
            {siteName} · An{' '}
            <a href="https://J0VEBOT.ai" target="_blank" rel="noreferrer">
              JOV
            </a>{' '}
            project ·{' '}
            <a href="https://github.com/J0VEBOT/jovhub" target="_blank" rel="noreferrer">
              Open source (MIT)
            </a>{' '}
            ·{' '}
            <a href="https://steipete.me" target="_blank" rel="noreferrer">
              Peter Steinberger
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  )
}
