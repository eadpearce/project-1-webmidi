// piano samples edited from those provided here http://theremin.music.uiowa.edu/MISpiano.html

$( () => {

  const $keys = $('.keys');
  const allKeys = [0,1,2,3,4,5,6,7,8,9,10,11];
  const sounds = ['00-c','01-db','02-d', '03-eb', '04-e', '05-f', '06-gb', '07-g', '08-ab', '09-a', '10-bb', '11-b'];
  const blackKeys = [1,3,6,8,10];
  const whiteKeys = [0,2,4,5,7,9,11];
  const audio = document.getElementById('test');

  $keys.on('mousedown', function(e) {
    console.log(e.target.id);
    audio.src = 'sounds/' + e.target.id +'.ogg';
    audio.play();
    // this.src = 'sounds/' + $audio[this.id].id + '.ogg';
    // $audio[this.id].play();
  });

  // const $audio = $('audio');

  //
  // for (let i=0; i<16; i++) {
  //   button[i].addEventListener('mousedown', () => {
  //     // audio.src = 'sounds/' + sounds[i] + '.wav';
  //     audio.src = 'sounds/' + audio[i].id + '.wav';
  //     audio[i].play();
  //     console.log(sounds[i]);
  //   });
  // }


  console.log('it works');

});
