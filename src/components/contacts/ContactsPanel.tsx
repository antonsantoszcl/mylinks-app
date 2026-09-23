'use client';

import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useContacts } from '@/context/ContactsContext';
import { useActiveDashboard } from '@/context/ActiveDashboardContext';
import { ContactCard } from './ContactCard';
import { ContactForm } from './ContactForm';
import { Contact } from '@/lib/types';
import { getNotoEmojiUrl } from '@/lib/emojiUtils';
import {
  GripVertical,
  Inbox,
  Mail,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getEmailComposeUrl } from './MiniCard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// ── Color palette — mirrors CATEGORY_COLORS from CategoryCard ─────────────────
const SECTION_COLORS = [
  { insetColor: 'rgba(251, 188, 5, 0.38)',   insetColorMobile: 'rgba(251, 188, 5, 0.50)',   accentText: '#78716C' },
  { insetColor: 'rgba(52, 168, 120, 0.22)',  insetColorMobile: 'rgba(52, 168, 120, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(234, 126, 60, 0.22)',  insetColorMobile: 'rgba(234, 126, 60, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(24, 119, 242, 0.22)',  insetColorMobile: 'rgba(24, 119, 242, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(101, 183, 72, 0.22)',  insetColorMobile: 'rgba(101, 183, 72, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(236, 100, 140, 0.22)', insetColorMobile: 'rgba(236, 100, 140, 0.38)', accentText: '#78716C' },
];

// FREQUENTES always uses the golden color (index 0)
const FREQUENT_COLOR = SECTION_COLORS[0];

function getIsMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

