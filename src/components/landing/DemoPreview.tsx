import Image from 'next/image';
import {
  Star,
  ShoppingCart,
  Tv2,
  Wrench,
  Search,
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
      { title: 'Prime Video', domain: 'primevideo.com', url: 'https://primevideo.com' },
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
  {
    id: 'ferramentas',
    title: 'Ferramentas',
    Icon: Wrench,
    links: [
      { title: 'Figma', domain: 'figma.com', url: 'https://figma.com' },
      { title: 'Notion', domain: 'notion.so', url: 'https://notion.so' },
      { title: 'GitHub', domain: 'github.com', url: 'https://github.com' },
    ],
    iconBg: '#EDE9FE',
    iconText: '#4C1D95',
    insetColor: 'rgba(139, 92, 246, 0.22)',
  },
];

const quickAccessLinks = [
  { title: 'Gmail', domain: 'gmail.com' },
  { title: 'GitHub', domain: 'github.com' },
  { title: 'Notion', domain: 'notion.so' },
  { title: 'Figma', domain: 'figma.com' },
];

function GoogleLogoMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

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

      {/* Links area */}
      <div
        className="mx-2 mb-1.5 rounded-lg p-2 space-y-0.5"
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

      {/* Add link footer */}
      <div className="px-3 pb-2.5 pt-0.5">
        <span className="text-[10px] text-slate-400 font-medium">+ Adicionar link</span>
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
          <div className="bg-[#F8FAFC] p-4 sm:p-6">

            {/* Greeting bar */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-700 leading-none">Bom dia!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Segunda, 12 de maio</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-500">JD</span>
              </div>
            </div>

            {/* Google search bar mockup */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 mb-3 shadow-sm">
              <GoogleLogoMini />
              <span className="text-xs text-slate-400 flex-1">Pesquisar no Google...</span>
              <Search className="w-3 h-3 text-slate-300" />
            </div>

            {/* Quick Access Row */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Acesso Rápido</p>
              <div className="flex items-center gap-2 flex-wrap">
                {quickAccessLinks.map((link) => (
                  <div
                    key={link.domain}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm"
                  >
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
                      alt=""
                      width={12}
                      height={12}
                      className="w-3 h-3 rounded-sm flex-shrink-0 object-contain"
                      unoptimized
                    />
                    <span className="text-[10px] font-semibold text-slate-600">{link.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category cards — 2 cols on small, 4 cols on larger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
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
