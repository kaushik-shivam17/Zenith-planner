import './_group.css';
import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon, Smile, Sparkle, Heart, Cloud, Plus, Play, Pause, Bolt,
  Trophy, Flame, Target, Zap, Sparkles, Music, MessageCircle, Send, Check, ArrowRight,
  Droplet, Footprints, BookOpen, Moon, Mic, Search,
} from 'lucide-react';

function fmt(d: Date, kind: 'weekday' | 'day' | 'month' | 'time') {
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    weekday: { weekday: 'long' },
    day: { day: 'numeric' },
    month: { month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: false },
  };
  return new Intl.DateTimeFormat('en-US', opts[kind]).format(d);
}

const tasks = [
  { id: 1, t: 'Wireframe the onboarding 🎨', p: 'High', list: 'Design', done: true, due: '10:30' },
  { id: 2, t: 'Reply to Lena re: launch ✉️', p: 'Med',  list: 'Inbox', done: true, due: '11:00' },
  { id: 3, t: 'Yoga flow + stretch 🧘', p: 'Low',  list: 'Body', done: false, due: '13:00' },
  { id: 4, t: 'Ship pricing page polish ✨', p: 'High', list: 'Build', done: false, due: '15:30' },
  { id: 5, t: 'Read 20 pages 📖', p: 'Low',  list: 'Mind', done: false, due: '21:00' },
];

const habits = [
  { name: 'Hydrate', icon: Droplet, value: 5, goal: 8, color: 'from-sky-400 to-cyan-400' },
  { name: 'Steps',   icon: Footprints, value: 6420, goal: 10000, color: 'from-emerald-400 to-teal-400' },
  { name: 'Read',    icon: BookOpen, value: 22, goal: 30, color: 'from-fuchsia-400 to-purple-400' },
  { name: 'Sleep',   icon: Moon, value: 7.4, goal: 8, color: 'from-indigo-400 to-violet-400' },
];