// ── Emoji picker data — same array as CategoryCard ────────────────────────────
const PICKER_ICONS: { name: string; emoji: string }[] = [
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

const EMOJI_MAP: Record<string, string> = Object.fromEntries(
  PICKER_ICONS.map(({ name, emoji }) => [name, emoji])
);

function getSectionEmoji(iconName: string): string {
  return EMOJI_MAP[iconName] ?? '⭐';
}

function getTwemojiUrl(emoji: string): string {
  const cp = Array.from(emoji)
    .map((c) => c.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')
    .replace(/-fe0f$/, '')
    .replace(/-fe0f-/, '-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${cp}.svg`;
}

function getEmojiUrl(emoji: string): string {
  return getNotoEmojiUrl(emoji);
}

// ── Section card header with inline rename + emoji picker ─────────────────────

interface SectionCardHeaderProps {
  title: string;
  iconName: string;
  isFrequents?: boolean;
  accentText: string;
  contacts: Contact[];
  userEmail: string;
  onRename?: (newTitle: string) => void;
  onIconChange?: (iconName: string) => void;
  onDelete?: () => void;
  onAddContact?: () => void;
  onDragHandleMouseDown?: (e: React.MouseEvent) => void;
}

function SectionCardHeader({
  title,
  iconName,
  isFrequents,
  accentText: _accentText,
  contacts,
  userEmail,
  onRename,
  onIconChange,
  onDelete,
  onAddContact,
  onDragHandleMouseDown,
}: SectionCardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerActiveRef = useRef(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => { setDraft(title); }, [title]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  // Calculate picker position when editing (double rAF, same as CategoryCard)
  useEffect(() => {
    if (!editing || !onIconChange) {
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
  }, [editing, onIconChange]);

  // Outside-click to close (same setTimeout pattern as CategoryCard)
  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const insidePicker = pickerRef.current?.contains(target);
      const insideInput = inputRef.current?.contains(target);
      const insideIcon = iconRef.current?.contains(target);
      if (!insidePicker && !insideInput && !insideIcon) {
        save();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const save = () => {
    const clean = draft.trim();
    if (clean && clean !== title && onRename) {
      onRename(clean);
    } else {
      setDraft(title);
    }
    setEditing(false);
  };

  const handlePickEmoji = (name: string) => {
    pickerActiveRef.current = false;
    onIconChange?.(name);
  };

  const handleSendGroupEmail = () => {
    const emails = contacts
      .map((c) => c.email)
      .filter((e): e is string => !!e && e.trim() !== '');
    if (emails.length === 0) {
      alert('Nenhum contato nesta seção possui email cadastrado.');
      return;
    }
    const bccList = emails.join(',');
    const { url } = getEmailComposeUrl(userEmail, '');
    // Build BCC URL based on provider
    let composeUrl: string;
    if (url.includes('mail.google.com')) {
      composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bccList)}`;
    } else if (url.includes('outlook.live.com')) {
      composeUrl = `https://outlook.live.com/mail/0/deeplink/compose?bcc=${encodeURIComponent(bccList)}`;
    } else if (url.includes('compose.mail.yahoo.com')) {
      composeUrl = `https://compose.mail.yahoo.com/?bcc=${encodeURIComponent(bccList)}`;
    } else {
      // mailto fallback
      composeUrl = `mailto:?bcc=${encodeURIComponent(bccList)}`;
    }
    if (composeUrl.startsWith('mailto:')) {
      window.location.href = composeUrl;
    } else {
      window.open(composeUrl, '_blank');
    }
  };

  const pickerPortal = editing && onIconChange && pickerPos
    ? createPortal(
        <div
          ref={pickerRef}
          style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 9999 }}
          className="bg-white rounded-lg border border-slate-200 shadow-lg p-2"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-6 gap-0.5">
            {PICKER_ICONS.map(({ name, emoji }) => {
              const isSelected = name === iconName;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); pickerActiveRef.current = true; }}
                  onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); handlePickEmoji(name); }}
                  onTouchStart={(e) => { e.stopPropagation(); pickerActiveRef.current = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handlePickEmoji(name); }}
                  className={`flex items-center justify-center w-9 h-9 rounded transition-colors ${
                    isSelected ? 'bg-blue-50 ring-2 ring-blue-300 ring-offset-1' : 'hover:bg-gray-100'
                  }`}
                >
                  {isMobile ? (
                    <span className="text-lg select-none">{emoji}</span>
                  ) : (
                    <img
                      src={getEmojiUrl(emoji)}
                      alt={name}
                      className="w-5 h-5 select-none"
                      draggable={false}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = getTwemojiUrl(emoji); }
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <header className="flex items-center justify-between px-3 py-2.5 md:py-2 rounded-t-xl md:rounded-t-[10px]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Emoji icon — shown for all sections; clickable (opens picker) only for user sections */}
          <div
            ref={iconRef}
            className={`flex-shrink-0 p-1 flex items-center justify-center ${isFrequents ? '' : 'cursor-pointer'}`}
            onClick={() => { if (!isFrequents && onRename) setEditing(true); }}
          >
            {isMobile ? (
              <span className="select-none leading-none" style={{ fontSize: '1rem', lineHeight: 1 }}>
                {getSectionEmoji(iconName)}
              </span>
            ) : (
              <img
                src={getEmojiUrl(getSectionEmoji(iconName))}
                alt=""
                className="w-4 h-4 select-none"
                draggable={false}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = getTwemojiUrl(getSectionEmoji(iconName)); }
                }}
              />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            {editing && onRename ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  setTimeout(() => {
                    if (!pickerActiveRef.current) save();
                  }, 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') save();
                  if (e.key === 'Escape') { setDraft(title); setEditing(false); }
                }}
                className="text-xs font-semibold text-slate-800 border border-primary-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-300 w-full bg-white uppercase"
              />
            ) : (
              <h3
                className={`text-sm md:text-[13px] font-semibold truncate text-slate-700 tracking-tight ${onRename ? 'cursor-text' : ''}`}
                style={{ textTransform: 'uppercase' }}
                onClick={() => { if (onRename) setEditing(true); }}
              >
                {title}
              </h3>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0">
          {/* @ Email group button */}
          <button
            className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
            aria-label="Enviar email para todos da seção"
            title="Enviar email para todos da seção"
            onClick={handleSendGroupEmail}
          >
            <Mail className="w-5 h-5 md:w-3.5 md:h-3.5" />
          </button>
          {onAddContact && (
            <button
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:bg-white/60 rounded transition-colors"
              aria-label="Adicionar contato"
              onClick={onAddContact}
            >
              <Plus className="w-5 h-5 md:w-3.5 md:h-3.5" />
            </button>
          )}
          {onRename && !editing && (
            <button
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors md:hidden"
              onClick={() => setEditing(true)}
              aria-label="Editar seção"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
          {!isFrequents && onDragHandleMouseDown && (
            <div
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-300 transition-colors cursor-grab active:cursor-grabbing rounded"
              aria-label="Arrastar seção"
              style={{ touchAction: 'none' }}
              onMouseDown={onDragHandleMouseDown}
            >
              <GripVertical className="w-5 h-5 md:w-3.5 md:h-3.5" />
            </div>
          )}
          {onDelete && (
            <button
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={() => setShowDeleteModal(true)}
              aria-label="Excluir seção"
            >
              <Trash2 className="w-5 h-5 md:w-3 md:h-3" />
            </button>
          )}
        </div>
      </header>
      {pickerPortal}
      {onDelete && (
        <ConfirmModal
          open={showDeleteModal}
          title="Excluir seção"
          message={`Remover a seção "${title}" e todos os contatos dentro dela?`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete();
          }}
        />
      )}
    </>
  );
}

