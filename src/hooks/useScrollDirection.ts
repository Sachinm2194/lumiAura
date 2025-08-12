'use client';
import { useRef, useEffect, useState } from 'react';

export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      // Only consider scroll direction if scrolled more than 4px and past the initial header height (64px)
      if (currentY > lastY.current + 4 && currentY > 64) {
        setDirection('down');
      } else if (currentY < lastY.current - 4) {
        setDirection('up');
      }
      lastY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return direction;
}