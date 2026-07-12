import { useEffect, useRef, useState } from 'react';
import { useInView, motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  duration = 1.6,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, { duration, ease: [0.2, 0, 0, 1] });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, value, duration, motionValue, rounded]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
      {suffix}
    </motion.span>
  );
}
