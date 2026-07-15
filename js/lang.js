// SnapShift i18n — bilingual EN/ZH
(function () {
  const LANG = {
    en: {
      home: 'Home',
      templates: 'Templates',
      create: 'Create',
      prompts: 'Prompts',
      howItWorks: 'How It Works',
      faq: 'FAQ',
      freeBetaTag: '🎁 Free Beta',
      heroTitle: 'Transform any photo.',
      heroTitle2: 'AI templates.',
      heroDesc: 'Not just another filter. Turn portraits into movie posters, pets into oil paintings, city shots into anime \u2014 all in seconds.',
      tryFree: 'Try SnapShift Free',
      browseTemplates: 'Browse Templates',
      statsTemplates: '🎭 Templates',
      statsQuality: '🖼️ 1K & 2K Quality',
      statsInstant: '⚡ Instant Generation',
      promptInspire: 'Prompt inspiration',
      morePrompts: 'More prompts \u2192',
      aiTemplates: 'AI Templates',
      aiTemplatesDesc: 'Pick a template, upload your photo, and transform it instantly.',
      moreTemplates: 'More Templates \u2192',
      seeDifference: 'See the difference.',
      dragSlider: 'Drag the slider to compare.',
      readyCreate: 'Ready to create?',
      readyCreateDesc: 'Upload a photo, pick from AI templates, and transform it instantly \u2014 all on one page.',
      startCreating: 'Start Creating \u2192',
      readyTransform: 'Ready to transform your photos?',
      readyTransformDesc: 'All templates, 1K & 2K quality, completely free in Beta.',
      howSection: 'How SnapShift Works',
      how1Title: 'Upload your photo',
      how1Desc: 'Drag & drop or click to upload. JPG and PNG supported, up to 5 photos.',
      how2Title: 'Pick a template',
      how2Desc: 'Choose from 50+ AI styles \u2014 cyberpunk, anime, oil painting, 3D toys, and more.',
      how3Title: 'Generate & download',
      how3Desc: 'One click transforms your photo. Download in 1K or 2K quality.',
      faq1: 'Is SnapShift free?',
      faq1a: 'Yes \u2014 completely free during Beta. All templates, 1K & 2K included.',
      faq2: 'Do I need an account?',
      faq2a: 'No account required. Just upload a photo and start transforming.',
      faq3: 'How long does it take?',
      faq3a: 'Most generations take 10-30 seconds depending on resolution.',
      faq4: 'Can I use the images commercially?',
      faq4a: 'Yes. All images you generate belong to you.',
      footerCopyright: '© 2026 SnapShift. All rights reserved.',
      createTitle: 'Create your transformation',
      createDesc: 'Upload a photo, pick a template, get the result in seconds.',
      uploadHere: 'Drop or click to upload',
      uploadHint: 'JPG / PNG, up to 5 photos',
      addMore: 'Click to add more photos',
      genNoPhoto: 'Generate without photo',
      aspectRatio: 'Aspect Ratio',
      resolution: 'Resolution',
      template: 'Template',
      freeMode: 'Free Mode',
      more: 'More +',
      advancedOptions: 'Advanced Options',
      customPrompt: 'Custom Prompt',
      promptInspireLink: 'Need inspiration? Try example prompts',
      customPromptPlaceholder: 'Add details to refine the template...',
      genBtn: 'Enter a prompt or select a template',
      featuredTransformations: 'Featured transformations',
      transforming: 'Transforming your image...',
      download: 'Download',
      share: 'Share',
      tryAnother: 'Try Another',
      need2Photos: 'Upload subject + background photos',
      uploadSubjectBg: 'Upload subject (1st) + background (2nd)',
      needBgPhoto: 'Need background photo (2nd)',
      uploadSubjectOutfit: 'Upload subject + outfit reference',
      needOutfitPhoto: 'Need outfit photo (2nd)',
      backTop: '\u2191',
      before: 'Before',
      after: 'After',
      promptLibrary: 'Prompt Library',
    },
    zh: {
      home: '首页',
      templates: '模板',
      create: '创作',
      prompts: '提示词',
      howItWorks: '使用教程',
      faq: '常见问题',
      freeBetaTag: '🎁 免费公测',
      heroTitle: '照片变艺术。',
      heroTitle2: 'AI 模板一键。',
      heroDesc: '不只是滤镜。把你的头像变成电影海报，把宠物变成油画，把城市街拍变成动漫——几秒钟搞定。',
      tryFree: '免费试用 SnapShift',
      browseTemplates: '浏览模板',
      statsTemplates: '🎭 模板',
      statsQuality: '🖼️ 1K 和 2K 画质',
      statsInstant: '⚡ 即时生成',
      promptInspire: '提示词灵感',
      morePrompts: '更多提示词 →',
      aiTemplates: 'AI 模板',
      aiTemplatesDesc: '选一个模板，上传你的照片，立刻转换。',
      moreTemplates: '更多模板 →',
      seeDifference: '看看效果。',
      dragSlider: '拖滑块对比。',
      readyCreate: '准备好了吗？',
      readyCreateDesc: '上传照片，选 AI 模板，一键转换——全在一页搞定。',
      startCreating: '开始创作 →',
      readyTransform: '准备转换你的照片吗？',
      readyTransformDesc: '所有模板、1K 和 2K 画质，公测期间完全免费。',
      howSection: '如何使用 SnapShift',
      how1Title: '上传照片',
      how1Desc: '拖拽或点击上传。支持 JPG 和 PNG，最多 5 张。',
      how2Title: '选个模板',
      how2Desc: '从 50+ 种 AI 风格中选择——赛博朋克、动漫、油画、3D 公仔等。',
      how3Title: '生成并下载',
      how3Desc: '一键转换。下载 1K 或 2K 画质结果。',
      faq1: 'SnapShift 免费吗？',
      faq1a: '是的——公测期间完全免费。所有模板、1K 和 2K 都包含。',
      faq2: '需要注册吗？',
      faq2a: '不需要。直接上传照片开始转换。',
      faq3: '需要多久？',
      faq3a: '大多数生成需要 10-30 秒，取决于分辨率。',
      faq4: '能用生成的图片商用吗？',
      faq4a: '可以。你生成的所有图片都属于你。',
      footerCopyright: '© 2026 SnapShift. 保留所有权利。',
      createTitle: '开始创作',
      createDesc: '上传照片，选模板，几秒出结果。',
      uploadHere: '拖拽或点击上传',
      uploadHint: 'JPG / PNG，最多 5 张',
      addMore: '点击添加更多照片',
      genNoPhoto: '无需照片生成',
      aspectRatio: '画面比例',
      resolution: '分辨率',
      template: '模板',
      freeMode: '自由模式',
      more: '更多 +',
      advancedOptions: '高级选项',
      customPrompt: '自定义提示词',
      promptInspireLink: '需要灵感？试试示例提示词',
      customPromptPlaceholder: '添加细节优化模板效果...',
      genBtn: '输入提示词或选择一个模板',
      featuredTransformations: '精选效果展示',
      transforming: '正在转换你的图像...',
      download: '下载',
      share: '分享',
      tryAnother: '再来一张',
      need2Photos: '请上传主体和背景两张照片',
      uploadSubjectBg: '上传主体（第1张）+ 背景（第2张）',
      needBgPhoto: '还需要背景照片（第2张）',
      uploadSubjectOutfit: '上传主体 + 服装参考',
      needOutfitPhoto: '还需要服装照片（第2张）',
      backTop: '\u2191',
      before: '转换前',
      after: '转换后',
      promptLibrary: '提示词库',
    }
  };


  // Auto-detect language
  const saved = localStorage.getItem('snapshift-lang');
  const browserLang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en';
  let currentLang = saved || browserLang;

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('snapshift-lang', lang);
    applyLang(lang);
    // Update toggle buttons
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function applyLang(lang) {
    const strings = LANG[lang] || LANG.en;
    // Apply to all elements with data-l10n
    document.querySelectorAll('[data-l10n]').forEach(el => {
      const key = el.dataset.l10n;
      if (strings[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = strings[key];
        } else {
          el.textContent = strings[key];
        }
      }
    });
    // Update button text for generate button
    document.querySelectorAll('[data-l10n-if]').forEach(el => {
      const expr = el.dataset.l10nIf;
      const [key, val] = expr.split('=');
      if (val && el.dataset[key] !== val) return;
      const k = el.dataset.l10n || '';
      if (strings[k] !== undefined) el.textContent = strings[k];
    });
    document.documentElement.lang = lang;
  }

  // Auto-init after DOM loads
  document.addEventListener('DOMContentLoaded', () => {
    window.initLang();
  });

  // Build globe button + dropdown
  function buildLangToggle() {
    const html = `
      <button class="lang-globe" aria-label="Language" id="langGlobe">🌐</button>
      <div class="lang-dropdown" id="langDropdown">
        <button class="lang-option" data-lang="en">English</button>
        <button class="lang-option" data-lang="zh">中文</button>
      </div>
    `;
    document.querySelectorAll('.lang-toggle').forEach(t => {
      t.innerHTML = html;
    });
    // Toggle dropdown
    document.querySelectorAll('.lang-globe').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        btn.parentElement.classList.toggle('open');
      });
    });
    // Click option
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        setLang(opt.dataset.lang);
        document.querySelectorAll('.lang-toggle').forEach(t => t.classList.remove('open'));
      });
    });
    // Close on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-toggle').forEach(t => t.classList.remove('open'));
    });
  }

  // Expose globally
  window.setLang = setLang;
  window.getLang = () => currentLang;
  window.initLang = () => {
    buildLangToggle();
    applyLang(currentLang);
  };

})();
