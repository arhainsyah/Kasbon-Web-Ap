import { NextResponse, type NextRequest } from "next/server";
import {
  apiError,
  readJson,
  requireUser,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api";
import { debtCreateSchema, debtQuerySchema } from "@/lib/validation";
import type { Debt } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = debtQuerySchema.safeParse({
    ...(params.status !== undefined && { status: params.status }),
    ...(params.type !== undefined && { type: params.type }),
  });
  if (!parsed.success) return apiError(400, parsed.error.issues[0].message);
  const { status, type } = parsed.data;

  let query = auth.supabase
    .from("debts")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (status === "unsettled") query = query.is("settled_at", null);
  if (status === "settled") query = query.not("settled_at", "is", null);
  if (type !== "all") query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return serverError(error);

  return NextResponse.json({ data: data as Debt[] });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = debtCreateSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  const { data, error } = await auth.supabase
    .from("debts")
    .insert({
      user_id: auth.user.id,
      type: input.type,
      counterpart_name: input.counterpart_name,
      amount: input.amount,
      note: input.note || null,
      ...(input.debt_date && { debt_date: input.debt_date }),
      due_date: input.due_date ?? null,
    })
    .select()
    .single();

  if (error) return serverError(error);
  return NextResponse.json({ data: data as Debt }, { status: 201 });
}
