const target = new Date('2026-10-16T00:00:00+07:00').getTime();

const countdownPage = document.getElementById('countdownPage');
const galleryPage = document.getElementById('galleryPage');
const letterPage = document.getElementById('letterPage');
const goodbyePage = document.getElementById('goodbyePage');

const pad = n => String(n).padStart(2, '0');

let revealed = false;
let zeroTransitionScheduled = false;

// Page navigation
function showPage(page) {
  [countdownPage, galleryPage, letterPage, goodbyePage].forEach(p => {
    p.classList.add('hidden');
  });

  page.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  observeReveals();
}

function revealGallery() {
  if (revealed) return;

  revealed = true;
  showPage(galleryPage);
}

// Preview mode: open index.html?preview=1
const previewMode =
  new URLSearchParams(window.location.search).get('preview') === '1';

const previewButton = document.getElementById('previewButton');

if (previewMode && previewButton) {
  previewButton.classList.remove('hidden');
  previewButton.addEventListener('click', revealGallery);
}

// Countdown
function updateCountdown() {
  let diff = target - Date.now();

  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';

    // Preview mode stays on countdown until manually tested.
    if (previewMode) return;

    // Show 00:00:00 briefly, then automatically reveal gallery.
    if (!zeroTransitionScheduled && !revealed) {
      zeroTransitionScheduled = true;

      setTimeout(() => {
        revealGallery();
      }, 2500);
    }

    return;
  }

  const d = Math.floor(diff / 86400000);
  diff %= 86400000;

  const h = Math.floor(diff / 3600000);
  diff %= 3600000;

  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  document.getElementById('days').textContent = pad(d);
  document.getElementById('hours').textContent = pad(h);
  document.getElementById('minutes').textContent = pad(m);
  document.getElementById('seconds').textContent = pad(s);
}

// Photo gallery
const captions = [
  'a little moment',
  'one for the memories',
  'from my camera roll',
  'a frame to keep',
  'just because',
  'a little sunshine',
  'a moment in time',
  'one of my favourites',
  'a day worth remembering',
  'little things, lovely memories',
  'Happy Birthday'
];

const photos = Array.from(
  { length: 11 },
  (_, i) => `assets/frame_${String(i + 1).padStart(2, '0')}.jpg`
);

const grid = document.getElementById('photoGrid');

photos.forEach((src, i) => {
  const fig = document.createElement('figure');
  fig.className = 'photo-card';

  const rotations = [-2.2, 1.7, -1.2, 2.1, -1.6, 1.1];
  fig.style.setProperty('--rot', `${rotations[i % rotations.length]}deg`);

  const img = document.createElement('img');
  img.src = src;
  img.alt = `Birthday memory ${i + 1}`;
  img.loading = 'lazy';

  const cap = document.createElement('figcaption');
  cap.textContent = captions[i % captions.length];

  fig.append(img, cap);
  grid.append(fig);
});

// Scroll reveal animations
let observer;

function observeReveals() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document
    .querySelectorAll('.photo-card:not(.visible), .reveal:not(.visible)')
    .forEach(el => observer.observe(el));
}

// Start countdown
updateCountdown();
setInterval(updateCountdown, 1000);
observeReveals();

// Go to envelope
document.getElementById('toEnvelope').addEventListener('click', () => {
  showPage(letterPage);
});

// Interactive envelope
const scene = document.getElementById('envelopeScene');
const envelopeButton = document.getElementById('envelopeButton');

let opened = false;

envelopeButton.addEventListener('click', () => {
  if (opened) return;

  opened = true;
  scene.classList.add('open');

  document.getElementById('tapHint').textContent =
    'a little note, just for you';

  setTimeout(() => {
    document.getElementById('finishButton').classList.remove('hidden');
  }, 1400);
});

// Finish experience
document.getElementById('finishButton').addEventListener('click', () => {
  showPage(goodbyePage);
});

// Background music

 // Background music
const audio = document.getElementById('bgMusic');
const musicButton = document.getElementById('musicButton');
const musicControl = document.getElementById('musicControl');
const musicLabel = document.getElementById('musicLabel');

let musicStarted = false;

// Update music button appearance
function updateMusicUI() {
  if (audio.paused) {
    musicControl.classList.remove('playing');
    musicButton.textContent = '♫';
    musicButton.setAttribute('aria-label', 'Play music');
    musicLabel.textContent = 'music';
  } else {
    musicControl.classList.add('playing');
    musicButton.textContent = 'Ⅱ';
    musicButton.setAttribute('aria-label', 'Pause music');
    musicLabel.textContent = 'playing';
  }
}

// Start music on the first click or tap anywhere
async function startMusicOnInteraction() {
  if (musicStarted) return;

  try {
    await audio.play();
    musicStarted = true;
    updateMusicUI();

    document.removeEventListener('click', startMusicOnInteraction);
    document.removeEventListener('touchstart', startMusicOnInteraction);
    document.removeEventListener('keydown', startMusicOnInteraction);
  } catch (error) {
    console.error('Music playback failed:', error);
  }
}

document.addEventListener('click', startMusicOnInteraction);
document.addEventListener('touchstart', startMusicOnInteraction, {
  passive: true
});
document.addEventListener('keydown', startMusicOnInteraction);

// Manual play/pause button
musicButton.addEventListener('click', async (event) => {
  event.stopPropagation();

  try {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }

    musicStarted = true;
    updateMusicUI();

    document.removeEventListener('click', startMusicOnInteraction);
    document.removeEventListener('touchstart', startMusicOnInteraction);
    document.removeEventListener('keydown', startMusicOnInteraction);
  } catch (error) {
    console.error('Music playback failed:', error);
    musicLabel.textContent = 'music unavailable';
  }
});

audio.addEventListener('play', updateMusicUI);
audio.addEventListener('pause', updateMusicUI);


// Optional aggregate analytics:
// Configure GoatCounter separately if desired.