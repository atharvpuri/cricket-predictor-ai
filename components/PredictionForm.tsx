import React from 'react';
import type { PredictionFormData } from '../types';

interface PredictionFormProps {
  onPredict: (data: PredictionFormData) => void;
  formData: PredictionFormData;
  setFormData: React.Dispatch<React.SetStateAction<PredictionFormData>>;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ 
  onPredict, 
  formData,
  setFormData
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onPredict(formData);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-2xl dark:shadow-slate-950/50 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-emerald-400 mb-6">Step 2: Review Details & Predict</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        
        <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{formData.team1Name || 'Team 1'}</h3>
          <textarea
            name="team1Players"
            value={formData.team1Players}
            onChange={handleChange}
            placeholder={`Player names for ${formData.team1Name}, one per line`}
            rows={8}
            className="form-textarea"
            required
          />
        </div>

        <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{formData.team2Name || 'Team 2'}</h3>
          <textarea
            name="team2Players"
            value={formData.team2Players}
            onChange={handleChange}
            placeholder={`Player names for ${formData.team2Name}, one per line`}
            rows={8}
            className="form-textarea"
            required
          />
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <input type="text" name="stadium" value={formData.stadium} onChange={handleChange} placeholder="Stadium" className="form-input" required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required readOnly/>
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="form-input" required />
          <input type="text" name="weather" value={formData.weather} onChange={handleChange} placeholder="Weather (e.g., Sunny)" className="form-input" required />
        </div>

        <div className="lg:col-span-2 mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-emerald-500 dark:to-cyan-500 dark:hover:from-emerald-600 dark:hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? 'Analyzing...' : 'Predict Winner'}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </button>
        </div>
      </form>
      <style>{`
        .form-input, .form-textarea {
          background-color: #f1f5f9; /* slate-100 */
          border: 1px solid #cbd5e1; /* slate-300 */
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          width: 100%;
          transition: all 0.2s;
          color: #1e293b; /* slate-800 */
        }
        .dark .form-input, .dark .form-textarea {
          background-color: #1e293b; /* slate-800 */
          border-color: #334155; /* slate-700 */
          color: #f1f5f9; /* slate-100 */
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          box-shadow: 0 0 0 2px #3b82f6; /* blue-500 */
          border-color: #3b82f6;
        }
        .dark .form-input:focus, .dark .form-textarea:focus {
          box-shadow: 0 0 0 2px #22d3ee; /* cyan-400 */
          border-color: #22d3ee;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8);
        }
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        input[type="date"]:read-only {
          cursor: not-allowed;
          background-color: #e2e8f0;
        }
        .dark input[type="date"]:read-only {
          background-color: #334155;
        }
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
