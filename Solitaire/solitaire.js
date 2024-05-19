
function Card(face, rank) {
    this.face = face;
    this.rank = rank;

    
    this.color = function() {
        return (this.face === "Hearts" || this.face === "Diamonds") ? "red" : "black";
    };

    
    this.isSameFace = function(otherCard) {
        return this.face === otherCard.face;
    };

    
    this.isOppositeColor = function(otherCard) {
        return this.color() !== otherCard.color();
    };

    
    this.isPreviousInSequence = function(otherCard) {
        return this.rank === otherCard.rank - 1;
    };

    
    this.isNextInSequence = function(otherCard) {
        return this.rank === otherCard.rank + 1;
    };
}


function Deck() {
    this.cards = [];

    
    this.initialize = function() {
        var faces = ["Hearts", "Diamonds", "Clubs", "Spades"];
        var ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        for (var i = 0; i < faces.length; i++) {
            for (var j = 0; j < ranks.length; j++) {
                this.cards.push(new Card(faces[i], ranks[j]));
            }
        }
    };

    
    this.shuffle = function() {
        for (var i = this.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    };

    
    this.deal = function() {
        if (this.cards.length > 0) {
            return this.cards.pop();
        } else {
            console.log("Deck is empty.");
            return null;
        }
    };
}


function Pile(cards) {
    this.cards = cards;

    
    this.canPlaceCard = function(card) {
        if (this.cards.length === 0) {
            return true; 
        } else {
            var topCard = this.cards[this.cards.length - 1];
            return card.isOppositeColor(topCard) && card.isPreviousInSequence(topCard);
        }
    };
}


function FoundationPile() {
    this.cards = [];

    
    this.canPlaceCard = function(card) {
        if (this.cards.length === 0) {
            return card.rank === 1; 
        } else {
            var topCard = this.cards[this.cards.length - 1];
            return card.isSameFace(topCard) && card.isNextInSequence(topCard);
        }
    };
}


function Game() {
    this.deck = new Deck();
    this.piles = [];
    this.foundationPiles = [];

    
    this.initialize = function() {
        this.deck.initialize();
        this.deck.shuffle();

       
        for (var i = 0; i < 7; i++) {
            var pileCards = [];
            for (var j = 0; j <= i; j++) {
                pileCards.push(this.deck.deal());
            }
            this.piles.push(new Pile(pileCards));
        }

        
        for (var i = 0; i < 4; i++) {
            this.foundationPiles.push(new FoundationPile());
        }
    };

    
    this.start = function() {
        this.initialize();
        
    };
}

d
function displayCard(container, face, rank) {
    const card = document.createElement('div');
    card.classList.add('card', 'front');
    card.setAttribute('data-face', face);
    card.setAttribute('data-rank', rank);
    container.appendChild(card);
}

	
const deckContainer = document.querySelector('.deck');
displayCard(deckContainer, 'Hearts', 10);


var game = new Game();
game.start();
console.log(game);
