import './_group.css';
import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Smile, Sparkle, Heart, Cloud, Plus } from 'lucide-react';

function fmt(d: Date, kind: 'weekday' | 'day' | 'month' | 'time') {
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    weekday: { weekday: 'long' },
    day: { day: 'numeric' },
    month: { month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: false },
  };
  return new Intl.DateTimeFormat('en-US', opts[kind]).format(d);
}

function WelcomeHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 blur-md opacity-70" />
          <div className="relative h-16 w-16 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-lg">
            <Smile className="text-purple-500" size={28} />
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-['Plus_Jakarta_Sans'] font-medium text-slate-700">Good morning sequence</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-800">
            Hey, Maya <span className="inline-block animate-bounce">👋</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="px-5 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-['Plus_Jakarta_Sans'] font-semibold">Streak</div>
          <div className="font-['Plus_Jakarta_Sans'] font-bold text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">12 days</div>
        </div>
        <button className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg shadow-purple-300/50 flex items-center justify-center hover:scale-105 transition">
          <Plus size={22} />
        </button>
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
  const time = fmt(now, 'time');
  const [hh, mm] = time.split(':');
  return (
    <div className="lg:col-span-2 relative rounded-[32px] overflow-hidden p-10 min-h-[360px]">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-purple-200 to-pink-200" />
      <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-pink-300/50 blur-3xl" />
      <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-sky-300/60 blur-3xl" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl border border-white/60 rounded-[32px]" />
      <div className="relative flex flex-col items-center justify-center h-full gap-6 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80">
          <Cloud size={14} className="text-sky-500" />
          <span className="text-xs font-['Plus_Jakarta_Sans'] font-semibold text-slate-700">Soft focus hour</span>
        </div>
        <div className="flex items-baseline gap-2 font-['Plus_Jakarta_Sans']">
          <span className="text-[140px] leading-none font-extrabold bg-gradient-to-b from-slate-800 to-purple-600 bg-clip-text text-transparent tracking-tighter">{hh}</span>
          <span className="text-[120px] leading-none font-light text-white/80 tracking-tighter">:</span>
          <span className="text-[140px] leading-none font-extrabold bg-gradient-to-b from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter">{mm}</span>
        </div>
        <div className="flex gap-2">
          {['Focus', 'Break', 'Walk', 'Read'].map((m, i) => (
            <span key={m} className={`px-3 py-1 rounded-full text-xs font-['Plus_Jakarta_Sans'] font-semibold backdrop-blur-md border ${i === 0 ? 'bg-purple-500/90 text-white border-purple-400' : 'bg-white/50 text-slate-700 border-white/70'}`}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateCard() {
  const today = new Date();
  return (
    <div className="relative rounded-[32px] overflow-hidden p-8 cursor-pointer group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-pink-200 to-rose-200" />
      <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-yellow-200/70 blur-3xl" />
      <div className="absolute inset-0 bg-white/25 backdrop-blur-xl border border-white/60 rounded-[32px]" />
      <div className="relative flex flex-col items-center justify-center h-full gap-2">
        <div className="absolute top-0 right-0 h-9 w-9 rounded-full bg-white/60 border border-white/80 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition">
          <CalendarIcon size={14} className="text-rose-500" />
        </div>
        <div className="text-xs uppercase tracking-[0.3em] font-['Plus_Jakarta_Sans'] font-bold text-rose-500/80">{fmt(today, 'weekday')}</div>
        <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-[120px] leading-none bg-gradient-to-b from-rose-500 to-orange-500 bg-clip-text text-transparent tracking-tighter">{fmt(today, 'day')}</div>
        <div className="text-sm font-['Plus_Jakarta_Sans'] font-semibold text-slate-700">{fmt(today, 'month')}</div>
        <button className="mt-4 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-['Plus_Jakarta_Sans'] font-bold text-rose-600 flex items-center gap-1.5 shadow-sm">
          <Sparkle size={12} /> Plan today
        </button>
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="relative rounded-[32px] overflow-hidden p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[32px]" />
      <div className="relative flex items-start gap-6">
        <div className="shrink-0 h-14 w-14 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm">
          <Heart className="text-rose-500" size={22} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-widest text-emerald-700/80 mb-1">Today's tiny tip</div>
          <p className="font-['Plus_Jakarta_Sans'] text-xl font-semibold text-slate-800 leading-snug">
            Pair every hard task with a small treat — your brain loves a fair trade. ✨
          </p>
        </div>
        <button className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-['Plus_Jakarta_Sans'] font-bold text-emerald-700 hover:bg-white">Save</button>
      </div>
    </div>
  );
}

export function GlassPastel() {
  return (
    <div className="min-h-screen relative font-['Plus_Jakarta_Sans']" style={{ background: 'linear-gradient(135deg, #fde2e4 0%, #e2ecff 35%, #d8f3ee 70%, #fff5cf 100%)' }}>
      <div className="absolute top-10 right-20 h-96 w-96 rounded-full bg-purple-300/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-10 py-12 space-y-8">
        <WelcomeHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClockCard />
          <DateCard />
        </div>
        <TipCard />
        <div className="flex justify-center pt-6">
          <div className="px-5 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/70 text-xs font-semibold text-slate-600">
            Tap a bubble in the side menu to dive in 🫧
          </div>
        </div>
      </div>
    </div>
  );
}
