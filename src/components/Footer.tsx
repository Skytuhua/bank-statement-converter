import { LockIcon, GithubIcon } from './icons'

const REPO_URL = 'https://github.com/Skytuhua/bank-statement-converter'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p className="flex items-center gap-1.5 text-center">
          <LockIcon width={13} height={13} className="text-inflow" />
          Runs entirely in your browser. Your files never leave your device.
        </p>
        <div className="flex items-center gap-4">
          <span>MIT licensed</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon width={15} height={15} />
            Source
          </a>
        </div>
      </div>
    </footer>
  )
}
