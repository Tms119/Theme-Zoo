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
  title: "ThemeZoo — Premium Web Templates",
  description: "Premium WordPress and website templates. Pay with crypto, download instantly.",
  openGraph: {
    title: "ThemeZoo — Premium Web Templates",
    description: "Premium WordPress and website templates. Pay with crypto, download instantly.",
    url: "https://themezoo.dev",
    siteName: "ThemeZoo",
    images: [
      {
        url: "https://themezoo.dev/og-image.jpg", // Using a placeholder that will be picked up when added
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThemeZoo — Premium Web Templates",
    description: "Premium WordPress and website templates. Pay with crypto, download instantly.",
    images: ["https://themezoo.dev/og-image.jpg"],
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

          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
