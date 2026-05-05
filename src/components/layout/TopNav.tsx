'use client';

import { useState, useEffect } from 'react';
import { LogOut, X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile, getInitials } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';

function InstrucoesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Instruções</h2>
            <p className="text-xs text-slate-400 mt-0.5">Como usar o Painel</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">

          {/* Intro section */}
          <div className="space-y-1.5">
            <p className="text-sm text-slate-700 leading-relaxed">
              O conteúdo inicial do Painel é uma compilação dos sites mais acessados no Brasil.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pode ser mantido, alterado ou excluído.
            </p>
          </div>

          {/* Icons legend */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Para links e Seções
            </p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm text-slate-700 font-medium">Inclui</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
                  <GripVertical className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm text-slate-700 font-medium">Arrasta</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm text-slate-700 font-medium">Deleta</span>
              </div>
            </div>
          </div>

          {/* Closing text */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">E pronto!</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Amplie o vídeo abaixo para entender como funciona.
            </p>
          </div>

          {/* Video */}
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <video
              key="instrucoes-video"
              src="/videos/instrucoes.mp4"
              style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'cover' }}
              autoPlay
              loop
              muted
              playsInline
              controls
            />
          </div>

        </div>
      </div>
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
