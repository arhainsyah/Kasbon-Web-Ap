import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ApiErrorBody } from "@/lib/types";

export function apiError(
  status: number,
  message: string,
  fields?: Record<string, string>,
) {
  const body: ApiErrorBody = { error: { message, ...(fields ? { fields } : {}) } };
  return NextResponse.json(body, { status });
}

export const unauthorized = () => apiError(401, "Anda harus login terlebih dahulu.");
export const notFound = () => apiError(404, "Data tidak ditemukan.");
export const serverError = (err: unknown) => {
  console.error("[api]", err);
  return apiError(500, "Terjadi kesalahan pada server. Coba lagi nanti.");
};

export function validationError(err: ZodError) {
  const fields: Record<string, string> = {};
  const messages: string[] = [];
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    const message =
      issue.code === "unrecognized_keys"
        ? `Field tidak dikenal: ${issue.keys.join(", ")}`
        : issue.message;
    messages.push(message);
    if (!(key in fields)) fields[key] = message;
  }
  const first = messages[0] ?? "Input tidak valid.";
  return apiError(422, first, fields);
}

export async function requireUser(): Promise<
  { supabase: SupabaseClient; user: User } | null
> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

export async function readJson(
  request: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: apiError(400, "Body request harus berupa JSON yang valid.") };
  }
}
