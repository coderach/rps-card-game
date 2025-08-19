// shared/game-engine/round-manager.js - Round Management Logic

/**
 * RoundManager class for handling round progression and state
 * Reusable across console, web testing, and future environments
 */
class RoundManager {
    constructor() {
        this.currentRound = 1;
        this.maxRounds = GameConfig.GAME_MECHANICS.ROUNDS_PER_CARD;
        this.roundResults = [];
        this.usedPlayer1Properties = [];
        this.usedPlayer2Properties = [];
        this.currentPlayer1Property = null;
        this.currentPlayer2Property = null;
        this.roundPhase = GameConfig.GAME_PHASES.PROPERTY_SELECTION;
        this.autoPlayEnabled = GameConfig.GAME_MECHANICS.AUTO_PLAY_FINAL_ROUND;
    }

    /**
     * Reset round manager for a new card game
     */
    reset() {
        this.currentRound = 1;
        this.roundResults = [];
        this.usedPlayer1Properties = [];
        this.usedPlayer2Properties = [];
        this.currentPlayer1Property = null;
        this.currentPlayer2Property = null;
        this.roundPhase = GameConfig.GAME_PHASES.PROPERTY_SELECTION;
    }

    /**
     * Get current round number
     * @returns {number} - Current round (1-3)
     */
    getCurrentRound() {
        return this.currentRound;
    }

    /**
     * Get maximum rounds per card
     * @returns {number} - Maximum rounds
     */
    getMaxRounds() {
        return this.maxRounds;
    }

    /**
     * Check if this is the final round
     * @returns {boolean} - True if final round
     */
    isFinalRound() {
        return this.currentRound === this.maxRounds;
    }

    /**
     * Check if all rounds are complete
     * @returns {boolean} - True if all rounds complete
     */
    areAllRoundsComplete() {
        return this.currentRound > this.maxRounds;
    }

    /**
     * Get available properties for a player
     * @param {number} playerNumber - Player number (1 or 2)
     * @returns {string[]} - Available properties
     */
    getAvailableProperties(playerNumber) {
        const usedProperties = playerNumber === 1 ? this.usedPlayer1Properties : this.usedPlayer2Properties;
        return GameConfig.getAllProperties().filter(prop => !usedProperties.includes(prop));
    }

    /**
     * Check if a property is available for a player
     * @param {number} playerNumber - Player number (1 or 2)
     * @param {string} property - Property to check
     * @returns {boolean} - True if property is available
     */
    isPropertyAvailable(playerNumber, property) {
        const usedProperties = playerNumber === 1 ? this.usedPlayer1Properties : this.usedPlayer2Properties;
        return !usedProperties.includes(property);
    }

    /**
     * Select property for a player
     * @param {number} playerNumber - Player number (1 or 2)
     * @param {string} property - Property to select
     * @returns {boolean} - True if selection successful
     */
    selectProperty(playerNumber, property) {
        // Validate property
        if (!GameConfig.isValidProperty(property)) {
            throw new Error(`Invalid property: ${property}`);
        }

        // Check if property is available
        if (!this.isPropertyAvailable(playerNumber, property)) {
            throw new Error(`Property ${property} not available for player ${playerNumber}`);
        }

        // Set property for player
        if (playerNumber === 1) {
            this.currentPlayer1Property = property;
            this.usedPlayer1Properties.push(property);
        } else if (playerNumber === 2) {
            this.currentPlayer2Property = property;
            this.usedPlayer2Properties.push(property);
        } else {
            throw new Error(`Invalid player number: ${playerNumber}`);
        }

        return true;
    }

    /**
     * Check if round is ready to be calculated
     * @returns {boolean} - True if both players have selected properties
     */
    isRoundReadyForCalculation() {
        return this.currentPlayer1Property !== null && this.currentPlayer2Property !== null;
    }

