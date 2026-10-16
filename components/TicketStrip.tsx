type Props = {
  className?: string;
};

/**
 * The Ticket-like Strip along the right edge.
 * Positioned at ~78.5vw (meeting the user's white line guide).
 * Features chunky, bold ticket perforation cut marks (dash 22px, gap 12px, stroke 5px)
 * matching the visual weight of the cloud's black ink outline.
 * Elements inside are TBD.
 */
export default function TicketStrip({ className = "" }: Props) {
  return (
    <aside
      aria-label="Ticket strip"
      className={`pointer-events-auto absolute inset-x-0 bottom-0 z-20 h-[18svh] w-full bg-[#e3b5fb] md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[21.5vw] ${className}`}
    >
      {/* 1. Desktop: Chunky Ticket Perforation Line on LEFT (strictly preserved) */}
      <svg
        className="hidden md:block absolute inset-y-0 -left-[2.5px] h-full w-[5px] pointer-events-none z-30"
        preserveAspectRatio="none"
      >
        <line
          x1="2.5"
          y1="0"
          x2="2.5"
          y2="100%"
          stroke="#000000"
          strokeWidth="5"
          strokeDasharray="22 12"
        />
      </svg>

      {/* 2. Mobile: Chunky Ticket Perforation Line on TOP */}
      <svg
        className="block md:hidden absolute inset-x-0 -top-[2.5px] w-full h-[5px] pointer-events-none z-30"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="2.5"
          x2="100%"
          y2="2.5"
          stroke="#000000"
          strokeWidth="5"
          strokeDasharray="22 12"
        />
      </svg>

      {/* Desktop Inner Container (Vertical Stub, Strictly Preserved) */}
      <div className="hidden md:flex relative h-full flex-col items-center justify-between p-(--space-m) text-center select-none overflow-hidden">
        {/* Top serial marker */}
        <div className="text-[clamp(11px,0.7vw,13px)] font-mono uppercase tracking-widest text-ink/40">
          № 007
        </div>

        {/* Center stub placeholder */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display text-[clamp(14px,1vw,20px)] uppercase tracking-wider text-ink/60">
            TICKET STRIP
          </span>
          <span className="text-[clamp(10px,0.65vw,12px)] font-mono text-ink/40 uppercase">
            [ TBD ]
          </span>
        </div>

        {/* Bottom stub footer */}
        <div className="text-[clamp(10px,0.65vw,12px)] font-mono uppercase tracking-widest text-ink/30">
          LARPZ • PASS
        </div>
      </div>

      {/* Mobile Inner Container (Horizontal Stub at Bottom) */}
      <div className="flex md:hidden relative h-full items-center justify-between px-5 text-center select-none overflow-hidden">
        <span className="font-mono text-xs uppercase tracking-widest text-ink/40">
          № 007
        </span>
        <div className="flex flex-col items-center">
          <span className="font-display text-[15px] uppercase tracking-wider text-ink/60">
            TICKET STRIP
          </span>
          <span className="font-mono text-[10px] text-ink/40 uppercase">
            [ TBD ]
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink/30">
          LARPZ • PASS
        </span>
      </div>
    </aside>
  );
}
