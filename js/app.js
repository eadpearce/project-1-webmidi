// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html

// const allKeys = [0,1,2,3,4,5,6,7,8,9,10,11];
// const blackKeys = [1,3,6,8,10];
// const whiteKeys = [0,2,4,5,7,9,11];

// level1 uses only 3 of the white keys and a phrase length of 3
// level is 3 turns long
const level1 = {
  pcNotes: [null, null, null],
  playerNotes: [null, null, null],
  keys: [0,2,4],
  length: 3
};
// level2 uses 5 whites keys
const level2 = {
  pcNotes: [null, null, null],
  playerNotes: [null, null, null],
  keys: [0,2,4,5,7],
  length: 5
};
// level3 uses all the white keys
const level3 = {
  pcNotes: [null, null, null],
  playerNotes: [null, null, null],
  keys: [0,2,4,5,7,9,11],
  length: 5
};
// uses all white keys and phrase length of 4
const level4 = {
  pcNotes: [null, null, null, null],
  playerNotes: [null, null, null, null],
  keys: [0,2,4,5,7,9,11],
  length: 5
};
// uses black and white keys up to E, phrase length of 4
const level5 = {
  pcNotes: [null, null, null, null],
  playerNotes: [null, null, null, null],
  keys: [0,1,2,3,4],
  length: 3
};
// uses all keys
const level6 = {
  pcNotes: [null, null, null, null],
  playerNotes: [null, null, null, null],
  keys: [0,1,2,3,4,5,6,7,8,9,10,11],
  length: 5
};
// uses all keys, phrase length of 5
const level7 = {
  pcNotes: [null, null, null, null, null],
  playerNotes: [null, null, null, null, null],
  keys: [0,1,2,3,4,5,6,7,8,9,10,11],
  length: 5
};
// start at level1 by default
let currentLevel = level1;
// time to keep track of notes played
let time = 0;

function genRand(array) {
  return Math.floor(Math.random() * array.length);
}

$( () => {
  const $start = $('.start');
  const $keys = $('.keys');
  const $audio = $('audio');
  // const audio = document.getElementById('piano');
  let canPlay = false;

  function checkMatch() {
    if (currentLevel.playerNotes[0] === currentLevel.pcNotes[0] && currentLevel.playerNotes[1] === currentLevel.pcNotes[1] && currentLevel.playerNotes[2] === currentLevel.pcNotes[2]) {
      console.log('correct! yuo are smart');
    }
    // reset the arrays
    for (var i = 0; i < currentLevel.pcNotes.length; i++) {
      currentLevel.pcNotes[i] = null;
      currentLevel.playerNotes[i] = null;
      console.log(currentLevel.pcNotes);
    }
  }


  // piano playback
  $keys.on('click', function(e) {
    // console.log(e.target.id);
    $audio[e.target.id].src = 'sounds/' + e.target.id +'.ogg';
    $audio[e.target.id].play();

    if (canPlay) {
      currentLevel.playerNotes[time] = parseInt(e.target.id);
      time++;
      console.log(currentLevel.playerNotes);
      if (time===3) {
        console.log('finish');
        // check if match
        checkMatch();
        time = 0;
      }
    }
  });

  // need button to start playback of notes
  $start.on('click', function() {
    currentLevel.pcNotes[0] = currentLevel.keys[genRand(currentLevel.keys)];
    currentLevel.pcNotes[1] = currentLevel.keys[genRand(currentLevel.keys)];
    currentLevel.pcNotes[2] = currentLevel.keys[genRand(currentLevel.keys)];
    console.log(currentLevel.pcNotes);
    const timer = setInterval( () => {
      // console.log(timeRemaining);
      audio.src = 'sounds/' + currentLevel.pcNotes[time] + '.ogg';
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
