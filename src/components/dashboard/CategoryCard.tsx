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

// Exact RGB colors per category index (0-based)
const CATEGORY_COLORS = [
  { border: '#FDE089', lightBg: '#FEFCF7', iconBg: '#FDE089', iconText: '#92400E', accentText: '#92400E' }, // Warm yellow
  { border: '#86E0BD', lightBg: '#FAFDFA', iconBg: '#86E0BD', iconText: '#065F46', accentText: '#065F46' }, // Mint green
  { border: '#FDBA74', lightBg: '#FEF9F8', iconBg: '#FDBA74', iconText: '#9A3412', accentText: '#9A3412' }, // Soft orange
  { border: '#C4B5FD', lightBg: '#FCF9FE', iconBg: '#C4B5FD', iconText: '#4C1D95', accentText: '#4C1D95' }, // Lavender
  { border: '#A3E692', lightBg: '#FAFDFA', iconBg: '#A3E692', iconText: '#14532D', accentText: '#14532D' }, // Lime green
  { border: '#FBA4B8', lightBg: '#FEF9F8', iconBg: '#FBA4B8', iconText: '#881337', accentText: '#881337' }, // Pink
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
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const colors = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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

  const deleteCategory = () => {
    if (window.confirm('Excluir categoria e todos os links?')) {
      onDeleteCategory(category.id);
    }
  };

  return (
    <article
      className="rounded-xl shadow-sm flex flex-col hover:shadow-md transition-shadow group/card"
      style={{ border: `2px solid ${colors.border}`, backgroundColor: colors.lightBg }}
    >
      {/* Colored header area */}
      <header
        className="flex items-center justify-between px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: colors.lightBg }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="p-1.5 rounded-lg transition-all flex-shrink-0"
            style={{ backgroundColor: colors.iconBg, color: colors.iconText }}
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
              className="text-xs font-semibold cursor-text truncate text-slate-800"
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
            className="p-1 text-slate-400 hover:bg-white/60 rounded transition-colors"
            style={{ ['--hover-color' as string]: colors.accentText }}
            aria-label="Add new link to category"
            onClick={() => setShowAddLink(true)}
          >
            <Icons.Plus className="w-3.5 h-3.5" />
          </button>
          {dragHandleListeners && dragHandleAttributes && (
            <div
              className="p-1 text-slate-300 transition-colors cursor-grab active:cursor-grabbing rounded"
              aria-label="Drag to reorder category"
              {...dragHandleAttributes}
              {...dragHandleListeners}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          <button
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            onClick={deleteCategory}
            aria-label="Delete category"
          >
            <Icons.Trash2 className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* White body area with side margins to show colored strip */}
      <div className="mx-2 bg-white rounded-lg flex-1 overflow-y-auto custom-scrollbar p-3">
        {showAddLink && (
          <form onSubmit={submitNewLink} className="mb-2 p-2 rounded-lg border border-slate-200 bg-white/80 space-y-1.5">
            <input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Titulo do link"
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-300 bg-white"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-300 bg-white"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddLink(false)}
                className="px-2 py-1 text-xs rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-2 py-1 text-xs rounded bg-primary-600 text-white hover:bg-primary-700"
              >
                Adicionar
              </button>
            </div>
          </form>
        )}
        {links.length > 0 ? (
          <DndContext
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
          style={{ backgroundColor: colors.lightBg }}
        >
          <button
            className="text-xs font-medium hover:opacity-75 transition-opacity flex items-center gap-1"
            style={{ color: colors.accentText }}
            onClick={() => setShowAddLink(true)}
          >
            <Icons.Plus className="w-3 h-3" />
            Adicionar link
          </button>
        </div>
      )}
    </article>
  );
}
