import { Link } from "@tanstack/react-router";

export function AqryLogo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-baseline gap-[0.1em] select-none">
      <span className="bg-gradient-brand bg-clip-text text-2xl font-black tracking-[-0.06em] text-transparent">
        AQRY
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
    </Link>
  );
}
