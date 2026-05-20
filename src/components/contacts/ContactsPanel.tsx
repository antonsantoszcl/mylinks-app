'use client';

import { useRef, useState, useEffect } from 'react';
import { useContacts } from '@/context/ContactsContext';
import { ContactCard } from './ContactCard';
import { ContactSection } from '@/lib/types';
import { Plus, Star } from 'lucide-react';

// ── Section heading with inline rename ────────────────────────────────────────

interface SectionHeaderProps {
  section: ContactSection;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function SectionHeader({ section, onRename, onDelete }: SectionHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(section.title);
  }, [section.title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    const clean = draft.trim();
    if (clean && clean !== section.title) {
      onRename(section.id, clean);
    } else {
      setDraft(section.title);
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setDraft(section.title); setEditing(false); }
          }}
          className="
            text-[13px] font-semibold uppercase tracking-tight text-slate-700
            border border-primary-300 rounded px-1.5 py-0.5
            outline-none focus:ring-1 focus:ring-primary-400
            bg-white w-full max-w-[160px]
          "
        />
      ) : (
        <h3
          className="text-[13px] font-semibold uppercase tracking-tight text-slate-700 cursor-text select-none"
          onClick={() => setEditing(true)}
          title="Clique para renomear"
        >
          {section.title}
        </h3>
      )}
      <button
        type="button"
        onClick={() => onDelete(section.id)}
        className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
        title="Excluir seção"
      >
        ×
      </button>
    </div>
  );
}

// ── New section input ──────────────────────────────────────────────────────────

interface NewSectionInputProps {
  onCreate: (title: string) => void;
  onCancel: () => void;
}

function NewSectionInput({ onCreate, onCancel }: NewSectionInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const clean = value.trim();
    if (clean) onCreate(clean);
    else onCancel();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Nome da seção..."
        className="
          flex-1 border border-primary-300 rounded-lg px-3 py-2
          text-sm text-slate-700 bg-white
          outline-none focus:ring-1 focus:ring-primary-400
          placeholder-slate-400
        "
      />
    </div>
  );
}

// ── Section card container — matches CategoryCard visual style ─────────────────

interface SectionCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isFrequents?: boolean;
}

function SectionCard({ title, children, isFrequents }: SectionCardProps) {
  return (
    <article
      className="rounded-xl md:rounded-[10px] flex flex-col group/card"
      style={{
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: isFrequents
          ? 'inset 2px 0 0 rgba(251, 188, 5, 0.45), 0 6px 16px rgba(0,0,0,0.05)'
          : 'inset 2px 0 0 rgba(148, 163, 184, 0.22), 0 6px 16px rgba(0,0,0,0.05)',
      }}
    >
      <div className="px-3 py-2.5 md:py-2">
        {title}
        <div className="flex flex-col gap-0.5">
          {children}
        </div>
      </div>
    </article>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export function ContactsPanel() {
  const { sections, contacts, isLoading, createSection, renameSection, deleteSection } = useContacts();
  const [showNewSection, setShowNewSection] = useState(false);

  const frequentContacts = contacts.filter((c) => c.isFrequent).sort((a, b) => a.name.localeCompare(b.name));

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleCreateSection = async (title: string) => {
    setShowNewSection(false);
    await createSection(title);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-4 pb-8">

      {/* ── FREQUENTES (always visible) ── */}
      <SectionCard
        isFrequents
        title={
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
            <h3 className="text-[13px] font-semibold uppercase tracking-tight text-slate-700 select-none">
              Frequentes
            </h3>
          </div>
        }
      >
        {frequentContacts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0.5">
            {frequentContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2 px-1 italic">
            Marque contatos como frequentes para acesso rápido
          </p>
        )}
      </SectionCard>

      {/* ── User sections ── */}
      {sortedSections.map((section) => {
        const sectionContacts = contacts
          .filter((c) => c.sectionId === section.id)
          .sort((a, b) => a.name.localeCompare(b.name));

        return (
          <SectionCard
            key={section.id}
            title={
              <SectionHeader
                section={section}
                onRename={renameSection}
                onDelete={deleteSection}
              />
            }
          >
            {sectionContacts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0.5">
                {sectionContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 px-1 italic">
                Nenhum contato nesta seção
              </p>
            )}
          </SectionCard>
        );
      })}

      {/* ── New section input ── */}
      {showNewSection && (
        <NewSectionInput
          onCreate={handleCreateSection}
          onCancel={() => setShowNewSection(false)}
        />
      )}

      {/* ── Add section button ── */}
      {!showNewSection && (
        <button
          type="button"
          onClick={() => setShowNewSection(true)}
          className="
            flex items-center gap-1.5
            text-sm md:text-xs font-medium
            text-slate-500 hover:text-primary-600
            transition-colors py-1
          "
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Seção
        </button>
      )}
    </div>
  );
}
