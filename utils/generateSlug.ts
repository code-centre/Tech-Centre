export function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[áäâà]/g, "a")
      .replace(/[éëêè]/g, "e")
      .replace(/[íïîì]/g, "i")
      .replace(/[óöôò]/g, "o")
      .replace(/[úüûù]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }
  