'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { getInitials } from '@/context/ProfileContext';
import Link from 'next/link';
import {
  Globe, Share2, Mail, Phone, ExternalLink, CheckCircle,
  Instagram, Youtube, Linkedin, Twitter, Github,
  BadgeCheck, Link2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type PublicProfileData = {
  displayName: string;
  avatarUrl: string;
  tagline: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: Array<{ id: string; platform: string; handle: string; url: string }>;
  publicLinks: Array<{ id: string; title: string; url: string; order: number }>;
};

// ─── Platform icon helpers ────────────────────────────────────────────────────

type PlatformCfg = { color: string; bg: string };
const PLATFORM_CFG: Record<string, PlatformCfg> = {
  instagram: { color: 'text-pink-600',  bg: 'bg-pink-50'   },
  youtube:   { color: 'text-red-600',   bg: 'bg-red-50'    },
  linkedin:  { color: 'text-blue-600',  bg: 'bg-blue-50'   },
  twitter:   { color: 'text-sky-500',   bg: 'bg-sky-50'    },
  x:         { color: 'text-slate-700', bg: 'bg-slate-100' },
  github:    { color: 'text-slate-700', bg: 'bg-slate-100' },
  spotify:   { color: 'text-green-600', bg: 'bg-green-50'  },
  whatsapp:  { color: 'text-green-600', bg: 'bg-green-50'  },
  tiktok:    { color: 'text-slate-900', bg: 'bg-slate-100' },
};

function platformCfg(p: string): PlatformCfg {
  return PLATFORM_CFG[p.toLowerCase()] ?? { color: 'text-primary-600', bg: 'bg-primary-50' };
}

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const cls = className ?? 'w-4 h-4';
  const p = platform.toLowerCase();
  if (p === 'instagram') return <Instagram className={cls} />;
  if (p === 'youtube')   return <Youtube   className={cls} />;
  if (p === 'linkedin')  return <Linkedin  className={cls} />;
  if (p === 'twitter' || p === 'x') return <Twitter className={cls} />;
  if (p === 'github')    return <Github    className={cls} />;
  return <Globe className={cls} />;
}

function safeHostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || url; }
}

function safeFaviconUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function load() {
      // Fetch profile by username
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const userId = profile.id as string;

      // Fetch public links + social links in parallel
      const [publicLinksRes, socialLinksRes] = await Promise.all([
        supabase
          .from('public_links')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order'),
        supabase
          .from('social_links')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order'),
      ]);

      setData({
        displayName: (profile.display_name as string) || username,
        avatarUrl: (profile.avatar_url as string) || '',
        tagline: (profile.tagline as string) || '',
        bio: (profile.bio as string) || '',
        contactEmail: (profile.contact_email as string) || '',
        contactPhone: (profile.contact_phone as string) || '',
        socialLinks: (socialLinksRes.data ?? []).map((s) => ({
          id: s.id as string,
          platform: s.platform as string,
          handle: s.handle as string,
          url: s.url as string,
        })),
        publicLinks: (publicLinksRes.data ?? []).map((l) => ({
          id: l.id as string,
          title: l.title as string,
          url: l.url as string,
          order: l.sort_order as number,
        })),
      });

      setLoading(false);
    }

    load();
  }, [username]);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: data?.displayName ?? username, url: pageUrl });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl font-bold text-slate-300">404</div>
        <p className="text-slate-500">Perfil <span className="font-semibold">@{username}</span> não encontrado.</p>
        <Link href="/" className="text-sm text-primary-600 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  if (!data) return null;

  const initials = getInitials(data.displayName);
  const hasSocial  = data.socialLinks.length > 0;
  const hasContact = !!(data.contactEmail || data.contactPhone);
  const hasLinks   = data.publicLinks.length > 0;
  const sortedLinks = [...data.publicLinks].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Nav ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            MyLinks
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/30"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Compartilhar'}
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── A) Profile Header ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-primary-500 to-primary-700" />

          <div className="px-4 sm:px-8 pb-6 sm:pb-8">
            <div className="-mt-12 mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white bg-primary-100 flex items-center justify-center shadow-md">
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600">{initials}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {data.displayName}
              </h1>
              <BadgeCheck className="w-6 h-6 text-primary-600 flex-shrink-0" />
            </div>

            {data.tagline && (
              <p className="text-primary-600 font-semibold text-sm mb-2">{data.tagline}</p>
            )}

            {data.bio && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg mb-4">{data.bio}</p>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {data.contactEmail && (
                <a
                  href={`mailto:${data.contactEmail}`}
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 min-h-[44px]"
                >
                  <Mail className="w-4 h-4" />
                  Entrar em contato
                </a>
              )}
              {data.contactPhone && (
                <a
                  href={`https://wa.me/${data.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary-200 text-primary-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors min-h-[44px]"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── B) Links ── */}
        {hasLinks && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Links</h2>
              <p className="text-sm text-slate-400 mt-0.5">Minha presença online</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {sortedLinks.map((link) => {
                  const favicon = safeFaviconUrl(link.url);
                  return (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {favicon ? (
                            <img
                              src={favicon}
                              alt={link.title}
                              className="w-5 h-5 object-contain"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <Link2 className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                            {link.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{safeHostname(link.url)}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* ── C) Redes Sociais ── */}
        {hasSocial && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Redes Sociais</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.socialLinks.map((s) => {
                const cfg = platformCfg(s.platform);
                return (
                  <a
                    key={s.id}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <PlatformIcon platform={s.platform} className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 capitalize">{s.platform}</p>
                      <p className="text-xs text-slate-400 truncate">{s.handle || safeHostname(s.url)}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ── D) Contato ── */}
        {hasContact && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Contato</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2">
              {data.contactEmail && (
                <a
                  href={`mailto:${data.contactEmail}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-500" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-primary-600 transition-colors">{data.contactEmail}</span>
                </a>
              )}
              {data.contactPhone && (
                <a
                  href={`https://wa.me/${data.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-primary-600 transition-colors">{data.contactPhone}</span>
                </a>
              )}
            </div>
          </section>
        )}

      </div>

      {/* ── E) Footer ── */}
      <footer className="text-center py-8 text-sm text-slate-400 border-t border-slate-200 mt-4 bg-white">
        Feito com <span className="text-red-400">♥</span> por{' '}
        <Link href="/" className="text-primary-600 font-medium hover:underline">
          MyLinks
        </Link>
        {' '}&middot;{' '}
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
