import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionFormData, PredictionResultData, UpcomingMatch, MatchDetails } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show this error in the UI.
  throw new Error("API_KEY environment variable not found. Please set it before running the application.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const handleApiError = (error: unknown, context: string): never => {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    if (error.message.includes("429")) {
      throw new Error("API rate limit exceeded. Please wait a moment and try again.");
    }
     if (error.message.includes("503")) {
      throw new Error("The AI service is temporarily unavailable. Please try again later.");
    }
     if (error.message.toLowerCase().includes("safety")) {
       throw new Error("The request was blocked due to safety settings. Please modify your input.");
     }
  }
  throw new Error(`Failed to ${context}. The model may have returned an unexpected format or an error occurred.`);
};

// Main Prediction Schema and Function
const predictionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    predictedWinner: {
      type: Type.STRING,
      description: "The name of the team with the highest probability of winning.",
    },
    winProbability: {
      type: Type.OBJECT,
      properties: {
        team1: { type: Type.NUMBER, description: "Winning percentage for team 1, from 0 to 100." },
        team2: { type: Type.NUMBER, description: "Winning percentage for team 2, from 0 to 100." }
      },
      required: ["team1", "team2"],
      description: "The win probability for each team in percentage. This must sum to 100."
    },
     headToHeadStats: {
        type: Type.OBJECT,
        description: "Direct head-to-head statistics between the two teams.",
        properties: {
            summary: { type: Type.STRING, description: "A one-sentence summary of the H2H record (e.g., 'Team A has dominated recent encounters')."},
            records: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 key H2H facts, like 'Overall: 15-10', 'Last 5 matches: 4-1', 'At this venue: 2-2'."}
        },
        required: ["summary", "records"]
    },
    analysisSummary: {
      type: Type.STRING,
      description: "A detailed paragraph synthesizing all analytical points (matchups, form, conditions) into a coherent narrative explaining the 'why' behind the prediction.",
    },
     criticalMatchups: {
        type: Type.ARRAY,
        description: "A list of 2-3 critical player-vs-player matchups that could decide the game.",
        items: {
            type: Type.OBJECT,
            properties: {
                player1: { type: Type.STRING, description: "Name of the first player in the matchup." },
                player1Team: { type: Type.STRING, description: "Team of the first player." },
                player2: { type: Type.STRING, description: "Name of the second player." },
                player2Team: { type: Type.STRING, description: "Team of the second player." },
                analysis: { type: Type.STRING, description: "A brief, data-driven analysis of their past encounters (e.g., 'X has dismissed Y 3 times in 25 balls')." }
            },
            required: ["player1", "player1Team", "player2", "player2Team", "analysis"]
        }
    },
    matchFactors: {
        type: Type.OBJECT,
        description: "A breakdown of the key factors influencing the prediction.",
        properties: {
            team1Strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 key strengths for Team 1." },
            team1Weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 key weaknesses for Team 1." },
            team2Strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 key strengths for Team 2." },
            team2Weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 key weaknesses for Team 2." },
            decisiveConditions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 critical pitch, weather, or situational factors." },
        },
        required: ["team1Strengths", "team1Weaknesses", "team2Strengths", "team2Weaknesses", "decisiveConditions"]
    },
    bestCombinedEleven: {
      type: Type.ARRAY,
      description: "A list of the 11 best players selected from both teams, forming a 'Dream Team'. Include their team name and role.",
      items: {
        type: Type.OBJECT,
        properties: {
          playerName: { type: Type.STRING },
          teamName: { type: Type.STRING },
          role: { type: Type.STRING, description: "Player's role, e.g., Batsman, Bowler, All-rounder, Wicket-keeper" },
        },
        required: ["playerName", "teamName", "role"],
      },
    },
    keyPlayers: {
      type: Type.OBJECT,
      properties: {
        team1: {
          type: Type.ARRAY,
          description: "A list of 3 key players for Team 1, with a brief, stat-based reason (e.g., 'Virat Kohli - Scored 2 centuries in his last 5 ODIs').",
          items: { type: Type.STRING },
        },
        team2: {
          type: Type.ARRAY,
          description: "A list of 3 key players for Team 2, with a brief, stat-based reason.",
          items: { type: Type.STRING },
        },
      },
      description: "List of key players to watch from both teams.",
      required: ["team1", "team2"],
    },
  },
  required: ["predictedWinner", "winProbability", "analysisSummary", "bestCombinedEleven", "keyPlayers", "matchFactors", "headToHeadStats", "criticalMatchups"],
};

