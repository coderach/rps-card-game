// shared/core/game-config.js - Game Configuration and Constants

/**
 * GameConfig class containing all game constants and configuration
 * Centralized configuration for console, web testing, and future Cardano integration
 */
class GameConfig {
    /**
     * Core game mechanics constants
     */
    static GAME_MECHANICS = {
        PROPERTY_SUM: 20,           // Total sum of all properties on a card
        MIN_PROPERTY_VALUE: 1,      // Minimum value for any property
        MAX_PROPERTY_VALUE: 9,      // Maximum value for any property
        CARDS_PER_PLAYER: 3,        // Number of cards each player gets
        ROUNDS_PER_CARD: 3,         // Number of rounds per card
        TOTAL_CARD_GAMES: 3,        // Number of card games per match
        PROPERTIES_PER_CARD: 3,     // Number of properties on each card
        AUTO_PLAY_FINAL_ROUND: true // Whether round 3 is auto-played
    };

    /**
     * Property names and identifiers
     */
    static PROPERTIES = {
        DECEPTION: 'deception',
        MAGIC: 'magic',
        ATTACK: 'attack'
    };

    /**
     * Legacy property mapping for backward compatibility
     */
    static LEGACY_PROPERTIES = {
        ROCK: 'rock',
        PAPER: 'paper',
        SCISSORS: 'scissors'
    };

    /**
     * Game phases and states
     */
    static GAME_PHASES = {
        CARD_SELECTION: 'card-selection',
        PROPERTY_SELECTION: 'property-selection',
        ROUND_RESULT: 'round-result',
        AUTO_ROUND: 'auto-round',
        CARD_COMPLETE: 'card-complete',
        GAME_OVER: 'game-over',
        WAITING: 'waiting'
    };

    /**
     * Game modes
     */
    static GAME_MODES = {
        DEMO: 'demo',                    // Testing with generated cards
        PVC: 'pvc',                      // Player vs Computer
        PVP: 'pvp',                      // Player vs Player
        BLOCKCHAIN: 'blockchain',         // Future: Real NFT gameplay
        CONSOLE: 'console'               // Console/terminal mode
    };

    /**
     * Player types
     */
    static PLAYER_TYPES = {
        HUMAN: 'human',
        AI: 'ai',
        REMOTE: 'remote'                 // Future: Remote player in PvP
    };

    /**
     * Card rarity levels (based on property distribution)
     */
    static RARITY_LEVELS = {
        LEGENDARY: 'Legendary',          // Very balanced (difference <= 1)
        EPIC: 'Epic',                    // Balanced (difference <= 3)
        RARE: 'Rare',                    // Moderate (difference <= 5)
        COMMON: 'Common'                 // Extreme (difference > 5)
    };

    /**
     * UI configuration
     */
    static UI_CONFIG = {
        ANIMATION_DURATION: 300,         // Default animation duration (ms)
        AUTO_ROUND_DELAY: 1000,         // Delay before auto-playing round 3 (ms)
        RESULT_DISPLAY_TIME: 3000,      // How long to show result messages (ms)
        CARD_HOVER_SCALE: 1.05,         // Scale factor for card hover effect
        CARD_SELECTION_TIMEOUT: 30000,  // Max time for card selection (ms)
        PROPERTY_SELECTION_TIMEOUT: 15000 // Max time for property selection (ms)
    };

    /**
     * AI configuration
     */
    static AI_CONFIG = {
        DIFFICULTY_LEVELS: {
            EASY: 'easy',
            NORMAL: 'normal',
            HARD: 'hard',
            EXPERT: 'expert'
        },
        DEFAULT_DIFFICULTY: 'normal',
        THINKING_DELAY: 500,             // Delay to simulate AI thinking (ms)
        RANDOMNESS_FACTOR: 0.1,          // How much randomness to add to AI decisions
        LOOK_AHEAD_DEPTH: 2              // How many moves ahead AI considers
    };

    /**
     * Scoring configuration
     */
    static SCORING = {
        WIN_BONUS: 0,                    // Bonus points for winning a round
        PERFECT_GAME_BONUS: 0,           // Bonus for winning all rounds
        COMEBACK_BONUS: 0,               // Bonus for winning after being behind
        MIN_SCORE: 0,                    // Minimum possible score
        MAX_SINGLE_ROUND_SCORE: 8        // Maximum points in a single round (9-1)
    };

    /**
     * Testing and development configuration
     */
    static TESTING = {
        ENABLE_DEBUG_LOGGING: false,     // Enable detailed debug logs
        MOCK_AI_DECISIONS: false,        // Use predetermined AI moves for testing
        SKIP_ANIMATIONS: false,          // Skip animations for faster testing
        PRESET_CARDS: false,             // Use preset cards instead of random
        AUTO_PLAY_ROUNDS: false,         // Auto-play all rounds for testing
        SIMULATION_SPEED: 1              // Speed multiplier for simulations
    };

    /**
     * Console-specific configuration
     */
    static CONSOLE_CONFIG = {
        COLORS_ENABLED: true,            // Use colors in console output
        DETAILED_OUTPUT: true,           // Show detailed game information
        PROMPT_TIMEOUT: 30000,           // Timeout for user input (ms)
        CLEAR_SCREEN: false,             // Clear screen between rounds
        SHOW_CARD_IDS: true             // Show card IDs in console
    };

