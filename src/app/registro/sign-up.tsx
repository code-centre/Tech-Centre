"use client";
import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

const SignUp: React.FC = () => {
  const router = useRouter();
  // Auth Data
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  // User Data
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("HOMBRE");
  const [birthDate, setBirthDate] = useState<string>("");
  const [occupation, setOccupation] = useState<string>("STUDENT");
  // Status Data
  const [error, setError] = useState<string>("");
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const credentials = await createUserWithEmailAndPassword(email, password);
      console.log(credentials);

      if (credentials && credentials.user) {
        const user = credentials.user;
        // Actualizar el perfil del usuario con el displayName
        await updateProfile(user, {
          displayName: name,
        });
        // Crear un documento en Firestore con información adicional del usuario
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name,
          lastName,
          phone,
          gender,
          birthDate,
          occupation,
          createdAt: new Date(),
        });
        // Limpiar la información
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push("/");
      }
    } catch (error) {
      setError("Error al registrarse. Por favor intenta de nuevo.");
    }
  };

  return (
      <div className="max-w-3xl mx-auto w-full bg-gradient-to-b from-white to-blue-50 border border-blue-100 p-6 md:p-10 rounded-xl shadow-lg space-y-6">
        <header className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-400">
            Registro de usuario
          </h2>
          <p className="text-sm md:text-base text-gray-800">
            Por favor, completa todos los campos para crear tu cuenta.
          </p>
        </header>
        <form onSubmit={handleSignUp} className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6">
            <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
              <span className="text-gray-900 font-semibold">Nombre</span>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
              <span className="text-gray-900 font-semibold">Apellido</span>
              <input
                type="text"
                placeholder="Tu apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium w-full">
            <span className="text-gray-900 font-semibold">Correo electrónico</span>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
              required
            />
          </label>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
                <span className="text-gray-900 font-semibold">Contraseña</span>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
                <span className="text-gray-900 font-semibold">Confirmar contraseña</span>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </label>
            </div>
            {error && <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
              <span className="text-gray-900 font-semibold">Teléfono</span>
              <input
                type="tel"
                placeholder="+57 000 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
              <span className="text-gray-900 font-semibold">Género</span>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 bg-white text-gray-900" 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="HOMBRE">Hombre</option>
                <option value="MUJER">Mujer</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
              <span className="text-gray-900 font-semibold">Fecha de nacimiento</span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium md:w-1/2">
              <span className="text-gray-900 font-semibold">Perfil profesional</span>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 bg-white text-gray-900"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              >
                <option value="STUDENT">Estudiante</option>
                <option value="ENTREPRENEUR">Emprendedor</option>
                <option value="TECH PROFESIONAL">Profesional de la industria tech</option>
                <option value="NON TECH PROFESIONAL">Profesional de otra industria</option>
                <option value="OTHER">Otro</option>
              </select>
            </label>
          </div>

            <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-400 hover:bg-blue-600 hover:scale-[1.01] text-white font-semibold rounded-lg transition duration-300 shadow-md flex items-center justify-center"
            >
            Crear cuenta
          </button>
        </form>
      </div>
  );
};

export default SignUp;
