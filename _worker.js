// Pixel Portrait — Cloudflare Pages Worker (root file)
// Handles API requests and serves static files

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (url.pathname === '/api/debug' && request.method === 'POST') {
      return handleDebug(request, env);
    }

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      return handleGenerate(request, env);
    }

    if (url.pathname === '/api/download' && request.method === 'GET') {
      return handleDownload(request, env);
    }

    // Cloudflare Pages automatically serves static files
    return env.ASSETS.fetch(request);
  }
};

async function handleDebug(request, env) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };
  const formData = await request.formData();
  const rawPrompt = formData.get('prompt') || '';

  const ethnicityKeys = /\b(asian|chinese|japanese|korean|indian|african|latino|hispanic|arab|middle\s*eastern|native\s*american|indigenous|polynesian|maori|aboriginal|pakistani|bangladeshi|filipino|thai|vietnamese|indonesian|malay|turkish|iranian|persian|nigerian|ethiopian|moroccan|egyptian|kenyan|mexican|brazilian|colombian|peruvian|argentinian|mongolian|tibetan|uyghur|saudi|emirati|malaysian|singaporean|african american)\b/i;
  const regionKeys = /\b(tokyo|osaka|kyoto|beijing|shanghai|shenzhen|guangzhou|hong\s*kong|seoul|busan|mumbai|delhi|bangalore|chennai|dubai|abu\s*dhabi|doha|riyadh|bangkok|phuket|hanoi|ho\s*chi\s*minh|jakarta|bali|kuala\s*lumpur|singapore|manila|cebu|taipei|taiwan|nepal|tibet|cairo|marrakech|casablanca|lagos|nairobi|addis\s*ababa|islamabad|karachi|dhaka|colombo|ulan\s*bator)\b/i;
  const nonEnLang = /[\u2E80-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF\u0600-\u06FF\u0E00-\u0E7F\u0900-\u097F\u0B80-\u0BFF\u0400-\u04FF]/;
  const personKeys = /\b(portrait|woman|man|girl|boy|person|people|lady|couple|model|face|selfie|child|kid|baby|teenager|adult|guy|dude|gentleman|beauty|female|male|girlfriend|boyfriend|bride|groom|nun|monk|soldier|knight|king|queen|prince|princess|farmer|doctor|nurse|teacher|student|chef|pilot|officer|detective|warrior|hunter|archer|mage|witch|wizard|vampire|zombie|ghost|angel|demon|mermaid|fairy|elf|dwarf|hobbit|samurai|geisha|crowd|commuter|worker|pedestrian|tourist|traveler|passenger|dancer|singer|actor|actress|musician|artist|athlete|boxer|fighter|swimmer|runner|biker|skater|climber|surfer|gardener|baker|barista|waiter|waitress|barber|tailor|carpenter|plumber|electrician|mechanic|driver|rider|passerby|bystander|protester|audience|spectator|fan|follower|believer|worshiper|monk|priest|nun|pastor|rabbi|imam|shaman|oracle|prophet|sage|elder|youth|teen|toddler|infant|newborn|grandfather|grandmother|grandpa|grandma|dad|mom|father|mother|son|daughter|brother|sister|uncle|aunt|cousin|nephew|niece|husband|wife|boyfriend|girlfriend|fiance|bride|groom|widow|widower|orphan)\b/i;
  const cnPersonKeys = /(消防员|警察|医生|护士|战士|英雄|女性|男性|女孩|男孩|人物|妇人|男子|女子|夫妇|夫妻|情侣|小姐|女士|先生|老板)/;
  const directionKeys = /\b(facing|faced|looking at|looking towards|standing before|standing toward|towards|toward|at|before|面对|面向|朝向|朝着)\b/i;
  const cnDirectionKeys = /(面对|面向|朝向|朝着)/;
  const isNonWestern = ethnicityKeys.test(rawPrompt) || regionKeys.test(rawPrompt);
  const hasPerson = personKeys.test(rawPrompt) || cnPersonKeys.test(rawPrompt);
  const hasDirection = directionKeys.test(rawPrompt) || cnDirectionKeys.test(rawPrompt);

  let finalPrompt = rawPrompt;
  if (!isNonWestern) {
    finalPrompt = finalPrompt + ', high quality, highly detailed, sharp focus';
  }

  return Response.json({
    raw: rawPrompt,
    hasPerson: hasPerson,
    isNonWestern: isNonWestern,
    injected: finalPrompt
  }, { headers: corsHeaders });
}

