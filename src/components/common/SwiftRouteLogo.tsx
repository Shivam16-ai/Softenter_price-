import React from 'react';

interface SwiftRouteLogoProps {
  className?: string;
  heightClass?: string;
  onClick?: () => void;
  alt?: string;
}

export const SwiftRouteLogo: React.FC<SwiftRouteLogoProps> = ({
  className = '',
  heightClass = 'h-10 sm:h-11 md:h-12',
  onClick,
  alt = 'SwiftRoute Enterprise Logistics',
}) => {
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src="/assets/swiftroute-logo.png"
        alt={alt}
        className={`${heightClass} w-auto max-w-full object-contain filter-none transition-transform duration-200 hover:scale-[1.01]`}
        style={{ aspectRatio: 'auto' }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
