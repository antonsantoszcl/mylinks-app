'use client';

import { useRef, useState } from 'react';
import { Contact } from '@/lib/types';
import { MiniCard, buildChannels } from './MiniCard';
import { ContactForm } from './ContactForm';
import { useContacts } from '@/context/ContactsContext';
import { MessagesSquare, Pencil, Trash2 } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [showMini, setShowMini] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const { deleteContact } = useContacts();

  const channels = buildChannels(contact);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Excluir "${contact.name}"?`)) {
      deleteContact(contact.id);
    }
  };

  const handleClick = () => {
    if (channels.length === 0) return;
    if (channels.length === 1) {
      const url = channels[0].url;
      if (channels[0].key === 'email') {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
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
          px-2.5 py-2 md:px-2 md:py-1.5
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

        {/* Pencil edit button */}
        <span
          role="button"
          aria-label="Editar contato"
          onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
          className="flex-shrink-0 flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-0.5 rounded text-slate-400/75 hover:text-primary-500 hover:bg-primary-50 transition-colors md:text-slate-400 md:opacity-0 md:group-hover/contact:opacity-100"
        >
          <Pencil className="w-4 h-4 md:w-3 md:h-3" />
        </span>

        {/* Trash delete button */}
        <span
          role="button"
          aria-label="Excluir contato"
          onClick={handleDelete}
          className="flex-shrink-0 flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-0.5 rounded text-slate-400/75 hover:text-red-500 hover:bg-red-50 transition-colors md:text-slate-400 md:opacity-0 md:group-hover/contact:opacity-100"
        >
          <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
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
