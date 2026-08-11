import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import { topLevelLinks, navGroups } from '#/components/docs/nav-content.tsx'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function goTo(to: string) {
    setOpen(false)
    void navigate({ to })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:w-48"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search docs"
        description="Jump to any table example"
      >
        <CommandInput placeholder="Search examples..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="General">
            {topLevelLinks.map((link) => (
              <CommandItem
                key={link.to}
                value={link.title}
                onSelect={() => goTo(link.to)}
              >
                {link.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((link) => (
                <CommandItem
                  key={link.to}
                  value={`${group.title} ${link.title}`}
                  onSelect={() => goTo(link.to)}
                >
                  {link.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
