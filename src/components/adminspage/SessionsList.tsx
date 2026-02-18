'use client';

import { useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  Video,
  Github,
  Link as LinkIcon,
  Loader2,
  Calendar,
  MapPin,
} from 'lucide-react';
import SessionFormModal from './SessionFormModal';
import type {
  Session,
  ProgramModule,
  SessionMaterial,
  AttendanceStatus,
} from '@/types/supabase';

interface EnrollmentWithProfile {
  id: number;
  student_id: string;
  profiles?: {
    first_name: string;
    last_name?: string;
    email: string;
  } | null;
  profile?: {
    first_name: string;
    last_name?: string;
    email: string;
  } | null;
}

interface SessionsListProps {
  sessions: Session[];
  modules: ProgramModule[];
  enrollments: EnrollmentWithProfile[];
  cohortId: string;
  onDataChange: () => void;
}

const MATERIAL_TYPES: { value: SessionMaterial['type']; label: string; Icon: typeof Github }[] = [
  { value: 'github', label: 'GitHub', Icon: Github },
  { value: 'youtube', label: 'YouTube', Icon: Video },
  { value: 'file', label: 'Archivo', Icon: FileText },
  { value: 'link', label: 'Enlace', Icon: LinkIcon },
];

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  late: 'Tarde',
  absent: 'Ausente',
  excused: 'Justificado',
};

