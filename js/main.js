// SnapShift Main JS

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ===== Hero Showcase Rotator =====
let currentShowcase = 0;
const showcaseCards = $$('.showcase-card');
const showcaseDots = $$('.showcase-dots .dot');
const totalShowcases = showcaseCards.length;

function rotateShowcase(index) {
  showcaseCards.forEach(c => c.classList.remove('active'));
  showcaseDots.forEach(d => d.classList.remove('active'));
  showcaseCards[index].classList.add('active');
  showcaseDots[index].classList.add('active');
  currentShowcase = index;
}

showcaseDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const targetId = dot.dataset.showcase;
    const idx = Array.from(showcaseCards).findIndex(c => c.id === targetId);
    if (idx >= 0) rotateShowcase(idx);
  });
});

setInterval(() => {
  rotateShowcase((currentShowcase + 1) % totalShowcases);
}, 4000);

// ===== Before/After Comparison Slider =====
const compareSlider = $('#compareSlider');
const compareBeforeWrap = $('#compareBeforeWrap');
const compareBeforeImg = $('#compareBeforeImg');
const compareHandle = $('#compareHandle');

if (compareSlider) {
  let isComparing = false;

  function resizeCompareBefore() {
    if (!compareBeforeImg || !compareSlider) return;
    compareBeforeImg.style.width = compareSlider.offsetWidth + 'px';
  }

  resizeCompareBefore();
  window.addEventListener('resize', resizeCompareBefore);

  function moveHandle(clientX) {
    const rect = compareSlider.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const pct = (x / rect.width) * 100;
    compareBeforeWrap.style.width = pct + '%';
    compareHandle.style.left = pct + '%';
  }

  function startCompare(e) {
    isComparing = true;
    e.preventDefault();
  }

  function stopCompare() {
    isComparing = false;
  }

  function dragCompare(e) {
    if (!isComparing) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    moveHandle(clientX);
  }

  compareHandle.addEventListener('mousedown', startCompare);
  compareHandle.addEventListener('touchstart', startCompare, { passive: false });
  document.addEventListener('mousemove', dragCompare);
  document.addEventListener('touchmove', dragCompare, { passive: false });
  document.addEventListener('mouseup', stopCompare);
  document.addEventListener('touchend', stopCompare);

  // Click on slider directly to jump handle position
  compareSlider.addEventListener('click', e => {
    if (e.target.closest('.compare-handle')) return;
    moveHandle(e.clientX);
  });

  // Thumbnail switching
  const compareThumbs = $$('.ct-item');
  const compareAfterImg = $('#compareAfterImg');

  compareThumbs.forEach(btn => {
    btn.addEventListener('click', () => {
      compareThumbs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      compareBeforeImg.src = btn.dataset.before;
      compareAfterImg.src = btn.dataset.after;
      // Reset handle to center
      compareBeforeWrap.style.width = '50%';
      compareHandle.style.left = '50%';
    });
  });
}

// ===== Template cards click → scroll to generator =====
const templateCards = $$('.template-card');
templateCards.forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.styleKey;
    if (key) {
      document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
      selectTemplateStyle(key);
    }
  });
});

// ===== Prompt Strip Lightbox =====
const promptLightbox = $('#promptLightbox');
if (promptLightbox) {
  $('#plbClose').addEventListener('click', () => {
    promptLightbox.style.display = 'none';
    document.body.style.overflow = '';
  });
  promptLightbox.addEventListener('click', e => {
    if (e.target === promptLightbox) {
      promptLightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && promptLightbox.style.display !== 'none') {
      promptLightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // (initStrip moved to after promptExamples definition)
}

// ===== Generator: Multi-image Upload =====
const uploadZone = $('#uploadZone');
const fileInput = $('#fileInput');
const uploadAdd = $('#uploadAdd');
const previewStack = $('#previewStack');
let uploadedFiles = [];

function refreshUploadAdd() {
  if (uploadedFiles.length > 0) {
    uploadAdd.querySelector('h3').textContent = 'Click to add more photos';
    uploadAdd.querySelector('p').textContent = `${uploadedFiles.length}/5 uploaded`;
  } else {
    uploadAdd.querySelector('h3').textContent = 'Drop or click to upload';
    uploadAdd.querySelector('p').textContent = 'JPG / PNG, up to 5 photos';
  }
}

function renderPreviews() {
  previewStack.innerHTML = '';
  previewStack.className = 'preview-stack';
  if (uploadedFiles.length > 0) {
    previewStack.classList.add('has-images', `count-${uploadedFiles.length}`);
  }
  uploadedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = () => {
      const wrap = document.createElement('div');
      wrap.className = 'preview-thumb';
      wrap.innerHTML = `
        <img src="${reader.result}" alt="${file.name}">
        <button class="preview-remove" data-idx="${idx}" title="Remove">x</button>
      `;
      previewStack.appendChild(wrap);
    };
    reader.readAsDataURL(file);
  });
}

function addFiles(files) {
  if (!files.length) return;
  const remaining = 5 - uploadedFiles.length;
  if (remaining <= 0) return;
  const toAdd = files.slice(0, remaining);
  uploadedFiles = uploadedFiles.concat(toAdd);
  renderPreviews();
  refreshUploadAdd();
  updateGenBtn();
}

uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  if (e.target.files.length) addFiles(Array.from(e.target.files));
  e.target.value = ''; // allow re-selecting same files
});
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--accent)'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = 'rgba(0,0,0,0.1)'; });
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.style.borderColor = 'rgba(0,0,0,0.1)';
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length) addFiles(files);
});

previewStack.addEventListener('click', e => {
  const btn = e.target.closest('.preview-remove');
  if (!btn) return;
  e.stopPropagation();
  const idx = parseInt(btn.dataset.idx, 10);
  uploadedFiles.splice(idx, 1);
  if (uploadedFiles.length === 0) {
    previewStack.classList.remove('has-images');
  }
  renderPreviews();
  refreshUploadAdd();
  updateGenBtn();
});

