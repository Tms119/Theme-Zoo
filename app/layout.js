import { Chakra_Petch, Onest, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import ConvexClientProvider from "./ConvexClientProvider";
import CartDrawer from "@/components/ui/CartDrawer";
import DashboardShell from "@/components/ui/DashboardShell";
import GlobalBanner from "@/components/marketing/GlobalBanner";
import SocialProof from "@/components/ui/SocialProof";
import SecurityProvider from "@/components/ui/SecurityProvider";

const chakraPetch = Chakra_Petch({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-chakra",
});

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.themeszoo.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Themes Zoo | Premium Website Templates & Themes",
    template: "%s | Themes Zoo",
  },
  description: "Buy premium website templates, HTML themes, and WordPress designs. Instant crypto payment and lifetime ownership at Themes Zoo.",
  keywords: ["premium website template", "themes zoo", "premium website templates", "buy website templates", "premium html templates", "wordpress themes", "crypto web templates"],
  authors: [{ name: "Themes Zoo", url: "https://www.themeszoo.com" }],
  creator: "Themes Zoo",
  openGraph: {
    title: "Themes Zoo | Premium Website Templates",
    description: "Discover premium website templates at Themes Zoo. High-quality designs with instant delivery and no subscriptions.",
    url: "https://www.themeszoo.com",
    siteName: "Themes Zoo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Themes Zoo — Premium Website Templates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Themes Zoo | Premium Website Templates",
    description: "Buy premium website templates with instant crypto checkout. Own your design forever.",
    images: ["/og-image.jpg"],
    creator: "@themeszoo",
  },
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
  icons: {
    icon: "/favicon.ico",
    apple: "/og-image.jpg",
  },
};

export default function RootLayout({ children }) {
  // Organization Schema
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Themes Zoo",
    "url": "https://www.themeszoo.com",
    "logo": "https://www.themeszoo.com/og-image.jpg",
    "description": "Premium website templates and digital marketplace",
    "sameAs": [
      "https://twitter.com/themeszoo"
    ]
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Themes Zoo",
    "url": "https://www.themeszoo.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.themeszoo.com/templates?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${chakraPetch.variable} ${onest.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: '#00e676' }
          }}
        >
          <ConvexClientProvider>
            <SecurityProvider>
              <GlobalBanner />
              <Toaster position="bottom-right" toastOptions={{
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px'
                }
              }}/>
              
              <DashboardShell>
                <CartDrawer />
                <SocialProof />
                {children}
              </DashboardShell>
            </SecurityProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
