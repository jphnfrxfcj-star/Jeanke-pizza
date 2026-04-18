/**
 * SectionLabel — kleine typografische kop met "N° {n}" prefix en goud-ornament.
 *
 * Props:
 *   n      — sectienummer (string of number), bv. "01" of "I"
 *   title  — korte kop (italic serif), bv. "Il Menù"
 *   caption — optionele kleine caption eronder
 *   align  — "center" (default) | "left"
 */
export default function SectionLabel({ n, title, caption, align = 'center' }) {
  const alignCls = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  const rowJustify = align === 'left' ? 'justify-start' : 'justify-center'

  return (
    <div className={`flex flex-col ${alignCls} gap-3`}>
      <div className={`flex items-center gap-3 ${rowJustify} font-sans text-[10px] tracking-[0.32em] uppercase text-gold`}>
        <span className="h-px w-6 bg-gold/40" />
        <span className="font-serif italic text-wine tracking-normal text-sm leading-none">N° {n}</span>
        <span>·</span>
        <span>{title}</span>
        <span className="h-px w-6 bg-gold/40" />
      </div>
      {caption && (
        <p className="font-serif italic text-warm-gray text-sm max-w-xl">
          {caption}
        </p>
      )}
    </div>
  )
}
