'use client';

// Datos de ejemplo para las tareas
const mockHomeworks = [
  {
    id: 1,
    studentName: 'Juan Pérez',
    email: 'juan@example.com',
    assignment: 'Tarea 1 - Introducción a React',
    submissionDate: '2025-11-28',
    status: 'Entregado',
    grade: 'A',
  },
  {
    id: 2,
    studentName: 'María García',
    email: 'maria@example.com',
    assignment: 'Tarea 1 - Introducción a React',
    submissionDate: '2025-11-29',
    status: 'Entregado',
    grade: 'B+',
  },
  {
    id: 3,
    studentName: 'Carlos López',
    email: 'carlos@example.com',
    assignment: 'Tarea 1 - Introducción a React',
    submissionDate: '2025-11-27',
    status: 'Pendiente de revisión',
    grade: 'Pendiente',
  },
];

export default function Homeworks() {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estudiante
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Correo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarea
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Entrega
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Calificación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockHomeworks.map((homework) => (
            <tr key={homework.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {homework.studentName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {homework.email}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {homework.assignment}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {homework.submissionDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  homework.status === 'Entregado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {homework.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {homework.grade}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-4">
                  Ver
                </button>
                <button className="text-green-600 hover:text-green-900">
                  Calificar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}