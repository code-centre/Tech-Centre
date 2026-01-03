import type { Metadata } from "next";
import Script from "next/script";
import { League_Spartan, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from '@/lib/supabase/server';
import AuthProvider from "@/components/AuthProvider";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tech Centre - Centro de tecnología del Caribe",
    template: "%s | Tech Centre"
  },
  description: "Formamos a los profesionales tech del futuro con programas prácticos y actualizados. Diplomados y cursos especializados en tecnología diseñados para el mercado laboral actual.",
  keywords: ["tecnología", "programación", "diplomados", "cursos tech", "educación tecnológica", "Barranquilla", "Colombia"],
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
    title: "Tech Centre - Centro de tecnología del Caribe",
    description: "Formamos a los profesionales tech del futuro con programas prácticos y actualizados.",
    images: [
      {
        url: "/tech-center-logos/TechCentreLogoColor.png",
        width: 1200,
        height: 630,
        alt: "Tech Centre Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Centre - Centro de tecnología del Caribe",
    description: "Formamos a los profesionales tech del futuro con programas prácticos y actualizados.",
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
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
     <body
        className={`${leagueSpartan.variable} ${poppins.variable} antialiased`}
      >
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
         <AuthProvider initialSession={session}>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
