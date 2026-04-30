import Image from 'next/image';
import {
  Star,
  Users,
  Newspaper,
  ShoppingCart,
  Banknote,
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
    links: [],
  },
  {
    id: 'redes-sociais',
    title: 'Redes Sociais',
    Icon: Users,
    links: [
      { title: 'Facebook', domain: 'facebook.com', url: 'https://facebook.com' },
      { title: 'WhatsApp', domain: 'web.whatsapp.com', url: 'https://web.whatsapp.com' },
      { title: 'Instagram', domain: 'instagram.com', url: 'https://instagram.com' },
      { title: 'TikTok', domain: 'tiktok.com', url: 'https://tiktok.com' },
      { title: 'X.com', domain: 'x.com', url: 'https://x.com' },
    ],
  },
  {
    id: 'noticias',
    title: 'Noticias',
    Icon: Newspaper,
    links: [
      { title: 'Globo.com', domain: 'globo.com', url: 'https://globo.com' },
      { title: 'UOL', domain: 'uol.com.br', url: 'https://uol.com.br' },
      { title: 'CNN', domain: 'cnnbrasil.com.br', url: 'https://cnnbrasil.com.br' },
      { title: 'msn', domain: 'msn.com', url: 'https://msn.com' },
      { title: 'Yahoo', domain: 'yahoo.com.br', url: 'https://yahoo.com.br' },
    ],
  },
  {
    id: 'compras',
    title: 'Compras',
    Icon: ShoppingCart,
    links: [
      { title: 'Buscape', domain: 'buscape.com.br', url: 'https://buscape.com.br' },
      { title: 'Mercado Livre', domain: 'mercadolivre.com.br', url: 'https://mercadolivre.com.br' },
      { title: 'Amazon', domain: 'amazon.com.br', url: 'https://amazon.com.br' },
      { title: 'Shopee', domain: 'shopee.com.br', url: 'https://shopee.com.br' },
      { title: 'Tudo Celular', domain: 'tudocelular.com', url: 'https://tudocelular.com' },
    ],
  },
  {
    id: 'financas',
    title: 'Financas',
    Icon: Banknote,
    links: [
      { title: 'Banco do Brasil', domain: 'bb.com.br', url: 'https://bb.com.br' },
      { title: 'Itau', domain: 'itau.com.br', url: 'https://itau.com.br' },
      { title: 'Infomoney', domain: 'infomoney.com.br', url: 'https://infomoney.com.br' },
      { title: 'Yahoo Finance', domain: 'finance.yahoo.com', url: 'https://finance.yahoo.com' },
      { title: 'Calculadora do Cidadao', domain: 'calculadoradocidadao.com.br', url: 'https://calculadoradocidadao.com.br' },
    ],
  },
  {
    id: 'entretenimento',
    title: 'Entretenimento',
    Icon: Tv2,
    links: [
      { title: 'Youtube', domain: 'youtube.com', url: 'https://youtube.com' },
      { title: 'Netflix', domain: 'netflix.com', url: 'https://netflix.com' },
      { title: 'Spotify', domain: 'spotify.com', url: 'https://spotify.com' },
      { title: 'Globo Esporte', domain: 'ge.globo.com', url: 'https://ge.globo.com' },
      { title: 'Series', domain: 'justwatch.com', url: 'https://justwatch.com' },
    ],
  },
  {
    id: 'uteis',
    title: 'Uteis',
    Icon: Wrench,
    links: [
      { title: 'Gov.br', domain: 'gov.br', url: 'https://gov.br' },
      { title: 'Wikipedia', domain: 'pt.wikipedia.org', url: 'https://pt.wikipedia.org' },
      { title: 'ClimaTempo', domain: 'climatempo.com.br', url: 'https://climatempo.com.br' },
      { title: 'Calculadora', domain: 'google.com', url: 'https://google.com/search?q=calculadora' },
      { title: 'Google Maps', domain: 'maps.google.com', url: 'https://maps.google.com' },
    ],
  },
];

function DemoCategoryCard({ category }: { category: DemoCategory }) {
  const { Icon, title, links } = category;
  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-col">
      <header className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-slate-100">
        <div className="p-1 rounded-lg bg-primary-100/50 text-primary-600 flex-shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-semibold text-slate-700 truncate">{title}</h3>
        <span className="ml-auto bg-slate-100 text-slate-400 text-xs font-medium px-1.5 rounded-full leading-4 flex-shrink-0">
          {links.length}
        </span>
      </header>
      <ul className="space-y-0.5">
        {links.map((link) => (
          <li key={link.domain + link.title}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-primary-50 group/link transition-colors"
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
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4 border border-primary-100">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Preview ao vivo
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Veja como fica seu dashboard
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Organize seus links favoritos em categorias e acesse tudo com um clique.
          </p>
        </div>

        {/* Browser chrome mockup */}
        <div className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl shadow-primary-100/60 border border-slate-200 overflow-hidden">
          {/* Browser top bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-400 max-w-sm mx-auto text-center border border-slate-200">
                mylinks.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-slate-50 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
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
