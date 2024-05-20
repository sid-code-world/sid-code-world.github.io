function Card(face, rank) {
    this.face = face;
    this.rank = rank;
    this.isFaceUp = false;

  
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

   
    this.display = function(container) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        if (this.isFaceUp) {
            cardDiv.classList.add('front');
            cardDiv.setAttribute('data-face', this.face);
            cardDiv.setAttribute('data-rank', this.rank);
        } else {
            cardDiv.classList.add('back');
        }
        container.appendChild(cardDiv);
    };
}


function Deck() {
    this.cards = [];

   
    this.initialize = function() {
        const faces = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        for (let i = 0; i < faces.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                this.cards.push(new Card(faces[i], ranks[j]));
            }
        }
    };

   
    this.shuffle = function() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cards[i];
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


function Pile(container) {
    this.cards = [];
    this.container = container;

    this.addCard = function(card) {
        this.cards.push(card);
        card.display(this.container);
    };

   
    this.canPlaceCard = function(card) {
        if (this.cards.length === 0) {
            return true; 
        } else {
            const topCard = this.cards[this.cards.length - 1];
            return card.isOppositeColor(topCard) && card.isPreviousInSequence(topCard);
        }
    };

    this.initialize = function(deck, numCards) {
        for (let i = 0; i < numCards; i++) {
            const card = deck.deal();
            card.isFaceUp = (i === numCards - 1); 
            this.addCard(card);
        }
    };
}


function FoundationPile(container) {
    this.cards = [];
    this.container = container;

   
    this.canPlaceCard = function(card) {
        if (this.cards.length === 0) {
            return card.rank === 1; 
        } else {
            const topCard = this.cards[this.cards.length - 1];
            return card.isSameFace(topCard) && card.isNextInSequence(topCard);
        }
    };

    
    this.addCard = function(card) {
        this.cards.push(card);
        card.isFaceUp = true; 
        card.display(this.container);
    };
}

function DiscardPile(container) {
    this.cards = [];
    this.container = container;

   
    this.addCard = function(card) {
        this.cards.push(card);
        this.render();
    };

    
    this.render = function() {
        this.container.innerHTML = ''; 
        if (this.cards.length > 0) {
            const topCard = this.cards[this.cards.length - 1];
            topCard.isFaceUp = true;
            topCard.display(this.container);
        }
    };
}



function Game() {
    this.deck = new Deck();
    this.piles = [];
    this.foundationPiles = [];
    this.discardPile = null;

   
    this.initialize = function() {
        this.deck.initialize();
        this.deck.shuffle();

   
        for (let i = 0; i < 7; i++) {
            const pileContainer = document.getElementById(`pile${i + 1}`);
            const pile = new Pile(pileContainer);
            pile.initialize(this.deck, i + 1);
            this.piles.push(pile);
        }

   
        for (let i = 0; i < 4; i++) {
            const foundationContainer = document.getElementById(`foundationPile${i + 1}`);
            this.foundationPiles.push(new FoundationPile(foundationContainer));
        }

  
        const deckContainer = document.getElementById('deck');
        const discardPileContainer = document.getElementById('discardPile');
        this.discardPile = new DiscardPile(discardPileContainer);

        deckContainer.addEventListener('click', () => {
            const card = this.deck.deal();
            if (card) {
                this.discardPile.addCard(card);
            }
        });
    };

  
    this.start = function() {
        this.initialize();
    };
}


const game = new Game();
game.start();
