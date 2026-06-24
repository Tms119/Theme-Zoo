'use client';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function BlogListing() {
  const posts = useQuery(api.posts.listPublished);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '8rem 0 4rem 0' }} className="container">
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Insights & <span className="gradient-text">Updates</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            The latest news, tutorials, and updates on web development, design trends, and custom software.
          </p>
        </div>

        {/* Blog Grid */}
        {posts === undefined ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            No posts available yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {posts.map(post => (
              <Link href={`/blog/${post.slug}`} key={post._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  className="product-card" 
                  style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'var(--card-bg)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '24px', 
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  
                  {/* Image Container */}
                  <div style={{ width: '100%', height: '220px', background: 'rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                    {post.cover_image_url ? (
                      <img 
                        src={post.cover_image_url} 
                        alt={post.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      <Calendar size={14} />
                      {new Date(post.published_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      {post.title}
                    </h2>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>
                      {post.short_desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, marginTop: 'auto' }}>
                      Read Article <ArrowRight size={16} />
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
