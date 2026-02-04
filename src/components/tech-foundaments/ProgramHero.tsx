'use client'
import React, { useState, useEffect } from 'react'

interface Props {
  heroImage: string
  video: string
  user?: any
  saveChanges?: (propertyName: string, content: any) => void
}

export function ProgramHero({ heroImage, video, saveChanges }: Props) {
  const [isEditingHeroImage, setIsEditingHeroImage] = useState(false)
  const [heroImageUrl, setHeroImageUrl] = useState(heroImage || '');
  const [isMobile, setIsMobile] = useState(false);
   
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleImageUpload = (url: string) => {
    setHeroImageUrl(url);
    if (saveChanges) {
      saveChanges('heroImage', url);
    }
  };
  
  return (
    <>
      <section className="relative w-full min-h-[250px] sm:min-h-[300px] lg:min-h-[420px] flex items-stretch overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 w-full h-full bg-gray-900/20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: isMobile ? 'contain' : 'cover',
            backgroundPosition: isMobile ? 'center center' : 'center right',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </section>
    </>
  )
}