    /**
     * Calculate current round result
     * @param {Card} player1Card - Player 1's card
     * @param {Card} player2Card - Player 2's card
     * @returns {Object} - Round result
     */
    calculateRoundResult(player1Card, player2Card) {
        if (!this.isRoundReadyForCalculation()) {
            throw new Error('Round not ready for calculation - missing property selections');
        }

        const player1Value = player1Card.getProperty(this.currentPlayer1Property);
        const player2Value = player2Card.getProperty(this.currentPlayer2Property);

        const [player1Points, player2Points] = GameRules.calculateRoundScore(
            this.currentPlayer1Property, player1Value,
            this.currentPlayer2Property, player2Value
        );

        const roundResult = {
            round: this.currentRound,
            player1Property: this.currentPlayer1Property,
            player1Value: player1Value,
            player1Points: player1Points,
            player2Property: this.currentPlayer2Property,
            player2Value: player2Value,
            player2Points: player2Points,
            winner: this.determineRoundWinner(player1Points, player2Points),
            explanation: GameRules.explainRoundOutcome(
                this.currentPlayer1Property, player1Value,
                this.currentPlayer2Property, player2Value
            )
        };

        this.roundResults.push(roundResult);
        this.roundPhase = GameConfig.GAME_PHASES.ROUND_RESULT;

        return roundResult;
    }

    /**
     * Determine round winner
     * @param {number} player1Points - Player 1's points
     * @param {number} player2Points - Player 2's points
     * @returns {string} - 'player1', 'player2', or 'tie'
     */
    determineRoundWinner(player1Points, player2Points) {
        if (player1Points > player2Points) return 'player1';
        if (player2Points > player1Points) return 'player2';
        return 'tie';
    }

    /**
     * Advance to next round
     * @returns {boolean} - True if advanced, false if no more rounds
     */
    advanceToNextRound() {
        if (this.areAllRoundsComplete()) {
            return false;
        }

        this.currentRound++;
        this.currentPlayer1Property = null;
        this.currentPlayer2Property = null;
        this.roundPhase = GameConfig.GAME_PHASES.PROPERTY_SELECTION;

        return true;
    }

    /**
     * Check if round should be auto-played
     * @returns {boolean} - True if should auto-play
     */
    shouldAutoPlayRound() {
        return this.autoPlayEnabled && this.isFinalRound() && 
               this.getAvailableProperties(1).length === 1 && 
               this.getAvailableProperties(2).length === 1;
    }

    /**
     * Auto-play the current round (used for final round)
     * @param {Card} player1Card - Player 1's card
     * @param {Card} player2Card - Player 2's card
     * @returns {Object} - Auto-played round result
     */
    autoPlayRound(player1Card, player2Card) {
        if (!this.shouldAutoPlayRound()) {
            throw new Error('Round cannot be auto-played');
        }

        const player1FinalProperty = this.getAvailableProperties(1)[0];
        const player2FinalProperty = this.getAvailableProperties(2)[0];

        this.selectProperty(1, player1FinalProperty);
        this.selectProperty(2, player2FinalProperty);

        this.roundPhase = GameConfig.GAME_PHASES.AUTO_ROUND;
        const result = this.calculateRoundResult(player1Card, player2Card);
        
        return result;
    }

    /**
     * Get all round results
     * @returns {Object[]} - Array of round results
     */
    getRoundResults() {
        return [...this.roundResults];
    }

    /**
     * Get specific round result
     * @param {number} roundNumber - Round number to get
     * @returns {Object|null} - Round result or null if not found
     */
    getRoundResult(roundNumber) {
        return this.roundResults.find(result => result.round === roundNumber) || null;
    }

    /**
     * Get current round phase
     * @returns {string} - Current game phase
     */
    getRoundPhase() {
        return this.roundPhase;
    }

    /**
     * Set round phase
     * @param {string} phase - Game phase to set
     */
    setRoundPhase(phase) {
        if (!GameConfig.isValidGamePhase(phase)) {
            throw new Error(`Invalid game phase: ${phase}`);
        }
        this.roundPhase = phase;
    }

