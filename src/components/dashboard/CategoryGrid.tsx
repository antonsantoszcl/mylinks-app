'use client';

import { Category, Link as LinkType } from '@/lib/types';
import { SortableCategoryCard } from './SortableCategoryCard';
import { LayoutGrid, Plus } from 'lucide-react';
import { FormEvent, useState, useRef, useEffect, useCallback } from 'react';
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

const GAP = 12; // px – matches gap-3 (0.75rem)

function getColumnCount(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 768) return 2;
  return 1;
}

interface ItemLayout {
  top: number;
  left: number;
  width: number;
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

  // Masonry layout state
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layouts, setLayouts] = useState<ItemLayout[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  // Track whether first measurement has happened to avoid flash
  const [measured, setMeasured] = useState(false);

  // Total items = categories + 1 "add" button
  const totalItems = categories.length + 1;

  const calculateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    if (containerWidth === 0) return;

    const numCols = getColumnCount(containerWidth);
    const colWidth = (containerWidth - GAP * (numCols - 1)) / numCols;
    const colHeights = new Array(numCols).fill(0) as number[];
    const newLayouts: ItemLayout[] = [];

    for (let i = 0; i < totalItems; i++) {
      const el = itemRefs.current[i];
      const itemHeight = el ? el.offsetHeight : 0;

      // Pick shortest column
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[shortestCol];
      const left = shortestCol * (colWidth + GAP);

      newLayouts.push({ top, left, width: colWidth });
      colHeights[shortestCol] += itemHeight + GAP;
    }

    const maxHeight = Math.max(...colHeights) - GAP; // remove trailing gap
    setLayouts(newLayouts);
    setContainerHeight(maxHeight > 0 ? maxHeight : 0);
    setMeasured(true);
  }, [totalItems]);

  // Re-calculate whenever categories or links change (links affect card height)
  useEffect(() => {
    // Small delay so the DOM has painted the new card heights
    const id = setTimeout(calculateLayout, 0);
    return () => clearTimeout(id);
  }, [calculateLayout, categories, links, showAddCategory]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => calculateLayout());
    ro.observe(container);
    return () => ro.disconnect();
  }, [calculateLayout]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Use original categories array for index lookup (DnD works on original order)
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
      <div className="flex items-center gap-1.5 mb-4">
        <div className="bg-primary-100 p-1 rounded-md">
          <LayoutGrid className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <h2 className="text-[15px] md:text-sm font-bold text-slate-700">Seções</h2>
      </div>

      <DndContext
        id="category-grid-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCategoryDragEnd}
      >
        {/* SortableContext uses original categories order for correct DnD index resolution */}
        <SortableContext items={categories.map((c) => c.id)} strategy={rectSortingStrategy}>
          {/* Outer ref container for ResizeObserver */}
          <div ref={containerRef} className="w-full">
            {/* Inner absolutely-positioned masonry container.
                Height is 'auto' on first render (items flow normally for measurement),
                then set to the calculated masonry height once measured.
                opacity-0 until first measurement to avoid layout flash. */}
            <div
              className="relative w-full"
              style={{
                height: measured ? containerHeight : 'auto',
                opacity: measured ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              {/* Cards rendered in original DOM order so DnD indices stay correct */}
              {categories.map((category, index) => {
                const layout = layouts[index];
                return (
                  <div
                    key={category.id}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    style={
                      layout
                        ? {
                            position: 'absolute',
                            top: layout.top,
                            left: layout.left,
                            width: layout.width,
                            transition: 'top 0.3s ease, left 0.3s ease',
                          }
                        : { width: '100%' }
                    }
                  >
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
                );
              })}

              {/* "Nova seção" add-card – last item, included in masonry calculation */}
              {(() => {
                const addIndex = categories.length;
                const layout = layouts[addIndex];
                return (
                  <div
                    ref={(el) => { itemRefs.current[addIndex] = el; }}
                    style={
                      layout
                        ? {
                            position: 'absolute',
                            top: layout.top,
                            left: layout.left,
                            width: layout.width,
                            transition: 'top 0.3s ease, left 0.3s ease',
                          }
                        : { width: '100%' }
                    }
                  >
                    <article className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-2 flex flex-col hover:shadow-md transition-shadow">
                      {!showAddCategory ? (
                        <button
                          onClick={() => setShowAddCategory(true)}
                          className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold">Nova seção</span>
                        </button>
                      ) : (
                        <form onSubmit={submitCategory} className="space-y-2">
                          <h3 className="text-xs font-bold text-slate-800">Nova seção</h3>
                          <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nome da seção"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-300"
                            autoFocus
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
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
                  </div>
                );
              })()}
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
