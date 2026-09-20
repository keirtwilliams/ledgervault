import React from 'react';
import { Icon } from '@iconify/react';
import { APP_ICONS } from '../../constants/icons';
import { cn } from '../../utils/cn';

const DynamicIcon = ({ name, className, onClick, ...props }) => {
  const iconKey = APP_ICONS[name] || APP_ICONS.FALLBACK;

  // If onClick is provided, render an accessible button wrapper
  if (onClick) {
    return (
      <button 
        type="button" 
        onClick={onClick}
        className={cn("inline-flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer focus:outline-none", className)}
        aria-label={name}
        {...props}
      >
        <Icon icon={iconKey} className="w-full h-full" />
      </button>
    );
  }

  // Otherwise, just render the standard SVG icon
  return (
    <Icon 
      icon={iconKey} 
      className={cn("inline-block flex-shrink-0", className)} 
      {...props} 
    />
  );
};

export default DynamicIcon;
