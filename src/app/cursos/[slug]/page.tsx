import React from "react";
import DetailCourseComponent from "@/components/course/DetailCourse";

interface Props {
  params: {
    slug: string;
  };
}

export default async function DetailCourse({ params }: Props) {
  return (
    <section className="min-h-screen py-20 px-4 bg-black text-zinc-200">
      <div className="max-w-7xl mx-auto">
        <DetailCourseComponent slug={params.slug} />
      </div>
    </section>
  );
}
