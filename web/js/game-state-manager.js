// web/js/game-state-manager.js - Game State Management Class

class GameStateManager {
    constructor() {
        this.isProcessing = false;
    }

    handleGamePhase(match, phase, callbacks) {
        console.log(`handleGamePhase called with phase: ${phase}, isProcessing: ${this.isProcessing}`);
        
        if (this.isProcessing) {
            console.log('Skipping handleGamePhase because isProcessing = true');
            return;
        }
        
        UIManager.clearPropertySelection();
        
        switch (phase) {
            case GameConfig.GAME_PHASES.CARD_SELECTION:
                console.log('Handling CARD_SELECTION phase');
                this.handleCardSelection(match, callbacks.onUpdate);
                break;
            case GameConfig.GAME_PHASES.PROPERTY_SELECTION:
                console.log('Handling PROPERTY_SELECTION phase');
                this.handlePropertySelection(match, callbacks.onPropertySelect);
                break;
            case GameConfig.GAME_PHASES.ROUND_RESULT:
                console.log('Handling ROUND_RESULT phase');
                this.handleRoundResult(match, callbacks.onUpdate);
                break;
            case GameConfig.GAME_PHASES.CARD_COMPLETE:
                console.log('Handling CARD_COMPLETE phase');
                this.handleCardComplete(match, callbacks.onUpdate);
                break;
            case GameConfig.GAME_PHASES.GAME_OVER:
                console.log('Handling GAME_OVER phase');
                this.handleGameComplete(match);
                break;
            default:
                console.log(`Unknown phase: ${phase}`);
        }
    }

    handleCardSelection(match, onUpdate) {
        const cardIndex = match.currentCardGame - 1;
        match.selectCard(1, cardIndex);
        match.selectCard(2, cardIndex);
        onUpdate();
    }

    handlePropertySelection(match, onPropertySelect) {
        const currentRound = match.roundManager.getCurrentRound();
        const availableProps1 = match.roundManager.getAvailableProperties(1);
        const availableProps2 = match.roundManager.getAvailableProperties(2);
        
        // Auto-play final round if only one property left for each player
        if (currentRound === 3 && availableProps1.length === 1 && availableProps2.length === 1) {
            this.autoPlayFinalRound(match, availableProps1[0], availableProps2[0], onPropertySelect);
        } else {
            this.showPropertySelection(match, availableProps1, currentRound, onPropertySelect);
        }
    }

    autoPlayFinalRound(match, prop1, prop2, onPropertySelect) {
        UIManager.showMessage(`Round 3: Auto-playing final properties (${prop1} vs ${prop2})`);
        
        setTimeout(() => {
            match.selectProperty(1, prop1);
            match.selectProperty(2, prop2);
            onPropertySelect();
        }, 1000);
    }

    showPropertySelection(match, availableProperties, currentRound, onPropertySelect) {
        const currentCard = match.player1Cards[match.player1SelectedCard];
        UIManager.showPropertySelection(
            currentCard, 
            availableProperties, 
            match.currentCardGame, 
            currentRound, 
            'webGameController.selectProperty'
        );
    }

    handleRoundResult(match, onUpdate) {
        const roundResults = match.roundManager.getRoundResults();
        const latestResult = roundResults[roundResults.length - 1];
        
        if (latestResult) {
            UIManager.showRoundResult(latestResult);
            
            // Check the actual state more carefully
            const roundsCompleted = roundResults.length;
            const maxRounds = match.roundManager.getMaxRounds();
            
            console.log(`Round ${latestResult.round} result shown. Rounds completed: ${roundsCompleted}/${maxRounds}`);
            
            setTimeout(() => {
                console.log('Processing round result advancement...');
                
                // Check if we've completed all 3 rounds for this card
                if (roundsCompleted >= maxRounds) {
                    console.log(`All ${maxRounds} rounds complete - calling completeCardGame`);
                    match.completeCardGame();
                } else {
                    console.log(`Only ${roundsCompleted}/${maxRounds} rounds complete - calling advanceToNextRound`);
                    const success = match.advanceToNextRound();
                    console.log('advanceToNextRound result:', success);
                }
                
                document.getElementById('round-results').style.display = 'none';
                onUpdate();
            }, 2500);
        }
    }

    handleCardComplete(match, onUpdate) {
        UIManager.showMessage(`Card ${match.currentCardGame} complete!`);
        
        setTimeout(() => {
            if (match.currentCardGame < 3) {
                match.advanceToNextCard();
                onUpdate();
            } else {
                match.completeMatch();
                onUpdate();
            }
        }, 1500);
    }

    handleGameComplete(match) {
        const matchResult = match.getMatchResult();
        UIManager.showGameComplete(matchResult);
    }

    selectProperty(match, property, aiCards, allCards, onUpdate) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        console.log(`selectProperty called with: ${property}, isProcessing set to true`);

        try {
            // Player selects property
            match.selectProperty(1, property);
            
            // AI selects property
            const aiCard = aiCards[match.player2SelectedCard];
            const availableProperties = match.roundManager.getAvailableProperties(2);
            const usedPlayerProps = match.roundManager.usedPlayer1Properties;
            
            const aiChoice = AIStrategy.chooseBestProperty(aiCard, availableProperties, allCards, usedPlayerProps);
            match.selectProperty(2, aiChoice);
            
            UIManager.clearPropertySelection();
            
            console.log(`selectProperty completed successfully, setting isProcessing to false`);
            this.isProcessing = false;
            onUpdate();
        } catch (error) {
            console.error('Error in selectProperty:', error);
            this.isProcessing = false;
        }
    }
}