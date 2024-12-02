import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HoldButtonProps {
  onComplete: () => void;
  duration?: number;
  className?: string;
  children: React.ReactNode;
}

export default function HoldButton({ onComplete, duration = 1000, className = '', children }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let animationFrame: number;
    
    if (holding && startTime) {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);
        
        if (newProgress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          onComplete();
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    } else {
      setProgress(0);
    }
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [holding, startTime, duration, onComplete]);

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onMouseDown={() => {
        setHolding(true);
        setStartTime(Date.now());
      }}
      onMouseUp={() => {
        setHolding(false);
        setStartTime(null);
      }}
      onMouseLeave={() => {
        setHolding(false);
        setStartTime(null);
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative z-10">
        {children}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-purple-500"
        style={{ width: `${progress * 100}%` }}
        animate={{ width: `${progress * 100}%` }}
      />
    </motion.button>
  );
}
