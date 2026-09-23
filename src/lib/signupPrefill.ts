/** Datos que el registro puede heredar de la inscripción. */
export interface SignupPrefill {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function splitFullName(nombre: string): Pick<SignupPrefill, "firstName" | "lastName"> {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function clip(value: string | null | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

export function signupPrefillFromSearchParams(params: {
  email?: string;
  firstName?: string;
  lastName?: string;
  nombre?: string;
  phone?: string;
  telefono?: string;
}): SignupPrefill {
  const fromName = splitFullName(clip(params.nombre, 160));
  return {
    firstName: clip(params.firstName, 80) || fromName.firstName,
    lastName: clip(params.lastName, 80) || fromName.lastName,
    email: clip(params.email, 254),
    phone: clip(params.phone, 20) || clip(params.telefono, 20),
  };
}