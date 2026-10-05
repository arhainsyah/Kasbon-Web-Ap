"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { ApiRequestError, debtsApi } from "@/lib/client-api";
import { todayString } from "@/lib/format";
import { MAX_AMOUNT, MAX_NAME, MAX_NOTE } from "@/lib/validation";
import type { Debt, DebtType } from "@/lib/types";

interface Props {
  debt: Debt | null; // null = catat baru
  onClose: () => void;
  onSaved: () => void;
}

type Errors = Partial<Record<"counterpart_name" | "amount" | "debt_date" | "note" | "due_date" | "form", string>>;

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export default function DebtFormModal({ debt, onClose, onSaved }: Props) {
  const [type, setType] = useState<DebtType>(debt?.type ?? "owed_to_me");
  const [name, setName] = useState(debt?.counterpart_name ?? "");
  const [amount, setAmount] = useState(debt ? String(debt.amount) : "");
  const [date, setDate] = useState(debt?.debt_date ?? todayString());
  const [dueDate, setDueDate] = useState(debt?.due_date ?? "");
  const [note, setNote] = useState(debt?.note ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.counterpart_name = "Nama wajib diisi";
    else if (name.trim().length > MAX_NAME) e.counterpart_name = `Maksimal ${MAX_NAME} karakter`;

    const n = Number(amount);
    if (!amount.trim()) e.amount = "Jumlah wajib diisi";
    else if (!Number.isInteger(n)) e.amount = "Jumlah harus bilangan bulat";
    else if (n <= 0) e.amount = "Jumlah harus lebih dari 0";
    else if (n > MAX_AMOUNT) e.amount = "Jumlah terlalu besar";

    if (!date) e.debt_date = "Tanggal wajib diisi";
    if (dueDate && date && dueDate < date) e.due_date = "Jatuh tempo tidak boleh sebelum tanggal catat";
    if (note.length > MAX_NOTE) e.note = `Maksimal ${MAX_NOTE} karakter`;
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const payload = {
      type,
      counterpart_name: name.trim(),
      amount: Number(amount),
      debt_date: date,
      due_date: dueDate || null,
      note: note.trim() || null,
    };

    setSaving(true);
    try {
      if (debt) await debtsApi.update(debt.id, payload);
      else await debtsApi.create(payload);
      onSaved();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        // Error dari validasi server dipetakan ke field-nya.
        const next: Errors = { form: e.message };
        for (const [k, msg] of Object.entries(e.fields ?? {})) {
          if (["counterpart_name", "amount", "debt_date", "note", "due_date"].includes(k)) {
            next[k as keyof Errors] = msg;
          }
        }
        setErrors(next);
      } else setErrors({ form: "Terjadi kesalahan." });
      setSaving(false);
    }
  }

  const err = (k: keyof Errors) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} noValidate role="dialog" aria-modal="true"
        className="max-h-[95vh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{debt ? "Edit catatan" : "Catat baru"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Tipe</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {([["owed_to_me", "Saya dihutang"], ["i_owe", "Saya hutang"]] as const).map(([v, label]) => (
              <label key={v} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium ${type === v ? (v === "owed_to_me" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-red-500 bg-red-50 text-red-700") : "border-slate-300"}`}>
                <input type="radio" name="type" value={v} checked={type === v} onChange={() => setType(v)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium">
          Nama orang
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_NAME + 20} className={inputCls} />
          {err("counterpart_name")}
        </label>

        <label className="block text-sm font-medium">
          Jumlah (Rp)
          <input type="number" inputMode="numeric" min={1} step={1} value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="1000000" className={inputCls} />
          {err("amount")}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Tanggal
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            {err("debt_date")}
          </label>
          <label className="block text-sm font-medium">
            Jatuh tempo <span className="font-normal text-slate-400">(opsional)</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            {err("due_date")}
          </label>
        </div>

        <label className="block text-sm font-medium">
          Catatan <span className="font-normal text-slate-400">(opsional)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputCls} />
          <span className={`mt-1 block text-right text-xs ${note.length > MAX_NOTE ? "text-red-600" : "text-slate-400"}`}>
            {note.length}/{MAX_NOTE}
          </span>
          {err("note")}
        </label>

        {errors.form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Batal</button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />} Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
