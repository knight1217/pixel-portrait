// Pixel Portrait — Cloudflare Worker (API proxy to Agnes AI)
// Handles: POST /api/generate — accepts image + style, returns generated portrait URL

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      return handleGenerate(request, env);
    }

    // Serve static from Cloudflare Pages (handled automatically)
    return new Response('Not found', { status: 404 });
  }
};

async function handleGenerate(request, env) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const prompt = formData.get('prompt');

    if (!imageFile || !prompt) {
      return Response.json({ error: 'Missing image or prompt' }, { status: 400, headers: corsHeaders });
    }

    // Convert image to base64 data URL
    const buffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const mime = imageFile.type || 'image/png';
    const dataUrl = `data:${mime};base64,${base64}`;

    // Call Agnes API (image-to-image)
    const agnesResp = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AGNES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'agnes-image-2.0-flash',
        prompt: prompt,
        size: '1024x1024',
        extra_body: {
          tags: ['img2img'],
          image: [dataUrl],
          response_format: 'url',
          strength: 0.4
        }
      })
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
