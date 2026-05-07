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
  const completedSoundRef = useRef(false);

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
    if (block.timerSeconds === 0 && block.complete && !completedSoundRef.current) {
      completedSoundRef.current = true;
      chime();
    }
    if (block.timerSeconds > 0) completedSoundRef.current = false;
  }, [block.complete, block.timerSeconds]);

  const toggleRun = () => updateDaily(dateKey, (d) => { d[which].timerRunning = !d[which].timerRunning; });
  const reset = () => updateDaily(dateKey, (d) => {
    d[which].timerSeconds = d[which].timerTargetSeconds;
    d[which].timerRunning = false;
  });
  const setTimerMinutes = (minutes: number) => updateDaily(dateKey, (d) => {
    const seconds = Math.max(1, Math.round(minutes * 60));
    d[which].timerTargetSeconds = seconds;
    d[which].timerSeconds = seconds;
    d[which].timerRunning = false;
  });

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border p-5 bg-card text-card-foreground space-y-4',
        highlight ? 'border-primary/50 shadow-[0_0_32px_-8px_rgba(34,211,238,0.28)]' : 'border-border'
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <AnimatedCheck
          size={22}
          checked={block.complete}
          onChange={(v) => updateDaily(dateKey, (d) => { d[which].complete = v; })}
          label="Block Complete"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase text-muted-foreground">Project</label>
          <Select value={block.project || undefined} onValueChange={(v) => updateDaily(dateKey, (d) => { d[which].project = v; })}>
            <SelectTrigger className="bg-background border-input text-foreground mt-1">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {projects.length === 0 && <div className="px-2 py-1 text-xs text-muted-foreground">No projects yet</div>}
              {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            value={block.project}
            onChange={(e) => updateDaily(dateKey, (d) => { d[which].project = e.target.value; })}
            placeholder="Or type a custom project"
            className="bg-background border-input text-foreground mt-2 h-8 text-xs"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase text-muted-foreground">Micro-Win Target (3 bullets max)</label>
          <Textarea
            value={block.target}
            onChange={(e) => updateDaily(dateKey, (d) => { d[which].target = e.target.value; })}
            placeholder="- ship X&#10;- fix Y&#10;- write Z"
            className="bg-background border-input text-foreground mt-1 min-h-[72px]"
          />
        </div>
      </div>

      <div className={cn(
        'rounded-xl bg-background border p-6 flex flex-col items-center gap-3 transition-colors',
        block.timerRunning ? 'border-primary/60 shadow-[0_0_24px_-8px_rgba(34,211,238,0.4)]' : 'border-border'
      )}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Manual timer</span>
          <Input
            type="number"
            min={1}
            value={Math.round(block.timerTargetSeconds / 60)}
            onChange={(e) => setTimerMinutes(Number(e.target.value) || 1)}
            className="w-20 h-8 bg-card border-input text-foreground text-center"
          />
          <span>minutes</span>
        </div>
        <div className="mono text-5xl md:text-6xl font-semibold text-foreground tabular-nums">
          {fmt(block.timerSeconds)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleRun}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
          >
            {block.timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase text-muted-foreground">15-min Segments</label>
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
                on ? 'bg-primary border-primary' : 'bg-muted border-border soft-pulse'
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase text-muted-foreground">Micro-Wins</label>
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
                className="bg-background border-input text-foreground h-8"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] uppercase text-muted-foreground">Distraction Log</label>
          <button
            onClick={() => updateDaily(dateKey, (d) => {
              d[which].distractions.push({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), urge: '', parked: false });
            })}
            className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1"
          >
            <Plus size={12} /> Add Urge
          </button>
        </div>
        {block.distractions.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">No urges logged.</div>
        ) : (
          <div className="space-y-1.5">
            {block.distractions.map((dx, i) => (
              <div key={i} className="flex items-center gap-2 bg-background/70 border border-border rounded-md px-2 py-1">
                <span className="text-xs text-muted-foreground w-14 mono">{dx.time}</span>
                <Input
                  value={dx.urge}
                  onChange={(e) => updateDaily(dateKey, (d) => { d[which].distractions[i].urge = e.target.value; })}
                  placeholder="What's pulling you?"
                  className="bg-card border-input text-foreground h-7 text-xs flex-1"
                />
                <AnimatedCheck
                  size={18}
                  checked={dx.parked}
                  onChange={(v) => updateDaily(dateKey, (d) => { d[which].distractions[i].parked = v; })}
                  label="Parked"
                />
                <button
                  onClick={() => updateDaily(dateKey, (d) => { d[which].distractions.splice(i, 1); })}
                  className="text-muted-foreground hover:text-destructive"
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
