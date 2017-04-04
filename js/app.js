// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html

// const allnotes = [0,1,2,3,4,5,6,7,8,9,10,11];
// const blacknotes = [1,3,6,8,10];
// const whitenotes = [0,2,4,5,7,9,11];

// note mapping
// C, C#, D, Eb, E, F, F#, G, G#, A, Bb,  B
// 0, 1,  2, 3,  4, 5, 6,  7, 8,  9, 10, 11

// index corresponds to note ID
const keyboardControl = [65, 87, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74];
const mode = {
  seq: {
    1: { notes: [0,2,4], phraseLength: 3, score: 1},
    2: { notes: [0,2,4,5,7], phraseLength: 4, score: 2 },
    3: { notes: [0,2,4,5,7,9,11], phraseLength: 4, score: 3 },
    4: { notes: [0,2,4,5,7,9,11], phraseLength: 5, score: 4 },
    5: { notes: [0,1,2,3,4,5,6,7], phraseLength: 5, score: 5 },
    6: { notes: [0,1,2,3,4,5,6,7,8,9,10,11], phraseLength: 5, score: 6 },
    7: { notes: [0,1,2,3,4,5,6,7,8,9,10,11], phraseLength: 7, score: 7 }
  },
  chord: {
    1: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9] }, score: 1},
    2: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11] }, score: 2},
    3: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10] }, score: 3},
    4: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9] }, score: 4},
    5: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9], 10: [1,5,8], 11: [3,8,11] }, score: 5},
    6: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9], 10: [1,5,8], 11: [8,11,3], 12: [3,6,11], 13: [2,6,11] }, score: 6},
    7: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9], 10: [1,5,8], 11: [8,11,3], 12: [11,3,6], 13: [2,6,11], 14: [0,3,6,8], 15: [2,5,8] }, score: 7}
  }
};
const manuscript = { 0: 'c', 1: 'd', 2: 'd', 3: 'e', 4: 'e', 5: 'f', 6: 'g', 7: 'g', 8: 'a', 9: 'a', 10: 'b', 11: 'b' };
// start at level1 by default
let currentLevel = 1;
let currentMode = 'seq';
let currentTempo = 'slow';
// score weighting for difficulty - 1 is easy 2 is hard
let currentDifficulty = 1;
// time to keep track of notes played
let time = 0;
let playerNotes = [];
let pcNotes = [];
let canPlay = false;
let canRetry = false;
let useNotation = true;
let moveMode = true;
let currentNote = null;
let playMove = false;
// let levelScore = 0;
let score = 0;
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
  availNotes.push(...mode[currentMode][currentLevel].notes);
  const output = [];
  for (var i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * availNotes.length);
    const num = availNotes.splice(randIndex, 1)[0];
    output.push(num);
  }
  return output;
}

