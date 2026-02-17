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

interface CollectionPageSchemaProps {
  name: string
  description: string
  url: string
  items: Array<{
    name: string
    url: string
    description?: string
  }>
}

export function CollectionPageSchema({
  name,
  description,
  url,
  items,
}: CollectionPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Article",
          name: item.name,
          url: item.url,
          ...(item.description && { description: item.description }),
        },
      })),
    },
  }

  return <StructuredData data={schema} />
}

interface ArticleSchemaProps {
  headline: string
  description: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: { name: string }
  publisher?: { name: string; logo?: string }
  mainEntityOfPage?: string
  interactionStatistic?: { userInteractionCount: number }
  commentCount?: number
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher = { name: "Tech Centre", logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co"}/tech-center-logos/TechCentreLogoColor.png` },
  mainEntityOfPage,
  interactionStatistic,
  commentCount,
}: ArticleSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techcentre.co"
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    ...(image && { image }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(author && {
      author: {
        "@type": "Person",
        name: author.name,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: publisher.name,
      ...(publisher.logo && {
        logo: {
          "@type": "ImageObject",
          url: publisher.logo,
        },
      }),
    },
    ...(mainEntityOfPage && { mainEntityOfPage }),
    ...(interactionStatistic && {
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: interactionStatistic.userInteractionCount,
      },
    }),
    ...(commentCount !== undefined && { commentCount }),
  }

  return <StructuredData data={schema} />
}
