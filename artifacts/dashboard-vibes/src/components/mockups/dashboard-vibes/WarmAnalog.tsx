import './_group.css';
import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon, Feather, Sun, BookOpen, Sparkles, Coffee, Droplet, Leaf,
  Play, Pause, Plus, Check, ChevronRight, Quote, Cloud, Moon, Wind, Brain, NotebookPen,
  Home, ListChecks, Compass, Library, Settings, Bell, Mail, MessageCircle, Heart,
  Sunrise, CloudRain, CloudSun, Bookmark, Users, Search, ArrowUpRight,
} from 'lucide-react';

function fmt(d: Date, kind: 'weekday' | 'day' | 'month' | 'time' | 'date') {
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    weekday: { weekday: 'long' },
    day: { day: 'numeric' },
    month: { month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true },
    date: { weekday: 'long', month: 'long', day: 'numeric' },
  };
  return new Intl.DateTimeFormat('en-US', opts[kind]).format(d);
}

const intentions = [
  { id: 1, text: 'Finish the chapter on attention', tag: 'Read', done: true, time: '08:30' },
  { id: 2, text: 'A long walk through the park', tag: 'Move', done: true, time: '11:00' },
  { id: 3, text: 'Draft the proposal for L. Hartley', tag: 'Write', done: false, time: '14:00', now: true },
  { id: 4, text: 'Tea with Soren, no phones', tag: 'Care', done: false, time: '17:30' },
  { id: 5, text: 'Three pages of evening journal', tag: 'Reflect', done: false, time: '21:00' },
];

const habits = [
  { name: 'Read', icon: BookOpen, value: 42, goal: 60 },
  { name: 'Water', icon: Droplet, value: 5, goal: 8 },
  { name: 'Walk', icon: Leaf, value: 3.2, goal: 5 },
  { name: 'Sleep', icon: Moon, value: 7.4, goal: 8 },
];

