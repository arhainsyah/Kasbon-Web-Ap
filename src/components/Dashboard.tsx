"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ApiRequestError, debtsApi } from "@/lib/client-api";
import type { Debt } from "@/lib/types";
import Summary from "@/components/Summary";
import FilterBar, { type StatusFilter, type TypeFilter } from "@/components/FilterBar";
import DebtList from "@/components/DebtList";

export default function Dashboard() {
  const [all, setAll] = useState<Debt[]>([]); // untuk summary (tanpa filter)
  const [debts, setDebts] = useState<Debt[]>([]); // untuk list (terfilter)
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [allData, filtered] = await Promise.all([
        debtsApi.list(),
        debtsApi.list({ status, type }),
      ]);
      setAll(allData);
      setDebts(filtered);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Terjadi kesalahan.");
    } finally {
      setBusyId(null);
    }
  }

  const toggleSettled = (d: Debt) => run(d.id, () => debtsApi.update(d.id, { settled: !d.settled_at }));
  const remove = (d: Debt) => {
    if (!window.confirm(`Hapus catatan "${d.counterpart_name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    return run(d.id, () => debtsApi.remove(d.id));
  };

  return (
    <div className="space-y-5">
      <Summary debts={all} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar status={status} type={type} onStatus={setStatus} onType={setType} />
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : (
        <DebtList debts={debts} busyId={busyId} onToggleSettled={toggleSettled} onDelete={remove} />
      )}
    </div>
  );
}
