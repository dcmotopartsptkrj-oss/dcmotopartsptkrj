import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { signInAdmin } from "../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("dcmotopartsptkrj@gmail.com");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      await signInAdmin(email, password);

      navigate("/admin/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message || "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Link
        to="/"
        className="absolute left-8 top-8 text-sm font-black uppercase tracking-widest text-[#ffb3aa]"
      >
        ← Kembali ke Situs
      </Link>

      <section className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black italic tracking-[0.25em] text-[#ffb3aa]">
              DC MOTOPARTS
            </h1>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">
              Admin Portal Login
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-zinc-800 bg-[#151313] p-8 shadow-2xl"
          >
            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
              Email
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-700 bg-[#1f1c1b] px-4 py-4">
              <Mail size={18} className="text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Masukkan email admin"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-0"
                required
              />
            </div>

            <label className="mt-6 block text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
              Password
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-700 bg-[#1f1c1b] px-4 py-4">
              <Lock size={18} className="text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-0"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-[#ff4b1f] px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#dc1f25] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Memproses..." : "Masuk ke Panel"}
            </button>

            <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
              <p className="text-xs leading-6 text-zinc-500">
                Akses terbatas hanya untuk email admin yang disetujui di database.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
