import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { tick } from '@/lib/sound';
import { cn } from '@/lib/utils';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: number;
  className?: string;
}

export function AnimatedCheck({ checked, onChange, label, size = 24, className }: Props) {
  return (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      <motion.button
        type="button"
        aria-pressed={checked}
        aria-label={label}
        whileTap={{ scale: 1.15 }}
        onClick={() => {
          tick();
          onChange(!checked);
        }}
        style={{ width: size, height: size }}
        className={cn(
          'rounded-md border flex items-center justify-center transition-colors',
          checked
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-background border-border text-transparent group-hover:border-primary/60'
        )}
      >
        <motion.span
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Check size={size * 0.65} strokeWidth={3} />
        </motion.span>
      </motion.button>
      {label && (
        <button
          type="button"
          onClick={() => {
            tick();
            onChange(!checked);
          }}
          className="text-left text-sm text-foreground leading-snug hover:text-primary"
        >
          {label}
        </button>
      )}
    </div>
  );
}
