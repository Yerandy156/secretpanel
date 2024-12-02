import { motion } from 'framer-motion';

interface AdminBadgeProps {
  className?: string;
}

export default function AdminBadge({ className = '' }: AdminBadgeProps) {
  return (
    <motion.div 
      className={`flex items-center space-x-1 ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <img 
        src="https://th.bing.com/th/id/R.6f2b971fd5dd4b6c0cd239340e23fb05?rik=cfElUoilVa%2fevQ&pid=ImgRaw&r=0" 
        alt="CEO Crown" 
        className="w-5 h-5"
      />
      <span className="text-yellow-500 text-sm font-semibold">CEO</span>
    </motion.div>
  );
}
