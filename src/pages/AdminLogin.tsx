import { Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import { isSupabaseConfigured, signInAdmin } from "../lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (sessionStorage.getItem("dc_admin_auth") === "true") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        await signInAdmin(email, password);
        sessionStorage.setItem("dc_admin_auth", "true");
        navigate("/admin/dashboard");
      } catch (err: any) {
        setError(err.message || "Email atau password yang Anda masukkan salah.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Offline fallback
      if (email.trim() === "admin" && password.trim() === "admin123") {
        sessionStorage.setItem("dc_admin_auth", "true");
        navigate("/admin/dashboard");
      } else {
        setError("Username atau password yang Anda masukkan salah.");
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-night flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-peach hover:text-white"
        >
          <ArrowLeft size={14} />
          Kembali ke Situs
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-black italic tracking-widest text-[#ffb3aa]">
          DC MOTOPART
        </h1>
        <h2 className="mt-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
          Admin Portal Login
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="panel p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-xs font-semibold">
                <AlertCircle className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            {isSupabaseConfigured && (
              <div className="bg-emerald-500/5 px-4 py-2 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center">
                ● Koneksi Supabase Berfungsi
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                {isSupabaseConfigured ? "Email Admin" : "Username"}
              </label>
              <div className="relative mt-2">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={isSupabaseConfigured ? "email" : "text"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSupabaseConfigured ? "admin@dcmotopart.com" : "Masukkan username"}
                  className="w-full rounded-xl border border-line bg-panel-soft pl-11 pr-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ember"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                Password
              </label>
              <div className="relative mt-2">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-line bg-panel-soft pl-11 pr-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ember"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full py-4 text-xs font-black tracking-widest uppercase">
                {isLoading ? "Menghubungkan..." : "Masuk ke Panel"}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-center text-xs text-zinc-600 font-medium">
            <p>Akses terbatas hanya untuk administrator DC Motopart.</p>
            <p className="mt-2 text-zinc-500 text-[10px]">
              {isSupabaseConfigured 
                ? "Gunakan kredensial akun admin yang telah didaftarkan di Supabase." 
                : "Petunjuk: Gunakan username 'admin' and password 'admin123'"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
