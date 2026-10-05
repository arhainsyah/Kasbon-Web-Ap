import { z } from "zod";

export const MAX_AMOUNT = 999_999_999_999; // < Rp 1 triliun, aman untuk Number & bigint
export const MAX_NOTE = 200;
export const MAX_NAME = 100;

export const DEBT_TYPES = ["owed_to_me", "i_owe"] as const;

const dateString = z
  .string({ error: "Tanggal harus berupa teks YYYY-MM-DD" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Tanggal tidak valid");

const shape = {
  type: z.enum(DEBT_TYPES, { error: "Tipe harus 'owed_to_me' atau 'i_owe'" }),
  counterpart_name: z
    .string({ error: "Nama wajib diisi" })
    .trim()
    .min(1, "Nama wajib diisi")
    .max(MAX_NAME, `Nama maksimal ${MAX_NAME} karakter`),
  amount: z
    .number({ error: "Jumlah harus berupa angka" })
    .int("Jumlah harus bilangan bulat (rupiah utuh)")
    .positive("Jumlah harus lebih dari 0")
    .max(MAX_AMOUNT, "Jumlah terlalu besar"),
  note: z
    .string({ error: "Catatan harus berupa teks" })
    .trim()
    .max(MAX_NOTE, `Catatan maksimal ${MAX_NOTE} karakter`)
    .nullish(),
  debt_date: dateString.optional(),
  due_date: dateString.nullish(),
};

/** Body POST /api/debts — field tak dikenal (mis. user_id) ditolak. */
export const debtCreateSchema = z.object(shape).strict();

/** Body PATCH /api/debts/[id] — semua field opsional, minimal satu. */
export const debtUpdateSchema = z
  .object({ ...shape, settled: z.boolean({ error: "'settled' harus true/false" }) })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Tidak ada data yang diubah");

/** Query GET /api/debts */
export const debtQuerySchema = z.object({
  status: z
    .enum(["all", "unsettled", "settled"], {
      error: "Parameter 'status' harus all, unsettled, atau settled",
    })
    .default("all"),
  type: z
    .enum(["all", ...DEBT_TYPES], {
      error: "Parameter 'type' harus all, owed_to_me, atau i_owe",
    })
    .default("all"),
});

export const uuidSchema = z.uuid("ID tidak valid");

export type DebtCreateInput = z.infer<typeof debtCreateSchema>;
export type DebtUpdateInput = z.infer<typeof debtUpdateSchema>;
