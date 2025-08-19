// console/test.js - Test Scenarios and Statistics for Console Version
const { CardGenerator, AIPlayer, RandomPlayer, Game } = require('./game');
const config = require('./config');

class TestRunner {
    constructor() {
        this.results = {
            aiVsAi: { wins1: 0, wins2: 0, ties: 0, games: [] },
            aiVsRandom: { aiWins: 0, randomWins: 0, ties: 0, games: [] },
            aiVsAiMulti: { wins1: 0, wins2: 0, ties: 0, games: [] },
            aiVsRandomMulti: { aiWins: 0, randomWins: 0, ties: 0, games: [] }
        };
    }

    runSilentGame(player1, player2, multiCard = false) {
        const game = new Game(player1, player2);
        
        // Reset players
        player1.reset();
        player2.reset();
        
        if (multiCard) {
            // Multi-card mode: 3 rounds, each player chooses card + property
            for (let round = 0; round < 3; round++) {
                const choice1 = player1.chooseCardAndProperty(player2.usedProperties);
                const choice2 = player2.chooseCardAndProperty(player1.usedProperties);
                
                game.playRound(choice1, choice2);
            }
        } else {
            // Single-card mode: 2 rounds + 1 auto round
            for (let round = 0; round < 2; round++) {
                const choice1 = player1.chooseProperty(player2.usedProperties);
                const choice2 = player2.chooseProperty(player1.usedProperties);
                
                game.playRound(choice1, choice2);
            }
            
            // Auto-play final round
            const finalProp1 = player1.getAvailableProperties()[0];
            const finalProp2 = player2.getAvailableProperties()[0];
            game.playRound(finalProp1, finalProp2);
        }
        
        return game.getWinner();
    }

    async runAIvsAITest(numGames = config.TEST_SCENARIOS.AI_VS_AI) {
        console.log(`\n🤖 Running ${numGames} AI vs AI games...`);
        
        for (let i = 0; i < numGames; i++) {
            const card1 = CardGenerator.getRandomCard();
            const card2 = CardGenerator.getRandomCard();
            
            const ai1 = new AIPlayer('AI-1', card1);
            const ai2 = new AIPlayer('AI-2', card2);
            
            const result = this.runSilentGame(ai1, ai2, false);
            
            if (result.tie) {
                this.results.aiVsAi.ties++;
            } else if (result.winner === ai1) {
                this.results.aiVsAi.wins1++;
            } else {
                this.results.aiVsAi.wins2++;
            }
            
            this.results.aiVsAi.games.push({
                ai1Score: ai1.totalScore,
                ai2Score: ai2.totalScore,
                winner: result.tie ? 'tie' : (result.winner === ai1 ? 'ai1' : 'ai2'),
                card1: card1.toString(),
                card2: card2.toString()
            });
            
            if ((i + 1) % 20 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${numGames}\r`);
            }
        }
        
        console.log(`\n✅ Completed ${numGames} AI vs AI games`);
    }

    async runAIvsRandomTest(numGames = config.TEST_SCENARIOS.AI_VS_RANDOM) {
        console.log(`\n🎲 Running ${numGames} AI vs Random games...`);
        
        for (let i = 0; i < numGames; i++) {
            const aiCard = CardGenerator.getRandomCard();
            const randomCard = CardGenerator.getRandomCard();
            
            const ai = new AIPlayer('AI', aiCard);
            const random = new RandomPlayer('Random', randomCard);
            
            const result = this.runSilentGame(ai, random, false);
            
            if (result.tie) {
                this.results.aiVsRandom.ties++;
            } else if (result.winner === ai) {
                this.results.aiVsRandom.aiWins++;
            } else {
                this.results.aiVsRandom.randomWins++;
            }
            
            this.results.aiVsRandom.games.push({
                aiScore: ai.totalScore,
                randomScore: random.totalScore,
                winner: result.tie ? 'tie' : (result.winner === ai ? 'ai' : 'random'),
                aiCard: aiCard.toString(),
                randomCard: randomCard.toString()
            });
            
            if ((i + 1) % 20 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${numGames}\r`);
            }
        }
        
