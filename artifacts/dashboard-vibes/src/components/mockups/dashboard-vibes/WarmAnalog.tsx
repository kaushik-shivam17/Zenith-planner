import './_group.css';
import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon, Feather, Sun, BookOpen, Sparkles, Coffee, Droplet, Leaf,
  Play, Pause, Plus, Check, ChevronRight, Quote, Cloud, Moon, Wind, Brain, NotebookPen,
} from 'lucide-react';

function fmt(d: Date, kind: 'weekday' | 'day' | 'month' | 'time' | 'date' | 'short') {
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    weekday: { weekday: 'long' },
    day: { day: 'numeric' },
    month: { month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true },
    date: { weekday: 'long', month: 'long', day: 'numeric' },
    short: { month: 'short', day: 'numeric' },
  };
  return new Intl.DateTimeFormat('en-US', opts[kind]).format(d);
}

const intentions = [
  { id: 1, text: 'Finish the chapter on attention', tag: 'Read', done: true, time: '08:30' },
  { id: 2, text: 'A long walk through the park', tag: 'Move', done: true, time: '11:00' },
  { id: 3, text: 'Draft the proposal for L. Hartley', tag: 'Write', done: false, time: '14:00' },
  { id: 4, text: 'Tea with Soren, no phones', tag: 'Care', done: false, time: '17:30' },
  { id: 5, text: 'Three pages of evening journal', tag: 'Reflect', done: false, time: '21:00' },
];

const habits = [
  { name: 'Read', icon: BookOpen, value: 42, goal: 60, unit: 'min' },
  { name: 'Water', icon: Droplet, value: 5, goal: 8, unit: 'cups' },
  { name: 'Walk', icon: Leaf, value: 3.2, goal: 5, unit: 'km' },
  { name: 'Sleep', icon: Moon, value: 7.4, goal: 8, unit: 'hr' },
];

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
        <div className="px-5 py-3 rounded-2xl bg-white/60 border border-stone-300/60 backdrop-blur-sm">
          <div className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-['Inter']">Weather</div>
          <div className="flex items-center gap-2 mt-1">
            <Cloud size={18} className="text-stone-500" strokeWidth={1.5} />
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
          <li key={it.id} className="flex items-center gap-4 group">
            <button className={`h-6 w-6 rounded-full border ${it.done ? 'bg-[#a8482b] border-[#a8482b] text-[#f5ead4]' : 'border-stone-400'} flex items-center justify-center shrink-0`}>
              {it.done && <Check size={14} strokeWidth={2.5} />}
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

function HabitsAndArc() {
  const week = [0.4, 0.6, 0.5, 0.8, 0.9, 0.7, 0.55];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-[28px] bg-white/60 border border-stone-300/60 p-8">
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

      <div className="rounded-[28px] bg-[#f3ead9] border border-stone-300/60 p-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">A quiet arc</div>
            <h3 className="font-['Fraunces'] text-xl text-stone-800 italic mt-1">This week</h3>
          </div>
          <span className="font-['Fraunces'] text-3xl text-[#a8482b]">+18%</span>
        </div>
        <div className="flex items-end gap-2 h-28">
          {week.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-[#a8482b]/80" style={{ height: `${v * 100}%` }} />
              <span className="text-[9px] uppercase tracking-widest text-stone-500 font-['Inter']">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-stone-500 italic font-['Fraunces'] leading-relaxed">
          Most settled hour: between three and four, with the lamp on.
        </p>
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
    <div className="min-h-screen bg-[#f5ead4] font-['Inter']" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(168,72,43,0.06), transparent 50%), radial-gradient(circle at 80% 80%, rgba(87,54,30,0.05), transparent 50%)' }}>
      <div className="max-w-6xl mx-auto px-12 py-12 space-y-10">
        <WelcomeHeader />

        <Section roman="I" title="The hour & the day" hint="Live · pomodoro 3/4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ClockCard />
            <DateCard />
          </div>
        </Section>

        <Section roman="II" title="A gentle list" hint="2 of 5 kept">
          <IntentionsCard />
        </Section>

        <Section roman="III" title="Practices & pace" hint="12-day streak">
          <HabitsAndArc />
        </Section>

        <Section roman="IV" title="Counsel & chapters" hint="Curated for you">
          <MuseAndChapters />
        </Section>

        <Section roman="V" title="A passing thought">
          <QuickCapture />
        </Section>

        <div className="flex flex-col items-center pt-6 gap-3">
          <span className="h-px w-16 bg-stone-400/40" />
          <p className="font-['Fraunces'] italic text-stone-500 text-sm">
            <Wind size={12} className="inline -mt-0.5 mr-1" />
            Choose a chapter from the margin to continue your day.
          </p>
        </div>
      </div>
    </div>
  );
}
