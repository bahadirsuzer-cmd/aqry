import { createFileRoute } from "@tanstack/react-router";
import { CreatorNavigation } from "@/components/CreatorNavigation";
import { getCurrentCreator } from "@/services/auth";
import { supabase } from "@/services/supabase";
import { FormEvent, useEffect, useState } from "react";

export const Route = createFileRoute("/creator-publish")({ component: CreatorPublishPage });

type Channel = "X" | "Instagram" | "Facebook" | "TikTok";

type PublishProfile = {
  id: string;
  name: string;
  created_at: string;
};

function CreatorPublishPage() {
  const [ready, setReady] = useState(false);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<PublishProfile[]>([]);
  const [profileName, setProfileName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getCurrentCreator().then(async (creator) => {
      if (!creator) {
        window.location.href = "/creator-auth?returnTo=/creator-publish";
        return;
      }

      setCreatorId(creator.id);
      const { data, error: loadError } = await supabase
        .from("creator_publish_profiles")
        .select("id,name,created_at")
        .order("created_at", { ascending: false });

      if (loadError) setError("Yayın profilleri yüklenemedi.");
      else setProfiles((data ?? []) as PublishProfile[]);

      setReady(true);
    });
  }, []);

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = profileName.trim();
    if (!creatorId || !name || saving) return;

    setSaving(true);
    setError("");

    const { data, error: createError } = await supabase
      .from("creator_publish_profiles")
      .insert({ creator_id: creatorId, name })
      .select("id,name,created_at")
      .single();

    if (createError || !data) {
      setError("Profil oluşturulamadı. Lütfen tekrar dene.");
      setSaving(false);
      return;
    }

    setProfiles((current) => [data as PublishProfile, ...current]);
    setProfileName("");
    setShowCreate(false);
    setSaving(false);
  }

  if (!ready) return <main className="min-h-screen bg-[#faf8fb]" />;

  return (
    <main className="min-h-screen bg-[#faf8fb] text-foreground">
      <CreatorNavigation />
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2 border-b border-border pb-5">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">Yayınla</p>
          <h1 className="text-3xl font-black tracking-[-0.04em]">Yayın profilleri</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Sosyal hesaplarını bir profile bağla. İçerik bittiğinde profili ve kanalları seçip tek tuşla yayınla.
          </p>
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[26px] border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Profillerim</h2>
                <p className="mt-1 text-xs text-muted-foreground">Birden fazla marka veya creator profili oluşturabilirsin.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowCreate((value) => !value); setError(""); }}
                className="rounded-full bg-black px-4 py-2.5 text-xs font-black text-white"
              >
                + Profil oluştur
              </button>
            </div>

            {showCreate ? (
              <form onSubmit={createProfile} className="mt-5 rounded-[20px] border border-border bg-background p-4">
                <label className="text-xs font-black" htmlFor="publish-profile-name">Profil adı</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="publish-profile-name"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    maxLength={60}
                    autoFocus
                    placeholder="Örn. Bahadır Süzer"
                    className="min-w-0 flex-1 rounded-[14px] border border-border bg-white px-4 py-3 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!profileName.trim() || saving}
                    className="rounded-[14px] bg-black px-5 py-3 text-xs font-black text-white disabled:opacity-40"
                  >
                    {saving ? "Kaydediliyor..." : "Profili oluştur"}
                  </button>
                </div>
              </form>
            ) : null}

            {error ? <p className="mt-4 text-xs font-bold text-red-600">{error}</p> : null}

            {profiles.length === 0 ? (
              <div className="mt-5 rounded-[20px] border border-dashed border-border bg-background p-6 text-center">
                <p className="text-sm font-black">Henüz yayın profilin yok</p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground">
                  İlk profilini oluştur, ardından X, Instagram, Facebook veya TikTok hesabını bağla.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between rounded-[20px] border border-border px-4 py-4">
                    <div>
                      <p className="text-sm font-black">{profile.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Henüz sosyal hesap bağlı değil</p>
                    </div>
                    <span className="rounded-full bg-background px-3 py-1.5 text-[10px] font-black text-muted-foreground">
                      Hesap bağla
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-[26px] border border-border bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">Bağlanabilir kanallar</p>
            <div className="mt-4 space-y-2">
              {(["X","Instagram","Facebook","TikTok"] as Channel[]).map((channel) => (
                <div key={channel} className="flex items-center justify-between rounded-[16px] border border-border px-4 py-3">
                  <span className="text-sm font-black">{channel}</span>
                  <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-black text-muted-foreground">Bağlantı gerekli</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
              Hesap bağlantıları OAuth ile yapılacak. AQRYO sosyal hesap şifreni saklamaz.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
