// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html

// all notes = [0,1,2,3,4,5,6,7,8,9,10,11];
// black notes = [1,3,6,8,10];
// white notes = [0,2,4,5,7,9,11];

// note mapping
// C, C#, D, Eb, E, F, F#, G, G#, A, Bb,  B
// 0, 1,  2, 3,  4, 5, 6,  7, 8,  9, 10, 11

var game = game || {};

// index corresponds to note ID
game.keyboardControl = [65, 87, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74];
game.seq = {
  1: { notes: [0,2,4], phraseLength: 3, score: 1},
  2: { notes: [0,2,4,5,7], phraseLength: 4, score: 2 },
  3: { notes: [0,2,4,5,7,9,11], phraseLength: 4, score: 3 },
  4: { notes: [0,2,4,5,7,9,11], phraseLength: 5, score: 4 },
  5: { notes: [0,1,2,3,4,5,6,7], phraseLength: 5, score: 5 },
  6: { notes: [0,1,2,3,4,5,6,7,8,9,10,11], phraseLength: 5, score: 6 },
  7: { notes: [0,1,2,3,4,5,6,7,8,9,10,11], phraseLength: 7, score: 7 }
};
game.chord = {
  1: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9] }, score: 1},
  2: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11] }, score: 2},
  3: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10] }, score: 3},
  4: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9] }, score: 4},
  5: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9], 10: [1,5,8], 11: [3,8,11] }, score: 5},
  6: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9], 10: [1,5,8], 11: [8,11,3], 12: [3,6,11], 13: [2,6,11] }, score: 6},
  7: { notes: { 1: [0,4,7], 2: [2,6,9], 3: [0,5,9], 4: [4,7,11], 5: [2,7,11], 6: [1,5,8], 7: [3,6,10], 8: [0,3,7], 9: [2,5,9], 10: [1,5,8], 11: [8,11,3], 12: [11,3,6], 13: [2,6,11], 14: [0,3,6,8], 15: [2,5,8] }, score: 7}
};
game.manuscript = { 0: 'c', 1: 'd', 2: 'd', 3: 'e', 4: 'e', 5: 'f', 6: 'g', 7: 'g', 8: 'a', 9: 'a', 10: 'b', 11: 'b' };
// 60bpm = 1bps = 1000/1 = 1000ms interval
// 120bpm = 2bps = 1000/2 = 500ms interval
// 140bpm = 2.33bps = 1000/2.33 = ~428.57ms interval
// 180bpm = 3bps = 1000/3 = 333.33ms interval
// 90bpm = 1.5bps = 1000/1.5 = 666.66ms interval
game.tempi = {
  vslow: { tempo: 1000, score: 1 }, // 60bpm
  slow: { tempo: 666.66, score: 2 }, // 60bpm
  med: { tempo: 500, score: 3 }, // 90bpm
  fast: { tempo: 428.57, score: 4 }, // 120bpm
  vfast: { tempo: 333.33, score: 5 } // 140bpm
};
// start at level1 by default
game.currentLevel = 1;
game.currentMode = 'seq';
game.currentTempo = 'slow';
// score weighting for difficulty - 1 is easy 2 is hard
game.currentDifficulty = 1;
// time to keep track of notes played
game.time = 0;
game.playerNotes = [];
game.pcNotes = [];
game.canPlay = false;
game.canRetry = false;
game.useNotation = true;
game.moveMode = true;
game.currentNote = null;
game.playMove = false;
game.canMove = true;
game.levelLength = 10;
game.noteNumber = 0;
game.moveTimer;
// let levelScore = 0;
game.score = 0;

// generate a random phrase
game.genRandMove = function() {
  // copy currentLevel.notes to availNotes
  const availNotes = game[game.currentMode][game.currentLevel].notes;
  const randIndex = Math.floor(Math.random() * availNotes.length);
  return game[game.currentMode][game.currentLevel].notes[randIndex];
};

// generate a random phrase
game.genRand = function(length) {
  // copy currentLevel.notes to availNotes
  const availNotes = [];
  availNotes.push(...game[game.currentMode][game.currentLevel].notes);
  const output = [];
  for (var i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * availNotes.length);
    const num = availNotes.splice(randIndex, 1)[0];
    output.push(num);
  }
  return output;
};

game.genRandChord = function(size) {
  const randKey = Math.floor(Math.random() * size+1);
  console.log(game[game.currentMode][game.currentLevel].notes[randKey]);
  return game[game.currentMode][game.currentLevel].notes[randKey];
};

