document.addEventListener("DOMContentLoaded", function() {
    const suits = ["spades", "hearts", "diamonds", "clubs"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck = [];

    // Create deck
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({suit: suit, rank: rank});
        }
    }

    // Shuffle deck
    shuffle(deck);

    // Distribute cards to the board
    const board = document.getElementById("js-board");
    for (let i = 0; i < 7; i++) {
        const column = document.createElement("div");
        column.classList.add("column");
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            const cardElement = createCardElement(card.suit, card.rank);
            if (j === i) {
                cardElement.classList.add("face-up");
            } else {
                cardElement.classList.add("face-down");
            }
            column.appendChild(cardElement);
        }
        board.appendChild(column);
    }
});

// Function to shuffle the deck
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Function to create a card element
function createCardElement(suit, rank) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `${rank} <br> <span class="${suit}"></span>`;
    return card;
}