function formatSessionDate(startsAt: string, endsAt: string): string {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return `${s.toLocaleDateString('es-CO', opts)} — ${e.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
}

function MaterialIcon({ type }: { type: SessionMaterial['type'] }) {
  const item = MATERIAL_TYPES.find((t) => t.value === type);
  const Icon = item?.Icon ?? LinkIcon;
  return <Icon className="w-4 h-4 shrink-0" />;
}

export default function SessionsList({
  sessions,
  modules,
  enrollments,
  cohortId,
  onDataChange,
}: SessionsListProps) {
  const supabase = useSupabaseClient();
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [attendanceBySession, setAttendanceBySession] = useState<
    Record<number, { enrollment_id: number; status: AttendanceStatus; notes: string | null }[]>
  >({});
  const [loadingAttendance, setLoadingAttendance] = useState<Record<number, boolean>>({});
  const [loadingMaterials, setLoadingMaterials] = useState<Record<number, boolean>>({});

  // Group sessions by module
  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);
  const sessionsByModule = new Map<number | 'none', Session[]>();

  for (const m of sortedModules) {
    sessionsByModule.set(
      m.id,
      sessions
        .filter((s) => s.module_id === m.id)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    );
  }
  const ungrouped = sessions
    .filter((s) => s.module_id == null)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  if (ungrouped.length > 0) {
    sessionsByModule.set('none', ungrouped);
  }

  const openCreateModal = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const openEditModal = (s: Session) => {
    setEditingSession(s);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingSession(null);
    onDataChange();
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('¿Eliminar esta clase? Se perderán los registros de asistencia.')) return;
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) {
      console.error('Error deleting session:', error);
      return;
    }
    onDataChange();
  };

  const fetchAttendance = async (sessionId: number) => {
    setLoadingAttendance((prev) => ({ ...prev, [sessionId]: true }));
    const { data } = await supabase
      .from('attendance')
      .select('enrollment_id, status, notes')
      .eq('session_id', sessionId);
    const map: Record<number, { enrollment_id: number; status: AttendanceStatus; notes: string | null }> = {};
    (data ?? []).forEach((r: { enrollment_id: number; status: AttendanceStatus; notes: string | null }) => {
      map[r.enrollment_id] = r;
    });
    const list = enrollments.map((e) => ({
      enrollment_id: e.id,
      status: (map[e.id]?.status ?? 'absent') as AttendanceStatus,
      notes: map[e.id]?.notes ?? null,
    }));
    setAttendanceBySession((prev) => ({ ...prev, [sessionId]: list }));
    setLoadingAttendance((prev) => ({ ...prev, [sessionId]: false }));
  };

  const saveAttendance = async (
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string | null
  ) => {
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('session_id', sessionId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();

    const payload = {
      session_id: sessionId,
      enrollment_id: enrollmentId,
      status,
      notes,
      marked_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('attendance').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert(payload);
    }

    setAttendanceBySession((prev) => {
      const list = prev[sessionId] ?? [];
      const idx = list.findIndex((r) => r.enrollment_id === enrollmentId);
      const next = [...list];
      if (idx >= 0) {
        next[idx] = { enrollment_id: enrollmentId, status, notes };
      } else {
        next.push({ enrollment_id: enrollmentId, status, notes });
      }
      return { ...prev, [sessionId]: next };
    });
  };

  const addMaterial = async (sessionId: number, mat: SessionMaterial) => {
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: true }));
    const session = sessions.find((s) => s.id === sessionId);
    const current = (session?.materials ?? []) as SessionMaterial[];
    const next = [...current, mat];
    const { error } = await supabase
      .from('sessions')
      .update({ materials: next })
      .eq('id', sessionId);
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: false }));
    if (!error) onDataChange();
  };

  const removeMaterial = async (sessionId: number, index: number) => {
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: true }));
    const session = sessions.find((s) => s.id === sessionId);
    const current = (session?.materials ?? []) as SessionMaterial[];
    const next = current.filter((_, i) => i !== index);
    const { error } = await supabase
      .from('sessions')
      .update({ materials: next })
      .eq('id', sessionId);
    setLoadingMaterials((prev) => ({ ...prev, [sessionId]: false }));
    if (!error) onDataChange();
  };

  const getAttendanceSummary = (sessionId: number) => {
    const list = attendanceBySession[sessionId];
    if (!list) return null;
    const present = list.filter((r) => r.status === 'present' || r.status === 'excused').length;
    const total = enrollments.length;
    return `${present}/${total}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar clase
        </button>
      </div>

      {sortedModules.map((mod) => {
        const modSessions = sessionsByModule.get(mod.id) ?? [];
        if (modSessions.length === 0) return null;
        return (
          <ModuleSection
            key={mod.id}
            moduleName={mod.name}
            hours={mod.hours}
            sessionCount={modSessions.length}
            sessions={modSessions}
            enrollments={enrollments}
            expandedSessionId={expandedSessionId}
            onToggleSession={(sessionId) =>
              setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId))
            }
            onEdit={openEditModal}
            onDelete={handleDeleteSession}
            fetchAttendance={fetchAttendance}
            attendanceBySession={attendanceBySession}
            saveAttendance={saveAttendance}
            loadingAttendance={loadingAttendance}
            addMaterial={addMaterial}
            removeMaterial={removeMaterial}
            loadingMaterials={loadingMaterials}
            getAttendanceSummary={getAttendanceSummary}
          />
        );
      })}

      {sessionsByModule.has('none') && (
        <ModuleSection
          moduleName="Sin módulo"
          hours={null}
          sessionCount={sessionsByModule.get('none')!.length}
          sessions={sessionsByModule.get('none')!}
          enrollments={enrollments}
          expandedSessionId={expandedSessionId}
          onToggleSession={(sessionId) =>
            setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId))
          }
          onEdit={openEditModal}
          onDelete={handleDeleteSession}
          fetchAttendance={fetchAttendance}
          attendanceBySession={attendanceBySession}
          saveAttendance={saveAttendance}
          loadingAttendance={loadingAttendance}
          addMaterial={addMaterial}
          removeMaterial={removeMaterial}
          loadingMaterials={loadingMaterials}
          getAttendanceSummary={getAttendanceSummary}
        />
      )}

      {sessions.length === 0 && (
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-8 text-center text-text-muted">
          No hay clases registradas. Agrega la primera clase.
        </div>
      )}

      <SessionFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        cohortId={cohortId}
        modules={modules}
        session={editingSession}
        onDataChange={onDataChange}
      />
    </div>
  );
}

