'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Play } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────── */
type Step = 0 | 1 | 2 | 3 | 4;

interface StepConfig {
  start: number; // seconds
  end: number;
  label: string;
}

const STEPS: StepConfig[] = [
  { start: 0,  end: 8,  label: 'Apresentação'   },
  { start: 8,  end: 18, label: 'Já organizado'  },
  { start: 18, end: 28, label: 'Personalize'    },
  { start: 28, end: 35, label: 'Organização'    },
  { start: 35, end: 40, label: 'Comece agora'   },
];
const TOTAL = 40;

/* ──────────────────────────────────────────────────────────────
   Character SVG
────────────────────────────────────────────────────────────── */
function Character({ waving, pointing, thumbsUp, excited }: { waving?: boolean; pointing?: boolean; thumbsUp?: boolean; excited?: boolean }) {
  const armClass = waving
    ? 'animate-wave-arm'
    : pointing
    ? 'animate-point-arm'
    : thumbsUp
    ? 'animate-thumbs-up'
    : '';

  return (
    <div className="relative flex flex-col items-center select-none">
      <style>{`
        @keyframes wave-arm {
          0%,100% { transform: rotate(0deg); }
          25% { transform: rotate(-30deg); }
          75% { transform: rotate(20deg); }
        }
        @keyframes point-arm {
          0%,100% { transform: rotate(45deg) translateX(0px); }
          50% { transform: rotate(45deg) translateX(4px); }
        }
        @keyframes thumbs-up-arm {
          0%,100% { transform: rotate(-20deg) translateY(0px); }
          50% { transform: rotate(-20deg) translateY(-4px); }
        }
        @keyframes excited-left {
          0%,100% { transform: rotate(20deg) translateY(0px); }
          30% { transform: rotate(50deg) translateY(-6px); }
          60% { transform: rotate(10deg) translateY(-2px); }
        }
        @keyframes excited-right {
          0%,100% { transform: rotate(-20deg) translateY(0px); }
          30% { transform: rotate(-50deg) translateY(-6px); }
          60% { transform: rotate(-10deg) translateY(-2px); }
        }
        @keyframes bob {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes excited-bob {
          0%,100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-8px) scale(1.05); }
          75% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes blink {
          0%,90%,100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-wave-arm { animation: wave-arm 0.7s ease-in-out infinite; transform-origin: top center; }
        .animate-point-arm { animation: point-arm 0.9s ease-in-out infinite; transform-origin: top center; }
        .animate-thumbs-up { animation: thumbs-up-arm 0.8s ease-in-out infinite; transform-origin: bottom center; }
        .animate-excited-left { animation: excited-left 0.6s ease-in-out infinite; transform-origin: top center; }
        .animate-excited-right { animation: excited-right 0.6s ease-in-out infinite; transform-origin: top center; }
        .char-bob { animation: bob 2s ease-in-out infinite; }
        .char-excited-bob { animation: excited-bob 0.7s ease-in-out infinite; }
        .char-eye { animation: blink 3s ease-in-out infinite; transform-origin: center; }
        .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
      `}</style>

      {/* Body wrapper with bob */}
      <div className={excited ? 'char-excited-bob' : 'char-bob'}>
        {/* Head */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glow behind head */}
          <circle cx="40" cy="40" r="36" fill="#f3e8ff" opacity="0.6" />
          {/* Head */}
          <circle cx="40" cy="40" r="32" fill="url(#headGrad)" />
          {/* Eyes */}
          <ellipse cx="30" cy="36" rx="5" ry="5.5" fill="white" />
          <ellipse cx="50" cy="36" rx="5" ry="5.5" fill="white" />
          <g className="char-eye">
            <circle cx="31" cy="37" r="3" fill="#3b0764" />
            <circle cx="51" cy="37" r="3" fill="#3b0764" />
            {/* Eye shine */}
            <circle cx="32.5" cy="35.5" r="1" fill="white" />
            <circle cx="52.5" cy="35.5" r="1" fill="white" />
          </g>
          {/* Smile */}
          <path d="M29 48 Q40 57 51 48" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <ellipse cx="24" cy="46" rx="5" ry="3.5" fill="#f9a8d4" opacity="0.6" />
          <ellipse cx="56" cy="46" rx="5" ry="3.5" fill="#f9a8d4" opacity="0.6" />
          {/* Antenna */}
          <line x1="40" y1="8" x2="40" y2="20" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="7" r="4" fill="#a855f7" />
          <circle cx="40" cy="7" r="2" fill="white" opacity="0.8" />
          <defs>
            <radialGradient id="headGrad" cx="40%" cy="35%" r="60%" fx="40%" fy="35%">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#c084fc" />
            </radialGradient>
          </defs>
        </svg>

        {/* Body */}
        <div className="flex items-start justify-center -mt-1 relative">
          {/* Left arm */}
          <div
            className={`w-4 h-12 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 mt-2 -mr-1 ${
              excited ? 'animate-excited-left' : waving ? 'animate-wave-arm' : ''
            }`}
          />
          {/* Torso */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 flex items-center justify-center z-10 shadow-lg shadow-purple-200">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          {/* Right arm */}
          <div
            className={`w-4 h-12 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 mt-2 -ml-1 ${
              excited ? 'animate-excited-right' : pointing ? 'animate-point-arm' : thumbsUp ? 'animate-thumbs-up' : ''
            }`}
          />
        </div>

        {/* Legs */}
        <div className="flex justify-center gap-3 mt-1">
          <div className="w-4 h-8 rounded-full bg-gradient-to-b from-purple-400 to-purple-600" />
          <div className="w-4 h-8 rounded-full bg-gradient-to-b from-purple-400 to-purple-600" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Speech Bubble
────────────────────────────────────────────────────────────── */
function SpeechBubble({ text, visible, emphasis }: { text: string; visible: boolean; emphasis?: boolean }) {
  if (emphasis) {
    // Split on "!" to highlight the exclamation-heavy first sentence
    const lines = text.split('\n');
    return (
      <div
        className="transition-all duration-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
        }}
      >
        <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400 rounded-2xl px-5 py-4 shadow-xl max-w-[280px]">
          {/* Emphasis glow ring */}
          <div className="absolute -inset-1 rounded-2xl bg-purple-400/30 blur-sm -z-10" />
          {/* First line — large and bold */}
          <p className="text-base text-white font-bold leading-tight text-center mb-2">
            {lines[0]}
          </p>
          {/* Remaining lines — smaller but still prominent */}
          {lines.slice(1).map((line, i) => (
            <p key={i} className="text-xs text-purple-100 font-medium leading-snug text-center">
              {line}
            </p>
          ))}
          {/* Tail */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid #7e22ce',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
      }}
    >
      <div className="relative bg-white border-2 border-purple-200 rounded-2xl px-4 py-3 shadow-lg max-w-[260px]">
        <p className="text-sm text-slate-700 font-medium leading-snug text-center">{text}</p>
        {/* Tail */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '12px solid #e9d5ff',
          }}
        />
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '11px solid white',
          }}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Step 2 – Pre-populated dashboard
   Cards slide in staggered to show the dashboard already full.
   Same categories/links as DemoPreview.
