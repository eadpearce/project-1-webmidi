// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html

// const allnotes = [0,1,2,3,4,5,6,7,8,9,10,11];
// const blacknotes = [1,3,6,8,10];
// const whitenotes = [0,2,4,5,7,9,11];

// level1 uses only 3 of the white notes and a phrase length of 3
// level is 3 turns long
const level1 = {
  notes: [0,2,4],
  phraseLength: 3
};
// level2 uses 5 whites notes
const level2 = {
  notes: [0,2,4,5,7],
  phraseLength: 5
};
// level3 uses all the white notes
const level3 = {
  notes: [0,2,4,5,7,9,11],
  phraseLength: 5
};
// uses all white notes and phrase length of 4
const level4 = {
  notes: [0,2,4,5,7,9,11],
  phraseLength: 5
};
// uses black and white notes up to E, phrase length of 4
const level5 = {
  notes: [0,1,2,3,4],
  phraseLength: 3
};
// uses all notes
const level6 = {
  notes: [0,1,2,3,4,5,6,7,8,9,10,11],
  phraseLength: 5
};
// uses all notes, phrase length of 5
const level7 = {
  notes: [0,1,2,3,4,5,6,7,8,9,10,11],
  phraseLength: 5
};
// start at level1 by default
let currentLevel = level1;
// time to keep track of notes played
let time = 0;
let playerNotes = [];
let pcNotes = [];

function genRand(length) {
  // copy currentLevel.notes to availNotes
  const availNotes = [];
  availNotes.push(...currentLevel.notes);
  const output = [];
  for (var i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * availNotes.length);
    // const randNote = availNotes[randIndex];
    const num = availNotes.splice(randIndex, 1)[0];
    output.push(num);
  }
  // for (var i = 0; i < array.length; i++) {
  //   const num = Math.floor(Math.random() * array.length);
  //   output.push(num);
  //   if (i > 0 && num === output[i-1]) {
  //     console.log('same');
  //     output.pop();
  //     i--;
  //   }
  // }
  return output;
}

$( () => {
  const $start = $('.start');
  const $keys = $('.keys');

  // set up audio tags and src
  const container = document.querySelector('.container');
  for (let i = 0; i < 12; i++) {
    const audios = document.createElement('audio');
    audios.id = 'audio'+i;
    audios.src = 'sounds/audio'+i+'.ogg';
    container.appendChild(audios);
  }

  const $audio = $('audio');
  let canPlay = false;

  function checkMatch() {
    console.log('pcNotes: '+pcNotes);
    console.log('playerNotes: '+playerNotes);
    for (let i = 0; i < pcNotes.length; i++) {
      if (pcNotes[i] !== playerNotes[i]) {
        return false;
      }
    }
    // reset the array
    playerNotes = [];
    return true;
    // if (playerNotes[0] === pcNotes[0] && playerNotes[1] === pcNotes[1] && playerNotes[2] === pcNotes[2]) {
    //   console.log('correct! yuo are smart');
    // }
    // console.log(pcNotes);
  }

  // // set up audio for each key
  // $audio.each( function(i) {
  //   $audio[i].src = 'sounds/' + $audio[i].id + '.ogg';
  // });


  // piano playback
  $keys.on('mousedown', function(e) {
    // e.target
    // console.log(e.target.id);
    // $audio[e.target.id].src = 'sounds/audio' + e.target.id +'.ogg';
    $audio[e.target.id].play();

    if (canPlay) {
      playerNotes.push(parseInt(e.target.id));
      time++;
      if (time===pcNotes.length) {
        console.log(playerNotes);
        console.log('finish playing');
        time = 0;
        // check if match
        if (checkMatch()) {
          console.log('correct');
        }
      }
    }
  });

  // button to start playback of notes
  // need way to make sure same note is not chosen twice
  $start.on('click', function() {
    pcNotes = [];
    pcNotes = genRand(currentLevel.phraseLength);
    const timer = setInterval( () => {
      const thisNote = pcNotes[time];
      // console.log(time);
      $audio[thisNote].play();
      time++;
      if (time === pcNotes.length) {
        console.log('pcNotes: '+pcNotes);
        clearInterval(timer);
        time = 0;
        canPlay = true;
      }
    }, 1000);
  });


});
