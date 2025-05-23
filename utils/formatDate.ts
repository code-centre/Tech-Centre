export function formatDate(dateToFormat: string) {
  const dateCourse = new Date(`${dateToFormat}T00:00:00-05:00`); 
  const formattedDate = dateCourse.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota'
  });
  return formattedDate;
}