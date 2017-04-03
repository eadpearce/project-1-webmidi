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
const manuscript = {
  0: 'c',
  1: 'd',
  2: 'd',
  3: 'e',
  4: 'e',
  5: 'f',
  6: 'g',
  7: 'g',
  8: 'a',
  9: 'a',
  10: 'b',
  11: 'b'
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
let canRetry = false;
let useNotation = true;
let score = 0;
let currentTempo = 'slow';
const tempi = {
  slow: { tempo: 1000, score: 1 },
  med: { tempo: 500, score: 1 },
  fast: { tempo: 250, score: 1 },
  vfast: { tempo: 125, score: 1 }
};

// generate a random phrase
function genRand(length) {
  // copy currentLevel.notes to availNotes
  const availNotes = [];
  availNotes.push(...currentLevel.notes);
  const output = [];
  for (var i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * availNotes.length);
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
  const $retry = $('.retry');
  const $keys = $('.keys');
  const $winmsg = $('.winmsg');
  const $score = $('.score');
  const notes = document.querySelector('.notes');
  $score.html('Score: '+score);
  $retry.addClass('disabled');

  // level selector
  $('.level-select').on('change', function() {
    currentLevel = levels[parseInt(this.value.slice(5))];
  });
  // tempo selector
  $('.tempo-select').on('change', function() {
    currentTempo = this.value;
  });
  // difficulty selector
  $('.difficulty').on('change', function(e) {
    if (e.target.value === 'easy') {
      currentDifficulty = 1;
    } else if (e.target.value === 'hard') {
      currentDifficulty = 2;
    }
  });
  // notation on/off (doesn't affect score)
  $('.notation').on('change', function(e) {
    if (e.target.value === 'on') {
      useNotation = true;
    } else if (e.target.value === 'off') {
      useNotation = false;
    }
  });
  // check if correct
  function checkMatch() {
    // console.log('pcNotes: '+pcNotes);
    // console.log('playerNotes: '+playerNotes);
    for (let i = 0; i < pcNotes.length; i++) {
      if (pcNotes[i] !== playerNotes[i]) {
        playerNotes = [];
        canRetry = true;
        canPlay = false;
        $winmsg.html('Try again...');
        setTimeout( () => {
          $winmsg.html('');
        }, 1500);
        return false;
      }
    }
    // reset the array
    playerNotes = [];
    canRetry = false;
    score = score + (currentLevel.score * currentDifficulty * tempi[currentTempo]['score']);
    $retry.addClass('disabled');
    $score.html('Score: '+score);
    $winmsg.html('Correct!');
    return true;
  }

  function keyDepress(note) {
    $('#key'+note).addClass('depress');
    setTimeout( () => {
      $('#key'+note).removeClass('depress');
    }, 250);
  }
  // note flashes red if it's wrong, white if it's correct
  function feedback(note, pos) {
    if (note===pcNotes[pos]) {
      $('#key'+note).addClass('correct');
      setTimeout( () => {
        $('#key'+note).removeClass('correct');
      }, 500);
    } else {
      $('#key'+note).addClass('wrong');
      setTimeout( () => {
        $('#key'+note).removeClass('wrong');
      }, 500);
    }
  }

  function updateManuscript(playedNote) {
    if (playedNote === 1 || playedNote === 3 || playedNote === 6 || playedNote === 8 || playedNote === 10 ) {
      const accidental = document.createElement('li');
      accidental.classList.add('flat');
      accidental.classList.add(manuscript[playedNote]+'-flat');
      notes.appendChild(accidental);
    }
    const note = document.createElement('li');
    note.classList.add('note');
    note.classList.add(manuscript[playedNote]);
    notes.appendChild(note);
    if (playedNote === 0) {
      const ledger = document.createElement('li');
      ledger.classList.add('ledger');
      notes.appendChild(ledger);
    }
  }

  function pcPlayback() {
    const timer = setInterval( () => {
      const thisNote = pcNotes[time];
      if (currentDifficulty === 1) {
        keyDepress(thisNote);
      }
      $audio[thisNote].currentTime=0;
      $audio[thisNote].play();
      if (useNotation) {
        updateManuscript(thisNote);
      }
      time++;
      if (time === pcNotes.length) {
        clearInterval(timer);
        time = 0;
        canPlay = true;
        canRetry = true;
        $retry.removeClass('disabled');
        $('.pcmsg').html('Your turn');
      }
    }, tempi[currentTempo]['tempo']);
  }

  function playerPlayback(note) {
    // play the note
    $audio[note].currentTime=0;
    $audio[note].play();
    // depress the key
    keyDepress(note);
    // push the notes to the playerNotes array if canPlay
    if (canPlay) {
      feedback(parseInt(note), time);
      playerNotes.push(parseInt(note));
      time++;
      if (time===pcNotes.length) {
        time = 0;
        // check if match
        if (checkMatch()) {
          canPlay = false;
        }
      }
    }
  }

  // computer keyboard playback
  $(document).keydown( function(e) {
    if ($.inArray( e.keyCode, keyboardControl)===-1) {
      return;
    }
    const keyboardNote = keyboardControl.indexOf(e.keyCode);
    playerPlayback(keyboardNote);
  });

  // mouse playback
  $keys.on('mousedown', function(e) {
    const thisKey = e.target.id;
    const keyId = thisKey.slice(3);
    playerPlayback(keyId);
  });

  // PC phrase playback
  $play.on('click', function() {
    notes.innerHTML = '';
    $('.pcmsg').html('Playing...');
    playerNotes = [];
    pcNotes = [];
    pcNotes = genRand(currentLevel.phraseLength);
    pcPlayback();
  });

  // PC retry/repeat button
  $retry.on('click', function(e) {
    notes.innerHTML = '';
    if (!canRetry) {
      e.preventDefault();
      return;
    }
    if (score > 0) {
      score--;
    }
    $score.html('Score: '+score);
    $('.pcmsg').html('Playing...');
    pcPlayback();
  });


});
