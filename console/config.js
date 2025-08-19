// console/config.js - Game Configuration for Console Version
module.exports = {
    // Game Rules
    CARD_PROPERTY_SUM: 20,
    PROPERTY_MIN_VALUE: 1,
    PROPERTY_MAX_VALUE: 9,
    
    // Testing Configuration
    TEST_SCENARIOS: {
        AI_VS_AI: 100,
        AI_VS_RANDOM: 100,
        AI_VS_AI_MULTI: 100,
        AI_VS_RANDOM_MULTI: 100,
        TOTAL_TEST_GAMES: 1000
    },
    
    // Game Flow
    CARDS_PER_GAME: 1, // For single card games
    CARDS_PER_MULTI_GAME: 3, // For multi-card games
    ROUNDS_PER_CARD: 3,
    AUTO_PLAY_FINAL_ROUND: true,
    REVEAL_DELAY_MS: 1000,
    
    // Display Settings
    SHOW_DETAILED_RESULTS: true,
    SHOW_CARD_GENERATION_INFO: false,
    
    // AI Settings
    AI_STRATEGY: 'ADVANCED', // 'BASIC', 'ADVANCED', 'RANDOM'
    
    // Properties mapping
    PROPERTIES: {
        ROCK: 'r',
        PAPER: 'p', 
        SCISSORS: 's'
    },
    
    PROPERTY_NAMES: {
        'r': 'Rock',
        'p': 'Paper',
        's': 'Scissors'
    },
    
    // Winning rules: key beats value
    WINNING_RULES: {
        'r': 's', // Rock beats Scissors
        's': 'p', // Scissors beats Paper  
        'p': 'r'  // Paper beats Rock
    }
};