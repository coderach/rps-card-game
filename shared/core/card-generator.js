// shared/core/card-generator.js - Card Generation Logic

/**
 * CardGenerator class for creating and managing card collections
 * Used for testing and demo modes (not for Cardano NFT mode)
 */
class CardGenerator {
    /**
     * Generate all mathematically possible cards where properties sum to 20
     * Each property must be between 1 and 9 inclusive
     * @returns {Card[]} - Array of all possible cards
     */
    static generateAllCards() {
        const cards = [];
        let cardId = 0;
        
        // Generate all valid combinations where deception + magic + attack = 20
        for (let deception = 1; deception <= 9; deception++) {
            for (let magic = 1; magic <= 9; magic++) {
                const attack = 20 - deception - magic;
                
                // Only create card if attack is also within valid range
                if (attack >= 1 && attack <= 9) {
                    try {
                        cards.push(new Card(cardId++, deception, magic, attack));
                    } catch (error) {
                        console.warn(`Failed to create card: ${error.message}`);
                    }
                }
            }
        }
        
        return cards;
    }

    /**
     * Get total number of possible cards without generating them
     * @returns {number} - Count of possible cards
     */
    static getTotalCardCount() {
        let count = 0;
        
        for (let deception = 1; deception <= 9; deception++) {
            for (let magic = 1; magic <= 9; magic++) {
                const attack = 20 - deception - magic;
                if (attack >= 1 && attack <= 9) {
                    count++;
                }
            }
        }
        
        return count;
    }

    /**
     * Generate a single random card
     * @param {Card[]} excludeCards - Cards to exclude from selection
     * @returns {Card} - Random card
     */
    static getRandomCard(excludeCards = []) {
        const allCards = this.generateAllCards();
        const availableCards = allCards.filter(card => 
            !excludeCards.some(excludeCard => excludeCard.id === card.id)
        );
        
        if (availableCards.length === 0) {
            throw new Error('No available cards to select from');
        }
        
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        return availableCards[randomIndex];
    }

    /**
     * Generate multiple random cards without duplicates
     * @param {number} count - Number of cards to generate
     * @param {Card[]} excludeCards - Cards to exclude from selection
     * @returns {Card[]} - Array of random cards
     */
    static getRandomCards(count, excludeCards = []) {
        if (count <= 0) {
            return [];
        }
        
        const cards = [];
        let excluded = [...excludeCards];
        
        for (let i = 0; i < count; i++) {
            try {
                const card = this.getRandomCard(excluded);
                cards.push(card);
                excluded.push(card);
            } catch (error) {
                console.warn(`Could not generate card ${i + 1}: ${error.message}`);
                break;
            }
        }
        
        return cards;
    }

    /**
     * Generate cards with specific rarity
     * @param {string} rarity - 'Legendary', 'Epic', 'Rare', or 'Common'
     * @param {number} count - Number of cards to generate
     * @returns {Card[]} - Array of cards with specified rarity
     */
    static getCardsByRarity(rarity, count = 1) {
        const allCards = this.generateAllCards();
        const filteredCards = allCards.filter(card => card.getRarity() === rarity);
        
        if (filteredCards.length === 0) {
            throw new Error(`No cards found with rarity: ${rarity}`);
        }
        
        const selectedCards = [];
        for (let i = 0; i < count && i < filteredCards.length; i++) {
            const randomIndex = Math.floor(Math.random() * filteredCards.length);
            const selectedCard = filteredCards.splice(randomIndex, 1)[0];
            selectedCards.push(selectedCard);
        }
        
        return selectedCards;
    }

    /**
     * Generate balanced cards only (max difference <= 3)
     * @param {number} count - Number of cards to generate
     * @returns {Card[]} - Array of balanced cards
     */
    static getBalancedCards(count = 1) {
        const allCards = this.generateAllCards();
        const balancedCards = allCards.filter(card => card.isBalanced());
        
        if (balancedCards.length === 0) {
            throw new Error('No balanced cards available');
        }
        
        const selectedCards = [];
        for (let i = 0; i < count && i < balancedCards.length; i++) {
            const randomIndex = Math.floor(Math.random() * balancedCards.length);
            const selectedCard = balancedCards.splice(randomIndex, 1)[0];
            selectedCards.push(selectedCard);
        }
        
        return selectedCards;
    }

