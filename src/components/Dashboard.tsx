"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { ApiRequestError, debtsApi } from "@/lib/client-api";
import { groupByPerson, searchDebts, sortDebts, type SortKey } from "@/lib/debt-utils";
import type { Debt } from "@/lib/types";
import Summary from "@/components/Summary";
import BalanceChart from "@/components/BalanceChart";
import Toolbar, { type StatusFilter, type TypeFilter } from "@/components/Toolbar";
import DebtList from "@/components/DebtList";
import GroupedList from "@/components/GroupedList";
import DebtFormModal from "@/components/DebtFormModal";
import { DashboardSkeleton, EmptyFirstRun, EmptyNoMatch, ErrorState } from "@/components/States";

export default function Dashboard() {
  const [all, setAll] = useState<Debt[] | null>(null); // tanpa filter → summary & chart
  const [debts, setDebts] = useState<Debt[] | null>(null); // terfilter status/tipe dari server
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [grouped, setGrouped] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // undefined = modal tertutup, null = catat baru, Debt = edit
  const [editing, setEditing] = useState<Debt | null | undefined>(undefined);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setFetching(true);
    try {
      const [allData, filtered] = await Promise.all([debtsApi.list(), debtsApi.list({ status, type })]);
      if (id !== requestId.current) return; // abaikan respons usang (filter diganti cepat)
      setAll(allData);
      setDebts(filtered);
      setLoadError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      setLoadError(e instanceof ApiRequestError ? e.message : "Tidak bisa terhubung ke server. Cek koneksi internetmu.");
    } finally {
      if (id === requestId.current) setFetching(false);
    }
  }, [status, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => sortDebts(searchDebts(debts ?? [], search), sort), [debts, search, sort]);
  const groups = useMemo(() => (grouped ? groupByPerson(visible, sort) : []), [grouped, visible, sort]);

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setActionError(e instanceof ApiRequestError ? e.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  const toggleSettled = (d: Debt) => run(d.id, () => debtsApi.update(d.id, { settled: !d.settled_at }));
  const remove = (d: Debt) => {
    if (!window.confirm(`Hapus catatan "${d.counterpart_name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    return run(d.id, () => debtsApi.remove(d.id));
  };
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
  };

  // Pemuatan pertama
  if (!all) {
    return loadError ? <ErrorState message={loadError} onRetry={load} /> : <DashboardSkeleton />;
  }

  const listProps = { busyId, onToggleSettled: toggleSettled, onEdit: setEditing, onDelete: remove };

  return (
    <div className="space-y-5">
      <Summary debts={all} />
      <BalanceChart debts={all} />

      <Toolbar
        search={search} onSearch={setSearch}
        status={status} onStatus={setStatus}
        type={type} onType={setType}
        sort={sort} onSort={setSort}
        grouped={grouped} onGrouped={setGrouped}
        onAdd={() => setEditing(null)}
      />

      {actionError && (
        <div role="alert" className="flex items-start justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} aria-label="Tutup pesan" className="shrink-0"><X size={16} /></button>
        </div>
      )}

      <div aria-busy={fetching} className={fetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : visible.length === 0 ? (
          all.length === 0 ? <EmptyFirstRun onAdd={() => setEditing(null)} /> : <EmptyNoMatch onReset={resetFilters} />
        ) : (
          <>
            <p className="mb-2 text-xs text-slate-500">
              {visible.length} catatan{grouped && ` · ${groups.length} orang`}
            </p>
            {grouped ? <GroupedList groups={groups} {...listProps} /> : <DebtList debts={visible} {...listProps} />}
          </>
        )}
      </div>

      {/* Tombol mengambang: mudah dijangkau jempol, hanya di HP */}
      <button
        onClick={() => setEditing(null)}
        aria-label="Catat baru"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg active:scale-95 sm:hidden"
      >
        <Plus size={26} />
      </button>

      {editing !== undefined && (
        <DebtFormModal
          debt={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            void load();
          }}
        />
      )}
    </div>
  );
}