// ── Single section card ───────────────────────────────────────────────────────

interface ContactSectionCardProps {
  title: string;
  iconName: string;
  contacts: Contact[];
  colorIndex: number;
  isFrequents?: boolean;
  userEmail: string;
  onRename?: (newTitle: string) => void;
  onIconChange?: (iconName: string) => void;
  onDelete?: () => void;
  onAddContact?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLElement>) => void;
  onDragOver?: (e: DragEvent<HTMLElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLElement>) => void;
  onDrop?: (e: DragEvent<HTMLElement>) => void;
  draggable?: boolean;
}

function ContactSectionCard({
  title,
  iconName,
  contacts,
  colorIndex,
  isFrequents,
  userEmail,
  onRename,
  onIconChange,
  onDelete,
  onAddContact,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  draggable,
}: ContactSectionCardProps) {
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const color = isFrequents ? FREQUENT_COLOR : SECTION_COLORS[colorIndex % SECTION_COLORS.length];
  const dragFromHandle = useRef(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <article
      draggable={draggable && !isFrequents}
      onDragStart={(e) => {
        if (!dragFromHandle.current) { e.preventDefault(); return; }
        onDragStart?.(e);
      }}
      onDragEnd={(e) => { dragFromHandle.current = false; onDragEnd?.(e); }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="rounded-[10px] md:rounded-[10px] flex flex-col group category-card hover:-translate-y-0.5"
      style={{
        border: '1px solid #E5E7EB',
        backgroundColor: isDragOver ? 'rgba(235, 242, 255, 0.6)' : '#FFFFFF',
        boxShadow: `inset ${isMobile ? '3px' : '2px'} 0 0 ${isMobile ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.22)'}, 0 6px 16px rgba(0,0,0,0.05)`,
        transition: 'all 0.2s ease-out',
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (isDragging || isDragOver) return;
        e.currentTarget.style.boxShadow = `inset ${isMobile ? '3px' : '2px'} 0 0 ${isMobile ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.22)'}, 0 8px 24px rgba(0,0,0,0.10)`;
      }}
      onMouseLeave={(e) => {
        if (isDragging || isDragOver) return;
        e.currentTarget.style.boxShadow = `inset ${isMobile ? '3px' : '2px'} 0 0 ${isMobile ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.22)'}, 0 6px 16px rgba(0,0,0,0.05)`;
      }}
    >
      <SectionCardHeader
        title={title}
        iconName={iconName}
        isFrequents={isFrequents}
        accentText={color.accentText}
        contacts={contacts}
        userEmail={userEmail}
        onRename={onRename}
        onIconChange={onIconChange}
        onDelete={onDelete}
        onAddContact={onAddContact}
        onDragHandleMouseDown={draggable && !isFrequents ? (_e) => { dragFromHandle.current = true; } : undefined}
      />

      <div className="mx-2 rounded-[10px] md:rounded-[10px] flex-1 overflow-y-auto custom-scrollbar p-2.5 card-body-inner">
        {contacts.length > 0 ? (
          <>
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} isInFrequentes={isFrequents} />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-16 text-slate-400 gap-1">
            <Inbox className="w-5 h-5 opacity-20" />
            <p className="text-xs">
              {isFrequents ? 'Nenhum contato frequente' : 'Nenhum contato'}
            </p>
          </div>
        )}
      </div>

      {isFrequents ? (
        <div className="mx-2 mb-2 mt-1 px-3 py-2 text-center">
          <p className="text-[12px] md:text-[10px] text-slate-500 md:text-[#78716C] italic whitespace-nowrap">Assinale frequente ao incluir um contato</p>
        </div>
      ) : onAddContact && (
        <div className="mx-2 mb-2 mt-1 px-2 py-1.5 rounded-b-xl">
          <button
            type="button"
            className="text-sm md:text-xs font-medium hover:opacity-75 transition-opacity flex items-center gap-1 min-h-[24px] md:min-h-0 py-0.5 md:py-0"
            style={{ color: color.accentText }}
            onClick={onAddContact}
          >
            <Plus className="w-3 h-3" />
            Adicionar contato
          </button>
        </div>
      )}
    </article>
  );
}

