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
      <div className={`${sizeClasses[size]}`}>
        <img
          src="/images/CustoPro.png"
          alt="CUSTOPRO Logo"
          className="w-full h-full object-contain"
        />
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
