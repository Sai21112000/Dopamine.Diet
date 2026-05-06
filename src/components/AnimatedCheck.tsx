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
            ? 'bg-cyan-400 border-cyan-300 text-slate-950'
            : 'bg-slate-900 border-slate-700 text-transparent group-hover:border-cyan-500/60'
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
          className="text-left text-sm text-slate-200 leading-snug hover:text-cyan-100"
        >
          {label}
        </button>
      )}
    </div>
  );
}
