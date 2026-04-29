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

// Colored border around the whole card
const BORDER_COLORS = [
  'border-amber-200',
  'border-emerald-200',
  'border-orange-200',
  'border-sky-200',
  'border-rose-200',
  'border-violet-200',
];

// Subtle colored background for the card header area
const HEADER_COLORS = [
  'bg-amber-50',
  'bg-emerald-50',
  'bg-orange-50',
  'bg-sky-50',
  'bg-rose-50',
  'bg-violet-50',
];

const ICON_COLORS = [
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
  'bg-orange-100 text-orange-600',
  'bg-sky-100 text-sky-600',
  'bg-rose-100 text-rose-600',
  'bg-violet-100 text-violet-600',
];

// Accent text color used in footer / add-link area
const ACCENT_TEXT_COLORS = [
  'text-amber-600',
  'text-emerald-600',
  'text-orange-600',
  'text-sky-600',
  'text-rose-600',
  'text-violet-600',
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

  const accentIdx = colorIndex % BORDER_COLORS.length;
  const borderClass = BORDER_COLORS[accentIdx];
  const headerBgClass = HEADER_COLORS[accentIdx];
  const iconColorClass = ICON_COLORS[accentIdx];
  const accentTextClass = ACCENT_TEXT_COLORS[accentIdx];

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
    <article className={`rounded-xl shadow-sm border bg-white flex flex-col hover:shadow-md transition-shadow group/card ${borderClass}`}>
      {/* Colored header area */}
      <header className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${headerBgClass}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${iconColorClass}`}>
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
            className="p-1 text-slate-400 hover:text-primary-600 hover:bg-white/60 rounded transition-colors"
            aria-label="Add new link to category"
            onClick={() => setShowAddLink(true)}
          >
            <Icons.Plus className="w-3.5 h-3.5" />
          </button>
          {dragHandleListeners && dragHandleAttributes && (
            <div
              className="p-1 text-slate-300 hover:text-primary-500 transition-colors cursor-grab active:cursor-grabbing rounded"
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

      {/* White body area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
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

      {/* Optional footer with accent text */}
      {!showAddLink && (
        <div className="px-3 py-1.5 border-t border-slate-100">
          <button
            className={`text-xs font-medium ${accentTextClass} hover:opacity-75 transition-opacity flex items-center gap-1`}
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
