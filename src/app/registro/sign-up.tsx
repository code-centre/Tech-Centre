"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type IdType = 'CC' | 'TI' | 'CE' | 'PASSPORT';
type UserRole = 'ADMIN' | 'USER' | 'STUDENT' | 'TEACHER';

const SignUp: React.FC = () => {
  const router = useRouter();
  
  // Auth Data
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  // User Data
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [idType, setIdType] = useState<IdType>('CC');
  const [idNumber, setIdNumber] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [role, setRole] = useState<UserRole>('USER');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  
  // Status
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      console.log('Iniciando registro...');
      
      // 1. Registrar el usuario en Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      console.log('Respuesta de signUp:', { authData, signUpError });

      if (signUpError) {
        console.error('Error en signUp:', signUpError);
        throw new Error(signUpError.message || 'Error al crear el usuario');
      }

      // 2. Si el registro es exitoso, crear el perfil
      if (authData?.user) {
        console.log('Usuario creado, creando perfil...');
        
        const profileData = {
          user_id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          id_type: idType || null,
          id_number: idNumber || null,
          birthdate,
          address: address || null,
          role: 'lead',
          updated_at: new Date().toISOString(),
        };

        console.log('Datos del perfil a guardar:', profileData);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();

        console.log('Respuesta de inserción de perfil:', { data, profileError });

        if (profileError) {
          console.error('Error al crear perfil:', profileError);
          // Intentar eliminar el usuario si falla la creación del perfil
          try {
            console.log('Intentando eliminar usuario debido a error en perfil...');
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (deleteError) {
            console.error('Error al eliminar usuario después de fallo en perfil:', deleteError);
          }
          throw new Error(profileError.message || 'Error al guardar el perfil del usuario');
        }

        console.log('Registro exitoso, redirigiendo...');
        setIsRegistered(true);  // <-- Añade esta línea
        // 3. Redirigir a la página de verificación de email
        router.push('/iniciar-sesion?verification=email-sent');
      } else {
        console.error('No se recibió el usuario en la respuesta de registro');
        throw new Error('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } catch (error: any) {
      console.error('Error detallado en el registro:', {
        error,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        stack: error?.stack,
      });
      
      const errorMessage = error?.message || 'Error al registrarse. Por favor intenta de nuevo.';
      console.error('Mensaje de error para el usuario:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendStatus({type: null, message: ''});
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsResending(false);
    
    if (error) {
      setResendStatus({type: 'error', message: 'Error al reenviar el correo'});
    } else {
      setResendStatus({type: 'success', message: '¡Correo de verificación enviado!'});
    }
  };

  return (
      <div className="max-w-3xl mx-auto w-full bg-gradient-to-b from-white to-blue-50 border-2 border-blue-600 p-6 md:p-10 rounded-xl shadow-lg space-y-6 mt-10">
        <header className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-400">
            Registro de usuario
          </h2>
          <p className="text-sm md:text-base text-gray-700">
            Por favor, completa todos los campos para crear tu cuenta.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
          {/* Sección de Información Personal */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tipo de Identificación <span className="text-red-500">*</span>
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as IdType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un tipo de identificación</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extrangería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PA">Pasaporte</option>
                  <option value="PEP">Persona con Prueba de Excepción</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Número de Identificación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Número de identificación"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
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
              <span className="text-gray-900 font-semibold">Dirección</span>
              <input
                type="text"
                placeholder="Dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </label>
            
          </div>
            <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-400 hover:bg-blue-600 hover:scale-[1.01] text-white font-semibold rounded-lg transition duration-300 shadow-md flex items-center justify-center"
            >
            Crear cuenta
          </button>
          {isRegistered && (
            <div className="mt-4 text-center">
              <p className="mb-2">¿No recibiste el correo de verificación?</p>
              <button 
                onClick={handleResendVerification}
                disabled={isResending}
                className={`px-4 py-2 rounded-md ${
                  isResending 
                    ? 'bg-gray-300' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isResending ? 'Enviando...' : 'Reenviar correo de verificación'}
              </button>
              {resendStatus.message && (
                <p className={`mt-2 ${
                  resendStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resendStatus.message}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
  );
};

export default SignUp;
