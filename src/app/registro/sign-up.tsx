"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import type { Database } from "@/types/supabase";

type IdType = 'CC' | 'TI' | 'CE' | 'PASAPORTE';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  idType: IdType;
  idNumber: string;
  birthdate: string;
  address: string;
}

interface FormErrors {
  [key: string]: string;
}

// Mensajes de error amigables
const getErrorMessage = (error: any): string => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('email') && errorMessage.includes('already')) {
    return 'Este correo electrónico ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.';
  }
  
  if (errorMessage.includes('email') || errorMessage.includes('invalid')) {
    return 'Por favor, ingresa un correo electrónico válido.';
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return 'La contraseña es muy débil. Usa al menos 6 caracteres con letras y números.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Problema de conexión. Por favor, verifica tu internet e intenta nuevamente.';
  }
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
  }
  
  if (errorMessage.includes('profile') || errorMessage.includes('perfil')) {
    return 'Tu cuenta se creó, pero hubo un problema al guardar tu información. Por favor, contacta al soporte.';
  }
  
  if (errorMessage.includes('duplicate') || errorMessage.includes('duplicado') || errorMessage.includes('ya existe')) {
    return errorMessage; // Ya tiene un mensaje amigable
  }
  
  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta al soporte si el problema persiste.';
};

const SignUp: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    idType: 'CC',
    idNumber: "",
    birthdate: "",
    address: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ''});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'El número de identificación es obligatorio';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setResendStatus({type: null, message: ''});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Registrar el usuario en Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Si el registro es exitoso, crear el perfil
      if (authData?.user) {
        console.log('Usuario creado en Auth:', authData.user.id);
        
        // Pequeño delay para asegurar que la sesión esté establecida
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar que tenemos sesión antes de crear el perfil
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sesión después de registro:', session?.user?.id);
        
        const profileData = {
          user_id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          id_type: formData.idType,
          id_number: formData.idNumber || '',
          birthdate: formData.birthdate,
          address: formData.address || null,
          role: 'student' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('Datos del perfil a crear:', profileData);

        const { data: profileDataResult, error: profileError } = await (supabase as any)
          .from('profiles')
          .insert([profileData])
          .select();

        console.log('Respuesta de creación de perfil:', { data: profileDataResult, error: profileError });

        if (profileError) {
          console.error('Error completo al crear perfil:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // Si el error es específico, mostrar mensaje más claro
          if (profileError.code === '23505') {
            // Error de duplicado - verificar si el usuario ya existe
            const { data: existingProfile } = await (supabase as any)
              .from('profiles')
              .select('user_id, email')
              .eq('id_type', formData.idType)
              .eq('id_number', formData.idNumber)
              .maybeSingle();
            
            if (existingProfile) {
              throw new Error('Ya existe una cuenta con este tipo y número de identificación. Por favor, inicia sesión o recupera tu contraseña si la olvidaste.');
            } else {
              throw new Error('Ya existe un perfil con estos datos. Por favor, inicia sesión.');
            }
          } else if (profileError.code === '23503') {
            throw new Error('Error de referencia. El usuario no existe en el sistema.');
          } else if (profileError.message) {
            throw new Error(`Error al crear el perfil: ${profileError.message}`);
          } else {
            throw new Error('Error al guardar el perfil del usuario. Por favor, contacta al soporte.');
          }
        }

        if (!profileDataResult || !profileDataResult[0]) {
          console.error('No se recibieron datos del perfil creado');
          throw new Error('El perfil se creó pero no se pudieron recuperar los datos. Por favor, inicia sesión.');
        }

        console.log('Perfil creado exitosamente:', profileDataResult[0]);
        setIsRegistered(true);
        router.push('/iniciar-sesion?verification=email-sent');
      } else {
        throw new Error('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } catch (error: any) {
      const friendlyMessage = getErrorMessage(error);
      setErrors({ general: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus({type: null, message: ''});
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: formData.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setResendStatus({
        type: 'error', 
        message: 'No pudimos reenviar el correo. Verifica que el correo sea correcto.'
      });
    } else {
      setResendStatus({
        type: 'success', 
        message: '¡Correo de verificación enviado! Revisa tu bandeja de entrada.'
      });
    }
  };

  return (
      <div className="max-w-3xl mx-auto w-full bg-gradient-to-b from-white to-blue-50 border-2 border-blue-600 p-6 md:p-10 rounded-xl shadow-lg space-y-6 mt-10">
        <header className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-400">
            Crea tu cuenta
          </h2>
          <p className="text-sm md:text-base text-gray-700">
            Completa el formulario para comenzar tu formación en tecnología
          </p>
        </header>

        {errors.general && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1">{errors.general}</p>
          </div>
        )}

        {isRegistered && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg flex items-start gap-3">
            <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">¡Cuenta creada exitosamente!</p>
              <p className="text-sm">Te hemos enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
            </div>
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
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tipo de Identificación <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.idType}
                  onChange={(e) => updateField('idType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extrangería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Número de Identificación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Número de identificación"
                  value={formData.idNumber}
                  onChange={(e) => updateField('idNumber', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.idNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.idNumber && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.idNumber}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => updateField('birthdate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.birthdate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthdate && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.birthdate}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 3001234567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
          

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Dirección (opcional)
            </label>
            <input
              type="text"
              placeholder="Tu dirección"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-300 shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Crear cuenta</span>
              </>
            )}
          </button>

          {isRegistered && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 mb-3">
                ¿No recibiste el correo de verificación?
              </p>
              <button 
                onClick={handleResendVerification}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
              >
                Reenviar correo de verificación
              </button>
              {resendStatus.message && (
                <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  resendStatus.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {resendStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{resendStatus.message}</p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
  );
};

export default SignUp;
