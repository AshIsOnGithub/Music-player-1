let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".picture");
let track_name = document.querySelector(".songname");
let track_artist = document.querySelector(".artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let wave = document.getElementById("wave");
let randomIcon = document.querySelector(".fa-random");
let curr_track = document.createElement("audio");

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;

let audioContext;
let analyser;
let canvas;
let ctx;
let audioSource;
let uploadedFiles = [];

let eqFilters = [];
let sleepTimer = null;

let music_list = [
  {
    img: "assets/images/dice-1502706_640.jpg",
    name: "name",
    artist: "Orkhan Zeynalli",
    music: "assets/music/morax-unlocked-hacker-mode-142916.mp3",
  },
  {
    img: "assets/images/Random-Pictures-of-Conceptual-and-Creative-Ideas-02.jpg",
    name: "name",
    artist: "artist",
    music: "assets/music/random-acoustic-electronic-guitar-136427.mp3",

  },
];

const backgroundImages = [
    "assets/images/dice-1502706_640.jpg",
    "assets/images/Random-Pictures-of-Conceptual-and-Creative-Ideas-02.jpg",
    "assets/images/music-1.jpg",
    "assets/images/music-2.jpg",
    "assets/images/music-3.jpg"
    // Add more image paths as needed
];

loadTrack(track_index);

function loadTrack(track_index) {
  clearInterval(updateTimer);
  reset();

  curr_track.src = music_list[track_index].music;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + music_list[track_index].img + ")";
  track_name.textContent = music_list[track_index].name;
  track_artist.textContent = music_list[track_index].artist;

  now_playing.textContent =
    "Playing music" + (track_index + 1) + " of " + music_list.length;
  updateTimer = setInterval(setUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);

  if (!audioContext) {
    initializeAudioVisualizer();
  }
  curr_track.addEventListener('loadeddata', () => {
    if (audioContext && !audioSource) {
      audioSource = audioContext.createMediaElement(curr_track);
      audioSource.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    createVisualization();
  });

  updatePlaylist();
  if (eqFilters.length > 0) initEqualizer();
}

function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}
function randomTrack() {
  isRandom ? pauseRandom() : playRandom();
}

function playRandom() {
  isRandom = true;
  randomIcon.classList.add("randomActive");
}
function pauseRandom() {
  isRandom = false;
  randomIcon.classList.remove("randomActive");
}
function repeatTrack() {
  let current_index = track_index;
  loadTrack(current_index);
  playTrack();
}
function playpauseTrack() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  isPlaying ? pauseTrack() : playTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  track_art.classList.add("rotate");
  wave.classList.add("loader");
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}
function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  track_art.classList.remove("rotate");
  wave.classList.remove("loader");
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
  if (track_index < music_list.length - 1 && isRandom === false) {
    track_index += 1;
  } else if (track_index < music_list.length - 1 && isRandom === true) {
    let random_index = Number.parseInt(Math.random() * music_list.length);
    track_index = random_index;
  } else {
    track_index = 0;
  }
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0) {
    track_index -= 1;
  } else {
    track_index = music_list.length - 1;
  }
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekTo = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekTo;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function setUpdate() {
  let seekPosition = 0;
  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(
      curr_track.currentTime - currentMinutes * 60
    );

    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(
      (curr_track.duration - durationMinutes * 60)
    );

    if (currentSeconds < 10) {
      currentSeconds = "0" + currentSeconds;
    }
    if (durationSeconds < 10) {
      durationSeconds = "0" + durationSeconds;
    }
    if (currentMinutes < 10) {
      currentMinutes = "0" + currentMinutes;
    }
    if (durationMinutes < 10) {
      durationMinutes = "0" + durationMinutes;
    }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

function initializeAudioVisualizer() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    canvas = document.getElementById('visualizer');
    ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  } catch (e) {
    console.error('Web Audio API is not supported in this browser', e);
  }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[randomIndex];
}

document.getElementById('file-upload').addEventListener('change', function(e) {
    const files = e.target.files;
    let addedTracks = 0;
    
    for (let file of files) {
        if (file.type.startsWith('audio/')) {
            const fileURL = URL.createObjectURL(file);
            music_list.push({
                img: getRandomImage(), // Use random image instead of fixed one
                name: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'Uploaded Track',
                music: fileURL
            });
            addedTracks++;
        }
    }
    
    if (addedTracks > 0) {
        showNotification(`Successfully added ${addedTracks} track${addedTracks > 1 ? 's' : ''} to playlist`);
        if (music_list.length === addedTracks) {
            loadTrack(0);
            playTrack();
        }
    }
});

function createVisualization() {
  if (!audioContext || !analyser || !canvas || !ctx) return;
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function animate() {
    requestAnimationFrame(animate);
    if (!isPlaying) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    analyser.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * 1.5;
      
      const hue = (i * 360 / bufferLength) + (Date.now() * 0.05) % 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }
  animate();
}

function initEqualizer() {
    const bands = [60, 230, 910]; // Frequency bands
    eqFilters = bands.map(freq => {
        const filter = audioContext.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
    });
    
    // Connect audio nodes: source -> filters -> analyser -> destination
    audioSource.disconnect();
    eqFilters.reduce((prev, curr) => {
        prev.connect(curr);
        return curr;
    }, audioSource).connect(analyser);
}

function updatePlaylist() {
    const container = document.querySelector('.playlist-items');
    container.innerHTML = music_list.map((track, index) => `
        <div class="playlist-item ${index === track_index ? 'playing' : ''}" 
             data-index="${index}"
             onclick="loadTrack(${index}); playTrack()">
            <div>${track.name}</div>
            <div class="artist">${track.artist}</div>
        </div>
    `).join('');
}

document.querySelectorAll('.eq-band').forEach(slider => {
    slider.addEventListener('input', e => {
        const band = parseInt(e.target.dataset.band);
        eqFilters[band].gain.value = parseFloat(e.target.value);
    });
});

document.querySelector('.timer-select').addEventListener('change', e => {
    const minutes = parseInt(e.target.value);
    if (sleepTimer) clearTimeout(sleepTimer);
    if (minutes > 0) {
        sleepTimer = setTimeout(() => {
            pauseTrack();
            showNotification(`Sleep timer ended - music stopped`);
        }, minutes * 60000);
    }
});

window.addEventListener('load', () => {
    updatePlaylist();
    initEqualizer();
});