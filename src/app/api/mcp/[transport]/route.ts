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
import {
  createLead,
  getLead,
  listLeads,
  resolveProgramIdForLead,
  updateLead,
} from '@/lib/services/leads-service';
import {
  assignCohortInstructor,
  getInstructor,
  listCohortInstructors,
  listInstructors,
  removeCohortInstructor,
} from '@/lib/services/instructors-service';
import {
  createSession,
  getSession,
  listSessions,
  updateSession,
} from '@/lib/services/sessions-service';
import {
  getInstructorPayment,
  listInstructorPayments,
  listInstructorRates,
  recordInstructorPayment,
  setInstructorRate,
  updateInstructorPayment,
} from '@/lib/services/instructor-pay-service';

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

const cohortFieldSchemas = {
  slug: z.string().optional().describe('Unique human-readable identifier for URLs.'),
  offering: z
    .boolean()
    .optional()
    .describe('When true, the cohort is visible on the public site.'),
  start_date: z.string().optional().describe('YYYY-MM-DD.'),
  end_date: z.string().optional().describe('YYYY-MM-DD.'),
  modality: z
    .string()
    .optional()
    .describe("e.g. 'presencial', 'virtual', 'híbrido'."),
  campus: z.string().optional().describe('Campus or location label.'),
  capacity: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Maximum seats (cupos). 0 means no limit enforced in admin.'),
  maximum_payments: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Number of payment installments (cuotas) allowed for this cohort.'),
  schedule: z
    .object({
      days: z.array(z.string()).describe("Weekdays, e.g. ['Lunes', 'Miércoles']."),
      hours: z.array(z.string()).describe("Time ranges, e.g. ['7:00 p.m. a 9:00 p.m.']."),
    })
    .optional()
    .describe('Class schedule shown on the cohort page.'),
  instructor_id: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Primary instructor UUID. On update, omit to leave unchanged; pass null to remove.'
    ),
};

const leadNotesSchema = z
  .object({
    program: z.string().optional().describe('Program name of interest (free text).'),
    message: z.string().optional(),
    source: z.string().optional().describe('Human-readable origin, e.g. URL campaign label.'),
    moduleName: z.string().optional(),
    routeName: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .optional();

const leadStageSchema = z
  .enum(['diagnostico', 'apartar', 'dudas', 'pagos', 'confirmar'])
  .optional()
  .describe(
    'Lead intent: diagnostico (requested diagnostic), apartar (hold a seat), dudas (questions), pagos (payment options), confirmar (confirm fit).'
  );

const leadFieldSchemas = {
  phone: z.string().nullable().optional().describe('Phone/WhatsApp digits.'),
  stage: leadStageSchema,
  source: z
    .string()
    .optional()
    .describe("Origin tag, e.g. 'admin_manual', 'diagnostico_programa-ft-hero', 'apartar_cupo_page'."),
  interested_program_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .describe('FK to programs.id when the interest maps to a catalog program.'),
  program_name: z
    .string()
    .optional()
    .describe(
      'Convenience: resolves interested_program_id by exact programs.name and sets notes.program.'
    ),
  notes: leadNotesSchema.describe('JSON notes stored in leads.notes (same shape as public forms).'),
};

const sessionMaterialSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(['github', 'youtube', 'file', 'link']),
});

const sessionFieldSchemas = {
  module_id: z.number().int().positive().nullable().optional(),
  title: z.string().nullable().optional(),
  starts_at: z.string().optional().describe('ISO datetime for class start.'),
  ends_at: z.string().optional().describe('ISO datetime for class end.'),
  room: z.string().nullable().optional(),
  materials: z.array(sessionMaterialSchema).nullable().optional(),
};

const instructorPayModeSchema = z
  .enum(['per_session', 'per_cohort', 'monthly'])
  .describe('per_session: per class taught. per_cohort: one payment at close. monthly: fixed monthly.');

