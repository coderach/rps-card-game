// shared/core/game-rules.js - Game Rules and Scoring Logic

/**
 * GameRules class containing all game mechanics and calculations
 * Reusable across console, web testing, and future Cardano integration
 */
class GameRules {
    /**
     * Property winning relationships
     * Each property beats one other property
     */
    static WINNING_RULES = {
        'deception': 'attack',    // Deception beats Attack
        'attack': 'magic',        // Attack beats Magic  
        'magic': 'deception'      // Magic beats Deception
    };

    /**
     * Property display names with icons
     */
    static PROPERTY_NAMES = {
        'deception': '🎭 Deception',
        'magic': '✨ Magic',
        'attack': '⚔️ Attack'
    };

    /**
     * Property icons only
     */
    static PROPERTY_ICONS = {
        'deception': '🎭',
        'magic': '✨',
        'attack': '⚔️'
    };

    /**
     * Legacy property mapping for backward compatibility
     */
    static LEGACY_PROPERTY_MAP = {
        'rock': 'deception',
        'paper': 'magic',
        'scissors': 'attack'
    };

    /**
     * All valid property names
     */
    static VALID_PROPERTIES = ['deception', 'magic', 'attack'];

    /**
     * Calculate the score for a round between two players
     * @param {string} prop1 - Player 1's property
     * @param {number} val1 - Player 1's value
     * @param {string} prop2 - Player 2's property  
     * @param {number} val2 - Player 2's value
     * @returns {number[]} - [player1Score, player2Score]
     */
    static calculateRoundScore(prop1, val1, prop2, val2) {
        // Validate inputs
        if (!this.isValidProperty(prop1) || !this.isValidProperty(prop2)) {
            throw new Error('Invalid property names provided');
        }
        
        if (!this.isValidPropertyValue(val1) || !this.isValidPropertyValue(val2)) {
            throw new Error('Invalid property values provided');
        }

        // Convert legacy property names
        prop1 = this.normalizeProperty(prop1);
        prop2 = this.normalizeProperty(prop2);
        
        if (prop1 === prop2) {
            // Same property - higher value wins the difference
            if (val1 > val2) return [val1 - val2, 0];
            if (val2 > val1) return [0, val2 - val1];
            return [0, 0]; // Tie
        }

        // Different properties - check winning rules
        // Only score if you have the winning property AND higher value
        if (this.WINNING_RULES[prop1] === prop2 && val1 > val2) {
            return [val1 - val2, 0];
        }
        if (this.WINNING_RULES[prop2] === prop1 && val2 > val1) {
            return [0, val2 - val1];
        }
        
        // No one scores (wrong property or lower value)
        return [0, 0];
    }

    /**
     * Normalize property name (convert legacy to new)
     * @param {string} property - Property name to normalize
     * @returns {string} - Normalized property name
     */
    static normalizeProperty(property) {
        return this.LEGACY_PROPERTY_MAP[property] || property;
    }

    /**
     * Check if property name is valid (including legacy names)
     * @param {string} property - Property name to check
     * @returns {boolean} - True if valid
     */
    static isValidProperty(property) {
        const normalized = this.normalizeProperty(property);
        return this.VALID_PROPERTIES.includes(normalized);
    }

    /**
     * Check if property value is valid
     * @param {number} value - Property value to check
     * @returns {boolean} - True if valid
     */
    static isValidPropertyValue(value) {
        return Number.isInteger(value) && value >= 1 && value <= 9;
    }

    /**
     * Get the display name for a property
     * @param {string} property - The property key
     * @returns {string} - Display name with icon
     */
    static getPropertyDisplayName(property) {
        const normalized = this.normalizeProperty(property);
        return this.PROPERTY_NAMES[normalized] || property;
    }

    /**
     * Get the icon for a property
     * @param {string} property - The property key
     * @returns {string} - Property icon
     */
    static getPropertyIcon(property) {
        const normalized = this.normalizeProperty(property);
        return this.PROPERTY_ICONS[normalized] || '';
    }

    /**
     * Determine if one property beats another
     * @param {string} prop1 - First property
     * @param {string} prop2 - Second property
     * @returns {boolean} - True if prop1 beats prop2
     */
    static doesPropertyBeat(prop1, prop2) {
        const normalized1 = this.normalizeProperty(prop1);
        const normalized2 = this.normalizeProperty(prop2);
        return this.WINNING_RULES[normalized1] === normalized2;
    }