    /**
     * Web-specific configuration
     */
    static WEB_CONFIG = {
        RESPONSIVE_BREAKPOINT: 768,      // Mobile breakpoint (px)
        CARD_GRID_COLUMNS: 6,           // Number of columns in card grid
        ENABLE_SOUND_EFFECTS: false,     // Enable sound effects
        ENABLE_PARTICLES: false,         // Enable particle effects
        SAVE_GAME_STATE: true,          // Save game state to localStorage
        THEME: 'dark'                   // Default theme
    };

    /**
     * Future blockchain configuration (placeholder)
     */
    static BLOCKCHAIN_CONFIG = {
        NETWORK: 'testnet',              // 'mainnet', 'testnet', 'local'
        CONTRACT_TIMEOUT: 60000,         // Smart contract interaction timeout (ms)
        CONFIRMATION_BLOCKS: 1,          // Required confirmation blocks
        GAS_LIMIT: 1000000,             // Maximum gas for transactions
        ESCROW_TIMEOUT: 60000,          // NFT transfer timeout (ms)
        ENABLE_STAKE_MODE: false,       // Enable NFT staking gameplay
        POLICY_IDS: [],                 // Valid NFT policy IDs
        MIN_ADA_AMOUNT: 2000000         // Minimum ADA amount for transactions
    };

    /**
     * Get configuration for specific environment
     * @param {string} environment - 'development', 'testing', 'production'
     * @returns {Object} - Environment-specific configuration
     */
    static getEnvironmentConfig(environment = 'development') {
        const baseConfig = {
            GAME_MECHANICS: this.GAME_MECHANICS,
            PROPERTIES: this.PROPERTIES,
            GAME_PHASES: this.GAME_PHASES,
            GAME_MODES: this.GAME_MODES,
            PLAYER_TYPES: this.PLAYER_TYPES,
            RARITY_LEVELS: this.RARITY_LEVELS,
            AI_CONFIG: this.AI_CONFIG,
            SCORING: this.SCORING
        };

        switch (environment.toLowerCase()) {
            case 'development':
                return {
                    ...baseConfig,
                    UI_CONFIG: {
                        ...this.UI_CONFIG,
                        ANIMATION_DURATION: 100  // Faster animations for development
                    },
                    TESTING: {
                        ...this.TESTING,
                        ENABLE_DEBUG_LOGGING: true
                    }
                };

            case 'testing':
                return {
                    ...baseConfig,
                    UI_CONFIG: {
                        ...this.UI_CONFIG,
                        ANIMATION_DURATION: 0    // No animations for testing
                    },
                    TESTING: {
                        ...this.TESTING,
                        ENABLE_DEBUG_LOGGING: true,
                        SKIP_ANIMATIONS: true,
                        SIMULATION_SPEED: 10     // Fast simulations
                    }
                };

            case 'production':
                return {
                    ...baseConfig,
                    UI_CONFIG: this.UI_CONFIG,
                    TESTING: {
                        ...this.TESTING,
                        ENABLE_DEBUG_LOGGING: false
                    }
                };

            default:
                return baseConfig;
        }
    }

    /**
     * Validate game configuration
     * @param {Object} config - Configuration to validate
     * @returns {boolean} - True if configuration is valid
     */
    static validateConfig(config) {
        try {
            // Check required properties exist
            const required = ['GAME_MECHANICS', 'PROPERTIES', 'GAME_PHASES'];
            for (const prop of required) {
                if (!config[prop]) return false;
            }

            // Validate game mechanics
            const mechanics = config.GAME_MECHANICS;
            if (mechanics.PROPERTY_SUM !== 20) return false;
            if (mechanics.MIN_PROPERTY_VALUE < 1) return false;
            if (mechanics.MAX_PROPERTY_VALUE > 9) return false;
            if (mechanics.CARDS_PER_PLAYER !== 3) return false;

            return true;
        } catch (error) {
            console.error('Config validation error:', error);
            return false;
        }
    }

    /**
     * Get all valid property names
     * @returns {string[]} - Array of property names
     */
    static getAllProperties() {
        return Object.values(this.PROPERTIES);
    }

    /**
     * Get all valid game phases
     * @returns {string[]} - Array of game phases
     */
    static getAllGamePhases() {
        return Object.values(this.GAME_PHASES);
    }

    /**
     * Get all valid game modes
     * @returns {string[]} - Array of game modes
     */
    static getAllGameModes() {
        return Object.values(this.GAME_MODES);
    }

    /**
     * Check if a value is a valid property name
     * @param {string} property - Property to check
     * @returns {boolean} - True if valid
     */
    static isValidProperty(property) {
        return Object.values(this.PROPERTIES).includes(property) ||
               Object.values(this.LEGACY_PROPERTIES).includes(property);
    }

    /**
     * Check if a value is a valid game phase
     * @param {string} phase - Phase to check
     * @returns {boolean} - True if valid
     */
    static isValidGamePhase(phase) {
        return Object.values(this.GAME_PHASES).includes(phase);
    }

    /**
     * Check if a value is a valid game mode
     * @param {string} mode - Mode to check
     * @returns {boolean} - True if valid
     */
    static isValidGameMode(mode) {
        return Object.values(this.GAME_MODES).includes(mode);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameConfig };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
}