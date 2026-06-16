'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref and styled transform style that pulls the element toward the cursor
 * when within proximity, snapping back elastically on exit.
 */
export default function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: 'translate3d(0px, 0px, 0px)' });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMouseMove = (e) => {
      const rect = node.getBoundingClientRect();
      const nodeX = rect.left + rect.width / 2;
      const nodeY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - nodeX;
      const distanceY = e.clientY - nodeY;
      
      const distance = Math.hypot(distanceX, distanceY);
      
      // Bounding box range (80px radius around element center)
      if (distance < 80) {
        const pullX = distanceX * strength;
        const pullY = distanceY * strength;
        setStyle({
          transform: `translate3d(${pullX}px, ${pullY}px, 0px)`,
          transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
        });
      } else {
        setStyle({
          transform: 'translate3d(0px, 0px, 0px)',
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        });
      }
    };

    const handleMouseLeave = () => {
      setStyle({
        transform: 'translate3d(0px, 0px, 0px)',
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return { ref, style };
}
