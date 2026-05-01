import { Category, Link as LinkType } from '@/lib/types';
import { SortableLinkItem } from './SortableLinkItem';
import * as Icons from 'lucide-react';
import { GripVertical } from 'lucide-react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// Soft, desaturated accent colors per category index (0-based)
// All cards share white bg and subtle gray border; only the inset left accent color varies
// insetColorMobile uses higher opacity (0.38-0.40) for better visual identity on mobile
const CATEGORY_COLORS = [
  { border: '#E5E7EB', insetColor: 'rgba(234, 179, 8, 0.25)',   insetColorMobile: 'rgba(234, 179, 8, 0.40)',   lightBg: '#FFFFFF', iconBg: '#FEF9C3', iconText: '#713F12', accentText: '#78716C' }, // Muted yellow
  { border: '#E5E7EB', insetColor: 'rgba(52, 168, 120, 0.22)',  insetColorMobile: 'rgba(52, 168, 120, 0.38)',  lightBg: '#FFFFFF', iconBg: '#D1FAE5', iconText: '#065F46', accentText: '#78716C' }, // Muted mint
  { border: '#E5E7EB', insetColor: 'rgba(234, 126, 60, 0.22)',  insetColorMobile: 'rgba(234, 126, 60, 0.38)',  lightBg: '#FFFFFF', iconBg: '#FFEDD5', iconText: '#7C2D12', accentText: '#78716C' }, // Muted orange
  { border: '#E5E7EB', insetColor: 'rgba(24, 119, 242, 0.22)',  insetColorMobile: 'rgba(24, 119, 242, 0.38)',  lightBg: '#FFFFFF', iconBg: '#D6EAFF', iconText: '#0F4FA6', accentText: '#78716C' }, // Muted blue
  { border: '#E5E7EB', insetColor: 'rgba(101, 183, 72, 0.22)',  insetColorMobile: 'rgba(101, 183, 72, 0.38)',  lightBg: '#FFFFFF', iconBg: '#DCFCE7', iconText: '#14532D', accentText: '#78716C' }, // Muted lime
  { border: '#E5E7EB', insetColor: 'rgba(236, 100, 140, 0.22)', insetColorMobile: 'rgba(236, 100, 140, 0.38)', lightBg: '#FFFFFF', iconBg: '#FCE7F3', iconText: '#831843', accentText: '#78716C' }, // Muted pink
];

interface CategoryCardProps {
  category: Category;
  colorIndex: number;
  links: LinkType[];
  onRenameCategory: (categoryId: string, title: string) => void;
  onAddLink: (categoryId: string, title: string, url: string) => void;
  onDeleteLink: (linkId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderLinks: (categoryId: string, oldIndex: number, newIndex: number) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

export function CategoryCard({
  category,
  colorIndex,
  links,
  onRenameCategory,
  onAddLink,
  onDeleteLink,
  onDeleteCategory,
  onReorderLinks,
  dragHandleListeners,
  dragHandleAttributes,
}: CategoryCardProps) {
  const IconComponent =
    category.iconName in Icons
      ? (Icons[category.iconName as keyof typeof Icons] as (props: { className?: string }) => JSX.Element)
      : Icons.Folder;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(category.title);
  const [showAddLink, setShowAddLink] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const colors = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
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

  return (
    <>
      <article
        className="rounded-xl flex flex-col group/card category-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow: isHovered
            ? `inset 3px 0 0 ${colors.insetColor}, 0 8px 20px rgba(0,0,0,0.07)`
            : `inset 3px 0 0 ${colors.insetColor}, 0 6px 16px rgba(0,0,0,0.05)`,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
          ['--card-inset-color' as string]: colors.insetColorMobile,
        }}
      >
        {/* Colored header area */}
        <header
          className="flex items-center justify-between px-3 py-2 rounded-t-lg"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="p-1.5 rounded-lg transition-all flex-shrink-0"
              style={{ backgroundColor: colors.iconBg, color: colors.iconText, opacity: 0.45 }}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') cancelTitleEdit();
                }}
                className="text-xs font-semibold text-slate-800 border border-primary-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-300 w-full bg-white"
              />
            ) : (
              <h3
                className="text-sm md:text-xs font-semibold cursor-text truncate text-slate-800"
                onClick={() => setIsEditingTitle(true)}
              >
                {category.title}
              </h3>
            )}
            <span className="bg-white/70 text-slate-400 text-xs font-medium px-1.5 py-0 rounded-full flex-shrink-0 leading-4">
              {links.length}
            </span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-400 hover:bg-white/60 rounded transition-colors"
              style={{ ['--hover-color' as string]: colors.accentText }}
              aria-label="Add new link to section"
              onClick={() => setShowAddLink(true)}
            >
              <Icons.Plus className="w-5 h-5 md:w-3.5 md:h-3.5" />
            </button>
            {dragHandleListeners && dragHandleAttributes && (
              <div
                className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-300 transition-colors cursor-grab active:cursor-grabbing rounded"
                aria-label="Drag to reorder section"
                style={{ touchAction: 'none' }}
                {...dragHandleAttributes}
                {...dragHandleListeners}
              >
                <GripVertical className="w-5 h-5 md:w-3.5 md:h-3.5" />
              </div>
            )}
            <button
              className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete section"
            >
              <Icons.Trash2 className="w-5 h-5 md:w-3 md:h-3" />
            </button>
          </div>
        </header>

        {/* White body area */}
        <div
          className="mx-2 rounded-lg flex-1 overflow-y-auto custom-scrollbar p-3 card-body-inner"
          style={{ background: '#F1F5F9' }}
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
                  <SortableLinkItem key={link.id} link={link} onDelete={onDeleteLink} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center h-16 text-slate-400 gap-1">
              <Icons.Inbox className="w-5 h-5 opacity-20" />
              <p className="text-xs">Nenhum link</p>
            </div>
          )}
        </div>

        {/* Colored footer */}
        {!showAddLink && (
          <div
            className="mx-2 mb-2 mt-1 px-2 py-1.5 rounded-b-lg"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <button
              className="text-xs font-medium hover:opacity-75 transition-opacity flex items-center gap-1 min-h-[44px] md:min-h-0 py-2 md:py-0"
              style={{ color: colors.accentText }}
              onClick={() => setShowAddLink(true)}
            >
              <Icons.Plus className="w-3 h-3" />
              Adicionar link
            </button>
          </div>
        )}
      </article>

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
