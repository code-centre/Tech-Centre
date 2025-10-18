export default function ProgramasAcademicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      {children}
    </main>
  );
}