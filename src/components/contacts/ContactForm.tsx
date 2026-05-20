'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useContacts } from '@/context/ContactsContext';
import { Contact } from '@/lib/types';

interface ContactFormProps {
  sectionId: string;
  contact?: Contact;
  onClose: () => void;
}

interface FormFields {
  name: string;
  whatsapp: string;
  instagram: string;
  email: string;
  linkedin: string;
  isFrequent: boolean;
}

export function ContactForm({ sectionId, contact, onClose }: ContactFormProps) {
  const { createContact, updateContact, deleteContact } = useContacts();
  const isEdit = !!contact;

  const [fields, setFields] = useState<FormFields>({
    name: contact?.name ?? '',
    whatsapp: contact?.whatsapp ?? '',
    instagram: contact?.instagram ?? '',
    email: contact?.email ?? '',
    linkedin: contact?.linkedin ?? '',
    isFrequent: contact?.isFrequent ?? false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  // Focus name on open
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const set = (key: keyof FormFields) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFields((prev) => ({
      ...prev,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
    if (key === 'name') setError('');
  };

  const validate = () => {
    if (!fields.name.trim()) {
      setError('O nome é obrigatório.');
      nameRef.current?.focus();
      return false;
    }
    const hasChannel =
      fields.whatsapp.trim() ||
      fields.instagram.trim() ||
      fields.email.trim() ||
      fields.linkedin.trim();
    if (!hasChannel) {
      setError('Preencha pelo menos um canal de contato.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: fields.name.trim(),
      whatsapp: fields.whatsapp.trim() || null,
      instagram: fields.instagram.trim() || null,
      email: fields.email.trim() || null,
      linkedin: fields.linkedin.trim() || null,
      isFrequent: fields.isFrequent,
    };
    if (isEdit && contact) {
      await updateContact(contact.id, payload);
    } else {
      await createContact({ sectionId, ...payload });
    }
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!contact) return;
    const ok = window.confirm(`Excluir "${contact.name}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    await deleteContact(contact.id);
    onClose();
  };

  const modal = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[9990]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          fixed z-[9991]
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white rounded-xl shadow-xl
          w-[calc(100vw-32px)] max-w-sm
          flex flex-col
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 id="contact-form-title" className="text-sm font-semibold text-slate-800">
            {isEdit ? 'Editar Contato' : 'Novo Contato'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-3 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={fields.name}
              onChange={set('name')}
              placeholder="Nome do contato"
              className="
                rounded-lg border border-slate-200 px-3 py-2 text-sm
                focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none
                placeholder-slate-400
              "
            />
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">
              WhatsApp <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={fields.whatsapp}
              onChange={set('whatsapp')}
              placeholder="5511999999999"
              className="
                rounded-lg border border-slate-200 px-3 py-2 text-sm
                focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none
                placeholder-slate-400
              "
            />
          </div>

          {/* Instagram */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">
              Instagram <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={fields.instagram}
              onChange={set('instagram')}
              placeholder="usuario (sem @)"
              className="
                rounded-lg border border-slate-200 px-3 py-2 text-sm
                focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none
                placeholder-slate-400
              "
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">
              Email <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={fields.email}
              onChange={set('email')}
              placeholder="email@exemplo.com"
              className="
                rounded-lg border border-slate-200 px-3 py-2 text-sm
                focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none
                placeholder-slate-400
              "
            />
          </div>

          {/* LinkedIn */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">
              LinkedIn <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={fields.linkedin}
              onChange={set('linkedin')}
              placeholder="slug-do-perfil"
              className="
                rounded-lg border border-slate-200 px-3 py-2 text-sm
                focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none
                placeholder-slate-400
              "
            />
          </div>

          {/* Frequent */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fields.isFrequent}
              onChange={set('isFrequent')}
              className="w-4 h-4 rounded border-slate-300 text-primary-500 accent-primary-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-600">Mostrar em Frequentes</span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100">
          {/* Delete (edit mode only) */}
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="
                  text-xs font-medium text-red-500 hover:text-red-600
                  px-3 py-2 rounded-lg hover:bg-red-50
                  transition-colors
                "
              >
                Excluir
              </button>
            )}
          </div>

          {/* Cancel + Save */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="
                text-xs font-medium text-slate-500 hover:text-slate-700
                px-3 py-2 rounded-lg hover:bg-slate-100
                transition-colors
              "
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="
                text-xs font-medium text-white
                bg-primary-500 hover:bg-primary-600
                px-4 py-2 rounded-lg
                transition-colors disabled:opacity-60
              "
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
