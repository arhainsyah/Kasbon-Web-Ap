import { AlertTriangle, Inbox, Plus, RefreshCw, SearchX } from "lucide-react";

const box = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
const bar = "animate-pulse rounded bg-slate-200";

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat data">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${box} ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
            <div className={`${bar} h-3 w-24`} />
            <div className={`${bar} mt-3 h-7 w-32`} />
          </div>
        ))}
      </div>
      <div className={`${box} space-y-3`}>
        <div className={`${bar} h-3 w-20`} />
        <div className={`${bar} h-3 w-full`} />
        <div className={`${bar} h-3 w-2/3`} />
      </div>
      <SkeletonList />
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className={box}>
          <div className="flex justify-between">
            <div className={`${bar} h-4 w-32`} />
            <div className={`${bar} h-5 w-24`} />
          </div>
          <div className={`${bar} mt-3 h-3 w-48`} />
          <div className="mt-4 flex gap-2">
            <div className={`${bar} h-10 flex-1`} />
            <div className={`${bar} h-10 flex-1`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="mx-auto text-red-500" size={32} />
      <p className="mt-3 font-semibold text-red-800">Gagal memuat data</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <button onClick={onRetry}
        className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700">
        <RefreshCw size={16} /> Coba lagi
      </button>
    </div>
  );
}

export function EmptyFirstRun({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Inbox className="mx-auto text-slate-400" size={36} />
      <p className="mt-3 font-semibold">Belum ada catatan</p>
      <p className="mt-1 text-sm text-slate-500">Mulai catat siapa berutang ke kamu, atau kamu berutang ke siapa.</p>
      <button onClick={onAdd}
        className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700">
        <Plus size={16} /> Catat yang pertama
      </button>
    </div>
  );
}

export function EmptyNoMatch({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <SearchX className="mx-auto text-slate-400" size={36} />
      <p className="mt-3 font-semibold">Tidak ada hasil</p>
      <p className="mt-1 text-sm text-slate-500">Tidak ada catatan yang cocok dengan pencarian atau filter.</p>
      <button onClick={onReset}
        className="mx-auto mt-4 h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50">
        Reset pencarian &amp; filter
      </button>
    </div>
  );
}