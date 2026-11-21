import type { Settings } from "@/lib/types";

export function HoursList({ hours, dark = false }: { hours: Settings["hours"]; dark?: boolean }) {
  return (
    <ul className={`divide-y ${dark ? "divide-white/10" : "divide-sand"}`}>
      {hours.map((h) => (
        <li key={h.day} className="flex items-center justify-between py-2.5 text-sm">
          <span className={dark ? "text-cream/70" : "text-mocha/75"}>{h.day}</span>
          <span className="font-medium tabular-nums">{h.closed ? "Closed" : `${h.open} – ${h.close}`}</span>
        </li>
      ))}
    </ul>
  );
}
