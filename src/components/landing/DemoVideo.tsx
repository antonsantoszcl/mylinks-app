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
  { start: 0,  end: 8,  label: 'Apresentação' },
  { start: 8,  end: 18, label: 'Dashboard'    },
  { start: 18, end: 28, label: 'Página Pública' },
  { start: 28, end: 35, label: 'Organização'  },
  { start: 35, end: 40, label: 'Comece agora' },
];
const TOTAL = 40;

/* ──────────────────────────────────────────────────────────────
   Character SVG
────────────────────────────────────────────────────────────── */
function Character({ waving, pointing, thumbsUp }: { waving?: boolean; pointing?: boolean; thumbsUp?: boolean }) {
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
        @keyframes bob {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
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
        .char-bob { animation: bob 2s ease-in-out infinite; }
        .char-eye { animation: blink 3s ease-in-out infinite; transform-origin: center; }
        .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
      `}</style>

      {/* Body wrapper with bob */}
      <div className="char-bob">
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
              waving ? 'animate-wave-arm' : ''
            }`}
          />
          {/* Torso */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 flex items-center justify-center z-10 shadow-lg shadow-purple-200">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          {/* Right arm */}
          <div
            className={`w-4 h-12 rounded-full bg-gradient-to-b from-purple-300 to-purple-500 mt-2 -ml-1 ${
              pointing ? 'animate-point-arm' : thumbsUp ? 'animate-thumbs-up' : ''
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
function SpeechBubble({ text, visible }: { text: string; visible: boolean }) {
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
   Step 2 – Dashboard mini-animation
   Shows: creating "Noticias" + adding "Globo.com", then
   "Financas", "Ferramentas", "Entretenimento" appearing — same
   data as DemoPreview.
────────────────────────────────────────────────────────────── */

// Phase 0: empty → typing category name
// Phase 1: "Noticias" card created, link "Globo.com" being typed/added
// Phase 2: link added, card shows Globo.com + UOL
// Phase 3+: other cards appear one by one
const EXTRA_CARDS = [
  {
    label: 'Financas',
    color: 'from-emerald-400 to-emerald-600',
    links: ['Banco do Brasil', 'Itau', 'InfoMoney'],
  },
  {
    label: 'Ferramentas',
    color: 'from-sky-400 to-sky-600',
    links: ['Google Drive', 'Gmail', 'Canva'],
  },
  {
    label: 'Entretenimento',
    color: 'from-rose-400 to-rose-600',
    links: ['YouTube', 'Netflix', 'Spotify'],
  },
];

function DashboardAnim({ visible }: { visible: boolean }) {
  // phase 0 = blank input; 1 = typing name; 2 = card created; 3 = typing link;
  // 4 = link added; 5,6,7 = extra cards appearing
  const [phase, setPhase] = useState(0);
  const [typedName, setTypedName] = useState('');
  const [typedLink, setTypedLink] = useState('');
  const [extraShown, setExtraShown] = useState(0);

  const CATEGORY_NAME = 'Noticias';
  const LINK_NAME = 'Globo.com';

  useEffect(() => {
    if (!visible) {
      setPhase(0); setTypedName(''); setTypedLink(''); setExtraShown(0);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Start typing category name at 300ms
    timers.push(setTimeout(() => setPhase(1), 300));

    // Type each letter of "Noticias"
    CATEGORY_NAME.split('').forEach((_, i) => {
      timers.push(setTimeout(() => {
        setTypedName(CATEGORY_NAME.slice(0, i + 1));
      }, 400 + i * 120));
    });

    // Card created
    timers.push(setTimeout(() => setPhase(2), 400 + CATEGORY_NAME.length * 120 + 200));

    // Start typing link name
    timers.push(setTimeout(() => setPhase(3), 400 + CATEGORY_NAME.length * 120 + 600));
    LINK_NAME.split('').forEach((_, i) => {
      timers.push(setTimeout(() => {
        setTypedLink(LINK_NAME.slice(0, i + 1));
      }, 400 + CATEGORY_NAME.length * 120 + 700 + i * 100));
    });

    // Link added
    const linkDoneAt = 400 + CATEGORY_NAME.length * 120 + 700 + LINK_NAME.length * 100 + 200;
    timers.push(setTimeout(() => setPhase(4), linkDoneAt));

    // Extra cards appear one by one
    EXTRA_CARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setExtraShown(i + 1), linkDoneAt + 500 + i * 1200));
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

        <div className="flex flex-col gap-2">
          {/* Phase 1: typing the category name */}
          {phase === 1 && (
            <div className="flex items-center gap-2 bg-white border-2 border-purple-400 rounded-lg px-2 py-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-medium">Nova categoria:</span>
              <span className="text-xs text-purple-700 font-semibold">
                {typedName}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          )}

          {/* Phase 2+: Noticias card */}
          {phase >= 2 && (
            <div className="transition-all duration-500 bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
              {/* Card header */}
              <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-slate-100">
                <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center text-purple-600">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/>
                    <polyline points="17 2 17 8 23 8"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700">Noticias</span>
                <span className="ml-auto text-[10px] bg-purple-50 text-purple-500 rounded-full px-1.5 font-medium">
                  {phase >= 4 ? '2' : '0'}
                </span>
              </div>

              {/* Phase 3: typing link name */}
              {phase === 3 && (
                <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded px-1.5 py-1">
                  <span className="text-[9px] text-slate-400">+ Link:</span>
                  <span className="text-[10px] text-purple-700 font-medium">
                    {typedLink}
                    <span className="animate-pulse">|</span>
                  </span>
                </div>
              )}

              {/* Phase 4+: links added */}
              {phase >= 4 && (
                <div className="flex flex-col gap-1">
                  {['Globo.com', 'UOL'].map((link, i) => (
                    <div
                      key={link}
                      className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-purple-50 transition-all duration-300"
                      style={{ opacity: phase >= 4 ? 1 : 0, transitionDelay: `${i * 120}ms` }}
                    >
                      <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 flex-shrink-0 overflow-hidden">
                        {/* favicon placeholder */}
                        <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500" />
                      </div>
                      <span className="text-[10px] text-slate-600">{link}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Extra cards appearing */}
          {EXTRA_CARDS.map((card, i) => (
            <div
              key={card.label}
              className="transition-all duration-500"
              style={{
                opacity: extraShown > i ? 1 : 0,
                transform: extraShown > i ? 'translateX(0)' : 'translateX(-12px)',
              }}
            >
              <div className={`bg-gradient-to-r ${card.color} rounded-lg p-2`}>
                <span className="text-white text-xs font-semibold">{card.label}</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {card.links.map((l) => (
                    <span key={l} className="text-white/80 text-[9px] bg-white/20 rounded px-1.5 py-0.5">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Step 3 – Public page mini-animation
────────────────────────────────────────────────────────────── */
function PublicPageAnim({ visible }: { visible: boolean }) {
  const [cardIn, setCardIn] = useState(false);
  const [linksIn, setLinksIn] = useState(false);

  useEffect(() => {
    if (!visible) { setCardIn(false); setLinksIn(false); return; }
    const t1 = setTimeout(() => setCardIn(true), 300);
    const t2 = setTimeout(() => setLinksIn(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  return (
    <div
      className="transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <div className="bg-slate-100 rounded-xl p-3 w-[240px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-400 ml-1 font-mono">mylinks.app/@voce</span>
        </div>
        {/* Profile card */}
        <div
          className="bg-white rounded-xl p-3 shadow-sm transition-all duration-500 text-center"
          style={{ opacity: cardIn ? 1 : 0, transform: cardIn ? 'scale(1)' : 'scale(0.85)' }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 mx-auto flex items-center justify-center text-white font-bold text-lg mb-1.5">
            V
          </div>
          <p className="font-semibold text-slate-800 text-xs">@voce</p>
          <p className="text-[10px] text-slate-400 mb-2">Desenvolvedor · Designer</p>
          <div className="flex flex-col gap-1.5">
            {['Portfolio', 'GitHub', 'LinkedIn'].map((item, i) => (
              <div
                key={item}
                className="bg-purple-50 border border-purple-100 rounded-lg py-1.5 text-xs text-purple-700 font-medium transition-all duration-300"
                style={{ opacity: linksIn ? 1 : 0, transform: linksIn ? 'translateY(0)' : 'translateY(6px)', transitionDelay: `${i * 150}ms` }}
              >
                {item}
              </div>
            ))}
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
    'Aqui você organiza todos os seus\nlinks favoritos em categorias.',
    'E cria sua página pública para\ncompartilhar com todo mundo!',
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
        <SpeechBubble text={stepTexts[currentStep]} visible={true} />

        {/* Character */}
        <div className="my-1">
          <Character
            waving={currentStep === 0 || currentStep === 4}
            pointing={currentStep === 1}
            thumbsUp={currentStep === 3}
          />
        </div>

        {/* Step content */}
        <div className="w-full flex justify-center">
          {currentStep === 1 && <DashboardAnim visible={currentStep === 1} />}
          {currentStep === 2 && <PublicPageAnim visible={currentStep === 2} />}
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
