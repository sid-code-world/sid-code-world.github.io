function Card(face, rank) {
    this.face = face;
    this.rank = rank;
    this.isFaceUp = false;
    this.pile = null;

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
            cardDiv.style.backgroundPosition = `-${(this.rank - 1) * 72}px -${["Clubs", "Diamonds", "Hearts", "Spades"].indexOf(this.face) * 96}px`;
        } else {
            cardDiv.classList.add('back');
        }
        cardDiv.draggable = true;
        cardDiv.addEventListener('dragstart', (e) => this.dragStart(e));
        cardDiv.addEventListener('dragend', (e) => this.dragEnd(e));
        container.appendChild(cardDiv);
        this.element = cardDiv;
    };

    this.dragStart = function(e) {
        e.dataTransfer.setData('text/plain', `${this.face},${this.rank}`);
        setTimeout(() => this.element.classList.add('invisible'), 0);
    };

    this.dragEnd = function(e) {
        this.element.classList.remove('invisible');
        if (this.pile) {
            this.pile.render();
        }
        checkWinCondition();
        checkLoseCondition();
    };

    this.setPile = function(pile) {
        this.pile = pile;
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
        card.setPile(this);
        card.display(this.container);
    };

    this.removeCard = function(card) {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            this.container.removeChild(card.element);
        }
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

    this.container.addEventListener('dragover', (e) => this.dragOver(e));
    this.container.addEventListener('drop', (e) => this.drop(e));

    this.dragOver = function(e) {
        e.preventDefault();
    };

    this.drop = function(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain').split(',');
        const face = data[0];
        const rank = parseInt(data[1]);
        const card = new Card(face, rank);
        const oldPile = card.pile; // Keep reference to the old pile

        if (this.canPlaceCard(card)) {
            card.isFaceUp = true;
            this.addCard(card);
            if (oldPile) {
                oldPile.removeCard(card);
            }
        } else {
            if (oldPile) {
                oldPile.addCard(card); // Re-add to the old pile if move is invalid
            }
        }
    };

    this.render = function() {
        this.container.innerHTML = '';
        this.cards.forEach(card => card.display(this.container));
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
        card.setPile(this);
        card.isFaceUp = true;
        card.display(this.container);
    };

    this.removeCard = function(card) {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            this.container.removeChild(card.element);
        }
    };

    this.container.addEventListener('dragover', (e) => this.dragOver(e));
    this.container.addEventListener('drop', (e) => this.drop(e));

    this.dragOver = function(e) {
        e.preventDefault();
    };

    this.drop = function(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain').split(',');
        const face = data[0];
        const rank = parseInt(data[1]);
        const card = new Card(face, rank);
        const oldPile = card.pile; // Keep reference to the old pile

        if (this.canPlaceCard(card)) {
            card.isFaceUp = true;
            this.addCard(card);
            if (oldPile) {
                oldPile.removeCard(card);
            }
        } else {
            if (oldPile) {
                oldPile.addCard(card); // Re-add to the old pile if move is invalid
            }
        }
    };

    this.render = function() {
        this.container.innerHTML = '';
        this.cards.forEach(card => card.display(this.container));
    };
}

function DiscardPile(container) {
    this.cards = [];
    this.container = container;

    this.addCard = function(card) {
        this.cards.push(card);
        card.setPile(this);
        this.render();
    };

    this.removeCard = function(card) {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            this.container.removeChild(card.element);
        }
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
            checkLoseCondition();
        });
    };

    this.start = function() {
        this.initialize();
    };
}

function checkWinCondition() {
    let win = true;
    for (const pile of game.foundationPiles) {
        if (pile.cards.length !== 13) {
            win = false;
            break;
        }
    }
    if (win) {
        alert("Congratulations! You've won the game!");
    }
}

function checkLoseCondition() {
    let lose = true;
    for (const pile of game.piles) {
        for (const card of pile.cards) {
            if (pile.canPlaceCard(card)) {
                lose = false;
                break;
            }
        }
        if (!lose) {
            break;
        }
    }
    if (lose && game.deck.cards.length === 0 && game.discardPile.cards.length === 0) {
        alert("No more moves! You've lost the game.");
    }
}

const game = new Game();
game.start();
