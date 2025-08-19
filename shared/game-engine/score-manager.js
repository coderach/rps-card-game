// shared/game-engine/score-manager.js - Score Management Logic

/**
 * ScoreManager class for handling score tracking and calculations
 * Reusable across console, web testing, and future environments
 */
class ScoreManager {
    constructor() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.scoreHistory = [];
        this.cardScores = [];
        this.bonusPoints = {
            player1: 0,
            player2: 0
        };
        this.statistics = {
            player1: this.initPlayerStats(),
            player2: this.initPlayerStats()
        };
    }

    /**
     * Initialize player statistics
     * @returns {Object} - Empty player statistics
     */
    initPlayerStats() {
        return {
            totalPoints: 0,
            roundsWon: 0,
            roundsLost: 0,
            roundsTied: 0,
            cardsWon: 0,
            cardsLost: 0,
            cardsTied: 0,
            highestSingleRound: 0,
            averagePerRound: 0,
            winStreak: 0,
            currentStreak: 0,
            comebacks: 0
        };
    }

    /**
     * Reset score manager for new game
     */
    reset() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.scoreHistory = [];
        this.cardScores = [];
        this.bonusPoints = { player1: 0, player2: 0 };
        this.statistics = {
            player1: this.initPlayerStats(),
            player2: this.initPlayerStats()
        };
    }

    /**
     * Get current score for a player
     * @param {number} playerNumber - Player number (1 or 2)
     * @returns {number} - Current score
     */
    getScore(playerNumber) {
        return playerNumber === 1 ? this.player1Score : this.player2Score;
    }

    /**
     * Get both players' scores
     * @returns {Object} - {player1: number, player2: number}
     */
    getScores() {
        return {
            player1: this.player1Score,
            player2: this.player2Score
        };
    }

    /**
     * Add points to a player's score
     * @param {number} playerNumber - Player number (1 or 2)
     * @param {number} points - Points to add
     * @param {string} source - Source of points ('round', 'bonus', 'penalty')
     */
    addPoints(playerNumber, points, source = 'round') {
        if (points < 0) {
            throw new Error('Points cannot be negative. Use subtractPoints for negative values.');
        }

        const previousScore = this.getScore(playerNumber);
        
        if (playerNumber === 1) {
            this.player1Score += points;
            this.statistics.player1.totalPoints += points;
        } else if (playerNumber === 2) {
            this.player2Score += points;
            this.statistics.player2.totalPoints += points;
        } else {
            throw new Error(`Invalid player number: ${playerNumber}`);
        }

        // Track score change
        this.recordScoreChange(playerNumber, points, source, previousScore);

        // Update statistics
        this.updatePlayerStatistics(playerNumber, points, source);
    }

    /**
     * Record a score change in history
     * @param {number} playerNumber - Player number
     * @param {number} points - Points added
     * @param {string} source - Source of points
     * @param {number} previousScore - Score before change
     */
    recordScoreChange(playerNumber, points, source, previousScore) {
        this.scoreHistory.push({
            timestamp: Date.now(),
            player: playerNumber,
            points: points,
            source: source,
            previousScore: previousScore,
            newScore: this.getScore(playerNumber)
        });
    }

    /**
     * Process round result and update scores
     * @param {Object} roundResult - Round result from RoundManager
     * @param {number} cardGame - Current card game number
     * @param {number} round - Current round number
     */
    processRoundResult(roundResult, cardGame, round) {
        const player1Points = roundResult.player1Points || 0;
        const player2Points = roundResult.player2Points || 0;

        // Add basic round points
        if (player1Points > 0) {
            this.addPoints(1, player1Points, 'round');
        }
        if (player2Points > 0) {
            this.addPoints(2, player2Points, 'round');
        }

        // Update round statistics
        this.updateRoundStatistics(roundResult, cardGame, round);

        // Check for bonuses
        this.checkForBonuses(roundResult, cardGame, round);
    }

    /**
     * Update round-level statistics
     * @param {Object} roundResult - Round result
     * @param {number} cardGame - Card game number
     * @param {number} round - Round number
     */
    updateRoundStatistics(roundResult, cardGame, round) {
        const winner = roundResult.winner;
        
        if (winner === 'player1') {
            this.statistics.player1.roundsWon++;
            this.statistics.player2.roundsLost++;
            this.updateWinStreak(1);
        } else if (winner === 'player2') {
            this.statistics.player2.roundsWon++;
            this.statistics.player1.roundsLost++;
            this.updateWinStreak(2);
        } else {
            this.statistics.player1.roundsTied++;
            this.statistics.player2.roundsTied++;
            this.resetWinStreaks();
        }

        // Update highest single round scores
        if (roundResult.player1Points > this.statistics.player1.highestSingleRound) {
            this.statistics.player1.highestSingleRound = roundResult.player1Points;
        }
        if (roundResult.player2Points > this.statistics.player2.highestSingleRound) {
            this.statistics.player2.highestSingleRound = roundResult.player2Points;
        }

        // Update averages
        this.updateAverages();
    }

    /**
     * Update win streak statistics
     * @param {number} winnerNumber - Player who won the round
     */
    updateWinStreak(winnerNumber) {
        const winner = this.statistics[`player${winnerNumber}`];
        const loser = this.statistics[`player${winnerNumber === 1 ? 2 : 1}`];

        winner.currentStreak++;
        winner.winStreak = Math.max(winner.winStreak, winner.currentStreak);
        loser.currentStreak = 0;
    }

    /**
     * Reset win streaks (for ties)
     */
    resetWinStreaks() {
        this.statistics.player1.currentStreak = 0;
        this.statistics.player2.currentStreak = 0;
    }

    /**
     * Update average scores
     */
    updateAverages() {
        const player1TotalRounds = this.statistics.player1.roundsWon + 
                                  this.statistics.player1.roundsLost + 
                                  this.statistics.player1.roundsTied;
        const player2TotalRounds = this.statistics.player2.roundsWon + 
                                  this.statistics.player2.roundsLost + 
                                  this.statistics.player2.roundsTied;

        if (player1TotalRounds > 0) {
            this.statistics.player1.averagePerRound = this.statistics.player1.totalPoints / player1TotalRounds;
        }
        if (player2TotalRounds > 0) {
            this.statistics.player2.averagePerRound = this.statistics.player2.totalPoints / player2TotalRounds;
        }
    }

    /**
     * Complete a card game and update card-level statistics
     * @param {Object[]} roundResults - All round results for the card
     * @param {number} cardGame - Card game number
     */
    completeCardGame(roundResults, cardGame) {
        const player1CardScore = roundResults.reduce((sum, r) => sum + (r.player1Points || 0), 0);
        const player2CardScore = roundResults.reduce((sum, r) => sum + (r.player2Points || 0), 0);

        // Record card scores
        const cardResult = {
            cardGame: cardGame,
            player1Score: player1CardScore,
            player2Score: player2CardScore,
            winner: player1CardScore > player2CardScore ? 'player1' : 
                   player2CardScore > player1CardScore ? 'player2' : 'tie',
            rounds: [...roundResults]
        };

        this.cardScores.push(cardResult);

        // Update card-level statistics
        if (cardResult.winner === 'player1') {
            this.statistics.player1.cardsWon++;
            this.statistics.player2.cardsLost++;
        } else if (cardResult.winner === 'player2') {
            this.statistics.player2.cardsWon++;
            this.statistics.player1.cardsLost++;
        } else {
            this.statistics.player1.cardsTied++;
            this.statistics.player2.cardsTied++;
        }

        // Check for comeback bonuses
        this.checkForComebacks(cardResult, cardGame);
    }

    /**
     * Check for bonus points to award
     * @param {Object} roundResult - Round result
     * @param {number} cardGame - Card game number
     * @param {number} round - Round number
     */
    checkForBonuses(roundResult, cardGame, round) {
        const config = GameConfig.SCORING;
        
        // Perfect round bonus (maximum possible points)
        if (roundResult.player1Points === config.MAX_SINGLE_ROUND_SCORE) {
            this.addBonusPoints(1, config.WIN_BONUS, 'perfect_round');
        }
        if (roundResult.player2Points === config.MAX_SINGLE_ROUND_SCORE) {
            this.addBonusPoints(2, config.WIN_BONUS, 'perfect_round');
        }

        // Win streak bonus (3+ rounds in a row)
        if (this.statistics.player1.currentStreak >= 3) {
            this.addBonusPoints(1, config.WIN_BONUS, 'win_streak');
        }
        if (this.statistics.player2.currentStreak >= 3) {
            this.addBonusPoints(2, config.WIN_BONUS, 'win_streak');
        }
    }

    /**
     * Check for comeback scenarios
     * @param {Object} cardResult - Card game result
     * @param {number} cardGame - Card game number
     */
    checkForComebacks(cardResult, cardGame) {
        // Check if player won card game despite being behind in overall score
        const overallScores = this.getScores();
        
        if (cardResult.winner === 'player1' && overallScores.player1 < overallScores.player2) {
            this.statistics.player1.comebacks++;
            this.addBonusPoints(1, GameConfig.SCORING.COMEBACK_BONUS, 'comeback');
        } else if (cardResult.winner === 'player2' && overallScores.player2 < overallScores.player1) {
            this.statistics.player2.comebacks++;
            this.addBonusPoints(2, GameConfig.SCORING.COMEBACK_BONUS, 'comeback');
        }
    }

    /**
     * Add bonus points to a player
     * @param {number} playerNumber - Player number
     * @param {number} points - Bonus points to add
     * @param {string} bonusType - Type of bonus
     */
    addBonusPoints(playerNumber, points, bonusType) {
        if (points > 0) {
            this.addPoints(playerNumber, points, `bonus_${bonusType}`);
            this.bonusPoints[`player${playerNumber}`] += points;
        }
    }

    /**
     * Get current game winner
     * @returns {string} - 'player1', 'player2', or 'tie'
     */
    getCurrentWinner() {
        if (this.player1Score > this.player2Score) return 'player1';
        if (this.player2Score > this.player1Score) return 'player2';
        return 'tie';
    }

    /**
     * Get score difference
     * @returns {number} - Positive if player1 leading, negative if player2 leading
     */
    getScoreDifference() {
        return this.player1Score - this.player2Score;
    }

    /**
     * Get detailed score breakdown
     * @returns {Object} - Detailed score information
     */
    getScoreBreakdown() {
        return {
            current: this.getScores(),
            bonus: { ...this.bonusPoints },
            difference: this.getScoreDifference(),
            winner: this.getCurrentWinner(),
            cardScores: [...this.cardScores],
            statistics: {
                player1: { ...this.statistics.player1 },
                player2: { ...this.statistics.player2 }
            }
        };
    }

    /**
     * Get score history
     * @returns {Object[]} - Array of score changes
     */
    getScoreHistory() {
        return [...this.scoreHistory];
    }

    /**
     * Get card-by-card results
     * @returns {Object[]} - Array of card game results
     */
    getCardResults() {
        return [...this.cardScores];
    }

    /**
     * Get player statistics
     * @param {number} playerNumber - Player number (1 or 2)
     * @returns {Object} - Player statistics
     */
    getPlayerStatistics(playerNumber) {
        return { ...this.statistics[`player${playerNumber}`] };
    }

    /**
     * Update player statistics for specific events
     * @param {number} playerNumber - Player number
     * @param {number} points - Points scored
     * @param {string} source - Source of points
     */
    updatePlayerStatistics(playerNumber, points, source) {
        // This method can be extended for more detailed statistics tracking
        // Currently, most updates are handled in other methods
    }

    /**
     * Validate score manager state
     * @returns {boolean} - True if state is valid
     */
    validateState() {
        try {
            // Check scores are non-negative
            if (this.player1Score < 0 || this.player2Score < 0) {
                return false;
            }

            // Check statistics consistency
            const stats1 = this.statistics.player1;
            const stats2 = this.statistics.player2;

            if (stats1.totalPoints !== this.player1Score || stats2.totalPoints !== this.player2Score) {
                return false;
            }

            // Check card results consistency
            const cardTotal1 = this.cardScores.reduce((sum, card) => sum + card.player1Score, 0);
            const cardTotal2 = this.cardScores.reduce((sum, card) => sum + card.player2Score, 0);

            if (cardTotal1 > this.player1Score || cardTotal2 > this.player2Score) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Score manager validation error:', error);
            return false;
        }
    }

    /**
     * Export score manager state
     * @returns {Object} - Serializable state
     */
    exportState() {
        return {
            player1Score: this.player1Score,
            player2Score: this.player2Score,
            scoreHistory: [...this.scoreHistory],
            cardScores: [...this.cardScores],
            bonusPoints: { ...this.bonusPoints },
            statistics: {
                player1: { ...this.statistics.player1 },
                player2: { ...this.statistics.player2 }
            }
        };
    }

    /**
     * Import score manager state
     * @param {Object} state - State to import
     */
    importState(state) {
        this.player1Score = state.player1Score || 0;
        this.player2Score = state.player2Score || 0;
        this.scoreHistory = [...(state.scoreHistory || [])];
        this.cardScores = [...(state.cardScores || [])];
        this.bonusPoints = { ...(state.bonusPoints || { player1: 0, player2: 0 }) };
        this.statistics = {
            player1: { ...this.initPlayerStats(), ...(state.statistics?.player1 || {}) },
            player2: { ...this.initPlayerStats(), ...(state.statistics?.player2 || {}) }
        };

        // Validate imported state
        if (!this.validateState()) {
            throw new Error('Invalid score manager state imported');
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoreManager };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.ScoreManager = ScoreManager;
}