────────────────────────────────────────────────────────────── */
const PREPOP_CARDS = [
  {
    label: 'Noticias',
    color: 'bg-purple-50 border-purple-100',
    header: 'text-purple-700',
    links: ['Globo.com', 'UOL', 'G1'],
  },
  {
    label: 'Financas',
    color: 'bg-emerald-50 border-emerald-100',
    header: 'text-emerald-700',
    links: ['Banco do Brasil', 'InfoMoney'],
  },
  {
    label: 'Ferramentas',
    color: 'bg-sky-50 border-sky-100',
    header: 'text-sky-700',
    links: ['Google Drive', 'Gmail', 'Canva'],
  },
  {
    label: 'Entretenimento',
    color: 'bg-rose-50 border-rose-100',
    header: 'text-rose-700',
    links: ['YouTube', 'Netflix', 'Spotify'],
  },
];

function DashboardAnim({ visible }: { visible: boolean }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!visible) { setShown(0); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Stagger each card appearing, starting quickly
    PREPOP_CARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setShown(i + 1), 300 + i * 900));
    });
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <div className="bg-slate-100 rounded-xl p-3 w-[270px]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-400 ml-1 font-mono">mylinks.app/dashboard</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PREPOP_CARDS.map((card, i) => (
            <div
              key={card.label}
              className={`transition-all duration-500 border rounded-lg p-2 ${card.color}`}
              style={{
                opacity: shown > i ? 1 : 0,
                transform: shown > i ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(8px)',
              }}
            >
              <p className={`text-[10px] font-bold mb-1.5 ${card.header}`}>{card.label}</p>
              <div className="flex flex-col gap-0.5">
                {card.links.map((l) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-white/80 border border-white flex-shrink-0" />
                    <span className="text-[9px] text-slate-500 truncate">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* "Pre-populated" badge that fades in after all cards */}
        <div
          className="mt-2 transition-all duration-500"
          style={{ opacity: shown >= PREPOP_CARDS.length ? 1 : 0 }}
        >
          <p className="text-center text-[9px] text-purple-500 font-medium bg-purple-50 rounded-full py-0.5">
            Exemplos prontos para começar!
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Step 3 – Edit animation: remove a link, add a new one
   Shows the Noticias card, strikes through "G1" (delete),
   then adds "CNN Brasil" (typed in).
────────────────────────────────────────────────────────────── */
function EditAnim({ visible }: { visible: boolean }) {
  // phase 0 = show card; 1 = hover delete on G1; 2 = G1 deleted;
  // 3 = show add-input; 4 = typing new link; 5 = new link added
  const [phase, setPhase] = useState(0);
  const [typedNew, setTypedNew] = useState('');
  const NEW_LINK = 'CNN Brasil';

  useEffect(() => {
    if (!visible) { setPhase(0); setTypedNew(''); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase(1), 700));   // hover on G1 → show delete btn
    timers.push(setTimeout(() => setPhase(2), 1600));  // G1 deleted
    timers.push(setTimeout(() => setPhase(3), 2400));  // show + add input
    timers.push(setTimeout(() => setPhase(4), 2900));  // start typing

    NEW_LINK.split('').forEach((_, i) => {
      timers.push(setTimeout(() => {
        setTypedNew(NEW_LINK.slice(0, i + 1));
      }, 3000 + i * 90));
    });

    const addedAt = 3000 + NEW_LINK.length * 90 + 200;
    timers.push(setTimeout(() => setPhase(5), addedAt));

    return () => timers.forEach(clearTimeout);
  }, [visible]);

  // Links array evolves with phase
  const baseLinks = ['Globo.com', 'UOL', 'G1'];
  const finalLinks = phase >= 2
    ? ['Globo.com', 'UOL']
    : baseLinks;

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <div className="bg-slate-100 rounded-xl p-3 w-[240px]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-400 ml-1 font-mono">mylinks.app/dashboard</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
          {/* Card header */}
          <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
            <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.5">
                <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" fill="#9333ea" stroke="none" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700">Noticias</span>
            <span className="ml-auto text-[10px] bg-purple-50 text-purple-500 rounded-full px-1.5 font-medium">
              {phase >= 5 ? 3 : phase >= 2 ? 2 : 3}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {/* Stable links */}
            {finalLinks.map((link) => (
              <div key={link} className="flex items-center gap-1.5 px-1 py-0.5 rounded group">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-300 to-blue-500 flex-shrink-0" />
                <span className="text-[10px] text-slate-600 flex-1">{link}</span>
              </div>
            ))}

            {/* G1 — phase 0-1: normal; phase 1: highlight with delete icon; phase 2+: gone */}
            {phase < 2 && (
              <div
                className={`flex items-center gap-1.5 px-1 py-0.5 rounded transition-all duration-300 ${
                  phase === 1 ? 'bg-red-50 border border-red-200' : ''
                }`}
              >
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-300 to-blue-500 flex-shrink-0" />
                <span
                  className={`text-[10px] flex-1 transition-all duration-300 ${
                    phase === 1 ? 'text-red-400 line-through' : 'text-slate-600'
                  }`}
                >
                  G1
                </span>
                {phase === 1 && (
                  <span className="text-[9px] text-red-400 font-bold bg-red-100 rounded px-1 ml-auto">
                    ✕
                  </span>
                )}
              </div>
            )}

            {/* Phase 2 — deleted feedback */}
            {phase === 2 && (
              <p className="text-[9px] text-red-400 text-center py-0.5 animate-pulse">Link removido!</p>
            )}

            {/* Phase 3 — add input empty */}
            {phase === 3 && (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-300 rounded px-1.5 py-1 mt-0.5">
                <span className="text-[9px] text-purple-400">+ Novo link:</span>
                <span className="text-[10px] text-purple-700 font-medium animate-pulse">|</span>
              </div>
            )}

            {/* Phase 4 — typing */}
            {phase === 4 && (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-400 rounded px-1.5 py-1 mt-0.5">
                <span className="text-[9px] text-purple-400">+ Novo link:</span>
                <span className="text-[10px] text-purple-700 font-semibold">
                  {typedNew}<span className="animate-pulse">|</span>
                </span>
              </div>
            )}

            {/* Phase 5 — CNN Brasil added */}
            {phase >= 5 && (
              <div
                className="flex items-center gap-1.5 px-1 py-0.5 rounded bg-green-50 border border-green-200 transition-all duration-500"
              >
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-red-400 to-red-600 flex-shrink-0" />
                <span className="text-[10px] text-green-700 font-medium flex-1">CNN Brasil</span>
                <span className="text-[9px] text-green-500">✓ novo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Step 4 – Drag animation hint
────────────────────────────────────────────────────────────── */
function DragAnim({ visible }: { visible: boolean }) {
  const [dragging, setDragging] = useState(false);
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    if (!visible) { setDragging(false); setDropped(false); return; }
    const t1 = setTimeout(() => setDragging(true), 500);
    const t2 = setTimeout(() => { setDropped(true); setDragging(false); }, 1800);
    const t3 = setTimeout(() => { setDropped(false); }, 3200);
    const t4 = setTimeout(() => { setDragging(true); }, 3700);
    const t5 = setTimeout(() => { setDropped(true); setDragging(false); }, 5000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [visible]);

  const items = ['Globo.com', 'UOL', 'G1', 'CNN Brasil'];
  const orderedItems = dropped ? ['UOL', 'Globo.com', 'G1', 'CNN Brasil'] : items;

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 w-[220px]">
        <p className="text-[10px] text-slate-400 mb-2 font-medium uppercase tracking-wide">Noticias</p>
        <div className="flex flex-col gap-1.5">
          {orderedItems.map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                dragging && i === 0
                  ? 'bg-purple-100 border-2 border-purple-400 shadow-md scale-105'
                  : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="4" cy="3" r="1.2" fill="#9ca3af" />
                <circle cx="4" cy="6" r="1.2" fill="#9ca3af" />
                <circle cx="4" cy="9" r="1.2" fill="#9ca3af" />
                <circle cx="8" cy="3" r="1.2" fill="#9ca3af" />
                <circle cx="8" cy="6" r="1.2" fill="#9ca3af" />
                <circle cx="8" cy="9" r="1.2" fill="#9ca3af" />
              </svg>
              <span className={dragging && i === 0 ? 'text-purple-700' : 'text-slate-600'}>{item}</span>
            </div>
          ))}
        </div>
        {dragging && (
          <p className="text-[10px] text-purple-500 mt-2 text-center animate-pulse">Arrastando...</p>
        )}
        {dropped && (
          <p className="text-[10px] text-green-500 mt-2 text-center">Reordenado!</p>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Step 5 – Final CTA
────────────────────────────────────────────────────────────── */
function CtaAnim({ visible }: { visible: boolean }) {
  const [btnIn, setBtnIn] = useState(false);

  useEffect(() => {
    if (!visible) { setBtnIn(false); return; }
    const t = setTimeout(() => setBtnIn(true), 800);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      className="transition-all duration-700 text-center"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.9)' }}
    >
      <div
        className="transition-all duration-500"
        style={{ opacity: btnIn ? 1 : 0, transform: btnIn ? 'translateY(0)' : 'translateY(12px)' }}
      >
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-300 hover:shadow-purple-400 hover:-translate-y-0.5 transition-all text-sm"
        >
          Criar minha conta grátis →
        </Link>
        <p className="text-xs text-slate-400 mt-2">Sem cartão de crédito</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Progress Bar
────────────────────────────────────────────────────────────── */
function ProgressBar({ elapsed }: { elapsed: number }) {
  const pct = Math.min((elapsed / TOTAL) * 100, 100);

  return (
    <div className="px-6 pb-4">
      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
        <span>{Math.round(elapsed)}s</span>
        <span>{TOTAL}s</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex mt-2 gap-1">
        {STEPS.map((s, i) => {
          const active = elapsed >= s.start && elapsed < s.end;
          const done = elapsed >= s.end;
          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-1 rounded-full transition-colors duration-500 ${
                  done ? 'bg-purple-500' : active ? 'bg-purple-400 animate-pulse' : 'bg-slate-200'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Modal content
────────────────────────────────────────────────────────────── */
function DemoContent({ onClose }: { onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  let currentStep: Step = 0;
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (elapsed >= STEPS[i].start) { currentStep = i as Step; break; }
  }

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= TOTAL) {
          clearInterval(intervalRef.current!);
          return TOTAL;
        }
        return prev + 0.25;
      });
    }, 250);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const stepTexts = [
    'Oi! Eu sou o Link,\nseu assistente do MyLinks!',
    'Esses links são apenas exemplos!\nVocê exclui o que não quiser e adiciona\nos seus. Cada um monta do seu jeito!',
    'Mas é tudo seu! Pode tirar, trocar,\nadicionar o que quiser. Super fácil!',
    'Arraste, organize, personalize.\nTudo do seu jeito!',
    'Comece agora, é grátis!',
  ];

  return (
    <div
      className="transition-all duration-400"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.95)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-200">
            <Play className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Como funciona o MyLinks</p>
            <p className="text-[11px] text-slate-400">Demo interativa • 40 segundos</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stage */}
      <div className="px-6 py-5 min-h-[300px] flex flex-col items-center justify-center gap-4 relative bg-gradient-to-b from-purple-50/40 to-white">
        {/* Speech bubble */}
        <SpeechBubble text={stepTexts[currentStep]} visible={true} emphasis={currentStep === 1} />

        {/* Character */}
        <div className="my-1">
          <Character
            waving={currentStep === 0 || currentStep === 4}
            excited={currentStep === 1}
            pointing={currentStep === 2}
            thumbsUp={currentStep === 3}
          />
        </div>

        {/* Step content */}
        <div className="w-full flex justify-center">
          {currentStep === 1 && <DashboardAnim visible={currentStep === 1} />}
          {currentStep === 2 && <EditAnim visible={currentStep === 2} />}
          {currentStep === 3 && <DragAnim visible={currentStep === 3} />}
          {currentStep === 4 && <CtaAnim visible={currentStep === 4} />}
        </div>

        {/* Step label */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
            {currentStep + 1}
          </span>
          <span className="text-xs text-slate-500">{STEPS[currentStep].label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar elapsed={elapsed} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Modal
────────────────────────────────────────────────────────────── */
function DemoModal({ onClose }: { onClose: () => void }) {
  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,10,30,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden">
        <DemoContent onClose={onClose} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Trigger Button (exported for use in landing page)
────────────────────────────────────────────────────────────── */
export default function DemoVideoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2.5 text-slate-600 font-medium px-5 py-3 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 hover:border-purple-200 hover:text-purple-700 shadow-sm"
      >
        {/* Pulsing play icon */}
        <span className="relative flex items-center justify-center w-7 h-7">
          <span className="absolute inset-0 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors" />
          <span className="absolute inset-0 rounded-full bg-purple-200 animate-ping opacity-40 group-hover:opacity-70" />
          <Play className="relative w-3.5 h-3.5 text-purple-600 fill-purple-600" />
        </span>
        <span className="text-sm">Veja como funciona</span>
      </button>

      {open && <DemoModal onClose={() => setOpen(false)} />}
    </>
  );
}
