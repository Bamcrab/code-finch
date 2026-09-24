type P = { className?: string };

const base = (d: React.ReactNode, className = 'w-5 h-5') => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

export const IconBack = ({ className }: P) => base(<path d="M15 18l-6-6 6-6" />, className);
export const IconChevron = ({ className }: P) => base(<path d="M9 18l6-6-6-6" />, className);
export const IconMenu = ({ className }: P) => base(<path d="M4 7h16M4 12h16M4 17h16" />, className);
export const IconPlus = ({ className }: P) => base(<path d="M12 5v14M5 12h14" />, className);
export const IconCheck = ({ className }: P) => base(<path d="M5 12.5l4.5 4.5L19 7.5" />, className);
export const IconX = ({ className }: P) => base(<path d="M6 6l12 12M18 6L6 18" />, className);
export const IconDots = ({ className }: P) =>
  base(
    <>
      <circle cx={5} cy={12} r={1.3} fill="currentColor" />
      <circle cx={12} cy={12} r={1.3} fill="currentColor" />
      <circle cx={19} cy={12} r={1.3} fill="currentColor" />
    </>,
    className,
  );
export const IconStar = ({ className, filled }: P & { filled?: boolean }) =>
  base(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" fill={filled ? 'currentColor' : 'none'} />, className);
export const IconUndo = ({ className }: P) => base(<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />, className);
export const IconSearch = ({ className }: P) =>
  base(
    <>
      <circle cx={11} cy={11} r={7} />
      <path d="M20 20l-3.5-3.5" />
    </>,
    className,
  );
export const IconRefresh = ({ className }: P) => base(<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />, className);
export const IconPlay = ({ className }: P) => base(<path d="M7 5l12 7-12 7z" fill="currentColor" />, className);
export const IconPause = ({ className }: P) => base(<path d="M8 5v14M16 5v14" />, className);
export const IconTrash = ({ className }: P) => base(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />, className);
export const IconEdit = ({ className }: P) => base(<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />, className);
export const IconCalendar = ({ className }: P) =>
  base(
    <>
      <rect x={3.5} y={5} width={17} height={15} rx={3} />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>,
    className,
  );
export const IconLink = ({ className }: P) => base(<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />, className);
