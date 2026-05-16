'use client';

import { useRef, useState, useEffect, FormEvent } from 'react';
import { useProfile, getInitials, SocialLink, ToolItem } from '@/context/ProfileContext';
import { usePublicData, PublicLink } from '@/context/PublicDataContext';
import { useActiveDashboard } from '@/context/ActiveDashboardContext';
import { useRouter } from 'next/navigation';
import {
  User, Camera, Save, CheckCircle, Plus, Trash2,
  Mail, Phone, Tag, Globe, Wrench, AlignLeft, Sparkles,
  Link2, Pencil, X, ArrowLeft,
} from 'lucide-react';

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
        <span className="text-primary-500">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700">{children}</label>;
}

const INPUT_CLS =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-50 transition-all';

const PLATFORM_OPTIONS = [
  'Instagram', 'YouTube', 'LinkedIn', 'Twitter', 'GitHub',
  'TikTok', 'Spotify', 'WhatsApp', 'Beehiiv', 'Outro',
];

// ─── Public Link Item ─────────────────────────────────────────────────────────

function PublicLinkItem({ link }: { link: PublicLink }) {
  const { updateLink, deleteLink } = usePublicData();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    updateLink(link.id, title, url);
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(link.title);
    setUrl(link.url);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="border border-primary-200 rounded-xl overflow-hidden bg-primary-50/30">
        <form onSubmit={handleSave} className="p-3 space-y-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo do link"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com"
            type="url"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group/link">
      <Link2 className="w-4 h-4 text-slate-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{link.title}</p>
        <p className="text-xs text-slate-400 truncate">{link.url}</p>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1.5 text-slate-300 hover:text-primary-500 transition-colors opacity-0 group-hover/link:opacity-100 flex-shrink-0"
        title="Editar"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => deleteLink(link.id)}
        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/link:opacity-100 flex-shrink-0"
        title="Remover"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { publicData, addLink } = usePublicData();
  const { activeDashboardId, setActiveDashboard } = useActiveDashboard();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio);
  const [contactEmail, setContactEmail] = useState(profile.contactEmail);
  const [contactPhone, setContactPhone] = useState(profile.contactPhone);
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(profile.areasOfInterest);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(profile.socialLinks);
  const [tools, setTools] = useState<ToolItem[]>(profile.tools);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // New social link form
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialHandle, setNewSocialHandle] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // New tool form
  const [showToolForm, setShowToolForm] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolUrl, setNewToolUrl] = useState('');

  // New interest input
  const [newInterest, setNewInterest] = useState('');

  // New public link form
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Sync form with profile once Supabase data loads
  useEffect(() => {
    if (!profileLoading && !initialized) {
      setDisplayName(profile.displayName);
      setAvatarUrl(profile.avatarUrl);
      setAvatarPreview(profile.avatarUrl);
      setTagline(profile.tagline);
      setBio(profile.bio);
      setContactEmail(profile.contactEmail);
      setContactPhone(profile.contactPhone);
      setAreasOfInterest(profile.areasOfInterest);
      setSocialLinks(profile.socialLinks);
      setTools(profile.tools);
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, profileLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAvatarUrl(url);
    setAvatarPreview(url);
  };

  const handleSave = () => {
    updateProfile({
      displayName: displayName.trim() || profile.displayName,
      avatarUrl,
      tagline: tagline.trim(),
      bio: bio.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      areasOfInterest,
      socialLinks,
      tools,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddLink = (e: FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    addLink(newLinkTitle, newLinkUrl);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  const addSocialLink = () => {
    if (!newSocialPlatform.trim()) return;
    const link: SocialLink = {
      id: crypto.randomUUID(),
      platform: newSocialPlatform.trim(),
      handle: newSocialHandle.trim(),
      url: newSocialUrl.trim(),
    };
    setSocialLinks((prev) => [...prev, link]);
    setNewSocialPlatform('');
    setNewSocialHandle('');
    setNewSocialUrl('');
    setShowSocialForm(false);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((s) => s.id !== id));
  };

  const addTool = () => {
    if (!newToolName.trim()) return;
    const tool: ToolItem = {
      id: crypto.randomUUID(),
      name: newToolName.trim(),
      description: newToolDesc.trim(),
      url: newToolUrl.trim(),
    };
    setTools((prev) => [...prev, tool]);
    setNewToolName('');
    setNewToolDesc('');
    setNewToolUrl('');
    setShowToolForm(false);
  };

  const removeTool = (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  };

  const addInterest = () => {
    const val = newInterest.trim();
    if (!val || areasOfInterest.includes(val)) return;
    setAreasOfInterest((prev) => [...prev, val]);
    setNewInterest('');
  };

  const removeInterest = (area: string) => {
    setAreasOfInterest((prev) => prev.filter((a) => a !== area));
  };

  const initials = getInitials(displayName || profile.displayName);
  const sortedPublicLinks = [...publicData.links].sort((a, b) => a.order - b.order);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <header className="pt-6">
        <button
          type="button"
          onClick={() => {
            if (activeDashboardId) {
              setActiveDashboard(activeDashboardId);
              router.push('/dashboard/' + activeDashboardId);
            } else {
              router.push('/dashboard');
            }
          }}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos Painéis
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Configuracoes de Perfil</h1>
        <p className="text-slate-500 mt-1">Personalize seu perfil publico em mylinks.com/me</p>
      </header>

      {/* Photo + Basic */}
      <SectionCard title="Foto de Perfil" icon={<Camera className="w-4 h-4" />}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-100 bg-primary-100 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarPreview('')}
                />
              ) : (
                <span className="text-2xl font-bold text-primary-600">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
              title="Enviar foto"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-sm text-slate-500">Clique no icone para enviar uma imagem do dispositivo</p>
        </div>

        <div className="space-y-2">
          <FieldLabel>
            <Camera className="inline w-4 h-4 mr-1.5 text-slate-400" />
            URL da foto de perfil
          </FieldLabel>
          <input
            type="url"
            value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
            onChange={handleUrlChange}
            placeholder="https://exemplo.com/foto.jpg"
            className={INPUT_CLS}
          />
          <p className="text-xs text-slate-400">Cole uma URL de imagem ou use o upload acima.</p>
        </div>
      </SectionCard>

      {/* Identity */}
      <SectionCard title="Identidade" icon={<User className="w-4 h-4" />}>
        <div className="space-y-2">
          <FieldLabel>
            <User className="inline w-4 h-4 mr-1.5 text-slate-400" />
            Nome de exibicao
          </FieldLabel>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome"
            className={INPUT_CLS}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>
            <Sparkles className="inline w-4 h-4 mr-1.5 text-slate-400" />
            Tagline
          </FieldLabel>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ex: Designer, criador de conteudo e empreendedor"
            className={INPUT_CLS}
            maxLength={120}
          />
          <p className="text-xs text-slate-400">Exibida em roxo no seu perfil publico.</p>
        </div>

        <div className="space-y-2">
          <FieldLabel>
            <AlignLeft className="inline w-4 h-4 mr-1.5 text-slate-400" />
            Bio
          </FieldLabel>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre voce..."
            rows={4}
            className={INPUT_CLS + ' resize-none'}
            maxLength={500}
          />
          <p className="text-xs text-slate-400">{bio.length}/500 caracteres</p>
        </div>
      </SectionCard>

      {/* ── Links — pagina publica ── */}
      <SectionCard title="Links" icon={<Link2 className="w-4 h-4" />}>
        <p className="text-sm text-slate-500 -mt-2">
          Adicione links para sua pagina publica. Cada link aparece como um card com titulo e URL.
        </p>

        {sortedPublicLinks.length > 0 && (
          <ul className="space-y-2">
            {sortedPublicLinks.map((link) => (
              <PublicLinkItem key={link.id} link={link} />
            ))}
          </ul>
        )}

        {showAddLink ? (
          <form onSubmit={handleAddLink} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              autoFocus
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              placeholder="Titulo (ex: Meu canal no YouTube)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            />
            <input
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              type="url"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowAddLink(false); setNewLinkTitle(''); setNewLinkUrl(''); }}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                Adicionar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddLink(true)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar link
          </button>
        )}
      </SectionCard>

      {/* Social Links */}
      <SectionCard title="Redes Sociais" icon={<Globe className="w-4 h-4" />}>
        {socialLinks.length > 0 && (
          <ul className="space-y-2">
            {socialLinks.map((s) => (
              <li key={s.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 capitalize">{s.platform}</p>
                  <p className="text-xs text-slate-400 truncate">{s.handle || s.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(s.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {showSocialForm ? (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Plataforma</label>
              <select
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                className={INPUT_CLS + ' py-2'}
              >
                <option value="">Selecione...</option>
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Arroba / Handle</label>
              <input
                type="text"
                value={newSocialHandle}
                onChange={(e) => setNewSocialHandle(e.target.value)}
                placeholder="@usuario"
                className={INPUT_CLS + ' py-2'}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">URL do perfil</label>
              <input
                type="url"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="https://instagram.com/usuario"
                className={INPUT_CLS + ' py-2'}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowSocialForm(false)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300">
                Cancelar
              </button>
              <button type="button" onClick={addSocialLink} className="px-3 py-1.5 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                Adicionar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSocialForm(true)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar rede social
          </button>
        )}
      </SectionCard>

      {/* Contato */}
      <SectionCard title="Contato" icon={<Mail className="w-4 h-4" />}>
        <div className="space-y-2">
          <FieldLabel>
            <Mail className="inline w-4 h-4 mr-1.5 text-slate-400" />
            Email
          </FieldLabel>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className={INPUT_CLS}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>
            <Phone className="inline w-4 h-4 mr-1.5 text-slate-400" />
            WhatsApp / Telefone
          </FieldLabel>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+55 11 99999-9999"
            className={INPUT_CLS}
          />
        </div>
      </SectionCard>

      {/* Tools */}
      <SectionCard title="Ferramentas que uso" icon={<Wrench className="w-4 h-4" />}>
        {tools.length > 0 && (
          <ul className="space-y-2">
            {tools.map((t) => (
              <li key={t.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{t.name}</p>
                  {t.description && <p className="text-xs text-slate-400 truncate">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeTool(t.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {showToolForm ? (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Nome da ferramenta</label>
              <input
                type="text"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="Ex: Notion, Figma, VS Code..."
                className={INPUT_CLS + ' py-2'}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Descricao breve</label>
              <input
                type="text"
                value={newToolDesc}
                onChange={(e) => setNewToolDesc(e.target.value)}
                placeholder="Para que voce usa"
                className={INPUT_CLS + ' py-2'}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">URL</label>
              <input
                type="url"
                value={newToolUrl}
                onChange={(e) => setNewToolUrl(e.target.value)}
                placeholder="https://notion.so"
                className={INPUT_CLS + ' py-2'}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowToolForm(false)} className="px-3 py-1.5 text-sm rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300">
                Cancelar
              </button>
              <button type="button" onClick={addTool} className="px-3 py-1.5 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                Adicionar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowToolForm(true)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar ferramenta
          </button>
        )}
      </SectionCard>

      {/* Areas of Interest */}
      <SectionCard title="Areas de Interesse" icon={<Tag className="w-4 h-4" />}>
        {areasOfInterest.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {areasOfInterest.map((area) => (
              <span
                key={area}
                className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium border border-primary-100"
              >
                {area}
                <button
                  type="button"
                  onClick={() => removeInterest(area)}
                  className="text-primary-400 hover:text-red-500 transition-colors ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
            placeholder="Ex: Design, Marketing, Tecnologia..."
            className={INPUT_CLS + ' flex-1'}
          />
          <button
            type="button"
            onClick={addInterest}
            className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center gap-4 pb-4">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/30"
        >
          <Save className="w-4 h-4" />
          Salvar alteracoes
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            Salvo com sucesso!
          </span>
        )}
      </div>
    </div>
  );
}
