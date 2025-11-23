import React from 'react';
import { useTheme } from '../services/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { cn } from './ui/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-5 h-5" />
          <span className="text-sm">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" />
          <span className="text-sm">Light Mode</span>
        </>
      )}
    </button>
  );
}

