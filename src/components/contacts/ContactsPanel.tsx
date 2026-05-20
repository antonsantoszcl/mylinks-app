'use client';

import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useContacts } from '@/context/ContactsContext';
import { useActiveDashboard } from '@/context/ActiveDashboardContext';
import { ContactCard } from './ContactCard';
import { ContactForm } from './ContactForm';
import { Contact } from '@/lib/types';
import { QuickAccessRow } from '@/components/dashboard/QuickAccessRow';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Inbox,
  LayoutGrid,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';

// ── Color palette — mirrors CATEGORY_COLORS from CategoryCard ─────────────────
const SECTION_COLORS = [
  { insetColor: 'rgba(251, 188, 5, 0.38)',   insetColorMobile: 'rgba(251, 188, 5, 0.50)',   accentText: '#78716C' },
  { insetColor: 'rgba(52, 168, 120, 0.22)',  insetColorMobile: 'rgba(52, 168, 120, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(234, 126, 60, 0.22)',  insetColorMobile: 'rgba(234, 126, 60, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(24, 119, 242, 0.22)',  insetColorMobile: 'rgba(24, 119, 242, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(101, 183, 72, 0.22)',  insetColorMobile: 'rgba(101, 183, 72, 0.38)',  accentText: '#78716C' },
  { insetColor: 'rgba(236, 100, 140, 0.22)', insetColorMobile: 'rgba(236, 100, 140, 0.38)', accentText: '#78716C' },
];

// FREQUENTES always uses the golden color (index 0)
const FREQUENT_COLOR = SECTION_COLORS[0];

function getIsMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

// ── Section card header with inline rename ────────────────────────────────────

