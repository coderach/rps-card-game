// console/game.js - Main Rock Paper Scissors Card Game Logic for Console
const readline = require('readline');
const config = require('./config');

class Card {
    constructor(rock, paper, scissors) {
        if (rock + paper + scissors !== 20) {
            throw new Error('Card properties must sum to 20');
        }
        this.rock = rock;
        this.paper = paper;
        this.scissors = scissors;
        this.properties = { r: rock, p: paper, s: scissors };
    }

    getProperty(propertyKey) {
        return this.properties[propertyKey];
    }

    toString() {
        return `Rock: ${this.rock}, Paper: ${this.paper}, Scissors: ${this.scissors}`;
    }
}

class CardGenerator {
    static generateAllPossibleCards() {
        const cards = [];
        for (let rock = 2; rock <= 18; rock++) {
            for (let paper = 1; paper <= 9; paper++) {
                const scissors = 20 - rock - paper;
                if (scissors >= 1 && scissors <= 9) {
                    cards.push(new Card(rock, paper, scissors));
                }
            }
        }
        return cards;
    }

    static getRandomCard() {
        const allCards = this.generateAllPossibleCards();
        return allCards[Math.floor(Math.random() * allCards.length)];
    }
}

class Player {
    constructor(name, cards) {
        this.name = name;
        // Handle both single card and array of cards
        if (Array.isArray(cards)) {
            this.cards = cards;
        } else {
            this.cards = [cards];
        }
        this.usedProperties = [];
        this.totalScore = 0;
        this.usedCards = [];
    }

    getAvailableCards() {
        return this.cards.filter((card, index) => !this.usedCards.includes(index));
    }

    getAvailableProperties() {
        return ['r', 'p', 's'].filter(prop => !this.usedProperties.includes(prop));
    }

    // For single-card mode
    playProperty(property) {
        if (this.usedProperties.includes(property)) {
            throw new Error('Property already used');
        }
        this.usedProperties.push(property);
        return this.cards[0].getProperty(property);
    }

    // For multi-card mode
    playCardProperty(cardIndex, property) {
        if (this.usedProperties.includes(property)) {
            throw new Error('Property already used');
        }
        if (this.usedCards.includes(cardIndex)) {
            throw new Error('Card already used');
        }
        
        this.usedProperties.push(property);
        this.usedCards.push(cardIndex);
        return this.cards[cardIndex].getProperty(property);
    }

    // Base implementation for card and property selection (used by RandomPlayer)
    chooseCardAndProperty() {
        const availableCards = this.getAvailableCards();
        const availableProperties = this.getAvailableProperties();
        
        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        const cardIndex = this.cards.indexOf(randomCard);
        const randomProperty = availableProperties[Math.floor(Math.random() * availableProperties.length)];
        
        return { cardIndex, property: randomProperty };
    }

    // Base implementation for property selection (used by RandomPlayer)
    chooseProperty() {
        const available = this.getAvailableProperties();
        return available[Math.floor(Math.random() * available.length)];
    }

    reset() {
        this.usedProperties = [];
        this.totalScore = 0;
        this.usedCards = [];
    }
}

class AIPlayer extends Player {
    constructor(name, cards) {
        super(name, cards);
        this.allPossibleCards = CardGenerator.generateAllPossibleCards();
    }

    chooseCardAndProperty(opponentUsedProperties = []) {
        const availableCards = this.getAvailableCards();
        const availableProperties = this.getAvailableProperties();
        
        if (availableProperties.length === 1) {
            // Only one property left, choose best available card for it
            const property = availableProperties[0];
            let bestCard = 0;
            let bestValue = -1;
            
            availableCards.forEach((card) => {
                const cardIndex = this.cards.indexOf(card);
                const value = card.getProperty(property);
                if (value > bestValue) {
                    bestValue = value;
                    bestCard = cardIndex;
                }
            });
            
            return { cardIndex: bestCard, property };
        }

        // Advanced AI strategy for multi-card selection
        let bestCard = 0;
        let bestProperty = availableProperties[0];
        let bestExpectedScore = -Infinity;

        availableCards.forEach((card) => {
            const cardIndex = this.cards.indexOf(card);
            
            for (const myProperty of availableProperties) {
                let expectedScore = 0;
                let scenarioCount = 0;

                // Simulate against all possible opponent cards and strategies
                for (const opponentCard of this.allPossibleCards) {
                    const opponentAvailableProps = ['r', 'p', 's'].filter(
                        prop => !opponentUsedProperties.includes(prop)
                    );

                    for (const oppProperty of opponentAvailableProps) {
                        const myValue = card.getProperty(myProperty);
                        const oppValue = opponentCard.getProperty(oppProperty);
                        
                        const roundScore = this.calculateRoundScore(myProperty, myValue, oppProperty, oppValue);
                        expectedScore += roundScore;
                        scenarioCount++;
                    }
                }

                const avgExpectedScore = expectedScore / scenarioCount;
                if (avgExpectedScore > bestExpectedScore) {
                    bestExpectedScore = avgExpectedScore;
                    bestProperty = myProperty;
                    bestCard = cardIndex;
                }
            }
        });

        return { cardIndex: bestCard, property: bestProperty };
    }

