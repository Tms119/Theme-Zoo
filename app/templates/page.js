
import ProductGrid from '@/components/product/ProductGrid';

export const metadata = {
  title: "Browse Web Templates - Themes Zoo",
  description: "Explore our collection of WordPress and website templates ready for instant deployment.",
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
              Discover production-ready source files and WordPress packages.
            </p>
          </div>
        </div>
        <ProductGrid />
      </main>
    </>
  );
}
