import { Link } from '@tanstack/react-router'
import { Blocks } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { encodeState } from './schema'
import { templateFor } from './templates'

/** Links an example page to the builder, preloaded with its template */
export function OpenInBuilder({ href }: { href: string }) {
  const template = templateFor(href)
  if (!template) return null
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Button asChild variant="outline" size="sm" className="shadow-none">
        <Link to="/builder" search={{ t: encodeState(template.state) }}>
          <Blocks className="h-3.5 w-3.5" />
          Open in builder
        </Link>
      </Button>
      <span>Start a table of your own from this example.</span>
    </div>
  )
}
