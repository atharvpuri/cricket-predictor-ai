import React from 'react';
import { CricketBallIcon } from './icons';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  message = "AI is analyzing the match...",
  subMessage = "Please wait a moment while we process historical data, player stats, and conditions to generate the most accurate prediction."
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="relative">
        <CricketBallIcon className="w-16 h-16 text-blue-500 dark:text-emerald-400 animate-bounce" />
        <span className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500/50 dark:border-emerald-400/50 animate-ping"></span>
      </div>
      <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">{message}</p>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
        {subMessage}
      </p>
    </div>
  );
};
