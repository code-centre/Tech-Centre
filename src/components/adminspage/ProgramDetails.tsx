export default function ProgramDetails({ program }: { program: any }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{program.name}</h1>
      <p className="text-gray-600">{program.code}</p>
      <p className="text-gray-600">{program.difficulty}</p>
      <p className="text-gray-600">{program.kind}</p>
      <p className="text-gray-600">{program.total_hours}</p>
      <p className="text-gray-600">{program.default_price}</p>
      <p className="text-gray-600">
        Estado: {program.is_active ? 'Activo' : 'Inactivo'} </p>
      <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(program.syllabus, null, 2)}
        </pre>
      {/* Otros detalles del programa */}
    </div>
  );
}