// web/js/ui-manager.js - UI Management Class

class UIManager {
    static createNFTCard(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'nft-card';
        
        cardElement.innerHTML = `
            <div class="nft-card-header">
                <div class="nft-card-id">Card #${card.id + 1}</div>
                <div class="nft-card-title">Battle Card</div>
                <div class="nft-card-rarity">${card.getRarity()}</div>
            </div>
            <div class="nft-card-artwork">
                <div class="nft-mystical-figure"></div>
            </div>
            <div class="nft-properties-section">
                <div class="nft-properties-grid">
                    ${this.createPropertyBar('deception', card.deception)}
                    ${this.createPropertyBar('magic', card.magic)}
                    ${this.createPropertyBar('attack', card.attack)}
                </div>
            </div>
        `;
        
        return cardElement;
    }

    static createPropertyBar(propertyName, value) {
        const icons = { deception: '🎭', magic: '✨', attack: '⚔️' };
        return `
            <div class="nft-property ${propertyName}">
                <span class="nft-property-icon">${icons[propertyName]}</span>
                <div class="nft-property-label">${propertyName.toUpperCase()}</div>
                <div class="nft-property-bar-container">
                    <div class="nft-property-bar" style="width: ${(value / 9) * 100}%;">
                        <div class="nft-property-value">${value}</div>
                    </div>
                </div>
            </div>
        `;
    }

    static showPropertySelection(card, availableProperties, currentCardGame, currentRound, onSelect) {
        this.clearPropertySelection();
        
        const propertyDiv = document.createElement('div');
        propertyDiv.id = 'property-selection-ui';
        propertyDiv.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3>Card ${currentCardGame} - Round ${currentRound}</h3>
                <p>Choose a property to play:</p>
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 15px;">
                    ${availableProperties.map(prop => 
                        `<button class="btn" onclick="${onSelect}('${prop}')" style="min-width: 120px;">
                            ${GameRules.getPropertyIcon(prop)} ${prop.charAt(0).toUpperCase() + prop.slice(1)}<br>
                            <strong>Value: ${card.getProperty(prop)}</strong>
                        </button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('game-area').appendChild(propertyDiv);
    }

    static showRoundResult(result) {
        const resultDiv = document.getElementById('round-results');
        let outcomeText = '🤝 Round tied!';
        
        if (result.player1Points > result.player2Points) outcomeText = '🎉 You won!';
        if (result.player2Points > result.player1Points) outcomeText = '😔 AI won!';
        
        resultDiv.innerHTML = `
            <h3>Round ${result.round} Results</h3>
            <div style="display: flex; gap: 30px; justify-content: center; margin: 20px 0;">
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                    <h4>You: ${GameRules.getPropertyDisplayName(result.player1Property)} ${result.player1Value}</h4>
                    <p>+${result.player1Points} points</p>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                    <h4>AI: ${GameRules.getPropertyDisplayName(result.player2Property)} ${result.player2Value}</h4>
                    <p>+${result.player2Points} points</p>
                </div>
            </div>
            <div style="text-align: center; font-size: 1.2em; font-weight: bold;">${outcomeText}</div>
        `;
        resultDiv.style.display = 'block';
    }

    static showGameComplete(matchResult) {
        const winner = matchResult.winner === 'player1' ? '🎉 You Win!' : 
                      matchResult.winner === 'player2' ? '🤖 AI Wins!' : '🤝 Tie!';
        
        document.getElementById('round-results').innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <h2>Game Complete!</h2>
                <h3>${winner}</h3>
                <p style="font-size: 1.2em;">Final Score: You ${matchResult.finalScores.player1} - ${matchResult.finalScores.player2} AI</p>
            </div>
        `;
        document.getElementById('round-results').style.display = 'block';
    }

    static clearPropertySelection() {
        const existing = document.getElementById('property-selection-ui');
        if (existing) existing.remove();
    }

    static showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'temp-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => messageDiv.remove(), 3000);
    }

    static updateGameStatus(currentCardGame, maxCardGames, currentRound, scores) {
        document.getElementById('player1-score').textContent = scores.player1;
        document.getElementById('player2-score').textContent = scores.player2;
        document.getElementById('round-info').textContent = `Card ${currentCardGame} of ${maxCardGames} • Round ${currentRound} of 3`;
    }
}