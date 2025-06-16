import React, { useEffect, useState } from 'react'
import UserTable from './UserTable'
import UserFilter from './UserFilter'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../firebase'

const UserDashboard = () => {
  const [users, setUsers] = useState<User[] | []>([])
  const [filteredUsers, setFilteredUsers] = useState<User[] | []>([])
  const [filterText, setFilterText] = useState('')

  const getUsers = async () => {
    const qUser = query(collection(db, "users"))
    const querySnapshotUser = await getDocs(qUser)
    const users = querySnapshotUser.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data()
      } as User
    })

    // const qSpeakers = query(collection(db, "speakers"))
    // const querySnapshotSpeakers = await getDocs(qSpeakers)
    // const speakers = querySnapshotSpeakers.docs.map((doc) => doc.data() as User)

    // console.log(speakers);

    setUsers([...users].sort((a, b) => a.name.localeCompare(b.name)));
    setFilteredUsers([...users].sort((a, b) => a.name.localeCompare(b.name)))
  }

  useEffect(() => {
    getUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        (user.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (user.rol || '').toLowerCase().includes(filterText.toLowerCase())
    )
    setFilteredUsers(filtered.sort((a, b) => a.name.localeCompare(b.name)))
  }, [filterText, users])
  return (
    <div className="w-full mx-auto p-6 md:py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Tabla de Usuarios
      </h1>
      <UserFilter filterText={filterText} setFilterText={setFilterText} />
      <UserTable users={filteredUsers} getUsers={getUsers} />
    </div>
  )
}
export default UserDashboard
