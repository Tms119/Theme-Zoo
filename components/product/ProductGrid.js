'use client';
import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGrid() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHint, setShowHint] = useState(true);
  
  const products = useQuery(api.products.listActive);
  const dbCategories = useQuery(api.categories.listAll);
  const itemsPerPage = 6;

  // Reset pagination if user changes filters
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, sortOption]);
  
  // Check if category container is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollRef.current) {
        if (scrollRef.current.scrollWidth <= scrollRef.current.clientWidth) {
          setShowHint(false);
        } else {
          setShowHint(true);
        }
      }
    };
    const timer = setTimeout(checkScrollable, 500);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [dbCategories]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
      
      if (scrollLeft > 10 && showHint) {
        setShowHint(false);
      }
    }
  };
  
  // Intersection Observer for products
  useEffect(() => {
    if (!products) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    const elements = document.querySelectorAll('.grid-3 .reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [products, currentPage, filter, searchQuery, sortOption]);
  
  // Loading state
  if (products === undefined) {
    return (
      <section style={{ padding: '6rem 0 4rem 0' }}>
        <div className="container">
          {/* Skeleton Header */}
          <div style={{ marginBottom: '3.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="skeleton skeleton-text" style={{ height: '2rem', width: '300px' }}></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton" style={{ height: '40px', width: '100%', maxWidth: '440px', borderRadius: '100px' }}></div>
          </div>
          
          {/* Skeleton Grid */}
          <div className="grid-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = filter === 'all' || 
      (product.categories && product.categories.includes(filter)) || 
      product.category?.toLowerCase() === filter;
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.short_desc?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Apply sorting
  filteredProducts.sort((a, b) => {
    if (sortOption === 'price-low') return a.price_usd - b.price_usd;
    if (sortOption === 'price-high') return b.price_usd - a.price_usd;
    if (sortOption === 'oldest') return a._creationTime - b._creationTime;
    // default to newest
    return b._creationTime - a._creationTime;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <section style={{ padding: '6rem 0 4rem 0' }}>
      <div className="container">
        
        {/* Section Header with Left-Aligned Search and Category Pills (Product Hub Style) */}
        <div style={{ marginBottom: '3.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="section-title-wrapper" style={{ textAlign: 'left', maxWidth: '600px' }}>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Explore Web Resources</h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
              Choose from our curated collection of verified resources. Filter by platform or technology.
            </p>
          </div>
          
          {/* Search Input Bar */}
          <div style={{ position: 'relative', maxWidth: '440px', width: '100%' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 2.6rem',
                borderRadius: '100px',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              className="search-input-field"
            />
            
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.4rem 0.8rem',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                paddingRight: '2rem'
              }}
            >
              <option value="newest" style={{ background: '#06060c' }}>Newest First</option>
              <option value="oldest" style={{ background: '#06060c' }}>Oldest First</option>
              <option value="price-low" style={{ background: '#06060c' }}>Price: Low to High</option>
              <option value="price-high" style={{ background: '#06060c' }}>Price: High to Low</option>
            </select>
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Filter Toolbar - Category Pills */}
          <div style={{ position: 'relative', width: '100%' }}>
            
            {/* Swipe Hint */}
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '-25px',
              fontSize: '0.75rem',
              color: 'var(--primary)',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: showHint ? 1 : 0,
              transform: showHint ? 'translateX(0)' : 'translateX(10px)',
              transition: 'all 0.4s ease',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              Swipe for more <span style={{ animation: 'bounceRight 1s infinite' }}>→</span>
            </div>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="filter-container scrollable-filter" 
              style={{ margin: 0, display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', paddingRight: '3rem' }}
            >
            {[{ id: 'all', label: 'All Resources' }, ...(dbCategories || []).map(c => ({ id: c.slug, label: c.name }))].map(pill => (
              <button 
                key={pill.id}
                onClick={() => setFilter(pill.id)} 
                className={`filter-btn-new ${filter === pill.id ? 'active' : ''}`}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '100px',
                  border: filter === pill.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: filter === pill.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.015)',
                  color: filter === pill.id ? '#06060c' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {pill.label}
              </button>
            ))}
            </div>
            
            {/* Right edge fade indicator to suggest scrollability on mobile */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '60px',
              background: 'linear-gradient(to right, transparent, var(--bg-color))',
              pointerEvents: 'none',
              zIndex: 2,
              borderRadius: '0 0 16px 0'
            }} />
            
            {/* Scroll Progress Bar */}
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '100%', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${scrollProgress}%`, background: 'var(--primary)', transition: 'width 0.1s ease-out' }}></div>
            </div>
          </div>
        </div>
        
        {/* Responsive Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            No products found matching your search.
          </div>
        ) : (
          <>
            <div className="grid-3">
              {paginatedProducts.map((product, index) => (
                <div 
                  key={product._id || product.slug} 
                  className="reveal-on-scroll" 
                  style={{ 
                    transitionDelay: `${index * 0.08}s`
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '4rem', gap: '1rem' }}>
                <button 
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="btn"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Page <span style={{ color: 'var(--text-main)' }}>{currentPage}</span> of {totalPages}
                </div>
                
                <button 
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="btn"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
