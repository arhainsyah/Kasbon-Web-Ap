import type { Debt } from "@/lib/types";

export type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_desc", label: "Tanggal: terbaru" },
  { value: "date_asc", label: "Tanggal: terlama" },
  { value: "amount_desc", label: "Jumlah: terbesar" },
  { value: "amount_asc", label: "Jumlah: terkecil" },
];

/** Total hanya dari catatan yang belum lunas. */
export function computeTotals(debts: Debt[]) {
  let owedToMe = 0;
  let iOwe = 0;
  for (const d of debts) {
    if (d.settled_at) continue;
    if (d.type === "owed_to_me") owedToMe += d.amount;
    else iOwe += d.amount;
  }
  return { owedToMe, iOwe, net: owedToMe - iOwe };
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export function searchDebts(debts: Debt[], query: string): Debt[] {
  const q = normalize(query);
  if (!q) return debts;
  return debts.filter((d) => normalize(d.counterpart_name).includes(q));
}

const byDateDesc = (a: Debt, b: Debt) =>
  b.debt_date.localeCompare(a.debt_date) || b.created_at.localeCompare(a.created_at);

export function sortDebts(debts: Debt[], sort: SortKey): Debt[] {
  const list = [...debts];
  switch (sort) {
    case "date_asc":
      return list.sort((a, b) => -byDateDesc(a, b));
    case "amount_desc":
      return list.sort((a, b) => b.amount - a.amount || byDateDesc(a, b));
    case "amount_asc":
      return list.sort((a, b) => a.amount - b.amount || byDateDesc(a, b));
    default:
      return list.sort(byDateDesc);
  }
}

export interface DebtGroup {
  key: string;
  name: string;
  debts: Debt[];
  openCount: number; // jumlah entry belum lunas
  net: number; // + = dia hutang ke saya, - = saya hutang ke dia (belum lunas saja)
  latestDate: string;
}

/** Kelompokkan per orang (nama dinormalisasi: "budi", "Budi " dan "BUDI" jadi satu). */
export function groupByPerson(debts: Debt[], sort: SortKey): DebtGroup[] {
  const map = new Map<string, DebtGroup>();

  for (const d of debts) {
    const key = normalize(d.counterpart_name);
    let g = map.get(key);
    if (!g) {
      g = { key, name: d.counterpart_name.trim(), debts: [], openCount: 0, net: 0, latestDate: d.debt_date };
      map.set(key, g);
    }
    g.debts.push(d);
    if (d.debt_date > g.latestDate) g.latestDate = d.debt_date;
    if (!d.settled_at) {
      g.openCount += 1;
      g.net += d.type === "owed_to_me" ? d.amount : -d.amount;
    }
  }

  const groups = [...map.values()];
  const byName = (a: DebtGroup, b: DebtGroup) => a.name.localeCompare(b.name, "id");
  switch (sort) {
    case "date_asc":
      return groups.sort((a, b) => a.latestDate.localeCompare(b.latestDate) || byName(a, b));
    case "amount_desc":
      return groups.sort((a, b) => Math.abs(b.net) - Math.abs(a.net) || byName(a, b));
    case "amount_asc":
      return groups.sort((a, b) => Math.abs(a.net) - Math.abs(b.net) || byName(a, b));
    default:
      return groups.sort((a, b) => b.latestDate.localeCompare(a.latestDate) || byName(a, b));
  }
}