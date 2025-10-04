import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './PhotoStack.css';

interface PhotoStackProps {
  images: string[];
  height?: number;
}

const PhotoStack: React.FC<PhotoStackProps> = ({ images, height = 420 }) => {
  const [index, setIndex] = useState(0);

  const visible = useMemo(() => {
    if (!images || images.length === 0) return [] as string[];
    const order: string[] = [];
    for (let i = 0; i < Math.min(4, images.length); i++) {
      order.push(images[(index + i) % images.length]);
    }
    return order;
  }, [images, index]);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  if (!images || images.length === 0) {
    return <div className="photo-stack" style={{ height }}><div className="photo-stack-empty">No photos</div></div>;
  }

  return (
    <div className="photo-stack" style={{ height }}>
      <button className="stack-nav left" onClick={prev} aria-label="Previous">
        <ChevronLeft size={18} />
      </button>
      <button className="stack-nav right" onClick={next} aria-label="Next">
        <ChevronRight size={18} />
      </button>
      {visible.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`stack-card layer-${i}`}
          style={{ backgroundImage: `url(${src})` }}
          onClick={next}
        />
      ))}
      {/* Preload next image to avoid flicker */}
      <img src={images[(index + 4) % images.length]} alt="" style={{ display: 'none' }} />
    </div>
  );
};

export default PhotoStack;
