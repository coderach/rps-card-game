// shared/game-engine/match-manager.js - Match Management Logic

/**
 * MatchManager class for coordinating complete game matches
 * Reusable across console, web testing, and future environments
 */
class MatchManager {
    constructor(player1Cards, player2Cards, gameMode = 'demo') {
        this.matchId = this.generateMatchId();
        this.gameMode = gameMode;
        
        // Validate input cards
        if (!this.validatePlayerCards(player1Cards, player2Cards)) {
            throw new Error('Invalid player cards provided');
        }
        
        this.player1Cards = [...player1Cards];
        this.player2Cards = [...player2Cards];
        
        // Match progression
        this.currentCardGame = 1;
        this.maxCardGames = GameConfig.GAME_MECHANICS.TOTAL_CARD_GAMES;
        this.matchPhase = GameConfig.GAME_PHASES.CARD_SELECTION;
        
        // Current card selections
        this.player1SelectedCard = null;
        this.player2SelectedCard = null;
        
        // Initialize managers
        this.roundManager = new RoundManager();
        this.scoreManager = new ScoreManager();
        
        // Match results
        this.cardGameResults = [];
        this.matchResult = null;
        
        // Match settings
        this.autoProgressCards = true;
        this.allowSpectators = false;
        this.timeouts = {
            cardSelection: GameConfig.UI_CONFIG.CARD_SELECTION_TIMEOUT,
            propertySelection: GameConfig.UI_CONFIG.PROPERTY_SELECTION_TIMEOUT
        };
        
        // Match start time
        this.startTime = Date.now();
        this.endTime = null;
    }