function Glass({ className = '', children, gradient }: any) {
  return (
    <div className={`relative rounded-[32px] overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div className="absolute inset-0 bg-white/35 backdrop-blur-xl border border-white/60 rounded-[32px]" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

function WelcomeHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 blur-md opacity-70" />
          <div className="relative h-16 w-16 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-lg">
            <Smile className="text-purple-500" size={28} />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-white text-[10px] font-bold flex items-center justify-center shadow-lg ring-2 ring-white">L7</div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-['Plus_Jakarta_Sans'] font-medium text-slate-700">Good morning sequence</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-800">
            Hey, Maya <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-slate-600 font-['Plus_Jakarta_Sans'] mt-0.5">
            You're <span className="font-semibold text-purple-600">340 XP</span> away from level 8 ✨
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input readOnly defaultValue="Search anything…" className="pl-9 pr-3 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 font-['Plus_Jakarta_Sans'] text-sm text-slate-700 w-56 outline-none" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">⌘K</span>
        </div>
        <div className="px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center gap-2">
          <Flame size={14} className="text-orange-500" />
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-700">12-day streak</span>
        </div>
        <button className="h-11 w-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg shadow-purple-300/50 flex items-center justify-center hover:scale-105 transition">
          <Plus size={20} />
        </button>
      </div>
    </header>
  );
}

function ClockCard() {
  const [now, setNow] = useState(new Date());
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(25 * 60 - 612);
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      if (running) setSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);
  const time = fmt(now, 'time');
  const [hh, mm] = time.split(':');
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  const pct = (1 - seconds / (25 * 60));
  const r = 90;
  const c = 2 * Math.PI * r;
  return (
    <Glass className="lg:col-span-2 min-h-[420px]" gradient="linear-gradient(135deg, #cfe7ff 0%, #e6d5ff 50%, #ffd5ec 100%)">
      <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-pink-300/50 blur-3xl" />
      <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-sky-300/60 blur-3xl" />
      <div className="relative grid grid-cols-2 h-full p-10 gap-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 self-start">
            <Cloud size={12} className="text-sky-500" />
            <span className="text-[11px] font-['Plus_Jakarta_Sans'] font-semibold text-slate-700">Soft focus hour · Tuesday</span>
          </div>
          <div className="flex items-baseline gap-1 font-['Plus_Jakarta_Sans'] mt-2">
            <span className="text-[120px] leading-none font-extrabold bg-gradient-to-b from-slate-800 to-purple-600 bg-clip-text text-transparent tracking-tighter">{hh}</span>
            <span className="text-[100px] leading-none font-light text-white/80 tracking-tighter">:</span>
            <span className="text-[120px] leading-none font-extrabold bg-gradient-to-b from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter">{mm}</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-slate-600 text-sm mt-1">
            Sunset 19:42 · 5h 14m daylight left ☀️
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { l: 'Focus', a: true }, { l: 'Break' }, { l: 'Walk' }, { l: 'Read' }, { l: 'Meet' },
            ].map(({ l, a }) => (
              <span key={l} className={`px-3 py-1 rounded-full text-xs font-['Plus_Jakarta_Sans'] font-semibold backdrop-blur-md border ${a ? 'bg-purple-500/90 text-white border-purple-400' : 'bg-white/50 text-slate-700 border-white/70'}`}>{l}</span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80">
            <Music size={16} className="text-fuchsia-500" />
            <div className="flex-1 min-w-0">
              <div className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-slate-700 truncate">Lo-fi study garden</div>
              <div className="text-[10px] text-slate-500 font-['Plus_Jakarta_Sans']">Now playing · 24 min in</div>
            </div>
            <button className="h-8 w-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center"><Play size={12} /></button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative h-56 w-56">
            <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
              <defs>
                <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r={r} stroke="white" strokeOpacity="0.5" strokeWidth="14" fill="none" />
              <circle cx="100" cy="100" r={r} stroke="url(#ringGrad)" strokeWidth="14" fill="none"
                strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] tracking-widest uppercase text-slate-500 font-['Plus_Jakarta_Sans'] font-bold">Pomodoro 3/4</div>
              <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-5xl text-slate-800 tabular-nums">{m}:{s}</div>
              <div className="text-xs text-slate-500 font-['Plus_Jakarta_Sans']">until break 🧘</div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setRunning(!running)} className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-300/50 flex items-center justify-center">
              {running ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button className="h-12 px-5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-700">Skip break</button>
          </div>
        </div>
      </div>
    </Glass>
  );
}

function DateCard() {
  const today = new Date();
  return (
    <Glass gradient="linear-gradient(135deg, #ffd5b5 0%, #ffb8d6 60%, #ffe7a3 100%)">
      <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-yellow-200/70 blur-3xl" />
      <div className="relative flex flex-col h-full p-8 gap-2">
        <div className="flex items-start justify-between">
          <div className="text-xs uppercase tracking-[0.3em] font-['Plus_Jakarta_Sans'] font-bold text-rose-500/80">{fmt(today, 'weekday')}</div>
          <div className="h-9 w-9 rounded-full bg-white/70 border border-white/80 flex items-center justify-center backdrop-blur-md">
            <CalendarIcon size={14} className="text-rose-500" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-[120px] leading-none bg-gradient-to-b from-rose-500 to-orange-500 bg-clip-text text-transparent tracking-tighter">{fmt(today, 'day')}</div>
          <div>
            <div className="text-sm font-['Plus_Jakarta_Sans'] font-bold text-slate-700">{fmt(today, 'month')}</div>
            <div className="text-xs text-slate-600 font-['Plus_Jakarta_Sans']">Week 17 · Q2</div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5 text-center">
          {['M','T','W','T','F','S','S'].map(d => (
            <span key={d} className="text-[9px] font-bold uppercase text-slate-500 font-['Plus_Jakarta_Sans']">{d}</span>
          ))}
          {Array.from({length: 14}).map((_, i) => {
            const day = i + 14;
            const isToday = day === today.getDate();
            const has = [15, 17, 19, 22, 24].includes(day);
            return (
              <span key={i} className={`h-7 rounded-full text-[11px] font-['Plus_Jakarta_Sans'] font-bold flex items-center justify-center
                ${isToday ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md' : has ? 'bg-white/60 text-rose-600 border border-white/70' : 'text-slate-500'}`}>
                {day}
              </span>
            );
          })}
        </div>

        <div className="mt-auto pt-3 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="text-xs font-['Plus_Jakarta_Sans'] font-semibold text-slate-700 flex-1">11:00 · Standup with team</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-['Plus_Jakarta_Sans'] font-semibold text-slate-700 flex-1">15:30 · Design crit</span>
          </div>
          <button className="w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-['Plus_Jakarta_Sans'] font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Sparkle size={12} /> Plan today
          </button>
        </div>
      </div>
    </Glass>
  );
}

