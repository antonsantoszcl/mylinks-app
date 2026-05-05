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
  iconBg: string;
  iconText: string;
  insetColor: string;
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
    iconBg: '#FEF9C3',
    iconText: '#713F12',
    insetColor: 'rgba(234, 179, 8, 0.28)',
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
    iconBg: '#FFEDD5',
    iconText: '#7C2D12',
    insetColor: 'rgba(234, 126, 60, 0.25)',
  },
  {
    id: 'compras',
    title: 'Compras',
    Icon: ShoppingCart,
    links: [
      { title: 'Amazon', domain: 'amazon.com.br', url: 'https://amazon.com.br' },
      { title: 'Mercado Livre', domain: 'mercadolivre.com.br', url: 'https://mercadolivre.com.br' },
      { title: 'Shopee', domain: 'shopee.com.br', url: 'https://shopee.com.br' },
      { title: 'Shein', domain: 'shein.com', url: 'https://shein.com' },
    ],
    iconBg: '#D1FAE5',
    iconText: '#065F46',
    insetColor: 'rgba(52, 168, 120, 0.25)',
  },
];

function DemoCategoryCard({ category }: { category: DemoCategory }) {
  const { Icon, title, links, iconBg, iconText, insetColor } = category;
  return (
    <article
      style={{
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: `inset 3px 0 0 ${insetColor}, 0 6px 16px rgba(0,0,0,0.05)`,
        borderRadius: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card header */}
      <header className="flex items-center gap-2 px-3 py-2.5">
        <div
          className="p-1.5 rounded-lg flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconText, opacity: 0.7 }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-semibold text-slate-800 truncate flex-1">{title}</h3>
        <span className="text-slate-400 text-xs font-medium px-1.5 rounded-full flex-shrink-0 leading-4">
          {links.length}
        </span>
      </header>

      {/* Links area — gray background matching real card body */}
      <div
        className="mx-2 mb-2 rounded-lg p-2 space-y-0.5"
        style={{ background: '#F1F5F9' }}
      >
        {links.map((link) => (
          <div
            key={link.domain + link.title}
            className="flex items-center gap-2 py-1 pl-1.5 pr-2 rounded-lg"
          >
            <Image
              src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 rounded-sm flex-shrink-0 object-contain"
              unoptimized
            />
            <span className="text-xs font-semibold text-slate-700 truncate">
              {link.title}
            </span>
          </div>
        ))}
      </div>
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

          {/* Dashboard content area */}
          <div className="bg-[#F8FAFC] p-5 sm:p-7">
            {/* Mini top bar inside preview */}
            <div className="flex items-center justify-between mb-5">
              <div className="h-3 w-24 rounded-full bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 rounded-full bg-slate-200" />
                <div className="w-6 h-6 rounded-full bg-slate-200" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
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