// ===== Generator: Skip upload =====
const skipUploadBtn = $('#skipUploadBtn');
let skipUpload = false;

skipUploadBtn.addEventListener('click', () => {
  skipUpload = !skipUpload;
  if (skipUpload) {
    uploadedFiles = [];
    previewStack.innerHTML = '';
    previewStack.classList.remove('has-images');
    refreshUploadAdd();
    skipUploadBtn.textContent = '✓ No photo needed';
    skipUploadBtn.classList.add('active');
    uploadZone.style.opacity = '0.45';
    uploadZone.style.pointerEvents = 'none';
  } else {
    refreshUploadAdd();
    skipUploadBtn.textContent = 'Generate without photo';
    skipUploadBtn.classList.remove('active');
    uploadZone.style.opacity = '';
    uploadZone.style.pointerEvents = '';
  }
  updateGenBtn();
});

// ===== Generator: Aspect Ratio & Resolution =====
let selectedRatio = '1:1';
let selectedRes = '1K';
let selectedStyle = 'free-mode';

$$('.ratio-btn').forEach(b => {
  b.addEventListener('click', () => {
    $$('.ratio-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    selectedRatio = b.dataset.ratio;
  });
});

$$('.res-btn').forEach(b => {
  b.addEventListener('click', () => {
    $$('.res-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    selectedRes = b.dataset.res;
  });
});

// ===== Generator: Style selection =====
function selectTemplateStyle(styleKey) {
  selectedStyle = styleKey || 'free-mode';
  const displayText = $('#templateDisplayText');
  if (displayText) displayText.textContent = styleKey === 'free-mode' ? 'Free Mode' : (STYLE_NAMES[styleKey] || styleKey);
  // Update hot buttons
  $$('.gen-thumb').forEach(b => b.classList.toggle('active', b.dataset.genStyle === styleKey));
  updateGenBtn();
}

$$('.gen-thumb').forEach(b => {
  b.addEventListener('click', () => {
    if (b.id === 'templateMoreBtn') return; // handled separately
    selectTemplateStyle(b.dataset.genStyle);
  });
});

// ===== Advanced toggle =====
const advancedToggle = $('#advancedToggle');
const advancedPanel = $('#advancedPanel');
advancedToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const savedBehavior = html.style.scrollBehavior;
  const savedScrollY = window.scrollY;
  html.style.scrollBehavior = 'auto';

  const open = advancedPanel.style.display !== 'none';
  advancedPanel.style.display = open ? 'none' : 'block';
  advancedToggle.classList.toggle('open');

  window.scrollTo(0, savedScrollY);
  requestAnimationFrame(() => {
    html.style.scrollBehavior = savedBehavior || '';
  });
});

// ===== Generator button state =====
const btnGenerate = $('#btnGenerate');
const loadingSection = $('#loadingSection');
const resultSection = $('#resultSection');
const errorSection = $('#errorSection');
const loadingText = $('#loadingText');
const errorText = $('#errorText');
const resultImage = $('#resultImage');
const showcaseArea = $('#showcaseArea');
const customPromptEl = $('#customPrompt');

function updateGenBtn() {
  const hasPhoto = uploadedFiles.length > 0;
  const customPrompt = customPromptEl?.value?.trim();
  const hasPrompt = !!customPrompt;
  const hasStyle = selectedStyle && selectedStyle !== 'free-mode';

  if (hasPhoto || hasPrompt) {
    btnGenerate.disabled = false;
    if (hasStyle) {
      btnGenerate.textContent = `Generate ${selectedStyle.replace(/-/g, ' ')}`;
    } else if (hasPhoto && hasPrompt) {
      btnGenerate.textContent = 'Generate from photo + prompt';
    } else if (hasPhoto) {
      btnGenerate.textContent = 'Generate from photo';
    } else {
      btnGenerate.textContent = 'Generate from prompt';
    }
  } else {
    btnGenerate.disabled = true;
    btnGenerate.textContent = 'Enter a prompt or select a template';
  }
}

// Update button state as user types
if (customPromptEl) {
  customPromptEl.addEventListener('input', updateGenBtn);
}

