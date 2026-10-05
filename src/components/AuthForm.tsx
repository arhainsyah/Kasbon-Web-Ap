"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau password salah.";
  if (m.includes("already registered")) return "Email sudah terdaftar. Silakan login.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Cek inbox kamu.";
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Coba lagi beberapa saat.";
  if (m.includes("password")) return "Password tidak memenuhi syarat (minimal 6 karakter).";
  return "Terjadi kesalahan. Coba lagi.";
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Format email tidak valid.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");

    setLoading(true);
    const supabase = createClient();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateAuthError(error.message));
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));

    if (data.session) {
      router.replace("/");
      router.refresh();
    } else {
      setInfo("Pendaftaran berhasil! Cek email kamu untuk konfirmasi, lalu login.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="rounded-lg bg-emerald-600 p-2 text-white">
            <Wallet size={20} />
          </span>
          <h1 className="text-xl font-bold">Kasbon</h1>
        </div>
        <h2 className="mb-1 text-lg font-semibold">{isLogin ? "Masuk" : "Buat akun"}</h2>
        <p className="mb-5 text-sm text-slate-500">
          {isLogin ? "Lanjut catat utang piutangmu." : "Gratis, cukup email dan password."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {info && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-emerald-700 hover:underline">
            {isLogin ? "Daftar" : "Masuk"}
          </Link>
        </p>
      </div>
    </main>
  );
}
