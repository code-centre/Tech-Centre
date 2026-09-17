import {
  DEFAULT_OG_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SLOGAN,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo/site"

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

const DEFAULT_LOGO = `${SITE_URL}/tech-center-logos/TechCentreLogoColor.png`
const DEFAULT_IMAGE = `${SITE_URL}${DEFAULT_OG_PATH}`
const CARIBBEAN_KNOWS = [
  "formación experiencial en tecnología",
  "inteligencia artificial",
  "ingeniería de agentes de IA",
  "desarrollo de software",
  "ciencia de datos",
  "machine learning",
  "programación",
]

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
  sameAs?: string[]
}

export function OrganizationSchema({
  name = SITE_NAME,
  url = SITE_URL,
  logo = DEFAULT_LOGO,
  description = SITE_DESCRIPTION,
  address,
  contactPoint,
  sameAs,
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name,
    alternateName: ["TechCentre", "Centro de Tecnología del Caribe"],
    url,
    logo,
    image: DEFAULT_IMAGE,
    description,
    slogan: SITE_SLOGAN,
    areaServed: [
      { "@type": "Place", name: "Caribe colombiano" },
      { "@type": "City", name: "Barranquilla" },
      { "@type": "Country", name: "Colombia" },
    ],
    knowsAbout: CARIBBEAN_KNOWS,
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
    ...(sameAs && sameAs.length > 0 && { sameAs }),
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
  sameAs?: string[]
}

export function EducationalOrganizationSchema({
  name = SITE_NAME,
  url = SITE_URL,
  logo = DEFAULT_LOGO,
  description = SITE_DESCRIPTION,
  address,
  sameAs,
}: EducationalOrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${url}/#educational-organization`,
    name,
    alternateName: SITE_TAGLINE,
    url,
    logo,
    image: DEFAULT_IMAGE,
    description,
    slogan: SITE_SLOGAN,
    areaServed: [
      { "@type": "Place", name: "Caribe" },
      { "@type": "City", name: "Barranquilla" },
      { "@type": "Country", name: "Colombia" },
    ],
    knowsAbout: CARIBBEAN_KNOWS,
    ...(address && {
      address: {
        "@type": "PostalAddress",
        ...address,
      },
    }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  }

  return <StructuredData data={schema} />
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "es-CO",
    publisher: { "@id": `${SITE_URL}/#organization` },
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
  email?: string
  priceRange?: string
  geo?: {
    latitude: number
    longitude: number
  }
  sameAs?: string[]
  hasMap?: string
}

export function LocalBusinessSchema({
  name = SITE_NAME,
  url = SITE_URL,
  logo = DEFAULT_LOGO,
  description = SITE_DESCRIPTION,
  address = {
    addressLocality: "Barranquilla",
    addressRegion: "Atlántico",
    addressCountry: "CO",
  },
  telephone,
  email,
  priceRange,
  geo,
  sameAs,
  hasMap,
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#local-business`,
    name,
    url,
    logo,
    image: DEFAULT_IMAGE,
    description,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(priceRange && { priceRange }),
    ...(geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
    ...(hasMap && { hasMap }),
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
  publisher = { name: SITE_NAME, logo: DEFAULT_LOGO },
  mainEntityOfPage,
  interactionStatistic,
  commentCount,
}: ArticleSchemaProps) {
  const baseUrl = SITE_URL
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
