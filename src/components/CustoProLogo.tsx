import React from 'react';

interface CustoProLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const CustoProLogo: React.FC<CustoProLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = ''
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-blue-600`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            viewBox="0 0 100 100" 
            className="w-3/4 h-3/4 text-white"
            fill="currentColor"
          >
            <g>
              {/* Simplified brain network icon */}
              <circle cx="30" cy="30" r="8" />
              <circle cx="70" cy="30" r="8" />
              <circle cx="50" cy="50" r="8" />
              <circle cx="30" cy="70" r="8" />
              <circle cx="70" cy="70" r="8" />
              <rect x="28" y="30" width="4" height="20" rx="2" transform="rotate(-45 28 30)" />
              <rect x="48" y="50" width="4" height="20" rx="2" transform="rotate(45 48 50)" />
              <rect x="68" y="30" width="4" height="20" rx="2" transform="rotate(45 68 30)" />
              <rect x="28" y="68" width="4" height="20" rx="2" transform="rotate(-45 28 68)" />
            </g>
          </svg>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col items-start">
          <span className={`font-bold ${textSizeClasses[size]} text-foreground`}>
            CUSTOPRO
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground">
              CRM SOLUTION
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CustoProLogo;