const buildPredictionPrompt = (data: PredictionFormData): string => `
You are a world-class cricket strategist and data scientist with access to a comprehensive historical database of all cricket matches and player statistics. Your task is to produce a "god-tier," deeply analytical prediction for the following cricket match. Your analysis MUST be quantitative and specific wherever possible.

**Match Information:**
- Team 1: ${data.team1Name} (Players: ${data.team1Players})
- Team 2: ${data.team2Name} (Players: ${data.team2Players})
- Venue: ${data.stadium}
- Date & Time: ${data.date} at ${data.time}
- Conditions: ${data.weather}

**Required Analytical Dimensions (Perform a deep, STATISTICALLY-BACKED analysis on EACH of these points):**
1.  **Head-to-Head (H2H) Analysis:** Provide specific numbers.
    *   Overall record (e.g., "IND 15 - 10 AUS").
    *   Record in the last 5 matches.
    *   H2H record at this specific venue.

2.  **Venue & Pitch Analysis:**
    *   **Pitch Report:** Is it a batting or bowling paradise? What is the average first innings score in the last 10 matches here? Does it favor pacers or spinners (provide % of wickets taken by each)?
    *   **Toss Factor:** What is the win/loss record for teams batting first vs. second?

3.  **Deep Player Analysis & CRITICAL MATCHUPS:**
    *   **Player Form:** For key players, cite recent stats (e.g., "Rohit Sharma has scored 250 runs in his last 5 T20Is at an SR of 155").
    *   **Venue Performance:** How have key players performed here? (e.g., "Jasprit Bumrah has an economy of 6.2 at this venue in 4 matches").
    *   **CRUCIAL MATCHUPS (BATSMAN vs. BOWLER):** This is the most important part. Identify 2-3 key duels. Use historical data. Example: "Virat Kohli vs. Pat Cummins: Kohli has scored 60 runs off 45 balls from Cummins and been dismissed once."

4.  **Synthesis & Final Prediction:**
    *   Synthesize all the above data points. Weigh the factors to determine the most likely outcome.
    *   The 'analysisSummary' must explain the 'why' by referencing the H2H stats, key matchups, and pitch conditions you found.
    *   The 'keyPlayers' list must include a brief, stat-based justification for each player's inclusion.

**Output Mandate:**
You MUST provide your complete analysis ONLY in the specified JSON format. The 'team1' in winProbability and other objects must correspond to ${data.team1Name}. The analysis must be reflected in all fields of the JSON.
`;

export const getCricketPrediction = async (formData: PredictionFormData): Promise<PredictionResultData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildPredictionPrompt(formData),
      config: {
        responseMimeType: "application/json",
        responseSchema: predictionResponseSchema,
        temperature: 0.1, // Very low temperature for fact-based, consistent output
      },
    });
    const parsedResult: PredictionResultData = JSON.parse(response.text.trim());
    if (!parsedResult.predictedWinner || !parsedResult.criticalMatchups || !parsedResult.headToHeadStats) {
        throw new Error("The API returned an incomplete or invalid JSON structure.");
    }
    return parsedResult;
  } catch (error) {
    handleApiError(error, "get prediction from AI model");
  }
};

