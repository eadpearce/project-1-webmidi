// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html
const pcNotes = {
  0: null,
  1: null,
  2: null
};
const playerNotes = {
  0: null,
  1: null,
  2: null
};
const allKeys = [0,1,2,3,4,5,6,7,8,9,10,11];
// const blackKeys = [1,3,6,8,10];
const whiteKeys = [0,2,4,5,7,9,11];
let time = 0;
function genRand(array) {
  const randIndex = Math.floor(Math.random() * array.length);
  return randIndex;
}

$( () => {
  const $start = $('.start');
  const $keys = $('.keys');
  const audio = document.getElementById('piano');
  let canPlay = false;

  function checkMatch() {
    if (playerNotes[0] === pcNotes[0] && playerNotes[1] === pcNotes[1] && playerNotes[2] === pcNotes[2]) {
      console.log('correct! yuo are smart');

      pcNotes[0] = null;
      pcNotes[1] = null;
      pcNotes[2] = null;
    }
  }


  // piano playback
  $keys.on('click', function(e) {
    // console.log(e.target.id);
    audio.src = 'sounds/' + e.target.id +'.ogg';
    audio.play();

    if (canPlay) {
      playerNotes[time] = parseInt(e.target.id);
      time++;
      console.log(playerNotes);
      if (time===3) {
        console.log('finish');
        // check if match
        checkMatch();
      }
    }
  });

  // need button to start playback of notes
  $start.on('click', function() {
    pcNotes[0] = whiteKeys[genRand(whiteKeys)];
    pcNotes[1] = whiteKeys[genRand(whiteKeys)];
    pcNotes[2] = whiteKeys[genRand(whiteKeys)];
    console.log(pcNotes);
    const timer = setInterval( () => {
      // console.log(timeRemaining);
      audio.src = 'sounds/' + pcNotes[time] + '.ogg';
      audio.play();
      time++;
      if (time > 2) {
        clearInterval(timer);
        time = 0;
        canPlay = true;
      }
    }, 1000);
  });


});
