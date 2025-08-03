export interface PredictionFormData {
  team1Name: string;
  team1Players: string;
  team2Name: string;
  team2Players: string;
  stadium: string;
  date: string;
  time: string;
  weather: string;
}

export interface Player {
  playerName: string;
  teamName: string;
  role: string;
}

export interface CriticalMatchup {
  player1: string;
  player1Team: string;
  player2: string;
  player2Team: string;
  analysis: string;
}

export interface PredictionResultData {
  predictedWinner: string;
  winProbability: {
    team1: number;
    team2: number;
  };
  analysisSummary: string;
  headToHeadStats: {
    summary: string;
    records: string[];
  };
  criticalMatchups: CriticalMatchup[];
  bestCombinedEleven: Player[];
  keyPlayers: {
    team1: string[];
    team2: string[];
  };
  matchFactors: {
    team1Strengths: string[];
    team1Weaknesses: string[];
    team2Strengths: string[];
    team2Weaknesses: string[];
    decisiveConditions: string[];
  };
}

export interface UpcomingMatch {
  id: string;
  team1: string;
  team2: string;
  stadium: string;
  date: string;
  time: string;
  tournament?: string;
}

export interface MatchDetails {
  team1Players: string[];
  team2Players: string[];
  weather: string;
  time: string;
  pitchReport: string;
}
