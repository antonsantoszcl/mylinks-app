'use client';

import { useRef, useState } from 'react';
import { Contact } from '@/lib/types';
import { MiniCard, buildChannels } from './MiniCard';
import { ContactForm } from './ContactForm';
import { MessageCircle } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [showMini, setShowMini] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  const channels = buildChannels(contact);

  const handleClick = () => {
    if (channels.length === 0) return;
    // Always open MiniCard (even with 1 channel), so the user can also edit
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
          hover:bg-slate-100 active:bg-slate-200
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
            <MessageCircle className="w-4 h-4 text-slate-400" />
          )}
        </span>

        {/* Contact name */}
        <span className="text-sm md:text-xs font-medium text-slate-700 md:text-slate-600 truncate leading-tight">
          {contact.name}
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