function TasksBoard() {
  const done = tasks.filter(t => t.done).length;
  const colors: Record<string, string> = {
    Design: 'from-fuchsia-400 to-purple-400',
    Inbox: 'from-sky-400 to-cyan-400',
    Body: 'from-emerald-400 to-teal-400',
    Build: 'from-amber-400 to-orange-400',
    Mind: 'from-indigo-400 to-violet-400',
  };
  return (
    <Glass className="lg:col-span-2" gradient="linear-gradient(135deg, #e8f0ff 0%, #f5e6ff 100%)">
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 mb-2">
              <Target size={12} className="text-purple-500" />
              <span className="text-[11px] font-['Plus_Jakarta_Sans'] font-bold text-slate-700 uppercase tracking-wider">Today's quests</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-800">Let's get it ✨</h3>
          </div>
          <div className="text-right">
            <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{done}/{tasks.length}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">complete</div>
          </div>
        </div>
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className={`group flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md border ${t.done ? 'bg-white/30 border-white/50' : 'bg-white/60 border-white/80'} hover:bg-white/80 transition`}>
              <button className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${t.done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-white/70 border border-slate-300'}`}>
                {t.done && <Check size={14} strokeWidth={3} />}
              </button>
              <span className={`flex-1 font-['Plus_Jakarta_Sans'] font-semibold ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.t}</span>
              <span className={`text-[10px] font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r ${colors[t.list]} text-white`}>{t.list}</span>
              <span className="text-xs font-['Plus_Jakarta_Sans'] font-bold text-slate-500 tabular-nums w-12 text-right">{t.due}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-purple-300 text-purple-600 font-['Plus_Jakarta_Sans'] font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/40 transition">
          <Plus size={16} /> Add a quest
        </button>
      </div>
    </Glass>
  );
}

function HabitRing({ h }: any) {
  const Icon = h.icon;
  const pct = Math.min(1, h.value / h.goal);
  const r = 32;
  const c = 2 * Math.PI * r;
  const id = `g-${h.name}`;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
          <defs>
            <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" className={`text-${h.color.split(' ')[0].replace('from-','')}`} />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r={r} stroke="white" strokeOpacity="0.6" strokeWidth="6" fill="none" />
          <circle cx="40" cy="40" r={r} className={`stroke-current bg-gradient-to-r ${h.color}`} strokeWidth="6" fill="none"
            stroke="#a855f7"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
        </svg>
        <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${h.color} flex items-center justify-center text-white opacity-90`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-center">
        <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-slate-800 text-sm">{h.value.toLocaleString()}<span className="text-slate-400 font-bold">/{h.goal.toLocaleString()}</span></div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{h.name}</div>
      </div>
    </div>
  );
}

function HabitsCard() {
  return (
    <Glass gradient="linear-gradient(135deg, #d1fae5 0%, #cffafe 100%)">
      <div className="relative p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 mb-2">
              <Heart size={12} className="text-emerald-500" />
              <span className="text-[11px] font-['Plus_Jakarta_Sans'] font-bold text-slate-700 uppercase tracking-wider">Healthy you</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-800">Daily rings</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl">🔥</div>
            <div className="text-[10px] uppercase font-bold text-slate-500">12 days</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {habits.map(h => <HabitRing key={h.name} h={h} />)}
        </div>
      </div>
    </Glass>
  );
}

function WeekProgress() {
  const week = [0.55, 0.7, 0.6, 0.85, 0.95, 0.75, 0.5];
  return (
    <Glass gradient="linear-gradient(135deg, #fde2ff 0%, #e2e6ff 100%)">
      <div className="relative p-7">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 mb-2">
              <Bolt size={12} className="text-purple-500" />
              <span className="text-[11px] font-['Plus_Jakarta_Sans'] font-bold text-slate-700 uppercase tracking-wider">Energy this week</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-800">You're glowing 🌟</h3>
          </div>
          <div className="text-right">
            <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">+24%</div>
            <div className="text-[10px] uppercase font-bold text-slate-500">vs last week</div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32 mt-4">
          {week.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-2xl bg-gradient-to-t from-purple-400 to-pink-400 shadow-sm" style={{ height: `${v * 100}%` }} />
              <span className="text-[10px] font-bold uppercase text-slate-500 font-['Plus_Jakarta_Sans']">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </Glass>
  );
}

function GoalsCard() {
  return (
    <Glass gradient="linear-gradient(135deg, #fff5cf 0%, #ffd5b5 100%)">
      <div className="relative p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 mb-2">
              <Trophy size={12} className="text-amber-500" />
              <span className="text-[11px] font-['Plus_Jakarta_Sans'] font-bold text-slate-700 uppercase tracking-wider">Quests in progress</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-800">Big dreams 🌈</h3>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { n: 'Launch the new pricing page', emoji: '🚀', pct: 70 },
            { n: 'Finish art course module 4', emoji: '🎨', pct: 45 },
            { n: 'Run first 10K', emoji: '🏃‍♀️', pct: 30 },
          ].map(g => (
            <div key={g.n} className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{g.emoji}</span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-800 flex-1">{g.n}</span>
                <span className="text-[10px] font-bold text-slate-500 tabular-nums">{g.pct}%</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${g.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Glass>
  );
}

function AIBuddy() {
  return (
    <Glass className="lg:col-span-2" gradient="linear-gradient(135deg, #c7f9cc 0%, #a0e7e5 50%, #b4f8c8 100%)">
      <div className="relative p-7 flex gap-5">
        <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-300/50">
          <Sparkles size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700/80">AI Buddy · Mira</span>
            <span className="px-2 py-0.5 rounded-full bg-white/70 text-[9px] font-bold text-emerald-700">online</span>
          </div>
          <p className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-slate-800 leading-snug">
            Your hardest task today is the pricing polish 🎨. You usually crush hard tasks at <span className="text-emerald-700">2pm right after a walk</span>. Want me to block the slot and queue your focus playlist?
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-['Plus_Jakarta_Sans'] font-bold shadow-md flex items-center gap-1.5">
              <Zap size={12} /> Yes, do it
            </button>
            <button className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-['Plus_Jakarta_Sans'] font-bold text-slate-700">
              Suggest something else
            </button>
            <button className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-['Plus_Jakarta_Sans'] font-bold text-slate-700">
              Not today
            </button>
          </div>
        </div>
      </div>
    </Glass>
  );
}

function QuickCapture() {
  return (
    <Glass gradient="linear-gradient(135deg, #fde2e4 0%, #e2ecff 100%)">
      <div className="relative p-5 flex items-center gap-3">
        <MessageCircle size={18} className="text-purple-500 shrink-0" />
        <input readOnly defaultValue="Add anything — task, note, or quick idea ✨" className="flex-1 bg-transparent outline-none font-['Plus_Jakarta_Sans'] font-semibold text-slate-700 placeholder:text-slate-400" />
        <button className="h-9 w-9 rounded-full bg-white/70 border border-white/80 flex items-center justify-center text-slate-600"><Mic size={14} /></button>
        <button className="h-9 px-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-['Plus_Jakarta_Sans'] font-bold flex items-center gap-1.5 shadow-md">
          <Send size={12} /> Drop it
        </button>
      </div>
    </Glass>
  );
}

export function GlassPastel() {
  return (
    <div className="min-h-screen relative font-['Plus_Jakarta_Sans']" style={{ background: 'linear-gradient(135deg, #fde2e4 0%, #e2ecff 35%, #d8f3ee 70%, #fff5cf 100%)' }}>
      <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-purple-300/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-10 py-12 space-y-6">
        <WelcomeHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClockCard />
          <DateCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TasksBoard />
          <HabitsCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeekProgress />
          <GoalsCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AIBuddy />
          <QuickCapture />
        </div>

        <div className="flex justify-center pt-4">
          <div className="px-5 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/70 text-xs font-bold text-slate-600 flex items-center gap-2">
            <ArrowRight size={12} className="text-purple-500" />
            Tap a bubble in the side menu to dive in 🫧
          </div>
        </div>
      </div>
    </div>
  );
}
