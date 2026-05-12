'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/googleSignIn';
import { Link2, Grid3x3, Zap, ChevronRight, GripVertical } from 'lucide-react';
import { DemoPreview } from '@/components/landing/DemoPreview';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const features = [
  {
    icon: Grid3x3,
    title: 'Dashboard Privado',
    desc: 'Organize todos os seus links por categoria, do jeito que faz sentido pra você.',
  },
  {
    icon: GripVertical,
    title: 'Drag & Drop',
    desc: 'Reorganize links e categorias com um simples arrastar e soltar.',
  },
  {
    icon: Zap,
    title: 'Acesso Rápido',
    desc: 'Seus links favoritos fixados no topo para acesso instantâneo.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Crie sua conta',
    desc: 'Cadastre-se em segundos. Sem cartão de crédito, sem complicação.',
  },
  {
    step: '02',
    title: 'Organize seus links',
    desc: 'Adicione links e crie categorias do seu jeito.',
  },
  {
    step: '03',
    title: 'Acesse de qualquer lugar',
    desc: 'Use no celular, tablet ou computador. Seus links sempre à mão.',
  },
];

export default function Home() {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthenticated, router]);

  const handleOAuth = async (provider: 'google') => {
    setOauthLoading(provider);
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
      const credential = await signInWithGoogle(clientId);
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });
      if (authError) throw authError;
      router.push('/dashboard');
    } catch {
      setOauthLoading(null);
    }
  };

  if (hydrated && isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">alllinks.app</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary-50 to-transparent rounded-full blur-3xl opacity-60" />
        </div>
        <div className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-medium px-3 py-1.5 rounded-full mb-5 border border-primary-100">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Organize. Simplifique. Acesse.
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5 tracking-tight">
            A homepage que faltava.
          </h1>
          <p className="text-base sm:text-xl text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Pare de perder tempo procurando links. Organize tudo por categorias e acesse de qualquer lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 min-h-[44px]"
            >
              Criar minha página grátis
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-slate-600 font-medium px-5 py-3.5 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
            >
              Já tenho conta
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-600 font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors disabled:opacity-60 shadow-sm min-h-[44px]"
            >
              <GoogleIcon />
              {oauthLoading === 'google' ? 'Aguardando...' : 'Entrar com Google'}
            </button>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <DemoPreview />

      {/* Features */}
      <section className="py-14 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Tudo que você precisa</h2>
            <p className="text-slate-500 text-base">
              Simples de usar, poderoso o suficiente para organizar sua vida digital.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Como funciona</h2>
            <p className="text-slate-500 text-base">Três passos para organizar sua vida digital.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-14">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 min-h-[44px]"
            >
              Começar agora — é grátis
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center">
              <Link2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">alllinks.app</span>
          </div>
          <p className="text-xs text-slate-400">© 2024 alllinks.app. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
