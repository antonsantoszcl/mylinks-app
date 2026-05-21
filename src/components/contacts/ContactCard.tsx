'use client';

import { useRef, useState } from 'react';
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
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
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
              role="button"
              aria-label="Mover para outra seção"
              onClick={(e) => { e.stopPropagation(); setShowMoveMenu((v) => !v); }}
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

          {/* Move to section dropdown */}
          {showMoveMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-50 min-w-[160px] py-1"
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
            </div>
          )}
        </span>
      </button>

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
