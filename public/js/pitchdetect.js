var PitchDetect = function() {
  var audioContext = new webkitAudioContext();
  var isPlaying = false;
  var sourceNode = null;
  var analyser = null;
  var theBuffer = null;
  var pitch = -1;
  var note = -1;
  var num_cycles = -1;
  var confidenceThreshold = 70;

  var confidence = -1;

  var detectorElem,
    canvasElem,
    pitchElem,
    noteElem,
    detuneElem,
    detuneAmount;

  function init() {
    window.onload = function() {

      detectorElem = document.getElementById("detector");
      canvasElem = document.getElementById("output");
      pitchElem = document.getElementById("pitch");
      noteElem = document.getElementById("note");
      detuneElem = document.getElementById("detune");
      detuneAmount = document.getElementById("detune_amt");

      getUserMedia({
        audio: true
      }, gotStream);

      detectorElem.ondragenter = function() {
        this.classList.add("droptarget");
        return false;
      };
      detectorElem.ondragleave = function() {
        this.classList.remove("droptarget");
        return false;
      };
      detectorElem.ondrop = function(e) {
        this.classList.remove("droptarget");
        e.preventDefault();
        theBuffer = null;

        var reader = new FileReader();
        reader.onload = function(event) {
          audioContext.decodeAudioData(event.target.result, function(buffer) {
            theBuffer = buffer;
          }, function() {
            alert("error loading!");
          });

        };
        reader.onerror = function(event) {
          alert("Error: " + reader.error);
        };
        reader.readAsArrayBuffer(e.dataTransfer.files[0]);
        return false;
      };



    }

    function convertToMono(input) {
      var splitter = audioContext.createChannelSplitter(2);
      var merger = audioContext.createChannelMerger(2);

      input.connect(splitter);
      splitter.connect(merger, 0, 0);
      splitter.connect(merger, 0, 1);
      return merger;
    }

    function error() {
      alert('Stream generation failed.');
    }

    function getUserMedia(dictionary, callback) {
      try {
        navigator.webkitGetUserMedia(dictionary, callback, error);
      } catch (e) {
        alert('webkitGetUserMedia threw exception :' + e);
      }
    }

    function gotStream(stream) {
      // Create an AudioNode from the stream.
      var mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // Connect it to the destination.
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      convertToMono(mediaStreamSource).connect(analyser);
      updatePitch();
    }


    

    var rafID = null;
    var tracks = null;
    var buflen = 1024;
    var buf = new Uint8Array(buflen);
    var MINVAL = 134; // 128 == zero.  MINVAL is the "minimum detected signal" level.

    function findNextPositiveZeroCrossing(start) {
      var i = Math.ceil(start);
      var last_zero = -1;
      // advance until we're zero or negative
      while (i < buflen && (buf[i] > 128))
        i++;
      if (i >= buflen)
        return -1;

      // advance until we're above MINVAL, keeping track of last zero.
      while (i < buflen && ((t = buf[i]) < MINVAL)) {
        if (t >= 128) {
          if (last_zero == -1)
            last_zero = i;
        } else
          last_zero = -1;
        i++;
      }

      // we may have jumped over MINVAL in one sample.
      if (last_zero == -1)
        last_zero = i;

      if (i == buflen) // We didn't find any more positive zero crossings
        return -1;

      // The first sample might be a zero.  If so, return it.
      if (last_zero == 0)
        return 0;

      // Otherwise, the zero might be between two values, so we need to scale it.

      var t = (128 - buf[last_zero - 1]) / (buf[last_zero] - buf[last_zero - 1]);
      return last_zero + t;
    }


    function noteFromPitch(frequency) {
      noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
      return Math.round(noteNum) + 69;
    }

    function frequencyFromNoteNumber(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
    }

    function centsOffFromPitch(frequency, note) {
      return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
    }

    function updatePitch(time) {
      var cycles = new Array;
      analyser.getByteTimeDomainData(buf);

      var i = 0;
      // find the first point
      var last_zero = findNextPositiveZeroCrossing(0);

      var n = 0;
      // keep finding points, adding cycle lengths to array
      while (last_zero != -1) {
        var next_zero = findNextPositiveZeroCrossing(last_zero + 1);
        if (next_zero > -1)
          cycles.push(next_zero - last_zero);
        last_zero = next_zero;

        n++;
        if (n > 1000)
          break;
      }

      // 1?: average the array
      num_cycles = cycles.length;
      var sum = 0;
      pitch = 0;

      for (var i = 0; i < num_cycles; i++) {
        sum += cycles[i];
      }

      if (num_cycles) {
        sum /= num_cycles;
        pitch = audioContext.sampleRate / sum;

      }

      // confidence = num_cycles / num_possible_cycles = num_cycles / (audioContext.sampleRate/)
      //from 1 to 100
      confidence = (num_cycles ? ((num_cycles / (pitch * buflen / audioContext.sampleRate)) * 100) : 0);


      // console.log(
      //   "Cycles: " + num_cycles +
      //   " - average length: " + sum +
      //   " - pitch: " + pitch + "Hz " +
      //   " - note: " + noteFromPitch(pitch) +
      //   " - confidence: " + confidence + "% ");

      // possible other approach to confidence: sort the array, take the median; go through the array and compute the average deviation

      detectorElem.className = (confidence > confidenceThreshold) ? "confident" : "vague";
      // TODO: Paint confidence meter on canvasElem here.

      if (num_cycles == 0) {
        pitchElem.innerText = "--";
        //noteElem.innerText = "-";
        detuneElem.className = "";
        detuneAmount.innerText = "--";
        noteElem.innerText = note;
      } else {
        pitchElem.innerText = Math.floor(pitch);
        note = noteFromPitch(pitch);
        if(confidence > confidenceThreshold){
           noteElem.innerText = note;
        }
       
        var detune = centsOffFromPitch(pitch, note);
        if (detune == 0) {
          detuneElem.className = "";
          detuneAmount.innerText = "--";
        } else {
          if (detune < 0)
            detuneElem.className = "flat";
          else
            detuneElem.className = "sharp";
          detuneAmount.innerText = Math.abs(detune);
        }
      }

      rafID = window.webkitRequestAnimationFrame(updatePitch);
    }

  }

  function getPitch(){
      return pitch;
  }

  function getNote(){
    //only return the note if we have confidence greater than specified threshold
    if(num_cycles === 0){
      return -2;
    }
    return confidence > confidenceThreshold ? note: -1
  }

 

  this.init = init;
  this.getPitch = getPitch;
  this.getNote = getNote;
  return this;
}