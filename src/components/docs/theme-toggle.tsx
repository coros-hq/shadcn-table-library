import { Moon, Sun } from 'lucide-react'

import { useTheme } from '#/hooks/use-theme.ts'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="cursor-pointer"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    >
      <span suppressHydrationWarning>
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </button>
  )
}