$( () => {
  // set up audio tags and src FIRST
  game.container = document.querySelector('.container');
  for (let i = 0; i < 12; i++) {
    const audios = document.createElement('audio');
    audios.id = 'audio'+i;
    audios.src = 'sounds/audio'+i+'.ogg';
    game.container.appendChild(audios);
  }

  const $audio = $('audio');
  const $play = $('.play');
  game.$go = $('.go');
  const $retry = $('.retry');
  const $keys = $('.keys');
  const $winmsg = $('.winmsg');
  const $score = $('.score');
  const $level = $('.current-level');
  const notes = document.querySelector('.notes');
  $level.html('Level 1');
  $score.html('Score: '+game.score);
  $retry.addClass('disabled');
  if (game.moveMode) {
    $retry.addClass('disabled');
    $play.addClass('disabled');
  }

  game.$go.on('click', moveNote);

  // level selector
  $('.level-select').on('change', function() {
    game.currentLevel = parseInt(this.value.slice(5));
    $level.html('Level '+this.value.slice(5));
  });
  // tempo selector
  $('.tempo-select').on('change', function(e) {
    game.currentTempo = e.target.value;
  });
  // mode selector
  $('.mode-select').on('change', function(e) {
    game.currentMode = e.target.value;
  });
  // difficulty selector
  $('.difficulty').on('change', function(e) {
    game.currentDifficulty = parseInt(e.target.value);
  });
  // notation on/off (doesn't affect score)
  $('.notation').on('change', function(e) {
    if (e.target.value === 'on') {
      game.useNotation = true;
    } else if (e.target.value === 'off') {
      game.useNotation = false;
    }
  });

  game.playAudio = function(note) {
    $audio[note].currentTime = 0;
    $audio[note].play();
  };

  // check if correct
  function checkMatch() {
    for (let i = 0; i < game.pcNotes.length; i++) {
      if (game.pcNotes[i] !== game.playerNotes[i]) {
        game.playerNotes = [];
        game.canRetry = true;
        game.canPlay = false;
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
    for (let i = 0; i < game.playerNotes.length; i++) {
      if ($.inArray( game.playerNotes[i], game.pcNotes)===-1) {
        return false;
      } else {
        const playerSorted = game.playerNotes.sort();
        if (game.pcNotes[i] === playerSorted[i]) {
          correct++;
        }
      }
    }
    if (correct === game.pcNotes.length) {
      console.log('correct');
    }
    ifWin();
    return true;
  }

  function ifWin() {
    game.playerNotes = [];
    game.canRetry = false;
    // levelScore++;
    game.score = game.score + (game[game.currentMode][game.currentLevel].score * game.currentDifficulty * game.tempi[game.currentTempo].score);
    $retry.addClass('disabled');
    $score.html('Score: '+game.score);
    $winmsg.html('Correct!');
    $('.pcmsg').html('');
  }

  game.keyDepress = function(note) {
    $('#key'+note).addClass('depress');
    setTimeout( () => {
      $('#key'+note).removeClass('depress');
    }, 250);
  };

  // note flashes red if it's wrong, white if it's correct
  game.feedback = function(note, pos) {
    if (note===game.pcNotes[pos]) {
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
  };

  game.updateManuscript = function(playedNote) {
    if (playedNote === 1 || playedNote === 3 || playedNote === 6 || playedNote === 8 || playedNote === 10 ) {
      const accidental = document.createElement('li');
      accidental.classList.add('flat');
      accidental.classList.add(game.manuscript[playedNote]+'-flat');
      notes.appendChild(accidental);
    }
    const note = document.createElement('li');
    note.classList.add('note');
    note.classList.add(game.manuscript[playedNote]);
    notes.appendChild(note);
    if (playedNote === 0) {
      const ledger = document.createElement('li');
      ledger.classList.add('ledger');
      notes.appendChild(ledger);
    }
  };

  game.moveThis = function() {
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
        if (now > -440 && now < -420) {
          this.classList.add('current');
          game.playMove = true;
          if (this.id === '') {
            return;
          }
          game.currentNote = this.id.slice(4);
          if (game.currentDifficulty === 1) {
            game.keyDepress(game.currentNote);
          }
        }
      }
    });
  };

  function moveNote() {
    // disable button if already running
    if (!game.canMove) {
      return;
    }
    game.noteNumber = 0;
    game.canMove = false;
    game.moveTimer = setInterval( () => {
      game.noteNumber++;
      const newNote = document.createElement('li');
      newNote.classList.add('move');
      newNote.classList.add('note');
      const randNote = game.genRandMove();
      newNote.id = 'note'+randNote;
      newNote.classList.add(game.manuscript[randNote]);
      // add accidentals
      if (randNote === 1 || randNote === 3 || randNote === 6 || randNote === 8 || randNote === 10 ) {
        const accidental = document.createElement('li');
        accidental.classList.add('move');
        accidental.classList.add('flat');
        accidental.classList.add(game.manuscript[randNote]+'-flat');
        notes.appendChild(accidental);
        notes.appendChild(newNote);
        game.moveThis();
        return;
      } else if ( randNote === 0 ) {
        const ledger = document.createElement('li');
        ledger.classList.add('move');
        ledger.classList.add('ledger');
        notes.appendChild(ledger);
        notes.appendChild(newNote);
        game.moveThis();
        return;
      }
      notes.appendChild(newNote);
      game.moveThis();
      if (game.noteNumber >= game.levelLength) {
        clearInterval(game.moveTimer);
        game.canMove = true;
      }
    }, game.tempi[game.currentTempo]['tempo']);
  }


  game.winMove = function() {
    game.score = game.score + (game[game.currentMode][game.currentLevel].score * game.currentDifficulty * game.tempi[game.currentTempo].score);
    $score.html('Score: '+game.score);
    $('.current').addClass('note-correct');
    setTimeout( () => {
      $('.current').removeClass('note-correct');
    }, 250);
    $('.playpos-top').addClass('active');
    setTimeout( () => {
      $('.playpos-top').removeClass('active');
    }, 250);
    $('.playpos-bottom').addClass('active');
    setTimeout( () => {
      $('.playpos-bottom').removeClass('active');
    }, 250);
  };
  game.loseMove = function() {
    if (game.score !== 0) {
      game.score = game.score - (game[game.currentMode][game.currentLevel].score * game.currentDifficulty * game.tempi[game.currentTempo].score);
    }
    $score.html('Score: '+game.score);
    $('.current').addClass('note-wrong');
    setTimeout( () => {
      $('.current').removeClass('note-wrong');
    }, 250);
    $('.playpos-top').addClass('active pos-wrong');
    setTimeout( () => {
      $('.playpos-top').removeClass('active pos-wrong');
    }, 250);
    $('.playpos-bottom').addClass('active pos-wrong');
    setTimeout( () => {
      $('.playpos-bottom').removeClass('active pos-wrong');
    }, 250);
  };

  game.pcPlayback = function() {
    const timer = setInterval( () => {
      const thisNote = game.pcNotes[game.time];
      if (game.currentDifficulty === 1) {
        game.keyDepress(thisNote);
      }
      game.playAudio(thisNote);
      if (game.useNotation) {
        game.updateManuscript(thisNote);
      }
      game.time++;
      if (game.time === game.pcNotes.length) {
        clearInterval(timer);
        game.time = 0;
        game.canPlay = true;
        game.canRetry = true;
        $retry.removeClass('disabled');
        $('.pcmsg').html('Your turn');
      }
    }, game.tempi[game.currentTempo]['tempo']);
  };

  game.pcChordPlayback = function() {
    for (let i = 0; i < game.pcNotes.length; i++) {
      const thisNote = game.pcNotes[i];
      if (game.currentDifficulty === 1) {
        game.keyDepress(thisNote);
      }
      game.playAudio(thisNote);
    }
    game.canPlay = true;
    game.canRetry = true;
    $retry.removeClass('disabled');
    $('.pcmsg').html('Your turn');
  };

  game.playerPlayback = function(note) {
    // play the note
    game.playAudio(note);
    // depress the key
    game.keyDepress(note);
    if (game.moveMode && game.playMove) {
      // ignore the stupid linter here
      if (note == game.currentNote) {
        game.winMove();
      } else {
        game.loseMove();
      }
    } else if (game.canPlay) {
      game.feedback(parseInt(note), game.time);
      game.playerNotes.push(parseInt(note));
      game.time++;
      if (game.time===game.pcNotes.length) {
        game.time = 0;
        // check if match
        if (game.currentMode === 'chord' && checkMatchChord()) {
          game.canPlay = false;
        }
      } else if (game.currentMode === 'seq' && checkMatch()) {
        game.canPlay = false;
      }
    }
  };

  // computer keyboard playback
  $(document).keydown( function(e) {
    if ($.inArray( e.keyCode, game.keyboardControl)===-1) {
      return;
    }
    const keyboardNote = game.keyboardControl.indexOf(e.keyCode);
    game.playerPlayback(keyboardNote);
  });

  // mouse playback
  $keys.on('mousedown', function(e) {
    const thisKey = e.target.id;
    const keyId = thisKey.slice(3);
    game.playerPlayback(keyId);
  });

  // PC phrase playback
  $play.on('click', function() {
    game.time = 0;
    game.playerNotes = [];
    game.pcNotes = [];
    notes.innerHTML = '';
    $('.pcmsg').html('Playing...');
    if (game.currentMode === 'chord') {
      const randChord = Object.keys(game.chord[game.currentLevel].notes).length;
      game.pcNotes = game.genRandChord(randChord);
      game.pcChordPlayback();
      return;
    }
    game.pcNotes = game.genRand(game[game.currentMode][game.currentLevel].phraseLength);
    game.pcPlayback();
  });

  // PC retry/repeat button
  $retry.on('click', function(e) {
    game.time = 0;
    notes.innerHTML = '';
    if (!game.canRetry) {
      e.preventDefault();
      return;
    }
    if (game.score > 0) {
      game.score--;
    }
    $score.html('Score: '+game.score);
    $('.pcmsg').html('Playing...');

    if (game.currentMode === 'chord') {
      game.pcChordPlayback();
      return;
    }
    game.pcPlayback();
  });


});
