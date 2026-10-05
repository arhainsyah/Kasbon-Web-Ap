import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { Debt } from "@/lib/types";

export default function Summary({ debts }: { debts: Debt[] }) {
  // Hanya yang belum lunas yang dihitung.
  const open = debts.filter((d) => !d.settled_at);
  const owedToMe = open.filter((d) => d.type === "owed_to_me").reduce((s, d) => s + d.amount, 0);
  const iOwe = open.filter((d) => d.type === "i_owe").reduce((s, d) => s + d.amount, 0);
  const net = owedToMe - iOwe;

  const cards = [
    { label: "Total dihutang ke saya", value: owedToMe, icon: ArrowDownLeft, tone: "text-emerald-700 bg-emerald-50" },
    { label: "Total saya hutang", value: iOwe, icon: ArrowUpRight, tone: "text-red-700 bg-red-50" },
    {
      label: "Net",
      value: net,
      icon: Scale,
      tone: net >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Ringkasan">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-500">
            {label}
            <span className={`rounded-lg p-1.5 ${tone}`}><Icon size={16} /></span>
          </div>
          <p className={`mt-2 text-2xl font-bold ${label === "Net" ? (net >= 0 ? "text-emerald-600" : "text-red-600") : ""}`}>
            {formatRupiah(value)}
          </p>
        </div>
      ))}
    </section>
  );
}
