"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginPathWithNext } from "@/lib/navigation";
import { CheckCircle2, Heart, LogOut, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { AccountPageSkeleton } from "@/components/ui/Skeleton";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  useEffect(() => { if (!loading && !user) router.replace(loginPathWithNext("/account")); }, [loading, user, router]);
  if (loading || !user) return <AccountPageSkeleton />;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "ReyHomes Member";
  const joined = user.date_joined ? new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(user.date_joined)) : "Member";
  const signOut = () => { logout(); router.replace("/"); };
  return <main className="relative min-h-screen bg-[#F5F0E6] px-5 pb-24 pt-32 text-[#0A1628] sm:px-8 lg:px-12">
    <button
      type="button"
      onClick={() => router.push("/")}
      aria-label="Exit account and return home"
      title="Return home"
      className="fixed right-5 top-24 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#0A1628]/10 bg-white/80 text-[#0A1628]/60 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#D8C7A4] hover:text-[#806D48]"
    >
      <X size={18} strokeWidth={1.6} />
    </button>
    <div className="mx-auto max-w-6xl">
    <header className="max-w-3xl"><p className="text-[10px] font-semibold uppercase tracking-[.35em] text-[#806D48]">My ReyHomes</p><h1 className="mt-3 font-display text-5xl font-medium tracking-tight sm:text-6xl">Manage your account.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[#0A1628]/55 sm:text-base">View your member details, saved properties and access to ReyHomes services.</p></header>
    <section className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <div className="rounded-[30px] bg-[#0A1628] p-7 text-white shadow-[0_25px_70px_rgba(10,22,40,.18)] sm:p-9"><div className="flex items-start gap-5"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D8C7A4]/15 text-[#D8C7A4]"><UserRound className="h-6 w-6" /></div><div className="min-w-0"><p className="text-[10px] uppercase tracking-[.3em] text-[#D8C7A4]">Member account</p><h2 className="mt-2 truncate font-display text-3xl">{fullName}</h2><p className="mt-2 truncate text-sm text-white/50">{user.email}</p></div></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-[9px] uppercase tracking-[.2em] text-white/35">Phone</p><p className="mt-2 text-sm text-white/80">{user.phone || "Not provided"}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-[9px] uppercase tracking-[.2em] text-white/35">Member since</p><p className="mt-2 text-sm text-white/80">{joined}</p></div></div></div>
      <div className="rounded-[30px] border border-[#0A1628]/10 bg-white/75 p-7 sm:p-9"><p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#806D48]">Your access</p><div className="mt-6 space-y-3"><div className="flex items-center justify-between rounded-2xl bg-[#F5F0E6] px-4 py-4"><span className="text-sm">Member account</span><CheckCircle2 className="h-5 w-5 text-[#806D48]" /></div><div className="flex items-center justify-between rounded-2xl bg-[#F5F0E6] px-4 py-4"><span className="text-sm">Client status</span><span className={`text-[10px] font-semibold uppercase tracking-wider ${user.is_client ? "text-[#806D48]" : "text-[#0A1628]/35"}`}>{user.is_client ? "Approved" : "Member"}</span></div><div className="flex items-center justify-between rounded-2xl bg-[#F5F0E6] px-4 py-4"><span className="text-sm">ReyHomes Pro</span><span className={`text-[10px] font-semibold uppercase tracking-wider ${user.is_reypro ? "text-[#806D48]" : "text-[#0A1628]/35"}`}>{user.is_reypro ? "Active" : "Not enabled"}</span></div></div></div>
    </section>
    <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <button onClick={() => router.push("/wishlist")} className="group rounded-[26px] border border-[#0A1628]/10 bg-white/75 p-6 text-left transition hover:-translate-y-1 hover:shadow-xl"><Heart className="h-6 w-6 text-[#D8C7A4]" fill="#D8C7A4" /><h3 className="mt-5 text-xl font-medium">My Wishlist</h3><p className="mt-2 text-sm leading-6 text-[#0A1628]/45">You have {wishlistCount} saved {wishlistCount === 1 ? "property" : "properties"}.</p></button>
      {user.is_client && (user.is_reypro ? <button onClick={() => router.push("/pro/home")} className="group rounded-[26px] border border-[#D8C7A4]/35 bg-[#D8C7A4]/10 p-6 text-left transition hover:-translate-y-1 hover:shadow-xl"><Sparkles className="h-6 w-6 text-[#806D48]" /><h3 className="mt-5 text-xl font-medium">ReyHomes Pro</h3><p className="mt-2 text-sm leading-6 text-[#0A1628]/45">Open your project, milestones, selections, agent chat and updates.</p></button> : <div className="rounded-[26px] border border-[#D8C7A4]/25 bg-[#D8C7A4]/5 p-6"><ShieldCheck className="h-6 w-6 text-[#806D48]" /><h3 className="mt-5 text-xl font-medium">ReyHomes Pro</h3><p className="mt-2 text-sm leading-6 text-[#0A1628]/45">You are an approved ReyHomes client. Pro access will appear here when it is enabled by ReyHomes.</p></div>)}
      <button onClick={signOut} className="group rounded-[26px] border border-[#0A1628]/10 bg-white/75 p-6 text-left transition hover:-translate-y-1 hover:border-[#8C1D2C]/20 hover:shadow-xl sm:col-span-2 lg:col-span-1"><LogOut className="h-6 w-6 text-[#806D48]" /><h3 className="mt-5 text-xl font-medium">Sign out</h3><p className="mt-2 text-sm leading-6 text-[#0A1628]/45">Securely sign out of your ReyHomes member account.</p></button>
    </section>
  </div></main>;
}
