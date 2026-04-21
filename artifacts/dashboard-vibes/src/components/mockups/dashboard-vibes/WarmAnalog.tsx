import './_group.css';
import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Feather, Sun, BookOpen, Sparkles } from 'lucide-react';

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

function WelcomeHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-stone-300/70">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-[#e8dccb] border border-stone-400/40 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
            <Feather className="text-[#a8482b]" size={28} strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sun size={12} className="text-[#a8482b]" strokeWidth={2} />
            <span className="text-[10px] tracking-[0.35em] text-stone-600 uppercase font-['Inter']">Morning Pages</span>
          </div>
          <h1 className="text-5xl md:text-6xl tracking-tight text-stone-800 font-['Fraunces'] font-light italic">
            Hello, Maya.
          </h1>
          <p className="mt-2 text-stone-500 font-['Fraunces'] text-base italic">A quiet Tuesday to begin again.</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] tracking-[0.3em] text-stone-500 uppercase font-['Inter']">Today's Pace</span>
        <div className="flex items-baseline gap-2">
          <span className="font-['Fraunces'] text-3xl text-stone-800">3</span>
          <span className="text-stone-400 font-['Fraunces'] italic">of 5 intentions kept</span>
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
    <div className="lg:col-span-2 relative rounded-[28px] bg-[#f3ead9] border border-stone-300/60 px-12 py-16 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #57361e 1px, transparent 0)', backgroundSize: '14px 14px' }} />
      <div className="relative flex flex-col items-center justify-center gap-4">
        <span className="text-[10px] tracking-[0.4em] uppercase text-stone-500 font-['Inter']">Present Hour</span>
        <div className="font-['DM_Serif_Display'] text-[120px] leading-none text-stone-800 tracking-tight">
          {fmt(now, 'time').replace(' ', '')}
        </div>
        <div className="flex items-center gap-3 text-stone-500 font-['Fraunces'] italic">
          <span className="h-px w-12 bg-stone-400/60" />
          <span>{fmt(now, 'date')}</span>
          <span className="h-px w-12 bg-stone-400/60" />
        </div>
        <p className="mt-6 max-w-md text-center text-stone-600 font-['Fraunces'] italic text-lg leading-relaxed">
          “How we spend our days is, of course, how we spend our lives.”
        </p>
        <span className="text-xs text-stone-400 font-['Inter']">— Annie Dillard</span>
      </div>
    </div>
  );
}

function DateCard() {
  const today = new Date();
  return (
    <div className="group relative rounded-[28px] bg-[#a8482b] text-[#f5ead4] p-10 overflow-hidden cursor-pointer transition-transform hover:-translate-y-1">
      <div className="absolute top-5 right-5 text-[#f5ead4]/60 group-hover:text-[#f5ead4] transition-colors">
        <CalendarIcon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
        <div className="text-xs tracking-[0.4em] uppercase text-[#f5ead4]/70 font-['Inter']">{fmt(today, 'weekday')}</div>
        <div className="font-['DM_Serif_Display'] text-[140px] leading-none">{fmt(today, 'day')}</div>
        <div className="text-sm tracking-[0.3em] uppercase text-[#f5ead4]/70 font-['Inter']">{fmt(today, 'month')}</div>
        <div className="mt-4 pt-4 border-t border-[#f5ead4]/20 w-full text-center">
          <span className="font-['Fraunces'] italic text-[#f5ead4]/90">Begin a new entry →</span>
        </div>
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="rounded-[28px] bg-white/60 backdrop-blur-sm border border-stone-300/60 p-10 flex gap-8 items-start">
      <div className="shrink-0 h-14 w-14 rounded-full bg-[#e8dccb] flex items-center justify-center">
        <BookOpen className="text-[#a8482b]" size={22} strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={12} className="text-[#a8482b]" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-stone-500 font-['Inter']">A Small Practice</span>
        </div>
        <h3 className="font-['Fraunces'] text-2xl text-stone-800 italic leading-snug mb-2">
          Begin with three slow breaths.
        </h3>
        <p className="text-stone-600 font-['Fraunces'] leading-relaxed">
          Before opening any list, sit with your tea. Let the steam rise. The day is long enough to wait for you.
        </p>
      </div>
    </div>
  );
}

export function WarmAnalog() {
  return (
    <div className="min-h-screen bg-[#f5ead4] font-['Inter']" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(168,72,43,0.06), transparent 50%), radial-gradient(circle at 80% 80%, rgba(87,54,30,0.05), transparent 50%)' }}>
      <div className="max-w-6xl mx-auto px-12 py-16 space-y-12">
        <WelcomeHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ClockCard />
          <DateCard />
        </div>
        <TipCard />
        <div className="flex flex-col items-center pt-8 gap-4">
          <span className="h-px w-16 bg-stone-400/40" />
          <p className="font-['Fraunces'] italic text-stone-500 text-sm">Choose a chapter from the margin to continue your day.</p>
        </div>
      </div>
    </div>
  );
}
