'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'infobar_dismissed';
const ROTATE_INTERVAL = 6000;
const FADE_DURATION = 500;

interface InfoMessage {
  category: string;
  text: string;
  url: string;
}

const messages: InfoMessage[] = [
  { category: 'Mercado', text: 'Ibovespa sobe 1,2% com alta de commodities', url: '#' },
  { category: 'Câmbio', text: 'Dólar recua após decisão do Fed', url: '#' },
  { category: 'Tech', text: 'Tecnologia lidera ganhos no Nasdaq', url: '#' },
  { category: 'Energia', text: 'Petrobras anuncia novos investimentos', url: '#' },
];

export function InfoBar() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hovering = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    }
  }, []);

  const rotateTo = (nextIndex: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setOpacity(0);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setOpacity(1);
      setTransitioning(false);
    }, FADE_DURATION);
  };

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!hovering.current) {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % messages.length;
          rotateTo(next);
          return prev;
        });
      }
    }, ROTATE_INTERVAL);
  };

  useEffect(() => {
    if (!visible) return;
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseEnter = () => {
    hovering.current = true;
  };

  const handleMouseLeave = () => {
    hovering.current = false;
  };

  const handleMessageClick = () => {
    const url = messages[currentIndex].url;
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!visible) return null;

  const msg = messages[currentIndex];

  return (
    <div
      className="w-full border-b border-[#E5E7EB] bg-[#F3F4F6] flex items-center px-3 md:px-4"
      style={{ height: '36px', minHeight: '32px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Content area */}
      <div
        className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer"
        style={{
          opacity,
          transition: `opacity ${FADE_DURATION}ms ease`,
        }}
        onClick={handleMessageClick}
        title={msg.url !== '#' ? 'Abrir notícia' : undefined}
      >
        {/* Category tag — hidden on mobile */}
        <span className="hidden md:inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-500 leading-none">
          {msg.category}
        </span>

        {/* Message text */}
        <span className="text-xs md:text-sm text-slate-600 truncate leading-none">
          {msg.text}
        </span>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        aria-label="Fechar barra de informações"
        className="ml-2 shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
