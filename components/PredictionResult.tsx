import React from 'react';
import type { PredictionResultData, Player, CriticalMatchup } from '../types';
import { TrophyIcon, UserGroupIcon, ClipboardListIcon, StarIcon, CheckCircleIcon, XCircleIcon, ScaleIcon, SwordsIcon } from './icons';

interface PredictionResultProps {
  data: PredictionResultData;
  team1Name: string;
  team2Name: string;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
        </div>
        <div className="text-slate-600 dark:text-slate-300 flex-grow">
            {children}
        </div>
    </div>
);

const FactorList: React.FC<{ items: string[], icon: React.ReactNode, title: string, titleColor: string }> = ({ items, icon, title, titleColor }) => (
    <div>
        <h4 className={`font-semibold ${titleColor} mb-2`}>{title}</h4>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                    {icon}
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const MatchupCard: React.FC<{ matchup: CriticalMatchup }> = ({ matchup }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
        <div className="flex justify-between items-center font-bold text-sm mb-1">
            <span className="text-blue-600 dark:text-emerald-400">{matchup.player1} ({matchup.player1Team})</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">vs</span>
            <span className="text-indigo-600 dark:text-cyan-400">{matchup.player2} ({matchup.player2Team})</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{matchup.analysis}</p>
    </div>
);


export const PredictionResult: React.FC<PredictionResultProps> = ({ data, team1Name, team2Name }) => {
  const { predictedWinner, winProbability, analysisSummary, bestCombinedEleven, keyPlayers, matchFactors, headToHeadStats, criticalMatchups } = data;
  const team1Prob = winProbability?.team1 ?? 50;
  const team2Prob = winProbability?.team2 ?? 50;
  
  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <ResultCard title="Predicted Winner" icon={<TrophyIcon className="w-7 h-7 text-amber-500 dark:text-amber-400" />} className="lg:col-span-2">
                 <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-400 dark:to-cyan-400 mb-4">{predictedWinner}</p>
                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 relative overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-emerald-500 dark:to-green-500 h-4 rounded-l-full" style={{ width: `${team1Prob}%` }}></div>
                    <div className="bg-gradient-to-r from-slate-400 to-gray-400 dark:from-sky-500 dark:to-cyan-500 h-4 rounded-r-full absolute top-0" style={{ width: `${team2Prob}%`, right: 0 }}></div>
                 </div>
                 <div className="flex justify-between text-xs mt-1 font-medium text-slate-600 dark:text-slate-400">
                     <span className="text-blue-600 dark:text-emerald-400">{`${team1Name}: ${team1Prob}%`}</span>
                     <span className="text-gray-500 dark:text-cyan-400">{`${team2Name}: ${team2Prob}%`}</span>
                 </div>
            </ResultCard>

            <ResultCard title="AI Analysis Summary" icon={<ClipboardListIcon className="w-7 h-7 text-sky-500 dark:text-sky-400" />} className="lg:col-span-3">
                <p className="text-base leading-relaxed">{analysisSummary}</p>
            </ResultCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ResultCard title="Head-to-Head Stats" icon={<ScaleIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />}>
                <div className="space-y-3">
                    <p className="font-semibold italic text-slate-700 dark:text-slate-200">"{headToHeadStats.summary}"</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {headToHeadStats.records.map((record, i) => <li key={i}>{record}</li>)}
                    </ul>
                </div>
            </ResultCard>
             <ResultCard title="Critical Player Matchups" icon={<SwordsIcon className="w-7 h-7 text-red-500 dark:text-red-400" />}>
                <div className="space-y-3">
                    {criticalMatchups.map((matchup, i) => <MatchupCard key={i} matchup={matchup} />)}
                </div>
            </ResultCard>
             <ResultCard title="Key Players to Watch" icon={<StarIcon className="w-7 h-7 text-yellow-500 dark:text-yellow-400" />}>
                <div className="flex flex-col gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-blue-600 dark:text-emerald-400 mb-2">{team1Name}</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {keyPlayers.team1.map((player, i) => <li key={`kp1-${i}`}>{player}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-cyan-400 mb-2">{team2Name}</h4>
                        <ul className="list-disc list-inside space-y-1">
                             {keyPlayers.team2.map((player, i) => <li key={`kp2-${i}`}>{player}</li>)}
                        </ul>
                    </div>
                </div>
            </ResultCard>
        </div>

        <ResultCard title="In-Depth Match Factors" icon={<ScaleIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <FactorList 
                        items={matchFactors.team1Strengths} 
                        icon={<CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                        title={`${team1Name} Strengths`}
                        titleColor="text-blue-600 dark:text-emerald-400"
                    />
                    <FactorList 
                        items={matchFactors.team1Weaknesses} 
                        icon={<XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                        title={`${team1Name} Weaknesses`}
                        titleColor="text-blue-600 dark:text-emerald-400"
                    />
                </div>
                 <div className="space-y-4">
                    <FactorList 
                        items={matchFactors.team2Strengths} 
                        icon={<CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                        title={`${team2Name} Strengths`}
                        titleColor="text-indigo-600 dark:text-cyan-400"
                    />
                    <FactorList 
                        items={matchFactors.team2Weaknesses} 
                        icon={<XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                        title={`${team2Name} Weaknesses`}
                        titleColor="text-indigo-600 dark:text-cyan-400"
                    />
                </div>
                <div className="md:col-span-2 lg:col-span-1 space-y-4">
                   <FactorList 
                        items={matchFactors.decisiveConditions} 
                        icon={<StarIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                        title="Decisive Conditions"
                        titleColor="text-slate-700 dark:text-slate-300"
                    />
                </div>
            </div>
        </ResultCard>

        <ResultCard title="Best Combined XI (Dream Team)" icon={<UserGroupIcon className="w-7 h-7 text-violet-500 dark:text-violet-400" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                {bestCombinedEleven.map((player: Player, index: number) => (
                    <div key={index} className="flex flex-col p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{player.playerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{player.role}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{player.teamName}</p>
                    </div>
                ))}
            </div>
        </ResultCard>

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
