// console/index.js - Main Entry Point for Console Game
const { GameManager } = require('./game');
const { TestRunner, CardAnalysis } = require('./test');
const config = require('./config');

async function main() {
    console.log('🃏 Welcome to Rock Paper Scissors Card Game (Console Version)!');
    console.log(`Using configuration: ${config.CARDS_PER_GAME} card(s) per game`);
    
    const gameManager = new GameManager();
    
    while (true) {
        try {
            const choice = await gameManager.playMenu();
            
            switch (choice) {
                case '1':
                    await gameManager.playHumanVsAI();
                    break;
                    
                case '2':
                    await gameManager.playHumanVsAIMultiCard();
                    break;
                    
                case '3':
                    console.log('\n🧪 Running AI vs AI Test Suite (1 Card)...');
                    const testRunner1 = new TestRunner();
                    await testRunner1.runAIvsAITest(config.TEST_SCENARIOS.AI_VS_AI);
                    testRunner1.displayResults();
                    break;
                    
                case '4':
                    console.log('\n🧪 Running AI vs Random Test Suite (1 Card)...');
                    const testRunner2 = new TestRunner();
                    await testRunner2.runAIvsRandomTest(config.TEST_SCENARIOS.AI_VS_RANDOM);
                    testRunner2.displayResults();
                    break;
                    
                case '5':
                    console.log('\n🧪 Running AI vs AI Test Suite (3 Cards)...');
                    const testRunner3 = new TestRunner();
                    await testRunner3.runAIvsAIMultiTest(config.TEST_SCENARIOS.AI_VS_AI_MULTI);
                    testRunner3.displayResults();
                    break;
                    
                case '6':
                    console.log('\n🧪 Running AI vs Random Test Suite (3 Cards)...');
                    const testRunner4 = new TestRunner();
                    await testRunner4.runAIvsRandomMultiTest(config.TEST_SCENARIOS.AI_VS_RANDOM_MULTI);
                    testRunner4.displayResults();
                    break;
                    
                case '7':
                    console.log('\n👋 Thanks for playing! Goodbye!');
                    gameManager.close();
                    process.exit(0);
                    break;
                    
                default:
                    console.log('Invalid option. Please choose 1-7.');
            }
            
            console.log('\nPress Enter to continue...');
            await new Promise(resolve => {
                gameManager.rl.question('', () => resolve());
            });
            
        } catch (error) {
            console.error('An error occurred:', error.message);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };