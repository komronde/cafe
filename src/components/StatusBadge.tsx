const STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-900",
  preparing: "bg-amber-100 text-amber-900",
  ready: "bg-violet-100 text-violet-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-red-100 text-red-900",
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
        STYLES[status] ?? "bg-sand text-mocha"
      }`}
    >
      {status}
    </span>
  );
}
