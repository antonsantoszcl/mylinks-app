import { QuickAccessLink } from '@/lib/types';
import { QuickAccessCard } from './QuickAccessCard';
import { Plus, Zap } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface QuickAccessRowProps {
  links: QuickAccessLink[];
  onAdd: (title: string, url: string) => void;
  onRemove: (id: string) => void;
}

export function QuickAccessRow({ links, onAdd, onRemove }: QuickAccessRowProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onAdd(title, url);
    setTitle('');
    setUrl('');
    setShowForm(false);
  };

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Zap className="w-3.5 h-3.5 text-primary-500" />
        <h2 className="text-xs font-semibold text-slate-600">Acesso rapido</h2>
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        {links.map((link) => (
          <QuickAccessCard key={link.id} link={link} onRemove={onRemove} />
        ))}

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-primary-600 hover:border-primary-300 transition-all text-xs font-medium"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </button>
        ) : (
          <form onSubmit={submit} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo"
              className="rounded border border-slate-200 px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary-300 w-24"
              autoFocus
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              className="rounded border border-slate-200 px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary-300 w-32"
            />
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600"
            >
              X
            </button>
            <button
              type="submit"
              className="px-2 py-0.5 text-xs rounded bg-primary-600 text-white"
            >
              OK
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
