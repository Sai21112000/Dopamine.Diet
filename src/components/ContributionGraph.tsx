import { useMemo } from 'react';
import { startOfYear, addDays, format, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStore, Grade } from '@/store/useStore';
import { cn } from '@/lib/utils';

function gradeColor(g: Grade | undefined) {
  switch (g) {
    case 'A': return 'bg-emerald-500';
    case 'B': return 'bg-emerald-600/80';
    case 'C': return 'bg-emerald-800/70';
    default: return 'bg-slate-800';
  }
}

export function ContributionGraph({ large = false }: { large?: boolean }) {
  const daily = useStore((s) => s.state.daily);
  const weeklyNorth = useStore((s) => s.state.weekly.northStar);

  const cells = useMemo(() => {
    const start = startOfYear(new Date());
    const offset = (getDay(start) + 6) % 7;
    const totalWeeks = 53;
    const weeks: { date: string; grade: Grade | undefined }[][] = [];
    for (let w = 0; w < totalWeeks; w++) {
      const col: { date: string; grade: Grade | undefined }[] = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d - offset;
        if (idx < 0) {
          col.push({ date: '', grade: undefined });
        } else {
          const dt = addDays(start, idx);
          if (dt > new Date()) {
            col.push({ date: '', grade: undefined });
          } else {
            const key = format(dt, 'yyyy-MM-dd');
            col.push({ date: key, grade: daily[key]?.grade ?? undefined });
          }
        }
      }
      weeks.push(col);
    }
    return weeks;
  }, [daily]);

  const sz = large ? 14 : 10;

  return (
    <TooltipProvider delayDuration={50}>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]">
          {cells.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {col.map((cell, di) => (
                <Tooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      style={{ width: sz, height: sz }}
                      className={cn('rounded-[2px] transition-colors', cell.date ? gradeColor(cell.grade) : 'bg-transparent')}
                    />
                  </TooltipTrigger>
                  {cell.date && (
                    <TooltipContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <div className="text-xs">
                        <div className="font-medium">{format(new Date(cell.date), 'MMM d, yyyy')}</div>
                        <div className="text-slate-400">Grade: {cell.grade ?? '—'}</div>
                        {weeklyNorth && <div className="text-slate-500 text-[10px] mt-1 max-w-[160px]">{weeklyNorth}</div>}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800/70" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
