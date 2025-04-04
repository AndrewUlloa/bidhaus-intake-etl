import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogOverlay 
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  imageUrl: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  // New props for navigation
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
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Navigate to next image
  const navigateNext = () => {
    if (images.length <= 1) return;
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent 
        className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none"
        onInteractOutside={onClose}
      >
        <div 
          className="relative rounded-lg overflow-hidden bg-transparent"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation arrows - only show if we have multiple images */}
          {images.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white z-10 rounded-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrevious();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white z-10 rounded-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          <div className="flex items-center justify-center max-h-[90vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentImage} 
              alt={alt} 
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={e => e.stopPropagation()} // Prevent click from closing when clicking the image
            />
          </div>
          
          {/* Image counter indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white px-2 py-1 rounded-full text-xs">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 