// web/js/web-game-controller.js - Minimal Web Game Controller

class WebGameController {
    constructor() {
        this.gameMode = null;
        this.allCards = CardGenerator.generateAllCards();
        this.currentMatch = null;
        this.aiCards = [];
        
        // Delegate managers
        this.cardManager = new CardSelectionManager();
        this.stateManager = new GameStateManager();
        
        console.log(`Generated ${this.allCards.length} possible cards`);
    }

    // Mode Selection
    selectMode(mode) {
        this.gameMode = mode;
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('card-selection').style.display = 'block';
        this.cardManager.generateCardGrid(this.allCards);
    }

    // Card Selection Phase
    clearSelection() {
        this.cardManager.clearSelection();
    }

    goBack() {
        this.cardManager.clearSelection();
        document.getElementById('card-selection').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'block';
        this.gameMode = null;
    }

    startGame() {
        if (!this.cardManager.isValidSelection()) {
            UIManager.showMessage('Please select exactly 3 cards');
            return;
        }

        document.getElementById('card-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        
        if (this.gameMode === 'pvc') {
            this.initializeMatch();
        } else {
            UIManager.showMessage('Player vs Player mode coming soon!');
        }
    }

    // Game Initialization
    initializeMatch() {
        document.getElementById('player1-name').textContent = 'You';
        document.getElementById('player2-name').textContent = 'AI Opponent';
        
        const selectedCards = this.cardManager.getSelectedCards();
        this.aiCards = CardGenerator.getRandomCards(3, selectedCards);
        this.currentMatch = new MatchManager(selectedCards, this.aiCards, 'pvc');
        this.currentMatch.startMatch();
        
        this.updateGameDisplay();
    }

    // Game State Updates
    updateGameDisplay() {
        if (!this.currentMatch) return;

        const matchState = this.currentMatch.getMatchState();
        const currentRound = this.currentMatch.roundManager.getCurrentRound();
        
        console.log(`Update: Card ${matchState.currentCardGame}, Round ${currentRound}, Phase: ${matchState.matchPhase}`);
        
        // Update UI elements
        UIManager.updateGameStatus(
            matchState.currentCardGame, 
            matchState.maxCardGames, 
            currentRound, 
            matchState.scores
        );
        
        document.getElementById('game-status-text').textContent = matchState.instructions;
        
        // Handle current phase
        console.log(`About to call handleGamePhase with phase: ${matchState.matchPhase}`);
        this.stateManager.handleGamePhase(this.currentMatch, matchState.matchPhase, {
            onUpdate: () => this.updateGameDisplay(),
            onPropertySelect: () => this.updateGameDisplay()
        });
        console.log(`Finished calling handleGamePhase`);
    }

    // Property Selection
    selectProperty(property) {
        this.stateManager.selectProperty(
            this.currentMatch, 
            property, 
            this.aiCards, 
            this.allCards, 
            () => this.updateGameDisplay()
        );
    }

    // Navigation
    newGame() {
        this.reset();
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('card-selection').style.display = 'block';
        this.cardManager.generateCardGrid(this.allCards);
    }

    goToMenu() {
        this.reset();
        document.getElementById('game-area').style.display = 'none';
        document.getElementById('card-selection').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'block';
    }

    // Cleanup
    reset() {
        this.currentMatch = null;
        this.aiCards = [];
        this.gameMode = null;
        this.cardManager.reset();
        document.getElementById('round-results').style.display = 'none';
        UIManager.clearPropertySelection();
    }
}

// Global instance and functions
let webGameController = null;

function selectMode(mode) { webGameController.selectMode(mode); }
function clearSelection() { webGameController.clearSelection(); }
function goBack() { webGameController.goBack(); }
function startGame() { webGameController.startGame(); }
function newGame() { webGameController.newGame(); }
function goToMenu() { webGameController.goToMenu(); }

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    webGameController = new WebGameController();
    console.log('Web Game Controller initialized');
});