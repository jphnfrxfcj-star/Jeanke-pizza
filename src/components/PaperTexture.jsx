/**
 * PaperTexture — subtiele grain-overlay SVG voor "gedrukt papier"-gevoel.
 * Plaats als absolute laag in een section; pointer-events-none + aria-hidden.
 */
export default function PaperTexture({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full opacity-[0.035] mix-blend-multiply ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="paper-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-noise)" />
    </svg>
  )
}