    /**
     * Generate unique match ID
     * @returns {string} - Unique match identifier
     */
    generateMatchId() {
        return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Validate player cards
     * @param {Card[]} player1Cards - Player 1's cards
     * @param {Card[]} player2Cards - Player 2's cards
     * @returns {boolean} - True if valid
     */
    validatePlayerCards(player1Cards, player2Cards) {
        const requiredCount = GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER;
        
        // Check arrays exist and have correct length
        if (!Array.isArray(player1Cards) || !Array.isArray(player2Cards)) {
            return false;
        }
        
        if (player1Cards.length !== requiredCount || player2Cards.length !== requiredCount) {
            return false;
        }
        
        // Check all cards are Card instances
        const allCards = [...player1Cards, ...player2Cards];
        if (!allCards.every(card => card instanceof Card)) {
            return false;
        }
        
        // Check for duplicate cards between players
        const player1Ids = player1Cards.map(card => card.id);
        const player2Ids = player2Cards.map(card => card.id);
        const duplicates = player1Ids.filter(id => player2Ids.includes(id));
        
        return duplicates.length === 0;
    }

    /**
     * Start the match
     * @returns {Object} - Match start information
     */
    startMatch() {
        this.matchPhase = GameConfig.GAME_PHASES.CARD_SELECTION;
        this.startTime = Date.now();
        
        return {
            matchId: this.matchId,
            cardGame: this.currentCardGame,
            phase: this.matchPhase,
            player1Cards: this.getPlayerCardInfo(1),
            player2Cards: this.getPlayerCardInfo(2, false), // Hide values for opponent
            instructions: this.getPhaseInstructions()
        };
    }

    /**
     * Get player card information
     * @param {number} playerNumber - Player number (1 or 2)
     * @param {boolean} showValues - Whether to show card values
     * @returns {Object[]} - Card information
     */
    getPlayerCardInfo(playerNumber, showValues = true) {
        const cards = playerNumber === 1 ? this.player1Cards : this.player2Cards;
        
        return cards.map((card, index) => ({
            index: index,
            id: card.id,
            available: index >= this.currentCardGame - 1,
            used: index < this.currentCardGame - 1,
            current: playerNumber === 1 ? index === this.player1SelectedCard : index === this.player2SelectedCard,
            values: showValues ? card.getProperties() : null,
            rarity: card.getRarity()
        }));
    }

    /**
     * Get instructions for current phase
     * @returns {string} - Phase instructions
     */
    getPhaseInstructions() {
        switch (this.matchPhase) {
            case GameConfig.GAME_PHASES.CARD_SELECTION:
                return `Select card ${this.currentCardGame} of ${this.maxCardGames} to play`;
            case GameConfig.GAME_PHASES.PROPERTY_SELECTION:
                return `Round ${this.roundManager.getCurrentRound()}: Choose a property to play`;
            case GameConfig.GAME_PHASES.ROUND_RESULT:
                return `Round ${this.roundManager.getCurrentRound()} complete`;
            case GameConfig.GAME_PHASES.CARD_COMPLETE:
                return `Card ${this.currentCardGame} complete`;
            case GameConfig.GAME_PHASES.GAME_OVER:
                return 'Match complete';
            default:
                return 'Game in progress';
        }
    }

    /**
     * Handle card selection by a player
     * @param {number} playerNumber - Player number (1 or 2)
     * @param {number} cardIndex - Index of selected card
     * @returns {Object} - Selection result
     */
    selectCard(playerNumber, cardIndex) {
        if (this.matchPhase !== GameConfig.GAME_PHASES.CARD_SELECTION) {
            throw new Error(`Cannot select card during phase: ${this.matchPhase}`);
        }

        // Validate card index
        const cards = playerNumber === 1 ? this.player1Cards : this.player2Cards;
        if (cardIndex < 0 || cardIndex >= cards.length) {
            throw new Error(`Invalid card index: ${cardIndex}`);
        }

        // Check if card is available (not used in previous card games)
        if (cardIndex < this.currentCardGame - 1) {
            throw new Error(`Card ${cardIndex} already used in previous card game`);
        }

        // Set card selection
        if (playerNumber === 1) {
            this.player1SelectedCard = cardIndex;
        } else {
            this.player2SelectedCard = cardIndex;
        }

        // Check if ready to proceed to property selection
        if (this.canProceedToPropertySelection()) {
            this.startPropertySelection();
        }

        return {
            success: true,
            selectedCard: cardIndex,
            readyToProceed: this.canProceedToPropertySelection(),
            nextPhase: this.matchPhase
        };
    }

    /**
     * Check if ready to proceed to property selection
     * @returns {boolean} - True if ready
     */
    canProceedToPropertySelection() {
        return this.player1SelectedCard !== null && this.player2SelectedCard !== null;
    }

    /**
     * Start property selection phase
     */
    startPropertySelection() {
        this.matchPhase = GameConfig.GAME_PHASES.PROPERTY_SELECTION;
        this.roundManager.reset();
    }

    /**
     * Handle property selection by a player
     * @param {number} playerNumber - Player number (1 or 2)
     * @param {string} property - Selected property
     * @returns {Object} - Selection result
     */
    selectProperty(playerNumber, property) {
        if (this.matchPhase !== GameConfig.GAME_PHASES.PROPERTY_SELECTION) {
            throw new Error(`Cannot select property during phase: ${this.matchPhase}`);
        }

        // Delegate to round manager
        const success = this.roundManager.selectProperty(playerNumber, property);
        
        if (success && this.roundManager.isRoundReadyForCalculation()) {
            this.calculateRound();
        }

        return {
            success: success,
            readyForCalculation: this.roundManager.isRoundReadyForCalculation(),
            availableProperties: this.roundManager.getAvailableProperties(playerNumber)
        };
    }

    /**
     * Calculate current round result
     */
    calculateRound() {
        const player1Card = this.player1Cards[this.player1SelectedCard];
        const player2Card = this.player2Cards[this.player2SelectedCard];
        
        const roundResult = this.roundManager.calculateRoundResult(player1Card, player2Card);
        this.scoreManager.processRoundResult(roundResult, this.currentCardGame, this.roundManager.getCurrentRound());
        
        this.matchPhase = GameConfig.GAME_PHASES.ROUND_RESULT;
        
        // Check if card game is complete
        if (this.roundManager.areAllRoundsComplete()) {
            this.completeCardGame();
        } else if (this.roundManager.shouldAutoPlayRound()) {
            this.autoPlayFinalRound();
        }

        return roundResult;
    }

    /**
     * Auto-play the final round
     */
    autoPlayFinalRound() {
        const player1Card = this.player1Cards[this.player1SelectedCard];
        const player2Card = this.player2Cards[this.player2SelectedCard];
        
        const roundResult = this.roundManager.autoPlayRound(player1Card, player2Card);
        this.scoreManager.processRoundResult(roundResult, this.currentCardGame, this.roundManager.getCurrentRound());
        
        this.completeCardGame();
        return roundResult;
    }

    /**
     * Advance to next round
     * @returns {boolean} - True if advanced successfully
     */
    advanceToNextRound() {
        if (this.matchPhase !== GameConfig.GAME_PHASES.ROUND_RESULT) {
            return false;
        }

        const advanced = this.roundManager.advanceToNextRound();
        if (advanced) {
            this.matchPhase = GameConfig.GAME_PHASES.PROPERTY_SELECTION;
        }
        
        return advanced;
    }

    /**
     * Complete current card game
     */
    completeCardGame() {
        const roundResults = this.roundManager.getRoundResults();
        this.scoreManager.completeCardGame(roundResults, this.currentCardGame);
        
        const cardGameResult = {
            cardGame: this.currentCardGame,
            player1Card: this.player1SelectedCard,
            player2Card: this.player2SelectedCard,
            rounds: roundResults,
            scores: this.scoreManager.getScores(),
            winner: this.scoreManager.getCurrentWinner()
        };
        
        this.cardGameResults.push(cardGameResult);
        this.matchPhase = GameConfig.GAME_PHASES.CARD_COMPLETE;
        
        // Check if match is complete
        if (this.currentCardGame >= this.maxCardGames) {
            this.completeMatch();
        }
    }

    /**
     * Advance to next card game
     * @returns {boolean} - True if advanced successfully
     */
    advanceToNextCard() {
        if (this.matchPhase !== GameConfig.GAME_PHASES.CARD_COMPLETE) {
            return false;
        }

        if (this.currentCardGame >= this.maxCardGames) {
            this.completeMatch();
            return false;
        }

        this.currentCardGame++;
        this.player1SelectedCard = null;
        this.player2SelectedCard = null;
        this.matchPhase = GameConfig.GAME_PHASES.CARD_SELECTION;
        
        return true;
    }

    /**
     * Complete the entire match
     */
    completeMatch() {
        this.endTime = Date.now();
        this.matchPhase = GameConfig.GAME_PHASES.GAME_OVER;
        
        const finalScores = this.scoreManager.getScores();
        const winner = this.scoreManager.getCurrentWinner();
        
        this.matchResult = {
            matchId: this.matchId,
            winner: winner,
            finalScores: finalScores,
            cardResults: this.cardGameResults,
            statistics: this.scoreManager.getScoreBreakdown(),
            duration: this.endTime - this.startTime,
            completedAt: this.endTime
        };
    }

    /**
     * Get current match state
     * @returns {Object} - Current match state
     */
    getMatchState() {
        return {
            matchId: this.matchId,
            gameMode: this.gameMode,
            currentCardGame: this.currentCardGame,
            maxCardGames: this.maxCardGames,
            matchPhase: this.matchPhase,
            currentRound: this.roundManager.getCurrentRound(),
            scores: this.scoreManager.getScores(),
            cardGameResults: this.cardGameResults,
            instructions: this.getPhaseInstructions(),
            timeElapsed: Date.now() - this.startTime,
            isComplete: this.matchPhase === GameConfig.GAME_PHASES.GAME_OVER
        };
    }

    /**
     * Get detailed match information
     * @returns {Object} - Detailed match information
     */
    getMatchInfo() {
        return {
            match: this.getMatchState(),
            round: this.roundManager.exportState(),
            scores: this.scoreManager.getScoreBreakdown(),
            cards: {
                player1: this.getPlayerCardInfo(1),
                player2: this.getPlayerCardInfo(2, false)
            }
        };
    }

    /**
     * Get match result (only available when complete)
     * @returns {Object|null} - Match result or null if not complete
     */
    getMatchResult() {
        return this.matchResult;
    }

    /**
     * Check if match is complete
     * @returns {boolean} - True if match is complete
     */
    isMatchComplete() {
        return this.matchPhase === GameConfig.GAME_PHASES.GAME_OVER;
    }

    /**
     * Get current winner (may change during match)
     * @returns {string} - 'player1', 'player2', or 'tie'
     */
    getCurrentWinner() {
        return this.scoreManager.getCurrentWinner();
    }

    /**
     * Validate match state
     * @returns {boolean} - True if state is valid
     */
    validateState() {
        try {
            // Check card game number is valid
            if (this.currentCardGame < 1 || this.currentCardGame > this.maxCardGames + 1) {
                return false;
            }

            // Check card selections are valid when set
            if (this.player1SelectedCard !== null && 
                (this.player1SelectedCard < 0 || this.player1SelectedCard >= this.player1Cards.length)) {
                return false;
            }

            if (this.player2SelectedCard !== null && 
                (this.player2SelectedCard < 0 || this.player2SelectedCard >= this.player2Cards.length)) {
                return false;
            }

            // Validate sub-managers
            if (!this.roundManager.validateState() || !this.scoreManager.validateState()) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Match manager validation error:', error);
            return false;
        }
    }

    /**
     * Export match state for save/load
     * @returns {Object} - Serializable match state
     */
    exportState() {
        return {
            matchId: this.matchId,
            gameMode: this.gameMode,
            player1Cards: this.player1Cards.map(card => card.toJSON()),
            player2Cards: this.player2Cards.map(card => card.toJSON()),
            currentCardGame: this.currentCardGame,
            maxCardGames: this.maxCardGames,
            matchPhase: this.matchPhase,
            player1SelectedCard: this.player1SelectedCard,
            player2SelectedCard: this.player2SelectedCard,
            cardGameResults: this.cardGameResults,
            matchResult: this.matchResult,
            startTime: this.startTime,
            endTime: this.endTime,
            roundManager: this.roundManager.exportState(),
            scoreManager: this.scoreManager.exportState()
        };
    }

    /**
     * Import match state from save/load
     * @param {Object} state - State to import
     */
    importState(state) {
        this.matchId = state.matchId;
        this.gameMode = state.gameMode || 'demo';
        this.player1Cards = state.player1Cards.map(cardData => Card.fromJSON(cardData));
        this.player2Cards = state.player2Cards.map(cardData => Card.fromJSON(cardData));
        this.currentCardGame = state.currentCardGame || 1;
        this.maxCardGames = state.maxCardGames || GameConfig.GAME_MECHANICS.TOTAL_CARD_GAMES;
        this.matchPhase = state.matchPhase || GameConfig.GAME_PHASES.CARD_SELECTION;
        this.player1SelectedCard = state.player1SelectedCard;
        this.player2SelectedCard = state.player2SelectedCard;
        this.cardGameResults = state.cardGameResults || [];
        this.matchResult = state.matchResult;
        this.startTime = state.startTime || Date.now();
        this.endTime = state.endTime;

        // Import sub-managers
        if (state.roundManager) {
            this.roundManager.importState(state.roundManager);
        }
        if (state.scoreManager) {
            this.scoreManager.importState(state.scoreManager);
        }

        // Validate imported state
        if (!this.validateState()) {
            throw new Error('Invalid match state imported');
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatchManager };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.MatchManager = MatchManager;
}