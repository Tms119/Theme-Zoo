import { Chakra_Petch, Onest, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
    default: "Themes Zoo | Premium Website Templates & Custom Web Dev",
    template: "%s | Themes Zoo",
  },
  description: "Download premium website templates & WordPress themes instantly. We offer custom web development, DApps & automation at challenge prices. Pay with crypto.",
  keywords: [
    "premium website templates", "custom website development", "DApp development", "UI design", "web automation", "WordPress themes", "HTML templates", "crypto web templates", "affordable web design",
    "Elementor themes", "buy website templates", "React Next.js templates", "custom web design", "crypto payment templates", "automation services", "fast loading themes"
  ],
  authors: [{ name: "Themes Zoo", url: "https://www.themeszoo.com" }],
  creator: "Themes Zoo",
  openGraph: {
    title: "Themes Zoo - Premium Website Templates & Custom Development",
    description: "Instant download premium themes & templates. Build anything with our custom services - websites, software, DApps, designs & automation.",
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
    title: "Themes Zoo - Premium Website Templates & Custom Development",
    description: "Instant download premium themes & templates. Build anything with our custom services - websites, software, DApps, designs & automation.",
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
    "logo": "https://www.themeszoo.com/themezoologo.png",
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
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-WDNP4LM9Q4" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-WDNP4LM9Q4');
          `}
        </Script>

        {/* Tawk.to Live Chat */}
        <Script id="tawk-to" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a36dd1c2e5a421d56c2fa57/1jrj4veoh';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>

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
