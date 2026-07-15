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
  const isBGRplace = selectedStyle === 'bg-replace';
  const isCosplay = selectedStyle === 'cosplay';
  if (isBGRplace || isCosplay) {
    const label = isBGRplace ? 'background' : 'outfit';
    if (uploadedFiles.length === 0) {
      uploadAdd.querySelector('h3').textContent = `Upload subject + ${label} reference`;
      uploadAdd.querySelector('p').textContent = 'JPG / PNG, need exact 2 photos';
    } else if (uploadedFiles.length === 1) {
      uploadAdd.querySelector('h3').textContent = `Need ${label} photo (2nd)`;
      uploadAdd.querySelector('p').textContent = '1/2 uploaded';
    } else {
      uploadAdd.querySelector('h3').textContent = `${uploadedFiles.length}/2 uploaded`;
      uploadAdd.querySelector('p').textContent = '';
    }
  } else if (uploadedFiles.length > 0) {
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
  // Insert all thumbnails in order first (before async reads) to keep sequence
  uploadedFiles.forEach((file, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'preview-thumb';
    wrap.innerHTML = `<img src="" alt="${file.name}"><button class="preview-remove" data-idx="${idx}" title="Remove">x</button>`;
    previewStack.appendChild(wrap);
  });
  // Then load images asynchronously
  uploadedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = previewStack.querySelectorAll('.preview-thumb')[idx]?.querySelector('img');
      if (img) img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function addFiles(files) {
  if (!files.length) return;
  const remaining = 5 - uploadedFiles.length;
  if (remaining <= 0) return;
  const toAdd = Array.from(files).slice(0, remaining);
  uploadedFiles = [...uploadedFiles, ...toAdd];
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
  if (displayText) displayText.textContent = styleName(styleKey);
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
  const isBGRplace = selectedStyle === 'bg-replace';
  const isCosplay = selectedStyle === 'cosplay';
  const need2Photos = (isBGRplace || isCosplay) && uploadedFiles.length < 2;

  if (need2Photos) {
    btnGenerate.disabled = true;
    btnGenerate.textContent = 'Upload subject + background photos';
  } else if (hasPhoto || hasPrompt) {
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
// Uses NEW template images (samples/templates/) — same source as templates page
const TEMPLATE_FILES = ['3d-polaroid','3d-screen','acrylic-keychain','action-figure','animal-crossing','anime','anime-figure','architecture-model','bg-replace','can-design','cartoon','chibi','chibi-3d','comic-outfit','comic-white','cosplay','crochet-doll','cyberpunk','disney','enamel-pin','figurine','funko-pop','ghibli','gouache','hd-enhance','ice-queen','industrial-design','japanese-illust','lego-minifig','lego-style','line-art','magazine','marker-sketch','movie-poster','oil-painting','overlay','painting-process','palette-swap','pixar','pixel','plush-toy','pose-reference','powerpuff','product-render','realistic','snoopy','subject-extract','van-gogh','vector-illustration','vintage','watercolor','yonkoma'];
// Map filename → human label + lang key
const TEMPLATE_TAGS = {
  '3d-polaroid':['3D Polaroid','tpl3DPolaroid'],'3d-screen':['3D Screen Effect','tpl3DScreenEffect'],
  'acrylic-keychain':['Acrylic Keychain','tplAcrylicKeychain'],'action-figure':['Action Figure','tplActionFigure'],
  'animal-crossing':['Animal Crossing','tplAnimalCrossing'],'anime':['Anime','tplAnime'],
  'anime-figure':['Anime Figure','tplAnimeFigure'],'architecture-model':['Architecture Model','tplArchitectureModel'],
  'bg-replace':['Background Replace','tplBgReplace'],'can-design':['Can Design','tplCanDesign'],
  'cartoon':['Cartoon','tplCartoon'],'chibi':['Chibi','tplChibi'],
  'chibi-3d':['Chibi 3D','tplChibi3D'],'comic-outfit':['Manga Fashion','tplMangaFashion'],
  'comic-white':['Manga Line Art','tplMangaLineArt'],'cosplay':['Cosplay','tplCosplay'],
  'crochet-doll':['Crochet Doll','tplCrochetDoll'],'cyberpunk':['Cyberpunk','tplCyberpunk'],
  'disney':['Disney','tplDisney'],'enamel-pin':['Enamel Pin','tplEnamelPin'],
  'figurine':['Figurine','tplFigurine'],'funko-pop':['Funko Pop','tplFunkoPop'],
  'ghibli':['Ghibli','tplGhibli'],'gouache':['Gouache','tplGouache'],
  'hd-enhance':['HD Enhance','tplHDEnhance'],'ice-queen':['Ice Queen','tplIceQueen'],
  'industrial-design':['Industrial Design','tplIndustrialDesign'],
  'japanese-illust':['Japanese Illustration','tplJapaneseIllust'],
  'lego-minifig':['LEGO Minifig','tplLegoMinifig'],'lego-style':['LEGO Style','tplLegoStyle'],
  'line-art':['Line Art','tplLineArt'],'magazine':['Magazine','tplMagazine'],
  'marker-sketch':['Marker Sketch','tplMarkerSketch'],'movie-poster':['Movie Poster','tplMoviePoster'],
  'oil-painting':['Oil Painting','tplOilPainting'],'overlay':['Art Overlay','tplArtOverlay'],
  'painting-process':['Painting Process','tplPaintingProcess'],
  'palette-swap':['Palette Swap','tplPaletteSwap'],'pixar':['Pixar','tplPixar'],
  'pixel':['Pixel','tplPixel'],'plush-toy':['Plush Toy','tplPlushToy'],
  'pose-reference':['Pose Reference','tplPoseReference'],
  'powerpuff':['Powerpuff','tplPowerpuffGirls'],'product-render':['Product Render','tplProductRender'],
  'realistic':['Hyper-Realistic','tplHyperRealistic'],'snoopy':['Snoopy','tplSnoopy'],
  'subject-extract':['Subject Extraction','tplSubjectExtraction'],
  'van-gogh':['Van Gogh','tplVanGogh'],'vector-illustration':['Vector Illustration','tplVectorIllustration'],
  'vintage':['Vintage','tplVintage'],'watercolor':['Watercolor','tplWatercolor'],
  'yonkoma':['4-Panel Comic','tpl4PanelComic']
};
const showcasePool = TEMPLATE_FILES.map(f => ({
  src: 'samples/templates/' + f + '.png',
  tag: TEMPLATE_TAGS[f][0],
  tagKey: TEMPLATE_TAGS[f][1]
}));
// Shuffle and take 9 random each page load
const showcaseItems = [...showcasePool].sort(() => Math.random() - 0.5).slice(0, 9);

const showcaseGrid = $('#showcaseGrid');
if (showcaseGrid) {
  showcaseItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'sc-item';
    const tagText = window.t ? window.t(item.tagKey) : item.tag;
    div.innerHTML = `<img src="${item.src}" alt="${item.tag}"><span class="sc-tag">${tagText}</span>`;
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


// ===== Prompt Inspiration Strip (400 random → 10 + click lightbox) =====
// Derive short Chinese title from src path category
const CAT_ZH = {'Portrait':'人像','Urban':'都市','Still Life':'静物','Fantasy':'奇幻','Nature':'自然','Food':'美食','Abstract':'抽象','Animal':'动物'};
function shortTitleEn(ex) {
  // Derive short name from prompt title: take first meaningful phrase before comma
  const title = ex.title || '';
  if (!title) return 'Untitled';
  // Take first phrase before comma
  let phrase = title.split(',')[0].trim();
  // Remove trailing "of/at/in/on/with/for/by/and" phrases
  phrase = phrase.replace(/\s+(of|at|in|on|to|for|with|by|and|or)\s+.*$/i, '');
  // Take first 3 words
  let words = phrase.split(/\s+/).slice(0, 3);
  let name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return name;
}
function shortTitleZh(ex) {
  // Chinese: use category + first descriptor from src filename
  if (!ex.src) return '提示词';
  const parts = ex.src.split('/');
  const cat = parts[parts.length - 2];
  const file = parts[parts.length - 1] || '';
  const num = file.match(/^(\d+)/);
  const numStr = num ? num[1] : '';
  return (CAT_ZH[cat] || cat) + (numStr ? ' #' + numStr : '');
}

function initStrip() {
  const track = $('#stripTrack');
  if (!track) return;
  if (typeof window.promptExamples === 'undefined' || !window.promptExamples.length) return;
  // Pick 10 random items with their real indices
  const pool = window.promptExamples.map((ex, idx) => ({ ex, idx }));
  const selected = pool.sort(() => Math.random() - 0.5).slice(0, 10);
  const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const build = (item) => {
    try {
      const ex = item.ex;
      const label = '#' + (item.idx + 1);
      const src = ex.src || '';
      const title = ex.title || '';
      const tags = (ex.tags || []).join(',');
      const prompt = ex.prompt || '';
      return '<div class="pi-item" data-title="'+esc(title)+'" data-tags="'+esc(tags)+'" data-prompt="'+esc(prompt)+'" data-src="'+esc(src)+'" data-idx="'+item.idx+'"><img loading="lazy" src="'+esc(src)+'" alt="'+esc(title)+'"><span class="pi-label">'+label+'</span></div>';
    } catch (e) {
      console.error('build error:', e, item);
      return '<div class="pi-item"><img src="'+item.ex.src+'"><span class="pi-label">#'+(item.idx+1)+'</span></div>';
    }
  };
  let items = '';
  try {
    items = selected.map(build).join('') + selected.map(build).join('');
  } catch (e) {
    console.error('strip map error:', e);
  }
  if (items) {
    track.innerHTML = items;
  } else {
    const fb = selected.map(item => '<div class="pi-item"><img loading="lazy" src="'+(item.ex.src||'')+'"><span class="pi-label">#'+(item.idx+1)+'</span></div>').join('');
    track.innerHTML = fb + fb;
  }
  track.addEventListener('click', e => {
    const item = e.target.closest('.pi-item');
    if (!item) return;
    const img = item.querySelector('img');
    const promptEn = item.dataset.prompt || '';
    const src = item.dataset.src || '';
    // Get Chinese translation from window.promptZh
    let promptZh = '';
    if (src && window.promptZh) {
      const rel = src.replace('prompts-final/prompts-previews/', '');
      promptZh = window.promptZh[rel] || '';
    }
    const useZh = window.getLang && window.getLang() === 'zh';
    const displayPrompt = useZh && promptZh ? promptZh : promptEn;
    const plb = $('#promptLightbox');
    if (!plb) return;
    if ($('#plbImg')) $('#plbImg').src = img.src;
    if ($('#plbTitle')) $('#plbTitle').textContent = item.querySelector('.pi-label')?.textContent || '#';
    if ($('#plbTags')) $('#plbTags').innerHTML = '';
    if ($('#plbPrompt')) $('#plbPrompt').textContent = displayPrompt;
    if ($('#plbUse')) $('#plbUse').onclick = () => {
      plb.style.display = 'none'; document.body.style.overflow = '';
      window.location.href = 'create.html#generator?prompt=' + encodeURIComponent(displayPrompt);
    };
    if ($('#plbCopy')) $('#plbCopy').onclick = async () => {
      try { await navigator.clipboard.writeText(displayPrompt); $('#plbCopy').textContent = 'Copied!'; setTimeout(() => $('#plbCopy').textContent = 'Copy prompt', 1500); }
      catch (err) { $('#plbCopy').textContent = 'Copy failed'; setTimeout(() => $('#plbCopy').textContent = 'Copy prompt', 1500); }
    };
    plb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
}
setTimeout(function() {
  try {
    initStrip();
  } catch (e) {
    console.error('initStrip error:', e);
    const track = $('#stripTrack');
    if (track) {
      // Fallback: show raw data-en prompts
      const fallback = (window.promptExamples || []).slice(0, 10).map(ex =>
        `<div class="pi-item"><img loading="lazy" src="${ex.src}"><span class="pi-label">${ex.title.slice(0, 30)}</span></div>`
      ).join('');
      track.innerHTML = fallback + fallback;
    }
  }
}, 100);

// Re-render strip + showcase on language change
window.addEventListener('langchange', () => {
  initStrip();
  // Re-render showcase grid
  const grid = $('#showcaseGrid');
  if (grid) {
    grid.innerHTML = '';
    [...showcasePool].sort(() => Math.random() - 0.5).slice(0, 9).forEach(item => {
      const div = document.createElement('div');
      div.className = 'sc-item';
      const tagText = window.t ? window.t(item.tagKey) : item.tag;
      div.innerHTML = `<img src="${item.src}" alt="${item.tag}"><span class="sc-tag">${tagText}</span>`;
      grid.appendChild(div);
    });
  }
  // Re-render template modal if open
  if ($('#templateModal') && $('#templateModal').style.display !== 'none') {
    buildTemplateModal();
  }
});

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
  'cyberpunk': 'Transform this photo into a cyberpunk scene. Rain-slicked neon city streets at night, holographic advertisements and glowing neon signs reflecting on wet pavement, volumetric fog and dramatic cinematic lighting. Preserve the original subject\'s face, pose, and key features. Blade Runner-inspired tech noir atmosphere.',
  'anime': 'Convert this photo into high-quality anime art. Vibrant cel shading colors, clean line work. The face, features, hair color, and eye color follow the original subject. Soft beautiful lighting, hand-drawn animation look.',
  'oil-painting': 'Reimagine this photo as a classical oil painting with thick impasto technique, heavy visible brushstrokes, palette knife texture, layered paint, thick pigment buildup, rich oil colors, renaissance fine art quality, dramatic chiaroscuro lighting, museum-worthy masterpiece with tangible paint texture and bold brush marks',
  'movie-poster': 'Transform this photo into a cinematic movie poster with dramatic Hollywood composition. Warm golden hour lighting, volumetric fog, deep depth of field, and realistic film grain texture. Preserve the original subject\'s features and pose. Epic blockbuster film atmosphere with bold cinematic mood.',
  'cartoon': 'Turn this photo into a Pixar-style 3D cartoon. The face, features, and body follow the original subject. Smooth glossy shading, animated movie quality. Keep the original background.',
  'watercolor': 'Transform this photo into a soft watercolor painting. Wet-on-wet technique with transparent pigment washes, visible cold-pressed paper texture, and gentle color bleeding at edges. Preserve the original subject\'s key features and composition. Dreamy artistic atmosphere with natural granulation and soft diffused lighting.',
  'funko-pop': 'Turn this photo into a Funko Pop style collectible figure. The face, body shape, and key features follow the original subject (dog stays dog, person stays person). Glossy vinyl Funko Pop finish with large black circular eyes. Boxed and unboxed versions shown side by side. Keep the original background and lighting.',
  'ghibli': 'Transform this photo into Studio Ghibli animation style. Soft watercolor hand-painted backgrounds, warm nostalgic lighting with gentle rim light, and a dreamy pastel color palette. Preserve the original subject\'s features rendered with soft cel shading and hand-drawn gentle line work. Whimsical, magical atmosphere reminiscent of Hayao Miyazaki films.',
  'vintage': 'Transform this photo into a vintage 1970s film photograph. Warm sepia tones, heavy visible film grain, and slightly faded desaturated colors. Preserve the original subject\'s features and composition. Shot on 35mm analog film aesthetic with soft focus edges and nostalgic retro warmth.',
  'magazine': 'Turn this photo into a magazine cover layout with bold masthead typography overlay and cover-style composition, magazine title text overlay, professional print quality, clean composition',
  'figurine': 'Turn this photo into a detailed 3D collectible figurine. The face, features, and pose follow the original subject. Glossy plastic texture, standing on a small display base. Professional toy product photography.',
  'pixel': 'Transform this photo into 16-bit retro pixel art. Visible pixel grid with crisp square pixels and clean hard edges, limited SNES-era color palette with dithered shading. Preserve the original subject\'s composition and key features. No anti-aliasing, no smooth gradients — authentic pixel game sprite aesthetic.',
  // ===== 3D / Toys (continued) =====
  'anime-figure': 'Turn this photo into an anime style figurine. The face, hair, body, and outfit follow the original subject. Glossy PVC anime figure texture. Keep the original background.',
  'lego-minifig': 'Turn the subject in this photo into a LEGO minifigure. Keep the original background.',
  'lego-style': 'Rebuild this scene entirely from LEGO bricks, blocky geometric construction, visible stud connections on every surface, realistic plastic brick texture, authentic brick-built look',
  'action-figure': 'Turn this photo into a premium action figure with articulated joints. The face, hair, skin color, outfit, and pose follow the original subject. Keep the original background.',
  'chibi-3d': 'Turn this photo into a cute chibi-style 3D figure. Oversized round head, tiny body proportions. The face and features follow the original subject. Glossy smooth shading, vibrant playful colors.',
  '3d-polaroid': 'A Polaroid photo held in a hand. The subject is stepping out of the Polaroid frame, breaking through the two-dimensional photo border into the real 3D space.',
  'plush-toy': 'Turn this photo into an adorable plush stuffed toy. Soft fuzzy fabric texture, stitched seam details. The face and features follow the original subject. Warm toy store photography.',
  'crochet-doll': 'Turn this photo into a handmade crochet yarn doll. Visible knitted stitch texture, soft wool appearance. The face and features follow the original subject. Cozy handmade quality.',
  'acrylic-keychain': 'Turn this photo into a cute acrylic keychain charm. Transparent printed plastic with metal keyring attached. The face and features follow the original subject. Glossy flat surface, trendy accessory mockup style.',
  'enamel-pin': 'Transform this subject into a collectible enamel pin badge, polished metal edges with vibrant colored enamel fill, shiny metallic finish, flat-lay product photography',
  'cosplay': 'Transform the person in the first photo by replacing their costume with the outfit from the second reference photo. Preserve the original face, body, pose, and background from the first photo. Match the new outfit\'s color palette, fabric texture, and fit to the reference. Professional cosplay photography quality with natural blending.',
  // ===== Anime / Cartoon =====
  'pixar': 'Transform this photo into Pixar-inspired 3D animation style. Smooth cartoon rendering with soft subsurface scattering on skin, warm cinematic lighting, and expressive character design. Preserve the original subject\'s facial features, hair color, and proportions. Ambient occlusion grounding shadows, shallow depth of field with film-quality bokeh.',
  'disney': 'Transform this photo into classic Disney hand-drawn animation style from the mid-20th century golden age. Soft watercolor-painted backgrounds, gentle color gradients with subtle cel shading, and large expressive eyes with glossy highlights. Preserve the original subject\'s key features and pose. Magical fairy-tale atmosphere with nostalgic storybook warmth and hand-inked clean outlines.',
  'snoopy': 'Transform this photo into Charles Schulz Peanuts comic strip style. Simple hand-drawn black ink line art with slightly wobbly outlines, dot eyes, and extremely minimal facial features. Preserve the original subject\'s recognizable hair and outfit colors rendered as flat solid fills. Selective spot color on a clean pastel background, nostalgic 1960s newspaper comic aesthetic.',
  'chibi': 'Turn this photo into super-deformed chibi art. Extremely oversized head on tiny body. The face and features follow the original subject. Simplified cute features, kawaii manga aesthetic.',
  'powerpuff': 'Transform this photo into Powerpuff Girls cartoon style. Ultra-simplified design with flat bold colors, thick black outlines, oversized round head with enormous expressive eyes, and compact limbless body. Preserve the original subject\'s hair color and style. No gradients or realistic shading — authentic late-1990s Cartoon Network aesthetic with minimal geometric shapes.',
  'japanese-illust': 'Convert this photo into a modern Japanese kawaii illustration, simple clean line art, flat pastel color palette, cute minimalist character design, trendy vector art style',
  'animal-crossing': 'Transform this photo into Animal Crossing: New Horizons game art style. Rounded soft 3D character with a large head, expressive simple eyes, and cozy pastel color palette. Preserve the original subject\'s hairstyle, skin tone, and outfit colors rendered in cute simplified patterns. Soft-edged 3D render with minimal shadows, charming Nintendo village aesthetic in a cheerful outdoor setting.',
  // ===== Art / Painting =====
  'gouache': 'Turn this photo into a gouache painting, opaque matte finish with rich flat colors, visible brush strokes, thick pigment texture. The face, features, and pose follow the original subject.',
  'van-gogh': 'Transform this photo into a Vincent van Gogh post-impressionist oil painting. Thick swirling impasto brushstrokes with visible palette knife texture, vibrant complementary colors of yellow against blue, and expressive broken-color technique. Preserve the original subject\'s key features and composition. Museum-quality fine art with dynamic, emotionally charged brushwork.',
  'marker-sketch': 'Transform this photo into an alcohol marker fashion illustration. Bold expressive strokes with visible marker texture and slight color overlap at edges, confident loose black ink contour lines, and flat vibrant marker fills. Preserve the original subject\'s facial structure, hairstyle, and pose. Clean white paper background, editorial fashion sketch aesthetic with organic hand-drawn imperfections.',
  'palette-swap': 'Recolor this photo using a dramatically different color palette while keeping the composition, subject, and layout exactly unchanged. Apply an artistic color grading transformation that shifts the overall color temperature and mood. Preserve the original subject\'s features, shapes, and proportions — only the color scheme changes. Creative cinematic color reinterpretation.',
  'painting-process': 'Show this subject as a 4-panel painting process progression arranged in sequential order. First panel: rough sketch, second panel: clean line art, third panel: flat color blocking, fourth panel: final polished render. Preserve the original subject\'s features consistently across all four panels. Clean white background, art tutorial style showcase.',
  // ===== Comic / Line Art =====
  'comic-outfit': 'Turn this subject into a shojo manga fashion illustration, cute outfit showcase with Japanese comic panel layout, screentone dot shading, elegant manga aesthetic, fashion magazine style',
  'comic-white': 'Transform this photo into clean black-and-white manga line art on a pure white background. Crisp black ink outlines with varied line weights, professional screentone dot shading, and dramatic hatching for shadows. Preserve the original subject\'s facial features, hairstyle, and pose. Traditional Japanese comic illustration style — monochrome grayscale only, no colors.',
  'yonkoma': 'Transform this scene into a four-panel yonkoma manga comic strip with sequential storytelling panels stacked vertically. Each panel contains simple expressive characters with dialogue bubbles and clean spacing between panels. Preserve the original subject\'s recognizable features across all panels. Humorous slice-of-life manga format with authentic Japanese comic strip layout and screentone shading.',
  'line-art': 'Convert this photo into precise professional line art, clean black ink outlines on white, detailed illustration work, crisp vector-quality precision, elegant minimal style',
  'vector-illustration': 'Transform this photo into a flat vector illustration with clean geometric shapes, bold solid color fills, and smooth gradient transitions. Minimalist modern graphic design aesthetic with no shadows and crisp vector lines. Preserve the original subject\'s composition and key features rendered in simplified geometric forms. Contemporary digital art with a clean, professional finish.',
  // ===== Photo / Realistic =====
  'realistic': 'Enhance this photo to hyper-realistic quality. Reconstruct fine micro-texture details — visible skin pores, individual hair strands, fabric weave, and surface grain. Preserve the original subject\'s exact facial features, identity, and composition. True-to-life natural rendering with balanced dynamic range, professional photography quality, and 8K ultra-sharp clarity.',
  'hd-enhance': 'Apply super-resolution enhancement to this photo. Upscale to 4K ultra-crisp clarity while strictly preserving the original subject\'s identity, composition, and colors. Refine micro-details — skin texture, fine lines, and edge definition. Reduce noise and compression artifacts naturally. Professional photo retouch quality with pristine polished finish and razor-sharp focus.',
  'pose-reference': 'Create a professional character reference sheet from this subject. Arrange multiple angle views — front, side profile, and back — on a clean neutral gray background with consistent even lighting. Preserve the subject\'s exact facial features, hair, outfit, and proportions identically across all views. Professional turnaround layout with clean panel separation and flat lighting, no dramatic shadows.',
  'subject-extract': 'Cleanly isolate the main subject from this photo on a perfectly transparent background. Preserve fine edge details including hair strands, fabric edges, and soft natural boundaries with anti-aliased blending. No white halo, no fringing, no leftover background fragments. Keep the subject\'s original lighting, colors, and proportions exactly intact. Professional compositing-ready PNG-style cutout with sharp precise edges.',
  // ===== Design / Product =====
  'architecture-model': 'Transform this subject into a detailed architectural scale model. Realistic miniature construction with foam board walls, balsa wood structural elements, and tiny proportional details. Preserve the original subject\'s layout and form translated into model-making materials. Professional museum-quality presentation maquette with miniature vegetation and clean craftsmanship, photographed with tilt-shift miniature perspective.',
  'product-render': 'Transform this subject into premium e-commerce product photography. Pure white seamless studio background with soft diffused commercial lighting and a subtle natural contact shadow beneath. Preserve the original subject\'s shape, texture, and design exactly. Professional catalog quality — sharp focus on product details, 8K resolution, clean commercial presentation ready for online storefront listing.',
  'can-design': 'Render this design onto a realistic aluminum beverage can with accurate cylindrical label wrap. Glossy metallic finish with bright specular highlights, vibrant printed label graphics, and realistic condensation droplets on the cold metal surface. Preserve the original design elements and text clearly. Clean studio lighting, commercial product mockup quality with subtle planar reflections.',
  'industrial-design': 'Recreate this as a professional industrial design concept rendering. Clean studio backdrop with three-point studio lighting, showcasing sophisticated semi-matte and glossy material finishes. Preserve the original subject\'s form, proportions, and design intent. Premium 3D product visualization quality with precise surface detail, smooth geometry transitions, and accurate material representation.',
  '3d-screen': 'Create a dramatic 3D screen breakout effect — the subject extends beyond the digital display boundary into real space with aggressive perspective depth. Holographic transparent glass overlay with realistic screen cracks, glowing digital pixel particles, and shattered glass fragments radiating outward. Preserve the original subject\'s face and key features. Augmented reality sci-fi UI elements frame the composition with cinematic lighting and lens effects.',
  // ===== Other =====
  'ice-queen': 'Transform this photo into an ethereal ice queen character. Delicate crystalline frost patterns across the skin, shimmering ice textures, and piercing crystal-blue accents with cool blue cinematic color grading. Preserve the original subject\'s facial structure, features, and pose exactly. Dramatic cold-toned lighting with soft diffuse key light and icy rim highlights, dark frozen atmosphere background, fantasy realism style.',
  'bg-replace': 'Seamlessly replace the background of this photo with a natural complementary environment. Keep the original subject perfectly intact — exact pose, lighting direction on the subject, and fine edge details preserved. Match the new background\'s lighting color temperature, shadow direction, and depth of field to the subject for realistic integration. Professional compositing quality with coherent environment blending and natural perspective match.',
  'overlay': 'Enhance this photo with playful artistic illustration overlays. Add hand-drawn doodles, creative mixed-media accents, and decorative scribble elements that interact with and frame the subject — such as outlined gestures, whimsical arrows, and contextual hand-drawn annotations. Preserve the original subject and composition completely intact underneath. Vibrant marker and crayon textures, editorial art style with expressive sketchy charm.'
};

// Per-template img2img strength (default: 0.85)
const styleStrengths = {
  '3d-polaroid': 0.65
};

// ===== Style display names (lang keys) =====
const STYLE_LANG = {'free-mode':'freeMode','cyberpunk':'tplCyberpunk','anime':'tplAnime','oil-painting':'tplOilPainting','movie-poster':'tplMoviePoster','cartoon':'tpl3DCartoon','watercolor':'tplWatercolor','funko-pop':'tplFunkoPop','ghibli':'tplGhibli','vintage':'tplVintage','magazine':'tplMagazineCover','figurine':'tplFigurine','pixel':'tplPixelArt','anime-figure':'tplAnimeFigure','lego-minifig':'tplLegoMinifig','lego-style':'tplLegoStyle','action-figure':'tplActionFigure','chibi-3d':'tplChibi3D','3d-polaroid':'tpl3DPolaroid','plush-toy':'tplPlushToy','crochet-doll':'tplCrochetDoll','acrylic-keychain':'tplAcrylicKeychain','enamel-pin':'tplEnamelPin','cosplay':'tplCosplay','pixar':'tplPixar','disney':'tplDisney','snoopy':'tplSnoopy','chibi':'tplChibi','powerpuff':'tplPowerpuffGirls','japanese-illust':'tplJapaneseIllust','animal-crossing':'tplAnimalCrossing','gouache':'tplGouache','van-gogh':'tplVanGogh','marker-sketch':'tplMarkerSketch','palette-swap':'tplPaletteSwap','painting-process':'tplPaintingProcess','comic-outfit':'tplMangaFashion','comic-white':'tplMangaLineArt','yonkoma':'tplYonkoma','line-art':'tplLineArt','vector-illustration':'tplVectorIllustration','realistic':'tplHyperRealistic','hd-enhance':'tplHDEnhance','pose-reference':'tplPoseReference','subject-extract':'tplSubjectExtraction','ice-queen':'tplIceQueen','architecture-model':'tplArchitectureModel','product-render':'tplProductRender','can-design':'tplCanDesign','industrial-design':'tplIndustrialDesign','3d-screen':'tpl3DScreenEffect','bg-replace':'tplBgReplace','overlay':'tplArtOverlay'};
const styleName = (k) => window.t ? window.t(STYLE_LANG[k] || k) : (STYLE_LANG[k] || k);

// ===== Template Selection Modal =====
const TEMPLATE_CATS = [
  {langKey:'cat3dToys', styles:['anime-figure','lego-minifig','lego-style','action-figure','chibi-3d','3d-polaroid','plush-toy','crochet-doll','acrylic-keychain','enamel-pin','cosplay']},
  {langKey:'catAnime', styles:['pixar','disney','snoopy','chibi','powerpuff','japanese-illust','animal-crossing']},
  {langKey:'catArt', styles:['gouache','van-gogh','marker-sketch','palette-swap','painting-process']},
  {langKey:'catComic', styles:['comic-outfit','comic-white','yonkoma','line-art','vector-illustration']},
  {langKey:'catPhoto', styles:['realistic','hd-enhance','pose-reference','subject-extract']},
  {langKey:'catDesign', styles:['architecture-model','product-render','can-design','industrial-design','3d-screen']},
  {langKey:'catOther', styles:['ice-queen','bg-replace','overlay']}
];

function buildTemplateModal() {
  const body = $('#templateModalBody');
  if (!body) return;
  let html = '';
  html += '<div class="tm-cat-title">' + window.t('mode') + '</div><div class="tm-cat-grid"><button class="tm-style-btn tm-free" data-gen-style="free-mode">' + window.t('freeMode') + '</button></div>';
  html += '<div class="tm-cat-title">' + window.t('popular') + '</div><div class="tm-cat-grid">';
  ['cyberpunk','anime','oil-painting','movie-poster','cartoon','watercolor','funko-pop','ghibli','vintage','magazine','figurine','pixel'].forEach(k => {
    html += '<button class="tm-style-btn" data-gen-style="'+k+'">'+styleName(k)+'</button>';
  });
  html += '</div>';
  TEMPLATE_CATS.forEach(cat => {
    html += '<div class="tm-cat-title">' + window.t(cat.langKey) + '</div><div class="tm-cat-grid">';
    cat.styles.forEach(k => html += '<button class="tm-style-btn" data-gen-style="'+k+'">'+styleName(k)+'</button>');
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
    formData.append('strength', styleStrengths[selectedStyle] || 0.85);
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
