import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface ImagePreviewModalProps {
  imageUrl: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  allImages?: string[];
  currentIndex?: number;
}

export function ImagePreviewModal({ 
  imageUrl, 
  alt = "Image preview", 
  isOpen, 
  onClose,
  allImages = [],
  currentIndex = 0
}: ImagePreviewModalProps) {
  // Track the current image index locally if provided with collection
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  // Track touch events for swipe detection
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  // Track direction for animation
  const [direction, setDirection] = useState(0);
  
  // Use provided imageUrl as fallback if no allImages array
  const images = allImages.length > 0 ? allImages : [imageUrl];
  const currentImage = images[activeIndex];
  
  // Update active index when currentIndex prop changes
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, images.length]);

  // Navigate to previous image
  const navigatePrevious = () => {
    if (images.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Navigate to next image
  const navigateNext = () => {
    if (images.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Handle touch events for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50; // Minimum swipe distance
    
    if (isSwipe) {
      if (distance > 0) {
        // Swipe left -> next image
        navigateNext();
      } else {
        // Swipe right -> previous image
        navigatePrevious();
      }
    }
    
    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Framer motion variants
  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    })
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <style jsx global>{`
        .remove-close [data-radix-collection-item] {
          display: none !important;
        }
        .remove-close button {
          display: none !important;
        }
      `}</style>
      <DialogContent 
        className="remove-close !p-0 !border-none bg-black/80 shadow-none overflow-hidden !w-auto !max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[65vw]"
        onInteractOutside={onClose}
      >
        <div 
          className="relative flex items-center justify-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-center h-full w-full">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative max-h-[75vh] max-w-[75vw] md:max-w-[65vw] lg:max-w-[55vw]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentImage} 
                  alt={alt} 
                  className="max-h-[75vh] max-w-[75vw] md:max-w-[65vw] lg:max-w-[55vw] object-contain"
                  onClick={e => e.stopPropagation()} // Prevent click from closing when clicking the image
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 