export const getUpcomingMatches = async (): Promise<UpcomingMatch[]> => {
  try {
    // Step 1: Use Google Search to get real-time, unstructured data about matches.
    const searchPrompt = "List live or upcoming major cricket matches (international or major leagues like IPL, BBL) happening in the next 48 hours. Include the teams, venue, date, local start time, and the tournament name.";
    
    const searchResult = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: searchPrompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    const rawText = searchResult.text;

    if (!rawText || rawText.toLowerCase().includes("no upcoming matches") || rawText.toLowerCase().includes("could not find")) {
        return [];
    }

    // Step 2: Use a second, schema-enforced call to parse the unstructured text into clean JSON.
    const upcomingMatchesSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique ID, e.g., 'india-vs-australia-2024-10-26'" },
          team1: { type: Type.STRING },
          team2: { type: Type.STRING },
          stadium: { type: Type.STRING },
          date: { type: Type.STRING, description: "Match date in YYYY-MM-DD format" },
          time: { type: Type.STRING, description: "Local start time in HH:MM format (e.g., '19:30')." },
          tournament: { type: Type.STRING, description: "The name of the tournament or series" },
        },
        required: ["id", "team1", "team2", "stadium", "date", "time", "tournament"],
      },
    };

    const parserPrompt = `Given the following text about cricket matches, parse it and extract the data into the specified JSON format. Create a unique ID for each match. Ensure the date is in YYYY-MM-DD format and time is in HH:MM format.\n\nTEXT TO PARSE:\n${rawText}`;
    
    const structuredResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parserPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: upcomingMatchesSchema,
            temperature: 0,
        },
    });

    return JSON.parse(structuredResponse.text.trim());

  } catch (error) {
    handleApiError(error, "fetch upcoming matches using Google Search");
  }
};

// Match Details Schema and Function
const matchDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        team1Players: {
            type: Type.ARRAY,
            description: "An array of exactly 11 probable player names for the first team.",
            items: { type: Type.STRING }
        },
        team2Players: {
            type: Type.ARRAY,
            description: "An array of exactly 11 probable player names for the second team.",
            items: { type: Type.STRING }
        },
        weather: {
            type: Type.STRING,
            description: "A brief weather forecast for the match at the venue (e.g., '28°C, Partly cloudy with a 10% chance of rain')."
        },
        time: {
            type: Type.STRING,
            description: "The official local start time of the match in HH:MM format."
        },
        pitchReport: {
            type: Type.STRING,
            description: "A short pitch report (e.g., 'Likely to be a flat, batting-friendly pitch. Spinners may get some help later.')."
        }
    },
    required: ["team1Players", "team2Players", "weather", "time", "pitchReport"]
};

export const getMatchDetails = async (team1Name: string, team2Name: string, stadium: string, date: string): Promise<MatchDetails> => {
    try {
        // Step 1: Use Google Search to get real-time data about the specific match.
        const searchPrompt = `Using Google Search, find the most accurate and up-to-date probable playing XI for the cricket match: ${team1Name} vs ${team2Name} on ${date}. Also find the latest local weather forecast for ${stadium}, a specific pitch report, and the official local start time. Prioritize information from highly reputable sports news sites like Cricbuzz or ESPNcricinfo.`;
        
        const searchResult = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: searchPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const rawText = searchResult.text;
        if (!rawText) {
            throw new Error("Could not find any real-time details for the match using Google Search.");
        }

        // Step 2: Use a schema-enforced call to parse the unstructured text into clean JSON.
        const parserPrompt = `Based on the following text about a cricket match, extract the probable playing XI for both ${team1Name} and ${team2Name}, the weather, the official start time, and a pitch report. It is crucial that you find exactly 11 players for each team. If the text provides a squad of more than 11, select the most likely players to start. For the weather, summarize it concisely. Ensure the time is in HH:MM format.\n\nTEXT TO PARSE:\n${rawText}`;
        
        const structuredResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: parserPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: matchDetailsSchema,
                temperature: 0,
            },
        });

        const parsedResult: MatchDetails = JSON.parse(structuredResponse.text.trim());

        // Validate that we have 11 players.
        if (parsedResult.team1Players.length < 11 || parsedResult.team2Players.length < 11) {
             throw new Error("AI failed to extract a full playing XI for both teams. The real-time source information might be incomplete or not yet announced.");
        }

        return parsedResult;

    } catch (error) {
        handleApiError(error, `fetch real-time match details for ${team1Name} vs ${team2Name}`);
    }
};