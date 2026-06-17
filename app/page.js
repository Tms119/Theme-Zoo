import Hero from '@/components/marketing/Hero';
import Ticker from '@/components/marketing/Ticker';
import ProductGrid from '@/components/product/ProductGrid';
import ValueProp from '@/components/marketing/ValueProp';
import BentoFeatures from '@/components/marketing/BentoFeatures';
import Services from '@/components/marketing/Services';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: "Themes Zoo - Premium Web Templates",
  description: "Curated collection of high-performance WordPress themes and website templates. Buy with cryptocurrency and download instantly.",
};

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <main>
        {/* Top fold: Animated hero & Ticker */}
        <Hero />
        <Ticker />
        
        {/* Core Store Grid */}
        <ProductGrid />

        {/* How it works simple steps */}
        <ValueProp />
        
        {/* Bento grid highlights */}
        <BentoFeatures />

        {/* Custom Website Order + Contact */}
        <Services />
      </main>
      
      <Footer />
    </>
  );
}
