'use client'
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import FormInfo from "@/components/course/FormInfo";
import { useRouter } from "next/navigation";
import Hero from "./sections/Hero";
import EsentialDetail from "./EsentialDetail";

interface Props {
  slug: string
}

export default function DetailCourseComponent({ slug }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "programs"), where("slug", "==", slug));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        setCourse({ id: docSnapshot.id, ...docSnapshot.data() }); // Agregamos el id
      } else {
        setCourse(null);
      }
    });

    return () => unsubscribe(); // Limpieza al desmontar
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const router = useRouter()

  const saveChanges = async (
    propertyName: string,
    newValues: any, // Valores opcionales
    index?: number
  ) => {

    if (!newValues) return;
    // if (!newValues || Object.keys(newValues).length === 0) return;

    const currentId = course?.id;
    const programDocRef = doc(db, "programs", currentId);
    const programSnapshot = await getDoc(programDocRef);

    try {
      if (!programSnapshot.exists()) {
        console.error("El documento no existe");
        return;
      }

      const programData = programSnapshot.data();

      if (Array.isArray(programData[propertyName])) {
        // Copia del array para modificarlo sin mutar el original
        let updatedArray = [...programData[propertyName]];


        updatedArray = newValues;

        await updateDoc(programDocRef, {
          [propertyName]: updatedArray,
          updatedAt: serverTimestamp(),
        });

        console.log(`Objeto en índice ${index} actualizado correctamente:`, newValues);
      } else if (propertyName === 'name') {
        const newSlug = newValues?.toLowerCase().replace(/ /g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")


        await updateDoc(programDocRef, {
          ...programData,
          name: newValues,
          id: currentId,
          slug: newSlug,
          updatedAt: serverTimestamp(),
        })


        router.replace(`/cursos/${newSlug}`)
        // window.location.reload()
      } else {
        console.log(newValues, 'else', propertyName);

        await updateDoc(programDocRef, {
          [propertyName]: newValues,
          updatedAt: serverTimestamp(),
        })
      }

    } catch (error) {
      console.error(`Error actualizando ${propertyName}:`, error);
    }
  };

  return (
    <main className={`min-h-screen relative overflow-hidden pb-20`}>
      <img className="absolute -z-10 opacity-25" src="/background.webp" />
      {/* <section className="w-full h-screen bg-opacity-35 bg-cover bg-no-repeat"> */}
      {
        isLoading
        &&
        <div className="flex justify-center items-center h-screen">
          <div className="loader"></div>
        </div>
      }

      {
        !isLoading && course &&
        <div className="flex flex-col gap-10 pt-20 z-10 backdrop-blur-sm">
          <Hero course={course} newDetail={true} saveChanges={saveChanges} />
          {/*  */}
          <EsentialDetail saveChanges={saveChanges} course={course} newDetail={true} />
        </div>
      }
      {/* {
        openModal &&
        <FormInfo setOpenModal={setOpenModal} />
      } */}
      {/* </section> */}
    </main>
  );
}