import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Trash2, BookOpen, Target, ListChecks, Star, Archive } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCheck } from './AnimatedCheck';
import { ContributionGraph } from './ContributionGraph';
import { useStore, DAYS, Grade } from '@/store/useStore';
import { cn } from '@/lib/utils';

function gradeBadgeClasses(g: Grade) {
  switch (g) {
    case 'A': return 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30';
    case 'B': return 'bg-slate-400/15 text-slate-200 border-slate-400/30';
    case 'C': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'D': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    default: return 'bg-slate-800 text-slate-500 border-slate-700';
  }
}

export function WeeklyView({ full = false }: { full?: boolean }) {
  const state = useStore((s) => s.state);
  const updateWeekly = useStore((s) => s.updateWeekly);
  const streak = state.meta.streakCount;
  const [parkInput, setParkInput] = useState('');

  const projectNames = state.weekly.projectMenu.flatMap((t) => t.items.map((i) => i.name)).filter(Boolean);

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-5">
          <blockquote className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-emerald-500/60 pl-3">
            "You do not rise to the level of your goals. You fall to the level of your systems."
            <span className="block text-xs text-slate-500 mt-1 not-italic">— James Clear</span>
          </blockquote>
          <div className="mt-4">
            <label className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
              <Star size={12} /> Weekly North Star
            </label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-slate-400 text-sm">This week is a win if:</span>
              <Input
                value={state.weekly.northStar}
                onChange={(e) => updateWeekly((w) => { w.northStar = e.target.value; })}
                placeholder="..."
                className="bg-slate-950 border-slate-800 text-slate-100 flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-slate-100 text-base">Contribution Graph</CardTitle>
          <motion.div
            key={streak}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30"
          >
            <Flame size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-200">Current Streak: {streak} days</span>
          </motion.div>
        </CardHeader>
        <CardContent>
          <ContributionGraph large={full} />
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <ListChecks size={16} className="text-emerald-400" /> Project Menu
            <span className="text-xs font-normal text-slate-500 ml-2">Reference only</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.weekly.projectMenu.map((track, ti) => (
            <div key={track.track} className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
              <div className="text-xs font-semibold text-slate-300 mb-2">{track.track}</div>
              <div className="flex flex-wrap gap-3">
                {track.items.map((item, ii) => (
                  <AnimatedCheck
                    key={ii}
                    size={18}
                    checked={item.checked}
                    onChange={(v) => updateWeekly((w) => { w.projectMenu[ti].items[ii].checked = v; })}
                    label={item.name}
                  />
                ))}
                {track.track === 'Competitions' && (
                  <Input
                    value={track.extra ?? ''}
                    onChange={(e) => updateWeekly((w) => { w.projectMenu[ti].extra = e.target.value; })}
                    placeholder="Kaggle: competition name"
                    className="bg-slate-950 border-slate-800 text-slate-100 h-8 text-xs max-w-xs"
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <Target size={16} className="text-emerald-400" /> Flagship Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {state.weekly.flagshipProjects.map((fp, idx) => (
            <div key={idx} className="border border-slate-800 rounded-lg p-4 bg-slate-950/60">
              <div className="flex items-center justify-between mb-2">
                <Badge className={cn('font-mono', idx === 0 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-700/40 border-slate-600 text-slate-200')}>
                  {fp.priority}
                </Badge>
                <AnimatedCheck
                  size={20}
                  checked={fp.done}
                  onChange={(v) => updateWeekly((w) => { w.flagshipProjects[idx].done = v; })}
                  label="Done"
                />
              </div>
              <Select value={fp.name || undefined} onValueChange={(v) => updateWeekly((w) => { w.flagshipProjects[idx].name = v; })}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 mb-2">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  {projectNames.length === 0 && <div className="px-2 py-1.5 text-xs text-slate-500">Add items to Project Menu first</div>}
                  {projectNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea
                value={fp.outcome}
                onChange={(e) => updateWeekly((w) => { w.flagshipProjects[idx].outcome = e.target.value; })}
                placeholder="Weekly outcome..."
                className="bg-slate-950 border-slate-800 text-slate-100 text-sm min-h-[60px]"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base">Parking Lot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              value={parkInput}
              onChange={(e) => setParkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && parkInput.trim()) {
                  updateWeekly((w) => { w.parkingLot.push(parkInput.trim()); });
                  setParkInput('');
                }
              }}
              placeholder="Capture an idea, press Enter"
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
            <button
              onClick={() => {
                if (parkInput.trim()) {
                  updateWeekly((w) => { w.parkingLot.push(parkInput.trim()); });
                  setParkInput('');
                }
              }}
              className="px-3 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence>
              {state.weekly.parkingLot.length === 0 && (
                <div className="text-xs text-slate-500 italic">No parked items yet.</div>
              )}
              {state.weekly.parkingLot.map((item, i) => (
                <motion.div
                  key={i + item}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-md px-3 py-1.5"
                >
                  <span className="text-sm text-slate-200">{item}</span>
                  <button
                    onClick={() => updateWeekly((w) => { w.parkingLot.splice(i, 1); })}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <BookOpen size={16} className="text-emerald-400" /> Learning Sprint
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase text-slate-500">Topic</label>
            <Input
              value={state.weekly.learningSprint.topic}
              onChange={(e) => updateWeekly((w) => { w.learningSprint.topic = e.target.value; })}
              className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase text-slate-500">Target</label>
            <Input
              value={state.weekly.learningSprint.target}
              onChange={(e) => updateWeekly((w) => { w.learningSprint.target = e.target.value; })}
              className="bg-slate-950 border-slate-800 text-slate-100 mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base">Weekly Block Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-slate-500 border-b border-slate-800">
                  <th className="text-left py-2 px-2 w-16">Day</th>
                  <th className="text-left py-2 px-2">Morning</th>
                  <th className="text-left py-2 px-2">Afternoon</th>
                  <th className="text-left py-2 px-2">Evening</th>
                  <th className="text-left py-2 px-2 w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, i) => {
                  const dateKey = format(addDays(new Date(state.meta.currentWeekStart), i), 'yyyy-MM-dd');
                  const grade = state.daily[dateKey]?.grade ?? null;
                  const t = state.weekly.dailyThemes[day];
                  return (
                    <tr key={day} className="border-b border-slate-800/60">
                      <td className="py-2 px-2 font-medium text-slate-300">{day}</td>
                      <td className="py-1 px-1">
                        <Input
                          value={t.morning}
                          onChange={(e) => updateWeekly((w) => { w.dailyThemes[day].morning = e.target.value; })}
                          className="bg-slate-950 border-slate-800 text-slate-100 h-8 text-xs"
                          placeholder="Intent"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          value={t.afternoon}
                          onChange={(e) => updateWeekly((w) => { w.dailyThemes[day].afternoon = e.target.value; })}
                          className="bg-slate-950 border-slate-800 text-slate-100 h-8 text-xs"
                          placeholder="Intent"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          value={t.evening}
                          onChange={(e) => updateWeekly((w) => { w.dailyThemes[day].evening = e.target.value; })}
                          className="bg-slate-950 border-slate-800 text-slate-100 h-8 text-xs"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <span className={cn('inline-block px-2 py-0.5 rounded-md text-xs border', gradeBadgeClasses(grade))}>
                          {grade ?? '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="review" className="border-0">
              <AccordionTrigger className="px-5 py-4 text-slate-100 hover:no-underline">
                Weekly Review Checklist
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 space-y-3">
                {['P1 done', 'P2 done', 'Context switches counted', 'Dopamine trap identified', 'One tweak for next week'].map((label, i) => (
                  <AnimatedCheck
                    key={i}
                    checked={state.weekly.reviewChecklist[i]}
                    onChange={(v) => updateWeekly((w) => { w.reviewChecklist[i] = v; })}
                    label={label}
                  />
                ))}
                <Textarea
                  value={state.weekly.reviewTweak}
                  onChange={(e) => updateWeekly((w) => { w.reviewTweak = e.target.value; })}
                  placeholder="One concrete tweak for next week..."
                  className="bg-slate-950 border-slate-800 text-slate-100 mt-2"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 text-base flex items-center gap-2">
            <Archive size={16} className="text-slate-400" /> Weekly Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.archive.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No archived weeks yet. Use "New Week" to close out.</div>
          ) : (
            <Accordion type="multiple">
              {state.archive.map((a) => (
                <AccordionItem key={a.weekStart} value={a.weekStart} className="border-slate-800">
                  <AccordionTrigger className="hover:no-underline text-slate-200">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Week {a.weekNumber}</span>
                      <span className="text-slate-500 text-xs">{format(new Date(a.weekStart), 'MMM d, yyyy')}</span>
                      <span className="text-amber-300 text-xs">Streak: {a.finalStreak}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <div className="text-slate-400">North Star: <span className="text-slate-200">{a.northStar || '—'}</span></div>
                    <div className="text-slate-400">P1: <span className="text-slate-200">{a.p1.name || '—'}</span> — {a.p1.outcome}</div>
                    <div className="text-slate-400">P2: <span className="text-slate-200">{a.p2.name || '—'}</span> — {a.p2.outcome}</div>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(a.dailyGrades).map(([d, g]) => (
                        <span key={d} className={cn('text-[10px] px-1.5 py-0.5 rounded border', gradeBadgeClasses(g))}>
                          {format(new Date(d), 'EEE')}:{g ?? '—'}
                        </span>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
