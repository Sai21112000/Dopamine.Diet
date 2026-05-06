import { create } from 'zustand';
import { format, startOfWeek, addDays, differenceInCalendarDays, subDays } from 'date-fns';
import { supabase, APP_STATE_ID } from '@/lib/supabase';

export type Grade = 'A' | 'B' | 'C' | 'D' | null;

export interface BlockState {
  project: string;
  target: string;
  timerSeconds: number;
  timerRunning: boolean;
  segments: boolean[];
  wins: boolean[];
  winsText: string[];
  distractions: { time: string; urge: string; parked: boolean }[];
  complete: boolean;
  zeroSwitch?: boolean;
}

export interface DailyState {
  northStar: string;
  dopamineGate: boolean;
  workspaceReady: boolean;
  block1: BlockState;
  block2: BlockState;
  buffer: boolean[];
  winLog: string[];
  parkingLotPruned: boolean;
  tomorrowPrimed: string;
  reward: { text: string; claimed: boolean; stolen: boolean };
  hallucination: string[];
  zeroSwitching: boolean;
  grade: Grade;
}

export interface FlagshipProject {
  priority: 'P1' | 'P2';
  name: string;
  outcome: string;
  done: boolean;
}

export interface ProjectTrack {
  track: string;
  items: { name: string; checked: boolean }[];
  extra?: string;
}

export interface WeeklyState {
  northStar: string;
  flagshipProjects: FlagshipProject[];
  parkingLot: string[];
  learningSprint: { topic: string; target: string };
  dailyThemes: Record<string, { morning: string; afternoon: string; evening: string }>;
  projectMenu: ProjectTrack[];
  reviewChecklist: boolean[];
  reviewTweak: string;
}

export interface ArchiveEntry {
  weekStart: string;
  weekNumber: number;
  finalStreak: number;
  dailyGrades: Record<string, Grade>;
  p1: FlagshipProject;
  p2: FlagshipProject;
  northStar: string;
}

export interface MetaState {
  currentWeekStart: string;
  streakCount: number;
  lastOpened: string;
  totalWeeks: number;
}

export type ViewMode = 'daily' | 'weekly' | 'combo';

export interface AppState {
  meta: MetaState;
  weekly: WeeklyState;
  daily: Record<string, DailyState>;
  archive: ArchiveEntry[];
}

