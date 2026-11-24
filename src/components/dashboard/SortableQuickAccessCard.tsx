'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuickAccessLink } from '@/lib/types';
import { QuickAccessCard } from './QuickAccessCard';

interface SortableQuickAccessCardProps {
  link: QuickAccessLink;
  onRemove: (id: string) => void;
}

export function SortableQuickAccessCard({ link, onRemove }: SortableQuickAccessCardProps) {
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
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuickAccessCard
        link={link}
        onRemove={onRemove}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />
    </div>
  );
}
