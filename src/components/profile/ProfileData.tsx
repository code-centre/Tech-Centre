import { db } from '../../../firebase'
import useUserStore from '../../../store/useUserStore'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { MailIcon, PhoneIcon, SaveIcon, UserIcon, IdCardIcon, MapPinIcon, BriefcaseIcon, CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { cn } from '../../../utils/cn'


export default function ProfileData() {
  const { user, setUser } = useUserStore()
  const [isEditing, setIsEditing] = useState(false)
  const [gender, setGender] = useState(user?.gender)
  const [phone, setPhone] = useState(user?.phone)
  const [occupation, setOccupation] = useState(user?.occupation)
  const [typeID, setTypeID] = useState<string>(user?.typeID ? user?.typeID : 'Sin asignar')
  const [iDNumber, setIDNumber] = useState<string | number>(user?.idNumber ? user?.idNumber : 'Sin asignar')
  const [city, setCity] = useState<string>(user?.city ? user?.city : 'Sin asignar')
  const [address, setAddress] = useState<string>(user?.address ? user?.address : 'Sin asignar')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, {
        occupation,
        gender,
        phone,
        city,
        address,
        typeID,
        iDNumber: Number(iDNumber)
      })
      const newUser = (await getDoc(userDocRef)).data() as User
      setUser({ ...newUser, id: user.id });

      setIsEditing(false)
    }
  }

  function calcularEdad(fechaNacimiento: string) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    // Si el mes actual es menor al de nacimiento o está en el mismo mes pero el día es menor, restamos un año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  const handleInputChange = (section: string, field: string, value: string) => {
  }

  if (!user) {
    router.push('/')
    return null
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-bgCard rounded-xl shadow-md overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center mb-4">
            <UserIcon size={20} className="text-blueApp mr-2" />
            <h2 className="text-lg font-medium text-white">
              Información General
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre
              </label>
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>{user.name}</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Apellido
              </label>
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>{user.lastName}</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <IdCardIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Tipo de ID
                </label>
              </div>
              <select
                onChange={(e) =>
                  setTypeID(e.target.value)
                }
                value={typeID!}
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              >
                <option value="sin asignar">Sin asignar</option>
                <option value="CC">CC</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <IdCardIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Número de ID
                </label>
              </div>
              <input
                type="text"
                value={iDNumber}
                onChange={(e) =>
                  setIDNumber(e.target.value)
                }
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center mb-4">
            <MailIcon size={20} className="text-blueApp mr-2" />
            <h2 className="text-lg font-medium text-white">
              Información de Contacto
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <MailIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
              </div>
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>{user.email}</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <PhoneIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center mb-4">
            <MapPinIcon size={20} className="text-blueApp mr-2" />
            <h2 className="text-lg font-medium text-white">
              Información Demográfica
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <CalendarIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Edad
                </label>
              </div>
              <p className='text-sm text-white border-b border-gray-700/50 py-2 w-full'>{calcularEdad(user.birthDate)} años</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <UserIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Género
                </label>
              </div>
              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value)
                }
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              >               
                <option value="HOMBRE">Masculino</option>
                <option value="MUJER">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <BriefcaseIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Ocupación
                </label>
              </div>
              <select
                value={occupation}
                onChange={(e) =>
                  setOccupation(
                    e.target.value,
                  )
                }
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              >
                <option value="STUDENT">Estudiante</option>
                <option value="ENTREPRENEUR">Emprendedor</option>
                <option value="TECH PROFESIONAL">
                  Profesional de la industria tech
                </option>
                <option value="NON TECH PROFESIONAL">
                  Profesional de otra industria
                </option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <MapPinIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Ciudad
                </label>
              </div>
              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              />
            </div>
            <div className="md:col-span-2 bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center mb-1">
                <MapPinIcon size={16} className="text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-300">
                  Dirección
                </label>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                disabled={!isEditing}
                className={cn(
                  "w-full p-2 border border-gray-700 rounded-md text-sm bg-gray-800/50 text-white",
                  !isEditing ? "opacity-80 cursor-not-allowed" : "hover:border-blueApp focus:border-blueApp focus:ring focus:ring-blueApp/20"
                )}
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-5 bg-gray-900/50 border-t border-gray-700/30 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-blueApp rounded-md hover:bg-blueApp/80 flex items-center gap-2 transition-all shadow-lg shadow-blueApp/20"
              >
                <SaveIcon size={16} />
                Guardar cambios
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 text-sm font-medium transition-all text-white bg-blueApp rounded-md hover:bg-blueApp/80 shadow-lg shadow-blueApp/20"
            >
              Editar perfil
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
