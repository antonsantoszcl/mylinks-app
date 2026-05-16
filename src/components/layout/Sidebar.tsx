'use client';

import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { getNotoEmojiUrl } from '@/lib/emojiUtils';
import { createPortal } from 'react-dom';
import { useProfile, getInitials } from '@/context/ProfileContext';
import { useDashboards } from '@/context/DashboardsContext';
import { useActiveDashboard } from '@/context/ActiveDashboardContext';
import { useEffect, useRef, useState } from 'react';
import { Dashboard } from '@/lib/types';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const SIDEBAR_KEY = 'mylinks.sidebar.collapsed';

// ── Emoji picker data ─────────────────────────────────────────────────────────

const PANEL_ICONS: { name: string; emoji: string }[] = [
  { name: 'folder',     emoji: '📂' },
  { name: 'pin',        emoji: '📌' },
  { name: 'tasks',      emoji: '✅' },
  { name: 'briefcase',  emoji: '💼' },
  { name: 'gear',       emoji: '⚙️' },
  { name: 'computer',   emoji: '💻' },
  { name: 'robot',      emoji: '🤖' },
  { name: 'bolt',       emoji: '⚡' },
  { name: 'book',       emoji: '📕' },
  { name: 'graduation', emoji: '🎓' },
  { name: 'notes',      emoji: '📝' },
  { name: 'money',      emoji: '💰' },
  { name: 'chart',      emoji: '📈' },
  { name: 'bank',       emoji: '🏦' },
  { name: 'chat',       emoji: '💬' },
  { name: 'cart',       emoji: '🛒' },
  { name: 'globe',      emoji: '🌐' },
  { name: 'people',     emoji: '👥' },
  { name: 'music',      emoji: '🎵' },
  { name: 'film',       emoji: '🎬' },
  { name: 'gaming',     emoji: '🎮' },
  { name: 'tv',         emoji: '📺' },
  { name: 'heart',      emoji: '❤️' },
  { name: 'star',       emoji: '⭐' },
];

const PANEL_EMOJI_MAP: Record<string, string> = Object.fromEntries(
  PANEL_ICONS.map(({ name, emoji }) => [name, emoji])
);

function getPanelEmoji(iconName: string): string {
  if (iconName === 'house') return '🏠';
  return PANEL_EMOJI_MAP[iconName] ?? '⭐';
}

function getIsMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

function renderPanelEmoji(iconName: string, isMobile: boolean) {
  const emoji = getPanelEmoji(iconName);
  if (isMobile) {
    return <span className="text-base leading-none select-none">{emoji}</span>;
  }
  return (
    <img
      src={getNotoEmojiUrl(emoji)}
      alt={emoji}
      className="w-4 h-4 flex-shrink-0"
      draggable={false}
    />
  );
}

// ── Dashboard nav item ────────────────────────────────────────────────────────

