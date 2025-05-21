export function formatDate(dateToFormat: string) {
  const dateCourse = new Date(`${dateToFormat}T00:00:00`)
  const formattedDate = dateCourse.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long'
  });
  const dateParts = formattedDate.split('-');
  const finalDate = `${Number(dateParts[0])} de ${dateParts[1]}`;
  return finalDate
}