import { Link as LinkType } from '@/lib/types';
import Link from 'next/link';
import { GripVertical, Trash2 } from 'lucide-react';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface LinkItemProps {
  link: LinkType;
  onDelete: (linkId: string) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || '';
  }
}

export function LinkItem({ link, onDelete, dragHandleListeners, dragHandleAttributes }: LinkItemProps) {
  const deleteLink = () => {
    if (window.confirm(`Remover o link "${link.title}"?`)) {
      onDelete(link.id);
    }
  };

  const domain = getHostname(link.url);

  return (
    <div className="group/link flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/70 transition-all cursor-pointer">
      <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
        <img
          src={link.iconUrl}
          alt={link.title}
          className="w-5 h-5 object-contain flex-shrink-0 rounded-sm"
        />
        <div className="min-w-0 flex-1">
          <span className="text-sm text-slate-700 truncate block group-hover/link:text-primary-600 transition-colors leading-tight">
            {link.title}
          </span>
          {domain && (
            <span className="text-xs text-gray-400 truncate block leading-tight">
              {domain}
            </span>
          )}
        </div>
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
        onClick={deleteLink}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