    /**
     * Get round summary statistics
     * @returns {Object} - Round statistics
     */
    getRoundSummary() {
        const summary = {
            totalRounds: this.roundResults.length,
            player1Wins: 0,
            player2Wins: 0,
            ties: 0,
            player1TotalPoints: 0,
            player2TotalPoints: 0,
            roundDetails: []
        };

        this.roundResults.forEach(result => {
            summary.player1TotalPoints += result.player1Points;
            summary.player2TotalPoints += result.player2Points;

            if (result.winner === 'player1') {
                summary.player1Wins++;
            } else if (result.winner === 'player2') {
                summary.player2Wins++;
            } else {
                summary.ties++;
            }

            summary.roundDetails.push({
                round: result.round,
                winner: result.winner,
                player1: `${GameRules.getPropertyIcon(result.player1Property)} ${result.player1Value}`,
                player2: `${GameRules.getPropertyIcon(result.player2Property)} ${result.player2Value}`,
                score: `${result.player1Points}-${result.player2Points}`
            });
        });

        return summary;
    }

    /**
     * Get next round preview (what properties are available)
     * @returns {Object} - Next round preview
     */
    getNextRoundPreview() {
        if (this.areAllRoundsComplete()) {
            return null;
        }

        return {
            nextRound: this.currentRound + 1,
            player1AvailableProperties: this.getAvailableProperties(1),
            player2AvailableProperties: this.getAvailableProperties(2),
            willAutoPlay: this.shouldAutoPlayRound()
        };
    }

    /**
     * Validate round manager state
     * @returns {boolean} - True if state is valid
     */
    validateState() {
        try {
            // Check round number is valid
            if (this.currentRound < 1 || this.currentRound > this.maxRounds + 1) {
                return false;
            }

            // Check used properties don't exceed limits
            if (this.usedPlayer1Properties.length > this.maxRounds || 
                this.usedPlayer2Properties.length > this.maxRounds) {
                return false;
            }

            // Check no duplicate properties
            const unique1 = new Set(this.usedPlayer1Properties);
            const unique2 = new Set(this.usedPlayer2Properties);
            if (unique1.size !== this.usedPlayer1Properties.length || 
                unique2.size !== this.usedPlayer2Properties.length) {
                return false;
            }

            // Check round results count matches expected
            const expectedResults = Math.min(this.currentRound - 1, this.maxRounds);
            if (this.roundResults.length !== expectedResults) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Round manager validation error:', error);
            return false;
        }
    }

    /**
     * Export round manager state
     * @returns {Object} - Serializable state
     */
    exportState() {
        return {
            currentRound: this.currentRound,
            maxRounds: this.maxRounds,
            roundResults: this.roundResults,
            usedPlayer1Properties: [...this.usedPlayer1Properties],
            usedPlayer2Properties: [...this.usedPlayer2Properties],
            currentPlayer1Property: this.currentPlayer1Property,
            currentPlayer2Property: this.currentPlayer2Property,
            roundPhase: this.roundPhase,
            autoPlayEnabled: this.autoPlayEnabled
        };
    }

    /**
     * Import round manager state
     * @param {Object} state - State to import
     */
    importState(state) {
        this.currentRound = state.currentRound || 1;
        this.maxRounds = state.maxRounds || GameConfig.GAME_MECHANICS.ROUNDS_PER_CARD;
        this.roundResults = state.roundResults || [];
        this.usedPlayer1Properties = [...(state.usedPlayer1Properties || [])];
        this.usedPlayer2Properties = [...(state.usedPlayer2Properties || [])];
        this.currentPlayer1Property = state.currentPlayer1Property || null;
        this.currentPlayer2Property = state.currentPlayer2Property || null;
        this.roundPhase = state.roundPhase || GameConfig.GAME_PHASES.PROPERTY_SELECTION;
        this.autoPlayEnabled = state.autoPlayEnabled !== undefined ? state.autoPlayEnabled : true;

        // Validate imported state
        if (!this.validateState()) {
            throw new Error('Invalid round manager state imported');
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RoundManager };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.RoundManager = RoundManager;
}