interface ModuleSectionProps {
  moduleName: string;
  hours: number | null;
  sessionCount: number;
  sessions: Session[];
  enrollments: EnrollmentWithProfile[];
  expandedSessionId: number | null;
  onToggleSession: (sessionId: number) => void;
  onEdit: (s: Session) => void;
  onDelete: (id: number) => void;
  fetchAttendance: (sessionId: number) => void;
  attendanceBySession: Record<
    number,
    { enrollment_id: number; status: AttendanceStatus; notes: string | null }[]
  >;
  saveAttendance: (
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string | null
  ) => void;
  loadingAttendance: Record<number, boolean>;
  addMaterial: (sessionId: number, mat: SessionMaterial) => void;
  removeMaterial: (sessionId: number, index: number) => void;
  loadingMaterials: Record<number, boolean>;
  getAttendanceSummary: (sessionId: number) => string | null;
}

function ModuleSection({
  moduleName,
  hours,
  sessionCount,
  sessions,
  enrollments,
  expandedSessionId,
  onToggleSession,
  onEdit,
  onDelete,
  fetchAttendance,
  attendanceBySession,
  saveAttendance,
  loadingAttendance,
  addMaterial,
  removeMaterial,
  loadingMaterials,
  getAttendanceSummary,
}: ModuleSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden"
      aria-labelledby={`module-${moduleName.replace(/\s/g, '-')}`}
    >
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-bg-secondary/50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
        )}
        <h2
          id={`module-${moduleName.replace(/\s/g, '-')}`}
          className="text-lg font-semibold text-text-primary"
        >
          {moduleName}
        </h2>
        {hours != null && (
          <span className="text-sm text-text-muted">{hours} h</span>
        )}
        <span className="text-sm text-text-muted">
          {sessionCount} {sessionCount === 1 ? 'clase' : 'clases'}
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-border-color divide-y divide-border-color">
          {sessions.map((session) => {
            const handleToggle = () => onToggleSession(session.id);
            return (
            <SessionRow
              key={session.id}
              session={session}
              enrollments={enrollments}
              isExpanded={expandedSessionId === session.id}
              onToggleExpand={handleToggle}
              onExpand={() => {
                if (!attendanceBySession[session.id]) fetchAttendance(session.id);
              }}
              onEdit={() => onEdit(session)}
              onDelete={() => onDelete(session.id)}
              attendanceList={attendanceBySession[session.id]}
              saveAttendance={saveAttendance}
              loadingAttendance={loadingAttendance[session.id] ?? false}
              addMaterial={addMaterial}
              removeMaterial={removeMaterial}
              loadingMaterials={loadingMaterials[session.id] ?? false}
              attendanceSummary={getAttendanceSummary(session.id)}
            />
            );
          })}
        </div>
      )}
    </section>
  );
}

