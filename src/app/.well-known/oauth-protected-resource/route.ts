import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from 'mcp-handler';
import { getSupabaseAuthServerUrls } from '@/lib/mcp/auth';

const handler = protectedResourceHandler({
  authServerUrls: getSupabaseAuthServerUrls(),
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
