'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Pencil } from 'lucide-react';
import { Contact } from '@/lib/types';

// ── Channel icons (inline SVGs for precision) ─────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ── Channel helpers ────────────────────────────────────────────────────────────

type ChannelKey = 'whatsapp' | 'instagram' | 'email' | 'linkedin';

interface Channel {
  key: ChannelKey;
  label: string;
  url: string;
  icon: React.ReactNode;
  iconColor: string;
}

function buildChannels(contact: Contact): Channel[] {
  const channels: Channel[] = [];
  if (contact.whatsapp) {
    const num = contact.whatsapp.replace(/\D/g, '');
    channels.push({
      key: 'whatsapp',
      label: 'WhatsApp',
      url: `https://wa.me/${num}`,
      icon: <WhatsAppIcon className="w-5 h-5" />,
      iconColor: '#25D366',
    });
  }
  if (contact.instagram) {
    const user = contact.instagram.replace(/^@/, '');
    channels.push({
      key: 'instagram',
      label: 'Instagram',
      url: `https://instagram.com/${user}`,
      icon: <InstagramIcon className="w-5 h-5" />,
      iconColor: '#E1306C',
    });
  }
  if (contact.email) {
    channels.push({
      key: 'email',
      label: 'Email',
      url: `mailto:${contact.email}`,
      icon: <EmailIcon className="w-5 h-5" />,
      iconColor: '#64748B',
    });
  }
  if (contact.linkedin) {
    const slug = contact.linkedin.replace(/^@/, '');
    channels.push({
      key: 'linkedin',
      label: 'LinkedIn',
      url: `https://linkedin.com/in/${slug}`,
      icon: <LinkedInIcon className="w-5 h-5" />,
      iconColor: '#0A66C2',
    });
  }
  return channels;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface MiniCardProps {
  contact: Contact;
  /** Position of the anchor element (getBoundingClientRect) — desktop only */
  anchorRect: DOMRect | null;
  onClose: () => void;
  /** Optional: open the edit form for this contact */
  onEdit?: () => void;
}

export function MiniCard({ contact, anchorRect, onClose, onEdit }: MiniCardProps) {
  const channels = buildChannels(contact);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click / tap
  useEffect(() => {
    const handleDown = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const tid = setTimeout(() => {
      document.addEventListener('mousedown', handleDown);
      document.addEventListener('touchstart', handleDown, { passive: true });
    }, 0);
    return () => {
      clearTimeout(tid);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('touchstart', handleDown);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Compute popup style
  const popupStyle: React.CSSProperties = { position: 'fixed', zIndex: 9999 };
  if (isMobile || !anchorRect) {
    // Centre on screen
    popupStyle.top = '50%';
    popupStyle.left = '50%';
    popupStyle.transform = 'translate(-50%, -50%)';
  } else {
    // Position near card — below and left-aligned, flip up if too close to bottom
    const POPUP_HEIGHT = channels.length * 44 + 48; // estimate
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    if (spaceBelow < POPUP_HEIGHT && anchorRect.top > POPUP_HEIGHT) {
      popupStyle.bottom = window.innerHeight - anchorRect.top + 4;
    } else {
      popupStyle.top = anchorRect.bottom + 4;
    }
    // Align left edge, clamp to viewport right
    const left = Math.min(anchorRect.left, window.innerWidth - 200);
    popupStyle.left = Math.max(8, left);
  }

  const popup = (
    <>
      {/* Mobile backdrop */}
      {(isMobile || !anchorRect) && (
        <div
          className="fixed inset-0 bg-black/30 z-[9998]"
          onClick={onClose}
        />
      )}
      <div
        ref={popupRef}
        style={popupStyle}
        className="bg-white rounded-lg shadow-lg border border-slate-200 min-w-[180px] py-2 overflow-hidden"
      >
        {/* Contact name + edit button */}
        <div className="px-3 pb-1.5 border-b border-slate-100 mb-1 flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-slate-800 truncate">{contact.name}</p>
          {onEdit && (
            <button
              type="button"
              onClick={() => { onEdit(); onClose(); }}
              className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-primary-500 hover:bg-slate-100 transition-colors"
              title="Editar contato"
              aria-label="Editar contato"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Channels */}
        {channels.map((ch) => (
          <a
            key={ch.key}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-slate-700 text-sm"
          >
            <span style={{ color: ch.iconColor }} className="flex-shrink-0">
              {ch.icon}
            </span>
            <span className="text-[13px]">{ch.label}</span>
          </a>
        ))}
      </div>
    </>
  );

  return createPortal(popup, document.body);
}

// Re-export helpers for ContactCard
export { buildChannels };
export type { Channel };
