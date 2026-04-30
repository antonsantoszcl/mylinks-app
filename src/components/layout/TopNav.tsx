'use client';

import { useState, useEffect } from 'react';
import { LogOut, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-sm font-bold text-slate-800 mb-4">Instrucoes</h2>

        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-5">
          {`O conteudo inicial do Painel e uma compilacao dos sites mais acessados no Brasil.\nFunciona como exemplo e tanto pode ser mantido como alterado.\nInclua (+), Arraste (::), Exclua (X) Links e Secoes.\n\nInclua novas secoes com seus links mais usados.\nOrganize sua navegacao.`}
        </p>

        {open && (
          <iframe
            key={open ? 'open' : 'closed'}
            src="https://drive.google.com/file/d/1uAvDq5qZqt8ywpkuG98J_myeeZYPPUh1/preview?autoplay=1&loop=1&mute=1"
            style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: '12px' }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
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
      <header className="h-12 bg-white border-b border-slate-200 shadow-sm flex items-center justify-end px-4 sticky top-0 z-10 gap-2">
        <button
          onClick={() => setInstrucoesOpen(true)}
          className="flex items-center px-3 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-500 hover:text-primary-600 hover:border-primary-400 transition-colors tracking-wider"
        >
          INSTRUCOES
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>

        <Link
          href="/dashboard/settings"
          className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-slate-100 cursor-pointer hover:ring-primary-500 transition-all flex items-center justify-center bg-primary-100"
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
      </header>

      <InstrucoesModal open={instrucoesOpen} onClose={() => setInstrucoesOpen(false)} />
    </>
  );
}
