import { Category, Dashboard, Link as LinkType } from '@/lib/types';
import { getNotoEmojiUrl } from '@/lib/emojiUtils';
import { SortableLinkItem } from './SortableLinkItem';
import { Plus, GripVertical, FolderOutput, Trash2, Inbox } from 'lucide-react';
import { createPortal } from 'react-dom';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  PointerSensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// Custom PointerSensor that refuses to activate when the pointer is on an
// element (or ancestor) marked with data-no-dnd="true". This prevents the
// inner link-reorder DndContext from stealing events that start on the
// category drag handle, which — even though it lives outside this inner
// context's DOM subtree — still triggers the shared document-level listener.
class NoDndPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: (
        { nativeEvent: event }: { nativeEvent: PointerEvent },
        _options: PointerSensorOptions,
      ) => {
        let el: Element | null = event.target as Element;
        while (el) {
          if (el.getAttribute?.('data-no-dnd') === 'true') return false;
          el = el.parentElement;
        }
        return true;
      },
    },
  ];
}

class NoDndTouchSensor extends TouchSensor {
  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: (
        { nativeEvent: event }: { nativeEvent: TouchEvent },
        _options: unknown,
      ) => {
        const touch = event.touches[0];
        let el: Element | null = document.elementFromPoint(touch.clientX, touch.clientY);
        while (el) {
          if (el.getAttribute?.('data-no-dnd') === 'true') return false;
          el = el.parentElement;
        }
        return true;
      },
    },
  ];
}

// Soft, desaturated accent colors per category index (0-based)
// All cards share white bg and subtle gray border; only the inset left accent color varies
// insetColorMobile uses higher opacity (0.38-0.40) for better visual identity on mobile
const CATEGORY_COLORS = [
  { border: '#E5E7EB', insetColor: 'rgba(234, 179, 8, 0.25)',   insetColorMobile: 'rgba(234, 179, 8, 0.40)',   lightBg: '#FFFFFF', accentText: '#78716C' },
  { border: '#E5E7EB', insetColor: 'rgba(52, 168, 120, 0.22)',  insetColorMobile: 'rgba(52, 168, 120, 0.38)',  lightBg: '#FFFFFF', accentText: '#78716C' },
  { border: '#E5E7EB', insetColor: 'rgba(234, 126, 60, 0.22)',  insetColorMobile: 'rgba(234, 126, 60, 0.38)',  lightBg: '#FFFFFF', accentText: '#78716C' },
  { border: '#E5E7EB', insetColor: 'rgba(24, 119, 242, 0.22)',  insetColorMobile: 'rgba(24, 119, 242, 0.38)',  lightBg: '#FFFFFF', accentText: '#78716C' },
  { border: '#E5E7EB', insetColor: 'rgba(101, 183, 72, 0.22)',  insetColorMobile: 'rgba(101, 183, 72, 0.38)',  lightBg: '#FFFFFF', accentText: '#78716C' },
  { border: '#E5E7EB', insetColor: 'rgba(236, 100, 140, 0.22)', insetColorMobile: 'rgba(236, 100, 140, 0.38)', lightBg: '#FFFFFF', accentText: '#78716C' },
];

// Emoji icon list for the section picker
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

function getEmoji(iconName: string): string {
  return EMOJI_MAP[iconName] ?? '📂';
}

