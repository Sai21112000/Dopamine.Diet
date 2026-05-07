import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Trash2, BookOpen, Target, ListChecks, Star, Archive, RotateCcw } from 'lucide-react';
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
    case 'B': return 'bg-secondary text-secondary-foreground border-border';
    case 'C': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'D': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function WeeklyView({ full = false }: { full?: boolean }) {
  const state = useStore((s) => s.state);
  const updateWeekly = useStore((s) => s.updateWeekly);
  const streak = state.meta.streakCount;
  const [parkInput, setParkInput] = useState('');
  const [newTrack, setNewTrack] = useState('');
  const [itemInputs, setItemInputs] = useState<Record<number, string>>({});
  const [customReview, setCustomReview] = useState('');

  const projectOptions = state.weekly.projectMenu.flatMap((track) =>
    track.items
      .filter((item) => item.name.trim())
      .map((item) => ({ name: item.name, track: track.track }))
  );
  const projectNames = Array.from(new Set(projectOptions.map((option) => option.name)));

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border text-card-foreground">
        <CardContent className="p-5">
          <blockquote className="text-sm text-foreground italic leading-relaxed border-l-2 border-primary/60 pl-3">
            "You do not rise to the level of your goals. You fall to the level of your systems."
            <span className="block text-xs text-muted-foreground mt-1 not-italic">- James Clear</span>
          </blockquote>
          <div className="mt-4">
            <label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Star size={12} /> Weekly North Star
            </label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-muted-foreground text-sm">This week is a win if:</span>
              <Input
                value={state.weekly.northStar}
                onChange={(e) => updateWeekly((w) => { w.northStar = e.target.value; })}
                placeholder="..."
                className="bg-background border-input text-foreground flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base">Contribution Graph</CardTitle>
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

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              <ListChecks size={16} className="text-primary" /> Project Menu
              <span className="text-xs font-normal text-muted-foreground ml-2">Editable defaults</span>
            </CardTitle>
            <button
              onClick={() => {
                if (confirm('Reset project menu to defaults?')) {
                  updateWeekly((w) => { w.projectMenu = JSON.parse(JSON.stringify([
                    { track: 'Agents & Chatbots', items: [{ name: 'AI Chatbot', checked: false }, { name: 'Agent Building', checked: false }] },
                    { track: 'Research', items: [{ name: 'Paper: Before AI', checked: false }, { name: 'Paper: After AI', checked: false }, { name: 'OCR Paper + Code', checked: false }, { name: 'TTS Paper + Code', checked: false }] },
                    { track: 'Fast Track', items: [{ name: 'Docker', checked: false }, { name: 'AWS/GCP', checked: false }, { name: 'K8s', checked: false }, { name: 'SQL/Postgres/Mongo', checked: false }, { name: 'MCP Server', checked: false }, { name: 'Model Armor', checked: false }] },
                    { track: 'LLM Engineering', items: [{ name: 'Unsloth 2B FT', checked: false }, { name: 'LLM Deploy', checked: false }] },
                    { track: 'Courses/Use Cases', items: [{ name: 'RL', checked: false }, { name: 'LangChain', checked: false }, { name: 'LangGraph', checked: false }, { name: 'CrewAI', checked: false }, { name: 'Google Vertex', checked: false }] },
                    { track: 'Competitions', items: [] },
                  ])); });
                }
              }}
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.weekly.projectMenu.map((track, ti) => (
            <div key={`${track.track}-${ti}`} className="border border-border rounded-lg p-3 bg-background/50">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={track.track}
                  onChange={(e) => updateWeekly((w) => { w.projectMenu[ti].track = e.target.value; })}
                  className="bg-card border-input text-foreground h-8 text-xs font-semibold"
                  placeholder="Track name"
                />
                <button
                  onClick={() => updateWeekly((w) => { w.projectMenu.splice(ti, 1); })}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Delete ${track.track}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {track.items.map((item, ii) => (
                  <div key={`${item.name}-${ii}`} className="flex items-center gap-2">
                    <AnimatedCheck
                      size={18}
                      checked={item.checked}
                      onChange={(v) => updateWeekly((w) => { w.projectMenu[ti].items[ii].checked = v; })}
                    />
                    <Input
                      value={item.name}
                      onChange={(e) => updateWeekly((w) => { w.projectMenu[ti].items[ii].name = e.target.value; })}
                      className="bg-background border-input text-foreground h-8 text-xs"
                      placeholder="Project item"
                    />
                    <button
                      onClick={() => updateWeekly((w) => { w.projectMenu[ti].items.splice(ii, 1); })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={itemInputs[ti] ?? ''}
                    onChange={(e) => setItemInputs((prev) => ({ ...prev, [ti]: e.target.value }))}
                    onKeyDown={(e) => {
                      const value = (itemInputs[ti] ?? '').trim();
                      if (e.key === 'Enter' && value) {
                        updateWeekly((w) => { w.projectMenu[ti].items.push({ name: value, checked: false }); });
                        setItemInputs((prev) => ({ ...prev, [ti]: '' }));
                      }
                    }}
                    placeholder="+ Add custom item"
                    className="bg-background border-input text-foreground h-8 text-xs"
                  />
                  <button
                    onClick={() => {
                      const value = (itemInputs[ti] ?? '').trim();
                      if (value) {
                        updateWeekly((w) => { w.projectMenu[ti].items.push({ name: value, checked: false }); });
                        setItemInputs((prev) => ({ ...prev, [ti]: '' }));
                      }
                    }}
                    className="px-2.5 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 bg-background/30">
            <Input
              value={newTrack}
              onChange={(e) => setNewTrack(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTrack.trim()) {
                  updateWeekly((w) => { w.projectMenu.push({ track: newTrack.trim(), items: [] }); });
                  setNewTrack('');
                }
              }}
              placeholder="+ New custom track"
              className="bg-background border-input text-foreground h-8 text-xs"
            />
            <button
              onClick={() => {
                if (newTrack.trim()) {
                  updateWeekly((w) => { w.projectMenu.push({ track: newTrack.trim(), items: [] }); });
                  setNewTrack('');
                }
              }}
              className="px-3 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Target size={16} className="text-primary" /> Flagship Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {state.weekly.flagshipProjects.map((fp, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4 bg-background/60">
              <div className="flex items-center justify-between mb-2">
                <Badge className={cn('font-mono', idx === 0 ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-secondary border-border text-secondary-foreground')}>
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
                <SelectTrigger className="bg-background border-input text-foreground mb-2">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {projectNames.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">Add items to Project Menu first</div>}
                  {projectOptions.map((option) => (
                    <SelectItem key={`${option.track}-${option.name}`} value={option.name}>
                      <span className="inline-flex items-center gap-2">
                        <span className="text-[10px] text-primary">{option.track}</span>
                        <span>{option.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={fp.name}
                onChange={(e) => updateWeekly((w) => { w.flagshipProjects[idx].name = e.target.value; })}
                placeholder="Or type a custom flagship"
                className="bg-background border-input text-foreground mb-2 h-8 text-xs"
              />
              <Textarea
                value={fp.outcome}
                onChange={(e) => updateWeekly((w) => { w.flagshipProjects[idx].outcome = e.target.value; })}
                placeholder="Weekly outcome..."
                className="bg-background border-input text-foreground text-sm min-h-[60px]"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base">Parking Lot</CardTitle>
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
              className="bg-background border-input text-foreground"
            />
            <button
              onClick={() => {
                if (parkInput.trim()) {
                  updateWeekly((w) => { w.parkingLot.push(parkInput.trim()); });
                  setParkInput('');
                }
              }}
              className="px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence>
              {state.weekly.parkingLot.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No parked items yet.</div>
              )}
              {state.weekly.parkingLot.map((item, i) => (
                <motion.div
                  key={i + item}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center justify-between bg-background/60 border border-border rounded-md px-3 py-1.5"
                >
                  <span className="text-sm text-foreground">{item}</span>
                  <button
                    onClick={() => updateWeekly((w) => { w.parkingLot.splice(i, 1); })}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <BookOpen size={16} className="text-primary" /> Learning Sprint
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase text-muted-foreground">Topic</label>
            <Input
              value={state.weekly.learningSprint.topic}
              onChange={(e) => updateWeekly((w) => { w.learningSprint.topic = e.target.value; })}
              className="bg-background border-input text-foreground mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase text-muted-foreground">Target</label>
            <Input
              value={state.weekly.learningSprint.target}
              onChange={(e) => updateWeekly((w) => { w.learningSprint.target = e.target.value; })}
              className="bg-background border-input text-foreground mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base">Weekly Block Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-muted-foreground border-b border-border">
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
                    <tr key={day} className="border-b border-border/60">
                      <td className="py-2 px-2 font-medium text-foreground">{day}</td>
                      <td className="py-1 px-1">
                        <Input
                          value={t.morning}
                          onChange={(e) => updateWeekly((w) => { w.dailyThemes[day].morning = e.target.value; })}
                          className="bg-background border-input text-foreground h-8 text-xs"
                          placeholder="Intent"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          value={t.afternoon}
                          onChange={(e) => updateWeekly((w) => { w.dailyThemes[day].afternoon = e.target.value; })}
                          className="bg-background border-input text-foreground h-8 text-xs"
                          placeholder="Intent"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <Input
                          value={t.evening}
                          onChange={(e) => updateWeekly((w) => { w.dailyThemes[day].evening = e.target.value; })}
                          className="bg-background border-input text-foreground h-8 text-xs"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <span className={cn('inline-block px-2 py-0.5 rounded-md text-xs border', gradeBadgeClasses(grade))}>
                          {grade ?? 'Pending'}
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

      <Card className="bg-card border-border text-card-foreground">
        <CardContent className="p-0">
          <Accordion type="single" collapsible>
            <AccordionItem value="review" className="border-0">
              <AccordionTrigger className="px-5 py-4 text-foreground hover:no-underline">
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
                {state.weekly.reviewCustom.map((item, i) => (
                  <div key={`${item.label}-${i}`} className="flex items-center gap-2">
                    <AnimatedCheck
                      checked={item.checked}
                      onChange={(v) => updateWeekly((w) => { w.reviewCustom[i].checked = v; })}
                    />
                    <Input
                      value={item.label}
                      onChange={(e) => updateWeekly((w) => { w.reviewCustom[i].label = e.target.value; })}
                      className="bg-background border-input text-foreground h-8 text-xs"
                      placeholder="Custom review item"
                    />
                    <button
                      onClick={() => updateWeekly((w) => { w.reviewCustom.splice(i, 1); })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Delete ${item.label}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={customReview}
                    onChange={(e) => setCustomReview(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customReview.trim()) {
                        updateWeekly((w) => { w.reviewCustom.push({ label: customReview.trim(), checked: false }); });
                        setCustomReview('');
                      }
                    }}
                    placeholder="+ Add custom checklist item"
                    className="bg-background border-input text-foreground h-8 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (customReview.trim()) {
                        updateWeekly((w) => { w.reviewCustom.push({ label: customReview.trim(), checked: false }); });
                        setCustomReview('');
                      }
                    }}
                    className="px-2.5 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <Textarea
                  value={state.weekly.reviewTweak}
                  onChange={(e) => updateWeekly((w) => { w.reviewTweak = e.target.value; })}
                  placeholder="One concrete tweak for next week..."
                  className="bg-background border-input text-foreground mt-2"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Archive size={16} className="text-muted-foreground" /> Weekly Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.archive.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No archived weeks yet. Use "New Week" to close out.</div>
          ) : (
            <Accordion type="multiple">
              {state.archive.map((a) => (
                <AccordionItem key={a.weekStart} value={a.weekStart} className="border-border">
                  <AccordionTrigger className="hover:no-underline text-foreground">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">Week {a.weekNumber}</span>
                      <span className="text-muted-foreground text-xs">{format(new Date(a.weekStart), 'MMM d, yyyy')}</span>
                      <span className="text-amber-300 text-xs">Streak: {a.finalStreak}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <div className="text-muted-foreground">North Star: <span className="text-foreground">{a.northStar || 'Not set'}</span></div>
                    <div className="text-muted-foreground">P1: <span className="text-foreground">{a.p1.name || 'Not set'}</span> - {a.p1.outcome}</div>
                    <div className="text-muted-foreground">P2: <span className="text-foreground">{a.p2.name || 'Not set'}</span> - {a.p2.outcome}</div>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(a.dailyGrades).map(([d, g]) => (
                        <span key={d} className={cn('text-[10px] px-1.5 py-0.5 rounded border', gradeBadgeClasses(g))}>
                          {format(new Date(d), 'EEE')}:{g ?? 'Pending'}
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
