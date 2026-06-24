import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { notFound } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const post = await convex.query(api.posts.getBySlug, { slug: params.slug });

  if (!post) {
    return { title: 'Post Not Found | Themes Zoo' };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_desc || post.short_desc,
    keywords: post.meta_keywords ? post.meta_keywords.split(',').map(k => k.trim()) : [],
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_desc || post.short_desc,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
      type: "article",
      publishedTime: post.published_at ? new Date(post.published_at).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_desc || post.short_desc,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    }
  };
}

export default async function BlogPost({ params }) {
  const post = await convex.query(api.posts.getBySlug, { slug: params.slug });

  if (!post || post.status !== 'published') {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '8rem 0 4rem 0' }}>
        <article className="container" style={{ maxWidth: '800px' }}>
          
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          {/* Header */}
          <header style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '1.5rem', lineHeight: 1.2, color: 'var(--text-main)' }}>
              {post.title}
            </h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                {new Date(post.published_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} />
                {post.author || 'Themes Zoo'}
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div style={{ width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '4rem', background: 'rgba(0,0,0,0.5)' }}>
              <img 
                src={post.cover_image_url} 
                alt={post.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="blog-content" 
            style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem', 
              lineHeight: 1.8,
              fontFamily: 'var(--font-onest)'
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </article>
      </main>

      <Footer />
    </div>
  );
}