// ── Add-section card ──────────────────────────────────────────────────────────

interface AddSectionCardProps {
  onCreate: (title: string, iconName: string) => void;
}

function AddSectionCard({ onCreate }: AddSectionCardProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Picker position — double rAF
  useEffect(() => {
    if (!pickerOpen) { setPickerPos(null); return; }
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
  }, [pickerOpen]);

  // Outside-click close
  useEffect(() => {
    if (!pickerOpen) return;
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
  }, [pickerOpen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onCreate(value.trim(), selectedIcon);
    setValue('');
    setSelectedIcon('star');
    setOpen(false);
    setPickerOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setValue('');
    setSelectedIcon('star');
    setPickerOpen(false);
  };

  const emoji = getSectionEmoji(selectedIcon);

  const pickerPortal = pickerOpen && pickerPos
    ? createPortal(
        <div
          ref={pickerRef}
          style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 9999 }}
          className="bg-white rounded-lg border border-slate-200 shadow-lg p-2"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-6 gap-0.5">
            {PICKER_ICONS.map(({ name, emoji: ep }) => {
              const isSelected = name === selectedIcon;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedIcon(name); setPickerOpen(false); }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedIcon(name); setPickerOpen(false); }}
                  className={`flex items-center justify-center w-9 h-9 rounded transition-colors ${
                    isSelected ? 'bg-blue-50 ring-2 ring-blue-300 ring-offset-1' : 'hover:bg-gray-100'
                  }`}
                >
                  {isMobile ? (
                    <span className="text-lg select-none">{ep}</span>
                  ) : (
                    <img
                      src={getEmojiUrl(ep)}
                      alt={name}
                      className="w-5 h-5 select-none"
                      draggable={false}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = getTwemojiUrl(ep); }
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <article
        className="rounded-2xl border border-dashed border-slate-200/80 p-2 flex flex-col hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out"
        style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
      >
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Nova seção</span>
          </button>
        ) : (
          <form onSubmit={submit} className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800">Nova seção</h3>
            {/* Icon selector + title input */}
            <div className="flex items-center gap-2">
              <div
                ref={iconRef}
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0"
                onClick={() => setPickerOpen((v) => !v)}
                title="Escolher ícone"
              >
                {isMobile ? (
                  <span className="text-base select-none leading-none">{emoji}</span>
                ) : (
                  <img
                    src={getEmojiUrl(emoji)}
                    alt=""
                    className="w-5 h-5 select-none"
                    draggable={false}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = getTwemojiUrl(emoji); }
                    }}
                  />
                )}
              </div>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nome da seção"
                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-300 uppercase"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 min-h-[44px] md:min-h-0"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-2 py-1 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700 min-h-[44px] md:min-h-0"
              >
                Criar
              </button>
            </div>
          </form>
        )}
      </article>
      {pickerPortal}
    </>
  );
}

// ── Masonry grid ──────────────────────────────────────────────────────────────

const GAP = 16;

