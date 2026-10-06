import { computeTotals } from "@/lib/debt-utils";
import { formatRupiah } from "@/lib/format";
import type { Debt } from "@/lib/types";

export default function BalanceChart({ debts }: { debts: Debt[] }) {
  const { owedToMe, iOwe } = computeTotals(debts);
  const max = Math.max(owedToMe, iOwe);

  const rows = [
    { label: "Dihutang ke saya", value: owedToMe, bar: "bg-emerald-500" },
    { label: "Saya hutang", value: iOwe, bar: "bg-red-500" },
  ];

  return (
    <section aria-label="Perbandingan utang" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold">Perbandingan</h2>

      {max === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Belum ada utang aktif untuk dibandingkan.</p>
      ) : (
        <div
          role="img"
          aria-label={`Dihutang ke saya ${formatRupiah(owedToMe)}, saya hutang ${formatRupiah(iOwe)}`}
          className="mt-3 space-y-3"
        >
          {rows.map((r) => {
            const pct = r.value === 0 ? 0 : Math.max((r.value / max) * 100, 3);
            return (
              <div key={r.label}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-slate-600">{r.label}</span>
                  <span className="font-semibold">{formatRupiah(r.value)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${r.bar} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}