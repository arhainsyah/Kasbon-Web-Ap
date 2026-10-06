import { computeTotals } from "@/lib/debt-utils";
import { formatRupiah } from "@/lib/format";
import type { Debt } from "@/lib/types";

// Ukuran koordinat SVG (diskalakan otomatis lewat viewBox, jadi responsif).
const W = 360;
const H = 230;
const M = { top: 28, right: 12, bottom: 34, left: 58 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const TICKS = 4;

const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

/** Skala "bulat" untuk sumbu Y, mis. max 730.000 → 0, 250rb, 500rb, 750rb, 1jt (step 250rb). */
function niceScale(max: number) {
  const raw = max / TICKS;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return { step, top: step * TICKS };
}

export default function BalanceChart({ debts }: { debts: Debt[] }) {
  const { owedToMe, iOwe, net } = computeTotals(debts);
  const max = Math.max(owedToMe, iOwe);

  const bars = [
    { label: "Dihutang ke saya", value: owedToMe, fill: "fill-emerald-500" },
    { label: "Saya hutang", value: iOwe, fill: "fill-red-500" },
  ];

  return (
    <section aria-label="Perbandingan utang" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold">Perbandingan</h2>

      {max === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Belum ada utang aktif untuk dibandingkan.</p>
      ) : (
        <ChartBody bars={bars} net={net} />
      )}
    </section>
  );
}

function ChartBody({ bars, net }: { bars: { label: string; value: number; fill: string }[]; net: number }) {
  const { top, step } = niceScale(Math.max(...bars.map((b) => b.value)));
  const band = PLOT_W / bars.length;
  const barW = Math.min(72, band * 0.5);
  const yOf = (v: number) => M.top + PLOT_H - (v / top) * PLOT_H;

  const summary = bars.map((b) => `${b.label} ${formatRupiah(b.value)}`).join(", ");

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Grafik batang: ${summary}`}
        className="mx-auto mt-2 block w-full max-w-md"
      >
        {/* Garis bantu + label sumbu Y */}
        {Array.from({ length: TICKS + 1 }, (_, i) => {
          const v = step * i;
          const y = yOf(v);
          return (
            <g key={i}>
              <line x1={M.left} x2={W - M.right} y1={y} y2={y} className={i === 0 ? "stroke-slate-300" : "stroke-slate-200"} strokeWidth={1} strokeDasharray={i === 0 ? undefined : "3 3"} />
              <text x={M.left - 6} y={y + 3.5} textAnchor="end" className="fill-slate-400" fontSize={10}>
                {v === 0 ? "Rp 0" : `Rp ${compact.format(v)}`}
              </text>
            </g>
          );
        })}

        {/* Batang */}
        {bars.map((b, i) => {
          const x = M.left + band * i + (band - barW) / 2;
          const y = yOf(b.value);
          const h = Math.max(M.top + PLOT_H - y, b.value > 0 ? 2 : 0);
          return (
            <g key={b.label}>
              <rect x={x} y={M.top + PLOT_H - h} width={barW} height={h} rx={4} className={b.fill}>
                <title>{`${b.label}: ${formatRupiah(b.value)}`}</title>
              </rect>
              <text x={x + barW / 2} y={M.top + PLOT_H - h - 7} textAnchor="middle" className="fill-slate-800" fontSize={11} fontWeight={700}>
                {formatRupiah(b.value)}
              </text>
              <text x={x + barW / 2} y={H - 12} textAnchor="middle" className="fill-slate-600" fontSize={11}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-1 text-center text-xs text-slate-500">
        {net === 0
          ? "Impas: keduanya seimbang."
          : net > 0
            ? `Lebih banyak dihutang ke kamu sebesar ${formatRupiah(net)}.`
            : `Kamu lebih banyak berhutang sebesar ${formatRupiah(-net)}.`}
      </p>
    </>
  );
}