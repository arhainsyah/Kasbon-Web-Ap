/** Rp 1.234.000 */
export function formatRupiah(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp ${new Intl.NumberFormat("id-ID").format(Math.abs(value))}`;
}

/** Tanggal lokal hari ini sebagai YYYY-MM-DD */
export function todayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "hari ini", "kemarin", "3 hari lalu", "2 minggu lalu", "besok", "dalam 5 hari" */
export function relativeDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (diff === 0) return "hari ini";
  if (diff === 1) return "kemarin";
  if (diff === -1) return "besok";
  if (diff < 0) return `dalam ${-diff} hari`;
  if (diff < 7) return `${diff} hari lalu`;
  if (diff < 30) return `${Math.floor(diff / 7)} minggu lalu`;
  if (diff < 365) return `${Math.floor(diff / 30)} bulan lalu`;
  return `${Math.floor(diff / 365)} tahun lalu`;
}

export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(y, m - 1, d));
}
