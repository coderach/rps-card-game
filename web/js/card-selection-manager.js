// web/js/card-selection-manager.js - Card Selection Management Class

class CardSelectionManager {
    constructor() {
        this.selectedCards = [];
    }

    generateCardGrid(allCards, onCardSelect) {
        const grid = document.getElementById('cards-grid');
        grid.innerHTML = '';

        allCards.forEach(card => {
            const cardElement = UIManager.createNFTCard(card);
            cardElement.onclick = () => this.toggleCardSelection(card, cardElement, onCardSelect);
            grid.appendChild(cardElement);
        });
    }

    toggleCardSelection(card, element, onCardSelect) {
        const index = this.selectedCards.findIndex(c => c.id === card.id);
        
        if (index > -1) {
            this.selectedCards.splice(index, 1);
            element.classList.remove('selected');
        } else if (this.selectedCards.length < 3) {
            this.selectedCards.push(card);
            element.classList.add('selected');
        } else {
            UIManager.showMessage('Maximum 3 cards can be selected');
            return;
        }
        
        this.updateSelectedCardsDisplay();
        if (onCardSelect) onCardSelect();
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
        UIManager.showMessage('Selection cleared');
    }

    getSelectedCards() {
        return [...this.selectedCards];
    }

    isValidSelection() {
        return this.selectedCards.length === 3;
    }

    reset() {
        this.selectedCards = [];
    }
}