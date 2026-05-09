import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link as LinkType, Category } from '@/lib/types';
import { ArrowRightLeft, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface LinkItemProps {
  link: LinkType;
  onDelete: (linkId: string) => void;
  onUpdate: (linkId: string, title: string, url: string) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
  categories?: Category[];
  currentCategoryId?: string;
  onMove?: (linkId: string, targetCategoryId: string) => void;
}

export function LinkItem({ link, onDelete, onUpdate, dragHandleListeners, dragHandleAttributes, categories, currentCategoryId, onMove }: LinkItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);

  // Keep edit fields in sync if link prop changes (e.g. after save)
  useEffect(() => {
    if (!isEditing) {
      setEditTitle(link.title);
      setEditUrl(link.url);
    }
  }, [link.title, link.url, isEditing]);

  // Auto-focus title input when edit mode opens
  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditing]);

  // Close move menu on outside click
  useEffect(() => {
    if (!showMoveMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node) &&
        moveButtonRef.current && !moveButtonRef.current.contains(e.target as Node)
      ) {
        setShowMoveMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoveMenu]);

  // Calculate portal dropdown position when menu opens; close on scroll/resize
  useEffect(() => {
    if (!showMoveMenu) {
      setDropdownPos(null);
      return;
    }
    if (moveButtonRef.current) {
      const rect = moveButtonRef.current.getBoundingClientRect();
      const DROPDOWN_HEIGHT = 160; // estimated max height
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= DROPDOWN_HEIGHT
        ? rect.bottom + 4
        : rect.top - DROPDOWN_HEIGHT - 4;
      const right = window.innerWidth - rect.right;
      setDropdownPos({ top, right });
    }
    const closeMenu = () => setShowMoveMenu(false);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);
    return () => {
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [showMoveMenu]);

  const openEdit = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const cleanTitle = editTitle.trim();
    const cleanUrl = editUrl.trim();
    if (cleanTitle && cleanUrl) {
      onUpdate(link.id, cleanTitle, cleanUrl);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsEditing(false);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // If a double-click timer is in flight, cancel navigation
    if (clickTimerRef.current !== null) {
      e.preventDefault();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Cancel any pending single-click timer
    if (clickTimerRef.current !== null) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    openEdit();
  };

  const otherCategories = categories?.filter((c) => c.id !== currentCategoryId) ?? [];
  const canMove = onMove && otherCategories.length > 0;

  // Edit mode: render inline form
  if (isEditing) {
    return (
      <div
        className="rounded-lg border border-primary-200 bg-white shadow-sm p-2 my-0.5"
        data-no-dnd="true"
      >
        <div className="space-y-1.5">
          <input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título"
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-300 bg-white min-h-[32px]"
          />
          <input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="https://exemplo.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-300 bg-white min-h-[32px]"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600 hover:bg-slate-200 min-h-[32px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="px-2 py-1 text-xs rounded bg-primary-600 text-white hover:bg-primary-700 min-h-[32px]"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="group/link flex items-center justify-between py-1 pl-1.5 pr-0 rounded-lg hover:bg-white/70 transition-all cursor-pointer"
        onDoubleClick={handleDoubleClick}
      >
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={handleLinkClick}
        >
          <img
            src={link.iconUrl}
            alt={link.title}
            className="w-5 h-5 object-contain flex-shrink-0 rounded-sm"
          />
          <span className="text-sm md:text-xs font-semibold text-slate-700 truncate flex-1">
            {link.title}
          </span>
        </a>

        <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0 -mr-2">
          <button
            className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-primary-500 rounded opacity-100 md:opacity-0 md:group-hover/link:opacity-100 transition-opacity"
            title="Editar link"
            onClick={(e) => { e.stopPropagation(); openEdit(); }}
            data-no-dnd="true"
          >
            <Pencil className="w-4 h-4 md:w-3 md:h-3" />
          </button>

          {dragHandleListeners && dragHandleAttributes && (
            <div
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-primary-500 opacity-100 md:opacity-0 md:group-hover/link:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder link"
              style={{ touchAction: 'none' }}
              {...dragHandleAttributes}
              {...dragHandleListeners}
            >
              <GripVertical className="w-5 h-5 md:w-3.5 md:h-3.5" />
            </div>
          )}

          {canMove && (
            <div data-no-dnd="true">
              <button
                className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-primary-500 rounded opacity-100 md:opacity-0 md:group-hover/link:opacity-100 transition-opacity"
                title="Mover para outra seção"
                ref={moveButtonRef}
                onClick={(e) => { e.stopPropagation(); setShowMoveMenu((v) => !v); }}
                data-no-dnd="true"
              >
                <ArrowRightLeft className="w-4 h-4 md:w-3 md:h-3" />
              </button>

              {showMoveMenu && dropdownPos && createPortal(
                <div
                  ref={moveMenuRef}
                  style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
                  className="bg-white rounded-lg border border-slate-200 shadow-lg w-[160px] max-h-[200px] overflow-y-auto py-1"
                >
                  {otherCategories.map((cat) => (
                    <button
                      key={cat.id}
                      className="w-full text-left text-xs text-slate-700 px-3 py-1.5 hover:bg-slate-100 cursor-pointer truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove!(link.id, cat.id);
                        setShowMoveMenu(false);
                      }}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </div>
          )}

          <button
            className="flex items-center justify-center min-w-[36px] min-h-[36px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-red-500 rounded opacity-100 md:opacity-0 md:group-hover/link:opacity-100 transition-opacity"
            title="Excluir link"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-5 h-5 md:w-3 md:h-3" />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Excluir link"
        message={`Remover o link "${link.title}"?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete(link.id);
        }}
      />
    </>
  );
}