const DEFAULT_TRACKS: ProjectTrack[] = [
  { track: 'Agents & Chatbots', items: [{ name: 'AI Chatbot', checked: false }, { name: 'Agent Building', checked: false }] },
  { track: 'Research', items: [{ name: 'Paper: Before AI', checked: false }, { name: 'Paper: After AI', checked: false }, { name: 'OCR Paper + Code', checked: false }, { name: 'TTS Paper + Code', checked: false }] },
  { track: 'Fast Track', items: [{ name: 'Docker', checked: false }, { name: 'AWS/GCP', checked: false }, { name: 'K8s', checked: false }, { name: 'SQL/Postgres/Mongo', checked: false }, { name: 'MCP Server', checked: false }, { name: 'Model Armor', checked: false }] },
  { track: 'LLM Engineering', items: [{ name: 'Unsloth 2B FT', checked: false }, { name: 'LLM Deploy', checked: false }] },
  { track: 'Courses/Use Cases', items: [{ name: 'RL', checked: false }, { name: 'LangChain', checked: false }, { name: 'LangGraph', checked: false }, { name: 'CrewAI', checked: false }, { name: 'Google Vertex', checked: false }] },
  { track: 'Competitions', items: [], extra: '' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function makeBlock(): BlockState {
  return {
    project: '',
    target: '',
    timerSeconds: 5400,
    timerRunning: false,
    segments: [false, false, false, false, false, false],
    wins: [false, false, false],
    winsText: ['', '', ''],
    distractions: [],
    complete: false,
    zeroSwitch: false,
  };
}

export function makeDaily(): DailyState {
  return {
    northStar: '',
    dopamineGate: false,
    workspaceReady: false,
    block1: makeBlock(),
    block2: makeBlock(),
    buffer: [false, false, false],
    winLog: ['', '', ''],
    parkingLotPruned: false,
    tomorrowPrimed: '',
    reward: { text: '', claimed: false, stolen: false },
    hallucination: ['', '', ''],
    zeroSwitching: false,
    grade: null,
  };
}

function makeWeekly(): WeeklyState {
  const themes: WeeklyState['dailyThemes'] = {};
  DAYS.forEach((d) => (themes[d] = { morning: '', afternoon: '', evening: d === 'Sun' ? 'Weekly Review' : 'Polish/Docs' }));
  return {
    northStar: '',
    flagshipProjects: [
      { priority: 'P1', name: '', outcome: '', done: false },
      { priority: 'P2', name: '', outcome: '', done: false },
    ],
    parkingLot: [],
    learningSprint: { topic: '', target: '' },
    dailyThemes: themes,
    projectMenu: DEFAULT_TRACKS,
    reviewChecklist: [false, false, false, false, false],
    reviewTweak: '',
  };
}

function weekStartOf(d: Date) {
  return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

const todayStr = format(new Date(), 'yyyy-MM-dd');

const initialState: AppState = {
  meta: { currentWeekStart: weekStartOf(new Date()), streakCount: 0, lastOpened: todayStr, totalWeeks: 1 },
  weekly: makeWeekly(),
  daily: { [todayStr]: makeDaily() },
  archive: [],
};

export function computeGrade(d: DailyState): Grade {
  const b1 = d.block1.complete;
  const b2 = d.block2.complete;
  const filled = d.winLog.filter((w) => w.trim().length > 0).length >= 2;
  if (b1 && b2 && d.zeroSwitching && filled) return 'A';
  if (b1 && b2) return 'B';
  if (b1 || b2) return 'C';
  return 'D';
}

export function computeStreak(daily: Record<string, DailyState>): number {
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = format(cursor, 'yyyy-MM-dd');
    const d = daily[key];
    if (!d) break;
    const g = computeGrade(d);
    if (g === 'A' || g === 'B' || g === 'C') {
      streak++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }
  return streak;
}

const LS_KEY = 'dopamine-system-v1';

function loadLocal(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocal(state: AppState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to save local app state.', error);
  }
}

let syncTimer: number | undefined;
function syncRemote(state: AppState) {
  saveLocal(state);
  if (!supabase) return;
  const client = supabase;
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(async () => {
    try {
      await client.from('app_state').upsert({ id: APP_STATE_ID, data: state, updated_at: new Date().toISOString() });
    } catch (error) {
      console.warn('Unable to sync app state to Supabase.', error);
    }
  }, 600);
}

interface StoreActions {
  view: ViewMode;
  focusMode: boolean;
  hydrated: boolean;
  selectedDate: string;
  setView: (v: ViewMode) => void;
  setFocus: (f: boolean) => void;
  setSelectedDate: (d: string) => void;
  hydrate: () => Promise<void>;
  ensureDay: (date: string) => void;
  updateDaily: (date: string, fn: (d: DailyState) => void) => void;
  updateWeekly: (fn: (w: WeeklyState) => void) => void;
  archiveWeek: (fullWipe: boolean) => void;
  importData: (data: AppState) => void;
  reset: () => void;
  state: AppState;
}

export const useStore = create<StoreActions>((set, get) => ({
  state: initialState,
  view: 'combo',
  focusMode: false,
  hydrated: false,
  selectedDate: todayStr,

  setView: (v) => set({ view: v }),
  setFocus: (f) => set({ focusMode: f }),
  setSelectedDate: (d) => {
    get().ensureDay(d);
    set({ selectedDate: d });
  },

  hydrate: async () => {
    let loaded: AppState | null = loadLocal();
    if (supabase) {
      try {
        const { data } = await supabase.from('app_state').select('data').eq('id', APP_STATE_ID).maybeSingle();
        if (data?.data) loaded = data.data as AppState;
      } catch (error) {
        console.warn('Unable to load app state from Supabase.', error);
      }
    }
    if (loaded) {
      if (!loaded.daily[todayStr]) loaded.daily[todayStr] = makeDaily();
      loaded.meta.lastOpened = todayStr;
      loaded.meta.streakCount = computeStreak(loaded.daily);
      set({ state: loaded, hydrated: true, selectedDate: todayStr });
      syncRemote(loaded);
    } else {
      set({ hydrated: true });
      syncRemote(initialState);
    }
  },

  ensureDay: (date) => {
    const s = get().state;
    if (!s.daily[date]) {
      const next = { ...s, daily: { ...s.daily, [date]: makeDaily() } };
      set({ state: next });
      syncRemote(next);
    }
  },

  updateDaily: (date, fn) => {
    const s = get().state;
    const existing = s.daily[date] ?? makeDaily();
    const draft: DailyState = JSON.parse(JSON.stringify(existing));
    fn(draft);
    draft.grade = computeGrade(draft);
    const nextDaily = { ...s.daily, [date]: draft };
    const streak = computeStreak(nextDaily);
    const next: AppState = { ...s, daily: nextDaily, meta: { ...s.meta, streakCount: streak } };
    set({ state: next });
    syncRemote(next);
  },

  updateWeekly: (fn) => {
    const s = get().state;
    const draft: WeeklyState = JSON.parse(JSON.stringify(s.weekly));
    fn(draft);
    const next = { ...s, weekly: draft };
    set({ state: next });
    syncRemote(next);
  },

  archiveWeek: (fullWipe) => {
    const s = get().state;
    const wkStart = s.meta.currentWeekStart;
    const grades: Record<string, Grade> = {};
    for (let i = 0; i < 7; i++) {
      const k = format(addDays(new Date(wkStart), i), 'yyyy-MM-dd');
      grades[k] = s.daily[k]?.grade ?? null;
    }
    const entry: ArchiveEntry = {
      weekStart: wkStart,
      weekNumber: s.meta.totalWeeks,
      finalStreak: s.meta.streakCount,
      dailyGrades: grades,
      p1: s.weekly.flagshipProjects[0],
      p2: s.weekly.flagshipProjects[1],
      northStar: s.weekly.northStar,
    };
    const newWeekStart = weekStartOf(addDays(new Date(), differenceInCalendarDays(new Date(), new Date(wkStart)) > 0 ? 0 : 7));
    const freshWeekly = makeWeekly();
    if (!fullWipe) {
      freshWeekly.projectMenu = s.weekly.projectMenu;
      freshWeekly.parkingLot = s.weekly.parkingLot;
    }
    const next: AppState = {
      meta: { ...s.meta, currentWeekStart: newWeekStart, totalWeeks: s.meta.totalWeeks + 1 },
      weekly: freshWeekly,
      daily: { [todayStr]: makeDaily() },
      archive: [entry, ...s.archive],
    };
    set({ state: next });
    syncRemote(next);
  },

  importData: (data) => {
    set({ state: data });
    syncRemote(data);
  },

  reset: () => {
    set({ state: initialState });
    syncRemote(initialState);
  },
}));

export { DAYS };
