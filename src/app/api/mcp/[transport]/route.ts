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
import {
  createProgram,
  getProgram,
  listPrograms,
  updateProgram,
} from '@/lib/services/programs-service';
import {
  createRoute,
  getRoute,
  listRoutes,
  updateRoute,
} from '@/lib/services/routes-service';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getAuth(ctx: { http?: { authInfo?: AuthInfo } }): McpAuthInfo | undefined {
  return ctx.http?.authInfo as McpAuthInfo | undefined;
}

const finalProjectItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

/**
 * Todos los campos editables de `programs`, compartidos por create_program y
 * update_program. Los jsonb usan la misma forma que renderiza la página
 * pública (ver src/lib/programLanding.ts).
 */
const programFieldSchemas = {
  subtitle: z.string().optional(),
  description: z.string().optional(),
  kind: z
    .string()
    .optional()
    .describe("Program type, e.g. 'diplomado', 'curso especializado', 'curso corto'."),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced', 'Principiante', 'Intermedio', 'Avanzado'])
    .optional(),
  total_hours: z.number().int().nonnegative().optional(),
  default_price: z.number().nonnegative().optional(),
  discount: z
    .number()
    .nonnegative()
    .optional()
    .describe('Sale price. 0 means no active sale.'),
  currency: z.enum(['COP', 'USD', 'EUR']).optional(),
  duration: z.string().optional().describe("Free text, e.g. '8 semanas'."),
  schedule: z
    .string()
    .optional()
    .describe("Free text, e.g. 'Lunes a miércoles, 7 a 9 p. m.'."),
  start_date: z.string().optional().describe('YYYY-MM-DD.'),
  video: z.string().optional().describe('YouTube or Vimeo URL for the presentation video.'),
  image: z.string().optional().describe('Public URL of the cover image.'),
  audience: z.string().optional().describe('One-line target audience shown in the hero.'),
  slug: z.string().optional().describe('Alternative slug for URLs (code is used by default).'),
  stack: z
    .array(z.string())
    .optional()
    .describe('Technologies taught, shown as tags in the header.'),
  includes: z
    .array(z.string())
    .optional()
    .describe("What the investment includes, shown next to the price."),
  audience_fit: z
    .object({
      yes: z.array(z.string()),
      not_yet: z.array(z.string()),
    })
    .optional()
    .describe('"¿Es para ti?" section: reasons to join (yes) and to wait (not_yet).'),
  prerequisites: z
    .array(
      z.object({
        name: z.string().min(1),
        detail: z.string().optional(),
      })
    )
    .optional(),
  final_project: z
    .object({
      title: z.string().optional(),
      summary: z.string().optional(),
      requirements: z.array(finalProjectItemSchema).optional(),
      examples: z.array(finalProjectItemSchema).optional(),
    })
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .optional(),
  syllabus: z
    .object({
      modules: z.array(
        z.object({
          id: z.number().int(),
          title: z.string().min(1),
          topics: z.array(z.string()),
        })
      ),
    })
    .optional(),
};

