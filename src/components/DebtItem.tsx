import { CheckCircle2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { formatDateLong, formatRupiah, relativeDate } from "@/lib/format";
import type { Debt } from "@/lib/types";

interface Props {
  debt: Debt;
  busy: boolean;
  hideName?: boolean; // dipakai di dalam grup (nama sudah ada di header grup)
  onToggleSettled: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

const btn =
  "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium disabled:opacity-50 sm:min-h-8 sm:flex-none sm:text-xs";

export default function DebtItem({ debt: d, busy, hideName, onToggleSettled, onEdit, onDelete }: Props) {
  const settled = !!d.settled_at;
  const owedToMe = d.type === "owed_to_me";

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {!hideName && (
            <p className={`truncate font-semibold ${settled ? "text-slate-400 line-through" : ""}`}>{d.counterpart_name}</p>
          )}
          <div className={`flex flex-wrap items-center gap-1.5 text-xs ${hideName ? "" : "mt-1"}`}>
            <span className={`rounded-full px-2 py-0.5 font-medium ${owedToMe ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {owedToMe ? "Dihutang ke saya" : "Saya hutang"}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${settled ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>
              {settled ? "Lunas" : "Belum lunas"}
            </span>
            <span className="text-slate-500" title={formatDateLong(d.debt_date)}>{relativeDate(d.debt_date)}</span>
            {d.due_date && !settled && <span className="text-slate-500">· jatuh tempo {formatDateLong(d.due_date)}</span>}
          </div>
          {d.note && <p className="mt-2 break-words text-sm text-slate-600">{d.note}</p>}
        </div>
        <p className={`shrink-0 text-base font-bold sm:text-lg ${settled ? "text-slate-400" : owedToMe ? "text-emerald-600" : "text-red-600"}`}>
          {formatRupiah(d.amount)}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => onToggleSettled(d)} className={`${btn} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}>
          {settled ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
          {settled ? "Batal Lunas" : "Tandai Lunas"}
        </button>
        <button disabled={busy} onClick={() => onEdit(d)} className={`${btn} border-slate-300 text-slate-700 hover:bg-slate-50`}>
          <Pencil size={15} /> Edit
        </button>
        <button disabled={busy} onClick={() => onDelete(d)} aria-label="Hapus" className={`${btn} border-red-200 text-red-700 hover:bg-red-50`}>
          <Trash2 size={15} /> <span className="hidden min-[380px]:inline">Hapus</span>
        </button>
      </div>
    </li>
  );
}