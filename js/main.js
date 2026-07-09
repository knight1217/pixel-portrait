// Pixel Portrait — Main JS
const state = { file: null, style: null, generating: false };

// Style prompts
const STYLE_PROMPTS = {
  professional: "professional business portrait, corporate headshot, soft studio lighting, neutral blurred background, business attire, confident expression, high quality photography",
  anime: "anime style portrait, soft watercolor background, japanese animation illustration, expressive eyes, beautiful lighting, hand-drawn cel shaded look",
  pixar: "3D cartoon character portrait, stylized animation, playful, big expressive eyes, smooth 3D render, warm cinematic lighting, family-friendly",
  oil: "classical oil painting portrait, renaissance fine art style, rich colors, visible canvas texture, dramatic chiaroscuro lighting, museum quality",
  felt: "cute needle-felted plush doll portrait, soft wool texture, handmade craft aesthetic, fuzzy surface, adorable character, pastel background",
  sketch: "detailed pencil sketch portrait, black and white line art, cross-hatching shading, artistic hand-drawn look, paper texture, elegant",
  watercolor: "watercolor painting portrait, soft color washes, wet-on-wet technique, artistic, gentle palette, flowing brush strokes, dreamy background",
  pixel: "retro pixel art character portrait, 8-bit style, limited color palette, chunky visible pixels, old school game sprite aesthetic, clean background"
};

// DOM refs
const $ = (sel) => document.querySelector(sel);
const uploadZone = $('#uploadZone');
const fileInput = $('#fileInput');
const uploadPlaceholder = $('#uploadPlaceholder');
const preview = $('#preview');
const btnRemove = $('#btnRemove');
const btnGenerate = $('#btnGenerate');
const styleGrid = $('#styleGrid');
const uploadSection = $('#uploadSection');
const loadingSection = $('#loadingSection');
const resultSection = $('#resultSection');
const errorSection = $('#errorSection');
const resultImage = $('#resultImage');
const loadingText = $('#loadingText');
const errorText = $('#errorText');

// Upload
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--accent)'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = 'var(--border)'; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.style.borderColor = 'var(--border)';
  const f = e.dataTransfer.files[0];
  if (f) loadFile(f);
});

function handleFile(e) {
  const f = e.target.files[0];
  if (f) loadFile(f);
}

function loadFile(file) {
  if (!file.type.startsWith('image/')) return;
  state.file = file;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.classList.remove('preview-hidden');
    uploadPlaceholder.style.display = 'none';
    btnRemove.style.display = 'block';
    updateGenerateBtn();
  };
  reader.readAsDataURL(file);
}

btnRemove.addEventListener('click', () => {
  state.file = null;
  fileInput.value = '';
  preview.classList.add('preview-hidden');
  preview.src = '';
  uploadPlaceholder.style.display = '';
  btnRemove.style.display = 'none';
  updateGenerateBtn();
});

// Style selection
styleGrid.addEventListener('click', e => {
  const card = e.target.closest('.style-card');
  if (!card) return;
  styleGrid.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  state.style = card.dataset.style;
  updateGenerateBtn();
});

// Generate
btnGenerate.addEventListener('click', generate);

function updateGenerateBtn() {
  if (state.file && state.style) {
    btnGenerate.disabled = false;
    const styleName = document.querySelector(`[data-style="${state.style}"] .style-name`).textContent.trim();
    btnGenerate.textContent = `✨ Generate ${styleName} Portrait`;
  } else if (state.file) {
    btnGenerate.disabled = true;
    btnGenerate.textContent = 'Choose a style above';
  } else {
    btnGenerate.disabled = true;
    btnGenerate.textContent = 'Choose a photo and style first';
  }
}

async function callAPI(formData, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch('/api/generate', { method: 'POST', body: formData });
    const data = await resp.json();

    if (resp.ok) return data;

    // Queue full? Retry after delay
    const msg = data.error || '';
    if (msg.includes('queue') || msg.includes('retry') || resp.status === 503) {
      if (i < retries - 1) {
        const delay = 3000 * (i + 1);
        loadingText.textContent = `AI is busy, retrying in ${delay/1000}s...`;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
    }
    throw new Error(msg || 'Generation failed');
  }
  throw new Error('Failed after retries');
}

async function generate() {
  if (state.generating || !state.file || !state.style) return;
  state.generating = true;

  // UI state
  uploadSection.style.display = 'none';
  resultSection.style.display = 'none';
  errorSection.style.display = 'none';
  loadingSection.style.display = '';
  loadingText.textContent = 'Generating your portrait...';

  try {
    const formData = new FormData();
    formData.append('image', state.file);
    formData.append('style', state.style);
    formData.append('prompt', STYLE_PROMPTS[state.style]);

    const data = await callAPI(formData, 3);

    loadingSection.style.display = 'none';
    resultSection.style.display = '';
    resultImage.src = data.url;

    // Setup download
    $('#btnDownload').onclick = () => {
      const a = document.createElement('a');
      a.href = data.url;
      a.download = `pixel-portrait-${state.style}.png`;
      a.click();
    };

    // Try again
    $('#btnTryAgain').onclick = () => {
      uploadSection.style.display = '';
      resultSection.style.display = 'none';
      state.style = null;
      styleGrid.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
      updateGenerateBtn();
    };

  } catch (err) {
    loadingSection.style.display = 'none';
    errorSection.style.display = '';
    errorText.textContent = err.message;
    $('#btnErrorRetry').onclick = () => {
      errorSection.style.display = 'none';
      uploadSection.style.display = '';
      state.generating = false;
    };
  }

  state.generating = false;
}