// ===== Showcase before generation =====
// 46 unique items, tag auto-derived from filename
const showcasePool = [
  { src: 'samples-v4/transformed/street-cyberpunk.png', tag: 'Cyberpunk' },
  { src: 'samples-v4/transformed/cat-anime.png', tag: 'Anime' },
  { src: 'samples-v4/transformed/runner-tradingcard.png', tag: 'Sports Card' },
  { src: 'samples-v4/transformed/dog-funko.png', tag: 'Funko Pop' },
  { src: 'samples-v4/transformed/city-anime.png', tag: 'Anime City' },
  { src: 'samples-v4/transformed/flowers-ghibli.png', tag: 'Ghibli' },
  { src: 'samples-v4/transformed/beach-album.png', tag: 'Album Cover' },
  { src: 'samples-v4/transformed/mountain-oil.png', tag: 'Oil Painting' },
  { src: 'samples-v4/transformed/watch-luxury.png', tag: 'Luxury Watch' },
  { src: 'samples-v4/transformed/cat-cute-chibisticker.png', tag: 'Chibi' },
  { src: 'samples-v4/transformed/cat-felt.png', tag: 'Felt' },
  { src: 'samples-v4/transformed/cat-oil.png', tag: 'Oil Painting' },
  { src: 'samples-v4/transformed/chibi-character-animalcrossing.png', tag: 'Animal Crossing' },
  { src: 'samples-v4/transformed/city-street-anime.png', tag: 'Anime Street' },
  { src: 'samples-v4/transformed/city-street-vintage.png', tag: 'Vintage' },
  { src: 'samples-v4/transformed/city-vintage.png', tag: 'Vintage' },
  { src: 'samples-v4/transformed/coffee-watercolor.png', tag: 'Watercolor' },
  { src: 'samples-v4/transformed/comic-scene-yonkoma.png', tag: '4-Panel Comic' },
  { src: 'samples-v4/transformed/corgi-enamelpin.png', tag: 'Enamel Pin' },
  { src: 'samples-v4/transformed/dog-cartoon.png', tag: 'Cartoon' },
  { src: 'samples-v4/transformed/dog-pixel.png', tag: 'Pixel' },
  { src: 'samples-v4/transformed/fantasy-landscape-pixelrpg.png', tag: 'Pixel RPG' },
  { src: 'samples-v4/transformed/flowers-oil.png', tag: 'Oil' },
  { src: 'samples-v4/transformed/fruit-bowl-gouache.png', tag: 'Gouache' },
  { src: 'samples-v4/transformed/girl-asian-1-powerpuff.png', tag: 'Powerpuff' },
  { src: 'samples-v4/transformed/girl-asian-2-peko.png', tag: 'Peko' },
  { src: 'samples-v4/transformed/landscape-lake-vangogh.png', tag: 'Van Gogh' },
  { src: 'samples-v4/transformed/mountain-ghibli.png', tag: 'Ghibli' },
  { src: 'samples-v4/transformed/parrot-anime.png', tag: 'Anime' },
  { src: 'samples-v4/transformed/parrot-watercolor.png', tag: 'Watercolor' },
  { src: 'samples-v4/transformed/portrait-drama-bnwphoto.png', tag: 'B&W Portrait' },
  { src: 'samples-v4/transformed/portrait-male-blindbox.png', tag: 'Blind Box' },
  { src: 'samples-v4/transformed/potted-plant-mangaline.png', tag: 'Manga' },
  { src: 'samples-v4/transformed/retro-car-retroposter.png', tag: 'Retro Poster' },
  { src: 'samples-v4/transformed/runner-comic.png', tag: 'Comic' },
  { src: 'samples-v4/transformed/runner-figurine.png', tag: 'Figurine' },
  { src: 'samples-v4/transformed/sneakers-cyberpunk.png', tag: 'Cyberpunk' },
  { src: 'samples-v4/transformed/sneakers-product.png', tag: 'Product' },
  { src: 'samples-v4/transformed/street-magazine.png', tag: 'Magazine' },
  { src: 'samples-v4/transformed/street-movieposter.png', tag: 'Movie Poster' },
  { src: 'samples-v4/transformed/street-portrait-magazine.png', tag: 'Magazine' },
  { src: 'samples-v4/transformed/street-portrait-movieposter.png', tag: 'Movie Poster' },
  { src: 'samples-v4/transformed/action-hero-gamecard.png', tag: 'Trading Card' },
  { src: 'samples-v4/transformed/beach-fantasy.png', tag: 'Fantasy' }
];
// Shuffle and take 9 random each page load
const showcaseItems = [...showcasePool].sort(() => Math.random() - 0.5).slice(0, 9);

const showcaseGrid = $('#showcaseGrid');
if (showcaseGrid) {
  showcaseItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'sc-item';
    div.innerHTML = `<img src="${item.src}" alt="${item.tag}"><span class="sc-tag">${item.tag}</span>`;
    div.addEventListener('click', () => {
      const match = Array.from($$('.gen-thumb')).find(t => t.dataset.genStyle && item.tag.toLowerCase().includes(t.textContent.trim().toLowerCase()));
      if (match) {
        $$('.gen-thumb').forEach(t => t.classList.remove('active'));
        match.classList.add('active');
        selectedStyle = match.dataset.genStyle;
        updateGenBtn();
      }
    });
    showcaseGrid.appendChild(div);
  });
}

// ===== Prompt Inspiration Modal =====
const promptInspiration = $('#promptInspiration');
const inspirationModal = $('#inspirationModal');
const modalClose = $('#modalClose');
const modalBody = $('#modalBody');
const modalSearch = $('#modalSearch');

