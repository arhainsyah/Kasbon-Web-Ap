import { NextResponse, type NextRequest } from "next/server";
import {
  apiError,
  notFound,
  readJson,
  requireUser,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api";
import { debtUpdateSchema, uuidSchema } from "@/lib/validation";
import type { Debt } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const id = uuidSchema.safeParse((await params).id);
  if (!id.success) return apiError(400, id.error.issues[0].message);

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = debtUpdateSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);
  const { settled, ...fields } = parsed.data;

  const update: Record<string, unknown> = { ...fields };
  if (fields.note !== undefined) update.note = fields.note || null;
  if (settled !== undefined) {
    update.settled_at = settled ? new Date().toISOString() : null;
  }

  const { data, error } = await auth.supabase
    .from("debts")
    .update(update)
    .eq("id", id.data)
    .eq("user_id", auth.user.id)
    .select()
    .maybeSingle();

  if (error) return serverError(error);
  if (!data) return notFound();
  return NextResponse.json({ data: data as Debt });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const id = uuidSchema.safeParse((await params).id);
  if (!id.success) return apiError(400, id.error.issues[0].message);

  const { data, error } = await auth.supabase
    .from("debts")
    .delete()
    .eq("id", id.data)
    .eq("user_id", auth.user.id)
    .select("id")
    .maybeSingle();

  if (error) return serverError(error);
  if (!data) return notFound();
  return new NextResponse(null, { status: 204 });
}
