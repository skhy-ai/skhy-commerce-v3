import React, { useState } from 'react';
import { getCountryName } from '../../utils/countryData';

interface CountryFlagProps {
  countryCode?: string;
  className?: string;
  flagClassName?: string;
  showName?: boolean;
  customName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'w-3.5 h-2.5',
  sm: 'w-4 h-3',
  md: 'w-5 h-3.5',
  lg: 'w-6 h-4',
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = '',
  flagClassName = '',
  showName = false,
  customName,
  size = 'sm',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!countryCode || countryCode.length !== 2) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="text-slate-400 text-xs">🌐</span>
        {showName && <span>{customName || 'Global'}</span>}
      </span>
    );
  }

  const code = countryCode.toUpperCase();
  const name = customName || getCountryName(code);
  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  const flagUrl2x = `https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {!hasError ? (
        <img
          src={flagUrl}
          srcSet={flagUrl2x}
          alt={name}
          title={name}
          className={`${sizeClasses[size]} object-cover rounded-sm border border-slate-700/50 shadow-sm flex-shrink-0 ${flagClassName}`}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <span className="inline-block px-1 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded border border-slate-700 leading-none">
          {code}
        </span>
      )}
      {showName && <span>{name}</span>}
    </span>
  );
};

export default CountryFlag;