const promptExamples = [
  { title: 'Corporate Portrait', src: 'prompts-final/prompts-previews/Portrait/001-corporate.png', tags: ['portrait', 'business'], prompt: 'Professional headshot of confident businesswoman in her 30s, navy blazer, genuine smile, white background, studio lighting, shot on Canon 85mm f/1.4, sharp focus, 8k' },
  { title: 'Cyberpunk Night', src: 'prompts-final/prompts-previews/Urban/001-cyberpunk.png', tags: ['cyberpunk', 'city'], prompt: 'Futuristic cyberpunk city at night, neon signs in Japanese, rain-soaked streets reflecting lights, flying cars, people with umbrellas, Blade Runner style, cinematic, 8k' },
  { title: 'Luxury Product', src: 'prompts-final/prompts-previews/Still Life/001-luxury.png', tags: ['product', 'luxury'], prompt: 'Swiss luxury watch close-up, polished steel, blue dial, black leather strap, dramatic studio lighting with reflections, product photography, commercial quality, premium, 8k' },
  { title: 'Ghibli Countryside', src: 'prompts-final/prompts-previews/Fantasy/001-ghibli.png', tags: ['ghibli', 'anime'], prompt: 'Pastoral countryside in Studio Ghibli animation style, rolling green hills dotted with wildflowers, a small stone cottage with smoke rising, a massive ancient oak tree, clear summer sky with fluffy clouds, hand-painted quality, warm afternoon light' },
  { title: 'Epic Landscape', src: 'prompts-final/prompts-previews/Nature/001-landscape.png', tags: ['landscape', 'nature'], prompt: 'Snow-capped mountain range at sunrise, orange and pink clouds, alpine meadow with wildflowers, lake reflection, wide-angle landscape, National Geographic quality, 8k' },
  { title: 'Food Photography', src: 'prompts-final/prompts-previews/Food/001-pancake-stack-syrup-waterfall-kayakers.png', tags: ['food', 'photography'], prompt: 'Gourmet burger with stacked ingredients, sesame bun, lettuce, tomato, melted cheddar, juicy beef, professional food photography, appetizing, dramatic lighting, menu quality, 8k' },
  { title: 'Epic Fantasy Dragon', src: 'prompts-final/prompts-previews/Fantasy/002-dragon.png', tags: ['fantasy', 'dragon'], prompt: 'Majestic dragon on mountain peak, iridescent scales, wings spread wide, medieval castle in valley, storm clouds, epic fantasy art, highly detailed, concept art, dramatic lighting, 8k' },
  { title: 'Magical Forest', src: 'prompts-final/prompts-previews/Nature/002-forest.png', tags: ['nature', 'magical'], prompt: 'Ancient forest with morning mist, sun rays through trees creating god rays, moss-covered ground, ferns, magical atmosphere, fantasy landscape, cinematic, detailed, 8k' },
  { title: 'Cyberpunk Anime', src: 'prompts-final/prompts-previews/Fantasy/009-cyberanime.png', tags: ['anime', 'cyberpunk'], prompt: 'Anime portrait of a young woman with neon pink twin-tail hair, visor reflecting neon cityscape, cyberpunk jacket with LED strip accents, dramatic neon lighting, manga-style portrait composition, MAPPA studio production quality' },
  { title: '1970s Film Portrait', src: 'prompts-final/prompts-previews/Portrait/002-1970s.png', tags: ['retro', 'film'], prompt: '1970s film photography portrait of a woman in her late 20s, feathered layered Farrah Fawcett-era hair, patterned wrap dress, soft warm backlight, very heavy film grain, faded analog color palette, Kodak Ektar film simulation' },
  { title: 'VHS Glitch Art', src: 'prompts-final/prompts-previews/Abstract/001-vhs.png', tags: ['retro', 'glitch'], prompt: 'VHS glitch aesthetic portrait, subject with voluminous 80s hair and bold makeup, horizontal scan line distortion across image, color channel bleeding on right edge, white timestamp overlay in bottom-left, heavy digital noise and static texture, retro aesthetic' },
  { title: 'Abstract Fluid Art', src: 'prompts-final/prompts-previews/Abstract/002-abstract.png', tags: ['abstract', 'art'], prompt: 'Abstract fluid art, swirling marble texture, navy blue, gold and white, organic flowing patterns, luxury aesthetic, digital art, high resolution, mesmerizing, elegant, 8k' },
  { title: 'Documentary Portrait', src: 'prompts-final/prompts-previews/Portrait/003-documentary.png', tags: ['portrait', 'documentary'], prompt: 'Close-up portrait of weathered fisherman in his 60s, grey beard, deep blue eyes, yellow rain jacket, ocean in background, overcast lighting, documentary style, photorealistic, highly detailed, 8k' }
];