    /**
     * Get what property beats the given property
     * @param {string} property - Property to find counter for
     * @returns {string} - Property that beats the given property
     */
    static getCounterProperty(property) {
        const normalized = this.normalizeProperty(property);
        
        // Find which property beats the given property
        for (const [beater, beaten] of Object.entries(this.WINNING_RULES)) {
            if (beaten === normalized) {
                return beater;
            }
        }
        
        throw new Error(`No counter property found for: ${property}`);
    }

    /**
     * Get what property is beaten by the given property
     * @param {string} property - Property to find victim for
     * @returns {string} - Property that is beaten by the given property
     */
    static getBeatenProperty(property) {
        const normalized = this.normalizeProperty(property);
        return this.WINNING_RULES[normalized];
    }

    /**
     * Determine round outcome without calculating scores
     * @param {string} prop1 - Player 1's property
     * @param {number} val1 - Player 1's value
     * @param {string} prop2 - Player 2's property
     * @param {number} val2 - Player 2's value
     * @returns {string} - 'player1', 'player2', or 'tie'
     */
    static getRoundWinner(prop1, val1, prop2, val2) {
        const [score1, score2] = this.calculateRoundScore(prop1, val1, prop2, val2);
        
        if (score1 > score2) return 'player1';
        if (score2 > score1) return 'player2';
        return 'tie';
    }

    /**
     * Get a human-readable explanation of why a round had its outcome
     * @param {string} prop1 - Player 1's property
     * @param {number} val1 - Player 1's value
     * @param {string} prop2 - Player 2's property
     * @param {number} val2 - Player 2's value
     * @returns {string} - Explanation of the outcome
     */
    static explainRoundOutcome(prop1, val1, prop2, val2) {
        const normalized1 = this.normalizeProperty(prop1);
        const normalized2 = this.normalizeProperty(prop2);
        
        if (normalized1 === normalized2) {
            if (val1 > val2) {
                return `Both played ${this.getPropertyDisplayName(normalized1)}, but Player 1's value (${val1}) was higher than Player 2's (${val2})`;
            } else if (val2 > val1) {
                return `Both played ${this.getPropertyDisplayName(normalized1)}, but Player 2's value (${val2}) was higher than Player 1's (${val1})`;
            } else {
                return `Both played ${this.getPropertyDisplayName(normalized1)} with the same value (${val1})`;
            }
        }
        
        const prop1Beats = this.doesPropertyBeat(normalized1, normalized2);
        const prop2Beats = this.doesPropertyBeat(normalized2, normalized1);
        
        if (prop1Beats && val1 > val2) {
            return `${this.getPropertyDisplayName(normalized1)} beats ${this.getPropertyDisplayName(normalized2)}, and Player 1's value (${val1}) was higher`;
        } else if (prop2Beats && val2 > val1) {
            return `${this.getPropertyDisplayName(normalized2)} beats ${this.getPropertyDisplayName(normalized1)}, and Player 2's value (${val2}) was higher`;
        } else if (prop1Beats) {
            return `${this.getPropertyDisplayName(normalized1)} beats ${this.getPropertyDisplayName(normalized2)}, but Player 1's value (${val1}) was not higher than Player 2's (${val2})`;
        } else if (prop2Beats) {
            return `${this.getPropertyDisplayName(normalized2)} beats ${this.getPropertyDisplayName(normalized1)}, but Player 2's value (${val2}) was not higher than Player 1's (${val1})`;
        }
        
        return `Neither player could score - no winning property combination with higher value`;
    }

    /**
     * Get all valid properties in current naming convention
     * @returns {string[]} - Array of valid property names
     */
    static getAllProperties() {
        return [...this.VALID_PROPERTIES];
    }

    /**
     * Validate a complete round input
     * @param {string} prop1 - Player 1's property
     * @param {number} val1 - Player 1's value
     * @param {string} prop2 - Player 2's property
     * @param {number} val2 - Player 2's value
     * @returns {boolean} - True if all inputs are valid
     */
    static validateRoundInput(prop1, val1, prop2, val2) {
        return this.isValidProperty(prop1) && 
               this.isValidProperty(prop2) && 
               this.isValidPropertyValue(val1) && 
               this.isValidPropertyValue(val2);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameRules };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.GameRules = GameRules;
}