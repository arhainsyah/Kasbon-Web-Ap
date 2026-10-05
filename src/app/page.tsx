import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-600 p-2 text-white"><Wallet size={20} /></span>
          <div>
            <h1 className="text-xl font-bold leading-tight">Kasbon</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </header>
      <Dashboard />
    </main>
  );
}
