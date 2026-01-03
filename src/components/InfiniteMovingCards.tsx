/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "../../utils/cn";
import React, { useEffect, useState } from "react";

interface Props {
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  horizontalScroll?: boolean;
  children: React.ReactNode;
}

export const InfiniteMovingCards = ({
  direction = "right",
  speed = "slow",
  pauseOnHover = true,
  horizontalScroll = true,
  children,
}: Props) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
      if (horizontalScroll) {
        scrollHorizontal();
      }
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "30s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      } else {
        // Más lento para mejor legibilidad
        containerRef.current.style.setProperty("--animation-duration", "120s");
      }
    }
  };

  function scrollHorizontal() {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--scroll-horizontal",
        `${containerRef.current.scrollWidth}px`
      );
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      className={cn(
        "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
      )}
    >
      <ul
        ref={scrollerRef}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
        className={cn(
          "flex min-w-full w-max items-center gap-x-10 py-4 flex-nowrap",
          start && "animate-scroll"
        )}
      >
        {children}
      </ul>
    </div>
  );
};

// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react-hooks/exhaustive-deps */


/* eslint-disable react-hooks/exhaustive-deps */

// "use client";

// import { cn } from "../utils/cn";
// import React, { useEffect, useState, useRef } from "react";

// interface Props {
//   direction?: "left" | "right";
//   speed?: "fast" | "normal" | "slow";
//   pauseOnHover?: boolean;
//   horizontalScroll?: boolean;
//   manualScrolling?: boolean; // Nueva propiedad para habilitar scroll manual
//   children: React.ReactNode;
// }

// export const InfiniteMovingCards = ({
//   direction = "right",
//   speed = "slow",
//   pauseOnHover = true,
//   horizontalScroll = true,
//   manualScrolling = false, // Por defecto desactivado para mantener comportamiento original
//   children,
// }: Props) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const scrollerRef = useRef<HTMLUListElement>(null);
//   const [start, setStart] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startX, setStartX] = useState(0);
//   const [scrollLeft, setScrollLeft] = useState(0);

//   useEffect(() => {
//     addAnimation();
//   }, []);

//   function addAnimation() {
//     if (containerRef.current && scrollerRef.current) {
//       const scrollerContent = Array.from(scrollerRef.current.children);

//       scrollerContent.forEach((item) => {
//         const duplicatedItem = item.cloneNode(true);
//         if (scrollerRef.current) {
//           scrollerRef.current.appendChild(duplicatedItem);
//         }
//       });

//       getDirection();
//       getSpeed();
//       setStart(true);
//       if (horizontalScroll) {
//         scrollHorizontal();
//       }
//     }
//   }

//   const getDirection = () => {
//     if (containerRef.current) {
//       if (direction === "left") {
//         containerRef.current.style.setProperty(
//           "--animation-direction",
//           "forwards"
//         );
//       } else {
//         containerRef.current.style.setProperty(
//           "--animation-direction",
//           "reverse"
//         );
//       }
//     }
//   };

//   const getSpeed = () => {
//     if (containerRef.current) {
//       if (speed === "fast") {
//         containerRef.current.style.setProperty("--animation-duration", "20s");
//       } else if (speed === "normal") {
//         containerRef.current.style.setProperty("--animation-duration", "40s");
//       } else {
//         containerRef.current.style.setProperty("--animation-duration", "90s");
//       }
//     }
//   };

//   function scrollHorizontal() {
//     if (containerRef.current) {
//       containerRef.current.style.setProperty(
//         "--scroll-horizontal",
//         `${containerRef.current.scrollWidth}px`
//       );
//     }
//   }

//   // Funciones para manejar el scroll manual
//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (!manualScrolling || !containerRef.current) return;

//     setIsDragging(true);
//     setStartX(e.pageX - containerRef.current.offsetLeft);
//     setScrollLeft(containerRef.current.scrollLeft);

//     // Pausar la animación durante el arrastre
//     if (scrollerRef.current) {
//       scrollerRef.current.style.animationPlayState = 'paused';
//     }
//   };

//   const handleMouseUp = () => {
//     if (!manualScrolling) return;

//     setIsDragging(false);

//     // Reanudar la animación después del arrastre
//     if (scrollerRef.current) {
//       scrollerRef.current.style.animationPlayState = 'running';
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!manualScrolling || !isDragging || !containerRef.current) return;

//     e.preventDefault();
//     const x = e.pageX - containerRef.current.offsetLeft;
//     const walk = (x - startX) * 2; // Ajusta la velocidad del scroll
//     containerRef.current.scrollLeft = scrollLeft - walk;
//   };

//   // Manejar evento de rueda del mouse para scroll horizontal
//   const handleWheel = (e: React.WheelEvent) => {
//     if (!manualScrolling || !containerRef.current) return;

//     e.preventDefault();
//     containerRef.current.scrollLeft += e.deltaY;
//   };

//   return (
//     <div
//       ref={containerRef}
//       className={cn(
//         "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
//         manualScrolling && "cursor-grab overflow-x-auto"
//       )}
//       onMouseDown={handleMouseDown}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//       onMouseMove={handleMouseMove}
//       onWheel={handleWheel}
//     >
//       <ul
//         ref={scrollerRef}
//         className={cn(
//           "flex min-w-full w-max items-center gap-x-10 py-4 flex-nowrap",
//           start && !manualScrolling && "animate-scroll",
//           pauseOnHover && !manualScrolling && "hover:[animation-play-state:paused]",
//           manualScrolling && "transition-transform duration-300"
//         )}
//       >
//         {children}
//       </ul>
//     </div>
//   );
// };