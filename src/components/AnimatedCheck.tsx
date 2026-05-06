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
    <label className={cn('flex items-center gap-3 cursor-pointer select-none group', className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 1.15 }}
        onClick={() => {
          tick();
          onChange(!checked);
        }}
        style={{ width: size, height: size }}
        className={cn(
          'rounded-md border flex items-center justify-center transition-colors',
          checked
            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
            : 'bg-slate-900 border-slate-700 text-transparent group-hover:border-slate-500'
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
      {label && <span className="text-sm text-slate-200">{label}</span>}
    </label>
  );
}
