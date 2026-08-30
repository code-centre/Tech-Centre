export default function ProgramasAcademicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solo aparta el espacio de la barra fija. El ancho máximo lo pone cada
  // página: el detalle de programa necesita que su encabezado vaya a sangre,
  // y un contenedor aquí se lo impedía.
  return <main className="mt-16">{children}</main>;
}
