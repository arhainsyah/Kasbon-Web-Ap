export type StatusFilter = "all" | "unsettled" | "settled";
export type TypeFilter = "all" | "owed_to_me" | "i_owe";

interface Props {
  status: StatusFilter;
  type: TypeFilter;
  onStatus: (v: StatusFilter) => void;
  onType: (v: TypeFilter) => void;
}

const selectCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600";

export default function FilterBar({ status, type, onStatus, onType }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <select aria-label="Filter status" className={selectCls} value={status}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}>
        <option value="all">Semua status</option>
        <option value="unsettled">Belum lunas</option>
        <option value="settled">Lunas</option>
      </select>
      <select aria-label="Filter tipe" className={selectCls} value={type}
        onChange={(e) => onType(e.target.value as TypeFilter)}>
        <option value="all">Semua tipe</option>
        <option value="owed_to_me">Dihutang ke saya</option>
        <option value="i_owe">Saya hutang</option>
      </select>
    </div>
  );
}
