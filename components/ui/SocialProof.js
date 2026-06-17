'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Cameron", "Jamie", "Skyler", "Drew",
  "Sam", "Avery", "Parker", "Logan", "Hunter", "Charlie", "Quinn", "Rowan", "Dakota", "Blake"
];

const LOCATIONS = [
  "New York", "London", "Berlin", "Toronto", "Sydney", "Paris", "Austin", "San Francisco", "Dubai", "Singapore",
  "Miami", "Chicago", "Amsterdam", "Tokyo", "Seoul", "Melbourne", "Los Angeles", "Stockholm", "Vancouver", "Barcelona"
];

const PRODUCTS = [
  { name: "SaaS Dashboard Premium", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=150&q=80" },
  { name: "Agency Portfolio Template", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80" },
  { name: "E-commerce Pro Kit", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=150&q=80" },
  { name: "Crypto Exchange UI", image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=150&q=80" },
  { name: "Medical Clinic Theme", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=150&q=80" }
];

const TIME_AGO = [
  "just now", "2 minutes ago", "5 minutes ago", "12 minutes ago", "about an hour ago"
];

export default function SocialProof() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    // Wait a few seconds before starting the cycle
    const initialDelay = setTimeout(() => {
      triggerNextNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const triggerNextNotification = () => {
    // Generate random notification data
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const time = TIME_AGO[Math.floor(Math.random() * TIME_AGO.length)];

    setCurrentNotification({ name, location, product, time });
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next one between 5 to 10 seconds after hiding
      const nextDelay = Math.floor(Math.random() * 5000) + 5000;
      setTimeout(triggerNextNotification, nextDelay);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '320px',
            pointerEvents: 'auto'
          }}
          className="social-proof-toast"
        >
          <button 
            onClick={() => setIsVisible(false)}
            style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--border-color)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={12} />
          </button>
          
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
            <Image 
              src={currentNotification.product.image} 
              alt={currentNotification.product.name} 
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
              <strong>{currentNotification.name}</strong> from {currentNotification.location}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>
              purchased <span style={{ color: 'var(--accent-emerald)', fontWeight: 500 }}>{currentNotification.product.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <CheckCircle2 size={10} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Buyer · {currentNotification.time}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
