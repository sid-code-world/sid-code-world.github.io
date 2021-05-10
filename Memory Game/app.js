
document.addEventListener('DOMContentLoaded',() => {
  const cardArray = [
    {
      name: 'BlueLegoBlock',
      img: '../Memory Game/images/BlueLegoBlock.jpeg'
    },
    {
      name: 'GreenLegoBlock',
      img:  '../Memory Game/images/GreenLegoBlock.jpeg'
    },
    {
      name: 'OrangeLegoBlock',
      img:  '../Memory Game/images/OrangeLegoBlock.jpeg'
    },
    {
      name: 'PurpleLegoBlock',
      img:  '../Memory Game/images/PurpleLegoBlock.jpeg'
    },
    {
      name: 'RedLegoBlock',
      img:  '../Memory Game/images/RedLegoBlock.jpeg'
    },
    {
      name: 'WhiteLegoBlock',
      img:  '../Memory Game/images/WhiteLegoBlock.jpeg'
    },
    {
      name: 'YellowLegoBlock',
      img:  '../Memory Game/images/YellowLegoBlock.jpeg'
    },
    {
      name: 'BlueLegoBlock',
      img: '../Memory Game/images/BlueLegoBlock.jpeg'
    },
    {
      name: 'GreenLegoBlock',
      img:  '../Memory Game/images/GreenLegoBlock.jpeg'
    },
    {
      name: 'OrangeLegoBlock',
      img:  '../Memory Game/images/OrangeLegoBlock.jpeg'
    },
    {
      name: 'PurpleLegoBlock',
      img:  '../Memory Game/images/PurpleLegoBlock.jpeg'
    },
    {
      name: 'RedLegoBlock',
      img:  '../Memory Game/images/RedLegoBlock.jpeg'
    },
    {
      name: 'WhiteLegoBlock',
      img:  '../Memory Game/images/WhiteLegoBlock.jpeg'
    },
    {
      name: 'YellowLegoBlock',
      img:  '../Memory Game/images/YellowLegoBlock.jpeg'
    },
    {
      name: 'BrownLegoBlock',
      img:  '../Memory Game/images/BrownLegoBlock.jpeg'
    },
    {
      name: 'BrownLegoBlock',
      img:  '../Memory Game/images/BrownLegoBlock.jpeg'
    }
  ]

cardArray.sort(()=> 0.5 - Math.random())

const grid = document.querySelector('.grid')
const resultDisplay = document.querySelector('#result')
var cardsChosen = []
var cardsChosenId = []
var cardsWon = []
var attempts = 0;
const refreshBtn = document.querySelector('#refresh')

//create your board
function createBoard() {
  for (let i = 0; i < cardArray.length; i++) {
    var card = document.createElement('img')
    card.setAttribute('src', '../Memory Game/images/BlackLegoBlock.jpeg')
    card.setAttribute('data-id', i)
    card.addEventListener('click',flipCard)
    grid.appendChild(card)
  }
}

createBoard()

//check for matches
function checkForMatch() {
  var cards = document.querySelectorAll('img')
  const optionOneId = cardsChosenId[0]
  const optionTwoId = cardsChosenId[1]
  if (cardsChosen[0] === cardsChosen[1]) {
    cards[optionOneId].setAttribute('src', '../Memory Game/images/WhiteLegoBlock.jpeg')
    cards[optionTwoId].setAttribute('src', '../Memory Game/images/WhiteLegoBlock.jpeg')
    cardsWon.push(cardsChosen)
  }  else {
    cards[optionOneId].setAttribute('src', '../Memory Game/images/BlackLegoBlock.jpeg')
    cards[optionTwoId].setAttribute('src', '../Memory Game/images/BlackLegoBlock.jpeg')
  }
  cardsChosen = []
  cardsChosenId = []
  resultDisplay.textContent = cardsWon.length

  if (cardsWon.length === cardArray.length/10) {
    resultDisplay.textContent = 'Congratulations! You found them all!'
  }
  const attemptsDisplay = document.querySelector('#attempts')
  attempts = attempts+1;
  attemptsDisplay.textContent = attempts;
}

//flip your card
function flipCard() {
  var cardId = this.getAttribute('data-id')
  cardsChosen.push(cardArray[cardId].name)
  cardsChosenId.push(cardId)
  this.setAttribute('src', cardArray[cardId].img)
  if (cardsChosen.length === 2) {
    setTimeout(checkForMatch, 500)
  }
}
//refresh button

refreshBtn.addEventListener('click',()=> {
  window.location.reload();
})

})