        console.log(`\n✅ Completed ${numGames} AI vs Random games`);
    }

    async runAIvsAIMultiTest(numGames = config.TEST_SCENARIOS.AI_VS_AI_MULTI) {
        console.log(`\n🤖 Running ${numGames} AI vs AI Multi-Card games...`);
        
        for (let i = 0; i < numGames; i++) {
            const cards1 = [
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard()
            ];
            const cards2 = [
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard()
            ];
            
            const ai1 = new AIPlayer('AI-1', cards1);
            const ai2 = new AIPlayer('AI-2', cards2);
            
            const result = this.runSilentGame(ai1, ai2, true);
            
            if (result.tie) {
                this.results.aiVsAiMulti.ties++;
            } else if (result.winner === ai1) {
                this.results.aiVsAiMulti.wins1++;
            } else {
                this.results.aiVsAiMulti.wins2++;
            }
            
            this.results.aiVsAiMulti.games.push({
                ai1Score: ai1.totalScore,
                ai2Score: ai2.totalScore,
                winner: result.tie ? 'tie' : (result.winner === ai1 ? 'ai1' : 'ai2'),
                cards1: cards1.map(c => c.toString()),
                cards2: cards2.map(c => c.toString())
            });
            
            if ((i + 1) % 20 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${numGames}\r`);
            }
        }
        
        console.log(`\n✅ Completed ${numGames} AI vs AI Multi-Card games`);
    }

    async runAIvsRandomMultiTest(numGames = config.TEST_SCENARIOS.AI_VS_RANDOM_MULTI) {
        console.log(`\n🎲 Running ${numGames} AI vs Random Multi-Card games...`);
        
        for (let i = 0; i < numGames; i++) {
            const aiCards = [
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard()
            ];
            const randomCards = [
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard(),
                CardGenerator.getRandomCard()
            ];
            
            const ai = new AIPlayer('AI', aiCards);
            const random = new RandomPlayer('Random', randomCards);
            
            const result = this.runSilentGame(ai, random, true);
            
            if (result.tie) {
                this.results.aiVsRandomMulti.ties++;
            } else if (result.winner === ai) {
                this.results.aiVsRandomMulti.aiWins++;
            } else {
                this.results.aiVsRandomMulti.randomWins++;
            }
            
            this.results.aiVsRandomMulti.games.push({
                aiScore: ai.totalScore,
                randomScore: random.totalScore,
                winner: result.tie ? 'tie' : (result.winner === ai ? 'ai' : 'random'),
                aiCards: aiCards.map(c => c.toString()),
                randomCards: randomCards.map(c => c.toString())
            });
            
            if ((i + 1) % 20 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${numGames}\r`);
            }
        }
        
        console.log(`\n✅ Completed ${numGames} AI vs Random Multi-Card games`);
    }

    displayResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        
        // AI vs AI Results (Single Card)
        const aiVsAi = this.results.aiVsAi;
        const totalAiVsAi = aiVsAi.wins1 + aiVsAi.wins2 + aiVsAi.ties;
        
        if (totalAiVsAi > 0) {
            console.log('\n🤖 AI vs AI Results (1 Card):');
            console.log(`Total Games: ${totalAiVsAi}`);
            console.log(`AI-1 Wins: ${aiVsAi.wins1} (${(aiVsAi.wins1/totalAiVsAi*100).toFixed(1)}%)`);
            console.log(`AI-2 Wins: ${aiVsAi.wins2} (${(aiVsAi.wins2/totalAiVsAi*100).toFixed(1)}%)`);
            console.log(`Ties: ${aiVsAi.ties} (${(aiVsAi.ties/totalAiVsAi*100).toFixed(1)}%)`);
        }
        
        // AI vs Random Results (Single Card)
        const aiVsRandom = this.results.aiVsRandom;
        const totalAiVsRandom = aiVsRandom.aiWins + aiVsRandom.randomWins + aiVsRandom.ties;
        
        if (totalAiVsRandom > 0) {
            console.log('\n🎲 AI vs Random Results (1 Card):');
            console.log(`Total Games: ${totalAiVsRandom}`);
            console.log(`AI Wins: ${aiVsRandom.aiWins} (${(aiVsRandom.aiWins/totalAiVsRandom*100).toFixed(1)}%)`);
            console.log(`Random Wins: ${aiVsRandom.randomWins} (${(aiVsRandom.randomWins/totalAiVsRandom*100).toFixed(1)}%)`);
            console.log(`Ties: ${aiVsRandom.ties} (${(aiVsRandom.ties/totalAiVsRandom*100).toFixed(1)}%)`);
        }
        
        // AI vs AI Results (Multi Card)
        const aiVsAiMulti = this.results.aiVsAiMulti;
        const totalAiVsAiMulti = aiVsAiMulti.wins1 + aiVsAiMulti.wins2 + aiVsAiMulti.ties;
        
        if (totalAiVsAiMulti > 0) {
            console.log('\n🃏 AI vs AI Results (3 Cards):');
            console.log(`Total Games: ${totalAiVsAiMulti}`);
            console.log(`AI-1 Wins: ${aiVsAiMulti.wins1} (${(aiVsAiMulti.wins1/totalAiVsAiMulti*100).toFixed(1)}%)`);
            console.log(`AI-2 Wins: ${aiVsAiMulti.wins2} (${(aiVsAiMulti.wins2/totalAiVsAiMulti*100).toFixed(1)}%)`);
            console.log(`Ties: ${aiVsAiMulti.ties} (${(aiVsAiMulti.ties/totalAiVsAiMulti*100).toFixed(1)}%)`);
        }
        
        // AI vs Random Results (Multi Card)
        const aiVsRandomMulti = this.results.aiVsRandomMulti;
        const totalAiVsRandomMulti = aiVsRandomMulti.aiWins + aiVsRandomMulti.randomWins + aiVsRandomMulti.ties;
        
        if (totalAiVsRandomMulti > 0) {
            console.log('\n🎯 AI vs Random Results (3 Cards):');
            console.log(`Total Games: ${totalAiVsRandomMulti}`);
            console.log(`AI Wins: ${aiVsRandomMulti.aiWins} (${(aiVsRandomMulti.aiWins/totalAiVsRandomMulti*100).toFixed(1)}%)`);
            console.log(`Random Wins: ${aiVsRandomMulti.randomWins} (${(aiVsRandomMulti.randomWins/totalAiVsRandomMulti*100).toFixed(1)}%)`);
            console.log(`Ties: ${aiVsRandomMulti.ties} (${(aiVsRandomMulti.ties/totalAiVsRandomMulti*100).toFixed(1)}%)`);
        }
        
        // Comparison Analysis
        if (totalAiVsAi > 0 && totalAiVsAiMulti > 0) {
            console.log('\n📈 Tie Rate Comparison:');
            console.log(`1 Card AI vs AI Ties: ${(aiVsAi.ties/totalAiVsAi*100).toFixed(1)}%`);
            console.log(`3 Card AI vs AI Ties: ${(aiVsAiMulti.ties/totalAiVsAiMulti*100).toFixed(1)}%`);
            const improvement = ((aiVsAi.ties/totalAiVsAi) - (aiVsAiMulti.ties/totalAiVsAiMulti)) * 100;
            console.log(`Tie Rate Reduction: ${improvement.toFixed(1)} percentage points`);
        }
        
        if (totalAiVsRandom > 0 && totalAiVsRandomMulti > 0) {
            console.log(`1 Card AI vs Random Ties: ${(aiVsRandom.ties/totalAiVsRandom*100).toFixed(1)}%`);
            console.log(`3 Card AI vs Random Ties: ${(aiVsRandomMulti.ties/totalAiVsRandomMulti*100).toFixed(1)}%`);
            const improvement = ((aiVsRandom.ties/totalAiVsRandom) - (aiVsRandomMulti.ties/totalAiVsRandomMulti)) * 100;
            console.log(`Tie Rate Reduction: ${improvement.toFixed(1)} percentage points`);
        }
        
        // Score Distribution Analysis
        this.analyzeScoreDistribution();
    }

    analyzeScoreDistribution() {
        console.log('\n📊 Score Distribution Analysis:');
        
        const allScores = [];
        const allMultiScores = [];
        
        // Collect all final scores
        this.results.aiVsAi.games.forEach(game => {
            allScores.push(game.ai1Score, game.ai2Score);
        });
        
        this.results.aiVsRandom.games.forEach(game => {
            allScores.push(game.aiScore, game.randomScore);
        });
        
        this.results.aiVsAiMulti.games.forEach(game => {
            allMultiScores.push(game.ai1Score, game.ai2Score);
        });
        
        this.results.aiVsRandomMulti.games.forEach(game => {
            allMultiScores.push(game.aiScore, game.randomScore);
        });
        
        if (allScores.length > 0) {
            console.log('\n1-Card Game Scores:');
            this.displayScoreStats(allScores);
        }
        
        if (allMultiScores.length > 0) {
            console.log('\n3-Card Game Scores:');
            this.displayScoreStats(allMultiScores);
        }
    }

    displayScoreStats(scores) {
        const scoreFreq = {};
        scores.forEach(score => {
            scoreFreq[score] = (scoreFreq[score] || 0) + 1;
        });
        
        const sortedScores = Object.keys(scoreFreq).sort((a, b) => parseInt(a) - parseInt(b));
        
        console.log('Score | Frequency');
        console.log('------|----------');
        sortedScores.forEach(score => {
            const freq = scoreFreq[score];
            const percentage = (freq / scores.length * 100).toFixed(1);
            console.log(`${score.padStart(5)} | ${freq} (${percentage}%)`);
        });
        
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        
        console.log(`Average Score: ${avgScore.toFixed(2)}`);
        console.log(`Score Range: ${minScore} - ${maxScore}`);
    }

    async runAllTests() {
        const startTime = Date.now();
        
        await this.runAIvsAITest();
        await this.runAIvsRandomTest();
        await this.runAIvsAIMultiTest();
        await this.runAIvsRandomMultiTest();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        this.displayResults();
        console.log(`\n⏱️  Total test duration: ${duration} seconds`);
        
        return this.results;
    }
}