interface SessionRowProps {
  session: Session;
  enrollments: EnrollmentWithProfile[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  attendanceList?: { enrollment_id: number; status: AttendanceStatus; notes: string | null }[];
  saveAttendance: (
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
    notes: string | null
  ) => void;
  loadingAttendance: boolean;
  addMaterial: (sessionId: number, mat: SessionMaterial) => void;
  removeMaterial: (sessionId: number, index: number) => void;
  loadingMaterials: boolean;
  attendanceSummary: string | null;
}

function SessionRow({
  session,
  enrollments,
  isExpanded,
  onToggleExpand,
  onExpand,
  onEdit,
  onDelete,
  attendanceList,
  saveAttendance,
  loadingAttendance,
  addMaterial,
  removeMaterial,
  loadingMaterials,
  attendanceSummary,
}: SessionRowProps) {
  const materials = (session.materials ?? []) as SessionMaterial[];
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatUrl, setNewMatUrl] = useState('');
  const [newMatType, setNewMatType] = useState<SessionMaterial['type']>('link');

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim() || !newMatUrl.trim()) return;
    addMaterial(session.id, {
      title: newMatTitle.trim(),
      url: newMatUrl.trim(),
      type: newMatType,
    });
    setNewMatTitle('');
    setNewMatUrl('');
  };

  const handleToggle = () => {
    onToggleExpand();
    if (!isExpanded) onExpand();
  };

  return (
    <div>
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-bg-secondary/30 transition-colors">
        <button
          type="button"
          onClick={handleToggle}
          className="text-text-muted hover:text-text-primary shrink-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">
            {session.title || 'Sin título'}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatSessionDate(session.starts_at, session.ends_at)}
            </span>
            {session.room && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {session.room}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
            <FileText className="w-3.5 h-3.5" />
            {materials.length}
          </span>
          {attendanceSummary != null ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-muted border border-border-color">
              {attendanceSummary} asistieron
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-text-muted border border-border-color">
              —
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-text-muted hover:text-secondary transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-text-muted hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-bg-secondary/20 px-6 py-4 space-y-6 border-t border-border-color">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Material</h3>
            <ul className="space-y-2 mb-4">
              {materials.map((mat, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[var(--card-background)] border border-border-color"
                >
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary hover:underline truncate"
                  >
                    <MaterialIcon type={mat.type} />
                    {mat.title}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeMaterial(session.id, i)}
                    className="p-1.5 text-text-muted hover:text-red-500 transition-colors shrink-0"
                    title="Quitar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddMaterial} className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Título"
                value={newMatTitle}
                onChange={(e) => setNewMatTitle(e.target.value)}
                className="flex-1 min-w-[120px] rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder-text-muted"
              />
              <input
                type="url"
                placeholder="URL"
                value={newMatUrl}
                onChange={(e) => setNewMatUrl(e.target.value)}
                className="flex-1 min-w-[160px] rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder-text-muted"
              />
              <select
                value={newMatType}
                onChange={(e) => setNewMatType(e.target.value as SessionMaterial['type'])}
                className="rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-sm text-text-primary"
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loadingMaterials}
                className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-1"
              >
                {loadingMaterials ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Añadir
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Asistencia</h3>
            {loadingAttendance ? (
              <div className="flex items-center gap-2 text-text-muted py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-color">
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Estudiante</th>
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Estatus</th>
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => {
                      const prof = e.profiles ?? (e as { profile?: { first_name: string; last_name: string; email: string } }).profile;
                      const name = prof
                        ? `${prof.first_name} ${prof.last_name}`.trim() || prof.email
                        : e.student_id;
                      const rec = attendanceList?.find((r) => r.enrollment_id === e.id);
                      const status = (rec?.status ?? 'absent') as AttendanceStatus;
                      return (
                        <tr key={e.id} className="border-b border-border-color/50">
                          <td className="py-2 px-3 text-text-primary">{name}</td>
                          <td className="py-2 px-3">
                            <select
                              value={status}
                              onChange={(ev) =>
                                saveAttendance(
                                  session.id,
                                  e.id,
                                  ev.target.value as AttendanceStatus,
                                  rec?.notes ?? null
                                )
                              }
                              className="rounded border border-border-color bg-bg-secondary px-2 py-1 text-text-primary text-sm"
                            >
                              {(Object.entries(ATTENDANCE_LABELS) as [AttendanceStatus, string][]).map(
                                ([val, label]) => (
                                  <option key={val} value={val}>
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Opcional"
                              defaultValue={rec?.notes ?? ''}
                              onBlur={(ev) => {
                                const v = ev.target.value.trim() || null;
                                if (v !== (rec?.notes ?? null)) {
                                  saveAttendance(session.id, e.id, status, v);
                                }
                              }}
                              className="w-full max-w-[140px] rounded border border-border-color bg-bg-secondary px-2 py-1 text-text-primary text-sm"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
