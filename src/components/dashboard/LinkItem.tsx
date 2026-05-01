import { useState } from 'react';
import { Link as LinkType } from '@/lib/types';
import Link from 'next/link';
import { GripVertical, Trash2 } from 'lucide-react';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface LinkItemProps {
  link: LinkType;
  onDelete: (linkId: string) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

export function LinkItem({ link, onDelete, dragHandleListeners, dragHandleAttributes }: LinkItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="group/link flex items-center justify-between py-1 pl-1.5 pr-0 rounded-lg hover:bg-white/70 transition-all cursor-pointer">
        <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={link.iconUrl}
            alt={link.title}
            className="w-5 h-5 object-contain flex-shrink-0 rounded-sm"
          />
          <span className="text-sm md:text-xs font-semibold text-slate-700 truncate flex-1 group-hover/link:text-primary-600 transition-colors">
            {link.title}
          </span>
        </Link>

        <div className="flex items-center gap-0.5 flex-shrink-0 -mr-2">
          {dragHandleListeners && dragHandleAttributes && (
            <div
              className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-300 hover:text-primary-500 opacity-100 md:opacity-0 md:group-hover/link:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder link"
              style={{ touchAction: 'none' }}
              {...dragHandleAttributes}
              {...dragHandleListeners}
            >
              <GripVertical className="w-5 h-5 md:w-3.5 md:h-3.5" />
            </div>
          )}

          <button
            className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-slate-300 hover:text-red-500 rounded opacity-100 md:opacity-0 md:group-hover/link:opacity-100 transition-opacity"
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
