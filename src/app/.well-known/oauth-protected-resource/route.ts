import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from 'mcp-handler';
import { getMcpResourceUrl, getSupabaseAuthServerUrls } from '@/lib/mcp/auth';

const handler = protectedResourceHandler({
  authServerUrls: getSupabaseAuthServerUrls(),
  resourceUrl: getMcpResourceUrl(),
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
