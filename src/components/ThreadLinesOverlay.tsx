import React, { useEffect, useState } from 'react';

interface ThreadLinesOverlayProps {
  activeIssueId: string | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ThreadLinesOverlay: React.FC<ThreadLinesOverlayProps> = ({
  activeIssueId,
  containerRef,
}) => {
  const [coords, setCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(
    null
  );

  useEffect(() => {
    if (!activeIssueId || !containerRef.current) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      const container = containerRef.current;
      if (!container) return;

      const spanEl = document.getElementById(`draft-span-${activeIssueId}`);
      const cardEl = document.getElementById(`finding-card-${activeIssueId}`);

      if (!spanEl || !cardEl) {
        setCoords(null);
        return;
      }

      const cRect = container.getBoundingClientRect();
      const sRect = spanEl.getBoundingClientRect();
      const cdRect = cardEl.getBoundingClientRect();

      const x1 = sRect.right - cRect.left;
      const y1 = sRect.top + sRect.height / 2 - cRect.top;

      const x2 = cdRect.left - cRect.left;
      const y2 = cdRect.top + cdRect.height / 2 - cRect.top;

      setCoords({ x1, y1, x2, y2 });
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [activeIssueId, containerRef]);

  if (!coords) return null;

  const dx = Math.abs(coords.x2 - coords.x1) * 0.5;
  const pathD = `M ${coords.x1} ${coords.y1} C ${coords.x1 + dx} ${coords.y1}, ${
    coords.x2 - dx
  } ${coords.y2}, ${coords.x2} ${coords.y2}`;

  return (
    <svg className="absolute inset-0 pointer-events-none z-30 w-full h-full overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke="#139A93"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        className="opacity-80 animate-pulse"
      />
      <circle cx={coords.x1} cy={coords.y1} r="4" fill="#139A93" />
      <circle cx={coords.x2} cy={coords.y2} r="4" fill="#0B1B3A" />
    </svg>
  );
};