function genRandChord(size) {
  // copy currentLevel.notes to availNotes
  const randKey = Math.floor(Math.random() * size+1);
  console.log(mode.chord[currentLevel].notes[randKey]);
  return mode.chord[currentLevel].notes[randKey];
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
  const $go = $('.go');
  const $retry = $('.retry');
  const $keys = $('.keys');
  const $winmsg = $('.winmsg');
  const $score = $('.score');
  const $level = $('.current-level');
  const notes = document.querySelector('.notes');
  $level.html('Level 1');
  $score.html('Score: '+score);
  $retry.addClass('disabled');
  if (moveMode) {
    $retry.addClass('disabled');
    $play.addClass('disabled');
  }

  $go.on('click', moveNote);

  // level selector
  $('.level-select').on('change', function() {
    currentLevel =parseInt(this.value.slice(5));
    $level.html('Level '+this.value.slice(5));
  });
  // tempo selector
  $('.tempo-select').on('change', function(e) {
    currentTempo = e.target.value;
  });
  // mode selector
  $('.mode-select').on('change', function(e) {
    currentMode = e.target.value;
  });
  // difficulty selector
  $('.difficulty').on('change', function(e) {
    currentDifficulty = parseInt(e.target.value);
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
    ifWin();
    return true;
  }

  function checkMatchChord() {
    let correct = 0;
    for (let i = 0; i < playerNotes.length; i++) {
      if ($.inArray( playerNotes[i], pcNotes)===-1) {
        return false;
      } else {
        const playerSorted = playerNotes.sort();
        if (pcNotes[i] === playerSorted[i]) {
          correct++;
        }
      }
    }
    if (correct === pcNotes.length) {
      console.log('correct');
    }
    ifWin();
    return true;
  }

  function ifWin() {
    playerNotes = [];
    canRetry = false;
    // levelScore++;
    score = score + (mode[currentMode][currentLevel].score * currentDifficulty * tempi[currentTempo].score);
    $retry.addClass('disabled');
    $score.html('Score: '+score);
    $winmsg.html('Correct!');
    $('.pcmsg').html('');
    // // progress to next level at 5 wins
    // if (levelScore%5 === 0) {
    //   currentLevel++;
    //   $level.html('Level '+currentLevel);
    // }
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

  function moveThis() {
    // animation
    $('.manuscript').find('.move').animate({
      'left': '-=460px'
    }, {
      duration: 4000,
      easing: 'linear',
      complete: function() {
        $(this).remove();
      },
      step: function( now ) {
        if (now > -460 && now < -400) {
          playMove = true;
          if (this.id === '') {
            return;
          }
          currentNote = this.id.slice(4);
        }
      }
    });
  }

  function moveNote() {
    const newNote = document.createElement('li');
    newNote.classList.add('move');
    newNote.classList.add('note');
    const randNote = Math.floor(Math.random() * 11);
    newNote.id = 'note'+randNote;
    newNote.classList.add(manuscript[randNote]);
    // add accidentals
    if (randNote === 1 || randNote === 3 || randNote === 6 || randNote === 8 || randNote === 10 ) {
      const accidental = document.createElement('li');
      accidental.classList.add('move');
      accidental.classList.add('flat');
      accidental.classList.add(manuscript[randNote]+'-flat');
      notes.appendChild(accidental);
      notes.appendChild(newNote);
      moveThis();
      return;
    } else if ( randNote === 0 ) {
      const ledger = document.createElement('li');
      ledger.classList.add('move');
      ledger.classList.add('ledger');
      notes.appendChild(ledger);
      notes.appendChild(newNote);
      moveThis();
      return;

    }
    notes.appendChild(newNote);
    moveThis();
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

  function pcChordPlayback() {
    for (let i = 0; i < pcNotes.length; i++) {
      const thisNote = pcNotes[i];
      if (currentDifficulty === 1) {
        keyDepress(thisNote);
      }
      $audio[thisNote].currentTime = 0;
      $audio[thisNote].play();
    }
    canPlay = true;
    canRetry = true;
    $retry.removeClass('disabled');
    $('.pcmsg').html('Your turn');

  }

  function playerPlayback(note) {
    // play the note
    $audio[note].currentTime=0;
    $audio[note].play();
    // depress the key
    if (!moveMode) {
      keyDepress(note);
    } else if (moveMode && playMove && note === currentNote) {
      score = score + (mode[currentMode][currentLevel].score * currentDifficulty * tempi[currentTempo].score);
    } else if (canPlay) {
      feedback(parseInt(note), time);
      playerNotes.push(parseInt(note));
      time++;
      if (time===pcNotes.length) {
        time = 0;
        // check if match
        if (currentMode === 'chord' && checkMatchChord()) {
          canPlay = false;
        }
      } else if (currentMode === 'seq' && checkMatch()) {
        canPlay = false;
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
    time = 0;
    playerNotes = [];
    pcNotes = [];
    notes.innerHTML = '';
    $('.pcmsg').html('Playing...');
    if (currentMode === 'chord') {
      const randChord = Object.keys(mode.chord[currentLevel].notes).length;
      pcNotes = genRandChord(randChord);
      pcChordPlayback();
      return;
    }
    pcNotes = genRand(mode[currentMode][currentLevel].phraseLength);
    pcPlayback();
  });

  // PC retry/repeat button
  $retry.on('click', function(e) {
    time = 0;
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

    if (currentMode === 'chord') {
      pcChordPlayback();
      return;
    }
    pcPlayback();
  });


});
