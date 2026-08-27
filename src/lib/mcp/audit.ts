import type { ServiceClient } from '@/lib/services/cohorts-service';

export async function logMcpAudit(
  client: ServiceClient,
  entry: {
    actorSub: string;
    toolName: string;
    input: unknown;
    resultStatus: 'success' | 'error';
  }
) {
  const { error } = await (client.from('mcp_audit_log') as unknown as {
    insert: (values: {
      actor_sub: string;
      tool_name: string;
      input: Record<string, unknown>;
      result_status: string;
    }) => Promise<{ error: { message?: string } | null }>;
  }).insert({
    actor_sub: entry.actorSub,
    tool_name: entry.toolName,
    input: entry.input as Record<string, unknown>,
    result_status: entry.resultStatus,
  });

  if (error) {
    console.error('Failed to write MCP audit log:', error);
  }
}
