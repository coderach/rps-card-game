// shared/ai/ai-strategy.js - AI Decision Making Logic

/**
 * AIStrategy class containing all AI decision-making algorithms
 * Reusable across console, web testing, and future environments
 */
class AIStrategy {
    /**
     * Choose the best card and property combination for AI in multi-card mode
     * @param {Card[]} availableCards - Available AI cards
     * @param {string[]} availableProperties - Available properties for current card
     * @param {Card[]} allPossibleOpponentCards - All possible opponent cards
     * @param {string[]} usedOpponentProperties - Properties already used by opponent
     * @param {string} difficulty - AI difficulty level
     * @returns {Object} - {cardIndex, property}
     */
    static chooseBestMove(availableCards, availableProperties, allPossibleOpponentCards, usedOpponentProperties, difficulty = 'normal') {
        if (availableCards.length === 0 || availableProperties.length === 0) {
            throw new Error('No available cards or properties for AI');
        }

        // If only one option available, return it
        if (availableCards.length === 1 && availableProperties.length === 1) {
            return { cardIndex: 0, property: availableProperties[0] };
        }

        let bestScore = -Infinity;
        let bestCardIndex = 0;
        let bestProperty = availableProperties[0];

        // Evaluate each card-property combination
        availableCards.forEach((card, cardIndex) => {
            availableProperties.forEach(property => {
                const score = this.evaluateMove(
                    card, 
                    property, 
                    allPossibleOpponentCards, 
                    usedOpponentProperties, 
                    difficulty
                );

                if (score > bestScore) {
                    bestScore = score;
                    bestProperty = property;
                    bestCardIndex = cardIndex;
                }
            });
        });

        return { cardIndex: bestCardIndex, property: bestProperty };
    }

    /**
     * Choose the best property for single-card mode
     * @param {Card} card - The AI's card
     * @param {string[]} availableProperties - Available properties
     * @param {Card[]} allPossibleOpponentCards - All possible opponent cards
     * @param {string[]} usedOpponentProperties - Properties already used by opponent
     * @param {string} difficulty - AI difficulty level
     * @returns {string} - Best property to play
     */
    static chooseBestProperty(card, availableProperties, allPossibleOpponentCards, usedOpponentProperties, difficulty = 'normal') {
        if (availableProperties.length === 0) {
            throw new Error('No available properties for AI');
        }

        if (availableProperties.length === 1) {
            return availableProperties[0];
        }

        let bestProperty = availableProperties[0];
        let bestScore = -Infinity;

        availableProperties.forEach(property => {
            const score = this.evaluateMove(
                card, 
                property, 
                allPossibleOpponentCards, 
                usedOpponentProperties, 
                difficulty
            );

            if (score > bestScore) {
                bestScore = score;
                bestProperty = property;
            }
        });

        return bestProperty;
    }

    /**
     * Evaluate a specific move (card + property combination)
     * @param {Card} card - AI's card
     * @param {string} property - Property to evaluate
     * @param {Card[]} allPossibleOpponentCards - All possible opponent cards
     * @param {string[]} usedOpponentProperties - Used opponent properties
     * @param {string} difficulty - AI difficulty level
     * @returns {number} - Move evaluation score
     */
    static evaluateMove(card, property, allPossibleOpponentCards, usedOpponentProperties, difficulty) {
        const myValue = card.getProperty(property);
        let totalScore = 0;
        let scenarioCount = 0;

        // Get opponent's available properties
        const opponentAvailableProps = GameConfig.getAllProperties().filter(
            prop => !usedOpponentProperties.includes(prop)
        );

        // Simulate against all possible opponent strategies
        allPossibleOpponentCards.forEach(opponentCard => {
            opponentAvailableProps.forEach(oppProperty => {
                const oppValue = opponentCard.getProperty(oppProperty);
                
                const [myScore, oppScore] = GameRules.calculateRoundScore(
                    property, myValue, oppProperty, oppValue
                );
                
                // Net score advantage (positive good for AI, negative bad)
                const netScore = myScore - oppScore;
                totalScore += netScore;
                scenarioCount++;
            });
        });

        let avgScore = scenarioCount > 0 ? totalScore / scenarioCount : 0;

        // Apply difficulty-based modifications
        avgScore = this.applyDifficultyModifier(avgScore, difficulty, card, property);

        return avgScore;
    }

