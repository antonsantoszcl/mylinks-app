import { QuickAccessLink } from '@/lib/types';
import Link from 'next/link';
import { X } from 'lucide-react';

interface QuickAccessCardProps {
  link: QuickAccessLink;
  onRemove: (id: string) => void;
}

export function QuickAccessCard({ link, onRemove }: QuickAccessCardProps) {
  return (
    <div className="relative flex-shrink-0 group">
      <button
        onClick={() => onRemove(link.id)}
        className="absolute -top-1 -right-1 flex items-center justify-center p-1 md:p-0.5 md:min-w-0 md:min-h-0 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
        aria-label="Remove quick access item"
      >
        <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </button>
      <Link
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 hover:shadow-sm hover:border-primary-300 hover:bg-slate-50 transition-all cursor-pointer"
      >
        <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src={link.iconUrl} alt={link.title} className="w-4 h-4 object-contain" />
        </div>
        <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-700 transition-colors whitespace-nowrap">
          {link.title}
        </span>
      </Link>
    </div>
  );
}
