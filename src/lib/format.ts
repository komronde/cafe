export function formatUZS(n: number): string {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${s} UZS`;
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return (
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Tashkent" }) +
    ", " +
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tashkent" })
  );
}

export function digitsOnly(s: string): string {
  return s.replace(/[^\d]/g, "");
}

export function telegramHref(handle: string): string {
  if (!handle) return "#";
  if (handle.startsWith("http")) return handle;
  return `https://t.me/${handle.replace(/^@/, "")}`;
}

export function instagramHref(handle: string): string {
  if (!handle) return "#";
  if (handle.startsWith("http")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}
