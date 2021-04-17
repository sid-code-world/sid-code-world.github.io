const musicContainer = document.querySelector('.music-container')
const playBtn = document.querySelector('#play')
const prevBtn = document.querySelector('#prev')
const nextBtn = document.querySelector('#next')
const audio = document.querySelector('#audio')
const progress = document.querySelector('.progress')
const progressContainer = document.querySelector('.progress-container')
const title = document.querySelector('#title')
const cover = document.querySelector('#cover')

// Song titles
const songs = ['Dj Nate-Club Step', 'DJ Nate-Theory Of Everything 2']

// Keep track of songs
let songIndex = 0

//Initially load song info DOM
loadSong(songs[songIndex])
console.log (songs[songIndex])
//Update song details
function loadSong(song){
  title.innerText = song
  audio.src = `../Songs/${song}.mp3`
  cover.src = `../Songs/${song}.jpeg`
}

function playSong() {
  musicContainer.classList.add('play')
  playBtn.querySelector('i.fas').classList.remove('fa-play')
  playBtn.querySelector('i.fas').classList.add('fa-pause')
  audio.play()
}

  function pauseSong() {
    musicContainer.classList.remove('play')
    playBtn.querySelector('i.fas').classList.remove('fa-pause')
    playBtn.querySelector('i.fas').classList.add('fa-play')
    audio.pause()
  }

function playPrevSong() {
  songIndex = songIndex - 1
  loadSong(songs[songIndex])
  playSong()
}

function playNextSong() {
  songIndex = songIndex + 1
  loadSong(songs[songIndex])
  playSong()
}

function updateProgress(e) {
  const {duration, currentTime} = e.srcElement
  const progressPercent = (currentTime / duration) * 100
  progress.style.width = `${progressPercent}%`
}


function setProgress(e) {
  const width = this.clientWidth
  const clickX = e.offsetX
  const duration = audio.duration

  audio.currentTime = (clickX / width) * duration
}

// Event listeners
playBtn.addEventListener('click',() =>{
  const isPlaying = musicContainer.classList.contains('play')
  if(isPlaying) {
    pauseSong()
  } else {
    playSong()
  }
})


prevBtn.addEventListener('click',() =>{

  if(songIndex == 0) {
  } else {
    playPrevSong()
  }
})

nextBtn.addEventListener('click',() =>{

  if(songIndex == songs.length - 1) {

  } else {
    playNextSong()
  }
})


audio.addEventListener ('timeupdate', updateProgress)

progressContainer.addEventListener('click', setProgress)

audio.addEventListener('ended', playNextSong)
