type Props = {
  className?: string;
  children?: React.ReactNode;
};

/**
 * The Ticket-like Strip along the right edge.
 * Positioned at ~78.5vw (meeting the user's white line guide).
 * Features chunky, bold ticket perforation cut marks (dash 22px, gap 12px, stroke 5px)
 * matching the visual weight of the cloud's black ink outline.
 * Elements inside are TBD.
 */
export default function TicketStrip({ className = "", children }: Props) {
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

      {children}
    </aside>
  );
}
