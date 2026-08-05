import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import GithubIcon from '#/../public/icons/github-logo.svg'

const REPO = 'coros-hq/shadcn-table-library'

function formatStars(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(count)
}

export function GithubStars() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`https://api.github.com/repos/${REPO}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star ShadTable on GitHub"
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      <img src={GithubIcon} alt="" className="size-3.5 dark:invert" />
      <span className="hidden sm:inline">Star</span>
      <span className="flex items-center gap-1 border-l pl-1.5">
        <Star className="size-3.5" />
        {stars === null ? '—' : formatStars(stars)}
      </span>
    </a>
  )
}
