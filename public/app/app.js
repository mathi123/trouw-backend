window.addEventListener('load', init, false);

function loadSound(audioContext, url, callback, onError) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function () {
        console.log('audio loaded');
        audioContext.decodeAudioData(request.response, function (buffer) {
            var decodedBuffer = buffer;
            callback(decodedBuffer);
        }, onError);
    }
    request.send();
}

function playSound(context, buffer) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
}

function logError(err){
    console.error('failed!');
}

function playMetronome(context){
    loadSound(context, '/public/samples/audio/metronome.wav', function(buffer) { playSound(context, buffer); } , logError);    
}

function sendToServer(id, part, blob){
    var url = `/api/file/${id}/part/${part}`;
    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.setRequestHeader('Content-type','application/octet-stream');
    oReq.onload = function (oEvent) {
        console.log(`POST on ${url} was a success!`);
    };
    oReq.send(blob);
}
function createFile(id, partsCount){
    var url = `/api/file`;
    var oReq = new XMLHttpRequest();
    oReq.open("POST", url, true);
    oReq.setRequestHeader('Content-type','application/json');
    oReq.onload = function (oEvent) {
        console.log(`POST on ${url} was a success!`);
    };
    oReq.send(JSON.stringify({
        id: id,
        parts: partsCount,
        format: 'audio/webm',
    }));
}

function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
  }

var recorder;
var audioContext;
function init() {
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        playMetronome(audioContext);

        if (hasGetUserMedia()) {
            console.info('user media available');
            navigator.getUserMedia({video: false, audio: true}, function(stream) {
                //var audio = document.querySelector('audio');
                //audio.src = window.URL.createObjectURL(stream);

                const chunks = [];
                const id = uuid();
                let part = 1;
                // create media recorder instance to initialize recording
                recorder = new MediaRecorder(stream);
                // function to be called when data is received
                recorder.ondataavailable = e => {
                   // playMetronome(new AudioContext());
                  // add stream data to chunks
                  playMetronome(audioContext);
                  console.log('new chunk arrived');
                  chunks.push(e.data);

                  sendToServer(id, part++, e.data);
                  
                  // if recorder is 'inactive' then recording has finished
                  if (recorder.state == 'inactive') {
                      console.log('done recording');
                      // convert stream data chunks to a 'webm' audio format as a blob
                      const blob = new Blob(chunks, { type: 'audio/webm' });
                      // convert blob to URL so it can be assigned to a audio src attribute
                      // createAudioElement(URL.createObjectURL(blob));
                      //const source = document.querySelector('#audioSource');
                      const blobUrl = URL.createObjectURL(blob);
                      const audioEl = document.createElement('audio');
                      audioEl.controls = true;
                      const sourceEl = document.createElement('source');
                      sourceEl.src = '/public/files/'+id+'.webm';
                      sourceEl.type = 'audio/webm';
                      audioEl.appendChild(sourceEl);
                      document.body.appendChild(audioEl);
                      createFile(id, part);
                  }
                };
              }, logError);
        } else {
            console.error('getUserMedia() is not supported in your browser');
        }
    }
    catch (e) {
        alert('Web Audio API is not supported in this browser');
    }
}
function start(){
    console.info('start');
    recorder.start(1500);
}
function stop(){
    console.info('stop');
    recorder.stop();
}
function uuid () {
    var uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
        switch (ii) {
        case 8:
        case 20:
        uuid += '-';
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
        case 12:
        uuid += '-';
        uuid += '4';
        break;
        case 16:
        uuid += '-';
        uuid += (Math.random() * 4 | 8).toString(16);
        break;
        default:
        uuid += (Math.random() * 16 | 0).toString(16);
        }
    }
    return uuid;
};