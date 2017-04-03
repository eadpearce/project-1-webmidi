// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html

// const allnotes = [0,1,2,3,4,5,6,7,8,9,10,11];
// const blacknotes = [1,3,6,8,10];
// const whitenotes = [0,2,4,5,7,9,11];

// index corresponds to note ID
const keyboardControl = [65, 87, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74];
const levels = {
  1: { notes: [0,2,4], phraseLength: 3, score: 1},
  2: { notes: [0,2,4,5,7], phraseLength: 4, score: 2 },
  3: { notes: [0,2,4,5,7,9,11], phraseLength: 4, score: 3 },
  4: { notes: [0,2,4,5,7,9,11], phraseLength: 5, score: 4 },
  5: { notes: [0,1,2,3,4,5,6,7], phraseLength: 5, score: 5 },
  6: { notes: [0,1,2,3,4,5,6,7,8,9,10,11], phraseLength: 5, score: 6 },
  7: { notes: [0,1,2,3,4,5,6,7,8,9,10,11], phraseLength: 7, score: 7 }
};

// start at level1 by default
let currentLevel = levels[1];
// time to keep track of notes played
let time = 0;
let playerNotes = [];
let pcNotes = [];
// score weighting for difficulty - 1 is easy 2 is hard
let currentDifficulty = 1;
let canPlay = false;
let score = 0;
let tempo = 1000;

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
  return output;
}

$( () => {
  // set up audio tags and src FIRST
  const container = document.querySelector('.container');
  for (let i = 0; i < 12; i++) {
    const audios = document.createElement('audio');
    audios.id = 'audio'+i;
    audios.src = 'sounds/audio'+i+'.ogg';
    container.appendChild(audios);
  }

  const $audio = $('audio');
  const $play = $('.play');
  const $repeat = $('.repeat');
  const $keys = $('.keys');
  const $winmsg = $('.winmsg');
  const $score = $('.score');
  $score.html('Score: '+score);

  // check if correct
  function checkMatch() {
    console.log('pcNotes: '+pcNotes);
    console.log('playerNotes: '+playerNotes);
    for (let i = 0; i < pcNotes.length; i++) {
      if (pcNotes[i] !== playerNotes[i]) {
        playerNotes = [];
        $winmsg.html('Try again...');
        setTimeout( () => {
          $winmsg.html('');
        }, 1500);
        return false;
      }
    }
    // reset the array
    playerNotes = [];
    $winmsg.html('Correct!');
    score = score + (currentLevel.score * currentDifficulty);
    $score.html('Score: '+score);
    setTimeout( () => {
      $winmsg.html('');
    }, 1000);
    return true;
  }

  // level selector
  $('select').on('change', function() {
    currentLevel = levels[parseInt(this.value.slice(5))];
  });

  // difficulty selector
  $('.difficulty').on('change', function(e) {
    if (e.target.value === 'easy') {
      currentDifficulty = 1;
    } else if (e.target.value === 'hard') {
      currentDifficulty = 2;
    }
  });

  // keyboard playback
  $(document).keydown( function(e) {
    if ($.inArray( e.keyCode, keyboardControl)===-1) {
      return;
    }
    const keyboardNote = keyboardControl.indexOf(e.keyCode);

    $('#key'+keyboardNote).addClass('depress');
    setTimeout( () => {
      $('#key'+keyboardNote).removeClass('depress');
    }, 500);
    $audio[keyboardNote].currentTime=0;
    $audio[keyboardNote].play();

    if (canPlay) {
      playerNotes.push(parseInt(keyboardNote));
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

  // piano mouse playback
  $keys.on('mousedown', function(e) {
    const thisKey = e.target.id;
    const keyId = thisKey.slice(3);
    // console.log(keyId);
    $audio[keyId].currentTime=0;
    $audio[keyId].play();

    $('#key'+thisKey).addClass('depress');
    setTimeout( () => {
      $('#key'+thisKey).removeClass('depress');
    }, 500);

    if (canPlay) {
      playerNotes.push(parseInt(keyId));
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

  // PC phrase playback
  $play.on('click', function() {
    $('.pcmsg').html('Playing...');
    playerNotes = [];
    pcNotes = [];
    pcNotes = genRand(currentLevel.phraseLength);
    const timer = setInterval( () => {
      const thisNote = pcNotes[time];
      // console.log(time);
      // console.log($('#key'+thisNote));
      if (currentDifficulty === 1) {
        $('#key'+thisNote).addClass('depress');
        setTimeout( () => {
          $('#key'+thisNote).removeClass('depress');
        }, 500);
      }
      $audio[thisNote].currentTime=0;
      $audio[thisNote].play();
      time++;
      if (time === pcNotes.length) {
        // console.log('pcNotes: '+pcNotes);
        $('.pcmsg').html('Your turn.');
        clearInterval(timer);
        time = 0;
        canPlay = true;
      }
    }, tempo);
  });

  // PC repeat button
  $repeat.on('click', function() {
    score--;
    $score.html('Score: '+score);
    $('.pcmsg').html('Playing...');
    const timer = setInterval( () => {
      const thisNote = pcNotes[time];
      // console.log(time);
      // console.log($('#key'+thisNote));
      if (currentDifficulty === 1) {
        $('#key'+thisNote).addClass('depress');
        setTimeout( () => {
          $('#key'+thisNote).removeClass('depress');
        }, 500);
      }
      $audio[thisNote].currentTime=0;
      $audio[thisNote].play();
      time++;
      if (time === pcNotes.length) {
        // console.log('pcNotes: '+pcNotes);
        $('.pcmsg').html('Your turn.');
        clearInterval(timer);
        time = 0;
        canPlay = true;
      }
    }, tempo);
  });


});
