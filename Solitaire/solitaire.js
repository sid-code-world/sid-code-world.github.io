const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

        
        function createDeck() {
            const deck = [];
            for (const suit of suits) {
                for (const rank of ranks) {
                    deck.push({ suit, rank });
                }
            }
            return deck;
        }

        
        function shuffle(deck) {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

       
        function dealCard(deck) {
            return deck.pop();
        }

        e
        function initializeGame() {
            const deck = createDeck();
            shuffle(deck);
            
        }
		
		
		const piles = {
    
			pile1: [],
			pile2: [],
			pile3: [],
			pile4: [],
			pile5: [],
			pile6: [],
			pile7: [],
};

		const foundation = {
   
			Hearts: [],
			Diamonds: [],
			Clubs: [],
			Spades: [],
};

       
        document.getElementById("js-reset").addEventListener("click", initializeGame);

        
        window.onload = initializeGame;