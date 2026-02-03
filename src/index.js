import Anthropic from "@anthropic-ai/sdk";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Proxy endpoint: /api/watermark?url=<image-url>
    if (url.pathname === '/api/watermark') {
      const imageUrl = url.searchParams.get('url');
      if (!imageUrl) {
        return new Response('Missing URL parameter', { status: 400 });
      }

      try {
        // Fetch image from TheCatAPI
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return new Response('Failed to fetch image', { status: 500 });
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        
        // Use Cloudflare's image API or return raw + let client watermark
        // For now, return image as-is with CORS headers
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': imageResponse.headers.get('Content-Type'),
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
