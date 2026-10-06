"use client";

import { Plus, Search, Users, X } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/debt-utils";

export type StatusFilter = "all" | "unsettled" | "settled";
export type TypeFilter = "all" | "owed_to_me" | "i_owe";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  type: TypeFilter;
  onType: (v: TypeFilter) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  grouped: boolean;
  onGrouped: (v: boolean) => void;
  onAdd: () => void;
}

const selectCls =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-emerald-600 sm:h-10 sm:text-sm";

export default function Toolbar(p: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={p.search}
          onChange={(e) => p.onSearch(e.target.value)}
          placeholder="Cari nama orang…"
          aria-label="Cari nama orang"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-11 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:h-10 sm:text-sm"
        />
        {p.search && (
          <button
            onClick={() => p.onSearch("")}
            aria-label="Hapus pencarian"
            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700 sm:h-10 sm:w-10"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <select aria-label="Filter status" className={selectCls} value={p.status}
          onChange={(e) => p.onStatus(e.target.value as StatusFilter)}>
          <option value="all">Semua status</option>
          <option value="unsettled">Belum lunas</option>
          <option value="settled">Lunas</option>
        </select>
        <select aria-label="Filter tipe" className={selectCls} value={p.type}
          onChange={(e) => p.onType(e.target.value as TypeFilter)}>
          <option value="all">Semua tipe</option>
          <option value="owed_to_me">Dihutang ke saya</option>
          <option value="i_owe">Saya hutang</option>
        </select>
        <select aria-label="Urutkan" className={`${selectCls} col-span-2 sm:col-span-1`} value={p.sort}
          onChange={(e) => p.onSort(e.target.value as SortKey)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => p.onGrouped(!p.grouped)}
          aria-pressed={p.grouped}
          className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium sm:h-10 ${
            p.grouped ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          <Users size={16} /> Kelompokkan per orang
        </button>
        <button
          onClick={p.onAdd}
          className="hidden h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 sm:flex"
        >
          <Plus size={16} /> Catat baru
        </button>
      </div>
    </div>
  );
}