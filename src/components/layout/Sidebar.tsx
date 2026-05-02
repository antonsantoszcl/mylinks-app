'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe,
  Star,
  Clock,
  Tags,
  FileText,
  Settings,
  CreditCard,
  Zap,
  ChevronRight,
  ChevronLeft,
  Home,
  LayoutDashboard,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useProfile, getInitials } from '@/context/ProfileContext';
import { useDashboards } from '@/context/DashboardsContext';
import { useEffect, useRef, useState } from 'react';
import { Dashboard } from '@/lib/types';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const secondaryItems = [
  // { icon: Settings, label: 'Configuracoes', href: '/dashboard/settings', inactive: false, hidden: true },
  { icon: CreditCard, label: 'Assinatura', href: '/assinatura', inactive: true, hidden: false },
];

const SIDEBAR_KEY = 'mylinks.sidebar.collapsed';

// ── Dashboard nav item ────────────────────────────────────────────────────────

function DashboardNavItem({
  dashboard,
  isActive,
  collapsed,
  onRename,
  onDelete,
}: {
  dashboard: Dashboard;
  isActive: boolean;
  collapsed: boolean;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(dashboard.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setEditValue(dashboard.title);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, dashboard.title]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== dashboard.title) {
      onRename(dashboard.id, trimmed);
    }
    setEditing(false);
  };

  const cancelRename = () => {
    setEditValue(dashboard.title);
    setEditing(false);
  };

  const DashIcon = dashboard.isDefault ? Home : LayoutDashboard;

  if (collapsed) {
    return (
      <Link
        href={`/dashboard/${dashboard.id}`}
        title={dashboard.title}
        className={`flex items-center justify-center py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-[#2F5FD0] bg-[rgba(47,95,208,0.10)]'
            : 'text-[#6B7280] hover:bg-slate-50 hover:text-[#2F5FD0]'
        }`}
      >
        <DashIcon className="w-4 h-4 flex-shrink-0" />
      </Link>
    );
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <DashIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') cancelRename();
          }}
          className="flex-1 min-w-0 text-xs rounded border border-primary-300 px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
        />
        <button
          onClick={commitRename}
          className="p-0.5 text-primary-600 hover:text-primary-700"
          title="Salvar"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={cancelRename}
          className="p-0.5 text-slate-400 hover:text-slate-600"
          title="Cancelar"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center rounded-lg transition-colors">
      <Link
        href={`/dashboard/${dashboard.id}`}
        className={`flex-1 flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-[#2F5FD0] bg-[rgba(47,95,208,0.10)]'
            : 'text-[#6B7280] hover:bg-slate-50 hover:text-[#2F5FD0]'
        }`}
      >
        <DashIcon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{dashboard.title}</span>
      </Link>
      {!dashboard.isDefault && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded text-slate-400 hover:text-[#2F5FD0] hover:bg-[rgba(47,95,208,0.08)] transition-colors"
            title="Renomear"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(dashboard.id)}
            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar inner content (shared between mobile drawer and desktop) ──────────

function SidebarContent({
  collapsed,
  onToggle,
  onClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  const { profile } = useProfile();
  const { dashboards, isLoading: dashLoading, createDashboard, renameDashboard, deleteDashboard } =
    useDashboards();
  const initials = getInitials(profile.displayName);
  const [showNewDash, setShowNewDash] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const newDashInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [pendingDeleteDash, setPendingDeleteDash] = useState<string | null>(null);

  const publicHref = profile.username ? `/${profile.username}` : '/me';

  const otherNavItems = [
    { icon: Star, label: 'Favoritos', href: '/favoritos', inactive: true, hidden: false },
    { icon: Clock, label: 'Recentes', href: '/recentes', inactive: true, hidden: false },
    { icon: Tags, label: 'Tags', href: '/tags', inactive: true, hidden: false },
    { icon: FileText, label: 'Templates', href: '/templates', inactive: true, hidden: false },
  ];

  useEffect(() => {
    if (showNewDash) {
      setTimeout(() => newDashInputRef.current?.focus(), 0);
    }
  }, [showNewDash]);

  const handleCreateDashboard = async () => {
    const title = newDashName.trim();
    if (!title) return;
    const created = await createDashboard(title);
    setNewDashName('');
    setShowNewDash(false);
    if (created) {
      router.push(`/dashboard/${created.id}`);
      onClose?.();
    }
  };

  const handleDeleteDashboard = (id: string) => {
    setPendingDeleteDash(id);
  };

  const confirmDeleteDashboard = async () => {
    if (!pendingDeleteDash) return;
    const id = pendingDeleteDash;
    setPendingDeleteDash(null);
    await deleteDashboard(id);
    if (pathname === `/dashboard/${id}`) {
      const defaultDash =
        dashboards.find((d) => d.isDefault && d.id !== id) ??
        dashboards.find((d) => d.id !== id);
      if (defaultDash) {
        router.push(`/dashboard/${defaultDash.id}`);
      }
    }
  };

  const pendingDashTitle = dashboards.find((d) => d.id === pendingDeleteDash)?.title ?? '';

  return (
    <>
      <aside className="flex flex-col h-full">
        {/* Logo + toggle */}
        <div
          className={`flex items-center ${collapsed ? 'justify-center py-3' : 'justify-between px-3 py-3'} border-b border-slate-100`}
        >
          {!collapsed && (
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center flex-shrink-0">
                <Globe className="text-white w-3.5 h-3.5" />
              </div>
              MyLinks
            </h1>
          )}
          {collapsed && (
            <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center">
              <Globe className="text-white w-3.5 h-3.5" />
            </div>
          )}
          {/* Desktop collapse button */}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-[#2F5FD0] hover:bg-slate-100 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {/* Mobile close button (always shown when drawer is open) */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed (desktop only) */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="hidden md:flex mt-1 mx-auto p-1 rounded-md text-slate-400 hover:text-[#2F5FD0] hover:bg-slate-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <nav className="flex-1 px-2 pt-2 space-y-0.5 overflow-y-auto">
          {/* ── Paineis section ─────────────────────────── */}
          {!collapsed && !dashLoading && (
            <div className="mb-1">
              <p className="px-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Paineis
              </p>
              {dashboards.map((d) => (
                <DashboardNavItem
                  key={d.id}
                  dashboard={d}
                  isActive={pathname === `/dashboard/${d.id}`}
                  collapsed={false}
                  onRename={renameDashboard}
                  onDelete={handleDeleteDashboard}
                />
              ))}

              {/* New painel form / button */}
              {showNewDash ? (
                <div className="flex items-center gap-1 px-2 py-1 mt-0.5">
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <input
                    ref={newDashInputRef}
                    value={newDashName}
                    onChange={(e) => setNewDashName(e.target.value)}
                    placeholder="Nome do painel"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateDashboard();
                      if (e.key === 'Escape') {
                        setShowNewDash(false);
                        setNewDashName('');
                      }
                    }}
                    className="flex-1 min-w-0 text-xs rounded border border-primary-300 px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <button
                    onClick={handleCreateDashboard}
                    className="p-0.5 text-primary-600 hover:text-primary-700"
                    title="Criar"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { setShowNewDash(false); setNewDashName(''); }}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                    title="Cancelar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewDash(true)}
                  className="flex items-center gap-2 px-2 py-1.5 w-full text-xs text-[#6B7280] hover:text-[#2F5FD0] hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Painel
                </button>
              )}

              <div className="my-2 border-t border-slate-100" />
            </div>
          )}

          {/* Collapsed: show icons for each dashboard */}
          {collapsed && !dashLoading && dashboards.map((d) => (
            <DashboardNavItem
              key={d.id}
              dashboard={d}
              isActive={pathname === `/dashboard/${d.id}`}
              collapsed={true}
              onRename={renameDashboard}
              onDelete={handleDeleteDashboard}
            />
          ))}

          {/* ── Other nav items ─────────────────────────────── */}
          {otherNavItems.filter((item) => !item.hidden).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-2'} py-2 rounded-lg transition-colors ${
                item.inactive
                  ? 'text-gray-300 cursor-default pointer-events-none'
                  : 'text-[#6B7280] hover:bg-slate-50 hover:text-[#2F5FD0]'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          ))}

          <div className="my-2 border-t border-slate-100" />

          {secondaryItems.filter((item) => !item.hidden).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-2'} py-2 rounded-lg transition-colors ${
                item.inactive
                  ? 'text-gray-300 cursor-default pointer-events-none'
                  : 'text-[#6B7280] hover:bg-slate-50 hover:text-[#2F5FD0]'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={`${collapsed ? 'px-1 py-2' : 'px-2 py-2'} border-t border-slate-100 space-y-2`}>
          <Link
            href="/dashboard/settings"
            title={collapsed ? profile.displayName : undefined}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-2'} py-2 rounded-lg hover:bg-slate-50 transition-colors group`}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-slate-100 group-hover:ring-slate-200 transition-all flex items-center justify-center bg-slate-100 flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-[#2F5FD0]">{initials}</span>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {profile.displayName || '...'}
                </p>
                <p className="text-xs text-slate-400">Ver perfil</p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#2F5FD0]" />
                <h4 className="text-xs font-semibold text-slate-700">Assine o Pro</h4>
              </div>
              <p className="text-xs text-slate-500 mb-2">Desbloqueie recursos avancados.</p>
              <button className="w-full bg-[#2F5FD0] text-white rounded-md py-1.5 text-xs font-medium hover:bg-[#1E40AF] transition-colors">
                Fazer upgrade
              </button>
            </div>
          )}
        </div>
      </aside>

      <ConfirmModal
        open={pendingDeleteDash !== null}
        title="Excluir Painel"
        message={`Excluir o painel "${pendingDashTitle}"? As seções dentro dele tambem serao removidas.`}
        onCancel={() => setPendingDeleteDash(null)}
        onConfirm={confirmDeleteDashboard}
      />
    </>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({
  mobileOpen,
  onMobileOpenChange,
}: {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored !== null) setCollapsed(stored === 'true');
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => onMobileOpenChange(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          collapsed={false}
          onToggle={() => {}}
          onClose={() => onMobileOpenChange(false)}
        />
      </div>

      {/* ── Desktop sidebar ── */}
      <div
        className={`hidden md:flex ${collapsed ? 'w-14' : 'w-56'} bg-white border-r border-slate-200 flex-col h-full shadow-sm transition-all duration-200 flex-shrink-0`}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggle} />
      </div>
    </>
  );
}