interface SectionCardHeaderProps {
  title: string;
  isFrequents?: boolean;
  accentText: string;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
  onAddContact?: () => void;
  // drag handle (desktop)
  onDragHandleMouseDown?: (e: React.MouseEvent) => void;
  // mobile reorder
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

function SectionCardHeader({
  title,
  isFrequents,
  accentText,
  onRename,
  onDelete,
  onAddContact,
  onDragHandleMouseDown,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SectionCardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => { setDraft(title); }, [title]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const save = () => {
    const clean = draft.trim();
    if (clean && clean !== title && onRename) {
      onRename(clean);
    } else {
      setDraft(title);
    }
    setEditing(false);
  };

  return (
    <header className="flex items-center justify-between px-3 py-2.5 md:py-2 rounded-t-xl md:rounded-t-[10px]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isFrequents && (
          <Star className="w-4 h-4 md:w-3.5 md:h-3.5 text-amber-400 fill-amber-300 flex-shrink-0" />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          {editing && onRename ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') { setDraft(title); setEditing(false); }
              }}
              className="text-xs font-semibold text-slate-800 border border-primary-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-300 w-full bg-white"
            />
          ) : (
            <h3
              className={`text-sm md:text-[13px] font-semibold truncate text-slate-700 tracking-tight ${onRename ? 'cursor-text' : ''}`}
              style={{ textTransform: 'uppercase' }}
              onClick={() => { if (onRename) setEditing(true); }}
            >
              {title}
            </h3>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0 md:gap-0.5 flex-shrink-0">
        {/* Plus — always visible */}
        {onAddContact && (
          <button
            className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:bg-white/60 rounded transition-colors"
            aria-label="Adicionar contato"
            onClick={onAddContact}
          >
            <Plus className="w-5 h-5 md:w-3.5 md:h-3.5" />
          </button>
        )}

        {/* Pencil — desktop: hover only; mobile: always visible */}
        {onRename && !editing && (
          <button
            className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
            onClick={() => setEditing(true)}
            aria-label="Editar seção"
          >
            <Pencil className="w-4 h-4 md:w-3 md:h-3" />
          </button>
        )}

        {/* GripVertical — desktop only, hover only */}
        {!isFrequents && onDragHandleMouseDown && !isMobile && (
          <button
            className="hidden md:flex items-center justify-center md:p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-grab active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
            aria-label="Arrastar seção"
            onMouseDown={onDragHandleMouseDown}
          >
            <GripVertical className="w-3 h-3" />
          </button>
        )}

        {/* ChevronUp / ChevronDown — mobile only */}
        {!isFrequents && isMobile && onMoveUp && (
          <button
            className="flex md:hidden items-center justify-center min-w-[28px] min-h-[28px] text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Mover seção para cima"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {!isFrequents && isMobile && onMoveDown && (
          <button
            className="flex md:hidden items-center justify-center min-w-[28px] min-h-[28px] text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Mover seção para baixo"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Trash — desktop: hover only; mobile: always visible */}
        {onDelete && (
          <button
            className="flex items-center justify-center min-w-[28px] min-h-[28px] md:min-w-0 md:min-h-0 md:p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
            onClick={onDelete}
            aria-label="Excluir seção"
          >
            <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
          </button>
        )}
      </div>
    </header>
  );
}

// ── Single section card — mirrors CategoryCard visual exactly ─────────────────

interface ContactSectionCardProps {
  title: string;
  contacts: Contact[];
  colorIndex: number;
  isFrequents?: boolean;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
  onAddContact?: () => void;
  // drag and drop
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLElement>) => void;
  onDragOver?: (e: DragEvent<HTMLElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLElement>) => void;
  onDrop?: (e: DragEvent<HTMLElement>) => void;
  draggable?: boolean;
  // mobile reorder
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

function ContactSectionCard({
  title,
  contacts,
  colorIndex,
  isFrequents,
  onRename,
  onDelete,
  onAddContact,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  draggable,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ContactSectionCardProps) {
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const color = isFrequents ? FREQUENT_COLOR : SECTION_COLORS[colorIndex % SECTION_COLORS.length];
  // Track whether drag started via the grip handle
  const dragFromHandle = useRef(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const inset = isMobile ? color.insetColorMobile : color.insetColor;

  const ringStyle: React.CSSProperties = isDragOver
    ? { outline: '2px solid #7CB3F4', outlineOffset: '1px' }
    : {};

  return (
    <article
      draggable={draggable && !isFrequents}
      onDragStart={(e) => {
        if (!dragFromHandle.current) { e.preventDefault(); return; }
        onDragStart?.(e);
      }}
      onDragEnd={(e) => { dragFromHandle.current = false; onDragEnd?.(e); }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="rounded-xl md:rounded-[10px] flex flex-col group category-card hover:-translate-y-0.5"
      style={{
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: `inset ${isMobile ? '3px' : '2px'} 0 0 ${inset}, 0 6px 16px rgba(0,0,0,0.05)`,
        transition: 'all 0.2s ease-out',
        opacity: isDragging ? 0.5 : 1,
        ...ringStyle,
      }}
      onMouseEnter={(e) => {
        if (isDragging || isDragOver) return;
        const el = e.currentTarget;
        el.style.boxShadow = `inset ${isMobile ? '3px' : '2px'} 0 0 ${inset}, 0 8px 24px rgba(0,0,0,0.10)`;
      }}
      onMouseLeave={(e) => {
        if (isDragging || isDragOver) return;
        const el = e.currentTarget;
        el.style.boxShadow = `inset ${isMobile ? '3px' : '2px'} 0 0 ${inset}, 0 6px 16px rgba(0,0,0,0.05)`;
      }}
    >
      <SectionCardHeader
        title={title}
        isFrequents={isFrequents}
        accentText={color.accentText}
        onRename={onRename}
        onDelete={onDelete}
        onAddContact={onAddContact}
        onDragHandleMouseDown={draggable && !isFrequents ? (e) => { dragFromHandle.current = true; } : undefined}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />

      {/* Body */}
      <div className="mx-2 rounded-xl md:rounded-[10px] flex-1 overflow-y-auto custom-scrollbar p-2.5 card-body-inner">
        {contacts.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-16 text-slate-400 gap-1">
            <Inbox className="w-5 h-5 opacity-20" />
            <p className="text-xs">
              {isFrequents ? 'Nenhum contato frequente' : 'Nenhum contato'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {isFrequents ? (
        <div className="mx-2 mb-2 mt-1 px-3 py-2 text-center">
          <p className="text-xs text-slate-400 italic">Assinale frequente ao incluir um contato</p>
        </div>
      ) : onAddContact && (
        <div className="mx-2 mb-2 mt-1 px-2 py-1.5 rounded-b-xl">
          <button
            type="button"
            className="text-sm md:text-xs font-medium hover:opacity-75 transition-opacity flex items-center gap-1 min-h-[24px] md:min-h-0 py-0.5 md:py-0"
            style={{ color: color.accentText }}
            onClick={onAddContact}
          >
            <Plus className="w-3 h-3" />
            Adicionar contato
          </button>
        </div>
      )}
    </article>
  );
}

// ── Add-section card — mirrors the "Nova seção" card in CategoryGrid ──────────

interface AddSectionCardProps {
  onCreate: (title: string) => void;
}

function AddSectionCard({ onCreate }: AddSectionCardProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onCreate(value.trim());
    setValue('');
    setOpen(false);
  };

  return (
    <article
      className="rounded-2xl border border-dashed border-slate-200/80 p-2 flex flex-col hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out"
      style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">Nova seção</span>
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800">Nova seção</h3>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nome da seção"
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-300"
            autoFocus
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => { setOpen(false); setValue(''); }}
              className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 min-h-[44px] md:min-h-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-xs rounded-lg bg-primary-600 text-white hover:bg-primary-700 min-h-[44px] md:min-h-0"
            >
              Criar
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

// ── Masonry grid — mirrors CategoryGrid layout engine ────────────────────────

const GAP = 16;

function getColumnCount(width: number): number {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

interface ItemLayout {
  top: number;
  left: number;
  width: number;
}

interface ContactGridProps {
  // ordered list: [frequents, ...userSections, addCard]
  children: React.ReactNode[];
}

function ContactGrid({ children }: ContactGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layouts, setLayouts] = useState<ItemLayout[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [measured, setMeasured] = useState(false);
  const total = children.length;

  const calculateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    if (containerWidth === 0) return;

    const numCols = getColumnCount(containerWidth);
    const colWidth = (containerWidth - GAP * (numCols - 1)) / numCols;
    const colHeights = new Array(numCols).fill(0) as number[];
    const newLayouts: ItemLayout[] = [];

    for (let i = 0; i < total; i++) {
      const el = itemRefs.current[i];
      const itemHeight = el ? el.offsetHeight : 0;
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[shortestCol];
      const left = shortestCol * (colWidth + GAP);
      newLayouts.push({ top, left, width: colWidth });
      colHeights[shortestCol] += itemHeight + GAP;
    }

    const maxHeight = Math.max(...colHeights) - GAP;
    setLayouts(newLayouts);
    setContainerHeight(maxHeight > 0 ? maxHeight : 0);
    setMeasured(true);
  }, [total]);

  useEffect(() => {
    const id = setTimeout(calculateLayout, 0);
    return () => clearTimeout(id);
  }, [calculateLayout, children]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => calculateLayout());
    ro.observe(container);
    return () => ro.disconnect();
  }, [calculateLayout]);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative w-full"
        style={{
          height: measured ? containerHeight : 'auto',
          opacity: measured ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {children.map((child, index) => {
          const layout = layouts[index];
          return (
            <div
              key={index}
              ref={(el) => { itemRefs.current[index] = el; }}
              style={
                layout
                  ? {
                      position: 'absolute',
                      top: layout.top,
                      left: layout.left,
                      width: layout.width,
                      transition: 'top 0.3s ease, left 0.3s ease',
                    }
                  : { width: '100%' }
              }
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export function ContactsPanel() {
  const {
    sections,
    contacts,
    isLoading,
    createSection,
    renameSection,
    deleteSection,
    reorderSections,
  } = useContacts();
  const {
    data,
    addQuickAccess,
    removeQuickAccess,
  } = useActiveDashboard();
  const [addContactFor, setAddContactFor] = useState<string | null>(null);

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const frequentContacts = contacts
    .filter((c) => c.isFrequent)
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const handleDragStart = useCallback((id: string) => (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((id: string) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) setDragOverId(id);
  }, [draggingId]);

  const handleDragLeave = useCallback((id: string) => (e: DragEvent<HTMLElement>) => {
    // Only clear if truly leaving the card (not entering a child)
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverId((prev) => (prev === id ? null : prev));
    }
  }, []);

  const handleDrop = useCallback((targetId: string) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const ids = sortedSections.map((s) => s.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, sourceId);

    setDraggingId(null);
    setDragOverId(null);
    reorderSections(reordered);
  }, [sortedSections, reorderSections]);

  // ── Mobile move handlers ────────────────────────────────────────────────────
  const handleMoveUp = useCallback((index: number) => () => {
    if (index <= 0) return;
    const ids = sortedSections.map((s) => s.id);
    const reordered = [...ids];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    reorderSections(reordered);
  }, [sortedSections, reorderSections]);

  const handleMoveDown = useCallback((index: number) => () => {
    if (index >= sortedSections.length - 1) return;
    const ids = sortedSections.map((s) => s.id);
    const reordered = [...ids];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    reorderSections(reordered);
  }, [sortedSections, reorderSections]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Build grid items ───────────────────────────────────────────────────────
  // Item 0: FREQUENTES card (always first, not draggable)
  const frequentesCard = (
    <ContactSectionCard
      key="frequentes"
      title="Frequentes"
      contacts={frequentContacts}
      colorIndex={0}
      isFrequents
    />
  );

  // Items 1..n: user sections
  const sectionCards = sortedSections.map((section, idx) => {
    const sectionContacts = contacts
      .filter((c) => c.sectionId === section.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    // colorIndex starts at 1 (0 is reserved for frequentes)
    return (
      <ContactSectionCard
        key={section.id}
        title={section.title}
        contacts={sectionContacts}
        colorIndex={(idx + 1) % SECTION_COLORS.length}
        onRename={(t) => renameSection(section.id, t)}
        onDelete={() => deleteSection(section.id)}
        onAddContact={() => setAddContactFor(section.id)}
        draggable
        isDragging={draggingId === section.id}
        isDragOver={dragOverId === section.id}
        onDragStart={handleDragStart(section.id)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver(section.id)}
        onDragLeave={handleDragLeave(section.id)}
        onDrop={handleDrop(section.id)}
        onMoveUp={handleMoveUp(idx)}
        onMoveDown={handleMoveDown(idx)}
        canMoveUp={idx > 0}
        canMoveDown={idx < sortedSections.length - 1}
      />
    );
  });

  // Last item: add section card
  const addCard = (
    <AddSectionCard
      key="add"
      onCreate={(title) => createSection(title)}
    />
  );

  const gridItems = [frequentesCard, ...sectionCards, addCard];

  return (
    <div className="max-w-full space-y-6 pb-8">

      {/* ── Quick Access (links, same as other panels) ── */}
      <QuickAccessRow
        links={data?.quickAccess ?? []}
        onAdd={addQuickAccess}
        onRemove={removeQuickAccess}
      />

      {/* ── Sections grid ── */}
      <section>
        <div className="flex items-center gap-1.5 mb-5">
          <div className="bg-primary-100/80 p-1 rounded-md">
            <LayoutGrid className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <h2 className="text-[15px] md:text-sm font-bold text-slate-700 tracking-tight">Seções</h2>
        </div>

        <ContactGrid>
          {gridItems}
        </ContactGrid>
      </section>

      {/* ── ContactForm modal ── */}
      {addContactFor && (
        <ContactForm
          sectionId={addContactFor}
          onClose={() => setAddContactFor(null)}
        />
      )}
    </div>
  );
}
