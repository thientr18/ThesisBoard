import React, { useState, useEffect, useCallback } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { theme } from '../../../utils/theme';

type CarouselProps = {
  children: React.ReactNode[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  onChange?: (currentSlide: number) => void;
};

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoplay = false,
  autoplaySpeed = 5000,
  showArrows = true,
  showDots = true,
  className = '',
  onChange,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalSlides = children.length;

  const goToSlide = useCallback(
    (index: number) => {
      const newIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      setCurrentSlide(newIndex);
      onChange?.(newIndex);
    },
    [totalSlides, onChange]
  );

  const goToNext = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || isHovered) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [autoplay, autoplaySpeed, isHovered, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="w-full shrink-0"
              style={{ minWidth: '100%' }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 border border-gray-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            style={{
              color: theme.colors.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = theme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = theme.colors.secondary;
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
            aria-label="Previous slide"
          >
            <LeftOutlined />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 border border-gray-200 opacity-0 group-hover:opacity-100 hover:scale-110"
            style={{
              color: theme.colors.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = theme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = theme.colors.secondary;
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
            aria-label="Next slide"
          >
            <RightOutlined />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {showDots && totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="rounded-full transition-all duration-300 hover:scale-110"
              style={{
                width: currentSlide === index ? '12px' : '10px',
                height: currentSlide === index ? '12px' : '10px',
                backgroundColor:
                  currentSlide === index
                    ? theme.colors.secondary
                    : '#cbd5e1',
                opacity: currentSlide === index ? 1 : 0.8,
              }}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      <style>{`
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Carousel;