async function handleGenerate(request, env) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    let prompt = formData.get('prompt');

    if (!prompt) {
      return Response.json({ error: 'Missing image or prompt' }, { status: 400, headers: corsHeaders });
    }

    const ethnicityKeys = /\b(asian|chinese|japanese|korean|indian|african|latino|hispanic|arab|middle\s*eastern|native\s*american|indigenous|polynesian|maori|aboriginal|pakistani|bangladeshi|filipino|thai|vietnamese|indonesian|malay|turkish|iranian|persian|nigerian|ethiopian|moroccan|egyptian|kenyan|mexican|brazilian|colombian|peruvian|argentinian|mongolian|tibetan|uyghur|saudi|emirati|malaysian|singaporean|african american)\b/i;
    const regionKeys = /\b(tokyo|osaka|kyoto|beijing|shanghai|shenzhen|guangzhou|hong\s*kong|seoul|busan|mumbai|delhi|bangalore|chennai|dubai|abu\s*dhabi|doha|riyadh|bangkok|phuket|hanoi|ho\s*chi\s*minh|jakarta|bali|kuala\s*lumpur|singapore|manila|cebu|taipei|taiwan|nepal|tibet|cairo|marrakech|casablanca|lagos|nairobi|addis\s*ababa|islamabad|karachi|dhaka|colombo|ulan\s*bator)\b/i;
    const nonEnLang = /[\u2E80-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF\u0600-\u06FF\u0E00-\u0E7F\u0900-\u097F\u0B80-\u0BFF\u0400-\u04FF]/;
    const personKeys = /\b(portrait|woman|man|girl|boy|person|people|lady|couple|model|face|selfie|child|kid|baby|teenager|adult|guy|dude|gentleman|beauty|female|male|girlfriend|boyfriend|bride|groom|nun|monk|soldier|knight|king|queen|prince|princess|farmer|doctor|nurse|teacher|student|chef|pilot|officer|detective|warrior|hunter|archer|mage|witch|wizard|vampire|zombie|ghost|angel|demon|mermaid|fairy|elf|dwarf|hobbit|samurai|geisha|crowd|commuter|worker|pedestrian|tourist|traveler|passenger|dancer|singer|actor|actress|musician|artist|athlete|boxer|fighter|swimmer|runner|biker|skater|climber|surfer|gardener|baker|barista|waiter|waitress|barber|tailor|carpenter|plumber|electrician|mechanic|driver|rider|passerby|bystander|protester|audience|spectator|fan|follower|believer|worshiper|monk|priest|nun|pastor|rabbi|imam|shaman|oracle|prophet|sage|elder|youth|teen|toddler|infant|newborn|grandfather|grandmother|grandpa|grandma|dad|mom|father|mother|son|daughter|brother|sister|uncle|aunt|cousin|nephew|niece|husband|wife|boyfriend|girlfriend|fiance|bride|groom|widow|widower|orphan)\b/i;
    const cnPersonKeys = /(消防员|警察|医生|护士|战士|英雄|女性|男性|女孩|男孩|人物|妇人|男子|女子|夫妇|夫妻|情侣|小姐|女士|先生|老板)/;
    const directionKeys = /\b(facing|faced|looking at|looking towards|standing before|standing toward|towards|toward|at|before|面对|面向|朝向|朝着)\b/i;
    const cnDirectionKeys = /(面对|面向|朝向|朝着)/;
    const isNonWestern = ethnicityKeys.test(prompt) || regionKeys.test(prompt);
    const hasPerson = personKeys.test(prompt) || cnPersonKeys.test(prompt);
    const hasDirection = directionKeys.test(prompt) || cnDirectionKeys.test(prompt);

    // ─── No face injection — removed per user decision ───
    // ─── No direction injection — removed ───

    // ─── Global quality (skip entirely when prompt specifies non-Western context) ───
    if (!isNonWestern) {
      prompt = prompt + ', high quality, highly detailed, sharp focus';
    }

    const hasImage = imageFile && imageFile.size > 0;
    const ratio = formData.get('ratio') || '1:1';
    const resolution = formData.get('res') || '1K';
    const sizeMap1K = {
      '1:1': '1024x1024',
      '9:16': '720x1280',
      '16:9': '1280x720',
      '4:5': '720x900',
      '3:2': '1024x683',
      '2:3': '683x1024',
      '3:4': '768x1024',
      '4:3': '1024x768'
    };
    const sizeMap2K = {
      '1:1': '2048x2048',
      '9:16': '1080x1920',
      '16:9': '1920x1080',
      '4:5': '1080x1350',
      '3:2': '1620x1080',
      '2:3': '1080x1620',
      '3:4': '1080x1440',
      '4:3': '1440x1080'
    };
    const size = resolution === '2K' ? (sizeMap2K[ratio] || '1920x1080') : (sizeMap1K[ratio] || '1024x1024');
    const agnesBody = {
      model: 'agnes-image-2.0-flash',
      prompt: prompt,
      size: size,
      extra_body: {
        response_format: 'url'
      }
    };

    if (hasImage) {
      const buffer = await imageFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength)));
      }
      const base64 = btoa(binary);
      const mime = imageFile.type || 'image/png';
      const dataUrl = `data:${mime};base64,${base64}`;
      agnesBody.extra_body.tags = ['img2img'];
      agnesBody.extra_body.image = [dataUrl];
      agnesBody.extra_body.strength = 0.5;
    }

    const agnesResp = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AGNES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agnesBody)
    });

    if (!agnesResp.ok) {
      const errText = await agnesResp.text();
      return Response.json({ error: `AI generation failed: ${errText}` }, { status: 502, headers: corsHeaders });
    }

    const result = await agnesResp.json();
    const imageUrl = result.data?.[0]?.url;

    if (!imageUrl) {
      return Response.json({ error: 'No image URL in response' }, { status: 502, headers: corsHeaders });
    }

    return Response.json({ url: imageUrl }, { headers: corsHeaders });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

async function handleDownload(req, env) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };
  try {
    const reqUrl = new URL(req.url);
    const imageUrl = reqUrl.searchParams.get('url');
    if (!imageUrl) {
      return Response.json({ error: 'Missing url param' }, { status: 400, headers: corsHeaders });
    }

    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 502, headers: corsHeaders });
    }

    const buffer = await imageResp.arrayBuffer();
    const contentType = imageResp.headers.get('content-type') || 'image/png';
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="snapshift.png"',
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
// Tue, Jul 14, 2026  2:01:12 AM