    /**
     * Generate cards with high values in specific property
     * @param {string} property - 'deception', 'magic', or 'attack'
     * @param {number} minValue - Minimum value for the property
     * @param {number} count - Number of cards to generate
     * @returns {Card[]} - Array of cards with high property values
     */
    static getCardsWithHighProperty(property, minValue = 7, count = 1) {
        if (!GameRules.isValidProperty(property)) {
            throw new Error(`Invalid property: ${property}`);
        }
        
        const normalizedProperty = GameRules.normalizeProperty(property);
        const allCards = this.generateAllCards();
        const filteredCards = allCards.filter(card => 
            card.getProperty(normalizedProperty) >= minValue
        );
        
        if (filteredCards.length === 0) {
            throw new Error(`No cards found with ${normalizedProperty} >= ${minValue}`);
        }
        
        const selectedCards = [];
        for (let i = 0; i < count && i < filteredCards.length; i++) {
            const randomIndex = Math.floor(Math.random() * filteredCards.length);
            const selectedCard = filteredCards.splice(randomIndex, 1)[0];
            selectedCards.push(selectedCard);
        }
        
        return selectedCards;
    }

    /**
     * Generate a preset collection for testing purposes
     * @param {string} collectionType - 'balanced', 'extreme', 'mixed', 'weak', 'strong'
     * @returns {Card[]} - Array of 3 cards for testing
     */
    static getTestCollection(collectionType = 'mixed') {
        switch (collectionType.toLowerCase()) {
            case 'balanced':
                return this.getBalancedCards(3);
            
            case 'extreme':
                // Cards with high differences between properties
                return this.getCardsByRarity('Common', 3);
            
            case 'weak':
                // Cards with generally lower values
                return this.getCardsWithSpecificSum(15, 3);
            
            case 'strong':
                // Cards with generally higher values
                return this.getCardsWithSpecificSum(25, 3);
            
            case 'mixed':
            default:
                // Mix of different card types
                const cards = [];
                cards.push(...this.getBalancedCards(1));
                cards.push(...this.getCardsByRarity('Rare', 1));
                cards.push(...this.getRandomCards(1, cards));
                return cards;
        }
    }

    /**
     * Get cards where highest property value equals specific value
     * @param {number} maxValue - Maximum property value on the card
     * @param {number} count - Number of cards to generate
     * @returns {Card[]} - Array of cards with specified max value
     */
    static getCardsWithSpecificSum(targetSum, count = 1) {
        // This is a helper for test collections
        // Since all cards sum to 20, we use different criteria
        const allCards = this.generateAllCards();
        const filteredCards = allCards.filter(card => {
            const highest = card.getHighestProperty().value;
            return targetSum === 15 ? highest <= 6 :  // "weak" cards
                   targetSum === 25 ? highest >= 8 :  // "strong" cards  
                   true; // fallback
        });
        
        return this.selectRandomFromArray(filteredCards, count);
    }

    /**
     * Helper method to select random items from an array
     * @param {Array} array - Array to select from
     * @param {number} count - Number of items to select
     * @returns {Array} - Selected items
     */
    static selectRandomFromArray(array, count) {
        const selected = [];
        const copy = [...array];
        
        for (let i = 0; i < count && copy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * copy.length);
            selected.push(copy.splice(randomIndex, 1)[0]);
        }
        
        return selected;
    }

    /**
     * Analyze card distribution across all possible cards
     * @returns {Object} - Statistics about card distribution
     */
    static analyzeCardDistribution() {
        const allCards = this.generateAllCards();
        
        const stats = {
            totalCards: allCards.length,
            rarityDistribution: {},
            propertyDistribution: {
                deception: {},
                magic: {},
                attack: {}
            },
            balancedCards: 0,
            extremeCards: 0
        };
        
        // Analyze each card
        allCards.forEach(card => {
            // Rarity distribution
            const rarity = card.getRarity();
            stats.rarityDistribution[rarity] = (stats.rarityDistribution[rarity] || 0) + 1;
            
            // Property value distribution
            stats.propertyDistribution.deception[card.deception] = 
                (stats.propertyDistribution.deception[card.deception] || 0) + 1;
            stats.propertyDistribution.magic[card.magic] = 
                (stats.propertyDistribution.magic[card.magic] || 0) + 1;
            stats.propertyDistribution.attack[card.attack] = 
                (stats.propertyDistribution.attack[card.attack] || 0) + 1;
            
            // Balance analysis
            if (card.isBalanced()) {
                stats.balancedCards++;
            } else {
                stats.extremeCards++;
            }
        });
        
        return stats;
    }

    /**
     * Validate that generated cards follow game rules
     * @param {Card[]} cards - Cards to validate
     * @returns {boolean} - True if all cards are valid
     */
    static validateCards(cards) {
        return cards.every(card => {
            try {
                // Check if it's a Card instance
                if (!(card instanceof Card)) return false;
                
                // Check property sum
                if (card.deception + card.magic + card.attack !== 20) return false;
                
                // Check property ranges
                if (card.deception < 1 || card.deception > 9) return false;
                if (card.magic < 1 || card.magic > 9) return false;
                if (card.attack < 1 || card.attack > 9) return false;
                
                return true;
            } catch (error) {
                return false;
            }
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardGenerator };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.CardGenerator = CardGenerator;
}