function Sidebar() {
  const items = [
    { Icon: Home, name: 'Today', active: true },
    { Icon: ListChecks, name: 'Intentions', n: 3 },
    { Icon: Compass, name: 'Chapters' },
    { Icon: NotebookPen, name: 'Journal' },
    { Icon: Library, name: 'Library', n: 12 },
    { Icon: Heart, name: 'Practices' },
    { Icon: Users, name: 'Companions' },
    { Icon: Bell, name: 'Bulletins', n: 4 },
  ];
  return (
    <aside className="w-60 shrink-0 bg-[#efe2c8] border-r border-stone-300/70 flex flex-col">
      <div className="p-6 border-b border-stone-300/70">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-[#a8482b] text-[#f5ead4] flex items-center justify-center">
            <Feather size={16} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-['Fraunces'] text-stone-800 text-lg leading-none">Zenith</div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-['Inter']">A Daily Reader</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ Icon, name, n, active }) => (
          <button key={name} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition
            ${active ? 'bg-[#a8482b] text-[#f5ead4]' : 'text-stone-700 hover:bg-white/50'}`}>
            <Icon size={16} strokeWidth={1.5} />
            <span className="flex-1 font-['Fraunces'] italic">{name}</span>
            {n && <span className={`text-[10px] font-['Inter'] font-semibold ${active ? 'bg-[#f5ead4]/20 text-[#f5ead4]' : 'bg-[#a8482b]/15 text-[#a8482b]'} px-2 py-0.5 rounded-full`}>{n}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 m-3 rounded-2xl bg-[#a8482b]/8 border border-stone-300/60">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-stone-600 font-['Inter']">
          <Sparkles size={12} className="text-[#a8482b]" />
          The reader
        </div>
        <div className="font-['Fraunces'] text-stone-800 mt-1">Maya Hartley</div>
        <div className="text-[11px] text-stone-500 font-['Fraunces'] italic">Day 047 · Vol. xii</div>
      </div>
      <button className="m-3 flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-[#a8482b]">
        <Settings size={14} strokeWidth={1.5} />
        <span className="font-['Fraunces'] italic">Preferences</span>
      </button>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <div className="text-[11px] tracking-[0.4em] uppercase font-['Inter'] text-stone-500">
        ✦ A quiet Tuesday — Apr 21, 2026
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input readOnly defaultValue="Search the archive…" className="pl-9 pr-12 py-2 rounded-full bg-white/60 border border-stone-300/60 font-['Fraunces'] italic text-sm text-stone-700 w-64 outline-none" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-['Inter'] text-stone-400">⌘K</span>
        </div>
        <button className="h-9 w-9 rounded-full bg-white/60 border border-stone-300/60 flex items-center justify-center text-stone-600 relative">
          <Bell size={14} strokeWidth={1.5} />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 text-[9px] bg-[#a8482b] text-[#f5ead4] rounded-full flex items-center justify-center font-bold">4</span>
        </button>
        <button className="h-9 w-9 rounded-full bg-white/60 border border-stone-300/60 flex items-center justify-center text-stone-600">
          <Mail size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function WelcomeHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-stone-300/70">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-[#e8dccb] border border-stone-400/40 flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
            <Feather className="text-[#a8482b]" size={28} strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#a8482b] text-[#f5ead4] text-[10px] flex items-center justify-center font-['Inter'] font-semibold">12</div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sun size={12} className="text-[#a8482b]" />
            <span className="text-[10px] tracking-[0.35em] text-stone-600 uppercase font-['Inter']">Morning Pages · Day 047</span>
          </div>
          <h1 className="text-5xl md:text-6xl tracking-tight text-stone-800 font-['Fraunces'] font-light italic">
            Hello, Maya.
          </h1>
          <p className="mt-2 text-stone-500 font-['Fraunces'] text-base italic">
            A quiet Tuesday to begin again. Your tea is steeping.
          </p>
        </div>
      </div>

      <div className="flex items-stretch gap-4">
        <div className="px-5 py-3 rounded-2xl bg-white/60 border border-stone-300/60">
          <div className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-['Inter']">Today</div>
          <div className="flex items-center gap-2 mt-1">
            <CloudSun size={18} className="text-stone-500" strokeWidth={1.5} />
            <span className="font-['Fraunces'] text-2xl text-stone-800">14°</span>
            <span className="text-stone-500 italic font-['Fraunces']">overcast</span>
          </div>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-[#a8482b] text-[#f5ead4]">
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-80 font-['Inter']">Today's Pace</div>
          <div className="font-['Fraunces'] text-2xl mt-1">2 of 5 <span className="italic opacity-80 text-base">intentions kept</span></div>
        </div>
      </div>
    </header>
  );
}

function Section({ roman, title, hint, children }: any) {
  return (
    <section>
      <div className="flex items-end justify-between mb-5 pb-3 border-b border-stone-300/60">
        <div className="flex items-baseline gap-4">
          <span className="font-['Fraunces'] italic text-[#a8482b] text-2xl">{roman}.</span>
          <h2 className="font-['Fraunces'] text-2xl text-stone-800">{title}</h2>
        </div>
        {hint && <span className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function ClockCard() {
  const [now, setNow] = useState(new Date());
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(25 * 60 - 412);
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      if (running) setSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  const pct = (1 - seconds / (25 * 60)) * 100;
  return (
    <div className="lg:col-span-2 relative rounded-[28px] bg-[#f3ead9] border border-stone-300/60 px-12 py-12 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #57361e 1px, transparent 0)', backgroundSize: '14px 14px' }} />
      <div className="relative flex flex-col items-center justify-center gap-3">
        <span className="text-[10px] tracking-[0.4em] uppercase text-stone-500 font-['Inter']">Present Hour</span>
        <div className="font-['DM_Serif_Display'] text-[110px] leading-none text-stone-800 tracking-tight">
          {fmt(now, 'time').replace(' ', '')}
        </div>
        <div className="flex items-center gap-3 text-stone-500 font-['Fraunces'] italic">
          <span className="h-px w-12 bg-stone-400/60" />
          <span>{fmt(now, 'date')}</span>
          <span className="h-px w-12 bg-stone-400/60" />
        </div>

        <div className="mt-6 w-full max-w-md rounded-2xl bg-white/70 border border-stone-300/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-stone-600">
              <Coffee size={14} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-['Inter']">Deep Work · Pomodoro 3 of 4</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">Drafting</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setRunning(!running)} className="h-10 w-10 rounded-full bg-[#a8482b] text-[#f5ead4] flex items-center justify-center">
              {running ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-['DM_Serif_Display'] text-3xl text-stone-800 tabular-nums">{m}:{s}</span>
                <span className="text-xs text-stone-500 font-['Fraunces'] italic">until rest</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
                <div className="h-full bg-[#a8482b]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-2 max-w-md text-center text-stone-600 font-['Fraunces'] italic text-base leading-relaxed">
          “How we spend our days is, of course, how we spend our lives.”
          <span className="block text-xs text-stone-400 font-['Inter'] not-italic mt-1">— Annie Dillard</span>
        </p>
      </div>
    </div>
  );
}

function DateCard() {
  const today = new Date();
  return (
    <div className="group relative rounded-[28px] bg-[#a8482b] text-[#f5ead4] p-8 overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 flex flex-col">
      <div className="absolute top-5 right-5 text-[#f5ead4]/60 group-hover:text-[#f5ead4] transition-colors">
        <CalendarIcon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-center gap-1 py-2">
        <div className="text-xs tracking-[0.4em] uppercase text-[#f5ead4]/70 font-['Inter']">{fmt(today, 'weekday')}</div>
        <div className="font-['DM_Serif_Display'] text-[120px] leading-none">{fmt(today, 'day')}</div>
        <div className="text-sm tracking-[0.3em] uppercase text-[#f5ead4]/70 font-['Inter']">{fmt(today, 'month')}</div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
          <span key={d} className="text-[9px] uppercase tracking-widest text-[#f5ead4]/50 text-center">{d}</span>
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          const hasEntry = [3, 7, 12, 14, 18, 21].includes(day);
          return (
            <span
              key={i}
              className={`h-7 w-7 mx-auto flex items-center justify-center text-[11px] font-['Fraunces'] rounded-full
                ${isToday ? 'bg-[#f5ead4] text-[#a8482b] font-semibold' : hasEntry ? 'border border-[#f5ead4]/40 text-[#f5ead4]/90' : 'text-[#f5ead4]/60'}`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-[#f5ead4]/20 text-center flex items-center justify-center gap-2">
        <Plus size={14} />
        <span className="font-['Fraunces'] italic text-[#f5ead4]/95">Begin a new entry</span>
      </div>
    </div>
  );
}

function TimelineCard() {
  const blocks = [
    { h: 7, label: 'Slow waking + tea', tag: 'Care', filled: true },
    { h: 9, label: 'Morning pages · journal', tag: 'Reflect', filled: true },
    { h: 11, label: 'Walk through Hyde Park', tag: 'Move', filled: true },
    { h: 14, label: 'Drafting · Hartley proposal', tag: 'Write', now: true },
    { h: 16, label: 'Tea + reading hour', tag: 'Read' },
    { h: 18, label: 'Tea with Soren', tag: 'Care' },
    { h: 21, label: 'Evening pages', tag: 'Reflect' },
  ];
  return (
    <div className="rounded-[28px] bg-white/60 border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">A day in measured hours</div>
          <h3 className="font-['Fraunces'] text-2xl italic text-stone-800 mt-1">Today's procession</h3>
        </div>
        <span className="text-[10px] tracking-widest uppercase text-stone-500 font-['Inter']">Now · 14:42</span>
      </div>
      <div className="grid grid-cols-[60px_1fr] gap-x-5">
        {blocks.map((b, i) => (
          <div key={i} className="contents">
            <div className="text-right pr-2 pt-1 font-['Fraunces'] italic text-stone-500 text-sm tabular-nums">
              {String(b.h).padStart(2,'0')}:00
            </div>
            <div className={`relative pb-5 pl-5 border-l-2 ${b.now ? 'border-[#a8482b]' : 'border-stone-300'}`}>
              <div className={`absolute -left-1.5 top-2 h-3 w-3 rounded-full ${b.now ? 'bg-[#a8482b] ring-4 ring-[#a8482b]/20' : b.filled ? 'bg-[#a8482b]' : 'bg-stone-300'}`} />
              <div className={`p-3 rounded-xl ${b.now ? 'bg-[#a8482b]/10 border border-[#a8482b]/30' : 'bg-stone-50 border border-stone-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-['Fraunces'] ${b.filled ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{b.label}</span>
                  <span className="text-[10px] uppercase tracking-widest font-['Inter'] text-[#a8482b] bg-[#a8482b]/10 px-2 py-0.5 rounded-full">{b.tag}</span>
                </div>
                {b.now && <div className="text-xs text-[#a8482b] italic font-['Fraunces'] mt-1">— in hand · 18 minutes remain in this stretch —</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntentionsCard() {
  const done = intentions.filter(i => i.done).length;
  return (
    <div className="rounded-[28px] bg-white/60 border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">A gentle list</div>
          <h3 className="font-['Fraunces'] text-2xl text-stone-800 italic mt-1">Today's intentions</h3>
        </div>
        <div className="text-right">
          <div className="font-['DM_Serif_Display'] text-3xl text-[#a8482b]">{done}<span className="text-stone-400">/{intentions.length}</span></div>
          <div className="text-[10px] tracking-widest uppercase text-stone-500 font-['Inter']">kept</div>
        </div>
      </div>
      <ul className="space-y-3">
        {intentions.map(it => (
          <li key={it.id} className={`flex items-center gap-4 group ${it.now ? 'p-2 -mx-2 rounded-lg bg-[#a8482b]/5 ring-1 ring-[#a8482b]/15' : ''}`}>
            <button className={`h-6 w-6 rounded-full border ${it.done ? 'bg-[#a8482b] border-[#a8482b] text-[#f5ead4]' : it.now ? 'border-[#a8482b]' : 'border-stone-400'} flex items-center justify-center shrink-0`}>
              {it.done && <Check size={14} strokeWidth={2.5} />}
              {it.now && <span className="h-2 w-2 rounded-full bg-[#a8482b] animate-pulse" />}
            </button>
            <span className={`flex-1 font-['Fraunces'] text-lg ${it.done ? 'line-through text-stone-400' : 'text-stone-800'}`}>
              {it.text}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-['Inter'] text-[#a8482b] bg-[#a8482b]/10 px-2 py-0.5 rounded-full">{it.tag}</span>
            <span className="text-xs font-['Inter'] text-stone-500 tabular-nums w-12 text-right">{it.time}</span>
          </li>
        ))}
      </ul>
      <button className="mt-5 w-full text-left flex items-center gap-2 text-stone-500 hover:text-[#a8482b] transition italic font-['Fraunces']">
        <Plus size={14} /> add a quiet intention…
      </button>
    </div>
  );
}

function HabitRing({ value, goal, name, Icon }: any) {
  const pct = Math.min(1, value / goal);
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} stroke="#e8dccb" strokeWidth="6" fill="none" />
          <circle cx="40" cy="40" r={r} stroke="#a8482b" strokeWidth="6" fill="none"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="text-[#a8482b]" size={20} strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-center">
        <div className="font-['Fraunces'] text-stone-800">{value}<span className="text-stone-400">/{goal}</span></div>
        <div className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">{name}</div>
      </div>
    </div>
  );
}

function MoodArc() {
  const days = [
    { d: 'M', mood: 0.6, e: 0.5 },
    { d: 'T', mood: 0.7, e: 0.7 },
    { d: 'W', mood: 0.5, e: 0.4 },
    { d: 'T', mood: 0.8, e: 0.85 },
    { d: 'F', mood: 0.9, e: 0.7 },
    { d: 'S', mood: 0.65, e: 0.6 },
    { d: 'S', mood: 0.75, e: 0.55 },
  ];
  return (
    <div className="rounded-[28px] bg-[#f3ead9] border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">A quiet measure</div>
          <h3 className="font-['Fraunces'] text-xl text-stone-800 italic mt-1">Mood & energy this week</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">7-day arc</span>
      </div>
      <svg viewBox="0 0 280 100" className="w-full h-28">
        <polyline fill="none" stroke="#a8482b" strokeWidth="1.5"
          points={days.map((p, i) => `${(i / 6) * 280},${100 - p.mood * 80}`).join(' ')} />
        <polyline fill="none" stroke="#57361e" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 3"
          points={days.map((p, i) => `${(i / 6) * 280},${100 - p.e * 80}`).join(' ')} />
        {days.map((p, i) => (
          <circle key={i} cx={(i / 6) * 280} cy={100 - p.mood * 80} r="3" fill="#a8482b" />
        ))}
      </svg>
      <div className="flex justify-between mt-1 text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">
        {days.map(p => <span key={p.d}>{p.d}</span>)}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#a8482b]" /> mood</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-stone-700" /> energy</span>
      </div>
    </div>
  );
}

function HabitsCard() {
  return (
    <div className="rounded-[28px] bg-white/60 border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">A small ritual</div>
          <h3 className="font-['Fraunces'] text-2xl text-stone-800 italic mt-1">The four practices</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">12-day streak</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {habits.map(h => <HabitRing key={h.name} {...h} Icon={h.icon} />)}
      </div>
    </div>
  );
}

function WeatherCard() {
  const days = [
    { d: 'Today', t: 14, Icon: CloudSun, sky: 'overcast' },
    { d: 'Wed', t: 16, Icon: Sun, sky: 'clear' },
    { d: 'Thu', t: 12, Icon: CloudRain, sky: 'showers' },
    { d: 'Fri', t: 15, Icon: CloudSun, sky: 'partly' },
    { d: 'Sat', t: 18, Icon: Sun, sky: 'clear' },
  ];
  return (
    <div className="rounded-[28px] bg-[#fff8ea] border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">From the window</div>
          <h3 className="font-['Fraunces'] text-xl text-stone-800 italic mt-1">The week's weather</h3>
        </div>
        <div className="flex items-center gap-1 text-stone-500 text-[10px] uppercase tracking-widest font-['Inter']">
          <Sunrise size={12} /> 06:14 · 19:42
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {days.map((w, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 p-3 rounded-xl ${i === 0 ? 'bg-[#a8482b]/10 border border-[#a8482b]/20' : ''}`}>
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-['Inter']">{w.d}</span>
            <w.Icon className="text-[#a8482b]" size={22} strokeWidth={1.5} />
            <span className="font-['DM_Serif_Display'] text-2xl text-stone-800">{w.t}°</span>
            <span className="text-[10px] italic font-['Fraunces'] text-stone-500">{w.sky}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MuseAndChapters() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-[28px] bg-[#fff8ea] border border-stone-300/60 p-8 relative overflow-hidden">
        <div className="absolute top-6 right-6 opacity-10">
          <Quote size={120} className="text-[#a8482b]" strokeWidth={0.5} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-[#a8482b]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">The muse suggests</span>
          </div>
          <h3 className="font-['Fraunces'] text-2xl italic text-stone-800 leading-snug mb-3">
            Your last three afternoons drifted. Try a single hard task at 14:00, then close the laptop and walk.
          </h3>
          <p className="text-stone-600 font-['Fraunces'] leading-relaxed">
            Based on your last two weeks of pages, you write best after movement. I have set aside an hour and silenced your inbox.
          </p>
          <div className="flex gap-2 mt-5">
            <button className="px-4 py-2 rounded-full bg-[#a8482b] text-[#f5ead4] text-sm font-['Fraunces']">Accept the suggestion</button>
            <button className="px-4 py-2 rounded-full border border-stone-400 text-stone-700 text-sm font-['Fraunces']">Suggest another</button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-white/60 border border-stone-300/60 p-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">In the margins</div>
            <h3 className="font-['Fraunces'] text-xl italic text-stone-800 mt-1">Upcoming chapters</h3>
          </div>
        </div>
        <ul className="space-y-3">
          {[
            { name: 'Hartley proposal', when: 'Thu, Apr 23', pct: 70 },
            { name: 'Spring garden plan', when: 'Sun, Apr 26', pct: 35 },
            { name: 'Rilke essay draft', when: 'May 02', pct: 12 },
          ].map(m => (
            <li key={m.name} className="flex items-center gap-3 group">
              <NotebookPen size={16} className="text-[#a8482b] shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="font-['Fraunces'] text-stone-800 truncate">{m.name}</div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#a8482b]" style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-['Inter'] tabular-nums">{m.pct}%</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter'] mt-0.5">{m.when}</div>
              </div>
              <ChevronRight size={14} className="text-stone-400 group-hover:translate-x-0.5 transition" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LibraryCard() {
  const books = [
    { t: 'Pilgrim at Tinker Creek', a: 'Annie Dillard', pct: 64, color: '#a8482b' },
    { t: 'Letters to a Young Poet', a: 'R. M. Rilke', pct: 28, color: '#57361e' },
    { t: 'The Art of Stillness', a: 'Pico Iyer', pct: 92, color: '#9c6b3f' },
  ];
  return (
    <div className="rounded-[28px] bg-[#efe2c8] border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">In the library</div>
          <h3 className="font-['Fraunces'] text-2xl italic text-stone-800 mt-1">Currently reading</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">3 volumes open</span>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {books.map(b => (
          <div key={b.t} className="space-y-3">
            <div className="aspect-[3/4] rounded-md flex items-end p-3 shadow-md relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="absolute top-2 right-2 text-[#f5ead4]/70">
                <Bookmark size={14} fill="currentColor" />
              </div>
              <div className="relative">
                <div className="text-[#f5ead4] font-['DM_Serif_Display'] text-base leading-tight">{b.t}</div>
                <div className="text-[#f5ead4]/70 italic font-['Fraunces'] text-[10px] mt-1">{b.a}</div>
              </div>
            </div>
            <div className="h-1 w-full bg-stone-300 rounded-full overflow-hidden">
              <div className="h-full" style={{ width: `${b.pct}%`, background: b.color }} />
            </div>
            <div className="text-[10px] tracking-widest uppercase text-stone-500 font-['Inter'] tabular-nums">{b.pct}% · 18 min today</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CorrespondenceCard() {
  const items = [
    { from: 'Soren', preview: 'Tea at five? Bring the Rilke if you like.', when: '11m', unread: true },
    { from: 'L. Hartley', preview: 'Looking forward to your draft on Thursday.', when: '2h', unread: true },
    { from: 'Garden Society', preview: 'Spring planting evening · May 4', when: 'Yest', unread: false },
  ];
  return (
    <div className="rounded-[28px] bg-white/60 border border-stone-300/60 p-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">From the post</div>
          <h3 className="font-['Fraunces'] text-2xl italic text-stone-800 mt-1">Correspondence</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">2 unopened</span>
      </div>
      <ul className="space-y-3">
        {items.map((m, i) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className="h-9 w-9 rounded-full bg-[#a8482b]/10 text-[#a8482b] flex items-center justify-center font-['DM_Serif_Display']">{m.from[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-['Fraunces'] text-stone-800">{m.from}</span>
                {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#a8482b]" />}
                <span className="ml-auto text-[10px] uppercase tracking-widest text-stone-500 font-['Inter']">{m.when}</span>
              </div>
              <p className="text-sm font-['Fraunces'] italic text-stone-600 truncate mt-0.5">{m.preview}</p>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-4 w-full text-center text-[10px] uppercase tracking-widest text-stone-500 hover:text-[#a8482b] font-['Inter']">Open the post →</button>
    </div>
  );
}

function BulletinsCard() {
  const items = [
    { what: 'Soren replied to your note', when: '11 minutes ago', Icon: MessageCircle },
    { what: 'Streak quietly extended to 12 days', when: 'this morning', Icon: Sparkles },
    { what: 'You finished “The Art of Stillness”', when: 'yesterday', Icon: BookOpen },
    { what: 'Garden Society sent an invitation', when: 'yesterday', Icon: Mail },
  ];
  return (
    <div className="rounded-[28px] bg-stone-800 text-[#f5ead4] p-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[10px] tracking-[0.35em] uppercase opacity-60 font-['Inter']">From the desk</div>
          <h3 className="font-['Fraunces'] text-2xl italic mt-1">Quiet bulletins</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest opacity-60 font-['Inter']">last 24 hours</span>
      </div>
      <ul className="space-y-3">
        {items.map((b, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#f5ead4]/10 flex items-center justify-center">
              <b.Icon size={14} strokeWidth={1.5} />
            </div>
            <span className="font-['Fraunces'] flex-1">{b.what}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60 font-['Inter']">{b.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickCapture() {
  return (
    <div className="rounded-[28px] bg-stone-800 text-[#f5ead4] p-6 flex items-center gap-4">
      <Feather size={18} className="text-[#f5ead4]/70" strokeWidth={1.5} />
      <input
        readOnly
        defaultValue="Capture a passing thought…"
        className="flex-1 bg-transparent outline-none font-['Fraunces'] italic text-lg placeholder:text-[#f5ead4]/50"
      />
      <span className="text-[10px] uppercase tracking-widest font-['Inter'] text-[#f5ead4]/60">Press ⌘K</span>
      <button className="px-4 py-2 rounded-full bg-[#a8482b] text-[#f5ead4] text-sm font-['Fraunces']">Save to journal</button>
    </div>
  );
}

export function WarmAnalog() {
  return (
    <div className="min-h-screen flex bg-[#f5ead4] font-['Inter']" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(168,72,43,0.06), transparent 50%), radial-gradient(circle at 80% 80%, rgba(87,54,30,0.05), transparent 50%)' }}>
      <Sidebar />
      <main className="flex-1 px-12 py-10 space-y-10 overflow-x-hidden">
        <TopBar />
        <WelcomeHeader />

        <Section roman="I" title="The hour & the day" hint="Live · pomodoro 3/4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ClockCard />
            <DateCard />
          </div>
        </Section>

        <Section roman="II" title="Today's procession" hint="Now · 14:42">
          <TimelineCard />
        </Section>

        <Section roman="III" title="A gentle list" hint="2 of 5 kept">
          <IntentionsCard />
        </Section>

        <Section roman="IV" title="Practices, weather & arc" hint="A measured week">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HabitsCard />
            <MoodArc />
            <WeatherCard />
          </div>
        </Section>

        <Section roman="V" title="Counsel & chapters" hint="Curated for you">
          <MuseAndChapters />
        </Section>

        <Section roman="VI" title="Library, post & bulletins" hint="On the desk">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LibraryCard />
            <CorrespondenceCard />
            <BulletinsCard />
          </div>
        </Section>

        <Section roman="VII" title="A passing thought">
          <QuickCapture />
        </Section>

        <div className="flex flex-col items-center pt-6 gap-3">
          <span className="h-px w-16 bg-stone-400/40" />
          <p className="font-['Fraunces'] italic text-stone-500 text-sm">
            <Wind size={12} className="inline -mt-0.5 mr-1" />
            Choose a chapter from the margin to continue your day.
          </p>
        </div>
      </main>
    </div>
  );
}
