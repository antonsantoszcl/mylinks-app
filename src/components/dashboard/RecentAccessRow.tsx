import Link from 'next/link';
import { RecentAccess } from '@/lib/types';
import { History } from 'lucide-react';

interface RecentAccessRowProps {
  items: RecentAccess[];
}

export function RecentAccessRow({ items }: RecentAccessRowProps) {
  return (
    <section>
      <div className="flex items-center gap-1.5 mb-1.5">
        <History className="w-3.5 h-3.5 text-primary-500" />
        <h2 className="text-xs font-bold text-slate-600">Ultimos acessados</h2>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:shadow-sm hover:border-primary-300 transition-all group"
          >
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0">
              <img src={item.iconUrl} alt={item.title} className="w-4 h-4 object-contain" />
            </div>
            <span className="text-xs font-medium text-slate-700 group-hover:text-primary-700 transition-colors">{item.title}</span>
            <span className="text-xs text-slate-400">{item.accessedAtLabel}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
