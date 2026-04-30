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
      <div className="group/link flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/70 transition-all cursor-pointer">
        <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={link.iconUrl}
            alt={link.title}
            className="w-5 h-5 object-contain flex-shrink-0 rounded-sm"
          />
          <span className="text-xs font-semibold text-slate-700 truncate flex-1 group-hover/link:text-primary-600 transition-colors">
            {link.title}
          </span>
        </Link>

        {dragHandleListeners && dragHandleAttributes && (
          <div
            className="p-0.5 text-slate-300 hover:text-primary-500 opacity-0 group-hover/link:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0"
            aria-label="Drag to reorder link"
            {...dragHandleAttributes}
            {...dragHandleListeners}
          >
            <GripVertical className="w-3 h-3" />
          </div>
        )}

        <button
          className="p-0.5 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0"
          title="Excluir link"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="w-3 h-3" />
        </button>
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
