'use client';

import { Search, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile, getInitials } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';

export function TopNav() {
  const router = useRouter();
  const { profile } = useProfile();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const initials = getInitials(profile.displayName);

  return (
    <header className="h-12 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar links, tags ou categorias..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