    chooseProperty(opponentUsedProperties = []) {
        const availableProperties = this.getAvailableProperties();
        if (availableProperties.length === 1) {
            return availableProperties[0];
        }

        // Advanced AI strategy for single-card mode
        let bestProperty = availableProperties[0];
        let bestExpectedScore = -Infinity;

        for (const myProperty of availableProperties) {
            let expectedScore = 0;
            let scenarioCount = 0;

            // Simulate against all possible opponent cards and strategies
            for (const opponentCard of this.allPossibleCards) {
                const opponentAvailableProps = ['r', 'p', 's'].filter(
                    prop => !opponentUsedProperties.includes(prop)
                );

                for (const oppProperty of opponentAvailableProps) {
                    const myValue = this.cards[0].getProperty(myProperty);
                    const oppValue = opponentCard.getProperty(oppProperty);
                    
                    const roundScore = this.calculateRoundScore(myProperty, myValue, oppProperty, oppValue);
                    expectedScore += roundScore;
                    scenarioCount++;
                }
            }

            const avgExpectedScore = expectedScore / scenarioCount;
            if (avgExpectedScore > bestExpectedScore) {
                bestExpectedScore = avgExpectedScore;
                bestProperty = myProperty;
            }
        }

        return bestProperty;
    }

    calculateRoundScore(myProp, myVal, oppProp, oppVal) {
        if (myProp === oppProp) {
            return myVal > oppVal ? (myVal - oppVal) : 0;
        }

        const winning = {
            'r': 's',
            's': 'p', 
            'p': 'r'
        };

        // Only score if I have winning property AND higher value
        if (winning[myProp] === oppProp && myVal > oppVal) {
            return myVal - oppVal;
        }
        return 0;
    }
}