// ===== Randomize Prompt Inspiration Strip (after promptExamples defined) =====
(function initStrip() {
  const track = $('#stripTrack');
  if (!track) return;
  const validPool = promptExamples.filter(ex => !ex.src.includes('prompt-11') && !ex.src.includes('prompt-13') && !ex.src.includes('prompt-16'));
  const selected = [...validPool].sort(() => Math.random() - 0.5).slice(0, 10);
  let html = '';
  const build = (ex) => {
    const d = ex.prompt.replace(/"/g,'&quot;');
    return '<div class="pi-item" data-title="'+ex.title+'" data-tags="'+ex.tags.join(',')+'" data-prompt="'+d+'"><img loading="lazy" src="'+ex.src+'" alt="'+ex.title+'"><span class="pi-label">'+ex.title+'</span></div>';
  };
  selected.forEach(ex => html += build(ex));
  html += build(selected[0]); html += build(selected[1]);
  track.innerHTML = html;
  track.addEventListener('click', e => {
    const item = e.target.closest('.pi-item');
    if (!item) return;
    const img = item.querySelector('img'), title = item.dataset.title;
    const tags = item.dataset.tags, prompt = item.dataset.prompt;
    $('#plbImg').src = img.src; $('#plbTitle').textContent = title;
    $('#plbTags').innerHTML = tags.split(',').map(t => '<span class="plb-tag">'+t.trim()+'</span>').join('');
    $('#plbPrompt').textContent = prompt;
    $('#plbUse').onclick = () => {
      const cp = $('#customPrompt'); cp.value = prompt;
      cp.scrollIntoView({behavior:'smooth'});
      if ($('#advancedPanel') && $('#advancedPanel').style.display === 'none') $('#advancedToggle').click();
      if (promptLightbox) { promptLightbox.style.display = 'none'; document.body.style.overflow = ''; }
      updateGenBtn();
    };
    $('#plbCopy').onclick = async () => {
      try { await navigator.clipboard.writeText(prompt); $('#plbCopy').textContent = 'Copied!'; setTimeout(() => $('#plbCopy').textContent = 'Copy prompt', 1500); }
      catch (err) { $('#plbCopy').textContent = 'Copy failed'; setTimeout(() => $('#plbCopy').textContent = 'Copy prompt', 1500); }
    };
    if (promptLightbox) { promptLightbox.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  });
})();

function renderPromptCards() {
  modalBody.innerHTML = '';
  // Shuffle and take first 12 each time the modal opens
  const shuffled = [...promptExamples].sort(() => Math.random() - 0.5).slice(0, 12);
  shuffled.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.dataset.title = ex.title.toLowerCase();
    card.dataset.tags = ex.tags.join(' ').toLowerCase();
    card.dataset.prompt = ex.prompt.toLowerCase();
    card.innerHTML = `
      <img src="${ex.src}" alt="${ex.title}" loading="lazy">
      <div class="pc-info">
        <div class="pc-title">${ex.title}</div>
        <div class="pc-tags">${ex.tags.map(t => `<span class="pc-tag">${t}</span>`).join('')}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      customPromptEl.value = ex.prompt;
      advancedPanel.style.display = 'block';
      advancedToggle.classList.add('open');
      inspirationModal.style.display = 'none';
      updateGenBtn();
    });
    modalBody.appendChild(card);
  });
}

function openModal() {
  inspirationModal.style.display = 'flex';
  renderPromptCards();
}

if (promptInspiration) promptInspiration.addEventListener('click', openModal);
if (modalClose) modalClose.addEventListener('click', () => inspirationModal.style.display = 'none');
if (inspirationModal) {
  inspirationModal.addEventListener('click', e => {
    if (e.target === inspirationModal) inspirationModal.style.display = 'none';
  });
}

// ===== Generate =====
const stylePrompts = {
  // ===== 3D / Toys =====
  'cyberpunk': 'Turn this photo into a cyberpunk style transformation. Neon city night background, glowing holographic lights, tech noir aesthetic. The face, outfit, and pose follow the original subject. Dramatic cinematic lighting.',
  'anime': 'Convert this photo into high-quality anime art, vibrant cel shading colors, clean line work, large expressive eyes, soft beautiful lighting, hand-drawn animation look',
  'oil-painting': 'Reimagine this photo as a classical oil painting with thick impasto technique, heavy visible brushstrokes, palette knife texture, layered paint, thick pigment buildup, rich oil colors, renaissance fine art quality, dramatic chiaroscuro lighting, museum-worthy masterpiece with tangible paint texture and bold brush marks',
  'movie-poster': 'Turn this photo into a cinematic movie poster, dramatic Hollywood composition, warm golden lighting, epic film atmosphere, professional film grain texture',
  'cartoon': 'Turn this photo into a Pixar-style 3D cartoon. The face, features, and body follow the original subject. Smooth glossy shading, animated movie quality. Keep the original background.',
  'watercolor': 'Convert this photo into a flowing watercolor painting, soft pigment washes blending naturally, delicate paper texture, dreamy artistic atmosphere, hand-painted feel',
  'funko-pop': 'Turn this photo into a Funko Pop style collectible figure. The face, body shape, and key features follow the original subject (dog stays dog, person stays person). Glossy vinyl Funko Pop finish with large black circular eyes. Boxed and unboxed versions shown side by side. Keep the original background and lighting.',
  'ghibli': 'Transform this photo into Studio Ghibli animation style, soft watercolor backgrounds, warm magical lighting, whimsical hand-drawn quality, gentle nostalgic atmosphere',
  'vintage': 'Convert this photo into a vintage retro photograph, warm sepia tones, heavy film grain, faded analog colors, 1970s aesthetic, nostalgic soft-focus look',
  'magazine': 'Turn this photo into a magazine cover layout with bold masthead typography overlay and cover-style composition, magazine title text overlay, professional print quality, clean composition',
  'figurine': 'Turn this photo into a detailed 3D collectible figurine. The face, features, and pose follow the original subject. Glossy plastic texture, standing on a small display base. Professional toy product photography.',
  'pixel': 'Transform this photo into retro pixel art, 8-bit game sprite aesthetic, limited color palette, crisp square pixels, dithered shading, nostalgic arcade game look',
  // ===== 3D / Toys (continued) =====
  'anime-figure': 'Turn this photo into a 1/7 scale Japanese anime figurine (NOT chibi Q-version, NOT blind-box style). The face, hair, eye color, gender, ethnicity, pose, and outfit follow the original subject. The body is anime style with glossy PVC texture. Figure stands on a themed environmental base. Keep the original background and lighting.',
  'lego-minifig': 'Turn this photo into a LEGO minifigure scene. Body is LEGO blocky style with cylindrical claw hands. The face, skin color, hair, outfit, and pose follow the original subject. Keep the original background and lighting.',
  'lego-style': 'Rebuild this scene entirely from LEGO bricks, blocky geometric construction, visible stud connections on every surface, realistic plastic brick texture, authentic brick-built look',
  'action-figure': 'Turn this photo into a premium action figure. The face, hair, skin color, outfit, and pose follow the original subject. The body is detailed with articulated joints. Displayed in blister card packaging. Keep the original background and lighting.',
  'chibi-3d': 'Turn this photo into a cute chibi-style 3D figure. Oversized round head, tiny body proportions. The face and features follow the original subject. Glossy smooth shading, vibrant playful colors.',
  '3d-polaroid': 'Create a magical 3D pop-out Polaroid effect, subject breaking out beyond the instant photo frame, floating dimensional elements, classic white Polaroid border, creative surreal composition',
  'plush-toy': 'Turn this photo into an adorable plush stuffed toy. Soft fuzzy fabric texture, stitched seam details. The face and features follow the original subject. Warm toy store photography.',
  'crochet-doll': 'Turn this photo into a handmade crochet yarn doll. Visible knitted stitch texture, soft wool appearance. The face and features follow the original subject. Cozy handmade quality.',
  'acrylic-keychain': 'Turn this subject into a cute acrylic keychain charm, transparent printed plastic with metal keyring attached, glossy flat surface, trendy accessory mockup style',
  'enamel-pin': 'Transform this subject into a collectible enamel pin badge, polished metal edges with vibrant colored enamel fill, shiny metallic finish, flat-lay product photography',
  'cosplay': 'Turn this photo into a realistic cosplay transformation. The face, body, and pose follow the original subject (same person wearing an intricately detailed costume). Professional convention photography quality.',
  // ===== Anime / Cartoon =====
  'pixar': 'Transform this photo into Pixar animation style, smooth 3D cartoon rendering with subsurface scattering, expressive character design, warm cinematic lighting, Disney-quality animated film look',
  'disney': 'Reimagine this photo as classic Disney hand-drawn animation, soft watercolor backgrounds, expressive character features, magical fairy-tale atmosphere, timeless animated movie quality',
  'snoopy': 'Convert this photo into Charles Schulz Peanuts comic style, simple black line drawing with selective spot color, nostalgic newspaper comic strip aesthetic, charming hand-drawn characters',
  'chibi': 'Turn this photo into super-deformed chibi art. Extremely oversized head on tiny body. The face and features follow the original subject. Simplified cute features, kawaii manga aesthetic.',
  'powerpuff': 'Turn this photo into Powerpuff Girls cartoon style, flat bold colors with thick black outlines, simple geometric character shapes, retro Cartoon Network aesthetic, early 2000s nostalgia',
  'japanese-illust': 'Convert this photo into a modern Japanese kawaii illustration, simple clean line art, flat pastel color palette, cute minimalist character design, trendy vector art style',
  'animal-crossing': 'Transform this photo into Animal Crossing game art style, rounded soft 3D character design, cozy pastel colors, charming Nintendo village aesthetic, heartwarming Nintendo quality',
  // ===== Art / Painting =====
  'gouache': 'Recreate this photo as a gouache painting, opaque matte finish with rich flat colors, visible brush strokes, thick pigment texture, professional illustration art quality',
  'van-gogh': 'Transform this photo into a Van Gogh masterpiece, thick swirling impasto oil strokes, vibrant complementary color palette, post-impressionist artistic style, museum-quality painting',
  'marker-sketch': 'Convert this photo into a bold marker pen sketch, colorful expressive strokes, sketchy artistic line work, fashion illustration feel, creative hand-drawn rendering',
  'palette-swap': 'Recolor this photo using a completely different color palette, same composition with dramatically shifted color mood, artistic color grading transformation, creative visual reinterpretation',
  'painting-process': 'Show this subject as a four-panel painting process progression, from rough sketch to clean line art to flat color blocking to final polished render, art tutorial style showcase',
  // ===== Comic / Line Art =====
  'comic-outfit': 'Turn this subject into a shojo manga fashion illustration, cute outfit showcase with Japanese comic panel layout, screentone dot shading, elegant manga aesthetic, fashion magazine style',
  'comic-white': 'Convert this photo into clean manga line art on pure white background, crisp black ink outlines, professional screentone shading, authentic Japanese comic illustration style',
  'yonkoma': 'Transform this scene into a four-panel yonkoma manga comic strip, sequential storytelling with dialogue bubbles, simple expressive characters, humorous slice-of-life manga format',
  'line-art': 'Convert this photo into precise professional line art, clean black ink outlines on white, detailed illustration work, crisp vector-quality precision, elegant minimal style',
  'vector-illustration': 'Transform this photo into a flat vector illustration, clean geometric shapes with smooth color gradients, minimalist modern graphic design, professional digital art aesthetic',
  // ===== Photo / Realistic =====
  'realistic': 'Enhance this photo to hyper-realistic quality, photorealistic skin texture and fine detail, true-to-life natural rendering, professional portrait photography quality, 8K ultra-sharp',
  'hd-enhance': 'Apply super-resolution enhancement to this photo, refine all texture details to 4K clarity, professional photo retouch quality, pristine polished finish, ultra-crisp sharpness',
  'pose-reference': 'Create a professional pose reference sheet from this subject, showing multiple angle views, clean neutral studio background, anatomical figure drawing reference quality',
  'subject-extract': 'Cleanly isolate the subject from this photo with a perfect transparent background cutout, sharp precise edges, professional studio product photography quality, ready for compositing',
  'makeup-analysis': 'Create a professional makeup breakdown visualization from this photo, side-by-side before and after comparison, cosmetic product technique mapping, beauty editorial reference quality',
  // ===== Design / Product =====
  'architecture-model': 'Transform this into a detailed architectural scale model, realistic miniature building materials like foam board and balsa wood, professional presentation model quality',
  'product-render': 'Turn this subject into premium product photography, clean white studio background, perfect commercial lighting, professional e-commerce catalog quality, 8K sharp focus',
  'can-design': 'Render this design onto an aluminum beverage can, glossy metallic finish with vibrant printed label graphics, realistic condensation droplets, commercial product mockup quality',
  'industrial-design': 'Recreate this as a professional industrial design concept rendering, clean studio backdrop, sophisticated matte and glossy material finishes, premium product visualization quality',
  '3d-screen': 'Create a futuristic 3D screen effect, subject popping out beyond the digital display boundary, holographic glass overlay, augmented reality UI elements, sci-fi interface style',
  // ===== Other =====
  'ice-queen': 'Transform this subject into an ethereal ice queen, crystalline frost details and shimmering ice textures, elegant cool blue tones, sharp refined beauty, magical frozen atmosphere',
  'bg-replace': 'Seamlessly replace the background of this photo, clean subject separation with a completely new environment, perfectly matched lighting and shadows, professional compositing quality',
  'overlay': 'Add artistic decorative illustration overlays around the subject, creative mixed-media embellishments, hand-drawn artistic accents blending with the photo, editorial art style'
};

// ===== Style display names =====
const STYLE_NAMES = {'free-mode':'Free Mode','cyberpunk':'Cyberpunk','anime':'Anime','oil-painting':'Oil Painting','movie-poster':'Movie Poster','cartoon':'3D Cartoon','watercolor':'Watercolor','funko-pop':'Funko Pop','ghibli':'Ghibli','vintage':'Vintage','magazine':'Magazine Cover','figurine':'Figurine','pixel':'Pixel Art','anime-figure':'Anime Figure','lego-minifig':'LEGO Minifig','lego-style':'LEGO Style','action-figure':'Action Figure','chibi-3d':'Chibi 3D','3d-polaroid':'3D Polaroid','plush-toy':'Plush Toy','crochet-doll':'Crochet Doll','acrylic-keychain':'Acrylic Keychain','enamel-pin':'Enamel Pin','cosplay':'Cosplay','pixar':'Pixar','disney':'Disney','snoopy':'Peanuts / Snoopy','chibi':'Chibi','powerpuff':'Powerpuff Girls','japanese-illust':'Japanese Illustration','animal-crossing':'Animal Crossing','gouache':'Gouache','van-gogh':'Van Gogh','marker-sketch':'Marker Sketch','palette-swap':'Palette Swap','painting-process':'Painting Process','comic-outfit':'Manga Fashion','comic-white':'Manga Line Art','yonkoma':'4-Panel Comic','line-art':'Line Art','vector-illustration':'Vector Illustration','realistic':'Hyper-Realistic','hd-enhance':'HD Enhance','pose-reference':'Pose Reference','subject-extract':'Subject Extraction','makeup-analysis':'Makeup Analysis','ice-queen':'Ice Queen','architecture-model':'Architecture Model','product-render':'Product Render','can-design':'Can Design','industrial-design':'Industrial Design','3d-screen':'3D Screen Effect','bg-replace':'Background Replace','overlay':'Art Overlay'};

// ===== Template Selection Modal =====
const TEMPLATE_CATS = [
  {name:'3D & Toys', styles:['anime-figure','lego-minifig','lego-style','action-figure','chibi-3d','3d-polaroid','plush-toy','crochet-doll','acrylic-keychain','enamel-pin','cosplay']},
  {name:'Anime & Cartoon', styles:['pixar','disney','snoopy','chibi','powerpuff','japanese-illust','animal-crossing']},
  {name:'Art & Painting', styles:['gouache','van-gogh','marker-sketch','palette-swap','painting-process']},
  {name:'Comic & Line Art', styles:['comic-outfit','comic-white','yonkoma','line-art','vector-illustration']},
  {name:'Photo & Realistic', styles:['realistic','hd-enhance','pose-reference','subject-extract','makeup-analysis']},
  {name:'Design & Product', styles:['architecture-model','product-render','can-design','industrial-design','3d-screen']},
  {name:'Other', styles:['ice-queen','bg-replace','overlay']}
];

function buildTemplateModal() {
  const body = $('#templateModalBody');
  if (!body) return;
  let html = '';
  html += '<div class="tm-cat-title">Mode</div><div class="tm-cat-grid"><button class="tm-style-btn tm-free" data-gen-style="free-mode">Free Mode</button></div>';
  html += '<div class="tm-cat-title">Popular</div><div class="tm-cat-grid">';
  ['cyberpunk','anime','oil-painting','movie-poster','cartoon','watercolor','funko-pop','ghibli','vintage','magazine','figurine','pixel'].forEach(k => {
    html += '<button class="tm-style-btn" data-gen-style="'+k+'">'+STYLE_NAMES[k]+'</button>';
  });
  html += '</div>';
  TEMPLATE_CATS.forEach(cat => {
    html += '<div class="tm-cat-title">'+cat.name+'</div><div class="tm-cat-grid">';
    cat.styles.forEach(k => html += '<button class="tm-style-btn" data-gen-style="'+k+'">'+STYLE_NAMES[k]+'</button>');
    html += '</div>';
  });
  body.innerHTML = html;
  body.querySelectorAll('.tm-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll('.tm-style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectTemplateStyle(btn.dataset.genStyle);
      $('#templateModal').style.display = 'none';
      document.body.style.overflow = '';
    });
  });
}

function openTemplateModal(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  buildTemplateModal();
  const currentKey = selectedStyle || 'free-mode';
  const modal = $('#templateModal');
  modal.querySelectorAll('.tm-style-btn').forEach(b => b.classList.toggle('active', b.dataset.genStyle === currentKey));
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

(function initTemplateModal() {
  const td = $('#templateDisplay'), more = $('#templateMoreBtn'), close = $('#templateModalClose'), modal = $('#templateModal');
  if (td) td.addEventListener('click', openTemplateModal);
  if (more) more.addEventListener('click', openTemplateModal);
  if (close) close.addEventListener('click', () => { modal.style.display = 'none'; document.body.style.overflow = ''; });
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } });
})();

async function callAPI(formData, retries = 15) {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch('/api/generate', { method: 'POST', body: formData });
    const data = await resp.json();
    if (resp.ok) return data;
    const msg = data.error || '';
    if ((msg.includes('queue') || msg.includes('retry') || msg.includes('overload') || msg.includes('memory') || resp.status === 503 || resp.status === 502) && i < retries - 1) {
      const delay = 3000 * (i + 1);
      loadingText.textContent = `Server busy, retrying in ${delay/1000}s...`;
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    throw new Error(msg || 'Generation failed');
  }
  throw new Error('Failed after retries');
}

function formatUserError(err) {
  const raw = String(err?.message || err || '');
  if (raw.includes('overload') || raw.includes('memory') || raw.includes('busy')) {
    return 'AI service is busy right now. Please wait a few seconds and try again.';
  }
  if (raw.includes('content_policy_violation') || raw.includes('Unable to generate this content')) {
    return 'Content blocked by safety filter. Please modify your prompt and try again.';
  }
  if (raw.includes('Failed to fetch') || raw.includes('NetworkError') || raw.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (raw.includes('No image URL') || raw.includes('Generation failed')) {
    return 'Generation failed. Please add more detail to your prompt and try again.';
  }
  return 'Something went wrong. Please try a different prompt and try again.';
}

async function generate() {
  const hasPhoto = uploadedFiles.length > 0;
  const customPrompt = customPromptEl?.value?.trim();
  const hasPrompt = !!customPrompt;
  const hasStyle = selectedStyle && selectedStyle !== 'free-mode';

  if (!hasPhoto && !hasPrompt) return;
  // Template requires an uploaded image
  if (hasStyle && !hasPhoto) {
    errorText.textContent = 'Please upload an image to use a template.';
    errorSection.style.display = '';
    resultSection.style.display = 'none';
    showcaseArea.style.display = 'none';
    return;
  }

  showcaseArea.style.display = 'none';
  loadingSection.style.display = '';
  resultSection.style.display = 'none';
  resultImage.src = '';
  errorSection.style.display = 'none';
  loadingText.textContent = hasPhoto ? 'Transforming your image...' : 'Creating from your prompt...';
  btnGenerate.disabled = true;

  try {
    let finalPrompt;
    if (hasStyle) {
      finalPrompt = stylePrompts[selectedStyle] || selectedStyle;
      if (hasPrompt) finalPrompt = finalPrompt + ', ' + customPrompt;
    } else {
      finalPrompt = customPrompt;
    }

    const formData = new FormData();
    formData.append('prompt', finalPrompt);
    formData.append('ratio', selectedRatio);
    formData.append('res', selectedRes);
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(f => formData.append('image', f));
    }

    const data = await callAPI(formData, 3);
    loadingSection.style.display = 'none';
    resultSection.style.display = '';
    resultImage.src = data.url;

    $('#btnDownload').onclick = () => {
      // Proxy download through our server to avoid CORS issues
      const a = document.createElement('a');
      a.href = `/api/download?url=${encodeURIComponent(data.url)}`;
      a.download = `snapshift-${selectedStyle || 'image'}.png`;
      a.click();
    };

    $('#btnShare').onclick = () => openShare(data.url);
    $('#resultImage').onclick = () => openResultLightbox(data.url);

    $('#btnTryAgain').onclick = () => {
      resultSection.style.display = 'none';
      showcaseArea.style.display = '';
      btnGenerate.disabled = false;
      updateGenBtn();
    };
  } catch (err) {
    loadingSection.style.display = 'none';
    resultSection.style.display = 'none';
    resultImage.src = '';
    errorSection.style.display = '';
    errorText.textContent = formatUserError(err);
    $('#btnErrorRetry').onclick = () => {
      errorSection.style.display = 'none';
      btnGenerate.disabled = false;
      generate();
    };
  }

  btnGenerate.disabled = false;
  updateGenBtn();
}

btnGenerate.addEventListener('click', generate);

// Initialize
updateGenBtn();
customPromptEl.value = '';

// Load prompt from prompts.html
const storedPrompt = localStorage.getItem('snapshift-prompt');
if (storedPrompt) {
  customPromptEl.value = storedPrompt;
  localStorage.removeItem('snapshift-prompt');
  if ($('#advancedPanel').style.display === 'none') {
    $('#advancedToggle').click();
  }
  updateGenBtn();
}

// Load template from templates.html (supports both old name-based and new styleKey-based)
const TEMPLATE_NAME_TO_KEY = {
  'Cyberpunk': 'cyberpunk', 'Anime': 'anime', 'Oil': 'oil-painting',
  'Ghibli': 'ghibli', 'Water': 'watercolor', 'Pixel': 'pixel'
};
const storedTemplateName = localStorage.getItem('snapshift-template');
const storedTemplateKey = localStorage.getItem('snapshift-template-style');
if (storedTemplateName) localStorage.removeItem('snapshift-template');
if (storedTemplateKey) localStorage.removeItem('snapshift-template-style');
const resolvedKey = storedTemplateKey || TEMPLATE_NAME_TO_KEY[storedTemplateName];
if (resolvedKey) {
  const targetThumb = Array.from($$('.gen-thumb')).find(t => t.dataset.genStyle === resolvedKey);
  if (targetThumb) {
    $$('.gen-thumb').forEach(t => t.classList.remove('active'));
    targetThumb.classList.add('active');
    selectedStyle = targetThumb.dataset.genStyle;
    updateGenBtn();
  }
}

// ===== Share modal =====
let currentShareUrl = '';
const shareOverlay = $('#shareOverlay');
const shareClose = $('#shareClose');
const shareTip = $('#shareTip');

function openShare(imageUrl) {
  currentShareUrl = imageUrl;
  shareOverlay.style.display = 'flex';
  shareTip.textContent = '';
  shareTip.classList.remove('success');
}

function closeShare() {
  shareOverlay.style.display = 'none';
}

if (shareClose) shareClose.addEventListener('click', closeShare);
if (shareOverlay) {
  shareOverlay.addEventListener('click', e => {
    if (e.target === shareOverlay) closeShare();
  });
}

$$('#shareOverlay .share-modal-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const platform = btn.dataset.platform;
    const url = encodeURIComponent(currentShareUrl);
    const text = encodeURIComponent('Check out this image I created with SnapShift');

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(currentShareUrl);
        shareTip.textContent = 'Link copied to clipboard!';
        shareTip.classList.add('success');
      } catch (err) {
        shareTip.textContent = 'Copy failed. Please copy the URL manually.';
        shareTip.classList.remove('success');
      }
      return;
    }

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${url}&description=${text}`;
        break;
      case 'reddit':
        shareUrl = `https://www.reddit.com/submit?url=${url}&title=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=620,height=420,scrollbars=yes');
      closeShare();
    }
  });
});

// ===== Result image lightbox =====
const resultLightbox = $('#resultLightbox');
const rlbImg = $('#rlbImg');
const rlbClose = $('#rlbClose');

function openResultLightbox(imageUrl) {
  rlbImg.src = imageUrl;
  resultLightbox.style.display = 'flex';
}

function closeResultLightbox() {
  resultLightbox.style.display = 'none';
  rlbImg.src = '';
}

if (rlbClose) rlbClose.addEventListener('click', closeResultLightbox);
if (resultLightbox) {
  resultLightbox.addEventListener('click', e => {
    if (e.target === resultLightbox || e.target === rlbImg) closeResultLightbox();
  });
}

// Hamburger menu toggle
const hamburger = $('#hamburger');
const navLinks = $('#navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });
}

// Back to top button
const backTop = $('#backTop');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 500);
  });
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Incoming prompt from prompts.html (URL parameter) =====
(function handleIncomingPrompt() {
  const hash = window.location.hash;
  if (!hash.includes('?')) return;
  const queryStart = hash.indexOf('?');
  const params = new URLSearchParams(hash.substring(queryStart + 1));
  const prompt = params.get('prompt');
  if (!prompt) return;
  // Fill custom prompt
  const cp = $('#customPrompt');
  if (cp) {
    cp.value = prompt;
    updateGenBtn();
  }
  // Open advanced panel
  const adv = $('#advancedPanel');
  const tog = $('#advancedToggle');
  if (adv && adv.style.display === 'none' && tog) {
    adv.style.display = 'block';
    if (tog.classList) tog.classList.add('open');
  }
  // Scroll to generator
  const gen = $('#generator');
  if (gen) setTimeout(() => gen.scrollIntoView({ behavior: 'smooth' }), 200);
  // Clean URL
  history.replaceState(null, '', window.location.pathname + '#generator');
})();
