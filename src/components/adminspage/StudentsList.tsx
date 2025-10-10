'use client';

interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  date: string;
  course: string;
  courseId: string;
}

interface StudentsListProps {
  filters?: {
    searchTerm?: string;
    status?: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
    courseId?: string;
  };
}

export function StudentsList({ filters = {} }: StudentsListProps) {
  // Datos de ejemplo - en una aplicación real, estos vendrían de una API
  const allStudents: Student[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@example.com', status: 'active', date: '2023-01-01', course: 'Curso 1', courseId: '1' },
    { id: '2', name: 'María García', email: 'maria@example.com', status: 'active', date: '2023-01-15', course: 'Curso 2', courseId: '2' },
    { id: '3', name: 'Carlos López', email: 'carlos@example.com', status: 'inactive', date: '2023-02-01', course: 'Curso 3', courseId: '3' },
    { id: '4', name: 'Ana Martínez', email: 'ana@example.com', status: 'active', date: '2023-02-15', course: 'Curso 1', courseId: '1' },
    { id: '5', name: 'Pedro Sánchez', email: 'pedro@example.com', status: 'inactive', date: '2023-03-01', course: 'Curso 2', courseId: '2' },
  ];

  // Aplicar filtros
  const filteredStudents = allStudents.filter(student => {
    if (filters.searchTerm && 
        !student.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !student.email.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.status && student.status !== filters.status) {
      return false;
    }
    if (filters.courseId && student.courseId !== filters.courseId) {
      return false;
    }
    if (filters.startDate && student.date < filters.startDate) {
      return false;
    }
    if (filters.endDate && student.date > filters.endDate) {
      return false;
    }
    return true;
  });

  return (
    <div className="overflow-x-auto bg-bgCard rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="text-blueApp">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Fecha de inscripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Curso
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  student.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {student.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(student.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.course}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                <button className="text-red-600 hover:text-red-900">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron estudiantes que coincidan con los filtros.
        </div>
      )}
    </div>
  );
}