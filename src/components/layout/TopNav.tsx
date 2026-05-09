'use client';

import { useState, useEffect } from 'react';
import { LogOut, X, Plus, Pencil, GripVertical, ArrowRightLeft, Trash2, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile, getInitials } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';

function VideoOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const video = document.getElementById('instrucoes-overlay-video') as HTMLVideoElement | null;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        style={{ width: '90vw', height: '90vh' }}
        className="relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 transition-colors"
          aria-label="Fechar vídeo"
        >
          <X className="w-5 h-5" />
        </button>
        <video
          id="instrucoes-overlay-video"
          src="/videos/instrucoes.mp4"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          autoPlay
          loop
          controls
          playsInline
        />
      </div>
    </div>
  );
}

const ICONS_LEGEND = [
  { icon: Plus,           label: 'Inclui',    desc: 'Adiciona novo link ou seção' },
  { icon: Pencil,         label: 'Edita',     desc: 'Altera nome ou URL' },
  { icon: GripVertical,   label: 'Arrasta',   desc: 'Reordena por arrastar e soltar' },
  { icon: ArrowRightLeft, label: 'Transfere', desc: 'Move para outra seção ou painel' },
  { icon: Trash2,         label: 'Deleta',    desc: 'Remove permanentemente' },
];

function InstrucoesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with branding */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center shadow-sm flex-shrink-0">
              <Globe className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight tracking-tight">alllinks.app</h1>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">Instruções de uso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — 2-column layout */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Left column: intro + icons legend */}
          <div className="space-y-5">
            {/* Intro */}
            <div className="space-y-1.5">
              <p className="text-sm text-slate-700 leading-relaxed">
                O conteúdo inicial do Painel é uma compilação dos sites mais acessados no Brasil.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Pode ser mantido, alterado ou excluído conforme sua preferência.
              </p>
            </div>

            {/* Icons legend */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ícones — Links &amp; Seções
              </p>
              <div className="space-y-1.5">
                {ICONS_LEGEND.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600 flex-shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: video CTA */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/40 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">Vídeo explicativo</p>
                <p className="text-xs text-slate-500 leading-relaxed">Veja como usar todos os recursos do painel em poucos minutos.</p>
              </div>
              <button
                onClick={() => setVideoOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Assistir agora
              </button>
            </div>

            {/* "E pronto" closing note */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">E pronto!</span> É só usar — seu painel está sempre sincronizado e disponível em{' '}
                <span className="font-medium text-primary-600">qualquer dispositivo</span>.
              </p>
            </div>
          </div>

        </div>
      </div>

      <VideoOverlay open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}

export function TopNav() {
  const router = useRouter();
  const { profile } = useProfile();
  const { logout } = useAuth();
  const [instrucoesOpen, setInstrucoesOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const initials = getInitials(profile.displayName);

  return (
    <>
      {/* Top-right controls — normal flow on mobile (inline in top bar), fixed on desktop */}
      <div className="flex items-center gap-2 px-3 py-3 md:p-0 md:fixed md:top-2 md:right-3 md:z-20">
        <button
          onClick={() => setInstrucoesOpen(true)}
          className="flex items-center px-2.5 sm:px-3 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-500 hover:text-primary-600 hover:border-primary-400 transition-colors tracking-wider bg-white/90 backdrop-blur-sm shadow-sm min-h-[36px]"
        >
          INSTRUÇÕES
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 bg-white/90 backdrop-blur-sm shadow-sm min-h-[36px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>

        <Link
          href="/dashboard/settings"
          className="w-8 h-8 sm:w-7 sm:h-7 rounded-full overflow-hidden ring-2 ring-slate-100 cursor-pointer hover:ring-primary-500 transition-all flex items-center justify-center bg-primary-100 shadow-sm"
          title="Configuracoes de perfil"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-xs font-bold text-primary-600">{initials}</span>
          )}
        </Link>
      </div>

      <InstrucoesModal open={instrucoesOpen} onClose={() => setInstrucoesOpen(false)} />
    </>
  );
}