    /**
     * Apply difficulty-based modifications to move evaluation
     * @param {number} baseScore - Base evaluation score
     * @param {string} difficulty - AI difficulty level
     * @param {Card} card - AI's card
     * @param {string} property - Property being evaluated
     * @returns {number} - Modified score
     */
    static applyDifficultyModifier(baseScore, difficulty, card, property) {
        const config = GameConfig.AI_CONFIG;
        
        switch (difficulty) {
            case config.DIFFICULTY_LEVELS.EASY:
                // Easy AI makes some random choices
                return baseScore + (Math.random() - 0.5) * 2;
                
            case config.DIFFICULTY_LEVELS.NORMAL:
                // Normal AI with slight randomness
                return baseScore + (Math.random() - 0.5) * config.RANDOMNESS_FACTOR;
                
            case config.DIFFICULTY_LEVELS.HARD:
                // Hard AI considers card synergy
                const synergy = this.calculateCardSynergy(card, property);
                return baseScore + synergy;
                
            case config.DIFFICULTY_LEVELS.EXPERT:
                // Expert AI with advanced heuristics
                const synergy2 = this.calculateCardSynergy(card, property);
                const positional = this.calculatePositionalAdvantage(card, property);
                return baseScore + synergy2 + positional;
                
            default:
                return baseScore;
        }
    }

    /**
     * Calculate synergy between card properties and chosen property
     * @param {Card} card - AI's card
     * @param {string} property - Property being evaluated
     * @returns {number} - Synergy bonus
     */
    static calculateCardSynergy(card, property) {
        const myValue = card.getProperty(property);
        const otherProperties = GameConfig.getAllProperties().filter(p => p !== property);
        
        // Bonus for playing the highest property
        const highest = card.getHighestProperty();
        if (property === highest.property) {
            return 0.5;
        }
        
        // Penalty for playing the lowest property unless it's strategic
        const lowest = card.getLowestProperty();
        if (property === lowest.property && myValue < 5) {
            return -0.3;
        }
        
        // Bonus for balanced play
        if (card.isBalanced()) {
            return 0.2;
        }
        
        return 0;
    }

    /**
     * Calculate positional advantage based on game state
     * @param {Card} card - AI's card
     * @param {string} property - Property being evaluated
     * @returns {number} - Positional bonus
     */
    static calculatePositionalAdvantage(card, property) {
        const myValue = card.getProperty(property);
        
        // Bonus for high-value plays
        if (myValue >= 8) return 0.3;
        if (myValue >= 6) return 0.1;
        
        // Penalty for very low-value plays
        if (myValue <= 2) return -0.2;
        
        return 0;
    }

    /**
     * Choose AI cards for multi-card mode (select 3 cards from available pool)
     * @param {Card[]} availableCards - All available cards
     * @param {Card[]} excludeCards - Cards to exclude (opponent's cards)
     * @param {string} difficulty - AI difficulty level
     * @returns {Card[]} - Selected AI cards
     */
    static chooseAICards(availableCards, excludeCards = [], difficulty = 'normal') {
        const config = GameConfig.AI_CONFIG;
        
        // Filter out excluded cards
        const selectableCards = availableCards.filter(card => 
            !excludeCards.some(excluded => excluded.id === card.id)
        );
        
        if (selectableCards.length < GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER) {
            throw new Error('Not enough cards available for AI selection');
        }

        switch (difficulty) {
            case config.DIFFICULTY_LEVELS.EASY:
                return this.selectRandomCards(selectableCards, GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER);
                
            case config.DIFFICULTY_LEVELS.NORMAL:
                return this.selectBalancedCards(selectableCards, GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER);
                
            case config.DIFFICULTY_LEVELS.HARD:
                return this.selectStrategicCards(selectableCards, GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER);
                
            case config.DIFFICULTY_LEVELS.EXPERT:
                return this.selectOptimalCards(selectableCards, GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER);
                
            default:
                return this.selectBalancedCards(selectableCards, GameConfig.GAME_MECHANICS.CARDS_PER_PLAYER);
        }
    }

    /**
     * Select random cards for easy AI
     * @param {Card[]} availableCards - Available cards
     * @param {number} count - Number of cards to select
     * @returns {Card[]} - Selected cards
     */
    static selectRandomCards(availableCards, count) {
        const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Select balanced cards for normal AI
     * @param {Card[]} availableCards - Available cards
     * @param {number} count - Number of cards to select
     * @returns {Card[]} - Selected cards
     */
    static selectBalancedCards(availableCards, count) {
        // Prefer balanced cards but include some variety
        const balanced = availableCards.filter(card => card.isBalanced());
        const extreme = availableCards.filter(card => !card.isBalanced());
        
        const selected = [];
        
        // Select mostly balanced cards
        const balancedToSelect = Math.min(count - 1, balanced.length);
        selected.push(...this.selectRandomCards(balanced, balancedToSelect));
        
        // Fill remaining with extreme cards
        const remaining = count - selected.length;
        if (remaining > 0 && extreme.length > 0) {
            selected.push(...this.selectRandomCards(extreme, remaining));
        } else if (remaining > 0) {
            // Fallback to any available cards
            const remainingCards = availableCards.filter(card => 
                !selected.some(s => s.id === card.id)
            );
            selected.push(...this.selectRandomCards(remainingCards, remaining));
        }
        
        return selected;
    }

    /**
     * Select strategic cards for hard AI
     * @param {Card[]} availableCards - Available cards
     * @param {number} count - Number of cards to select
     * @returns {Card[]} - Selected cards
     */
    static selectStrategicCards(availableCards, count) {
        // Select cards with good property distribution
        const scored = availableCards.map(card => ({
            card,
            score: this.scoreCardForSelection(card)
        }));
        
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, count).map(item => item.card);
    }

