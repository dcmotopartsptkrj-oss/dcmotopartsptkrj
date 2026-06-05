import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export async function signInAdmin(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login gagal: ${error.message}`);
  }

  const userEmail = data.user.email || "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  const { data: allowedEmail } = await supabase
    .from("admin_allowed_emails")
    .select("email, active")
    .eq("email", userEmail.toLowerCase())
    .eq("active", true)
    .maybeSingle();

  const isAllowedAdmin = (profile && profile.role === "admin") || Boolean(allowedEmail);

  if (!isAllowedAdmin) {
    await supabase.auth.signOut();
    throw new Error("Akun ini belum memiliki akses admin.");
  }

  return {
    user: data.user,
    session: data.session,
    profile,
  };
}

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data } = await supabase.auth.getSession();

  if (!data.session?.user) return null;

  const user = data.session.user;
  const userEmail = user.email || "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: allowedEmail } = await supabase
    .from("admin_allowed_emails")
    .select("email, active")
    .eq("email", userEmail.toLowerCase())
    .eq("active", true)
    .maybeSingle();

  const isAllowedAdmin = (profile && profile.role === "admin") || Boolean(allowedEmail);

  if (!isAllowedAdmin) return null;

  return {
    user,
    session: data.session,
    profile,
  };
}

export async function signOutAdmin() {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}
