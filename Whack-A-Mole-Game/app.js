const square = document.querySelectorAll('.square')
const mole = document.querySelector('.mole')
const timeLeft = document.querySelector('#time-left')
let score = document.querySelector('#score')

let result = 0
let currentTime = timeLeft.textContent
let timerId = null;

function randomSquare() {
    square.forEach(className => {
      className.classList.remove('mole')
    })

    let randomPosition = square[Math.floor(Math.random() * 9)]
    randomPosition.classList.add('mole')

    //assign the id of the randomPosition to hitPosition for us to use later
    hitPosition = randomPosition.id
}

function moveMole() {
  timerId = setInterval(randomSquare, 750)
}

moveMole()


function countDown() {
  currentTime--
  timeLeft.textContent = currentTime

  if (currentTime === 0) {
    clearInterval(timerId)
    clearInterval(countdownTimer)
    alert('GAME OVER! Your final score is '+ result)
  }
}

square.forEach(id => {
  id.addEventListener('mouseup', () => {
    console.log('checkingScore')
    if (id.id === hitPosition) {
      result = result + 1
      score.textContent = result
    }
  })
})


let countdownTimer = setInterval(countDown, 1000)