const routeFieldSchemas = {
  duration: z.string().optional(),
  level: z.string().optional(),
  modality: z.string().optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  image: z.string().optional().describe('Public URL of the card cover image.'),
  hero_image: z.string().optional().describe('Public URL of the hero image.'),
  target_audience: z.string().optional(),
  next_start_date: z.string().optional().describe("Free text, e.g. 'Enero 2026'."),
  is_visible: z.boolean().optional(),
  learning_points: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().optional(),
      })
    )
    .optional(),
  modules: z
    .array(
      z.object({
        title: z.string().min(1),
        duration: z.string(),
        topics: z.array(z.string()),
      })
    )
    .optional(),
  graduate_profile: z.array(z.string()).optional(),
  opportunities: z
    .array(
      z.object({
        title: z.string().min(1),
        salaryRange: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  admission_process: z
    .array(
      z.object({
        step: z.string(),
        title: z.string().min(1),
        description: z.string(),
      })
    )
    .optional(),
  metadata: z
    .object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    })
    .optional(),
};

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
      'get_program',
      {
        title: 'Get program',
        description:
          'Get a program by id with every field, including the landing-page content (stack, includes, audience_fit, prerequisites, final_project, faqs, syllabus).',
        inputSchema: z.object({
          programId: z.number().int().positive(),
        }),
      },
      async ({ programId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.PROGRAMS_READ)) {
          throw new Error('Missing scope programs:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const program = await getProgram(client, programId);
        return {
          content: [{ type: 'text', text: JSON.stringify(program, null, 2) }],
        };
      }
    );

    server.registerTool(
      'create_program',
      {
        title: 'Create program',
        description:
          'Create an academic program (admin only) with any of its fields, including the landing-page content. The code is generated automatically from the name.',
        inputSchema: z.object({
          name: z.string().min(1),
          ...programFieldSchemas,
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
      'update_program',
      {
        title: 'Update program',
        description:
          'Update any fields of a program (admin only). Only the provided fields are changed; jsonb fields (stack, includes, audience_fit, prerequisites, final_project, faqs, syllabus) are replaced whole, so send the complete new value.',
        inputSchema: z.object({
          programId: z.number().int().positive(),
          name: z.string().min(1).optional(),
          code: z.string().min(1).optional(),
          ...programFieldSchemas,
        }),
      },
      async ({ programId, ...input }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.PROGRAMS_WRITE)) {
          throw new Error('Missing scope programs:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const program = await updateProgram(client, programId, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_program',
            input: { programId, ...input },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(program, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_program',
            input: { programId, ...input },
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'list_routes',
      {
        title: 'List routes',
        description:
          'List training routes (id, name, slug, level, modality, is_visible). Optionally filter to visible routes only.',
        inputSchema: z.object({
          visibleOnly: z.boolean().optional(),
        }),
      },
      async ({ visibleOnly }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.ROUTES_READ)) {
          throw new Error('Missing scope routes:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const routes = await listRoutes(client, { visibleOnly: visibleOnly ?? false });
        return {
          content: [{ type: 'text', text: JSON.stringify(routes, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_route',
      {
        title: 'Get route',
        description:
          'Get a route by id or slug with every field (learning_points, modules, graduate_profile, opportunities, admission_process, metadata).',
        inputSchema: z.object({
          routeId: z.string().uuid().optional(),
          slug: z.string().optional(),
        }),
      },
      async ({ routeId, slug }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.ROUTES_READ)) {
          throw new Error('Missing scope routes:read');
        }
        if (!routeId && !slug) {
          throw new Error('Provide routeId or slug');
        }

        const client = createSupabaseClientForToken(auth.token);
        const route = await getRoute(client, { routeId, slug });
        return {
          content: [{ type: 'text', text: JSON.stringify(route, null, 2) }],
        };
      }
    );

    server.registerTool(
      'create_route',
      {
        title: 'Create route',
        description:
          'Create a training route (admin only) with any of its fields. name and slug are required; slug must be unique.',
        inputSchema: z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          ...routeFieldSchemas,
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.ROUTES_WRITE)) {
          throw new Error('Missing scope routes:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const route = await createRoute(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_route',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(route, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_route',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'update_route',
      {
        title: 'Update route',
        description:
          'Update any fields of a route (admin only). Only the provided fields are changed; jsonb fields are replaced whole, so send the complete new value. Use is_visible: false to hide a route.',
        inputSchema: z.object({
          routeId: z.string().uuid(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          ...routeFieldSchemas,
        }),
      },
      async ({ routeId, ...input }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.ROUTES_WRITE)) {
          throw new Error('Missing scope routes:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const route = await updateRoute(client, routeId, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_route',
            input: { routeId, ...input },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(route, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_route',
            input: { routeId, ...input },
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
