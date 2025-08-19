// shared/core/card.js - Core Card Class Definition

/**
 * Card class representing a single card with Deception, Magic, Attack properties
 * This class is reusable across console, web testing, and future Cardano integration
 */
class Card {
    constructor(id, deception, magic, attack) {
        // Validate property sum
        if (deception + magic + attack !== 20) {
            throw new Error(`Card properties must sum to 20. Got: ${deception + magic + attack}`);
        }
        
        // Validate individual property ranges
        if (!this.isValidProperty(deception) || !this.isValidProperty(magic) || !this.isValidProperty(attack)) {
            throw new Error('Each property must be between 1 and 9 inclusive');
        }
        
        this.id = id;
        this.deception = deception;
        this.magic = magic;
        this.attack = attack;
        
        // Legacy support for old property names (for backward compatibility)
        this.rock = deception;
        this.paper = magic;
        this.scissors = attack;
        
        // Freeze the object to prevent modification after creation
        Object.freeze(this);
    }

    /**
     * Validate if a property value is within allowed range
     * @param {number} value - Property value to validate
     * @returns {boolean} - True if valid
     */
    isValidProperty(value) {
        return Number.isInteger(value) && value >= 1 && value <= 9;
    }

    /**
     * Get property value by name
     * @param {string} property - Property name ('deception', 'magic', 'attack')
     * @returns {number} - Property value
     */
    getProperty(property) {
        // Support both new and legacy property names
        const propertyMap = {
            'rock': 'deception',
            'paper': 'magic', 
            'scissors': 'attack',
            'deception': 'deception',
            'magic': 'magic',
            'attack': 'attack'
        };
        
        const mappedProperty = propertyMap[property];
        if (!mappedProperty) {
            throw new Error(`Invalid property name: ${property}`);
        }
        
        return this[mappedProperty];
    }

    /**
     * Get all properties as an object
     * @returns {Object} - Object with all property values
     */
    getProperties() {
        return {
            deception: this.deception,
            magic: this.magic,
            attack: this.attack
        };
    }

    /**
     * Check if this card is identical to another card
     * @param {Card} otherCard - Card to compare with
     * @returns {boolean} - True if cards have identical properties
     */
    isIdentical(otherCard) {
        if (!(otherCard instanceof Card)) {
            return false;
        }
        
        return this.deception === otherCard.deception &&
               this.magic === otherCard.magic &&
               this.attack === otherCard.attack;
    }

    /**
     * Get the highest property value and its name
     * @returns {Object} - {property: string, value: number}
     */
    getHighestProperty() {
        const properties = [
            { property: 'deception', value: this.deception },
            { property: 'magic', value: this.magic },
            { property: 'attack', value: this.attack }
        ];
        
        return properties.reduce((max, current) => 
            current.value > max.value ? current : max
        );
    }

    /**
     * Get the lowest property value and its name
     * @returns {Object} - {property: string, value: number}
     */
    getLowestProperty() {
        const properties = [
            { property: 'deception', value: this.deception },
            { property: 'magic', value: this.magic },
            { property: 'attack', value: this.attack }
        ];
        
        return properties.reduce((min, current) => 
            current.value < min.value ? current : min
        );
    }

    /**
     * Check if this card is balanced (max difference <= 3)
     * @returns {boolean} - True if card is balanced
     */
    isBalanced() {
        const highest = this.getHighestProperty().value;
        const lowest = this.getLowestProperty().value;
        return (highest - lowest) <= 3;
    }

    /**
     * Get card rarity based on property distribution
     * @returns {string} - Rarity level
     */
    getRarity() {
        const highest = this.getHighestProperty().value;
        const lowest = this.getLowestProperty().value;
        const difference = highest - lowest;
        
        if (difference <= 1) return 'Legendary'; // Very balanced
        if (difference <= 3) return 'Epic';      // Balanced
        if (difference <= 5) return 'Rare';      // Moderate
        return 'Common';                         // Extreme
    }

    /**
     * Convert card to string representation
     * @returns {string} - Human readable card description
     */
    toString() {
        return `Deception: ${this.deception}, Magic: ${this.magic}, Attack: ${this.attack}`;
    }

    /**
     * Convert card to compact string representation
     * @returns {string} - Compact card description
     */
    toCompactString() {
        return `🎭${this.deception} ✨${this.magic} ⚔️${this.attack}`;
    }

    /**
     * Convert card to JSON-serializable object
     * @returns {Object} - Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            deception: this.deception,
            magic: this.magic,
            attack: this.attack,
            rarity: this.getRarity(),
            balanced: this.isBalanced()
        };
    }

    /**
     * Create a Card from a plain object
     * @param {Object} obj - Plain object with card data
     * @returns {Card} - New Card instance
     */
    static fromJSON(obj) {
        return new Card(obj.id, obj.deception, obj.magic, obj.attack);
    }

    /**
     * Create a Card from legacy object (with rock/paper/scissors)
     * @param {Object} obj - Legacy object with old property names
     * @returns {Card} - New Card instance
     */
    static fromLegacy(obj) {
        return new Card(obj.id || 0, obj.rock, obj.paper, obj.scissors);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Card };
}

// Also make available globally for browser
if (typeof window !== 'undefined') {
    window.Card = Card;
}