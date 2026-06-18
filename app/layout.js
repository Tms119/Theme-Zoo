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
  title: {
    default: "Themes Zoo — Premium WordPress & Web Templates",
    template: "%s | Themes Zoo",
  },
  description: "Buy premium WordPress themes and website templates. Instant crypto payment. Instant download. No subscription — own it forever.",
  keywords: ["wordpress themes", "web templates", "html templates", "buy templates with crypto", "premium themes", "website templates"],
  authors: [{ name: "Themes Zoo", url: "https://www.themeszoo.com" }],
  creator: "Themes Zoo",
  openGraph: {
    title: "Themes Zoo — Premium WordPress & Web Templates",
    description: "Buy premium WordPress themes and website templates. Instant crypto payment. Instant download. No subscription — own it forever.",
    url: "https://www.themeszoo.com",
    siteName: "Themes Zoo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Themes Zoo — Premium Web Templates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Themes Zoo — Premium WordPress & Web Templates",
    description: "Buy premium WordPress themes and website templates. Instant crypto payment. Instant download.",
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
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${chakraPetch.variable} ${onest.variable} ${geistMono.variable}`}>
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
