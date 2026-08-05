import { Link, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import DiscordIcon from '#/../public/icons/discord-logo.svg'
import GithubIcon from '#/../public/icons/github-logo.svg'
import { ThemeToggle } from '#/components/docs/theme-toggle.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet.tsx'
import { NavContent } from '#/components/docs/nav-content.tsx'

interface SiteHeaderProps {
  mobileNavOpen: boolean
  onMobileNavOpenChange: (open: boolean) => void
}

export function SiteHeader({
  mobileNavOpen,
  onMobileNavOpenChange,
}: SiteHeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-1 md:hidden"
              aria-label="Open navigation"
              onClick={() => onMobileNavOpenChange(true)}
            >
              <Menu className="size-5" />
            </Button>
            <Link
              to="/"
              className="flex items-center gap-2 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <img src="/logo.svg" alt="" className="size-6 rounded-md" />
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-sm font-semibold tracking-tight text-transparent">
                ShadTable
              </span>
            </Link>
          </div>
          <div className="flex flex-row items-center gap-3">
            <ThemeToggle />
            <a
              href="https://discord.gg/4J6MVnnRY"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Join Discord"
            >
              <img
                src={DiscordIcon}
                alt="Discord"
                className="size-5 dark:invert"
              />
            </a>
            <a
              href="https://github.com/coros-hq/shadcn-table-library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Repository"
            >
              <img
                src={GithubIcon}
                alt="GitHub"
                className="size-5 dark:invert"
              />
            </a>
          </div>
        </div>
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={onMobileNavOpenChange}>
        <SheetContent side="left" className="w-72 overflow-y-auto p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <NavContent
            pathname={pathname}
            onNavigate={() => onMobileNavOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
