// 'use client'
// import React from 'react'
// import { db } from '@/firebase'
// import { collection, query, where, documentId, getDocs, Timestamp } from 'firebase/firestore'
// import { useEffect, useState } from 'react'
// import CardEvent from '../events/CardEvent'
// import Link from 'next/link'

// export default function PastCoursesSection() {
//     const [courses, setCourses] = useState<any[]>([])
//     const date = new Date()
//     const fullDate = `${date.getFullYear()}-${date.getMonth() + 1 !== 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate()}`


//     const coursesQuery = query(
//         collection(db, 'events'),
//         where('date', '<=', fullDate),
//         where('type', '==', 'taller')
//     )
//     useEffect(() => {
//         const handleGetCourses = async () => {
//             const coursesSnapshot = await getDocs(coursesQuery)
//             setCourses(coursesSnapshot.docs.map((doc) => doc.data()))
//         }
//         handleGetCourses()
//     }, [])

//     return (
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-y-10 gap-4 py-10'>
//             {courses.map((course: EventFCA) => (
//                 <Link key={course.id} href={`/eventos/${course.slug}`}>
//                     <CardEvent eventData={course} />
//                 </Link>
//             ))}
//         </div>
//     )
// }
