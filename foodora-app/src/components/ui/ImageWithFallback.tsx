import React, { useState } from 'react';
import { cn } from '../../utils';
import { IMAGES } from '../../data/images';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  fallback = IMAGES.placeholder,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [errored, setErrored] = useState(false);

  const handleError = () => {
    if (!errored) {
      setImgSrc(fallback);
      setErrored(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={cn('object-cover', className)}
      loading="lazy"
      {...props}
    />
  );
};
