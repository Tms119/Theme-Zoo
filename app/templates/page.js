
import ProductGrid from '@/components/product/ProductGrid';

export const metadata = {
  title: "Browse Premium Web Templates",
  description: "Shop WordPress themes and website templates. Filter by category, pay with crypto (USDT, BTC, ETH), and download instantly. No subscription needed.",
  openGraph: {
    title: "Browse Premium Web Templates — Themes Zoo",
    description: "Shop WordPress themes and website templates. Filter by category, pay with crypto, and download instantly.",
    url: "https://www.themeszoo.com/templates",
    type: "website",
  },
  twitter: {
    title: "Browse Premium Web Templates — Themes Zoo",
    description: "Shop WordPress themes and website templates. Pay with crypto. Download instantly.",
  },
};

export default function TemplatesPage() {
  return (
    <>
      <main style={{ minHeight: '80vh' }}>
        {/* Simple Top Banner */}
        <div style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', padding: '4rem 0 2rem 0' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
              Premium Templates
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Discover production-ready source files and premium templates.
            </p>
          </div>
        </div>
        <ProductGrid />
      </main>
    </>
  );
}