class RandomPlayer extends Player {
    // chooseCardAndProperty and chooseProperty are inherited from base Player class
}

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.round = 0;
        this.roundResults = [];
    }

    calculateRoundScore(prop1, val1, prop2, val2) {
        if (prop1 === prop2) {
            // Same property - higher value wins
            if (val1 > val2) return [val1 - val2, 0];
            if (val2 > val1) return [0, val2 - val1];
            return [0, 0];
        }

        // Different properties - check winning rules
        const winning = {
            'r': 's', // Rock beats Scissors
            's': 'p', // Scissors beats Paper
            'p': 'r'  // Paper beats Rock
        };

        // Only score if you have the winning property AND higher value
        if (winning[prop1] === prop2 && val1 > val2) {
            return [val1 - val2, 0];
        }
        if (winning[prop2] === prop1 && val2 > val1) {
            return [0, val2 - val1];
        }
        
        return [0, 0];
    }

    getPropertyName(prop) {
        const names = { 'r': 'Rock', 'p': 'Paper', 's': 'Scissors' };
        return names[prop];
    }

    async playRound(choice1, choice2) {
        this.round++;
        
        let val1, val2, prop1, prop2;
        let cardIndex1 = 0, cardIndex2 = 0;
        
        if (typeof choice1 === 'object') {
            // Multi-card mode: choice is {cardIndex, property}
            prop1 = choice1.property;
            cardIndex1 = choice1.cardIndex;
            val1 = this.player1.playCardProperty(choice1.cardIndex, choice1.property);
        } else {
            // Single-card mode: choice is just property
            prop1 = choice1;
            val1 = this.player1.playProperty(choice1);
        }
        
        if (typeof choice2 === 'object') {
            // Multi-card mode: choice is {cardIndex, property}
            prop2 = choice2.property;
            cardIndex2 = choice2.cardIndex;
            val2 = this.player2.playCardProperty(choice2.cardIndex, choice2.property);
        } else {
            // Single-card mode: choice is just property
            prop2 = choice2;
            val2 = this.player2.playProperty(choice2);
        }
        
        const [score1, score2] = this.calculateRoundScore(prop1, val1, prop2, val2);
        
        this.player1.totalScore += score1;
        this.player2.totalScore += score2;
        
        const result = {
            round: this.round,
            player1: { property: prop1, value: val1, score: score1, cardIndex: cardIndex1 },
            player2: { property: prop2, value: val2, score: score2, cardIndex: cardIndex2 }
        };
        
        this.roundResults.push(result);
        return result;
    }

    displayRoundResult(result) {
        console.log(`\n--- Round ${result.round} ---`);
        const card1Info = this.player1.cards.length > 1 ? ` (Card ${result.player1.cardIndex + 1})` : '';
        const card2Info = this.player2.cards.length > 1 ? ` (Card ${result.player2.cardIndex + 1})` : '';
        
        console.log(`${this.player1.name}: ${this.getPropertyName(result.player1.property)} ${result.player1.value}${card1Info} (+${result.player1.score})`);
        console.log(`${this.player2.name}: ${this.getPropertyName(result.player2.property)} ${result.player2.value}${card2Info} (+${result.player2.score})`);
        console.log(`Scores: ${this.player1.name}: ${this.player1.totalScore}, ${this.player2.name}: ${this.player2.totalScore}`);
    }

    getWinner() {
        if (this.player1.totalScore > this.player2.totalScore) {
            return { winner: this.player1, loser: this.player2, tie: false };
        } else if (this.player2.totalScore > this.player1.totalScore) {
            return { winner: this.player2, loser: this.player1, tie: false };
        } else {
            return { winner: null, loser: null, tie: true };
        }
    }

    displayFinalResult() {
        console.log('\n=== GAME OVER ===');
        
        if (this.player1.cards.length === 1) {
            // Single card display
            console.log(`${this.player1.name} Card: ${this.player1.cards[0].toString()}`);
            console.log(`${this.player2.name} Card: ${this.player2.cards[0].toString()}`);
        } else {
            // Multi-card display
            console.log(`${this.player1.name} Cards:`);
            this.player1.cards.forEach((card, i) => {
                const used = this.player1.usedCards.includes(i) ? ' (USED)' : '';
                console.log(`  Card ${i + 1}: ${card.toString()}${used}`);
            });
            console.log(`${this.player2.name} Cards:`);
            this.player2.cards.forEach((card, i) => {
                const used = this.player2.usedCards.includes(i) ? ' (USED)' : '';
                console.log(`  Card ${i + 1}: ${card.toString()}${used}`);
            });
        }
        
        console.log(`\nFinal Scores:`);
        console.log(`${this.player1.name}: ${this.player1.totalScore}`);
        console.log(`${this.player2.name}: ${this.player2.totalScore}`);
        
        const result = this.getWinner();
        if (result.tie) {
            console.log('🤝 It\'s a tie!');
        } else {
            console.log(`🏆 ${result.winner.name} wins!`);
        }
        
        return result;
    }
}

class GameManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async getPlayerInput(player, opponentUsedProps = []) {
        const available = player.getAvailableProperties();
        const availableStr = available.join('/');
        