// Twemoji fallback URL (dash-separated codepoints, without fe0f)
function getTwemojiUrl(emoji: string): string {
  const codePoint = [...emoji]
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')
    .replace(/-fe0f$/, '')
    .replace(/-fe0f-/, '-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;
}

// Primary emoji URL for desktop: Noto Color Emoji SVG.
function getEmojiUrl(emoji: string): string {
  return getNotoEmojiUrl(emoji);
}

// Detects mobile at render time (SSR-safe). Re-checked on resize via useEffect.
function getIsMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

interface CategoryCardProps {
  category: Category;
  colorIndex: number;
  links: LinkType[];
  onRenameCategory: (categoryId: string, title: string) => void;
  onAddLink: (categoryId: string, title: string, url: string) => void;
  onDeleteLink: (linkId: string) => void;
  onUpdateLink: (linkId: string, title: string, url: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderLinks: (categoryId: string, oldIndex: number, newIndex: number) => void;
  onUpdateCategoryIcon: (categoryId: string, iconName: string) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
  categories: Category[];
  onMoveLink: (linkId: string, targetCategoryId: string) => void;
  dashboards: Dashboard[];
  currentDashboardId: string;
  onMoveCategoryToPanel: (categoryId: string, targetDashboardId: string) => void;
}

export function CategoryCard({
  category,
  colorIndex,
  links,
  onRenameCategory,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
  onDeleteCategory,
  onReorderLinks,
  onUpdateCategoryIcon,
  dragHandleListeners,
  dragHandleAttributes,
  categories,
  onMoveLink,
  dashboards,
  currentDashboardId,
  onMoveCategoryToPanel,
}: CategoryCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(category.title);
  const [showAddLink, setShowAddLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMovePanelMenu, setShowMovePanelMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const movePanelMenuRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  // Tracks whether the user is actively interacting with the picker (touch or mouse).
  // Used to suppress onBlur→saveTitle so the picker tap completes before edit mode exits.
  const pickerActiveRef = useRef(false);

  const otherDashboards = dashboards.filter((d) => d.id !== currentDashboardId);
  const canMoveToPanel = otherDashboards.length > 0;

  // Keep isMobile in sync when the user resizes the browser window.
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close move-panel menu on outside click
  useEffect(() => {
    if (!showMovePanelMenu) return;
    const handler = (e: MouseEvent) => {
      if (movePanelMenuRef.current && !movePanelMenuRef.current.contains(e.target as Node)) {
        setShowMovePanelMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMovePanelMenu]);

  // Calculate picker popup position when edit mode opens.
  // Uses two nested rAFs so the masonry ResizeObserver + calculateLayout(setTimeout 0)
  // have fully settled before getBoundingClientRect is read.
  // Does NOT close on scroll — the virtual keyboard on mobile triggers window scroll
  // when it pops up, which would immediately kill the picker. The picker is position:fixed
  // so it stays correctly anchored while visible.
  useEffect(() => {
    if (!isEditingTitle) {
      setPickerPos(null);
      return;
    }

    const updatePos = () => {
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          setPickerPos({
            top: rect.bottom + 6,
            left: rect.left - 4,
          });
        }
      }
    };

    // Double rAF: first flush React DOM (h3→input), second let masonry settle
    let raf1: number;
    let raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(updatePos);
    });

    // Only reposition on resize (not close) — avoids killing picker on mobile keyboard pop-up
    window.addEventListener('resize', updatePos);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('resize', updatePos);
    };
  }, [isEditingTitle]);

  // Close edit mode when tapping outside both the input and the picker.
  // The listener is registered in a setTimeout so the *same* tap event that
  // triggered isEditingTitle=true has fully propagated before we start
  // listening — otherwise on mobile the tap on the title immediately fires the
  // outside-click handler (the h3 is not inside input/picker/icon refs) and
  // closes the picker in the same event loop tick it opened.
  useEffect(() => {
    if (!isEditingTitle) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      const target = e.target as Node;
      const insidePicker = pickerRef.current?.contains(target);
      const insideInput = titleInputRef.current?.contains(target);
      const insideIcon = iconRef.current?.contains(target);
      if (!insidePicker && !insideInput && !insideIcon) {
        saveTitle();
      }
    };
    // Defer by one macro-task so the tap/click that opened edit mode finishes
    // propagating before this listener becomes active.
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
  }, [isEditingTitle]);

  const colors = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

  // Use custom sensors that ignore pointer/touch events starting on elements
  // marked data-no-dnd="true" (i.e. the category drag handle).
  const sensors = useSensors(
    useSensor(NoDndPointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(NoDndTouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderLinks(category.id, oldIndex, newIndex);
    }
  };

  useEffect(() => {
    setTitleDraft(category.title);
  }, [category.title]);

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  const saveTitle = () => {
    const clean = titleDraft.trim();
    if (clean && clean !== category.title) {
      onRenameCategory(category.id, clean);
    }
    setTitleDraft(category.title);
    setIsEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setTitleDraft(category.title);
    setIsEditingTitle(false);
  };

  const submitNewLink = (event: FormEvent) => {
    event.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    onAddLink(category.id, linkTitle, linkUrl);
    setLinkTitle('');
    setLinkUrl('');
    setShowAddLink(false);
  };

  // Shared handler for picking an emoji — works for both mouse and touch
  const handlePickEmoji = (name: string) => {
    pickerActiveRef.current = false;
    onUpdateCategoryIcon(category.id, name);
  };

  // Icon picker portal popup
  const pickerPortal = isEditingTitle && pickerPos
    ? createPortal(
        <div
          ref={pickerRef}
          data-no-dnd="true"
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
            {PICKER_ICONS.map(({ name, emoji }) => {
              const isSelected = name === category.iconName;
              return (
                <button
                  key={name}
                  type="button"
                  data-no-dnd="true"
                  title={name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pickerActiveRef.current = true;
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePickEmoji(name);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    pickerActiveRef.current = true;
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePickEmoji(name);
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded transition-colors ${
                    isSelected
                      ? 'bg-blue-50 ring-2 ring-blue-300 ring-offset-1'
                      : 'hover:bg-gray-100'
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
                        if (!img.dataset.fallback) {
                          img.dataset.fallback = '1';
                          img.src = getTwemojiUrl(emoji);
                        }
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
        className="rounded-xl md:rounded-[10px] flex flex-col group/card category-card hover:-translate-y-0.5"
        style={{
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow: `inset ${isMobile ? '3px' : '2px'} 0 0 ${isMobile ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.22)'}, 0 6px 16px rgba(0,0,0,0.05)`,
          transition: 'all 0.2s ease-out',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = `inset ${isMobile ? '3px' : '2px'} 0 0 ${isMobile ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.22)'}, 0 8px 24px rgba(0,0,0,0.10)`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = `inset ${isMobile ? '3px' : '2px'} 0 0 ${isMobile ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.22)'}, 0 6px 16px rgba(0,0,0,0.05)`;
        }}
      >
        {/* Colored header area */}
        <header
          className="flex items-center justify-between px-3 py-2.5 md:py-2 rounded-t-xl md:rounded-t-[10px]"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              ref={iconRef}
              className="flex-shrink-0 p-1 flex items-center justify-center"
              data-no-dnd="true"
            >
              {isMobile ? (
                <span
                  className="select-none leading-none"
                  style={{ fontSize: '1rem', lineHeight: 1 }}
                >
                  {getEmoji(category.iconName)}
                </span>
              ) : (
                <img
                  src={getEmojiUrl(getEmoji(category.iconName))}
                  alt=""
                  className="w-4 h-4 select-none"
                  draggable={false}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = getTwemojiUrl(getEmoji(category.iconName));
                    }
                  }}
                />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1" data-no-dnd="true">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={() => {
                    // On mobile, tapping a picker emoji triggers blur before the
                    // touchEnd fires. Defer saveTitle so the touchEnd handler runs first.
                    setTimeout(() => {
                      if (!pickerActiveRef.current) {
                        saveTitle();
                      }
                    }, 150);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle();
                    if (e.key === 'Escape') cancelTitleEdit();
                  }}
                  className="text-xs font-semibold text-slate-800 border border-primary-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-300 w-full bg-white"
                />
              ) : (
                <h3
                  className="text-sm md:text-xs font-semibold cursor-text truncate text-slate-700 tracking-tight"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {category.title}
                </h3>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0">
            <button
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-400 hover:bg-white/60 rounded transition-colors"
              style={{ ['--hover-color' as string]: colors.accentText }}
              aria-label="Add new link to section"
              onClick={() => setShowAddLink(true)}
            >
              <Plus className="w-5 h-5 md:w-3.5 md:h-3.5" />
            </button>
            {dragHandleListeners && dragHandleAttributes && (
              <div
                className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-300 transition-colors cursor-grab active:cursor-grabbing rounded"
                aria-label="Drag to reorder section"
                data-no-dnd="true"
                style={{ touchAction: 'none' }}
                {...dragHandleAttributes}
                {...dragHandleListeners}
              >
                <GripVertical className="w-5 h-5 md:w-3.5 md:h-3.5" />
              </div>
            )}
            {canMoveToPanel && (
              <div className="relative" ref={movePanelMenuRef} data-no-dnd="true">
                <button
                  className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-400 hover:text-primary-500 rounded transition-colors opacity-100 md:opacity-0 md:group-hover/card:opacity-100"
                  aria-label="Mover seção para outro painel"
                  title="Mover para outro painel"
                  data-no-dnd="true"
                  onClick={(e) => { e.stopPropagation(); setShowMovePanelMenu((v) => !v); }}
                >
                  <FolderOutput className="w-5 h-5 md:w-3.5 md:h-3.5" />
                </button>
                {showMovePanelMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-50 min-w-[160px] py-1" data-no-dnd="true">
                    {otherDashboards.map((dash) => (
                      <button
                        key={dash.id}
                        className="w-full text-left text-xs text-slate-700 px-3 py-1.5 hover:bg-slate-100 cursor-pointer truncate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveCategoryToPanel(category.id, dash.id);
                          setShowMovePanelMenu(false);
                        }}
                      >
                        {dash.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete section"
            >
              <Trash2 className="w-5 h-5 md:w-3 md:h-3" />
            </button>
          </div>
        </header>

        {/* White body area */}
        <div
          className="mx-2 rounded-xl md:rounded-lg flex-1 overflow-y-auto custom-scrollbar p-2.5 card-body-inner"
          style={{ background: '#EDF1F7' }}
        >
          {showAddLink && (
            <form onSubmit={submitNewLink} className="mb-2 p-2 rounded-lg border border-slate-200 bg-white/80 space-y-1.5">
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Titulo do link"
                className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-300 bg-white min-h-[36px]"
              />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-300 bg-white min-h-[36px]"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddLink(false)}
                  className="px-2 py-1.5 text-xs rounded bg-slate-200 text-slate-600 hover:bg-slate-300 min-h-[36px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-2 py-1.5 text-xs rounded bg-primary-600 text-white hover:bg-primary-700 min-h-[36px]"
                >
                  Adicionar
                </button>
              </div>
            </form>
          )}
          {links.length > 0 ? (
            <DndContext
              id={`links-dnd-${category.id}`}
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleLinkDragEnd}
            >
              <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                {links.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    onDelete={onDeleteLink}
                    onUpdate={onUpdateLink}
                    categories={categories}
                    currentCategoryId={category.id}
                    onMove={onMoveLink}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center h-16 text-slate-400 gap-1">
              <Inbox className="w-5 h-5 opacity-20" />
              <p className="text-xs">Nenhum link</p>
            </div>
          )}
        </div>

        {/* Colored footer */}
        {!showAddLink && (
          <div
            className="mx-2 mb-2 mt-1 px-2 py-1.5 rounded-b-xl"
          >
            <button
              className="text-sm md:text-xs font-medium hover:opacity-75 transition-opacity flex items-center gap-1 min-h-[24px] md:min-h-0 py-0.5 md:py-0"
              style={{ color: colors.accentText }}
              onClick={() => setShowAddLink(true)}
            >
              <Plus className="w-3 h-3" />
              Adicionar link
            </button>
          </div>
        )}
      </article>

      {pickerPortal}

      <ConfirmModal
        open={showDeleteModal}
        title="Excluir seção"
        message="Excluir seção e todos os links?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDeleteCategory(category.id);
        }}
      />
    </>
  );
}
