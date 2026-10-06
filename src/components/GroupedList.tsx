"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DebtGroup } from "@/lib/debt-utils";
import { formatRupiah, relativeDate } from "@/lib/format";
import type { Debt } from "@/lib/types";
import DebtItem from "@/components/DebtItem";

interface Props {
  groups: DebtGroup[];
  busyId: string | null;
  onToggleSettled: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export default function GroupedList({ groups, busyId, ...handlers }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <ul className="space-y-3">
      {groups.map((g) => {
        const isOpen = open.has(g.key);
        const allSettled = g.openCount === 0;
        const tone = allSettled ? "text-slate-400" : g.net > 0 ? "text-emerald-600" : g.net < 0 ? "text-red-600" : "text-slate-500";
        const caption = allSettled ? "Lunas semua" : g.net > 0 ? "Dihutang ke saya" : g.net < 0 ? "Saya hutang" : "Impas";

        return (
          <li key={g.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => toggle(g.key)}
              aria-expanded={isOpen}
              className="flex min-h-16 w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                {g.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{g.name}</span>
                <span className="block text-xs text-slate-500">
                  {g.debts.length} entry
                  {g.openCount > 0 && ` · ${g.openCount} belum lunas`} · terakhir {relativeDate(g.latestDate)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className={`block text-base font-bold ${tone}`}>
                  {allSettled ? "—" : formatRupiah(Math.abs(g.net))}
                </span>
                <span className="block text-xs text-slate-500">{caption}</span>
              </span>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <ul className="space-y-3 border-t border-slate-100 bg-slate-50 p-3">
                {g.debts.map((d) => (
                  <DebtItem key={d.id} debt={d} busy={busyId === d.id} hideName {...handlers} />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}