import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  fullScreen = false,
  text
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 flex-col gap-3' 
    : 'flex items-center justify-center flex-col gap-2';

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-zinc-300 border-t-black ${sizeClasses[size]}`} />
      </div>
      {text && (
        <p className="text-sm text-zinc-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default Loader; 