class CardAnalysis {
    static analyzeAllCards() {
        const allCards = CardGenerator.generateAllPossibleCards();
        
        console.log('\n🃏 Card Analysis:');
        console.log(`Total possible cards: ${allCards.length}`);
        
        // Analyze card distribution
        const rockDist = {};
        const paperDist = {};
        const scissorsDist = {};
        
        allCards.forEach(card => {
            rockDist[card.rock] = (rockDist[card.rock] || 0) + 1;
            paperDist[card.paper] = (paperDist[card.paper] || 0) + 1;
            scissorsDist[card.scissors] = (scissorsDist[card.scissors] || 0) + 1;
        });
        
        console.log('\nProperty Value Distribution:');
        console.log('Value | Rock | Paper | Scissors');
        console.log('------|------|-------|----------');
        
        for (let i = 1; i <= 9; i++) {
            const rock = rockDist[i] || 0;
            const paper = paperDist[i] || 0;
            const scissors = scissorsDist[i] || 0;
            console.log(`${i.toString().padStart(5)} | ${rock.toString().padStart(4)} | ${paper.toString().padStart(5)} | ${scissors.toString().padStart(8)}`);
        }
        
        // Find balanced cards (all properties close to each other)
        const balancedCards = allCards.filter(card => {
            const values = [card.rock, card.paper, card.scissors].sort();
            return (values[2] - values[0]) <= 3; // Max difference of 3
        });
        
        console.log(`\nBalanced cards (max 3 difference): ${balancedCards.length}`);
        console.log('Examples:');
        balancedCards.slice(0, 5).forEach(card => {
            console.log(`  ${card.toString()}`);
        });
        
        return { allCards, balancedCards };
    }
}

module.exports = { TestRunner, CardAnalysis };