        if (player.cards.length === 1) {
            // Single card mode
            return new Promise((resolve) => {
                const askInput = () => {
                    this.rl.question(`${player.name}, choose property (${availableStr}): `, (input) => {
                        const choice = input.toLowerCase().trim();
                        if (available.includes(choice)) {
                            resolve(choice);
                        } else {
                            console.log('Invalid choice! Please try again.');
                            askInput();
                        }
                    });
                };
                askInput();
            });
        } else {
            // Multi-card mode
            const availableCards = player.getAvailableCards();
            
            console.log(`\n${player.name}'s available cards:`);
            availableCards.forEach((card) => {
                const originalIndex = player.cards.indexOf(card);
                console.log(`  ${originalIndex + 1}. ${card.toString()}`);
            });
            
            return new Promise((resolve) => {
                const askCardInput = () => {
                    this.rl.question(`${player.name}, choose card (1-${player.cards.length}): `, (cardInput) => {
                        const cardChoice = parseInt(cardInput.trim()) - 1;
                        if (cardChoice >= 0 && cardChoice < player.cards.length && !player.usedCards.includes(cardChoice)) {
                            
                            const askPropertyInput = () => {
                                this.rl.question(`Choose property from Card ${cardChoice + 1} (${availableStr}): `, (propInput) => {
                                    const propertyChoice = propInput.toLowerCase().trim();
                                    if (available.includes(propertyChoice)) {
                                        resolve({ cardIndex: cardChoice, property: propertyChoice });
                                    } else {
                                        console.log('Invalid property! Please try again.');
                                        askPropertyInput();
                                    }
                                });
                            };
                            askPropertyInput();
                            
                        } else {
                            console.log('Invalid card choice! Please try again.');
                            askCardInput();
                        }
                    });
                };
                askCardInput();
            });
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async playHumanVsAI() {
        console.log('\n🎮 Starting Human vs AI Game!');
        
        const humanCard = CardGenerator.getRandomCard();
        const aiCard = CardGenerator.getRandomCard();
        
        const human = new Player('Human', humanCard);
        const ai = new AIPlayer('AI', aiCard);
        
        console.log(`\nYour card: ${humanCard.toString()}`);
        
        const game = new Game(human, ai);
        
        // Play 2 rounds with choices
        for (let i = 0; i < 2; i++) {
            console.log(`\n--- Round ${i + 1} ---`);
            const humanChoice = await this.getPlayerInput(human);
            const aiChoice = ai.chooseProperty(human.usedProperties);
            
            const result = await game.playRound(humanChoice, aiChoice);
            game.displayRoundResult(result);
        }
        
        // Auto-play round 3
        console.log('\n--- Final Round (Auto-played) ---');
        console.log('Revealing remaining properties...');
        await this.sleep(1000);
        
        const humanFinalProp = human.getAvailableProperties()[0];
        const aiFinalProp = ai.getAvailableProperties()[0];
        
        const finalResult = await game.playRound(humanFinalProp, aiFinalProp);
        game.displayRoundResult(finalResult);
        
        return game.displayFinalResult();
    }

    async playHumanVsAIMultiCard() {
        console.log('\n🎮 Starting 3-Card Human vs AI Game!');
        
        const humanCards = [
            CardGenerator.getRandomCard(),
            CardGenerator.getRandomCard(), 
            CardGenerator.getRandomCard()
        ];
        const aiCards = [
            CardGenerator.getRandomCard(),
            CardGenerator.getRandomCard(),
            CardGenerator.getRandomCard()
        ];
        
        const human = new Player('Human', humanCards);
        const ai = new AIPlayer('AI', aiCards);
        
        console.log(`\nYour cards:`);
        humanCards.forEach((card, i) => {
            console.log(`  Card ${i + 1}: ${card.toString()}`);
        });
        
        const game = new Game(human, ai);
        
        // Play 3 rounds with card and property choices
        for (let i = 0; i < 3; i++) {
            console.log(`\n--- Round ${i + 1} ---`);
            const humanChoice = await this.getPlayerInput(human);
            const aiChoice = ai.chooseCardAndProperty(human.usedProperties);
            
            const result = await game.playRound(humanChoice, aiChoice);
            game.displayRoundResult(result);
        }
        
        return game.displayFinalResult();
    }

    async playMenu() {
        console.log('\n=== Rock Paper Scissors Card Game ===');
        console.log('1. Play vs AI (1 card)');
        console.log('2. Play vs AI (3 cards)');
        console.log('3. Run AI vs AI Test (1 card)');
        console.log('4. Run AI vs Random Test (1 card)');
        console.log('5. Run AI vs AI Test (3 cards)');
        console.log('6. Run AI vs Random Test (3 cards)');
        console.log('7. Exit');
        
        return new Promise((resolve) => {
            this.rl.question('Choose option (1-7): ', (input) => {
                resolve(input.trim());
            });
        });
    }

    close() {
        this.rl.close();
    }
}

module.exports = { Card, CardGenerator, Player, AIPlayer, RandomPlayer, Game, GameManager };