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
    const templateName = card.querySelector('h3')?.textContent;
    document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
    const targetThumb = Array.from($$('.gen-thumb')).find(t => t.textContent.trim() === templateName?.trim());
    if (targetThumb) {
      $$('.gen-thumb').forEach(t => t.classList.remove('active'));
      targetThumb.classList.add('active');
      selectedStyle = targetThumb.dataset.genStyle;
      updateGenBtn();
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

  $$('.pi-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.dataset.title;
      const tags = item.dataset.tags;
      const prompt = item.dataset.prompt;
      $('#plbImg').src = img.src;
      $('#plbTitle').textContent = title;
      $('#plbTags').innerHTML = tags.split(',').map(t => `<span class="plb-tag">${t.trim()}</span>`).join('');
      $('#plbPrompt').textContent = prompt;
      $('#plbUse').onclick = () => {
        const cp = $('#customPrompt');
        cp.value = prompt;
        cp.scrollIntoView({ behavior: 'smooth' });
        if ($('#advancedPanel').style.display === 'none') {
          $('#advancedToggle').click();
        }
        promptLightbox.style.display = 'none';
        document.body.style.overflow = '';
        updateGenBtn();
      };
      $('#plbCopy').onclick = async () => {
        try {
          await navigator.clipboard.writeText(prompt);
          $('#plbCopy').textContent = 'Copied!';
          setTimeout(() => $('#plbCopy').textContent = 'Copy prompt', 1500);
        } catch (err) {
          $('#plbCopy').textContent = 'Copy failed';
          setTimeout(() => $('#plbCopy').textContent = 'Copy prompt', 1500);
        }
      };
      promptLightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });
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
$$('.gen-thumb').forEach(b => {
  b.addEventListener('click', () => {
    $$('.gen-thumb').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    selectedStyle = b.dataset.genStyle;
    updateGenBtn();
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
  { title: 'Corporate Portrait', src: 'prompts-previews/Portrait/001-corporate.png', tags: ['portrait', 'business'], prompt: 'Professional headshot of confident businesswoman in her 30s, navy blazer, genuine smile, white background, studio lighting, shot on Canon 85mm f/1.4, sharp focus, 8k' },
  { title: 'Cyberpunk Night', src: 'prompts-previews/Urban/001-cyberpunk.png', tags: ['cyberpunk', 'city'], prompt: 'Futuristic cyberpunk city at night, neon signs in Japanese, rain-soaked streets reflecting lights, flying cars, people with umbrellas, Blade Runner style, cinematic, 8k' },
  { title: 'Luxury Product', src: 'prompts-previews/Still Life/001-luxury.png', tags: ['product', 'luxury'], prompt: 'Swiss luxury watch close-up, polished steel, blue dial, black leather strap, dramatic studio lighting with reflections, product photography, commercial quality, premium, 8k' },
  { title: 'Ghibli Countryside', src: 'prompts-previews/Fantasy/001-ghibli.png', tags: ['ghibli', 'anime'], prompt: 'Pastoral countryside in Studio Ghibli animation style, rolling green hills dotted with wildflowers, a small stone cottage with smoke rising, a massive ancient oak tree, clear summer sky with fluffy clouds, hand-painted quality, warm afternoon light' },
  { title: 'Epic Landscape', src: 'prompts-previews/Nature/001-landscape.png', tags: ['landscape', 'nature'], prompt: 'Snow-capped mountain range at sunrise, orange and pink clouds, alpine meadow with wildflowers, lake reflection, wide-angle landscape, National Geographic quality, 8k' },
  { title: 'Food Photography', src: 'prompts-previews/Food/001-pancake-stack-syrup-waterfall-kayakers.png', tags: ['food', 'photography'], prompt: 'Gourmet burger with stacked ingredients, sesame bun, lettuce, tomato, melted cheddar, juicy beef, professional food photography, appetizing, dramatic lighting, menu quality, 8k' },
  { title: 'Epic Fantasy Dragon', src: 'prompts-previews/Fantasy/002-dragon.png', tags: ['fantasy', 'dragon'], prompt: 'Majestic dragon on mountain peak, iridescent scales, wings spread wide, medieval castle in valley, storm clouds, epic fantasy art, highly detailed, concept art, dramatic lighting, 8k' },
  { title: 'Magical Forest', src: 'prompts-previews/Nature/002-forest.png', tags: ['nature', 'magical'], prompt: 'Ancient forest with morning mist, sun rays through trees creating god rays, moss-covered ground, ferns, magical atmosphere, fantasy landscape, cinematic, detailed, 8k' },
  { title: 'Cyberpunk Anime', src: 'prompts-previews/Fantasy/009-cyberanime.png', tags: ['anime', 'cyberpunk'], prompt: 'Anime portrait of a young woman with neon pink twin-tail hair, visor reflecting neon cityscape, cyberpunk jacket with LED strip accents, dramatic neon lighting, manga-style portrait composition, MAPPA studio production quality' },
  { title: '1970s Film Portrait', src: 'prompts-previews/Portrait/002-1970s.png', tags: ['retro', 'film'], prompt: '1970s film photography portrait of a woman in her late 20s, feathered layered Farrah Fawcett-era hair, patterned wrap dress, soft warm backlight, very heavy film grain, faded analog color palette, Kodak Ektar film simulation' },
  { title: 'Floating Castle', src: 'prompts-previews/prompt-11-castle.png', tags: ['fantasy', 'concept'], prompt: 'Cinematic concept art of a massive floating castle above a sea of clouds, waterfalls cascading off the edges into the void below, gothic spires with warm glowing windows, storm clouds with lightning, wide-angle establishing shot, epic fantasy' },
  { title: 'VHS Glitch Art', src: 'prompts-previews/Abstract/001-vhs.png', tags: ['retro', 'glitch'], prompt: 'VHS glitch aesthetic portrait, subject with voluminous 80s hair and bold makeup, horizontal scan line distortion across image, color channel bleeding on right edge, white timestamp overlay in bottom-left, heavy digital noise and static texture, retro aesthetic' },
  { title: 'Lost Atlantis', src: 'prompts-previews/prompt-13-atlantis.png', tags: ['fantasy', 'underwater'], prompt: 'Ancient city ruins underwater, coral-covered architecture, tropical fish swimming through columns, sun rays penetrating blue water, lost Atlantis aesthetic, fantasy scene, atmospheric, highly detailed, 8k' },
  { title: 'Abstract Fluid Art', src: 'prompts-previews/Abstract/002-abstract.png', tags: ['abstract', 'art'], prompt: 'Abstract fluid art, swirling marble texture, navy blue, gold and white, organic flowing patterns, luxury aesthetic, digital art, high resolution, mesmerizing, elegant, 8k' },
  { title: 'Documentary Portrait', src: 'prompts-previews/Portrait/003-documentary.png', tags: ['portrait', 'documentary'], prompt: 'Close-up portrait of weathered fisherman in his 60s, grey beard, deep blue eyes, yellow rain jacket, ocean in background, overcast lighting, documentary style, photorealistic, highly detailed, 8k' },
  { title: 'Alien Moon', src: 'prompts-previews/prompt-16-alien.png', tags: ['scifi', 'space'], prompt: 'Sci-fi concept art of an alien moon surface with two suns setting on horizon casting double shadows, bioluminescent purple plant life in foreground, silhouette of astronaut in EVA suit at center frame, cinematic ultra-wide, James Cameron-quality VFX concept art' }
];

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
  'cyberpunk': 'cyberpunk style, neon city night background, glowing lights, tech noir aesthetic, same person, dramatic cinematic lighting, futuristic vibe',
  'anime': 'anime style, vibrant colors, clean line art, cel shading, expressive eyes, beautiful lighting, hand drawn look',
  'oil-painting': 'classical oil painting, renaissance fine art, visible brushstrokes, rich colors, dramatic chiaroscuro lighting, museum quality',
  'movie-poster': 'cinematic movie poster, dramatic hollywood style, warm lighting, epic composition, film grain, no text',
  'cartoon': '3D cartoon character, stylized animation, smooth shading, big expressive eyes, glossy look, playful design',
  'watercolor': 'watercolor painting, soft flowing pigments, delicate washes, artistic illustration, paper texture, dreamy background',
  'funko-pop': 'Funko Pop style collectible figure, vinyl toy texture, big head small body, glossy finish, toy packaging background',
  'ghibli': 'Studio Ghibli anime style, soft whimsical colors, magical scene, gentle lighting, hand drawn animated beauty',
  'vintage': 'vintage retro style, warm sepia tones, film grain, 1970s aesthetic, nostalgic feel, soft contrast',
  'magazine': 'fashion magazine cover, Vogue editorial style, bold layout, high fashion, clean studio lighting, elegant',
  'figurine': '3D figurine collectible toy, plastic texture, glossy finish, standing on a small base, toy photography',
  'pixel': 'retro pixel art, 8-bit style, limited color palette, crisp square pixels, dithered shading, game sprite aesthetic',
  'anime-figure': 'anime character figurine, Japanese style figure, colorful hair, sparkling eyes, cute pose, toy display box, glossy PVC texture',
  'lego-minifig': 'LEGO minifigure style, blocky square body and head, cylindrical hands, printed face, plastic toy texture, classic yellow skin tone',
  'lego-style': 'built from LEGO bricks, blocky geometric shapes, visible studs and connections, plastic brick texture, realistic brick-built construction',
  'action-figure': 'action figure in blister packaging, posable joints, realistic sculpt, cardboard backing with graphics, collectible toy photography',
  'chibi-3d': 'chibi style 3D character, oversized head tiny body, cute proportions, glossy smooth shading, vibrant colors, adorable pose',
  '3d-polaroid': '3D pop-out Polaroid photo effect, subject breaking out of photo frame, floating 3D element, instant film border, creative dimensional shot',
  'plush-toy': 'cute plush stuffed toy, soft fuzzy fabric texture, stitched details, button eyes, adorable huggable design, plush toy photography',
  'crochet-doll': 'handmade crochet doll, yarn texture, knitted stitches visible, soft wool appearance, cozy handmade craft feel',
  'acrylic-keychain': 'acrylic keychain design, transparent plastic with printed image, metal keyring attached, cute flat charm style, glossy finish',
  'enamel-pin': 'enamel pin badge, metal edges with colored enamel fill, shiny pin back, collectible pin design, flat lay photography',
  'cosplay': 'realistic cosplay transformation, same person in detailed costume, convention photography, accurate character recreation, professional cosplay shoot',
  'pixar': 'Pixar animation style, 3D cartoon rendering, smooth subsurface scattering, expressive characters, warm cinematic lighting, Disney quality',
  'disney': 'Disney animation style, classic hand-drawn quality, soft shading, expressive features, magical atmosphere, Disney character design',
  'snoopy': 'Peanuts comic style, Charles Schulz art, simple line drawing, black and white with spot color, nostalgic newspaper comic feel',
  'chibi': 'chibi art style, super deformed proportions, tiny body big head, cute simplified features, kawaii aesthetic, colorful and playful',
  'powerpuff': 'Powerpuff Girls cartoon style, flat bold colors, thick outlines, simple geometric shapes, retro Cartoon Network aesthetic',
  'japanese-illust': 'Japanese minimal illustration, simple clean lines, flat colors, cute character design, modern kawaii vector art style',
  'animal-crossing': 'Animal Crossing game style, rounded soft 3D, cute animal villagers, pastel colors, cozy island vibe, Nintendo aesthetic',
  // ===== Paintings =====
  'gouache': 'gouache painting, opaque matte finish, rich flat colors, visible brush strokes, thick pigment texture, illustration art quality',
  'van-gogh': 'Van Gogh painting style, thick impasto oil strokes, swirling brushwork, vibrant complementary colors, post-impressionist masterpiece',
  'marker-sketch': 'marker pen sketch, bold colorful strokes, sketchy line work, artistic rendering, fashion illustration feel, creative hand drawn style',
  'palette-swap': 'color palette transformation, same composition different color scheme, artistic color grading, mood shift through color, creative recolor',
  'painting-process': 'four-panel painting process showcase, sketch to line art to flat color to final render, art progression steps, creative workflow display',
  // ===== Comic / Line Art =====
  'comic-outfit': 'manga comic style, cute girl fashion outfit showcase, Japanese comic panel layout, screentone dots, shojo manga aesthetic',
  'comic-white': 'manga line art on white background, clean black outlines, screentone shading, manga panel composition, Japanese comic style',
  'yonkoma': 'four-panel comic strip, yonkoma manga format, sequential storytelling, simple expressions, humorous manga style with dialogue bubbles',
  'line-art': 'clean line art drawing, black outlines on white, detailed ink work, professional illustration, crisp vector-like precision',
  'vector-illustration': 'flat vector illustration style, clean geometric shapes, smooth gradients, minimalist modern design, digital art aesthetic',
  // ===== Realistic =====
  'realistic': 'hyper-realistic style, photorealistic detail, natural skin texture, true-to-life rendering, professional portrait quality, 8K sharp',
  'hd-enhance': 'super resolution enhancement, ultra sharp detail, refined texture clarity, professional retouch quality, 4K upscale, pristine finish',
  'pose-reference': 'dynamic pose reference sheet, multiple angle views, figure drawing reference, clean neutral background, anatomical study quality',
  'subject-extract': 'clean subject isolation, perfect cutout on transparent background, sharp edges, professional product photography, studio quality extraction',
  'makeup-analysis': 'makeup breakdown visualization, before and after comparison, cosmetic product mapping, beauty editorial style, professional MUA reference',
  // ===== Sci-Fi / Stylized =====
  'ice-queen': 'ice queen aesthetic, frost and crystal details, cool blue tones, elegant cold beauty, sharp refined features, ethereal frozen atmosphere',
  // ===== Design / Product =====
  'architecture-model': 'architectural scale model, miniature building with realistic materials, foam board and balsa wood texture, professional presentation quality',
  'product-render': 'product photography, commercial studio lighting, clean white background, professional e-commerce quality, sharp focus 8K',
  'can-design': 'aluminum can packaging design, metallic finish with printed label, beverage product mockup, realistic condensation droplets, commercial quality',
  'industrial-design': 'industrial design rendering, clean studio backdrop, professional product visualization, matte and glossy material finish, concept design quality',
  '3d-screen': '3D screen effect, subject popping out of digital display, holographic glass overlay, futuristic UI elements, augmented reality style',
  // ===== Utilities =====
  'bg-replace': 'background replacement, cleanly separated subject placed in new environment, seamless blending, matching lighting and shadows, professional compositing',
  'overlay': 'artistic element overlay, decorative illustrations added around subject, creative mixed media, hand drawn accents over photo, editorial art style'
};

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

// Load template from templates.html
const storedTemplate = localStorage.getItem('snapshift-template');
if (storedTemplate) {
  localStorage.removeItem('snapshift-template');
  const targetThumb = Array.from($$('.gen-thumb')).find(t => t.textContent.trim() === storedTemplate.trim());
  if (targetThumb) {
    $$('.gen-thumb').forEach(t => t.classList.remove('active'));
    targetThumb.classList.add('active');
    selectedStyle = targetThumb.dataset.genStyle;
    document.querySelector('#generator').scrollIntoView({ behavior: 'smooth' });
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
