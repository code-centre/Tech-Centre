import { useEffect, useState } from "react"
import DetailCourseComponent from "@/components/course/DetailCourse"
import TechFoundamentsContainer from "@/components/tech-foundaments/TechFoundamentsContainer"
import { db } from "../../../../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import Loader from "@/components/Loader"
import DetailCourseContent from "@/components/course/DetailCourseContent"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DetailCourse({ params }: Props) {
  const { slug } = await params
  console.log("cod2",slug)
  return (
    <DetailCourseContent slug={slug} />
  )
}
