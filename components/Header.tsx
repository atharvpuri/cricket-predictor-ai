import React from 'react';
import { CricketBatIcon, MoonIcon, SunIcon } from './icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeToggle: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6 text-slate-800" />
      ) : (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      )}
    </button>
  );
};


export const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  return (
    <header className="relative w-full max-w-6xl mx-auto mb-8 text-center">
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <div className="flex items-center justify-center gap-4 mb-2">
        <CricketBatIcon className="w-10 h-10 text-blue-600 dark:text-emerald-400" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-400 dark:to-cyan-400">
          Cricket Predictor AI
        </h1>
        <CricketBatIcon className="w-10 h-10 text-indigo-600 dark:text-cyan-400" />
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-lg">
        An AI-powered analysis of upcoming cricket matches.
      </p>
    </header>
  );
};
