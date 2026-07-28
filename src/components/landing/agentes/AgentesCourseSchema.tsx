import { AGENTES_COURSE_SCHEMA } from "./data";

/** Course schema.org con offers y hasCourseInstance. */
export default function AgentesCourseSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: AGENTES_COURSE_SCHEMA.name,
    description: AGENTES_COURSE_SCHEMA.description,
    provider: {
      "@type": "Organization",
      name: AGENTES_COURSE_SCHEMA.provider.name,
      url: AGENTES_COURSE_SCHEMA.provider.url,
    },
    image: AGENTES_COURSE_SCHEMA.image,
    courseCode: AGENTES_COURSE_SCHEMA.courseCode,
    educationalCredentialAwarded: AGENTES_COURSE_SCHEMA.educationalCredentialAwarded,
    teaches: AGENTES_COURSE_SCHEMA.teaches,
    timeRequired: AGENTES_COURSE_SCHEMA.timeRequired,
    coursePrerequisites: AGENTES_COURSE_SCHEMA.coursePrerequisites,
    url: AGENTES_COURSE_SCHEMA.url,
    courseMode: "onsite",
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: AGENTES_COURSE_SCHEMA.price,
      priceCurrency: AGENTES_COURSE_SCHEMA.currency,
      availability: "https://schema.org/InStock",
      url: AGENTES_COURSE_SCHEMA.url,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      startDate: AGENTES_COURSE_SCHEMA.startDate,
      location: {
        "@type": "Place",
        name: "Tech Centre · Casa Tech",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Cra. 50 #72-126",
          addressLocality: "Barranquilla",
          addressRegion: "Atlántico",
          addressCountry: "CO",
        },
      },
      courseWorkload: "PT7H",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
