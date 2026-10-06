import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ dark = false }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={dark
        ? 'grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20'
        : 'grid h-10 w-10 place-items-center rounded-2xl border border-cput-blue/10 bg-white/70 text-cput-blue shadow-sm backdrop-blur transition hover:bg-white'}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
