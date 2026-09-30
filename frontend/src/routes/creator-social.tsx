import { CreatorNavigation } from "@/components/CreatorNavigation";
import { useAqryoLocale } from "@/lib/i18n";
import { getCurrentCreator } from "@/services/auth";
import { supabase } from "@/services/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/creator-social")({ component: CreatorSocialPage });
type Platform = "x" | "facebook" | "linkedin" | "instagram";
type SocialAccount = { id:string; platform:Platform; account_name:string|null; account_handle:string|null; status:string };

const platformNames: Record<Platform,string> = { x:"X", facebook:"Facebook", linkedin:"LinkedIn", instagram:"Instagram" };

function CreatorSocialPage() {
  const { locale } = useAqryoLocale();
  const copy = getCopy(locale);
  const [accounts,setAccounts]=useState<SocialAccount[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ void (async()=>{
    const creator=await getCurrentCreator();
    if(!creator){ window.location.href="/creator-auth?next=%2Fcreator-social"; return; }
    const {data,error}=await supabase.from("social_accounts").select("id,platform,account_name,account_handle,status").eq("user_id",creator.id);
    if(!error) setAccounts((data??[]) as SocialAccount[]);
    setLoading(false);
  })(); },[]);

  async function connect(platform:Platform){
    const creator=await getCurrentCreator(); if(!creator)return;
    const response=await fetch(`https://hburwzezggdgxuissjej.supabase.co/functions/v1/social-oauth?platform=${platform}`,{headers:{Authorization:`Bearer ${(await supabase.auth.getSession()).data.session?.access_token??""}`}});
    const payload=await response.json().catch(()=>({}));
    if(response.ok&&payload.url) window.location.href=payload.url;
    else alert(payload.error??copy.notConfigured);
  }

  const platforms=(["x","facebook","linkedin","instagram"] as Platform[]).map(id=>({id,name:platformNames[id],note:copy.notes[id]}));
  return <main className="min-h-screen bg-[#fbfbfd] text-foreground">
    <CreatorNavigation />
    <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-6">
      <p className="text-[14px] font-black uppercase tracking-[0.14em] text-primary">{copy.eyebrow}</p>
      <h1 className="mt-2 text-[38px] font-black tracking-[-0.055em] sm:text-[48px]">{copy.title}</h1>
      <p className="mt-3 max-w-[700px] text-[16px] leading-7 text-muted-foreground">{copy.intro}</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {platforms.map(platform=>{ const account=accounts.find(item=>item.platform===platform.id&&item.status==="connected"); return <article key={platform.id} className="rounded-[24px] border border-border bg-white p-6">
          <div className="flex items-start justify-between gap-5"><div><h2 className="text-[22px] font-black">{platform.name}</h2><p className="mt-1 text-[14px] text-muted-foreground">{platform.note}</p></div>
          <span className={`rounded-full px-3 py-1 text-[12px] font-black ${account?"bg-emerald-50 text-emerald-700":"bg-background text-muted-foreground"}`}>{account?copy.connected:copy.disconnected}</span></div>
          {account?<p className="mt-5 text-[14px] font-bold">{account.account_handle||account.account_name||copy.accountConnected}</p>:
          <button disabled={loading} onClick={()=>void connect(platform.id)} className="mt-5 h-11 rounded-full bg-black px-5 text-[14px] font-black text-white transition hover:bg-primary disabled:opacity-50">{copy.connect.replace("{platform}",platform.name)}</button>}
        </article>;})}
      </section>
    </div>
  </main>;
}

function getCopy(locale:string){
 const en={eyebrow:"Publishing",title:"Your social accounts",intro:"Create once. Choose an account, publish now or schedule it.",connected:"Connected",disconnected:"Not connected",accountConnected:"Account connected",connect:"Connect {platform}",notConfigured:"This social network connection is not configured yet.",notes:{x:"Publish posts and images",facebook:"Publish content to Pages",linkedin:"Publish to your profile and eligible Pages",instagram:"Publish content to professional accounts"}};
 const tr={eyebrow:"Yayınlama",title:"Sosyal hesapların",intro:"İçeriği bir kez hazırla. Hesabını seç, şimdi yayınla veya zamanla.",connected:"Bağlı",disconnected:"Bağlı değil",accountConnected:"Hesap bağlı",connect:"{platform} hesabını bağla",notConfigured:"Bu sosyal ağ bağlantısı henüz yapılandırılmadı.",notes:{x:"Gönderi ve görsel yayınlama",facebook:"Sayfalara içerik yayınlama",linkedin:"Profil ve uygun sayfalara yayınlama",instagram:"Profesyonel hesaplara içerik yayınlama"}};
 const de={eyebrow:"Veröffentlichen",title:"Deine Social-Media-Konten",intro:"Erstelle deinen Inhalt einmal. Wähle ein Konto und veröffentliche ihn sofort oder plane ihn.",connected:"Verbunden",disconnected:"Nicht verbunden",accountConnected:"Konto verbunden",connect:"{platform} verbinden",notConfigured:"Diese Social-Media-Verbindung ist noch nicht eingerichtet.",notes:{x:"Beiträge und Bilder veröffentlichen",facebook:"Inhalte auf Seiten veröffentlichen",linkedin:"Im Profil und auf geeigneten Seiten veröffentlichen",instagram:"Inhalte auf professionellen Konten veröffentlichen"}};
 return locale==="tr"?tr:locale==="de"?de:en;
}
