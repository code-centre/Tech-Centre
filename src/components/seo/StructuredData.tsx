import React from 'react'

interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface OrganizationSchemaProps {
  name?: string
  url?: string
  logo?: string
  description?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    telephone?: string
    contactType?: string
    email?: string
  }
}

export function OrganizationSchema({
  name = "Tech Centre",
  url = process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co",
  logo = `${process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co"}/tech-center-logos/TechCentreLogoColor.png`,
  description = "Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia.",
  address,
  contactPoint,
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    ...(address && {
      address: {
        "@type": "PostalAddress",
        ...address,
      },
    }),
    ...(contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        ...contactPoint,
      },
    }),
  }

  return <StructuredData data={schema} />
}

interface EducationalOrganizationSchemaProps {
  name?: string
  url?: string
  logo?: string
  description?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
}

export function EducationalOrganizationSchema({
  name = "Tech Centre",
  url = process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co",
  logo = `${process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co"}/tech-center-logos/TechCentreLogoColor.png`,
  description = "Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia.",
  address,
}: EducationalOrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name,
    url,
    logo,
    description,
    ...(address && {
      address: {
        "@type": "PostalAddress",
        ...address,
      },
    }),
  }

  return <StructuredData data={schema} />
}

interface LocalBusinessSchemaProps {
  name?: string
  url?: string
  logo?: string
  description?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  telephone?: string
  priceRange?: string
}

export function LocalBusinessSchema({
  name = "Tech Centre",
  url = process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co",
  logo = `${process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co"}/tech-center-logos/TechCentreLogoColor.png`,
  description = "Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia.",
  address = {
    addressLocality: "Barranquilla",
    addressRegion: "Atlántico",
    addressCountry: "CO",
  },
  telephone,
  priceRange,
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url,
    logo,
    description,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    ...(telephone && { telephone }),
    ...(priceRange && { priceRange }),
  }

  return <StructuredData data={schema} />
}

interface CourseSchemaProps {
  name: string
  description: string
  provider: {
    name: string
    url: string
  }
  image?: string
  courseCode?: string
  educationalCredentialAwarded?: string
  teaches?: string[]
  timeRequired?: string
  coursePrerequisites?: string
  url?: string
}

export function CourseSchema({
  name,
  description,
  provider,
  image,
  courseCode,
  educationalCredentialAwarded,
  teaches,
  timeRequired,
  coursePrerequisites,
  url,
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider.name,
      url: provider.url,
    },
    ...(image && { image }),
    ...(courseCode && { courseCode }),
    ...(educationalCredentialAwarded && { educationalCredentialAwarded }),
    ...(teaches && teaches.length > 0 && { teaches }),
    ...(timeRequired && { timeRequired }),
    ...(coursePrerequisites && { coursePrerequisites }),
    ...(url && { url }),
  }

  return <StructuredData data={schema} />
}

interface BreadcrumbListSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbListSchema({ items }: BreadcrumbListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <StructuredData data={schema} />
}
