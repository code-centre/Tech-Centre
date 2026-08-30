import type { ServiceClient } from '@/lib/services/cohorts-service';
import type {
  AdmissionStep,
  Route,
  RouteMetadata,
  RouteModule,
  RouteOpportunity,
} from '@/types/routes';

export interface RouteSummary {
  id: string;
  name: string;
  slug: string;
  level: string | null;
  modality: string | null;
  is_visible: boolean;
}

const ROUTE_SUMMARY_COLUMNS = 'id, name, slug, level, modality, is_visible';

export async function listRoutes(
  client: ServiceClient,
  options?: { visibleOnly?: boolean }
): Promise<RouteSummary[]> {
  let query = client
    .from('routes')
    .select(ROUTE_SUMMARY_COLUMNS)
    .order('created_at', { ascending: true });

  if (options?.visibleOnly) {
    query = query.eq('is_visible', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RouteSummary[];
}

export async function getRoute(
  client: ServiceClient,
  options: { routeId?: string; slug?: string }
): Promise<Route> {
  if (!options.routeId && !options.slug) {
    throw new Error('Provide routeId or slug');
  }

  let query = client.from('routes').select('*');
  if (options.routeId) {
    query = query.eq('id', options.routeId);
  } else if (options.slug) {
    query = query.eq('slug', options.slug);
  }

  const { data, error } = await query.single();
  if (error) throw new Error(error.message);
  return data as unknown as Route;
}

export interface RouteFieldsInput {
  duration?: string | null;
  level?: string | null;
  modality?: string | null;
  description?: string | null;
  long_description?: string | null;
  image?: string | null;
  hero_image?: string | null;
  target_audience?: string | null;
  next_start_date?: string | null;
  is_visible?: boolean;
  learning_points?: Array<{ title: string; url?: string }>;
  modules?: RouteModule[];
  graduate_profile?: string[];
  opportunities?: RouteOpportunity[];
  admission_process?: AdmissionStep[];
  metadata?: RouteMetadata;
}

export interface CreateRouteInput extends RouteFieldsInput {
  name: string;
  slug: string;
}

export interface UpdateRouteInput extends RouteFieldsInput {
  name?: string;
  slug?: string;
}

const TEXT_FIELDS = [
  'duration',
  'level',
  'modality',
  'description',
  'long_description',
  'image',
  'hero_image',
  'target_audience',
  'next_start_date',
] as const;

const JSON_FIELDS = [
  'learning_points',
  'modules',
  'graduate_profile',
  'opportunities',
  'admission_process',
  'metadata',
] as const;

function buildRouteRecord(input: RouteFieldsInput): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const field of TEXT_FIELDS) {
    const value = input[field];
    if (value === undefined) continue;
    record[field] = typeof value === 'string' ? value.trim() || null : value;
  }

  for (const field of JSON_FIELDS) {
    if (input[field] !== undefined) record[field] = input[field];
  }

  if (input.is_visible !== undefined) {
    record.is_visible = input.is_visible;
  }

  return record;
}

export async function createRoute(client: ServiceClient, input: CreateRouteInput) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) throw new Error('name cannot be empty');
  if (!slug) throw new Error('slug cannot be empty');

  const now = new Date().toISOString();

  const { data, error } = await (client as any)
    .from('routes')
    .insert({
      learning_points: [],
      modules: [],
      graduate_profile: [],
      opportunities: [],
      admission_process: [],
      metadata: {},
      is_visible: true,
      ...buildRouteRecord(input),
      name,
      slug,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateRoute(
  client: ServiceClient,
  routeId: string,
  input: UpdateRouteInput
) {
  const record = buildRouteRecord(input);

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    record.name = name;
  }
  if (input.slug !== undefined) {
    const slug = input.slug.trim().toLowerCase();
    if (!slug) throw new Error('slug cannot be empty');
    record.slug = slug;
  }

  if (Object.keys(record).length === 0) {
    throw new Error('No fields to update');
  }

  record.updated_at = new Date().toISOString();

  const { data, error } = await (client as any)
    .from('routes')
    .update(record)
    .eq('id', routeId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
