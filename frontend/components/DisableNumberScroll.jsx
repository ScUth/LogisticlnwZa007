"use client";

import { useEffect } from "react";

export default function DisableNumberScroll() {
  useEffect(() => {
    // Disable scroll wheel on number inputs globally
    const handleWheel = (e) => {
      if (e.target.type === 'number' && document.activeElement === e.target) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return null;
}
