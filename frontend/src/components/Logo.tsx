import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  iconOnly = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-sm font-bold' },
    md: { icon: 'w-10 h-10', text: 'text-base font-extrabold' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl font-black' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        className={`${currentSize.icon} shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dégradé bleu foncé pour la jambe gauche de l'A */}
          <linearGradient id="leftLegGrad" x1="23" y1="80" x2="49" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#081426" />
            <stop offset="50%" stopColor="#0B2545" />
            <stop offset="100%" stopColor="#134074" />
          </linearGradient>
          {/* Dégradé bleu royal pour la jambe droite de l'A */}
          <linearGradient id="rightLegGrad" x1="51" y1="14" x2="77" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A5EAA" />
            <stop offset="100%" stopColor="#081426" />
          </linearGradient>
          {/* Dégradé cyan/bleu vif pour la flèche ascendante */}
          <linearGradient id="arrowGrad" x1="26" y1="80" x2="87" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0052FF" />
            <stop offset="60%" stopColor="#00A3FF" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
        </defs>

        {/* Partie gauche de l'A */}
        <path
          d="M 49 14 
             L 23 80 
             C 29 73, 35 65, 43 58 
             C 49 53, 53 48, 53 48 
             L 49 14 Z"
          fill="url(#leftLegGrad)"
        />

        {/* Partie droite de l'A */}
        <path
          d="M 51 14 
             L 77 80 
             H 68 
             L 54 45 
             C 53 48, 51 51, 49 55 
             L 51 14 Z"
          fill="url(#rightLegGrad)"
        />

        {/* Flèche dynamique ascendante */}
        <path
          d="M 26 80 
             C 34 80, 43 75, 51 66 
             C 60 56, 69 43, 80 39 
             L 77 35 
             L 87 37 
             L 82 47 
             L 80 43 
             C 69 46, 60 59, 51 69 
             C 42 77, 34 80, 26 80 Z"
          fill="url(#arrowGrad)"
        />
      </svg>
      {showText && !iconOnly && (
        <span className={`tracking-tight leading-tight uppercase ${currentSize.text}`}>
          <span className="text-blue-600 dark:text-blue-400">Avenir</span>{' '}
          <span className="text-slate-800 dark:text-slate-200">assuré</span>
        </span>
      )}
    </div>
  );
};
