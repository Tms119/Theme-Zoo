'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Cameron", "Jamie", "Skyler", "Drew",
  "Sam", "Avery", "Parker", "Logan", "Hunter", "Charlie", "Quinn", "Rowan", "Dakota", "Blake",
  "Micah", "Reese", "Peyton", "Kendall", "Finley", "Emerson", "Sage", "River", "Phoenix", "Dallas",
  "Remington", "Sawyer", "Hayden", "Rowan", "Elliott", "Sutton", "Kai", "Eden", "Rory", "Milan",
  "Marcus", "David", "Sarah", "Jessica", "James", "Michael", "Emma", "Olivia", "Sophia", "Isabella",
  "William", "Liam", "Mason", "Jacob", "Ethan", "Noah", "Ava", "Mia", "Chloe", "Emily"
];

const LOCATIONS = [
  "New York", "London", "Berlin", "Toronto", "Sydney", "Paris", "Austin", "San Francisco", "Dubai", "Singapore",
  "Miami", "Chicago", "Amsterdam", "Tokyo", "Seoul", "Melbourne", "Los Angeles", "Stockholm", "Vancouver", "Barcelona",
  "Madrid", "Rome", "Milan", "Munich", "Frankfurt", "Zurich", "Geneva", "Vienna", "Brussels", "Copenhagen",
  "Oslo", "Helsinki", "Dublin", "Edinburgh", "Manchester", "Birmingham", "Liverpool", "Glasgow", "Bristol", "Leeds",
  "Boston", "Seattle", "Denver", "Portland", "Atlanta", "Dallas", "Houston", "Phoenix", "Las Vegas", "San Diego"
];

const TIME_AGO = [
  "just now", "1 minute ago", "2 minutes ago", "5 minutes ago", "12 minutes ago", "18 minutes ago", "34 minutes ago", "about an hour ago"
];

export default function SocialProof() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  const activeProducts = useQuery(api.products.listActive) || [];

  useEffect(() => {
    if (activeProducts.length === 0) return;
    
    let isMounted = true;
    let timeoutId;

    const triggerNext = () => {
      if (!isMounted) return;

      // Generate random notification data
      const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const productObj = activeProducts[Math.floor(Math.random() * activeProducts.length)];
      
      const product = {
        name: productObj.name,
        // Use product image or fallback
        image: (productObj.images && productObj.images.length > 0) 
          ? productObj.images[0] 
          : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=150&q=80"
      };
      
      const time = TIME_AGO[Math.floor(Math.random() * TIME_AGO.length)];

      setCurrentNotification({ name, location, product, time });
      setIsVisible(true);

      // Hide after 5 seconds
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        setIsVisible(false);
        
        // Schedule next one between 5 to 10 seconds after hiding
        const nextDelay = Math.floor(Math.random() * 5000) + 5000;
        timeoutId = setTimeout(triggerNext, nextDelay);
      }, 5000);
    };

    // Wait a few seconds before starting the cycle
    timeoutId = setTimeout(triggerNext, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [activeProducts]);

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
            right: '24px',
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
