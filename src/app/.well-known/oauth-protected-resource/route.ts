import {
  generateProtectedResourceMetadata,
  getPublicOrigin,
  metadataCorsOptionsRequestHandler,
} from 'mcp-handler';
import { getMcpResourceUrl, getSupabaseAuthServerUrls } from '@/lib/mcp/auth';

// Advertise the resource identifier for the exact host the client connected to
// (apex or www) so it always matches the endpoint and the token audience. This
// prevents "Protected resource X does not match expected Y" during OAuth.
function handler(req: Request) {
  const metadata = generateProtectedResourceMetadata({
    authServerUrls: getSupabaseAuthServerUrls(),
    resourceUrl: getMcpResourceUrl(getPublicOrigin(req)),
  });

  return new Response(JSON.stringify(metadata), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
