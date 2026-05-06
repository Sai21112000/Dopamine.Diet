import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, Upload, RefreshCw, Focus, Calendar as CalIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useStore, ViewMode, AppState } from '@/store/useStore';
import { cn } from '@/lib/utils';

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'combo', label: 'Combo' },
];

export function TopBar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const focusMode = useStore((s) => s.focusMode);
  const setFocus = useStore((s) => s.setFocus);
  const state = useStore((s) => s.state);
  const importData = useStore((s) => s.importData);
  const archiveWeek = useStore((s) => s.archiveWeek);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dopamine-system-week-${String(state.meta.totalWeeks).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (f: File) => {
    try {
      const text = await f.text();
      const data = JSON.parse(text) as AppState;
      if (!data.meta || !data.weekly || !data.daily) throw new Error('Invalid');
      if (!confirm('This will overwrite all current state. Continue?')) return;
      importData(data);
    } catch {
      alert('Invalid file format.');
    }
  };

  const newWeek = () => {
    const wipe = confirm('Archive current week and start fresh.\n\nOK = Keep Project Menu + Parking Lot.\nCancel = Full wipe.');
    archiveWeek(!wipe);
  };

  return (
    <div className="sticky top-0 z-50 backdrop-blur bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
          >
            <Zap className="text-emerald-400" size={20} />
          </motion.div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-100">Dopamine-Free Work System</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <CalIcon size={11} />
              {format(new Date(), 'EEEE, MMM d, yyyy')}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                'relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                view === v.key ? 'text-slate-950' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {view === v.key && (
                <motion.div
                  layoutId="viewPill"
                  className="absolute inset-0 bg-emerald-400 rounded-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{v.label}</span>
            </button>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={exportJson} className="text-slate-300 hover:text-white hover:bg-slate-800">
          <Download size={14} className="mr-1.5" /> Export
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="text-slate-300 hover:text-white hover:bg-slate-800">
          <Upload size={14} className="mr-1.5" /> Import
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />
        <Button variant="ghost" size="sm" onClick={newWeek} className="text-slate-300 hover:text-white hover:bg-slate-800">
          <RefreshCw size={14} className="mr-1.5" /> New Week
        </Button>
        <Button
          variant={focusMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFocus(!focusMode)}
          className={cn(
            focusMode
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          )}
        >
          <Focus size={14} className="mr-1.5" /> {focusMode ? 'Exit Focus' : 'Focus'}
        </Button>
      </div>
    </div>
  );
}
