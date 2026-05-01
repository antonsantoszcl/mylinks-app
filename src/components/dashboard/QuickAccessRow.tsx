import { QuickAccessLink } from '@/lib/types';
import { QuickAccessCard } from './QuickAccessCard';
import { Plus, Zap, ChevronRight } from 'lucide-react';
import { FormEvent, useState, useRef, useEffect } from 'react';

interface QuickAccessRowProps {
  links: QuickAccessLink[];
  onAdd: (title: string, url: string) => void;
  onRemove: (id: string) => void;
}

export function QuickAccessRow({ links, onAdd, onRemove }: QuickAccessRowProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [showChevron, setShowChevron] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onAdd(title, url);
    setTitle('');
    setUrl('');
    setShowForm(false);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setShowChevron(!atEnd);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [links]);

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-3">
        <Zap className="w-3.5 h-3.5 text-primary-500" />
        <h2 className="text-sm font-bold text-slate-700">Acesso rapido</h2>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="quick-access-scroll flex gap-1.5 items-center overflow-x-auto pb-1 flex-nowrap sm:flex-wrap"
        >
          {links.map((link) => (
            <QuickAccessCard key={link.id} link={link} onRemove={onRemove} />
          ))}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-primary-600 hover:border-primary-300 transition-all text-xs font-medium flex-shrink-0 min-h-[44px]"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          ) : (
            <form onSubmit={submit} className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm w-full sm:w-auto">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titulo"
                className="rounded border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-300 flex-1 min-w-[80px] min-h-[36px]"
                autoFocus
              />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL"
                className="rounded border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-300 flex-1 min-w-[100px] min-h-[36px]"
              />
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-2 py-1.5 text-xs rounded bg-slate-100 text-slate-600 min-h-[36px]"
              >
                X
              </button>
              <button
                type="submit"
                className="px-2 py-1.5 text-xs rounded bg-primary-600 text-white min-h-[36px]"
              >
                OK
              </button>
            </form>
          )}
        </div>

        {/* Chevron hint — mobile only, hidden when scrolled to end */}
        {showChevron && (
          <div className="quick-access-chevron pointer-events-none absolute right-0 top-0 bottom-1 flex items-center">
            <div className="w-8 h-full bg-gradient-to-l from-[#EEF2F7] to-transparent" />
            <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mr-0.5" style={{ opacity: 0.45 }} />
          </div>
        )}
      </div>
    </section>
  );
}