    /**
     * Select optimal cards for expert AI
     * @param {Card[]} availableCards - Available cards
     * @param {number} count - Number of cards to select
     * @returns {Card[]} - Selected cards
     */
    static selectOptimalCards(availableCards, count) {
        // Advanced card selection considering synergies
        const selected = [];
        const remaining = [...availableCards];
        
        for (let i = 0; i < count && remaining.length > 0; i++) {
            let bestCard = remaining[0];
            let bestScore = -Infinity;
            
            remaining.forEach(card => {
                const score = this.scoreCardForSelection(card) + 
                             this.calculateSynergyWithSelected(card, selected);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestCard = card;
                }
            });
            
            selected.push(bestCard);
            remaining.splice(remaining.indexOf(bestCard), 1);
        }
        
        return selected;
    }

    /**
     * Score a card for selection purposes
     * @param {Card} card - Card to score
     * @returns {number} - Selection score
     */
    static scoreCardForSelection(card) {
        let score = 0;
        
        // Bonus for high total value potential
        const highest = card.getHighestProperty().value;
        score += highest * 0.5;
        
        // Bonus for balanced cards
        if (card.isBalanced()) {
            score += 2;
        }
        
        // Bonus for having at least one high value
        if (highest >= 8) {
            score += 1;
        }
        
        // Penalty for having very low values
        const lowest = card.getLowestProperty().value;
        if (lowest <= 2) {
            score -= 1;
        }
        
        return score;
    }

    /**
     * Calculate synergy between a card and already selected cards
     * @param {Card} card - Card to evaluate
     * @param {Card[]} selectedCards - Already selected cards
     * @returns {number} - Synergy score
     */
    static calculateSynergyWithSelected(card, selectedCards) {
        if (selectedCards.length === 0) return 0;
        
        let synergy = 0;
        
        // Prefer diverse property strengths
        GameConfig.getAllProperties().forEach(property => {
            const myValue = card.getProperty(property);
            const hasStrongInProperty = selectedCards.some(selected => 
                selected.getProperty(property) >= 7
            );
            
            if (!hasStrongInProperty && myValue >= 7) {
                synergy += 1; // Bonus for filling a gap
            }
        });
        
        return synergy;
    }

    /**
     * Get AI thinking delay based on difficulty
     * @param {string} difficulty - AI difficulty level
     * @returns {number} - Delay in milliseconds
     */
    static getThinkingDelay(difficulty = 'normal') {
        const baseDelay = GameConfig.AI_CONFIG.THINKING_DELAY;
        const config = GameConfig.AI_CONFIG;
        
        switch (difficulty) {
            case config.DIFFICULTY_LEVELS.EASY:
                return baseDelay * 0.5;
            case config.DIFFICULTY_LEVELS.NORMAL:
                return baseDelay;
            case config.DIFFICULTY_LEVELS.HARD:
                return baseDelay * 1.5;
            case config.DIFFICULTY_LEVELS.EXPERT:
                return baseDelay * 2;
            default:
                return baseDelay;
        }
    }

    /**
     * Validate AI inputs
     * @param {Card[]} availableCards - Available cards
     * @param {string[]} availableProperties - Available properties
     * @returns {boolean} - True if inputs are valid
     */
    static validateInputs(availableCards, availableProperties) {
        if (!Array.isArray(availableCards) || availableCards.length === 0) {
            return false;
        }
        
        if (!Array.isArray(availableProperties) || availableProperties.length === 0) {
            return false;
        }
        
        // Validate all cards are Card instances
        if (!availableCards.every(card => card instanceof Card)) {
            return false;
        }
        
        // Validate all properties are valid
        if (!availableProperties.every(prop => GameConfig.isValidProperty(prop))) {
            return false;
        }
        
        return true;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIStrategy };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.AIStrategy = AIStrategy;
}