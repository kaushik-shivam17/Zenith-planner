import './_group.css';
import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';

function fmt(d: Date, kind: 'weekday' | 'day' | 'month' | 'year' | 'time' | 'iso') {
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    weekday: { weekday: 'long' },
    day: { day: '2-digit' },
    month: { month: 'long' },
    year: { year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
    iso: { year: 'numeric', month: '2-digit', day: '2-digit' },
  };
  return new Intl.DateTimeFormat('en-US', opts[kind]).format(d);
}

function WelcomeHeader() {
  return (
    <div className="grid grid-cols-12 gap-8 pb-12 border-b border-black">
      <div className="col-span-2">
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">No. 047</div>
      </div>
      <div className="col-span-7">
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500 mb-6">— A Daily Edition —</div>
        <h1 className="font-['Cormorant_Garamond'] font-light text-7xl leading-[0.95] tracking-tight text-black">
          Good<br />morning,<br /><span className="italic">Maya.</span>
        </h1>
      </div>
      <div className="col-span-3 flex flex-col items-end justify-between">
        <div className="text-right">
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">Volume</div>
          <div className="font-['Cormorant_Garamond'] text-3xl">XII · 04</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">Weather</div>
          <div className="font-['Cormorant_Garamond'] text-2xl italic">Clear, 14°</div>
        </div>
      </div>
    </div>
  );
}

function ClockCard() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="lg:col-span-2 border border-black p-12 relative">
      <div className="flex items-start justify-between mb-12">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">i.</div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-black mt-1">Present Hour</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">{fmt(now, 'iso')}</div>
        </div>
      </div>

      <div className="flex items-baseline gap-6">
        <div className="font-['Cormorant_Garamond'] font-light text-[180px] leading-none tracking-tighter text-black tabular-nums">
          {fmt(now, 'time').slice(0, 5)}
        </div>
        <div className="font-['JetBrains_Mono'] text-2xl text-neutral-400 tabular-nums">:{fmt(now, 'time').slice(6)}</div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-px bg-black border border-black">
        {[
          { l: 'Awake', v: '06:14' },
          { l: 'First task', v: '08:00' },
          { l: 'Sundown', v: '19:42' },
        ].map((s) => (
          <div key={s.l} className="bg-white p-4">
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
    <div className="border border-black bg-black text-white p-10 flex flex-col justify-between cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">ii.</div>
          <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] mt-1">The Date</div>
        </div>
        <CalendarIcon size={14} strokeWidth={1} className="opacity-70 group-hover:opacity-100" />
      </div>

      <div className="text-center my-6">
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400 mb-3">{fmt(today, 'weekday')}</div>
        <div className="font-['Cormorant_Garamond'] font-light text-[200px] leading-[0.85] tracking-tighter">{fmt(today, 'day')}</div>
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400 mt-3">{fmt(today, 'month')} · {fmt(today, 'year')}</div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-700 pt-4">
        <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-400">New entry</span>
        <ArrowUpRight size={14} strokeWidth={1} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="border border-black p-10 grid grid-cols-12 gap-6">
      <div className="col-span-2">
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500">iii.</div>
        <div className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-black mt-1">Aphorism</div>
      </div>
      <div className="col-span-8">
        <p className="font-['Cormorant_Garamond'] font-light text-3xl leading-snug text-black">
          “To do two things at once is to do neither.”
        </p>
        <p className="mt-4 text-[11px] tracking-[0.3em] uppercase font-['JetBrains_Mono'] text-neutral-500">— Publilius Syrus, c. 1st century BC</p>
      </div>
      <div className="col-span-2 flex items-end justify-end">
        <span className="text-[10px] tracking-[0.4em] uppercase font-['JetBrains_Mono'] text-neutral-500 border-b border-black pb-0.5">Read more</span>
      </div>
    </div>
  );
}

export function ZenMonochrome() {
  return (
    <div className="min-h-screen bg-[#fafaf7] text-black font-['JetBrains_Mono']">
      <div className="max-w-6xl mx-auto px-12 py-14 space-y-10">
        <WelcomeHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-black border border-black">
          <div className="lg:col-span-2 bg-[#fafaf7]">
            <ClockCard />
          </div>
          <div className="bg-[#fafaf7]">
            <DateCard />
          </div>
        </div>
        <TipCard />
        <div className="pt-10 border-t border-black flex items-center justify-between">
          <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">— fin. —</span>
          <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">Turn the page in the margin to continue.</span>
          <span className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">p. 047</span>
        </div>
      </div>
    </div>
  );
}
