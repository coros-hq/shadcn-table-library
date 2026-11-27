import { Moon, Sun } from 'lucide-react'

import { useTheme } from '#/hooks/use-theme.ts'
import { Button } from '#/components/ui/button.tsx'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      onClick={toggleTheme}
    >
      <span suppressHydrationWarning>
        {theme === 'dark' ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </span>
    </Button>
  )
}
