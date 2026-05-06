import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { DailyView } from '@/components/DailyView';
import { WeeklyView } from '@/components/WeeklyView';
import { useStore } from '@/store/useStore';

function App() {
  const hydrated = useStore((s) => s.hydrated);
  const hydrate = useStore((s) => s.hydrate);
  const view = useStore((s) => s.view);
  const focusMode = useStore((s) => s.focusMode);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading your system…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TopBar />
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {focusMode ? (
          <DailyView focusMode />
        ) : view === 'daily' ? (
          <div className="max-w-4xl mx-auto">
            <DailyView />
          </div>
        ) : view === 'weekly' ? (
          <WeeklyView full />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <WeeklyView />
            <DailyView />
          </div>
        )}
        <footer className="mt-10 text-center text-xs text-slate-600">
          Systems over goals. Local + Supabase synced.
        </footer>
      </main>
    </div>
  );
}

export default App;
