'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, Link as LinkType } from '@/lib/types';
import { CategoryCard } from './CategoryCard';

interface SortableCategoryCardProps {
  category: Category;
  colorIndex: number;
  links: LinkType[];
  onRenameCategory: (categoryId: string, title: string) => void;
  onAddLink: (categoryId: string, title: string, url: string) => void;
  onDeleteLink: (linkId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderLinks: (categoryId: string, oldIndex: number, newIndex: number) => void;
}

export function SortableCategoryCard({
  category,
  colorIndex,
  links,
  onRenameCategory,
  onAddLink,
  onDeleteLink,
  onDeleteCategory,
  onReorderLinks,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/category">
      <CategoryCard
        category={category}
        colorIndex={colorIndex}
        links={links}
        onRenameCategory={onRenameCategory}
        onAddLink={onAddLink}
        onDeleteLink={onDeleteLink}
        onDeleteCategory={onDeleteCategory}
        onReorderLinks={onReorderLinks}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />
    </div>
  );
}