const cohortInstructorRoleSchema = z
  .enum(['owner', 'instructor', 'assistant', 'monitor'])
  .optional()
  .describe('Role in the cohort team. Defaults to instructor.');

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
          'List cohorts with all editable fields (capacity, maximum_payments/cuotas, schedule, modality, campus, offering, etc.). Set activeOnly to filter currently active cohorts.',
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
        description:
          'Get a cohort by id with every field, including capacity, maximum_payments (cuotas), schedule, and instructor_id.',
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
      'list_leads',
      {
        title: 'List leads',
        description:
          'List admission leads (people who filled a form or were registered manually). Filter by source, sourcePrefix (e.g. "diagnostico"), stage, email, or interested program.',
        inputSchema: z.object({
          source: z.string().optional().describe('Exact match on leads.source.'),
          sourcePrefix: z
            .string()
            .optional()
            .describe('Prefix match, e.g. "diagnostico" matches diagnostico_* sources.'),
          stage: leadStageSchema,
          email: z.string().optional(),
          interestedProgramId: z.number().int().positive().optional(),
          limit: z.number().int().positive().max(500).optional(),
        }),
      },
      async ({ source, sourcePrefix, stage, email, interestedProgramId, limit }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.LEADS_READ)) {
          throw new Error('Missing scope leads:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const leads = await listLeads(client, {
          source,
          sourcePrefix,
          stage,
          email,
          interestedProgramId,
          limit,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(leads, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_lead',
      {
        title: 'Get lead',
        description:
          'Get a lead by id with all fields, including notes JSON and interested_program_id.',
        inputSchema: z.object({
          leadId: z.number().int().positive(),
        }),
      },
      async ({ leadId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.LEADS_READ)) {
          throw new Error('Missing scope leads:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const lead = await getLead(client, leadId);
        return {
          content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }],
        };
      }
    );

    server.registerTool(
      'create_lead',
      {
        title: 'Create lead',
        description:
          'Register a lead manually (admin only), same table as public forms. Use stage to capture intent; notes.program or program_name for interest.',
        inputSchema: z.object({
          full_name: z.string().min(1),
          email: z.string().min(1),
          ...leadFieldSchemas,
          source: z.string().optional().default('mcp_manual'),
          stage: leadStageSchema.default('dudas'),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.LEADS_WRITE)) {
          throw new Error('Missing scope leads:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        const { program_name, notes, ...rest } = input;

        let interested_program_id = rest.interested_program_id;
        let mergedNotes = notes ?? {};

        if (program_name) {
          const programId = await resolveProgramIdForLead(client, program_name);
          if (programId) interested_program_id = programId;
          mergedNotes = { ...mergedNotes, program: program_name };
        }

        try {
          const lead = await createLead(client, {
            full_name: rest.full_name,
            email: rest.email,
            phone: rest.phone,
            source: rest.source,
            stage: rest.stage,
            interested_program_id: interested_program_id ?? null,
            notes: Object.keys(mergedNotes).length > 0 ? mergedNotes : undefined,
          });
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_lead',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_lead',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'update_lead',
      {
        title: 'Update lead',
        description:
          'Update a lead (admin only). Change stage as the person progresses, edit contact info, or refresh notes/program interest.',
        inputSchema: z.object({
          leadId: z.number().int().positive(),
          full_name: z.string().min(1).optional(),
          email: z.string().min(1).optional(),
          ...leadFieldSchemas,
        }),
      },
      async ({ leadId, program_name, notes, ...input }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.LEADS_WRITE)) {
          throw new Error('Missing scope leads:write');
        }

        const client = createSupabaseClientForToken(auth.token);

        let interested_program_id = input.interested_program_id;
        let mergedNotes = notes;

        if (program_name) {
          const programId = await resolveProgramIdForLead(client, program_name);
          interested_program_id = programId ?? null;
          mergedNotes = { ...(mergedNotes ?? {}), program: program_name };
        }

        try {
          const lead = await updateLead(client, leadId, {
            ...input,
            interested_program_id,
            notes: mergedNotes,
          });
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_lead',
            input: { leadId, program_name, notes, ...input },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(lead, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_lead',
            input: { leadId, program_name, notes, ...input },
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'list_instructors',
      {
        title: 'List instructors',
        description:
          'List instructor profiles (role instructor or admin) with contact fields and user_id.',
        inputSchema: z.object({}),
      },
      async (_input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTORS_READ)) {
          throw new Error('Missing scope instructors:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const instructors = await listInstructors(client);
        return {
          content: [{ type: 'text', text: JSON.stringify(instructors, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_instructor',
      {
        title: 'Get instructor',
        description:
          'Get an instructor profile by user_id, including cohort_assignments from cohort_instructors.',
        inputSchema: z.object({
          instructorId: z.string().uuid(),
        }),
      },
      async ({ instructorId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTORS_READ)) {
          throw new Error('Missing scope instructors:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const instructor = await getInstructor(client, instructorId);
        return {
          content: [{ type: 'text', text: JSON.stringify(instructor, null, 2) }],
        };
      }
    );

    server.registerTool(
      'list_cohort_instructors',
      {
        title: 'List cohort instructors',
        description:
          'List instructor assignments to cohorts. Filter by cohortId and/or instructorId.',
        inputSchema: z.object({
          cohortId: z.number().int().positive().optional(),
          instructorId: z.string().uuid().optional(),
        }),
      },
      async ({ cohortId, instructorId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTORS_READ)) {
          throw new Error('Missing scope instructors:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const rows = await listCohortInstructors(client, { cohortId, instructorId });
        return {
          content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
        };
      }
    );

    server.registerTool(
      'assign_cohort_instructor',
      {
        title: 'Assign cohort instructor',
        description:
          'Assign or update an instructor on a cohort (admin only). Upserts cohort_instructors.',
        inputSchema: z.object({
          cohort_id: z.number().int().positive(),
          instructor_id: z.string().uuid(),
          role: cohortInstructorRoleSchema,
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTORS_WRITE)) {
          throw new Error('Missing scope instructors:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const row = await assignCohortInstructor(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'assign_cohort_instructor',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(row, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'assign_cohort_instructor',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'remove_cohort_instructor',
      {
        title: 'Remove cohort instructor',
        description: 'Remove an instructor assignment from a cohort (admin only).',
        inputSchema: z.object({
          cohortId: z.number().int().positive(),
          instructorId: z.string().uuid(),
        }),
      },
      async ({ cohortId, instructorId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTORS_WRITE)) {
          throw new Error('Missing scope instructors:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const result = await removeCohortInstructor(client, cohortId, instructorId);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'remove_cohort_instructor',
            input: { cohortId, instructorId },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'remove_cohort_instructor',
            input: { cohortId, instructorId },
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'list_sessions',
      {
        title: 'List sessions',
        description:
          'List class sessions (clases). Filter by cohortId and optional date range (from/to ISO datetimes).',
        inputSchema: z.object({
          cohortId: z.number().int().positive().optional(),
          from: z.string().optional().describe('Include sessions starting at or after this ISO datetime.'),
          to: z.string().optional().describe('Include sessions starting at or before this ISO datetime.'),
        }),
      },
      async ({ cohortId, from, to }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.SESSIONS_READ)) {
          throw new Error('Missing scope sessions:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const sessions = await listSessions(client, { cohortId, from, to });
        return {
          content: [{ type: 'text', text: JSON.stringify(sessions, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_session',
      {
        title: 'Get session',
        description: 'Get a class session by id with all fields including materials.',
        inputSchema: z.object({
          sessionId: z.number().int().positive(),
        }),
      },
      async ({ sessionId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.SESSIONS_READ)) {
          throw new Error('Missing scope sessions:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const session = await getSession(client, sessionId);
        return {
          content: [{ type: 'text', text: JSON.stringify(session, null, 2) }],
        };
      }
    );

    server.registerTool(
      'create_session',
      {
        title: 'Create session',
        description:
          'Schedule a new class session (admin only). Requires cohort_id, starts_at, and ends_at.',
        inputSchema: z.object({
          cohort_id: z.number().int().positive(),
          ...sessionFieldSchemas,
          starts_at: z.string().describe('ISO datetime for class start.'),
          ends_at: z.string().describe('ISO datetime for class end.'),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.SESSIONS_WRITE)) {
          throw new Error('Missing scope sessions:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const session = await createSession(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_session',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(session, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'create_session',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'update_session',
      {
        title: 'Update session',
        description:
          'Update a class session (admin only). Only provided fields change (title, schedule, room, module, materials).',
        inputSchema: z.object({
          sessionId: z.number().int().positive(),
          ...sessionFieldSchemas,
        }),
      },
      async ({ sessionId, ...input }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.SESSIONS_WRITE)) {
          throw new Error('Missing scope sessions:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const session = await updateSession(client, sessionId, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_session',
            input: { sessionId, ...input },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(session, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_session',
            input: { sessionId, ...input },
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'list_instructor_rates',
      {
        title: 'List instructor rates',
        description:
          'List agreed pay rates per instructor and cohort (mode, amount, requires_attendance).',
        inputSchema: z.object({
          instructorId: z.string().uuid().optional(),
          cohortId: z.number().int().positive().optional(),
        }),
      },
      async ({ instructorId, cohortId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTOR_PAYMENTS_READ)) {
          throw new Error('Missing scope instructor_payments:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const rates = await listInstructorRates(client, { instructorId, cohortId });
        return {
          content: [{ type: 'text', text: JSON.stringify(rates, null, 2) }],
        };
      }
    );

    server.registerTool(
      'set_instructor_rate',
      {
        title: 'Set instructor rate',
        description:
          'Set or update how an instructor is paid for a cohort (admin only). Same as admin pagos UI.',
        inputSchema: z.object({
          instructor_id: z.string().uuid(),
          cohort_id: z.number().int().positive(),
          mode: instructorPayModeSchema,
          amount: z.number().positive(),
          requires_attendance: z
            .boolean()
            .optional()
            .default(true)
            .describe('When true, a class counts for pay only after attendance is recorded.'),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTOR_PAYMENTS_WRITE)) {
          throw new Error('Missing scope instructor_payments:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const rate = await setInstructorRate(client, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'set_instructor_rate',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(rate, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'set_instructor_rate',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'list_instructor_payments',
      {
        title: 'List instructor payments',
        description:
          'List payments made (or pending) to instructors. Filter by instructor, cohort, or status.',
        inputSchema: z.object({
          instructorId: z.string().uuid().optional(),
          cohortId: z.number().int().positive().optional(),
          status: z.enum(['pending', 'paid']).optional(),
          limit: z.number().int().positive().max(500).optional(),
        }),
      },
      async ({ instructorId, cohortId, status, limit }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTOR_PAYMENTS_READ)) {
          throw new Error('Missing scope instructor_payments:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const payments = await listInstructorPayments(client, {
          instructorId,
          cohortId,
          status,
          limit,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(payments, null, 2) }],
        };
      }
    );

    server.registerTool(
      'get_instructor_payment',
      {
        title: 'Get instructor payment',
        description: 'Get a single instructor payment record by id.',
        inputSchema: z.object({
          paymentId: z.number().int().positive(),
        }),
      },
      async ({ paymentId }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTOR_PAYMENTS_READ)) {
          throw new Error('Missing scope instructor_payments:read');
        }

        const client = createSupabaseClientForToken(auth.token);
        const payment = await getInstructorPayment(client, paymentId);
        return {
          content: [{ type: 'text', text: JSON.stringify(payment, null, 2) }],
        };
      }
    );

    server.registerTool(
      'record_instructor_payment',
      {
        title: 'Record instructor payment',
        description:
          'Register or upsert a payment to an instructor for a period (admin only). Defaults to status paid.',
        inputSchema: z.object({
          instructor_id: z.string().uuid(),
          cohort_id: z.number().int().positive(),
          concept: z.string().min(1),
          amount: z.number().positive(),
          period_start: z.string().describe('YYYY-MM-DD start of pay period.'),
          period_end: z.string().describe('YYYY-MM-DD end of pay period.'),
          session_count: z.number().int().nonnegative().optional(),
          status: z.enum(['pending', 'paid']).optional().default('paid'),
          paid_at: z.string().nullable().optional(),
          method: z.string().nullable().optional().describe('Payment method, e.g. transfer, cash.'),
          notes: z.string().nullable().optional(),
        }),
      },
      async (input, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTOR_PAYMENTS_WRITE)) {
          throw new Error('Missing scope instructor_payments:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const payment = await recordInstructorPayment(client, {
            ...input,
            created_by: auth.userId,
          });
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'record_instructor_payment',
            input,
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(payment, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'record_instructor_payment',
            input,
            resultStatus: 'error',
          });
          throw error;
        }
      }
    );

    server.registerTool(
      'update_instructor_payment',
      {
        title: 'Update instructor payment',
        description:
          'Update an instructor payment (admin only). Change status, amounts, period, or notes.',
        inputSchema: z.object({
          paymentId: z.number().int().positive(),
          concept: z.string().min(1).optional(),
          amount: z.number().positive().optional(),
          period_start: z.string().optional(),
          period_end: z.string().optional(),
          session_count: z.number().int().nonnegative().optional(),
          status: z.enum(['pending', 'paid']).optional(),
          paid_at: z.string().nullable().optional(),
          method: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        }),
      },
      async ({ paymentId, ...input }, ctx) => {
        const auth = getAuth(ctx);
        if (!auth || !hasScope(auth, MCP_SCOPES.INSTRUCTOR_PAYMENTS_WRITE)) {
          throw new Error('Missing scope instructor_payments:write');
        }

        const client = createSupabaseClientForToken(auth.token);
        try {
          const payment = await updateInstructorPayment(client, paymentId, input);
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_instructor_payment',
            input: { paymentId, ...input },
            resultStatus: 'success',
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(payment, null, 2) }],
          };
        } catch (error) {
          await logMcpAudit(client, {
            actorSub: auth.userId,
            toolName: 'update_instructor_payment',
            input: { paymentId, ...input },
            resultStatus: 'error',
          });
          throw error;
        }
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
        description:
          'Create a cohort (admin only) with all editable fields: capacity, maximum_payments (cuotas), schedule, instructor, etc.',
        inputSchema: z.object({
          name: z.string().min(1),
          program_id: z.string().min(1),
          ...cohortFieldSchemas,
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
        description:
          'Update a cohort (admin only). Only provided fields change. Supports capacity, maximum_payments (cuotas), schedule, offering, and instructor_id (null removes instructor).',
        inputSchema: z.object({
          cohortId: z.number().int().positive(),
          name: z.string().min(1).optional(),
          program_id: z.string().min(1).optional(),
          ...cohortFieldSchemas,
          instructor_id: z
            .string()
            .uuid()
            .nullable()
            .optional()
            .describe('Pass null to remove the assigned instructor.'),
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
