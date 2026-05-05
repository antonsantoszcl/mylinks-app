import Image from 'next/image';
import {
  Star,
  ShoppingCart,
  Tv2,
  Wrench,
} from 'lucide-react';

interface DemoLink {
  title: string;
  domain: string;
  url: string;
}

interface DemoCategory {
  id: string;
  title: string;
  Icon: React.ElementType;
  links: DemoLink[];
}

const demoCategories: DemoCategory[] = [
  {
    id: 'meus-favoritos',
    title: 'Meus Favoritos',
    Icon: Star,
    links: [
      { title: 'YouTube', domain: 'youtube.com', url: 'https://youtube.com' },
      { title: 'Gmail', domain: 'gmail.com', url: 'https://gmail.com' },
      { title: 'Google Drive', domain: 'drive.google.com', url: 'https://drive.google.com' },
      { title: 'ChatGPT', domain: 'chat.openai.com', url: 'https://chat.openai.com' },
    ],
  },
  {
    id: 'compras',
    title: 'Compras',
    Icon: ShoppingCart,
    links: [
      { title: 'Amazon', domain: 'amazon.com.br', url: 'https://amazon.com.br' },
      { title: 'Mercado Livre', domain: 'mercadolivre.com.br', url: 'https://mercadolivre.com.br' },
      { title: 'Shopee', domain: 'shopee.com.br', url: 'https://shopee.com.br' },
    ],
  },
  {
    id: 'entretenimento',
    title: 'Entretenimento',
    Icon: Tv2,
    links: [
      { title: 'Netflix', domain: 'netflix.com', url: 'https://netflix.com' },
      { title: 'Spotify', domain: 'spotify.com', url: 'https://spotify.com' },
      { title: 'Twitch', domain: 'twitch.tv', url: 'https://twitch.tv' },
      { title: 'Disney+', domain: 'disneyplus.com', url: 'https://disneyplus.com' },
    ],
  },
  {
    id: 'uteis',
    title: 'Úteis',
    Icon: Wrench,
    links: [
      { title: 'Google Maps', domain: 'maps.google.com', url: 'https://maps.google.com' },
      { title: 'ClimaTempo', domain: 'climatempo.com.br', url: 'https://climatempo.com.br' },
      { title: 'Wikipedia', domain: 'pt.wikipedia.org', url: 'https://pt.wikipedia.org' },
    ],
  },
];

function DemoCategoryCard({ category }: { category: DemoCategory }) {
  const { Icon, title, links } = category;
  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col">
      <header className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-primary-100/50 text-primary-600 flex-shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-semibold text-slate-700 truncate">{title}</h3>
        <span className="ml-auto bg-slate-100 text-slate-400 text-xs font-medium px-1.5 rounded-full leading-4 flex-shrink-0">
          {links.length}
        </span>
      </header>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.domain + link.title}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-primary-50 group/link transition-colors"
            >
              <Image
                src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                unoptimized
              />
              <span className="text-xs text-slate-600 group-hover/link:text-primary-600 transition-colors truncate">
                {link.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DemoPreview() {
  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4 border border-primary-100">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Preview ao vivo
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Veja como fica seu dashboard
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Organize seus links favoritos em categorias e acesse tudo com um clique.
          </p>
        </div>

        {/* Browser chrome mockup */}
        <div className="relative mx-auto max-w-3xl rounded-2xl shadow-2xl shadow-primary-100/60 border border-slate-200 overflow-hidden">
          {/* Browser top bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-400 max-w-sm mx-auto text-center border border-slate-200">
                alllinks.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-slate-50 p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {demoCategories.map((cat) => (
                <DemoCategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Exemplo de dashboard — o seu pode ser totalmente personalizado
        </p>
      </div>
    </section>
  );
}
