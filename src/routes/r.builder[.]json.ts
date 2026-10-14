import { createFileRoute } from '@tanstack/react-router'
import { registryItem } from '#/components/builder/generate'
import { decodeState } from '#/components/builder/schema'

// The shadcn CLI fetches this URL, so it answers with a registry item built
// from the builder state in `?t=`. decodeState validates the untrusted input
// and falls back to the default table.
export const Route = createFileRoute('/r/builder.json')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const t = new URL(request.url).searchParams.get('t') ?? undefined
        return Response.json(registryItem(decodeState(t)), {
          headers: {
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*',
          },
        })
      },
    },
  },
})
