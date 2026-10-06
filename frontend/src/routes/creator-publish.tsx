import { createFileRoute, Link } from "@tanstack/react-router";
import { CreatorNavigation } from "@/components/CreatorNavigation";
import { useImageShare } from "@/components/ImageShareDialog";
import { getCurrentCreator } from "@/services/auth";
import { getPublicShareUrl } from "@/services/shareAssets";
import { supabase } from "@/services/supabase";
import { connectSocialAccount, publishToX, socialRequest, type ChannelStatus, type PublishProfile, type SocialAccount } from "@/services/publishProfiles";
import { type FormEvent, useEffect, useState } from "react";

export const Route = createFileRoute("/creator-publish")({ component: CreatorPublishPage });
type PublishedContent = { id: string; title: string; type: string };
const fallbackChannels: ChannelStatus[] = [
  { platform: "x", name: "X", ready: false, reason: "Bağlantı durumu kontrol edilemedi." },
  { platform: "instagram", name: "Instagram", ready: false, reason: "Doğrudan yayın bağlantısı henüz hazır değil." },
  { platform: "facebook", name: "Facebook", ready: false, reason: "Doğrudan yayın bağlantısı henüz hazır değil." },
  { platform: "linkedin", name: "LinkedIn", ready: false, reason: "Doğrudan yayın bağlantısı henüz hazır değil." },
];
const callbackMessages: Record<string, string> = {
  connected: "X hesabın yayın profiline bağlandı.", canceled: "Hesap bağlantısı iptal edildi.",
  expired: "Bağlantının süresi doldu. Tekrar dene.", invalid: "Bağlantı doğrulanamadı. Bu ekrandan yeniden başlat.",
  permissions: "Yayınlama izni verilmedi. Hesabını gerekli izinlerle yeniden bağla.", error: "Hesap bağlanamadı. Lütfen tekrar dene.",
};
const button = "rounded-full bg-black px-4 py-2.5 text-xs font-black text-white disabled:opacity-40";