function getColumnCount(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

interface ItemLayout {
  top: number;
  left: number;
  width: number;
}

interface ContactGridProps {
  children: React.ReactNode[];
}

function ContactGrid({ children }: ContactGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layouts, setLayouts] = useState<ItemLayout[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [measured, setMeasured] = useState(false);
  const total = children.length;

  const calculateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    if (containerWidth === 0) return;

    const numCols = getColumnCount(containerWidth);
    const colWidth = (containerWidth - GAP * (numCols - 1)) / numCols;
    const colHeights = new Array(numCols).fill(0) as number[];
    const newLayouts: ItemLayout[] = [];

    for (let i = 0; i < total; i++) {
      const el = itemRefs.current[i];
      const itemHeight = el ? el.offsetHeight : 0;
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[shortestCol];
      const left = shortestCol * (colWidth + GAP);
      newLayouts.push({ top, left, width: colWidth });
      colHeights[shortestCol] += itemHeight + GAP;
    }

    const maxHeight = Math.max(...colHeights) - GAP;
    setLayouts(newLayouts);
    setContainerHeight(maxHeight > 0 ? maxHeight : 0);
    setMeasured(true);
  }, [total]);

  useEffect(() => {
    const id = setTimeout(calculateLayout, 0);
    return () => clearTimeout(id);
  }, [calculateLayout, children]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => calculateLayout());
    ro.observe(container);
    return () => ro.disconnect();
  }, [calculateLayout]);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative w-full"
        style={{
          height: measured ? containerHeight : 'auto',
          opacity: measured ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {children.map((child, index) => {
          const layout = layouts[index];
          return (
            <div
              key={index}
              ref={(el) => { itemRefs.current[index] = el; }}
              style={
                layout
                  ? { position: 'absolute', top: layout.top, left: layout.left, width: layout.width, transition: 'top 0.3s ease, left 0.3s ease' }
                  : { width: '100%' }
              }
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ContactsPanel() {
  const {
    sections,
    contacts,
    isLoading,
    createSection,
    renameSection,
    updateSectionIcon,
    deleteSection,
    reorderSections,
  } = useContacts();
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const {
    data,
  } = useActiveDashboard();
  const [addContactFor, setAddContactFor] = useState<string | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const frequentContacts = contacts
    .filter((c) => c.isFrequent)
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragStart = useCallback((id: string) => (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((id: string) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) setDragOverId(id);
  }, [draggingId]);

  const handleDragLeave = useCallback((id: string) => (e: DragEvent<HTMLElement>) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverId((prev) => (prev === id ? null : prev));
    }
  }, []);

  const handleDrop = useCallback((targetId: string) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const ids = sortedSections.map((s) => s.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, sourceId);
    setDraggingId(null);
    setDragOverId(null);
    reorderSections(reordered);
  }, [sortedSections, reorderSections]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const frequentesCard = (
    <ContactSectionCard
      key="frequentes"
      title="Contatos Frequentes"
      iconName="star"
      contacts={frequentContacts}
      colorIndex={0}
      isFrequents
      userEmail={userEmail}
    />
  );

  const sectionCards = sortedSections.map((section, idx) => {
    const sectionContacts = contacts
      .filter((c) => c.sectionId === section.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <ContactSectionCard
        key={section.id}
        title={section.title}
        iconName={section.iconName}
        contacts={sectionContacts}
        colorIndex={(idx + 1) % SECTION_COLORS.length}
        userEmail={userEmail}
        onRename={(t) => renameSection(section.id, t)}
        onIconChange={(name) => updateSectionIcon(section.id, name)}
        onDelete={() => deleteSection(section.id)}
        onAddContact={() => setAddContactFor(section.id)}
        draggable
        isDragging={draggingId === section.id}
        isDragOver={dragOverId === section.id}
        onDragStart={handleDragStart(section.id)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver(section.id)}
        onDragLeave={handleDragLeave(section.id)}
        onDrop={handleDrop(section.id)}
      />
    );
  });

  const addCard = (
    <AddSectionCard
      key="add"
      onCreate={(title, iconName) => createSection(title, iconName)}
    />
  );

  const gridItems = [frequentesCard, ...sectionCards, addCard];

  return (
    <div className="max-w-full space-y-6 pb-8">
      <section>
        <ContactGrid>
          {gridItems}
        </ContactGrid>
      </section>

      {addContactFor && (
        <ContactForm
          sectionId={addContactFor}
          onClose={() => setAddContactFor(null)}
        />
      )}
    </div>
  );
}
