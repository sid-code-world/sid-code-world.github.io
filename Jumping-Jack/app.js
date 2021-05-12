const distanceJumped = document.querySelector('.distanceJumped')
const targetLilyPad = document.querySelector('.lilyPadEnd')
var failParagraph = document.getElementById('failed')
var successParagraph = document.getElementById('success')
let startTime;
var JumpUp = 0;
var speedY = 0;
var speedX = 0;
var jackTheFrog = document.querySelector('.JackTheFrog');
let startTimer;
let distanceToMove;
let livesRemaining = 3;
var gameStatus = document.querySelector('.gameStatus')
var life1 = document.querySelector('#life1')
var life2 = document.querySelector('#life2')
var life3 = document.querySelector('#life3')
var deviceType = "keyboard"

if ("ontouchstart" in document.documentElement) {
  deviceType = "touch";
}

function moveFrog() {

  let rect = jackTheFrog.getBoundingClientRect();
  console.log(rect.top)
  console.log((rect.top - 10) + "px")
  jackTheFrog.style.top = (rect.top - 10) + "px";
  distanceToMove = distanceToMove - 10;
  rect = document.getElementById('theFrog').getBoundingClientRect();
  console.log("after move:" + rect.top)
  if (distanceToMove < 0) {
    clearInterval(startTimer)
    checkLanding(rect.top, rect.bottom)
  }
  console.log("distanceToMove: ",distanceToMove)


}

function startJump(diff) {
  distanceToMove = diff;
  startTimer = setInterval(moveFrog, 50)

}

function checkLanding(jackTop, jackBottom) {
  jackTop = jackTop + 35;
  jackBottom = jackBottom - 35;
  let lilypadrect = targetLilyPad.getBoundingClientRect();
  console.log('checkLanding', jackTop, jackBottom, lilypadrect.top, lilypadrect.bottom)

  if (jackTop > lilypadrect.bottom || (jackBottom < lilypadrect.top && jackTop < lilypadrect.top) ) {
    failParagraph.style.display = "block";
    livesRemaining = livesRemaining - 1;
    resetJack();
  } else {
    successParagraph.style.display = "block";
    nextLevel()
  }
  if (livesRemaining === 0) {
    gameStatus.style.display = "block"
    life1.style.display = "none"
    life2.style.display = "none"
    life3.style.display = "none"
  }

  if (livesRemaining === 1) {
    life2.style.display = "none"
    life3.style.display = "none"
  }

  if (livesRemaining === 2) {
    life3.style.display = "none"
  }

  if (livesRemaining === 3) {
    life1.style.display = "block"
    life2.style.display = "block"
    life3.style.display = "block"
  }
}

function resetJack() {
  jackTheFrog.style.top = "";
  jackTheFrog.style.bottom = 20;
}

function nextLevel() {
let lilypadrect = targetLilyPad.getBoundingClientRect();
  if (successParagraph.style.display = "block") {
    lilypadrect.bottom = 500;
    lilypadrect.top = "";
  }
}


//Event Listeners
if (deviceType == "keyboard") {
  jackTheFrog.addEventListener('mousedown', ()=> {
    startTime = new Date()

  })

  jackTheFrog.addEventListener('mouseup', ()=> {
    let diff = new Date() - startTime
    distanceJumped.innerText = diff;
    startJump(diff);

  })
} else {
  jackTheFrog.addEventListener('ontouchstart', ()=> {
    startTime = new Date()

  })

  jackTheFrog.addEventListener('ontouchend', ()=> {
    let diff = new Date() - startTime
    console.log('ontouchend', diff)
    distanceJumped.innerText = diff;
    startJump(diff);

  })
}
