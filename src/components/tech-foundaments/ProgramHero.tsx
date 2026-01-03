import React, { useState } from 'react'

interface Props {
  heroImage: string
  video: string
  user?: any
  saveChanges?: (propertyName: string, content: any) => void
}

export function ProgramHero({ heroImage, video, saveChanges }: Props) {
  const [isEditingHeroImage, setIsEditingHeroImage] = useState(false)
  const [heroImageUrl, setHeroImageUrl] = useState(heroImage || '');
   
  const handleImageUpload = (url: string) => {
    setHeroImageUrl(url);
    if (saveChanges) {
      saveChanges('heroImage', url);
    }
  };
  
  return (
    <>
      <section className="relative w-full min-h-[350px] lg:min-h-[420px] flex items-stretch overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        />
      </section>
    </>
  )
}