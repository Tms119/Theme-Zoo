import ProductClient from './ProductClient';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = 'force-dynamic';

const convex = new ConvexHttpClient(
  (process.env.NEXT_PUBLIC_CONVEX_URL || "").replace(".site", ".cloud")
);

// Generate dynamic SEO metadata
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const product = await convex.query("products:getBySlug", { slug });
    
    if (!product) {
      return { title: 'Product Not Found | Themes Zoo' };
    }
    
    return {
      title: `${product.name} | Premium Website Template | Themes Zoo`,
      description: product.short_desc || product.desc?.substring(0, 160) || "Buy this premium website template.",
      keywords: ["premium website template", "themes zoo", product.name, product.category, product.tech],
      alternates: {
        canonical: `/templates/${slug}`,
      },
      openGraph: {
        title: `${product.name} | Premium Website Template`,
        description: product.short_desc || "Buy this premium website template at Themes Zoo.",
        images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
        type: "website",
      },
    };
  } catch (error) {
    return { title: 'Premium Website Templates | Themes Zoo' };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = params;
  
  let product = null;
  let relatedProducts = [];
  let errorMessage = null;
  
  try {
    product = await convex.query("products:getBySlug", { slug });
    
    if (product) {
      const allActive = await convex.query("products:listActive");
      relatedProducts = allActive?.filter(p => p.category === product.category && p._id !== product._id).slice(0, 3) || [];
    }
  } catch (error) {
    console.error("Failed to fetch product server-side", error);
    errorMessage = error.message || String(error);
  }

  // Generate Product JSON-LD structured data
  let jsonLd = null;
  if (product) {
    jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images || [],
      "description": product.short_desc || product.desc,
      "brand": {
        "@type": "Brand",
        "name": "Themes Zoo"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://www.themeszoo.com/templates/${slug}`,
        "priceCurrency": "USD",
        "price": product.price_usd,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Themes Zoo"
        }
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductClient product={product} relatedProducts={relatedProducts} errorMessage={errorMessage} />
    </>
  );
}
