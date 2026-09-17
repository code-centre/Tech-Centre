import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import { getProgramsNav } from "@/data/programsNav";
import { Footer } from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OrganizationSchema, EducationalOrganizationSchema, WebsiteSchema } from "@/components/seo/StructuredData";
import { CONTACT } from "@/components/landing/data";
import { Toaster } from "sonner";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_TITLE_TEMPLATE,
  SITE_URL,
  defaultOpenGraph,
  defaultTwitter,
} from "@/lib/seo/site";
import MetaPixel from "@/components/analytics/MetaPixel";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE_DEFAULT,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "llms.txt" },
        { url: "/llms-full.txt", title: "llms-full.txt" },
      ],
    },
  },
  openGraph: defaultOpenGraph(),
  twitter: defaultTwitter(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El menú de programas sale de la base y va cacheado una hora.
  const programsNav = await getProgramsNav();

  return (
    <html lang="es" suppressHydrationWarning>
     <body
        className="antialiased"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
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
        <ThemeProvider>
          <WebsiteSchema />
          <OrganizationSchema
            address={{
              streetAddress: "Cra. 50 #72-126, El Prado",
              addressLocality: "Barranquilla",
              addressRegion: "Atlántico",
              addressCountry: "CO",
            }}
            contactPoint={{
              telephone: CONTACT.phone,
              contactType: "admissions",
              email: CONTACT.email,
            }}
            sameAs={[
              CONTACT.social.instagram,
              CONTACT.social.linkedin,
              CONTACT.social.facebook,
            ]}
          />
          <EducationalOrganizationSchema
            address={{
              streetAddress: "Cra. 50 #72-126, El Prado",
              addressLocality: "Barranquilla",
              addressRegion: "Atlántico",
              addressCountry: "CO",
            }}
            sameAs={[
              CONTACT.social.instagram,
              CONTACT.social.linkedin,
              CONTACT.social.facebook,
            ]}
          />

          <AuthProvider>
            <Header nav={programsNav} />
            <main>
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
        
        <MetaPixel />

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

        {/* Chatwoot - Widget de chat */}
        <Script id="chatwoot" strategy="afterInteractive">
          {`
            window.chatwootSettings = {"position":"right","type":"expanded_bubble","launcherTitle":"Habla con un asesor"};
            (function(d,t) {
              var BASE_URL="https://app.edtools.co";
              var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
              g.src=BASE_URL+"/packs/js/sdk.js";
              g.async = true;
              s.parentNode.insertBefore(g,s);
              g.onload=function(){
                window.chatwootSDK.run({
                  websiteToken: '7nHb1ftHXWTdXcZ65BxYXD1J',
                  baseUrl: BASE_URL
                })
              }
            })(document,"script");
          `}
        </Script>
      </body>
    </html>
  );
}
