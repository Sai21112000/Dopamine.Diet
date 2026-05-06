import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCheck } from './AnimatedCheck';
import { useStore, BlockState } from '@/store/useStore';
import { chime, tick } from '@/lib/sound';
import { cn } from '@/lib/utils';

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
}

interface Props {
  label: string;
  block: BlockState;
  dateKey: string;
  which: 'block1' | 'block2';
  projects: string[];
  highlight?: boolean;
}

export function DeepBlock({ label, block, dateKey, which, projects, highlight }: Props) {
  const updateDaily = useStore((s) => s.updateDaily);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (block.timerRunning && block.timerSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        updateDaily(dateKey, (d) => {
          const b = d[which];
          if (b.timerSeconds > 0) b.timerSeconds -= 1;
          if (b.timerSeconds === 0) {
            b.timerRunning = false;
            b.complete = true;
          }
        });
      }, 1000);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [block.timerRunning, block.timerSeconds, dateKey, which, updateDaily]);

  useEffect(() => {
    if (block.timerSeconds === 0 && block.complete) chime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.complete]);

  const toggleRun = () => updateDaily(dateKey, (d) => { d[which].timerRunning = !d[which].timerRunning; });
  const reset = () => updateDaily(dateKey, (d) => { d[which].timerSeconds = 5400; d[which].timerRunning = false; });

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border p-5 bg-slate-900 space-y-4',
        highlight ? 'border-emerald-500/50 shadow-[0_0_32px_-8px_rgba(16,185,129,0.45)]' : 'border-slate-800'
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{label}</h3>
        <AnimatedCheck
          size={22}
          checked={block.complete}
          onChange={(v) => updateDaily(dateKey, (d) => { d[which].complete = v; })}
          label="Block Complete"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase text-slate-500">Project</label>
          <Select value={block.project || undefined} onValueChange={(v) => updateDaily(dateKey, (d) => { d[which].project = v; })}>
            <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 mt-1">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              {projects.length === 0 && <div className="px-2 py-1 text-xs text-slate-500">No projects yet</div>}
              {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] uppercase text-slate-500">Micro-Win Target (3 bullets max)</label>
          <Textarea
            value={block.target}
            onChange={(e) => updateDaily(dateKey, (d) => { d[which].target = e.target.value; })}
            placeholder="- ship X&#10;- fix Y&#10;- write Z"
            className="bg-slate-950 border-slate-800 text-slate-100 mt-1 min-h-[72px]"
          />
        </div>
      </div>

      <div className={cn(
        'rounded-xl bg-slate-950 border p-6 flex flex-col items-center gap-3 transition-colors',
        block.timerRunning ? 'border-emerald-500/60 shadow-[0_0_24px_-8px_rgba(16,185,129,0.7)]' : 'border-slate-800'
      )}>
        <div className="mono text-5xl md:text-6xl font-semibold text-slate-100 tabular-nums">
          {fmt(block.timerSeconds)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleRun}
            className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-medium text-sm hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5"
          >
            {block.timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-slate-800 text-slate-200 font-medium text-sm hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase text-slate-500">15-min Segments</label>
        <div className="flex gap-2 mt-2">
          {block.segments.map((on, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 1.2 }}
              onClick={() => {
                tick();
                updateDaily(dateKey, (d) => { d[which].segments[i] = !d[which].segments[i]; });
              }}
              className={cn(
                'flex-1 aspect-square rounded-lg border transition-colors',
                on ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700 soft-pulse'
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase text-slate-500">Micro-Wins</label>
        <div className="space-y-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <AnimatedCheck
                size={20}
                checked={block.wins[i]}
                onChange={(v) => updateDaily(dateKey, (d) => { d[which].wins[i] = v; })}
              />
              <Input
                value={block.winsText[i]}
                onChange={(e) => updateDaily(dateKey, (d) => { d[which].winsText[i] = e.target.value; })}
                placeholder={`Win ${i + 1}`}
                className="bg-slate-950 border-slate-800 text-slate-100 h-8"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] uppercase text-slate-500">Distraction Log</label>
          <button
            onClick={() => updateDaily(dateKey, (d) => {
              d[which].distractions.push({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), urge: '', parked: false });
            })}
            className="text-xs text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
          >
            <Plus size={12} /> Add Urge
          </button>
        </div>
        {block.distractions.length === 0 ? (
          <div className="text-xs text-slate-600 italic">No urges logged.</div>
        ) : (
          <div className="space-y-1.5">
            {block.distractions.map((dx, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-md px-2 py-1">
                <span className="text-xs text-slate-500 w-14 mono">{dx.time}</span>
                <Input
                  value={dx.urge}
                  onChange={(e) => updateDaily(dateKey, (d) => { d[which].distractions[i].urge = e.target.value; })}
                  placeholder="What's pulling you?"
                  className="bg-slate-900 border-slate-800 text-slate-100 h-7 text-xs flex-1"
                />
                <AnimatedCheck
                  size={18}
                  checked={dx.parked}
                  onChange={(v) => updateDaily(dateKey, (d) => { d[which].distractions[i].parked = v; })}
                  label="Parked"
                />
                <button
                  onClick={() => updateDaily(dateKey, (d) => { d[which].distractions.splice(i, 1); })}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
