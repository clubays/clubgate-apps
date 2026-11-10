import React from 'react';
import { cn } from '@/utils/cn';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  className?: string;
  children?: React.ReactNode;
  objectFit?: 'cover' | 'contain';
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  className,
  children,
  objectFit = 'contain',
}) => {
  return (
    <div className={cn('relative w-full h-full overflow-hidden bg-black flex items-center justify-center', className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'w-full h-full pointer-events-none',
          objectFit === 'cover' ? 'object-cover' : 'object-contain'
        )}
      />
      {children}
    </div>
  );
};
