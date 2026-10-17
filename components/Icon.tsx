import type { ReactNode, SVGProps } from "react";

// Small ink drawings share one grid and stroke; theme colours come from the text.
const drawings = {
  newspaper: <><path d="M5 4h15v14a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V8h3v10a2 2 0 0 0 2 2M8 7h9M8 16h9M13 10h4m-4 3h4" /><path d="M8 10h3v3H8z" /></>,
  parliament: <><path d="m3 9 9-6 9 6H3Zm0 11h18M5 17h14M6 11v6m4-6v6m4-6v6m4-6v6" /><path d="M12 3V1h4v2" /></>,
  markets: <><path d="M3 3v17h18M6 13l4-4 4 3 6-7m-5 0h5v5" /><path d="M7 17h2m3 0h2m3 0h2" /></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="1" /><path d="M9 9h6v6H9zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" /></>,
  flask: <><path d="M9 3h6m-5 0v6L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M7 15h10" /><circle cx="11" cy="18" r=".7" fill="currentColor" stroke="none" /><circle cx="14" cy="12" r=".7" fill="currentColor" stroke="none" /></>,
  trophy: <><path d="M7 3h10v5c0 4-2 6-5 6S7 12 7 8V3Zm0 2H3v2c0 3 2 4 5 4m9-6h4v2c0 3-2 4-5 4M12 14v5m-4 2h8m-7-2h6" /></>,
  theatre: <><path d="m3 4 10 2-1 7c-.5 3-3 5-5 5s-4-3-4-6V4Zm11 5 7-2v8c0 3-2 6-4 6-1.5 0-3-1-4-3M5 9l2 1m2 0 2-1m-6 4c1 2 3 2 4 1m7-1 1-1m2 0 1 1m-5 4c1-1 3-1 4 0" /></>,
  dice: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" /><circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="7" cy="17" r="1.2" fill="currentColor" stroke="none" /><circle cx="17" cy="17" r="1.2" fill="currentColor" stroke="none" /></>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
  moon: <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  refresh: <><path d="M20 10a8 8 0 1 0-1 7M20 4v6h-6" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof drawings;

export default function Icon({ name, size = 24, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {drawings[name]}
    </svg>
  );
}
