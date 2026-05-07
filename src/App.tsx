import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { DailyView } from '@/components/DailyView';
import { WeeklyView } from '@/components/WeeklyView';
import { TodoPanel } from '@/components/TodoPanel';
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
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading your system…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {focusMode ? (
          <DailyView focusMode />
        ) : view === 'daily' ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <DailyView />
            </div>
            <TodoPanel />
          </div>
        ) : view === 'weekly' ? (
          <WeeklyView full />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <WeeklyView />
            <DailyView />
          </div>
        )}
        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Local-first. Your data stays in this browser unless you export it.
        </footer>
      </main>
    </div>
  );
}

export default App;
