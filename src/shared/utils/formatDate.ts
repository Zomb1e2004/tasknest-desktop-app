export function formatDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;

  const formatted = new Intl.DateTimeFormat("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);

  return String(formatted);
}
