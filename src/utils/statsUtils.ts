import { GameStats, GameMode, initialGameStats, GameStatsMap } from '../data/gameStats';

const STATS_STORAGE_KEY = 'quizGameStats';

export const loadGameStats = (): GameStatsMap => {
  try {
    const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      // Ensure all game modes exist
      return {
        classic: { ...initialGameStats.classic, ...parsedStats.classic },
        timed: { ...initialGameStats.timed, ...parsedStats.timed },
        challenge: { ...initialGameStats.challenge, ...parsedStats.challenge },
      };
    }
  } catch (error) {
    console.error('Error loading game stats:', error);
  }
  return initialGameStats;
};

export const saveGameStats = (stats: GameStatsMap): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving game stats:', error);
  }
};

export const updateGameStats = (
  mode: GameMode,
  correctAnswers: number,
  totalQuestions: number,
  score: number
): GameStatsMap => {
  const currentStats = loadGameStats();
  const currentModeStats = currentStats[mode];
  
  const updatedModeStats: GameStats = {
    totalGames: currentModeStats.totalGames + 1,
    totalCorrect: currentModeStats.totalCorrect + correctAnswers,
    totalQuestions: currentModeStats.totalQuestions + totalQuestions,
    bestScore: Math.max(currentModeStats.bestScore, score),
    lastScore: score,
    lastPlayed: new Date().toISOString(),
  };

  const updatedStats: GameStatsMap = {
    ...currentStats,
    [mode]: updatedModeStats,
  };

  saveGameStats(updatedStats);
  return updatedStats;
};

export const resetGameStats = (): void => {
  localStorage.removeItem(STATS_STORAGE_KEY);
}; 