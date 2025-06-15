import React, { useState } from 'react'
import {
  UserIcon,
  MailIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  Phone,
  Calendar,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'

interface UserTableProps {
  users: User[]
  getUsers: () => Promise<void>
}

type SortField = 'createdAt' | 'rol' | null;
type SortDirection = 'asc' | 'desc';

const UserTable: React.FC<UserTableProps> = ({ users, getUsers }) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      
      return <ArrowUpDown size={16} className="ml-1" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUp size={16} className="ml-1 text-blue-600" /> :
      <ArrowDown size={16} className="ml-1 text-blue-600" />;
  };

  const handleConvertToAdmin = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        rol: 'admin'
      });
      getUsers()
    } catch (error) {
      console.error('Error al convertir al admin:', error);
    }
  }

  const handleConvertToUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        rol: 'customer'
      });
      getUsers()
    } catch (error) {
      console.error('Error al convertir al usuario:', error);
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = a.createdAt?.toDate().getTime() || 0;
      const dateB = b.createdAt?.toDate().getTime() || 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (sortField === 'rol') {
      const rolA = a.rol || 'customer';
      const rolB = b.rol || 'customer';
      return sortDirection === 'asc'
        ? rolA.localeCompare(rolB)
        : rolB.localeCompare(rolA);
    }

    return 0;
  });

  return (
    <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Teléfono
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rol')}
              >
                <div className="flex items-center">
                  Rol
                  {getSortIcon('rol')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Fecha de registro
                  <span className='ml-1'>{getSortIcon('createdAt')}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {user.name} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{user.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900 capitalize">
                        <span className={`${user.rol === 'admin' ? 'text-blue-600 font-medium' : ''}`}>
                          {user.rol || 'Customer'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900 capitalize">
                        {user.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.rol === 'customer' || user.rol === undefined ? (
                      <button
                        onClick={() => handleConvertToAdmin(user.id)}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                      >
                        Convertir en admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConvertToUser(user.id)}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                      >
                        Convertir en cliente
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserTable