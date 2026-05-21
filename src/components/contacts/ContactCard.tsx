'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Contact } from '@/lib/types';
import { MiniCard, buildChannels } from './MiniCard';
import { ContactForm } from './ContactForm';
import { useContacts } from '@/context/ContactsContext';
import { MessagesSquare, Pencil, Trash2, ArrowLeftRight } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [showMini, setShowMini] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [moveMenuPos, setMoveMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const moveButtonRef = useRef<HTMLSpanElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const { deleteContact, updateContact, sections } = useContacts();

  const channels = buildChannels(contact);

  // Other sections the contact can move to (exclude current and CONTATOS FREQUENTES)
  const otherSections = sections.filter(
    (s) => s.id !== contact.sectionId && s.title !== 'CONTATOS FREQUENTES'
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Excluir "${contact.name}"?`)) {
      deleteContact(contact.id);
    }
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
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node) &&
          moveButtonRef.current && !moveButtonRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoveMenu]);

  const handleClick = () => {
    if (channels.length === 0) return;
    if (channels.length === 1) {
      window.open(channels[0].url, '_blank');
      return;
    }
    // 2+ channels → show MiniCard
    const rect = cardRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(rect);
    setShowMini(true);
  };

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onClick={handleClick}
        disabled={channels.length === 0}
        className="
          flex items-center gap-2 w-full
          pl-3 pr-0 py-2 md:px-2 md:py-1.5
          rounded-lg
          text-left
          transition-colors duration-100
          hover:bg-white/70 active:bg-white/90
          disabled:opacity-40 disabled:cursor-default
          group/contact
        "
      >
        {/* Channel icon */}
        <span
          className="flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-4 md:h-4"
          aria-hidden="true"
        >
          {channels.length === 1 ? (
            <span style={{ color: channels[0].iconColor }}>
              {channels[0].icon}
            </span>
          ) : (
            <MessagesSquare className="w-4 h-4 text-slate-400" />
          )}
        </span>

        {/* Contact name */}
        <span className="text-sm md:text-xs font-medium text-slate-700 md:text-slate-600 truncate leading-tight flex-1">
          {contact.name}
        </span>

        {/* Action icons — aligned with section header icons */}
        <span className="flex items-center gap-0 flex-shrink-0 md:mr-0 relative">
          {/* Pencil edit button */}
          <span
            role="button"
            aria-label="Editar contato"
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
            className="flex-shrink-0 flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-[24px] md:min-h-[24px] md:p-0.5 rounded text-[#d4dce8] hover:text-primary-500 hover:bg-primary-50 transition-colors md:text-slate-400 md:opacity-0 md:group-hover/contact:opacity-100"
          >
            <Pencil className="w-5 h-5 md:w-3 md:h-3" />
          </span>

          {/* Move to section button */}
          {otherSections.length > 0 && (
            <span
              ref={moveButtonRef}
              role="button"
              aria-label="Mover para outra seção"
              onClick={toggleMoveMenu}
              className="flex-shrink-0 flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-[24px] md:min-h-[24px] md:p-0.5 rounded text-[#d4dce8] hover:text-primary-500 hover:bg-primary-50 transition-colors md:text-slate-400 md:opacity-0 md:group-hover/contact:opacity-100"
            >
              <ArrowLeftRight className="w-5 h-5 md:w-3 md:h-3" />
            </span>
          )}

          {/* Trash delete button */}
          <span
            role="button"
            aria-label="Excluir contato"
            onClick={handleDelete}
            className="flex-shrink-0 flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-[24px] md:min-h-[24px] md:p-0.5 rounded text-[#d4dce8] hover:text-red-500 hover:bg-red-50 transition-colors md:text-slate-400 md:opacity-0 md:group-hover/contact:opacity-100"
          >
            <Trash2 className="w-5 h-5 md:w-3 md:h-3" />
          </span>

          {/* Move menu rendered via portal */}
        </span>
      </button>

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
              className="w-full text-left text-xs text-slate-700 px-3 py-1.5 hover:bg-slate-100 cursor-pointer truncate"
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
    </>
  );
}
