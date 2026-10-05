import { CheckCircle2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { formatDateLong, formatRupiah, relativeDate } from "@/lib/format";
import type { Debt } from "@/lib/types";

interface Props {
  debts: Debt[];
  busyId: string | null;
  onToggleSettled: (debt: Debt) => void;
  onEdit?: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

const btn = "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium disabled:opacity-50";

export default function DebtList({ debts, busyId, onToggleSettled, onEdit, onDelete }: Props) {
  if (debts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Belum ada catatan yang cocok.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {debts.map((d) => {
        const settled = !!d.settled_at;
        const owedToMe = d.type === "owed_to_me";
        const busy = busyId === d.id;
        return (
          <li key={d.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`truncate font-semibold ${settled ? "text-slate-400 line-through" : ""}`}>
                  {d.counterpart_name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${owedToMe ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {owedToMe ? "Dihutang ke saya" : "Saya hutang"}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${settled ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>
                    {settled ? "Lunas" : "Belum lunas"}
                  </span>
                  <span className="text-slate-500" title={formatDateLong(d.debt_date)}>
                    {relativeDate(d.debt_date)}
                  </span>
                  {d.due_date && !settled && (
                    <span className="text-slate-500">· jatuh tempo {formatDateLong(d.due_date)}</span>
                  )}
                </div>
                {d.note && <p className="mt-2 text-sm text-slate-600">{d.note}</p>}
              </div>
              <p className={`text-lg font-bold ${settled ? "text-slate-400" : owedToMe ? "text-emerald-600" : "text-red-600"}`}>
                {formatRupiah(d.amount)}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => onToggleSettled(d)}
                className={`${btn} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}>
                {settled ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                {settled ? "Batalkan Lunas" : "Tandai Lunas"}
              </button>
              {onEdit && (
                <button disabled={busy} onClick={() => onEdit(d)}
                  className={`${btn} border-slate-300 text-slate-700 hover:bg-slate-50`}>
                  <Pencil size={14} /> Edit
                </button>
              )}
              <button disabled={busy} onClick={() => onDelete(d)}
                className={`${btn} border-red-200 text-red-700 hover:bg-red-50`}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
