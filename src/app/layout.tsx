import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OrganizationSchema, EducationalOrganizationSchema } from "@/components/seo/StructuredData";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tech Centre - Centro de tecnología del Caribe",
    template: "%s | Tech Centre"
  },
  description: "Tech Centre - Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia. Educación tecnológica de calidad en Barranquilla, Colombia.",
  keywords: [
    "centro tecnología Caribe",
    "cursos programación Barranquilla",
    "diplomados tech Colombia",
    "educación tecnológica vanguardia",
    "formación tech Caribe",
    "aprender tecnología Barranquilla",
    "cursos tecnología calidad",
    "centro formación tech Caribe colombiano",
    "programación Caribe",
    "tecnología vanguardia Colombia",
    "inteligencia artificial",
    "análisis de datos",
    "python",
    "agentes IA",
    "javascript",
    "react",
    "diseño",
    "figma",
    "desarrollo web",
    "machine learning",
    "data science",
    "programación python",
    "desarrollo react",
    "diseño UI/UX",
    "análisis datos python",
    "inteligencia artificial Colombia",
    "cursos python Barranquilla",
    "cursos react Caribe",
    "diseño figma Barranquilla",
  ],
  authors: [{ name: "Tech Centre" }],
  creator: "Tech Centre",
  publisher: "Tech Centre",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "Tech Centre",
    title: "Tech Centre - Centro de Tecnología del Caribe | Educación Tech de Vanguardia",
    description: "Tech Centre - Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia. Educación tecnológica de calidad en Barranquilla, Colombia.",
    images: [
      {
        url: "/tech-center-logos/TechCentreLogoColor.png",
        width: 1200,
        height: 630,
        alt: "Tech Centre - Centro de Tecnología del Caribe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Centre - Centro de Tecnología del Caribe | Educación Tech de Vanguardia",
    description: "Tech Centre - Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia. Educación tecnológica de calidad en Barranquilla, Colombia.",
    images: ["/tech-center-logos/TechCentreLogoColor.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Agregar códigos de verificación cuando estén disponibles
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
     <body
        className={`${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider>
          <OrganizationSchema
            address={{
              addressLocality: "Barranquilla",
              addressRegion: "Atlántico",
              addressCountry: "CO",
            }}
          />
          <EducationalOrganizationSchema
            address={{
              addressLocality: "Barranquilla",
              addressRegion: "Atlántico",
              addressCountry: "CO",
            }}
          />

          <AuthProvider>
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YCK2DMSV9J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YCK2DMSV9J');
          `}
        </Script>
      </body>
    </html>
  );
}
