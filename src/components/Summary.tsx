import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { computeTotals } from "@/lib/debt-utils";
import { formatRupiah } from "@/lib/format";
import type { Debt } from "@/lib/types";

export default function Summary({ debts }: { debts: Debt[] }) {
  const { owedToMe, iOwe, net } = computeTotals(debts);
  const netTone = net >= 0 ? "text-emerald-600" : "text-red-600";

  const cards = [
    { label: "Net", value: net, icon: Scale, valueCls: netTone, iconCls: net >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700", wrap: "col-span-2 order-first sm:order-last sm:col-span-1" },
    { label: "Total dihutang ke saya", value: owedToMe, icon: ArrowDownLeft, valueCls: "", iconCls: "bg-emerald-50 text-emerald-700", wrap: "" },
    { label: "Total saya hutang", value: iOwe, icon: ArrowUpRight, valueCls: "", iconCls: "bg-red-50 text-red-700", wrap: "" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Ringkasan">
      {cards.map(({ label, value, icon: Icon, valueCls, iconCls, wrap }) => (
        <div key={label} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${wrap}`}>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 sm:text-sm">
            {label}
            <span className={`shrink-0 rounded-lg p-1.5 ${iconCls}`}><Icon size={16} /></span>
          </div>
          <p className={`mt-2 break-words text-lg font-bold sm:text-2xl ${valueCls}`}>{formatRupiah(value)}</p>
        </div>
      ))}
    </section>
  );
}