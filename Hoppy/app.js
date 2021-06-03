const canvas = document.querySelector('canvas')
const jackTheFrog = document.querySelector('#jackTheFrog')
console.log("canvas", canvas)
var canvasWidth = 600;
var canvasHeight = 500;
var padWidth = 100;
var padHeight = 100;
var jackHeight = 100;
var jackWidth = 100;

window.onload = function() {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = document.getElementById("lilyPad");
    ctx.drawImage(img, canvasWidth/2 - padWidth/2, canvasHeight - padHeight);

    var img2 = document.getElementById('jackTheFrog');
    var jack = ctx.drawImage(img2, canvasWidth/2 - padWidth/2, canvasHeight - padHeight)
    console.log(jack)
}


//Event Listeners
jackTheFrog.addEventListener('click',() =>{
  console.log("clickedJack")
})
