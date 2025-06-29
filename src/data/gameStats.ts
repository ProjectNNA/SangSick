// Game statistics types and initial data for different game modes

export type GameMode = 'classic' | 'timed' | 'challenge';

export interface GameStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
  lastScore: number;
  lastPlayed: string | null;
}

export type GameStatsMap = {
  [mode in GameMode]: GameStats;
};

export const initialGameStats: GameStatsMap = {
  classic: {
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    lastScore: 0,
    lastPlayed: null,
  },
  timed: {
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    lastScore: 0,
    lastPlayed: null,
  },
  challenge: {
    totalGames: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    lastScore: 0,
    lastPlayed: null,
  },
}; 