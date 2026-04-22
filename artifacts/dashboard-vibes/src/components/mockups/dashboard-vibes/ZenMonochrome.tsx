import './_group.css';
import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon, ArrowUpRight, ArrowRight, Play, Pause, Plus, Check,
  Quote, Minus, ChevronRight, Search,
} from 'lucide-react';

function fmt(d: Date, kind: 'weekday' | 'day' | 'month' | 'year' | 'time' | 'iso' | 'mday') {
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    weekday: { weekday: 'long' },
    day: { day: '2-digit' },
    month: { month: 'long' },
    year: { year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
    iso: { year: 'numeric', month: '2-digit', day: '2-digit' },
    mday: { month: 'short', day: 'numeric' },
  };
  return new Intl.DateTimeFormat('en-US', opts[kind]).format(d);
}

function Masthead() {
  return (
    <header className="border-b-4 border-double border-black pb-6">
      <div className="flex items-center justify-between text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500 pb-3">
        <span>Vol. xii · No. 047</span>
        <span>Tuesday, April 21, 2026</span>
        <span>Edition · Morning</span>
      </div>
      <div className="grid grid-cols-12 gap-6 items-end pt-5">
        <div className="col-span-2 flex items-center gap-3">
          <div className="h-12 w-12 border border-black flex items-center justify-center font-['Cormorant_Garamond'] text-2xl">M</div>
          <div className="flex flex-col text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-500">
            <span>The reader</span>
            <span className="text-black">M. Hartley</span>
          </div>
        </div>
        <div className="col-span-7 text-center">
          <div className="text-[10px] tracking-[0.5em] uppercase font-['JetBrains_Mono'] text-neutral-500 mb-2">— A Daily Edition —</div>
          <h1 className="font-['Cormorant_Garamond'] font-light text-7xl leading-[0.95] tracking-tight text-black italic">
            The Quiet Ledger
          </h1>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500 mt-2">Notes for the considered hour</div>
        </div>
        <div className="col-span-3 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 border border-black px-3 py-1.5 w-full">
            <Search size={12} />
            <span className="text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-500 flex-1">Search the archive…</span>
            <span className="text-[9px] font-['JetBrains_Mono'] text-neutral-400">⌘K</span>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono']">
            <div className="border border-black p-2 text-center">
              <div className="text-neutral-500">Temp</div>
              <div className="font-['Cormorant_Garamond'] text-lg normal-case tracking-normal">14°</div>
            </div>
            <div className="border border-black p-2 text-center">
              <div className="text-neutral-500">Sun</div>
              <div className="font-['Cormorant_Garamond'] text-lg normal-case tracking-normal">19:42</div>
            </div>
            <div className="border border-black bg-black text-white p-2 text-center">
              <div className="opacity-70">Streak</div>
              <div className="font-['Cormorant_Garamond'] text-lg normal-case tracking-normal">12d</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionHead({ roman, title, sub }: any) {
  return (
    <div className="flex items-end justify-between border-b border-black pb-3 mb-5">
      <div className="flex items-baseline gap-4">
        <span className="font-['Cormorant_Garamond'] italic text-2xl">{roman}.</span>
        <h2 className="font-['Cormorant_Garamond'] text-3xl tracking-tight">{title}</h2>
      </div>
      {sub && <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">{sub}</span>}
    </div>
  );
}

function ClockCard() {
  const [now, setNow] = useState(new Date());
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(25 * 60 - 832);
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
    <div className="lg:col-span-2 border border-black bg-[#fafaf7] p-10 relative">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">i.</div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-black mt-1">Present Hour</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">{fmt(now, 'iso')}</div>
        </div>
      </div>

      <div className="flex items-baseline gap-6">
        <div className="font-['Cormorant_Garamond'] font-light text-[170px] leading-none tracking-tighter text-black tabular-nums">
          {fmt(now, 'time').slice(0, 5)}
        </div>
        <div className="font-['JetBrains_Mono'] text-2xl text-neutral-400 tabular-nums">:{fmt(now, 'time').slice(6)}</div>
      </div>

      <div className="mt-8 border-t border-black pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">— A focused interval —</div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono']">Pomodoro 03 / 04</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setRunning(!running)} className="h-12 w-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition">
            {running ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
          </button>
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="font-['Cormorant_Garamond'] text-4xl tabular-nums">{m}<span className="text-neutral-300">:</span>{s}</span>
              <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">until rest</span>
            </div>
            <div className="h-px bg-neutral-200 relative">
              <div className="absolute inset-y-0 left-0 bg-black" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">Subject</div>
            <div className="font-['Cormorant_Garamond'] italic text-xl">Drafting</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-px bg-black border border-black">
        {[
          { l: 'Awake since', v: '06:14' },
          { l: 'First task', v: '08:00' },
          { l: 'Sundown', v: '19:42' },
        ].map((s) => (
          <div key={s.l} className="bg-[#fafaf7] p-4">
            <div className="text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-500">{s.l}</div>
            <div className="font-['Cormorant_Garamond'] text-2xl tabular-nums">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DateCard() {
  const today = new Date();
  return (
    <div className="border border-black bg-black text-white p-8 flex flex-col cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">ii.</div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] mt-1">The Date</div>
        </div>
        <CalendarIcon size={14} strokeWidth={1} className="opacity-70 group-hover:opacity-100" />
      </div>

      <div className="text-center my-4">
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400 mb-2">{fmt(today, 'weekday')}</div>
        <div className="font-['Cormorant_Garamond'] font-light text-[170px] leading-[0.85] tracking-tighter">{fmt(today, 'day')}</div>
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400 mt-2">{fmt(today, 'month')} · {fmt(today, 'year')}</div>
      </div>

      <div className="border-t border-neutral-700 pt-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {['M','T','W','T','F','S','S'].map(d => (
            <span key={d} className="text-[9px] uppercase tracking-widest font-['JetBrains_Mono'] text-neutral-500">{d}</span>
          ))}
          {Array.from({length: 21}).map((_, i) => {
            const day = i + 7;
            const isToday = day === today.getDate();
            const has = [9, 12, 15, 17, 19, 22].includes(day);
            return (
              <span key={i} className={`h-6 flex items-center justify-center text-[10px] font-['Cormorant_Garamond']
                ${isToday ? 'bg-white text-black font-semibold' : has ? 'border border-neutral-600' : 'text-neutral-500'}`}>
                {day}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-5 border-t border-neutral-700 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono']">New entry</span>
        <ArrowUpRight size={14} strokeWidth={1} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
    </div>
  );
}

function Docket() {
  const items = [
    { id: '01', t: 'Read · chapter on attention', cat: 'Mind',  dur: '00:42', done: true },
    { id: '02', t: 'Walk · Hyde Park loop', cat: 'Body',  dur: '00:55', done: true },
    { id: '03', t: 'Draft · Hartley proposal', cat: 'Work',  dur: '02:00', done: false, now: true },
    { id: '04', t: 'Tea with Soren · no devices', cat: 'Care',  dur: '01:00', done: false },
    { id: '05', t: 'Evening journal · three pages', cat: 'Mind',  dur: '00:30', done: false },
  ];
  return (
    <div className="border border-black bg-[#fafaf7]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-black text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">
            <th className="text-left p-4 font-normal w-12">№</th>
            <th className="text-left p-4 font-normal">Item</th>
            <th className="text-left p-4 font-normal w-24">Section</th>
            <th className="text-right p-4 font-normal w-24">Duration</th>
            <th className="text-right p-4 font-normal w-16">State</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id} className={`border-b border-neutral-200 hover:bg-neutral-50 ${it.now ? 'bg-neutral-100' : ''}`}>
              <td className="p-4 font-['JetBrains_Mono'] text-xs text-neutral-500 tabular-nums">{it.id}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {it.now && <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />}
                  <span className={`font-['Cormorant_Garamond'] text-lg ${it.done ? 'line-through text-neutral-400' : 'text-black'}`}>{it.t}</span>
                </div>
              </td>
              <td className="p-4 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-600">{it.cat}</td>
              <td className="p-4 text-right font-['JetBrains_Mono'] text-xs text-neutral-600 tabular-nums">{it.dur}</td>
              <td className="p-4 text-right">
                {it.done ? <Check size={14} strokeWidth={1.5} className="inline" /> :
                 it.now ? <span className="text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono']">in hand</span> :
                          <Minus size={14} strokeWidth={1.5} className="inline text-neutral-400" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-black p-4 flex items-center justify-between">
        <button className="flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono']">
          <Plus size={12} strokeWidth={1.5} /> Add to docket
        </button>
        <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">2 of 5 settled · 5h 07m budgeted</span>
      </div>
    </div>
  );
}

function Stats() {
  const week = [38, 52, 41, 67, 78, 60, 44];
  const max = Math.max(...week);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-black border border-black">
      {/* Sparkline */}
      <div className="lg:col-span-2 bg-[#fafaf7] p-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">iv.a</div>
            <h3 className="font-['Cormorant_Garamond'] text-2xl">Hours of considered work · this week</h3>
          </div>
          <div className="text-right">
            <div className="font-['Cormorant_Garamond'] text-4xl">+18%</div>
            <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">vs. prior week</div>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40 border-b border-black">
          {week.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 tabular-nums">{v}m</span>
              <div className="w-full bg-black" style={{ height: `${(v / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-500">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#fafaf7] p-8 flex flex-col">
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">iv.b</div>
        <h3 className="font-['Cormorant_Garamond'] text-2xl mb-4">A brief summary</h3>
        <div className="space-y-4">
          {[
            { l: 'Tasks settled', v: '12', d: 'this week' },
            { l: 'Pomodoros run', v: '24', d: '600m total' },
            { l: 'Pages written', v: '17', d: 'across 4 drafts' },
            { l: 'Walked', v: '14.6km', d: 'on foot' },
          ].map(s => (
            <div key={s.l} className="flex items-baseline justify-between border-b border-neutral-200 pb-2">
              <div>
                <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">{s.l}</div>
                <div className="text-[9px] uppercase font-['JetBrains_Mono'] text-neutral-400">{s.d}</div>
              </div>
              <span className="font-['Cormorant_Garamond'] text-2xl tabular-nums">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Editorial() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-black border border-black">
      {/* AI counsel */}
      <div className="lg:col-span-2 bg-[#fafaf7] p-10 grid grid-cols-12 gap-6">
        <div className="col-span-2">
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">v.</div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-black mt-1">Counsel</div>
          <div className="mt-4 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500 leading-relaxed">— from the column on attention —</div>
        </div>
        <div className="col-span-10 border-l border-black pl-6">
          <h3 className="font-['Cormorant_Garamond'] text-3xl leading-tight">
            Your last three afternoons have drifted. <span className="italic">A single hard task at fourteen hundred</span>, then close the laptop and walk.
          </h3>
          <p className="mt-4 text-neutral-700 leading-relaxed font-['Cormorant_Garamond'] text-lg">
            From the corpus of your past two weeks: pages written after a walk are 31% longer and require 22% fewer edits. Hartley's proposal is the most consequential item on today's docket. We have set aside the hour and silenced the inbox at your leave.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <button className="border border-black px-4 py-2 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] hover:bg-black hover:text-white transition">Accept · 14:00</button>
            <button className="border border-black px-4 py-2 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono']">Suggest another</button>
            <button className="border border-black px-4 py-2 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono']">Postpone</button>
          </div>
        </div>
      </div>

      {/* Aphorism */}
      <div className="bg-black text-white p-10 flex flex-col justify-between">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">vi.</div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] mt-1">Aphorism</div>
        </div>
        <div>
          <Quote size={28} strokeWidth={0.7} className="text-neutral-500 mb-3" />
          <p className="font-['Cormorant_Garamond'] text-2xl leading-snug italic">
            To do two things at once is to do neither.
          </p>
          <p className="mt-3 text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-400">— Publilius Syrus, c. 1st century BC</p>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-700 pt-3 mt-6">
          <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">Read column</span>
          <ArrowRight size={12} className="text-neutral-400" />
        </div>
      </div>
    </div>
  );
}

function Chapters() {
  const items = [
    { n: 'Hartley proposal', when: 'Thu, Apr 23', pct: 70, cat: 'Work' },
    { n: 'Spring garden plan', when: 'Sun, Apr 26', pct: 35, cat: 'Home' },
    { n: 'Rilke essay draft', when: 'May 02', pct: 12, cat: 'Mind' },
    { n: 'First 10K run', when: 'May 18', pct: 48, cat: 'Body' },
  ];
  return (
    <div className="border border-black bg-[#fafaf7]">
      <div className="border-b border-black p-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-['Cormorant_Garamond'] italic text-xl">vii.</span>
          <h3 className="font-['Cormorant_Garamond'] text-2xl">Chapters in progress</h3>
        </div>
        <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">4 missions · 2 due this week</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-x divide-neutral-200">
        {items.map(m => (
          <div key={m.n} className="p-6 hover:bg-neutral-50 cursor-pointer group">
            <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">{m.cat}</div>
            <div className="font-['Cormorant_Garamond'] text-xl leading-tight mt-1">{m.n}</div>
            <div className="mt-4">
              <div className="h-px bg-neutral-300 relative">
                <div className="absolute inset-y-0 left-0 bg-black" style={{ width: `${m.pct}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-500">
                <span>{m.pct}%</span>
                <span>{m.when}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition">
              <ChevronRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickCapture() {
  return (
    <div className="border border-black bg-black text-white p-5 flex items-center gap-4">
      <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">Capture</span>
      <span className="h-4 w-px bg-neutral-700" />
      <input readOnly defaultValue="A passing thought worth keeping…"
        className="flex-1 bg-transparent outline-none font-['Cormorant_Garamond'] italic text-xl text-white placeholder:text-neutral-500" />
      <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">Press ⌘K</span>
      <button className="border border-white px-4 py-1.5 text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] hover:bg-white hover:text-black transition">File it</button>
    </div>
  );
}

export function ZenMonochrome() {
  return (
    <div className="min-h-screen bg-[#fafaf7] text-black font-['JetBrains_Mono']">
      <div className="max-w-6xl mx-auto px-12 py-10 space-y-10">
        <Masthead />

        <section>
          <SectionHead roman="I" title="The hour & the date" sub="Live" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-black border border-black">
            <div className="lg:col-span-2 bg-[#fafaf7]"><ClockCard /></div>
            <div className="bg-[#fafaf7]"><DateCard /></div>
          </div>
        </section>

        <section>
          <SectionHead roman="III" title="The day's docket" sub="2 of 5 settled" />
          <Docket />
        </section>

        <section>
          <SectionHead roman="IV" title="A brief almanac" sub="Week 17 · Q2" />
          <Stats />
        </section>

        <section>
          <SectionHead roman="V" title="Counsel & aphorism" sub="From the desk" />
          <Editorial />
        </section>

        <section>
          <SectionHead roman="VII" title="Chapters in progress" sub="Open missions" />
          <Chapters />
        </section>

        <section>
          <SectionHead roman="VIII" title="A passing thought" />
          <QuickCapture />
        </section>

        <footer className="pt-8 border-t-4 border-double border-black flex items-center justify-between">
          <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">— fin. —</span>
          <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">Turn the page in the margin to continue.</span>
          <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">p. 047</span>
        </footer>
      </div>
    </div>
  );
}
