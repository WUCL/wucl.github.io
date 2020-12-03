const _DEFAULT = { // default
    sounds: {
        countdown: 'beep',
        switch: 'switch',
        timeup: 'timeup',
    }
};
function playSounds(sound) {
    // console.log(sound);
    var $path = 'public/sounds/';
    var $sound = _DEFAULT.sounds[sound];
    $path += $sound + '.mp3';
    (new buzz.sound($path)).play();
    // console.log($path);
}