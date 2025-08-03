import React from 'react';
import type { UpcomingMatch } from '../types';
import { CricketBallIcon } from './icons';

interface MatchSelectorProps {
  matches: UpcomingMatch[];
  onFetch: () => void;
  onSelect: (match: UpcomingMatch) => void;
  isLoading: boolean;
}

const MatchCard: React.FC<{ match: UpcomingMatch; onSelect: (match: UpcomingMatch) => void }> = ({ match, onSelect }) => {
  const matchDate = new Date(`${match.date}T${match.time}:00`);
  
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Assuming date from API is UTC
  }).format(matchDate);

  return (
    <button
      onClick={() => onSelect(match)}
      className="w-full text-left p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1"
    >
      {match.tournament && (
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">{match.tournament}</p>
      )}
      <p className="font-bold text-lg text-blue-700 dark:text-sky-400">{match.team1} vs {match.team2}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{match.stadium}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{formattedDate} at {match.time} (Local)</p>
    </button>
  );
};

export const MatchSelector: React.FC<MatchSelectorProps> = ({ matches, onFetch, onSelect, isLoading }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-2xl dark:shadow-slate-950/50 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-emerald-400">Step 1: Find a Match</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Let our AI find <strong>live or imminent</strong> matches for you to analyze.</p>
        <button
          onClick={onFetch}
          disabled={isLoading}
          className="mt-6 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-emerald-500 dark:to-cyan-500 dark:hover:from-emerald-600 dark:hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            'Find Live & Upcoming Matches'
          )}
        </button>
      </div>

      {matches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-center mb-4 text-slate-700 dark:text-slate-300">Select a match to analyze:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
      {!isLoading && matches.length === 0 && (
         <div className="mt-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-4">
            <CricketBallIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 opacity-50"/>
            <p>Click the button above to get started. If no matches appear, there may be no major events in the next 48 hours.</p>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};