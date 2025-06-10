'use client'
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { EditIcon, InfoIcon } from "../Icons";
import { formatDate } from "../../../utils/formatDate";
import { ImageUpIcon } from "lucide-react";
import FileUpload from "../FileUpload";
import useUserStore from "../../../store/useUserStore";
interface Props {
  course: any;
}

export default function CourseCard({ course }: Props) {
  const { user } = useUserStore()
  const [coverUrl, setCoverUrl] = useState<string>();

  const handleCoverUpload = (url: string) => {
    setCoverUrl(url);
  };


  return (
    <article
      className={`relative h-auto overflow-hidden flex flex-col border items-start md:w-[320px] xl:w-[360px] bg-white hover:shadow-md rounded-md transition-all`}
    >
      {/* <Link href={`/cursos/nuevo?edit=true&slug=${course.slug}`} className="absolute -top-2 -right-2 p-2 z-10 bg-black/50 rounded-full">
        <EditIcon className="w-6 h-6 text-white cursor-pointer" />
      </Link> */}
      <div className="relative w-full">
        <Image
          src={coverUrl || course.image}
          alt={course.name}
          width={500}
          height={200}
          className="w-full object-contain"
        />
      </div>
      <div className="flex justify-between items-center gap-2 absolute w-full top-3 px-3">
        <div className="flex items-center gap-2">
          <p className="bg-gray-100/80 border px-2 py-1 text-sm rounded-md font-semibold">{course.level}</p>
          {
            course.status === 'Borrador' &&
            <p className="bg-green-500 text-white border px-2 py-1 text-sm rounded-md font-semibold">{course.status}</p>
          }
        </div>
        {
          user?.rol === 'admin' &&
          <FileUpload isImage entityId={course.id} onFileUpload={handleCoverUpload} previewUrl={coverUrl} isCourseCard />
        }

        {/* <ImageUpIcon className="cursor-pointer text-white" onClick={() => {console.log(course.id);
        }} /> */}
      </div>
      <div className="px-4 py-4 pt-8 flex relative flex-col flex-1 gap-3">
        {/* <div className="flex items-center gap-4 w-fit absolute -top-7 mx-auto left-0 right-0 bg-gray-300/40 backdrop-blur-md px-4 py-2 rounded-lg">
          <Image src="/calendar.png" width={25} height={25} alt="" />
          <div>
            <p className="leading-tight font-bold text-sm">
              {course.startDate}
            </p>
            <p className="text-[13px] -mt-1">Cupos Disponibles</p>
          </div>
        </div> */}
        <p className="uppercase text-gray-400 text-[12px]">
          {course.type} | {course.duration} - {course.hours}
        </p>
        <div className="flex flex-col justify-between flex-1">
          <div>
            <h2 className="text-2xl font-bold text-sky-500">{course.name}</h2>
            <h3 className="text-xl font-bold text-sky-500 mb-1 line-clamp-1 capitalize">
              {course.subtitle}
            </h3>
            <p className="text-[13px] line-clamp-3 mt-3">{course.shortDescription}</p>
          </div>

          <div className="flex text-sm mt-6 justify-between items-center">
            <span className="text-gray-600 font-semibold">Inicio:</span>
            <p className="font-bold text-orange-500 text-lg ">{formatDate(course.startDate)}</p>
            <Link
              className="text-center text-white py-2 px-5 text-sm uppercase hover:bg-black/80 rounded-md font-semibold bg-black "
              href={`/cursos/${course.slug}`}
            >
              Saber más
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