function CreatorPublishPage() {
  const [ready, setReady] = useState(false);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<PublishProfile[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [channels, setChannels] = useState(fallbackChannels);
  const [contents, setContents] = useState<PublishedContent[]>([]);
  const [profileName, setProfileName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<{ content: PublishedContent; text: string; requestId: string } | null>(null);
  const [accountId, setAccountId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [postUrl, setPostUrl] = useState("");
  const { openLinkShare, imageShareDialog } = useImageShare();
  const publishAccounts = accounts.filter(account => account.publish_profile_id === selectedId && account.platform === "x" && account.status === "connected");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const creator = await getCurrentCreator();
        if (!active) return;
        if (!creator) { window.location.href = "/creator-auth?next=%2Fcreator-publish"; return; }
        setCreatorId(creator.id);
        const [p, a, c, status] = await Promise.all([
          supabase.from("creator_publish_profiles").select("id,name,created_at").eq("creator_id", creator.id).order("created_at", { ascending: false }),
          supabase.from("social_accounts").select("id,platform,account_name,account_handle,status,publish_profile_id").eq("user_id", creator.id),
          supabase.from("experiences").select("id,title,type").eq("creator_id", creator.id).eq("status", "published").order("created_at", { ascending: false }).limit(20),
          socialRequest("status").catch(() => null),
        ]);
        if (!active) return;
        if (p.error || a.error || c.error) setError("Bazı yayın bilgileri yüklenemedi. Sayfayı yenileyerek tekrar dene.");
        setProfiles((p.data ?? []) as PublishProfile[]);
        setAccounts((a.data ?? []) as SocialAccount[]);
        setContents((c.data ?? []) as PublishedContent[]);
        setSelectedId(p.data?.[0]?.id ?? null);
        if (status?.channels) setChannels(status.channels);
        else setError("Sosyal bağlantı durumu alınamadı. İçerik bağlantılarını paylaşmaya devam edebilirsin.");
        const url = new URL(window.location.href);
        const result = url.searchParams.get("social");
        if (result && callbackMessages[result]) {
          if (result === "connected" || result === "canceled") setNotice(callbackMessages[result]);
          else setError(callbackMessages[result]);
          url.searchParams.delete("social");
          window.history.replaceState(window.history.state, "", url);
        }
      } catch { if (active) setError("Yayın bilgileri yüklenemedi. Lütfen sayfayı yenile."); }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = profileName.trim();
    if (!creatorId || !name || busy) return;
    setBusy("profile"); setError("");
    try {
      const query = editingId
        ? supabase.from("creator_publish_profiles").update({ name, updated_at: new Date().toISOString() }).eq("id", editingId).eq("creator_id", creatorId)
        : supabase.from("creator_publish_profiles").insert({ creator_id: creatorId, name });
      const { data, error: saveError } = await query.select("id,name,created_at").single();
      if (saveError || !data) throw saveError;
      setProfiles(current => editingId ? current.map(profile => profile.id === editingId ? data : profile) : [data, ...current]);
      setSelectedId(data.id); setDraft(null); setConfirmed(false); setProfileName(""); setShowCreate(false); setEditingId(null);
    } catch { setError("Profil kaydedilemedi. Lütfen tekrar dene."); }
    finally { setBusy(""); }
  }

  async function deleteProfile(profile: PublishProfile) {
    if (busy || !creatorId || !window.confirm("“" + profile.name + "” profili ve ona bağlı hesap bağlantıları silinsin mi? Sosyal hesapların ve içeriklerin silinmez.")) return;
    setBusy(profile.id); setError("");
    try {
      const { data, error: deleteError } = await supabase.from("creator_publish_profiles").delete().eq("id", profile.id).eq("creator_id", creatorId).select("id");
      if (deleteError || !data?.length) throw deleteError;
      setProfiles(current => current.filter(item => item.id !== profile.id));
      setAccounts(current => current.filter(item => item.publish_profile_id !== profile.id));
      if (selectedId === profile.id) { setSelectedId(null); setDraft(null); setConfirmed(false); }
      if (editingId === profile.id) { setEditingId(null); setShowCreate(false); setProfileName(""); }
    } catch { setError("Profil silinemedi. Lütfen tekrar dene."); }
    finally { setBusy(""); }
  }

  async function disconnect(account: SocialAccount) {
    if (busy || !creatorId || !window.confirm((account.account_handle || account.account_name || "Bu hesap") + " için AQRYO bağlantısı kaldırılsın mı?")) return;
    setBusy(account.id); setError("");
    try {
      const { data, error: deleteError } = await supabase.from("social_accounts").delete().eq("id", account.id).eq("user_id", creatorId).select("id");
      if (deleteError || !data?.length) throw deleteError;
      setAccounts(current => current.filter(item => item.id !== account.id));
      if (accountId === account.id) { setAccountId(""); setConfirmed(false); }
      setNotice("AQRYO hesap bağlantısı kaldırıldı. Verdiğin uygulama iznini sosyal hesabının ayarlarından da kaldırabilirsin.");
    } catch { setError("Hesap bağlantısı kaldırılamadı."); }
    finally { setBusy(""); }
  }

  async function connect(channel: ChannelStatus) {
    if (!selectedId || busy || !channel.ready) return;
    setBusy(channel.platform); setError("");
    try { await connectSocialAccount(selectedId, channel.platform); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Hesap bağlanamadı."); setBusy(""); }
  }

  function preparePost(content: PublishedContent) {
    setDraft({ content, text: [...content.title].slice(0, 110).join(""), requestId: crypto.randomUUID() });
    setAccountId(publishAccounts[0]?.id ?? ""); setConfirmed(false); setPostUrl(""); setError("");
  }

  async function sendPost() {
    if (!draft || !selectedId || !accountId || !confirmed || busy) return;
    setBusy("publish"); setError("");
    try {
      const url = await publishToX({ profileId: selectedId, accountId, experienceId: draft.content.id, text: draft.text, requestId: draft.requestId, confirmed });
      setPostUrl(url); setConfirmed(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gönderi sonucu doğrulanamadı. X hesabını kontrol et."); }
    finally { setBusy(""); }
  }

  return <main className="min-h-screen bg-[#faf8fb] text-foreground">
    <CreatorNavigation />
    {imageShareDialog}
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-2 border-b border-border pb-5">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">Yayınla</p>
        <h1 className="text-3xl font-black tracking-[-0.04em]">Yayın profilleri</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Marka ve creator profillerini yönet, sosyal hesaplarını bağla ve hazır içeriklerinin bağlantılarını paylaş.</p>
      </div>
      {!ready ? <p className="mt-6 text-sm" role="status">Yayın bilgileri yükleniyor…</p> : <>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {notice ? <p role="status" className="mt-4 rounded-xl bg-violet-50 p-4 text-sm text-violet-800">{notice}</p> : null}
        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[26px] border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-lg font-black">Profillerim</h2><p className="mt-1 text-xs text-muted-foreground">Her marka için ayrı bir yayın profili oluşturabilirsin.</p></div>
              <button type="button" disabled={!!busy} onClick={() => { setShowCreate(true); setEditingId(null); setProfileName(""); }} className={button}>+ Profil oluştur</button>
            </div>
            {showCreate ? <form onSubmit={saveProfile} className="mt-5 rounded-[20px] border border-border bg-background p-4">
              <label className="text-xs font-black" htmlFor="publish-profile-name">Profil adı</label>
              <input id="publish-profile-name" value={profileName} onChange={event => setProfileName(event.target.value)} maxLength={60} autoFocus placeholder="Örn. Creator profilim" className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm" />
              <div className="mt-3 flex gap-2"><button type="submit" disabled={!profileName.trim() || !!busy} className={button}>{busy === "profile" ? "Kaydediliyor…" : "Kaydet"}</button><button type="button" disabled={!!busy} onClick={() => { setShowCreate(false); setEditingId(null); setProfileName(""); }} className="px-3 text-xs font-bold">Vazgeç</button></div>
            </form> : null}
            {!profiles.length ? <p className="mt-5 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">İlk yayın profilini oluştur, ardından bağlamak istediğin kanalı seç.</p> : <div className="mt-5 space-y-3">
              {profiles.map(profile => {
                const linked = accounts.filter(account => account.publish_profile_id === profile.id);
                const connected = linked.filter(account => account.status === "connected");
                return <article key={profile.id} className={"rounded-[20px] border p-4 " + (selectedId === profile.id ? "border-violet-400 bg-violet-50/40" : "border-border")}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0"><h3 className="break-words text-sm font-black">{profile.name}</h3><p className="mt-1 text-xs text-muted-foreground">{connected.length ? connected.length + " sosyal hesap bağlı" : "Henüz sosyal hesap bağlı değil"}</p></div>
                    <button type="button" disabled={!!busy} aria-pressed={selectedId === profile.id} onClick={() => { setSelectedId(profile.id); setDraft(null); setConfirmed(false); }} className={button}>{selectedId === profile.id ? "Profil seçili" : "Hesap bağla"}</button>
                  </div>
                  {linked.map(account => <div key={account.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 text-xs"><span>{channels.find(item => item.platform === account.platform)?.name} · {account.account_handle || account.account_name} <span className={account.status === "connected" ? "text-emerald-700" : "text-amber-700"}>{account.status === "connected" ? "Bağlı" : "Yeniden bağlantı gerekli"}</span></span><button type="button" disabled={!!busy} onClick={() => void disconnect(account)} className="font-bold text-red-700">Bağlantıyı kaldır</button></div>)}
                  <div className="mt-3 flex gap-4 text-xs font-bold"><button type="button" disabled={!!busy} onClick={() => { setEditingId(profile.id); setProfileName(profile.name); setShowCreate(true); }}>Adı düzenle</button><button type="button" disabled={!!busy} onClick={() => void deleteProfile(profile)} className="text-red-700">Profili sil</button></div>
                </article>;
              })}
            </div>}
            {accounts.some(account => !account.publish_profile_id) ? <p className="mt-4 text-xs text-muted-foreground">Bir profile bağlı olmayan eski hesapların var. Kullanmak istediğin profili seçip hesabını yeniden bağla.</p> : null}
          </div>
          <aside className="rounded-[26px] border border-border bg-white p-5">
            <h2 className="text-xs font-black uppercase tracking-wide text-primary">Sosyal hesap bağla</h2>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{selectedId ? "Seçili profil: " + profiles.find(profile => profile.id === selectedId)?.name : "Önce bir yayın profili seç."}</p>
            <div className="mt-4 space-y-3">{channels.map(channel => <div key={channel.platform} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{channel.name}</span><span className="text-[10px] font-bold text-muted-foreground">{channel.ready ? "Bağlanabilir" : "Kurulum bekliyor"}</span></div>
              {channel.ready ? <button type="button" disabled={!selectedId || !!busy} onClick={() => void connect(channel)} className={button + " mt-3"}>{busy === channel.platform ? "Yönlendiriliyor…" : channel.name + " hesabını bağla"}</button> : <p className="mt-2 text-xs leading-5 text-muted-foreground">{channel.reason}</p>}
            </div>)}</div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Bağlantıda sosyal hesabından izin verirsin. AQRYO sosyal hesap şifreni istemez. Hesap bağlamak kendi başına gönderi yayınlamaz.</p>
          </aside>
        </section>
        <section className="mt-5 rounded-[26px] border border-border bg-white p-5">
          <h2 className="text-lg font-black">Yayındaki içeriklerini paylaş</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Bağlantı paylaşımı için sosyal hesap bağlaman gerekmez. Platformu seçip gönderini orada onaylarsın. Puzzle ve anonim cevap kartlarını kendi ekranlarından görsel olarak paylaşabilirsin.</p>
          {draft ? <div className="mt-4 rounded-2xl border border-violet-300 bg-violet-50/40 p-4">
            <h3 className="text-sm font-black">X gönderisini hazırla</h3>
            <label htmlFor="publish-x-account" className="mt-3 block text-xs font-bold">Seçili profile bağlı X hesabı</label>
            <select id="publish-x-account" disabled={!!busy || !!postUrl} value={accountId} onChange={event => { setAccountId(event.target.value); setDraft({ ...draft, requestId: crypto.randomUUID() }); setConfirmed(false); }} className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"><option value="">Hesap seç</option>{publishAccounts.map(account => <option key={account.id} value={account.id}>{account.account_handle || account.account_name}</option>)}</select>
            <label htmlFor="publish-x-text" className="mt-3 block text-xs font-bold">Gönderi metni · en fazla 110 karakter</label>
            <textarea id="publish-x-text" disabled={!!busy || !!postUrl} value={draft.text} onChange={event => { const text = [...event.target.value].slice(0, 110).join(""); setDraft({ ...draft, text, requestId: crypto.randomUUID() }); setConfirmed(false); }} className="mt-2 min-h-24 w-full rounded-xl border bg-white p-3 text-sm" />
            <p className="mt-2 break-all text-xs text-muted-foreground">{getPublicShareUrl(draft.content.id)}</p>
            <label className="mt-4 flex items-start gap-2 text-xs leading-5"><input type="checkbox" disabled={!!busy || !!postUrl} checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1" />Bu metin ve bağlantının seçtiğim X hesabında yayınlanmasını onaylıyorum.</label>
            <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" disabled={!!busy || !confirmed || !accountId || !draft.text.trim() || !!postUrl || !channels.some(channel => channel.platform === "x" && channel.ready)} onClick={() => void sendPost()} className={button}>{busy === "publish" ? "Yayınlanıyor…" : "X'te yayınla"}</button><button type="button" disabled={!!busy} onClick={() => setDraft(null)} className="text-xs font-bold">Kapat</button>{postUrl ? <a href={postUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary">Gönderiyi görüntüle ↗</a> : null}</div>
          </div> : null}
          <div className="mt-4 space-y-2">{contents.map(content => <div key={content.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"><p className="min-w-0 break-words text-sm font-bold">{content.title}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => openLinkShare(getPublicShareUrl(content.id), content.title)} className={button}>Bağlantıyı paylaş ↗</button>{["compatibility", "question_confession", "story"].includes(content.type) ? <button type="button" disabled={!!busy || !publishAccounts.length || !channels.some(channel => channel.platform === "x" && channel.ready)} onClick={() => preparePost(content)} className="rounded-full border px-4 py-2.5 text-xs font-bold disabled:opacity-40">Bağlı X hesabında yayınla</button> : null}</div></div>)}</div>
          {!contents.length ? <p className="mt-4 text-sm text-muted-foreground">Henüz yayında içerik bulunmuyor.</p> : null}
          <Link to="/creator-experiences" className="mt-4 inline-block text-xs font-bold text-primary">Tüm içeriklerim →</Link>
        </section>
      </>}
    </div>
  </main>;
}
