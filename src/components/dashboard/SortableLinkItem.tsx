'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, Link as LinkType } from '@/lib/types';
import { LinkItem } from './LinkItem';

interface SortableLinkItemProps {
  link: LinkType;
  onDelete: (linkId: string) => void;
  onUpdate: (linkId: string, title: string, url: string) => void;
  categories: Category[];
  currentCategoryId: string;
  onMove: (linkId: string, targetCategoryId: string) => void;
}

export function SortableLinkItem({ link, onDelete, onUpdate, categories, currentCategoryId, onMove }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LinkItem
        link={link}
        onDelete={onDelete}
        onUpdate={onUpdate}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
        categories={categories}
        currentCategoryId={currentCategoryId}
        onMove={onMove}
      />
    </div>
  );
}
