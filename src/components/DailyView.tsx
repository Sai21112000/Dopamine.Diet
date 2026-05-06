import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isAfter } from 'date-fns';
import { Compass, ShieldCheck, Briefcase, ChevronRight, Gift, Sparkles, TriangleAlert as AlertTriangle, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedCheck } from './AnimatedCheck';
import { DeepBlock } from './DeepBlock';
import { useStore, Grade } from '@/store/useStore';
import { cn } from '@/lib/utils';

function gradeColor(g: Grade) {
  switch (g) {
    case 'A': return 'bg-gradient-to-br from-cyan-200 to-teal-300 text-slate-950 grade-A-glow';
    case 'B': return 'bg-gradient-to-br from-sky-200 to-cyan-300 text-slate-950 grade-B-glow';
    case 'C': return 'bg-gradient-to-br from-indigo-300 to-sky-400 text-slate-950 grade-C-glow';
    case 'D': return 'bg-slate-700 text-slate-300';
    default: return 'bg-slate-800 text-slate-500';
  }
}

export function DailyView({ focusMode = false }: { focusMode?: boolean }) {
  const state = useStore((s) => s.state);
  const selectedDate = useStore((s) => s.selectedDate);
  const setSelectedDate = useStore((s) => s.setSelectedDate);
  const updateDaily = useStore((s) => s.updateDaily);
  const ensureDay = useStore((s) => s.ensureDay);
  const setView = useStore((s) => s.setView);
  const [customCheck, setCustomCheck] = useState('');

  ensureDay(selectedDate);
  const d = state.daily[selectedDate];
  const block2Ref = useRef<HTMLDivElement>(null);

  const projects = state.weekly.projectMenu.flatMap((t) => t.items.map((i) => i.name)).filter(Boolean);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }).map((_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));

  const scoreboard = [
    { label: 'Deep Block I', on: d.block1.complete },
    { label: 'Deep Block II', on: d.block2.complete },
    { label: 'Zero Switching', on: d.zeroSwitching },
    { label: 'Real Wins Logged', on: d.winLog.filter((w) => w.trim()).length >= 2 },
    { label: 'Reward Earned', on: d.reward.claimed && !d.reward.stolen },
  ];

  const rewardEnabled = d.block1.complete && d.block2.complete;

  if (focusMode) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <DeepBlock label="DEEP BLOCK (Focus)" block={d.block1} dateKey={selectedDate} which="block1" projects={projects} highlight />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase text-slate-500 mr-2">Date</span>
          {weekDates.map((dk) => {
            const dt = new Date(dk);
            const disabled = isAfter(dt, new Date());
            return (
              <button
                key={dk}
                disabled={disabled}
                onClick={() => setSelectedDate(dk)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs border transition-colors',
                  dk === selectedDate
                    ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600',
                  disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {format(dt, 'EEE d')}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Accordion type="single" collapsible defaultValue="phase1">
            <AccordionItem value="phase1" className="border-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline text-slate-100">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-cyan-300" /> Phase 1 · Morning Priming
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-3">
                <div>
                  <label className="text-[11px] uppercase text-slate-500">North Star (today)</label>
                  <Input
                    value={d.northStar}
                    onChange={(e) => updateDaily(selectedDate, (x) => { x.northStar = e.target.value; })}
                    className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
                    placeholder="What makes today a win?"
                  />
                </div>
                <AnimatedCheck checked={d.dopamineGate} onChange={(v) => updateDaily(selectedDate, (x) => { x.dopamineGate = v; })} label="Dopamine Gate Closed" />
                <AnimatedCheck checked={d.workspaceReady} onChange={(v) => updateDaily(selectedDate, (x) => { x.workspaceReady = v; })} label="Workspace Ready" />
                <button
                  onClick={() => block2Ref.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-2 px-4 py-2 rounded-md bg-cyan-400 text-slate-950 font-semibold text-sm hover:bg-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  Lock In <ChevronRight size={14} />
                </button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div ref={block2Ref}>
        <DeepBlock label="Phase 2 · Deep Block I" block={d.block1} dateKey={selectedDate} which="block1" projects={projects} highlight />
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="buffer" className="border-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline text-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-300" /> Phase 3 · Buffer Zone
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-2">
                {['Messages checked (timed)', 'Parking lot pruned', 'Refilled (water / food / stretch)'].map((label, i) => (
                  <AnimatedCheck
                    key={i}
                    checked={d.buffer[i]}
                    onChange={(v) => updateDaily(selectedDate, (x) => { x.buffer[i] = v; })}
                    label={label}
                  />
                ))}
                {d.customChecks.map((item, i) => (
                  <div key={`${item.label}-${i}`} className="flex items-center gap-2">
                    <AnimatedCheck
                      checked={item.checked}
                      onChange={(v) => updateDaily(selectedDate, (x) => { x.customChecks[i].checked = v; })}
                    />
                    <Input
                      value={item.label}
                      onChange={(e) => updateDaily(selectedDate, (x) => { x.customChecks[i].label = e.target.value; })}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-8 text-xs"
                      placeholder="Custom checklist item"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={customCheck}
                    onChange={(e) => setCustomCheck(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customCheck.trim()) {
                        updateDaily(selectedDate, (x) => { x.customChecks.push({ label: customCheck.trim(), checked: false }); });
                        setCustomCheck('');
                      }
                    }}
                    placeholder="+ Add custom checklist item"
                    className="bg-slate-950 border-slate-800 text-slate-100 h-8 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (customCheck.trim()) {
                        updateDaily(selectedDate, (x) => { x.customChecks.push({ label: customCheck.trim(), checked: false }); });
                        setCustomCheck('');
                      }
                    }}
                    className="px-2.5 h-8 rounded-md bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <DeepBlock label="Phase 4 · Deep Block II" block={d.block2} dateKey={selectedDate} which="block2" projects={projects} />

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <Briefcase size={16} className="text-cyan-300" /> Phase 5 · Evening Shutdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-[11px] uppercase text-slate-500">Win Log · Shipped Today</label>
            <div className="space-y-2 mt-1">
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={d.winLog[i]}
                  onChange={(e) => updateDaily(selectedDate, (x) => { x.winLog[i] = e.target.value; })}
                  placeholder={`${i + 1}. Concrete artifact shipped`}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              ))}
            </div>
          </div>
          <AnimatedCheck
            checked={d.parkingLotPruned}
            onChange={(v) => updateDaily(selectedDate, (x) => { x.parkingLotPruned = v; })}
            label="Parking Lot Pruned"
          />
          <div>
            <label className="text-[11px] uppercase text-slate-500">Tomorrow Primed</label>
            <Input
              value={d.tomorrowPrimed}
              onChange={(e) => updateDaily(selectedDate, (x) => { x.tomorrowPrimed = e.target.value; })}
              placeholder="First move tomorrow..."
              className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <Gift size={16} className="text-cyan-300" /> Phase 6 · Earned Dopamine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={d.reward.text}
            onChange={(e) => updateDaily(selectedDate, (x) => { x.reward.text = e.target.value; })}
            placeholder="Reward (e.g., 1 YouTube doc, Gaming 1hr)"
            className="bg-slate-950 border-slate-800 text-slate-100"
          />
          {!rewardEnabled && <div className="text-xs text-slate-500 italic">Unlocks when both Deep Blocks are complete.</div>}
          <div className="flex gap-2">
            <button
              disabled={!rewardEnabled}
              onClick={() => updateDaily(selectedDate, (x) => { x.reward.claimed = true; x.reward.stolen = false; })}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium border transition-colors',
                d.reward.claimed && !d.reward.stolen
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500',
                !rewardEnabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              Claimed Fairly
            </button>
            <button
              disabled={!rewardEnabled}
              onClick={() => updateDaily(selectedDate, (x) => { x.reward.stolen = true; x.reward.claimed = false; })}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium border transition-colors',
                d.reward.stolen
                  ? 'bg-rose-500 text-slate-950 border-rose-400'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-500',
                !rewardEnabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              Stolen
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" /> Phase 7 · Anti-Hallucination Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            'Did I actually write code / train a model / ship an artifact today, or just plan and read?',
            'Exact moment I almost switched projects/tools today. What stopped me?',
            'If my future self watched a timelapse, respect or disappointment?',
          ].map((q, i) => (
            <div key={i}>
              <label className="text-xs text-slate-400">{q}</label>
              <Textarea
                value={d.hallucination[i]}
                onChange={(e) => updateDaily(selectedDate, (x) => { x.hallucination[i] = e.target.value; })}
                className="bg-slate-950 border-slate-800 text-slate-100 mt-1 min-h-[60px]"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <Trophy size={16} className="text-cyan-300" /> Phase 8 · Daily Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {scoreboard.map((s, i) => (
              <div key={i} className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs',
                s.on ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-100' : 'bg-slate-800/60 border-slate-700 text-slate-400'
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', s.on ? 'bg-cyan-300' : 'bg-slate-600')} />
                {s.label}
              </div>
            ))}
          </div>
          <AnimatedCheck
            checked={d.zeroSwitching}
            onChange={(v) => updateDaily(selectedDate, (x) => { x.zeroSwitching = v; })}
            label="Zero Context-Switching During Blocks"
          />
          <motion.div
            key={d.grade ?? 'none'}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className={cn(
              'mt-5 inline-flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-3xl',
              gradeColor(d.grade)
            )}
          >
            <Sparkles size={20} />
            {d.grade ?? 'Pending'}
            <span className="text-xs font-normal opacity-80 ml-1">daily grade</span>
          </motion.div>
          <div className="mt-3 text-xs text-slate-500">
            {d.grade === 'A' && 'Both blocks complete, zero switching, real wins logged.'}
            {d.grade === 'B' && 'Both blocks complete.'}
            {d.grade === 'C' && 'Only one block complete.'}
            {d.grade === 'D' && (
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Unplanned</span>
                <button onClick={() => setView('daily')} className="text-cyan-300 hover:text-cyan-200">Plan Tomorrow</button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