function DashboardNavItem({
  dashboard,
  isActive,
  collapsed,
  onRename,
  onDelete,
  onSelect,
  onChangeIcon,
}: {
  dashboard: Dashboard;
  isActive: boolean;
  collapsed: boolean;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onChangeIcon: (id: string, iconName: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(dashboard.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerActiveRef = useRef(false);

  // Mobile sync
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Picker position — double rAF, same pattern as CategoryCard
  useEffect(() => {
    if (!pickerOpen || dashboard.isDefault) {
      setPickerPos(null);
      return;
    }
    const updatePos = () => {
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          setPickerPos({ top: rect.bottom + 6, left: rect.left - 4 });
        }
      }
    };
    let raf1: number;
    let raf2: number;
    raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(updatePos); });
    window.addEventListener('resize', updatePos);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('resize', updatePos);
    };
  }, [pickerOpen, dashboard.isDefault]);

  // Outside-click close — same setTimeout pattern as CategoryCard
  useEffect(() => {
    if (!pickerOpen || dashboard.isDefault) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (!pickerRef.current?.contains(target) && !iconRef.current?.contains(target)) {
        setPickerOpen(false);
      }
    };
    const tid = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler, { passive: true });
    }, 0);
    return () => {
      clearTimeout(tid);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [pickerOpen, dashboard.isDefault]);

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
    setPickerOpen(false);
  };

  const cancelRename = () => {
    setEditValue(dashboard.title);
    setEditing(false);
    setPickerOpen(false);
  };

  // Picker portal — only for non-default panels
  const pickerPortal = !dashboard.isDefault && pickerOpen && pickerPos
    ? createPortal(
        <div
          ref={pickerRef}
          style={{
            position: 'fixed',
            top: pickerPos.top,
            left: pickerPos.left,
            zIndex: 9999,
          }}
          className="bg-white rounded-lg border border-slate-200 shadow-lg p-2"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-6 gap-0.5">
            {PANEL_ICONS.map(({ name, emoji }) => {
              const isSelected = name === dashboard.iconName;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); pickerActiveRef.current = true; }}
                  onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); pickerActiveRef.current = false; onChangeIcon(dashboard.id, name); setPickerOpen(false); }}
                  onTouchStart={(e) => { e.stopPropagation(); pickerActiveRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); pickerActiveRef.current = false; onChangeIcon(dashboard.id, name); setPickerOpen(false); }}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-base ${
                    isSelected ? 'bg-primary-100 ring-1 ring-primary-400' : 'hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  if (collapsed) {
    // Collapsed: clicking the icon navigates — no picker ever
    return (
      <button
        onClick={() => onSelect(dashboard.id)}
        title={dashboard.title}
        className={`flex items-center justify-center py-2 rounded-lg transition-colors w-full ${
          isActive
            ? 'bg-[#EDF1F7] text-slate-700 md:bg-[#f3f7fd] md:text-slate-700'
            : 'text-slate-700 hover:bg-[#EDF1F7] hover:text-slate-700 md:hover:bg-[#f3f7fd] md:hover:text-slate-700'
        }`}
      >
        <div className="flex-shrink-0">
          {renderPanelEmoji(dashboard.isDefault ? 'house' : dashboard.iconName, isMobile)}
        </div>
      </button>
    );
  }

  return (
    <>
      <div className="group flex items-center rounded-lg transition-colors">
        <button
          onClick={() => onSelect(dashboard.id)}
          className={`flex-1 flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-[#EDF1F7] text-slate-700 md:bg-[#f3f7fd] md:text-slate-700'
              : 'text-slate-700 hover:bg-[#EDF1F7] hover:text-slate-700 md:hover:bg-[#f3f7fd] md:hover:text-slate-700'
          }`}
        >
          {/* Icon ref — used by picker position logic */}
          <div ref={iconRef} className="flex-shrink-0">
            {renderPanelEmoji(dashboard.isDefault ? 'house' : dashboard.iconName, isMobile)}
          </div>

          {/* Title: click opens edit + picker (non-default only) */}
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  if (!pickerActiveRef.current) {
                    commitRename();
                  }
                }, 150);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 text-xs rounded border border-primary-300 px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
            />
          ) : (
            <span
              className={`flex-1 text-sm font-medium truncate ${!dashboard.isDefault ? 'cursor-text' : ''}`}
              onClick={!dashboard.isDefault ? (e) => {
                e.stopPropagation();
                setEditing(true);
                setPickerOpen(true);
              } : undefined}
            >
              {dashboard.title}
            </span>
          )}

          {/* Confirm/cancel buttons visible while editing */}
          {editing && (
            <>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => { e.stopPropagation(); commitRename(); }}
                className="p-0.5 text-primary-600 hover:text-primary-700"
                title="Salvar"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => { e.stopPropagation(); cancelRename(); }}
                className="p-0.5 text-slate-400 hover:text-slate-600"
                title="Cancelar"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </button>

        {/* Trash button on hover (non-default, not editing) */}
        {!dashboard.isDefault && !editing && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(dashboard.id); }}
              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {pickerPortal}
    </>
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
  const { dashboards, isLoading: dashLoading, createDashboard, renameDashboard, deleteDashboard, updateDashboardIcon } =
    useDashboards();
  const { activeDashboardId, setActiveDashboard } = useActiveDashboard();
  const initials = getInitials(profile.displayName);
  const [showNewDash, setShowNewDash] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const newDashInputRef = useRef<HTMLInputElement>(null);
  const [pendingDeleteDash, setPendingDeleteDash] = useState<string | null>(null);

  useEffect(() => {
    if (showNewDash) {
      setTimeout(() => newDashInputRef.current?.focus(), 0);
    }
  }, [showNewDash]);

  const handleSelectDashboard = (id: string) => {
    setActiveDashboard(id);
    onClose?.();
  };

  const handleCreateDashboard = async () => {
    const title = newDashName.trim();
    if (!title) return;
    const created = await createDashboard(title);
    setNewDashName('');
    setShowNewDash(false);
    if (created) {
      setActiveDashboard(created.id);
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
    // If deleted dashboard was active, switch to another
    if (activeDashboardId === id) {
      const fallback =
        dashboards.find((d) => d.isDefault && d.id !== id) ??
        dashboards.find((d) => d.id !== id);
      if (fallback) setActiveDashboard(fallback.id);
    }
  };

  const pendingDashTitle = dashboards.find((d) => d.id === pendingDeleteDash)?.title ?? '';

  return (
    <>
      <aside className="flex flex-col h-full">
        {/* Logo + toggle */}
        <div
          className={`flex items-center ${collapsed ? 'justify-center py-3' : 'justify-between px-3 py-3'} border-b border-slate-100/80`}
        >
          {!collapsed && (
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center flex-shrink-0">
                <Globe className="text-white w-3.5 h-3.5" />
              </div>
              alllinks.app
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
              <p className="px-2 pb-1 text-[10px] font-semibold text-slate-400/80 uppercase tracking-widest">
                Paineis
              </p>
              {dashboards.map((d) => (
                <DashboardNavItem
                  key={d.id}
                  dashboard={d}
                  isActive={activeDashboardId === d.id}
                  collapsed={false}
                  onRename={renameDashboard}
                  onDelete={handleDeleteDashboard}
                  onSelect={handleSelectDashboard}
                  onChangeIcon={updateDashboardIcon}
                />
              ))}

              {/* New painel form / button */}
              {showNewDash ? (
                <div className="flex items-center gap-1 px-2 py-1 mt-0.5">
                  <span className="text-base leading-none select-none flex-shrink-0">⭐</span>
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
                  className="flex items-center gap-2 px-2 py-1.5 w-full text-sm text-slate-700 hover:text-[#2F5FD0] hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Painel
                </button>
              )}

              <div className="my-2 border-t border-slate-100/70" />
            </div>
          )}

          {/* Collapsed: show icons for each dashboard */}
          {collapsed && !dashLoading && dashboards.map((d) => (
            <DashboardNavItem
              key={d.id}
              dashboard={d}
              isActive={activeDashboardId === d.id}
              collapsed={true}
              onRename={renameDashboard}
              onDelete={handleDeleteDashboard}
              onSelect={handleSelectDashboard}
              onChangeIcon={updateDashboardIcon}
            />
          ))}
        </nav>


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
        className={`hidden md:flex ${collapsed ? 'w-14' : 'w-56'} bg-white/95 border-r border-slate-100 flex-col h-full shadow-[1px_0_0_0_rgba(0,0,0,0.04)] transition-all duration-200 flex-shrink-0`}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggle} />
      </div>
    </>
  );
}
