'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface InstrucoesState {
  instrucoesOpen: boolean;
  videoOpen: boolean;
  openInstrucoes: () => void;
  closeInstrucoes: () => void;
  openVideo: () => void;
  closeVideo: () => void;
}

const InstrucoesContext = createContext<InstrucoesState | null>(null);

export function InstrucoesProvider({ children }: { children: ReactNode }) {
  const [instrucoesOpen, setInstrucoesOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const openInstrucoes = useCallback(() => setInstrucoesOpen(true), []);
  const closeInstrucoes = useCallback(() => setInstrucoesOpen(false), []);
  const openVideo = useCallback(() => setVideoOpen(true), []);
  const closeVideo = useCallback(() => setVideoOpen(false), []);

  return (
    <InstrucoesContext.Provider value={{ instrucoesOpen, videoOpen, openInstrucoes, closeInstrucoes, openVideo, closeVideo }}>
      {children}
    </InstrucoesContext.Provider>
  );
}

export function useInstrucoes() {
  const ctx = useContext(InstrucoesContext);
  if (!ctx) throw new Error('useInstrucoes must be used within InstrucoesProvider');
  return ctx;
}
