import React, { useState, useCallback, useEffect } from 'react';
import { PredictionForm } from './components/PredictionForm';
import { PredictionResult } from './components/PredictionResult';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { MatchSelector } from './components/MatchSelector';
import { getCricketPrediction, getUpcomingMatches, getMatchDetails } from './services/geminiService';
import type { PredictionFormData, PredictionResultData, UpcomingMatch } from './types';
import { ArrowPathIcon } from './components/icons';

type Theme = 'light' | 'dark';
type AppStep = 'select' | 'fetching_details' | 'form' | 'loading' | 'result';

const initialFormData: PredictionFormData = {
  team1Name: '',
  team1Players: '',
  team2Name: '',
  team2Players: '',
  stadium: '',
  date: '',
  time: '',
  weather: '',
};

const App: React.FC = () => {
    const getInitialTheme = (): Theme => {
        if (typeof window === 'undefined') return 'light'; // Guard for SSR
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [step, setStep] = useState<AppStep>('select');

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [isFetchingMatches, setIsFetchingMatches] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<PredictionFormData>(initialFormData);

  const [predictionResult, setPredictionResult] = useState<PredictionResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleFetchMatches = useCallback(async () => {
    setIsFetchingMatches(true);
    setError(null);
    try {
      const matches = await getUpcomingMatches();
      setUpcomingMatches(matches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming matches.');
    } finally {
      setIsFetchingMatches(false);
    }
  }, []);

  const handleSelectMatch = useCallback(async (match: UpcomingMatch) => {
    setStep('fetching_details');
    setError(null);
    try {
        const details = await getMatchDetails(match.team1, match.team2, match.stadium, match.date);
        setFormData({
            team1Name: match.team1,
            team2Name: match.team2,
            stadium: match.stadium,
            date: match.date,
            time: details.time,
            weather: details.weather,
            team1Players: details.team1Players.join('\n'),
            team2Players: details.team2Players.join('\n'),
        });
        setStep('form');
    } catch (err) {
        console.error("Error fetching match details:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch match details. Please enter them manually.');
        // Fallback to manual form entry on error
        setFormData({
            ...initialFormData,
            team1Name: match.team1,
            team2Name: match.team2,
            stadium: match.stadium,
            date: match.date,
            time: match.time || '20:00',
        });
        setStep('form');
    }
  }, []);


  const handlePredict = useCallback(async (data: PredictionFormData) => {
    setStep('loading');
    setError(null);
    setPredictionResult(null);

    try {
      const result = await getCricketPrediction(data);
      setPredictionResult(result);
      setStep('result');
    } catch (err) {
      console.error("Prediction Error:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
      setStep('form'); // Go back to form on error
    }
  }, []);
  
  const handleReset = () => {
    setStep('select');
    setFormData(initialFormData);
    setPredictionResult(null);
    setError(null);
    setUpcomingMatches([]);
  };

  const renderContent = () => {
    switch (step) {
      case 'select':
        return (
          <MatchSelector
            matches={upcomingMatches}
            onFetch={handleFetchMatches}
            onSelect={handleSelectMatch}
            isLoading={isFetchingMatches}
          />
        );
      case 'fetching_details':
        return <Loader message="Fetching match details (Players, Weather, Pitch)..." />;
      case 'form':
        return (
          <PredictionForm
            onPredict={handlePredict}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 'loading':
        return <Loader />;
      case 'result':
        return predictionResult ? (
          <PredictionResult 
            data={predictionResult} 
            team1Name={formData.team1Name}
            team2Name={formData.team2Name}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header theme={theme} setTheme={setTheme} />
      <main className="w-full max-w-6xl mx-auto flex flex-col gap-8">
        
        {renderContent()}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-lg text-center transition-all">
            <p className="font-bold">An Error Occurred</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        
        {step !== 'select' && step !== 'fetching_details' && (
          <div className="flex justify-center">
             <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Start Over
              </button>
          </div>
        )}
      </main>
      <footer className="w-full max-w-6xl mx-auto mt-12 text-center text-slate-500 dark:text-slate-500 text-sm py-4">
        <p>Built by Vincorus Systems.</p>
        <p>&copy; {new Date().getFullYear()} Vincorus Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
