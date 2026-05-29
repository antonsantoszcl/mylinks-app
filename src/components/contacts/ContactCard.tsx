'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Contact } from '@/lib/types';
import { MiniCard, buildChannels, openEmail } from './MiniCard';
import { ContactForm } from './ContactForm';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useContacts } from '@/context/ContactsContext';
import { useAuth } from '@/context/AuthContext';
import { MessagesSquare, Pencil, Trash2, ArrowLeftRight } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  isInFrequentes?: boolean;
}

export function ContactCard({ contact, isInFrequentes }: ContactCardProps) {
  const [showMini, setShowMini] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [moveMenuPos, setMoveMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const { deleteContact, updateContact, sections } = useContacts();
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const channels = buildChannels(contact);

  // Other sections the contact can move to
  // Contacts in Frequentes section don't get move icon
  // Normal section contacts can move to other sections (excluding their own)
  const otherSections = isInFrequentes ? [] : sections.filter(
    (s) => s.title !== 'CONTATOS FREQUENTES' && s.id !== contact.sectionId
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleMove = (e: React.MouseEvent, targetSectionId: string) => {
    e.stopPropagation();
    updateContact(contact.id, { sectionId: targetSectionId });
    setShowMoveMenu(false);
  };

  const toggleMoveMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showMoveMenu) {
      setShowMoveMenu(false);
      return;
    }
    const btn = moveButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeight = (otherSections.length + 1) * 28 + 16; // estimate
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4;
    const left = Math.min(rect.right, window.innerWidth - 170);
    setMoveMenuPos({ top, left });
    setShowMoveMenu(true);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showMoveMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      // Use bounding rect to cover scrollbar clicks
      if (moveMenuRef.current) {
        const rect = moveMenuRef.current.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) return;
      }
      if (moveButtonRef.current && moveButtonRef.current.contains(e.target as Node)) return;
      setShowMoveMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoveMenu]);

  const handleClick = () => {
    if (channels.length === 0) return;
    if (channels.length === 1 && channels[0].key !== 'email') {
      window.open(channels[0].url, '_blank');
      return;
    }
    if (channels.length === 1 && channels[0].key === 'email') {
      openEmail(userEmail, contact.email!);
      return;
    }
    // 2+ channels or single email → show MiniCard (email needs provider picker)
    const rect = cardRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(rect);
    setShowMini(true);
  };

  return (
    <>
      <div
        ref={cardRef}
        className="group/contact flex items-center justify-between py-[5px] md:py-[6px] pl-1.5 pr-0 rounded-lg hover:bg-white/70 transition-all cursor-pointer"
        onClick={channels.length > 0 ? handleClick : undefined}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
            aria-hidden="true"
          >
            {channels.length > 1 ? (
              (() => {
                // Fixed positions: WhatsApp=top-left, Instagram=top-right, Email=bottom-left, LinkedIn=bottom-right
                const positionMap: Record<string, number> = { whatsapp: 0, instagram: 1, email: 2, linkedin: 3 };
                const slots: (string | null)[] = [null, null, null, null];
                channels.slice(0, 4).forEach((ch) => {
                  const pos = positionMap[ch.key] ?? slots.indexOf(null);
                  if (pos !== -1) slots[pos] = ch.iconColor;
                });
                return (
                  <span
                    className="w-5 h-5 flex-shrink-0 rounded-[4px] border-[1.5px] border-slate-400 bg-white inline-grid"
                    style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px', padding: '3px' }}
                  >
                    {slots.map((color, i) => (
                      <span
                        key={i}
                        className="rounded-full"
                        style={{ width: '5px', height: '5px', backgroundColor: color || 'transparent' }}
                      />
                    ))}
                  </span>
                );
              })()
            ) : channels.length === 1 ? (
              <span style={{ color: channels[0].iconColor }}>
                {channels[0].icon}
              </span>
            ) : (
              <MessagesSquare className="w-5 h-5 text-slate-400" />
            )}
          </span>
          <span className="text-sm md:text-[12px] font-semibold font-manrope text-slate-700 md:text-slate-600 truncate flex-1" style={{ fontWeight: 600 }}>
            {contact.name}
          </span>
        </div>

        <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0 -mr-2">
          <button
            className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-primary-500 rounded opacity-100 md:opacity-0 md:group-hover/contact:opacity-100 transition-opacity"
            title="Editar contato"
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
          >
            <Pencil className="w-5 h-5 md:w-3 md:h-3" />
          </button>

          {otherSections.length > 0 && (
            <button
              ref={moveButtonRef}
              className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-primary-500 rounded opacity-100 md:opacity-0 md:group-hover/contact:opacity-100 transition-opacity"
              title="Mover para outra seção"
              onClick={toggleMoveMenu}
            >
              <ArrowLeftRight className="w-5 h-5 md:w-3 md:h-3" />
            </button>
          )}

          <button
            className="flex items-center justify-center min-w-[32px] min-h-[32px] md:min-w-0 md:min-h-0 md:w-auto md:h-auto md:p-1 text-[#d4dce8] md:text-slate-300 hover:text-red-500 rounded opacity-100 md:opacity-0 md:group-hover/contact:opacity-100 transition-opacity"
            title="Excluir contato"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5 md:w-3 md:h-3" />
          </button>
        </div>
      </div>

      {showMoveMenu && moveMenuPos && createPortal(
        <div
          ref={moveMenuRef}
          style={{ position: 'fixed', top: moveMenuPos.top, left: moveMenuPos.left, zIndex: 9999 }}
          className="bg-white rounded-lg border border-slate-200 shadow-lg min-w-[160px] py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">Mover para</p>
          {otherSections.map((s) => (
            <button
              key={s.id}
              className="w-full text-left text-xs text-slate-700 px-3 py-1.5 hover:bg-slate-100 cursor-pointer truncate uppercase"
              onClick={(e) => handleMove(e, s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>,
        document.body
      )}

      {showMini && (
        <MiniCard
          contact={contact}
          userEmail={userEmail}
          anchorRect={anchorRect}
          onClose={() => setShowMini(false)}
          onEdit={() => setShowEdit(true)}
        />
      )}

      {showEdit && (
        <ContactForm
          sectionId={contact.sectionId}
          contact={contact}
          onClose={() => setShowEdit(false)}
        />
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Excluir contato"
        message={`Remover o contato "${contact.name}"?`}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteContact(contact.id);
        }}
      />
    </>
  );
}
