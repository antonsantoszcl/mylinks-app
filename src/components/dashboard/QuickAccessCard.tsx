import { QuickAccessLink } from '@/lib/types';
import Link from 'next/link';
import { GripVertical, X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface QuickAccessCardProps {
  link: QuickAccessLink;
  onRemove: (id: string) => void;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

export function QuickAccessCard({ link, onRemove, dragHandleListeners, dragHandleAttributes }: QuickAccessCardProps) {
  const { t } = useLocale();
  const displayTitle = link.title === 'Tradutor' ? t('quickAccess.translator') : link.title;
  return (
    <div className="relative flex-shrink-0 group">
      <button
        onClick={() => onRemove(link.id)}
        className="absolute -top-1 -right-1 flex items-center justify-center p-1 md:p-0.5 md:min-w-0 md:min-h-0 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
        aria-label="Remove quick access item"
        data-no-dnd="true"
      >
        <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </button>
      {dragHandleListeners && dragHandleAttributes && (
        <div
          className="absolute -top-1 -left-1 flex items-center justify-center p-1 md:p-0.5 md:min-w-0 md:min-h-0 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:bg-primary-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder quick access item"
          style={{ touchAction: 'none' }}
          {...dragHandleAttributes}
          {...dragHandleListeners}
        >
          <GripVertical className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </div>
      )}
      <Link
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 hover:shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <div className="w-6 h-6 md:w-5 md:h-5 bg-slate-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src={link.iconUrl} alt={displayTitle} className="w-5 h-5 md:w-4 md:h-4 object-contain" />
        </div>
        <span className="text-sm md:text-[12.5px] font-semibold text-slate-700 md:text-slate-600 whitespace-nowrap">
          {displayTitle}
        </span>
      </Link>
    </div>
  );
}
