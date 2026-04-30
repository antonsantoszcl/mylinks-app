'use client';

import { Category, Link as LinkType } from '@/lib/types';
import { SortableCategoryCard } from './SortableCategoryCard';
import { LayoutGrid, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface CategoryGridProps {
  categories: Category[];
  links: LinkType[];
  onRenameCategory: (categoryId: string, title: string) => void;
  onAddLink: (categoryId: string, title: string, url: string) => void;
  onDeleteLink: (linkId: string) => void;
  onAddCategory: (title: string, iconName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderCategories: (oldIndex: number, newIndex: number) => void;
  onReorderLinks: (categoryId: string, oldIndex: number, newIndex: number) => void;
}

export function CategoryGrid({
  categories,
  links,
  onRenameCategory,
  onAddLink,
  onDeleteLink,
  onAddCategory,
  onDeleteCategory,
  onReorderCategories,
  onReorderLinks,
}: CategoryGridProps) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderCategories(oldIndex, newIndex);
    }
  };

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName, 'Folder');
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="bg-primary-100 p-1 rounded-md">
          <LayoutGrid className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <h2 className="text-sm font-bold text-slate-700">Secoes</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        <SortableContext items={categories.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="masonry-grid">
            {categories.map((category, index) => (
              <div key={category.id} className="masonry-item">
                <SortableCategoryCard
                  category={category}
                  colorIndex={index}
                  links={links.filter((link) => link.categoryId === category.id).sort((a, b) => a.order - b.order)}
                  onRenameCategory={onRenameCategory}
                  onAddLink={onAddLink}
                  onDeleteLink={onDeleteLink}
                  onDeleteCategory={onDeleteCategory}
                  onReorderLinks={onReorderLinks}
                />
              </div>
            ))}

            <article className="masonry-item bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-2 flex flex-col hover:shadow-md transition-shadow">
              {!showAddCategory ? (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Nova secao</span>
                </button>
              ) : (
                <form onSubmit={submitCategory} className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800">Nova secao</h3>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da secao"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-300"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                      className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-1 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Criar
                    </button>
                  </div>
                </form>
              )}
            </article>
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
