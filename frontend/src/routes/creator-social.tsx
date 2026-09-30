import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator, signOutCreator } from "@/services/auth";
import { supabase } from "@/services/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/creator-social")({ component: CreatorSocialPage });

type Platform = "x" | "facebook" | "linkedin" | "instagram";
type SocialAccount = { id: string; platform: Platform; account_name: string | null; account_handle: string | null; status: string };

const platforms: Array<{ id: Platform; name: string; note: string }> = [
  { id: "x", name: "X", note: "Gönderi ve görsel yayınlama" },
  { id: "facebook", name: "Facebook", note: "Sayfalara içerik yayınlama" },
  { id: "linkedin", name: "LinkedIn", note: "Profil ve uygun sayfalara yayınlama" },
  { id: "instagram", name: "Instagram", note: "Profesyonel hesaplara içerik yayınlama" },
];

function CreatorSocialPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const creator = await getCurrentCreator();
      if (!creator) { window.location.href = "/creator-auth?next=%2Fcreator-social"; return; }
      const { data, error } = await supabase.from("social_accounts").select("id,platform,account_name,account_handle,status").eq("user_id", creator.id);
      if (!error) setAccounts((data ?? []) as SocialAccount[]);
      setLoading(false);
    })();
  }, []);

  async function connect(platform: Platform) {
    const creator = await getCurrentCreator();
    if (!creator) return;
    const response = await fetch(`https://hburwzezggdgxuissjej.supabase.co/functions/v1/social-oauth?platform=${platform}`, {
      headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}` },
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.url) window.location.href = payload.url;
    else alert(payload.error ?? "Bu sosyal ağ bağlantısı henüz yapılandırılmadı.");
  }

  return <main className="min-h-screen bg-[#fbfbfd] text-foreground">
    <CreatorNavigation onSignOut={async () => { await signOutCreator(); window.location.href="/creator-auth"; }} />
    <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-6">
      <p className="text-[14px] font-black uppercase tracking-[0.14em] text-primary">Yayınlama</p>
      <h1 className="mt-2 text-[38px] font-black tracking-[-0.055em] sm:text-[48px]">Sosyal hesapların</h1>
      <p className="mt-3 max-w-[700px] text-[16px] leading-7 text-muted-foreground">İçeriği bir kez hazırla. Hesabını seç, şimdi yayınla veya zamanla.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const account = accounts.find((item) => item.platform === platform.id && item.status === "connected");
          return <article key={platform.id} className="rounded-[24px] border border-border bg-white p-6">
            <div className="flex items-start justify-between gap-5">
              <div><h2 className="text-[22px] font-black">{platform.name}</h2><p className="mt-1 text-[14px] text-muted-foreground">{platform.note}</p></div>
              <span className={`rounded-full px-3 py-1 text-[12px] font-black ${account ? "bg-emerald-50 text-emerald-700" : "bg-background text-muted-foreground"}`}>{account ? "Bağlı" : "Bağlı değil"}</span>
            </div>
            {account ? <p className="mt-5 text-[14px] font-bold">{account.account_handle || account.account_name || "Hesap bağlı"}</p> :
            <button disabled={loading} onClick={() => void connect(platform.id)} className="mt-5 h-11 rounded-full bg-black px-5 text-[14px] font-black text-white transition hover:bg-primary disabled:opacity-50">{platform.name} hesabını bağla</button>}
          </article>;
        })}
      </section>
    </div>
  </main>;
}
