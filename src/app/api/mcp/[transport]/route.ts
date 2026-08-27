import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { z } from 'zod';
import {
  createSupabaseClientForToken,
  hasScope,
  MCP_SCOPES,
  type McpAuthInfo,
  verifyMcpToken,
} from '@/lib/mcp/auth';
import { logMcpAudit } from '@/lib/mcp/audit';
import { rateLimit } from '@/lib/rate-limit';
import {
  createCohort,
  getCohort,
  listCohorts,
  updateCohort,
} from '@/lib/services/cohorts-service';
import { enrollStudent, listEnrollments } from '@/lib/services/enrollments-service';
import {
  getPaymentSummary,
  markInvoicePaid,
} from '@/lib/services/invoices-service';
import { createProgram, listPrograms } from '@/lib/services/programs-service';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getAuth(ctx: { http?: { authInfo?: AuthInfo } }): McpAuthInfo | undefined {
  return ctx.http?.authInfo as McpAuthInfo | undefined;
}

const baseHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      'list_programs',
      {
        title: 'List programs',
        description:
          'List academic programs with the fields needed to identify them (id, name, code, kind, difficulty, default_price, total_hours). Optionally filter by kind or difficulty.',
        inputSchema: z.object({
          kind: z.string().optional(),
          difficulty: z.string().optional(),
        }),
      },
      async ({ kind, difficulty }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.PROGRAMS_READ)) {
          throw new Error('Missing scope programs:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const programs = await listPrograms(client, { kind, difficulty });
        return {
          content: [{ type: 'text', text: JSON.stringify(programs, null, 2) }],
        };
      }
    );

    server.registerTool(
      'create_program',
      {
        title: 'Create program',
        description:
          'Create an academic program (admin only). The code is generated automatically from the name.',
        inputSchema: z.object({
          name: z.string().min(1),
          subtitle: z.string().optional(),
          description: z.string().optional(),
          kind: z
            .enum(['diplomado', 'curso especializado', 'curso corto'])
            .optional(),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
          total_hours: z.number().int().nonnegative().optional(),
          default_price: z.number().nonnegative().optional(),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.PROGRAMS_WRITE)) {
          throw new Error('Missing scope programs:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const program = await createProgram(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_program',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(program, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_program',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'list_cohorts',
      {
        title: 'List cohorts',
        description:
          'List cohorts. By default returns all cohorts; set activeOnly to true to return only currently active cohorts (being offered or within their start/end date range).',
        inputSchema: z.object({
          activeOnly: z.boolean().optional(),
        }),
      },
      async ({ activeOnly }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.COHORTS_READ)) {
          throw new Error('Missing scope cohorts:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const cohorts = await listCohorts(client, { activeOnly: activeOnly ?? false });
        return {
          content: [{ type: 'text', text: JSON.stringify(cohorts, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_cohort',
      {
        title: 'Get cohort',
        description: 'Get a cohort by id.',
        inputSchema: z.object({
          cohortId: z.number().int().positive(),
        }),
      },
      async ({ cohortId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.COHORTS_READ)) {
          throw new Error('Missing scope cohorts:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const cohort = await getCohort(client, cohortId);
        return {
          content: [{ type: 'text', text: JSON.stringify(cohort, null, 2) }],
        };
      }
    );

    server.registerTool(
      'list_enrollments',
      {
        title: 'List enrollments',
        description: 'List enrollments, optionally filtered by cohort or student.',
        inputSchema: z.object({
          cohortId: z.number().int().positive().optional(),
          studentId: z.string().uuid().optional(),
        }),
      },
      async ({ cohortId, studentId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.ENROLLMENTS_READ)) {
          throw new Error('Missing scope enrollments:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const enrollments = await listEnrollments(client, { cohortId, studentId });
        return {
          content: [{ type: 'text', text: JSON.stringify(enrollments, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_payment_summary',
      {
        title: 'Payment summary',
        description: 'Payment summary for a cohort or enrollment.',
        inputSchema: z.object({
          cohortId: z.number().int().positive().optional(),
          enrollmentId: z.number().int().positive().optional(),
        }),
      },
      async ({ cohortId, enrollmentId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.PAYMENTS_READ)) {
          throw new Error('Missing scope payments:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const summary = await getPaymentSummary(client, { cohortId, enrollmentId });
        return {
          content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
        };
      }
    );

    server.registerTool(
      'create_cohort',
      {
        title: 'Create cohort',
        description: 'Create a cohort (admin only).',
        inputSchema: z.object({
          name: z.string().min(1),
          program_id: z.string().min(1),
          slug: z.string().optional(),
          offering: z.boolean().optional(),
          start_date: z.string().optional(),
          end_date: z.string().optional(),
          modality: z.string().optional(),
          campus: z.string().optional(),
          capacity: z.number().int().positive().optional(),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.COHORTS_WRITE)) {
          throw new Error('Missing scope cohorts:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const cohort = await createCohort(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_cohort',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(cohort, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_cohort',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'update_cohort',
      {
        title: 'Update cohort',
        description: 'Update a cohort (admin only).',
        inputSchema: z.object({
          cohortId: z.number().int().positive(),
          name: z.string().optional(),
          program_id: z.string().optional(),
          slug: z.string().optional(),
          offering: z.boolean().optional(),
          start_date: z.string().optional(),
          end_date: z.string().optional(),
          modality: z.string().optional(),
          campus: z.string().optional(),
          capacity: z.number().int().positive().optional(),
        }),
      },
      async ({ cohortId, ...input }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.COHORTS_WRITE)) {
          throw new Error('Missing scope cohorts:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const cohort = await updateCohort(client, cohortId, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_cohort',
            input: { cohortId, ...input },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(cohort, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_cohort',
            input: { cohortId, ...input },
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'enroll_student',
      {
        title: 'Enroll student',
        description: 'Enroll a student in a cohort (admin only).',
        inputSchema: z.object({
          student_id: z.string().uuid(),
          cohort_id: z.number().int().positive(),
          agreed_price: z.number().optional(),
          status: z.string().optional(),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.ENROLLMENTS_WRITE)) {
          throw new Error('Missing scope enrollments:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const enrollment = await enrollStudent(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'enroll_student',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(enrollment, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'enroll_student',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'mark_invoice_paid',
      {
        title: 'Mark invoice paid',
        description: 'Mark an invoice as paid (admin only).',
        inputSchema: z.object({
          invoiceId: z.number().int().positive(),
          paidAt: z.string().optional(),
        }),
      },
      async ({ invoiceId, paidAt }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.PAYMENTS_WRITE)) {
          throw new Error('Missing scope payments:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const invoice = await markInvoicePaid(client, invoiceId, paidAt);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'mark_invoice_paid',
            input: { invoiceId, paidAt },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(invoice, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'mark_invoice_paid',
            input: { invoiceId, paidAt },
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );
  },
  {
    serverInfo: {
      name: 'tech-centre-mcp',
      version: '1.0.0',
    },
  }
);

const authHandler = withMcpAuth(
  async (req: Request) => {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : 'anonymous';

    const limit = rateLimit(`mcp:${token.slice(0, 24)}`, 120, 60_000);
    if (!limit.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(limit.retryAfterSec),
        },
      });
    }

    return baseHandler(req);
  },
  verifyMcpToken,
  {
    required: true,
    resourceMetadataPath: '/.well-known/oauth-protected-resource',
  }
);

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
