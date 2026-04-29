import { Category, Link, QuickAccessLink, RecentAccess, UserProfile } from './types';

export const mockUser: UserProfile = {
  id: '1',
  username: 'ricardo',
  displayName: 'Ricardo',
  bio: 'Software Engineer & Creator',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  isPro: false,
};

export const mockQuickAccess: QuickAccessLink[] = [
  { id: '1', title: 'Gmail', url: 'https://mail.google.com', iconUrl: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=64' },
  { id: '2', title: 'WhatsApp', url: 'https://web.whatsapp.com', iconUrl: 'https://www.google.com/s2/favicons?domain=web.whatsapp.com&sz=64' },
  { id: '3', title: 'Google Drive', url: 'https://drive.google.com', iconUrl: 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=64' },
  { id: '4', title: 'YouTube', url: 'https://youtube.com', iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
];

export const mockCategories: Category[] = [
  { id: 'c1', title: 'Trabalho', iconName: 'Briefcase', order: 1 },
  { id: 'c2', title: 'Estudos', iconName: 'BookOpen', order: 2 },
  { id: 'c3', title: 'Compras', iconName: 'ShoppingCart', order: 3 },
  { id: 'c4', title: 'Entretenimento', iconName: 'Film', order: 4 },
  { id: 'c5', title: 'Financas', iconName: 'DollarSign', order: 5 },
  { id: 'c6', title: 'Pessoal', iconName: 'User', order: 6 },
];

export const mockLinks: Link[] = [
  { id: 'l1', categoryId: 'c1', title: 'Notion', url: 'https://notion.so', iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=32', order: 1 },
  { id: 'l2', categoryId: 'c1', title: 'Figma', url: 'https://figma.com', iconUrl: 'https://www.google.com/s2/favicons?domain=figma.com&sz=32', order: 2 },
  { id: 'l3', categoryId: 'c2', title: 'Coursera', url: 'https://coursera.org', iconUrl: 'https://www.google.com/s2/favicons?domain=coursera.org&sz=32', order: 1 },
  { id: 'l4', categoryId: 'c2', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', iconUrl: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=32', order: 2 },
  { id: 'l5', categoryId: 'c3', title: 'Amazon', url: 'https://amazon.com', iconUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32', order: 1 },
  { id: 'l6', categoryId: 'c3', title: 'Mercado Livre', url: 'https://mercadolivre.com.br', iconUrl: 'https://www.google.com/s2/favicons?domain=mercadolivre.com.br&sz=32', order: 2 },
  { id: 'l7', categoryId: 'c4', title: 'Netflix', url: 'https://netflix.com', iconUrl: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=32', order: 1 },
  { id: 'l8', categoryId: 'c4', title: 'Spotify', url: 'https://spotify.com', iconUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=32', order: 2 },
  { id: 'l9', categoryId: 'c5', title: 'Nubank', url: 'https://nubank.com.br', iconUrl: 'https://www.google.com/s2/favicons?domain=nubank.com.br&sz=32', order: 1 },
  { id: 'l10', categoryId: 'c5', title: 'Investing', url: 'https://investing.com', iconUrl: 'https://www.google.com/s2/favicons?domain=investing.com&sz=32', order: 2 },
  { id: 'l11', categoryId: 'c6', title: 'Google Calendar', url: 'https://calendar.google.com', iconUrl: 'https://www.google.com/s2/favicons?domain=calendar.google.com&sz=32', order: 1 },
  { id: 'l12', categoryId: 'c6', title: 'LinkedIn', url: 'https://linkedin.com', iconUrl: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32', order: 2 },
];

export const mockRecentAccess: RecentAccess[] = [
  { id: 'r1', title: 'Figma', url: 'https://figma.com', iconUrl: 'https://www.google.com/s2/favicons?domain=figma.com&sz=32', accessedAtLabel: 'ha 5 min' },
  { id: 'r2', title: 'YouTube', url: 'https://youtube.com', iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32', accessedAtLabel: 'ha 18 min' },
  { id: 'r3', title: 'Google Drive', url: 'https://drive.google.com', iconUrl: 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=32', accessedAtLabel: 'ha 37 min' },
  { id: 'r4', title: 'Notion', url: 'https://notion.so', iconUrl: 'https://www.google.com/s2/favicons?domain=notion.so&sz=32', accessedAtLabel: 'ha 1 h' },
];