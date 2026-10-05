export type DebtType = "owed_to_me" | "i_owe";

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  debt_date: string; // YYYY-MM-DD
  due_date: string | null; // YYYY-MM-DD
  settled_at: string | null; // ISO timestamp, null = belum lunas
  created_at: string;
  updated_at: string;
}

export interface ApiErrorBody {
  error: { message: string; fields?: Record<string, string> };
}
