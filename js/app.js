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
// game.playTime = 0;
// arrays to check for matching notes
game.playerNotes = [];
game.pcNotes = [];
// enables key feedback on playing
game.isCheckingNotes = false;
game.canRetry = false;
// turn notation on/off
game.useNotation = true;
game.moveMode = true;
// stores value of note at play point
game.currentNote = null;
game.playMove = false;
// stops go button being triggered more than once
game.isMoving = false;
// length of each string of notes in move mode
game.levelLength = 10;
// note number in phrase - used in all modes
game.noteNumber = 0;
// for the move mode setInterval
game.moveTimer;
// score starts at 0
game.score = 0;

// condensed random generator into one function
game.genRand = function(type, length) {
  let availNotes;
  if (type === 'seq') {
    availNotes = [];
    availNotes.push(...game.seq[game.currentLevel].notes);
    const output = [];
    for (var i = 0; i < length; i++) {
      const randIndex = Math.floor(Math.random() * availNotes.length);
      const num = availNotes.splice(randIndex,1)[0];
      output.push(num);
    }
    return output;
  } else if (type === 'chord') {
    const randNote = Math.floor(Math.random() * length+1);
    return game.chord[game.currentLevel].notes[randNote];
  } else if (type === 'move') {
    availNotes = game.seq[game.currentLevel].notes;
    const randIndex = Math.floor(Math.random() * availNotes.length);
    return game.seq[game.currentLevel].notes[randIndex];
  }
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

  game.$audio = $('audio');
  game.$play = $('.play');
  game.$go = $('.go');
  game.$retry = $('.retry');
  game.$keys = $('.keys');
  game.$winmsg = $('.winmsg');
  game.$score = $('.score');
  game.$level = $('.current-level');
  game.$levelSelect = $('.level-select');
  game.$tempoSelect = $('.tempo-select');
  game.$modeSelect = $('.mode-select');
  game.$difficulty = $('.difficulty');
  game.$notation = $('.notation');
  game.notes = document.querySelector('.notes');
  // initialise controls
  game.$level.html('Level 1');
  game.$score.html('Score: '+game.score);
  game.$retry.addClass('disabled');
  if (game.moveMode) {
    game.$retry.addClass('disabled');
    game.$play.addClass('disabled');
  }

  game.createNotes = function(element, type, move, noteID) {
    if (move) {
      element.classList.add('move');
    }
    switch (type) {
      case 'note':
        element.classList.add('note');
        element.id = 'note'+noteID;
        element.classList.add(game.manuscript[noteID]);
        game.notes.appendChild(element);
        break;
      case 'flat':
        element.classList.add('flat');
        element.classList.add(game.manuscript[noteID]+'-flat');
        game.notes.appendChild(element);
        break;
      case 'ledger':
        element.classList.add('ledger');
        game.notes.appendChild(element);
        break;
      default:
    }
  };

  game.moveThis = function() {
    // animation
    $('.manuscript').find('.move').animate({ 'left': '-=460px' }, {
      duration: 4000, easing: 'linear', complete: function() {
        $(this).remove();
      }, step: function( now ) {
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

  // level selector
  game.$levelSelect.on('change', function() {
    game.currentLevel = parseInt(this.value.slice(5));
    game.$level.html('Level '+this.value.slice(5));
  });
  // tempo selector
  game.$tempoSelect.on('change', function(e) {
    game.currentTempo = e.target.value;
  });
  // mode selector
  game.$modeSelect.on('change', function(e) {
    game.currentMode = e.target.value;
  });
  // difficulty selector
  game.$difficulty.on('change', function(e) {
    game.currentDifficulty = parseInt(e.target.value);
  });
  // notation on/off (doesn't affect score)
  game.$notation.on('change', function(e) {
    if (e.target.value === 'on') {
      game.useNotation = true;
    } else if (e.target.value === 'off') {
      game.useNotation = false;
    }
  });

  game.$go.on('click', function() {
    // disable button if already running
    if (game.isMoving) {
      return;
    }
    game.noteNumber = 0;
    game.isMoving = true;
    game.moveTimer = setInterval( () => {
      game.noteNumber++;
      const randNoteID = game.genRand('move');
      game.addNotes(true, randNoteID);
      if (game.noteNumber >= game.levelLength) {
        clearInterval(game.moveTimer);
        game.isMoving = false;
      }
    }, game.tempi[game.currentTempo]['tempo']);
  });

  game.playAudio = function(note) {
    game.$audio[note].currentTime = 0;
    game.$audio[note].play();
  };

  // check if correct
  function checkMatch() {
    for (let i = 0; i < game.pcNotes.length; i++) {
      if (game.pcNotes[i] !== game.playerNotes[i]) {
        game.playerNotes = [];
        game.canRetry = true;
        game.isCheckingNotes = false;
        game.$winmsg.html('Try again...');
        setTimeout( () => {
          game.$winmsg.html('');
        }, 1500);
        return false;
      }
    }
    game.resetOnWin();
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
    game.resetOnWin();
    return true;
  }

  game.addScore = function() {
    // levelScore++;
    game.score = game.score + (game[game.currentMode][game.currentLevel].score * game.currentDifficulty * game.tempi[game.currentTempo].score);
    game.$score.html('Score: '+game.score);
  };

  game.minusScore = function() {
    // make sure score doesn't go into negatives
    const minus = game.score - (game[game.currentMode][game.currentLevel].score * game.currentDifficulty * game.tempi[game.currentTempo].score);
    if (minus >= 0) {
      game.score = minus;
    }
    game.$score.html('Score: '+game.score);
  };

  game.resetOnWin = function() {
    game.playerNotes = [];
    game.isCheckingNotes = false;
    game.canRetry = false;
    game.addScore();
    game.$retry.addClass('disabled');
    game.$winmsg.html('Correct!');
    $('.pcmsg').html('');
  };

  game.keyDepress = function(note) {
    const $thisKey = $('#key'+note);
    $thisKey.addClass('depress');
    game.timeoutRemove($thisKey, 'depress');
  };

  // note flashes red if it's wrong, white if it's correct
  game.feedback = function(note, pos) {
    const $thisKey = $('#key'+note);
    console.log(note);
    if (note==game.pcNotes[pos]) {
      $thisKey.addClass('correct');
      game.timeoutRemove($thisKey, 'correct');
    } else {
      $thisKey.addClass('wrong');
      game.timeoutRemove($thisKey, 'wrong');
    }
  };

  game.addNotes = function(move, noteID) {
    const newNote = document.createElement('li');
    if (noteID === 1 || noteID === 3 || noteID === 6 || noteID === 8 || noteID === 10 ) {
      const flat = document.createElement('li');
      game.createNotes(newNote, 'note', false, noteID);
      game.createNotes(flat, 'flat', false, noteID);
      if (move) {
        game.createNotes(newNote, 'note', true, noteID);
        game.createNotes(flat, 'flat', true, noteID);
        game.moveThis();
      }
      return;
    } else if ( noteID === 0 ) {
      const ledger = document.createElement('li');
      game.createNotes(newNote, 'note', false, noteID);
      game.createNotes(ledger, 'ledger', false, noteID);
      if (move) {
        game.createNotes(newNote, 'note', true, noteID);
        game.createNotes(ledger, 'ledger', true, noteID);
        game.moveThis();
      }
      return;
    }
    game.createNotes(newNote, 'note', false, noteID);
    if (move) {
      game.createNotes(newNote, 'note', true, noteID);
      game.moveThis();
    }
  };

  game.timeoutRemove = function(element, classtoRemove) {
    setTimeout( () => {
      element.removeClass(classtoRemove);
    }, 250);
  };

  game.moveCheckNotes = function(note) {
    // ignore the stupid linter here bc note is a string not a number
    if (note == game.currentNote) {
      game.moveFeedback('correct');
    } else {
      game.moveFeedback('wrong');
    }
  };

  game.moveFeedback = function(status) {
    const $currentNote = $('.current');
    const $top = $('.playpos-top');
    const $bottom = $('.playpos-bottom');
    switch (status) {
      case 'correct':
        game.addScore();
        $currentNote.addClass('note-correct');
        game.timeoutRemove($currentNote, 'note-correct');
        $top.addClass('active');
        game.timeoutRemove($top, 'active');
        $bottom.addClass('active');
        game.timeoutRemove($bottom, 'active');
        break;
      case 'wrong':
        game.minusScore();
        $currentNote.addClass('note-wrong');
        game.timeoutRemove($currentNote, 'note-wrong');
        $top.addClass('active pos-wrong');
        game.timeoutRemove($top, 'active pos-wrong');
        $bottom.addClass('active pos-wrong');
        game.timeoutRemove($bottom, 'active pos-wrong');
        break;
      default:
    }
  };

  game.pcPlayback = function() {
    const timer = setInterval( () => {
      const noteID = game.pcNotes[game.noteNumber];
      if (game.currentDifficulty === 1) {
        game.keyDepress(noteID);
      }
      game.playAudio(noteID);
      if (game.useNotation) {
        game.addNotes(false, noteID);
      }
      game.noteNumber++;
      if (game.noteNumber === game.pcNotes.length) {
        clearInterval(timer);
        game.noteNumber = 0;
        game.isCheckingNotes = true;
        game.canRetry = true;
        game.$retry.removeClass('disabled');
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
    game.isCheckingNotes = true;
    game.canRetry = true;
    game.$retry.removeClass('disabled');
    $('.pcmsg').html('Your turn');
  };

  game.playerPlayback = function(note) {
    // play the note
    game.playAudio(note);
    // depress the key
    game.keyDepress(note);
    // if move mode and can play
    if (game.moveMode && game.playMove) {
      game.moveCheckNotes(note);
      // for checking when in repeat seq mode
    } else if (game.isCheckingNotes) {
      game.feedback(note, game.noteNumber);
      game.playerNotes.push(note);
      console.log(game.playerNotes);
      game.noteNumber++;
      // check when done
      if (game.noteNumber===game.pcNotes.length) {
        // reset the noteNumber
        game.noteNumber = 0;
        // check for a match
        if (game.currentMode === 'chord') {
          checkMatchChord();
        } else if (game.currentMode === 'seq') {
          checkMatch();
        }
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
  game.$keys.on('mousedown', function(e) {
    const thisKey = e.target.id;
    const keyId = thisKey.slice(3);
    game.playerPlayback(keyId);
  });

  // PC phrase playback
  game.$play.on('click', function() {
    game.resetNotesOnPage();
    game.playerNotes = [];
    game.pcNotes = [];
    $('.pcmsg').html('Playing...');
    if (game.currentMode === 'chord') {
      const length = Object.keys(game.chord[game.currentLevel].notes).length;
      game.pcNotes = game.genRand('chord', length);
      game.pcChordPlayback();
      return;
    }
    const length = game.seq[game.currentLevel].phraseLength;
    game.pcNotes = game.genRand('seq', length);
    game.pcPlayback();
  });

  game.resetNotesOnPage = function() {
    game.noteNumber = 0;
    game.notes.innerHTML = '';
  };

  // PC retry/repeat button
  game.$retry.on('click', function(e) {
    game.resetNotesOnPage();
    if (!game.canRetry) {
      e.preventDefault();
      return;
    }
    game.minusScore();
    $('.pcmsg').html('Playing...');
    if (game.currentMode === 'chord') {
      game.pcChordPlayback();
      return;
    }
    game.pcPlayback();
  });

});
