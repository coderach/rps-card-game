// web/js/web-game-controller.js - Complete Minimal Web Game Controller

class WebGameController {
    constructor() {
        this.gameMode = null;
        this.selectedCards = [];
        this.allCards = [];
        this.currentMatch = null;
        this.aiCards = [];
        
        this.initializeController();
    }

    initializeController() {
        this.allCards = CardGenerator.generateAllCards();
        console.log(`Generated ${this.allCards.length} possible cards`);
    }

    selectMode(mode) {
        this.gameMode = mode;
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('card-selection').style.display = 'block';
        this.generateCardGrid();
    }

    generateCardGrid() {
        const grid = document.getElementById('cards-grid');
        grid.innerHTML = '';

        this.allCards.forEach(card => {
            const cardElement = this.createNFTCard(card);
            grid.appendChild(cardElement);
        });
    }

    createNFTCard(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'nft-card';
        cardElement.onclick = () => this.toggleCardSelection(card, cardElement);
        
        cardElement.innerHTML = `
            <div class="nft-card-header">
                <div class="nft-card-id">Card #${card.id + 1}</div>
                <div class="nft-card-title">Battle Card</div>
                <div class="nft-card-rarity">Epic</div>
            </div>
            
            <div class="nft-card-artwork">
                <div class="nft-mystical-figure"></div>
            </div>
            
            <div class="nft-properties-section">
                <div class="nft-properties-grid">
                    <div class="nft-property deception">
                        <span class="nft-property-icon">🎭</span>
                        <div class="nft-property-label">DECEPTION</div>
                        <div class="nft-property-bar-container">
                            <div class="nft-property-bar" style="width: ${(card.deception / 9) * 100}%;">
                                <div class="nft-property-value">${card.deception}</div>
                            </div>
                        </div>
                    </div>
                    <div class="nft-property magic">
                        <span class="nft-property-icon">✨</span>
                        <div class="nft-property-label">MAGIC</div>
                        <div class="nft-property-bar-container">
                            <div class="nft-property-bar" style="width: ${(card.magic / 9) * 100}%;">
                                <div class="nft-property-value">${card.magic}</div>
                            </div>
                        </div>
                    </div>
                    <div class="nft-property attack">
                        <span class="nft-property-icon">⚔️</span>
                        <div class="nft-property-label">ATTACK</div>
                        <div class="nft-property-bar-container">
                            <div class="nft-property-bar" style="width: ${(card.attack / 9) * 100}%;">
                                <div class="nft-property-value">${card.attack}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return cardElement;
    }

    toggleCardSelection(card, element) {
        const index = this.selectedCards.findIndex(c => c.id === card.id);
        
        if (index > -1) {
            this.selectedCards.splice(index, 1);
            element.classList.remove('selected');
        } else if (this.selectedCards.length < 3) {
            this.selectedCards.push(card);
            element.classList.add('selected');
        } else {
            this.showMessage('Maximum 3 cards can be selected');
        }
        
        this.updateSelectedCardsDisplay();
    }

    updateSelectedCardsDisplay() {
        document.getElementById('selected-count').textContent = this.selectedCards.length;
        
        const listDiv = document.getElementById('selected-cards-list');
        listDiv.innerHTML = '';
        
        this.selectedCards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'selected-card-mini';
            cardDiv.innerHTML = `
                <div>Card ${card.id + 1}</div>
                <div>🎭${card.deception} ✨${card.magic} ⚔️${card.attack}</div>
            `;
            listDiv.appendChild(cardDiv);
        });
        
        const startBtn = document.getElementById('start-game-btn');
        startBtn.disabled = this.selectedCards.length !== 3;
        startBtn.textContent = this.selectedCards.length === 3 ? 'Start Game' : 
                             this.selectedCards.length === 0 ? 'Select 3 Cards' : 
                             `Select ${3 - this.selectedCards.length} More`;
    }

    clearSelection() {
        this.selectedCards = [];
        document.querySelectorAll('.nft-card.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.updateSelectedCardsDisplay();
        this.showMessage('Selection cleared');
    }

    goBack() {
        this.clearSelection();
        document.getElementById('card-selection').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'block';
        this.gameMode = null;
    }

    startGame() {
        if (this.selectedCards.length !== 3) {
            this.showMessage('Please select exactly 3 cards');
            return;
        }

        document.getElementById('card-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        
        if (this.gameMode === 'pvc') {
            this.startPlayerVsComputer();
        } else {
            this.showMessage('Player vs Player mode coming soon!');
        }
    }

    startPlayerVsComputer() {
        document.getElementById('player1-name').textContent = 'You';
        document.getElementById('player2-name').textContent = 'AI Opponent';
        
        // Generate AI cards and start match
        this.aiCards = CardGenerator.getRandomCards(3, this.selectedCards);
        this.currentMatch = new MatchManager(this.selectedCards, this.aiCards, 'pvc');
        this.currentMatch.startMatch();
        
        this.updateGameDisplay();
        console.log('PvC game started with MatchManager');
    }

    updateGameDisplay() {
        if (!this.currentMatch) return;

        const matchState = this.currentMatch.getMatchState();
        
        // Update scores and status
        document.getElementById('player1-score').textContent = matchState.scores.player1;
        document.getElementById('player2-score').textContent = matchState.scores.player2;
        document.getElementById('game-status-text').textContent = matchState.instructions;
        document.getElementById('round-info').textContent = `Card ${matchState.currentCardGame} of ${matchState.maxCardGames}`;
        
        this.handleGamePhase(matchState.matchPhase);
    }

    handleGamePhase(phase) {
        switch (phase) {
            case GameConfig.GAME_PHASES.CARD_SELECTION:
                this.showCardSelection();
                break;
            case GameConfig.GAME_PHASES.PROPERTY_SELECTION:
                this.showPropertySelection();
                break;
            case GameConfig.GAME_PHASES.ROUND_RESULT:
                this.showRoundResult();
                break;
            case GameConfig.GAME_PHASES.GAME_OVER:
                this.showGameComplete();
                break;
        }
    }

    showCardSelection() {
        // Auto-select cards for current card game
        const cardIndex = this.currentMatch.currentCardGame - 1;
        this.currentMatch.selectCard(1, cardIndex);
        this.currentMatch.selectCard(2, cardIndex);
        this.updateGameDisplay();
    }

    showPropertySelection() {
        const currentRound = this.currentMatch.roundManager.getCurrentRound();
        
        // Auto-play round 3 (final round)
        if (currentRound === 3) {
            setTimeout(() => {
                this.autoPlayFinalRound();
            }, 1000);
            return;
        }
        
        // Show property selection for rounds 1 and 2 only
        if (currentRound <= 2) {
            const availableProperties = this.currentMatch.roundManager.getAvailableProperties(1);
            this.createPropertySelectionUI(availableProperties);
        }
    }

    autoPlayFinalRound() {
        // Get final properties automatically
        const playerProp = this.currentMatch.roundManager.getAvailableProperties(1)[0];
        const aiCard = this.aiCards[this.currentMatch.player2SelectedCard];
        const aiProp = this.currentMatch.roundManager.getAvailableProperties(2)[0];
        
        // Auto-select properties
        this.currentMatch.selectProperty(1, playerProp);
        this.currentMatch.selectProperty(2, aiProp);
        
        this.updateGameDisplay();
    }

    createPropertySelectionUI(availableProperties) {
        // Remove existing UI
        const existing = document.getElementById('property-selection-ui');
        if (existing) existing.remove();
        
        const propertyDiv = document.createElement('div');
        propertyDiv.id = 'property-selection-ui';
        propertyDiv.className = 'property-selection-ui';
        
        const currentCard = this.selectedCards[this.currentMatch.player1SelectedCard];
        const currentRound = this.currentMatch.roundManager.getCurrentRound();
        
        propertyDiv.innerHTML = `
            <h3>Card ${this.currentMatch.currentCardGame} - Round ${currentRound}</h3>
            <p>Choose a property to play:</p>
            <div class="property-buttons-container">
                ${availableProperties.map(prop => {
                    const icon = GameRules.getPropertyIcon(prop);
                    const value = currentCard.getProperty(prop);
                    return `
                        <button class="property-selection-btn" onclick="webGameController.selectProperty('${prop}')">
                            ${icon} ${prop.charAt(0).toUpperCase() + prop.slice(1)}<br>
                            <strong>${value}</strong>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        
        const gameArea = document.getElementById('game-area');
        gameArea.appendChild(propertyDiv);
    }

    selectProperty(property) {
        // Player selects property
        this.currentMatch.selectProperty(1, property);
        
        // AI selects property
        const aiCard = this.aiCards[this.currentMatch.player2SelectedCard];
        const availableProperties = this.currentMatch.roundManager.getAvailableProperties(2);
        const aiChoice = AIStrategy.chooseBestProperty(aiCard, availableProperties, this.allCards, []);
        this.currentMatch.selectProperty(2, aiChoice);
        
        // Remove property selection UI
        const propertyUI = document.getElementById('property-selection-ui');
        if (propertyUI) propertyUI.remove();
        
        this.updateGameDisplay();
    }

    showRoundResult() {
        const roundResults = this.currentMatch.roundManager.getRoundResults();
        const latestResult = roundResults[roundResults.length - 1];
        
        if (latestResult) {
            this.displayRoundResult(latestResult);
            
            // Check if all 3 rounds of current card are complete
            setTimeout(() => {
                const currentRound = this.currentMatch.roundManager.getCurrentRound();
                
                if (currentRound > 3) {
                    // Card complete - move to next card or end game
                    this.currentMatch.completeCardGame();
                    
                    if (this.currentMatch.currentCardGame < 3) {
                        this.currentMatch.advanceToNextCard();
                        document.getElementById('round-results').style.display = 'none';
                    } else {
                        this.currentMatch.completeMatch();
                    }
                } else {
                    // More rounds in current card
                    this.currentMatch.advanceToNextRound();
                }
                
                this.updateGameDisplay();
            }, 2000);
        }
    }

    displayRoundResult(roundResult) {
        const resultDiv = document.getElementById('round-results');
        
        let outcomeText = '🤝 Round tied!';
        if (roundResult.player1Points > 0) outcomeText = '🎉 You won this round!';
        if (roundResult.player2Points > 0) outcomeText = '😔 AI won this round!';
        
        resultDiv.innerHTML = `
            <h3>Round ${roundResult.round} Results</h3>
            <div class="round-result-container">
                <div class="round-result-player">
                    <h4>You: ${GameRules.getPropertyDisplayName(roundResult.player1Property)} ${roundResult.player1Value}</h4>
                    <p>+${roundResult.player1Points} points</p>
                </div>
                <div class="round-result-ai">
                    <h4>AI: ${GameRules.getPropertyDisplayName(roundResult.player2Property)} ${roundResult.player2Value}</h4>
                    <p>+${roundResult.player2Points} points</p>
                </div>
            </div>
            <div class="round-result-outcome">${outcomeText}</div>
        `;
        
        resultDiv.style.display = 'block';
    }

    showGameComplete() {
        const matchResult = this.currentMatch.getMatchResult();
        const winner = matchResult.winner === 'player1' ? 'You Win!' : 
                      matchResult.winner === 'player2' ? 'AI Wins!' : 'Tie!';
        
        const resultDiv = document.getElementById('round-results');
        resultDiv.innerHTML = `
            <h2>🎉 Game Complete!</h2>
            <h3>${winner}</h3>
            <p>Final Score: You ${matchResult.finalScores.player1} - ${matchResult.finalScores.player2} AI</p>
        `;
        resultDiv.style.display = 'block';
    }

    newGame() {
        this.selectedCards = [];
        this.currentMatch = null;
        this.aiCards = [];
        
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('card-selection').style.display = 'block';
        document.getElementById('round-results').style.display = 'none';
        
        this.updateSelectedCardsDisplay();
        this.generateCardGrid();
    }

    goToMenu() {
        this.selectedCards = [];
        this.currentMatch = null;
        this.aiCards = [];
        this.gameMode = null;
        
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('card-selection').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'block';
        document.getElementById('round-results').style.display = 'none';
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'temp-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Global instance
let webGameController = null;

// Global functions for HTML onclick events
function selectMode(mode) { webGameController.selectMode(mode); }
function clearSelection() { webGameController.clearSelection(); }
function goBack() { webGameController.goBack(); }
function startGame() { webGameController.startGame(); }
function newGame() { webGameController.newGame(); }
function goToMenu() { webGameController.goToMenu(); }

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Web Game Controller...');
    webGameController = new WebGameController();
    console.log('Web Game Controller initialized');
});