import Hero from '@/components/marketing/Hero';
import Ticker from '@/components/marketing/Ticker';
import ProductGrid from '@/components/product/ProductGrid';
import ValueProp from '@/components/marketing/ValueProp';
import BentoFeatures from '@/components/marketing/BentoFeatures';
import Services from '@/components/marketing/Services';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Home() {
  const initialProducts = await fetchQuery(api.products.listActive);
  const initialCategories = await fetchQuery(api.categories.listAll);

  return (
    <>
      <ScrollReveal />
      <main>
        {/* Top fold: Animated hero & Ticker */}
        <Hero />
        <Ticker />
        
        {/* Core Store Grid */}
        <ProductGrid initialProducts={initialProducts} initialCategories={initialCategories} />

        {/* Custom Website Order + Contact */}
        <Services />

        {/* How it works simple steps */}
        <ValueProp />
        
        {/* Bento grid highlights */}
        <BentoFeatures />
      </main>
      
    </>
  );
}
