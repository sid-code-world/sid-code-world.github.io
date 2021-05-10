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
  jackTop = jackTop + 30;
  jackBottom = jackBottom - 30;
  let lilypadrect = targetLilyPad.getBoundingClientRect();
  console.log('checkLanding', jackTop, jackBottom, lilypadrect.top, lilypadrect.bottom)

  if (jackTop > lilypadrect.bottom || (jackBottom < lilypadrect.top && jackTop < lilypadrect.top) ) {
    failParagraph.style.display = "block";
    resetJack();
  } else {
    successParagraph.style.display = "block";
  }
}

function resetJack() {
  jackTheFrog.style.top = "";
  jackTheFrog.style.bottom = 20;
}



//Event Listeners

jackTheFrog.addEventListener('mousedown', ()=> {
  startTime = new Date()

})

jackTheFrog.addEventListener('mouseup', ()=> {
  let diff = new Date() - startTime
  distanceJumped.innerText = diff;
  startJump(diff);

})

jackTheFrog.addEventListener('ontouchstart', ()=> {
  startTime = new Date()

})

jackTheFrog.addEventListener('ontouchend', ()=> {
  let diff = new Date() - startTime
  distanceJumped.innerText = diff;
  startJump(diff);

})
