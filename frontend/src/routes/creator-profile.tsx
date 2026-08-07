import { CreatorNavigation } from "@/components/CreatorNavigation";
import { AvatarCustomizer } from "@/components/creator/AvatarCustomizer";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  getCurrentCreator,
  signOutCreator,
  updateCreatorDisplayName,
} from "@/services/auth";
import { supabase } from "@/services/supabase";
import {
  defaultCreatorAvatarSettings,
  saveCurrentCreatorAvatarSettings,
  type CreatorAvatarSettings,
} from "@/services/creatorAvatar";

interface CreatorAccount {
  displayName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string | null;
}

interface CreatorPublicProfile {
  username: string;
  avatarUrl: string;
  bio: string;
}


export const Route = createFileRoute(
  "/creator-profile",
)({
  component: CreatorProfilePage,
});

function CreatorProfilePage() {
  const [account, setAccount] =
    useState<CreatorAccount | null>(null);

  const [displayName, setDisplayName] =
    useState("");

  const [publicProfile, setPublicProfile] =
    useState<CreatorPublicProfile>({
      username: "",
      avatarUrl: "",
      bio: "",
    });

  const [username, setUsername] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [
    avatarSettings,
    setAvatarSettings,
  ] = useState<CreatorAvatarSettings>(
    defaultCreatorAvatarSettings,
  );

  const [
    avatarSettingsSaving,
    setAvatarSettingsSaving,
  ] = useState(false);

  const [
    avatarSettingsError,
    setAvatarSettingsError,
  ] = useState<string | null>(null);

  const [
    avatarSettingsSuccess,
    setAvatarSettingsSuccess,
  ] = useState<string | null>(null);

  const [bio, setBio] =
    useState("");

  const [
    publicProfileSaving,
    setPublicProfileSaving,
  ] = useState(false);

  const [
    publicProfileError,
    setPublicProfileError,
  ] = useState<string | null>(null);

  const [
    publicProfileSuccess,
    setPublicProfileSuccess,
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [
    saveErrorMessage,
    setSaveErrorMessage,
  ] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const creator =
          await getCurrentCreator();

        if (!creator) {
          window.location.href =
            "/creator-auth";

          return;
        }

        const creatorDisplayName =
          typeof creator.user_metadata
            ?.display_name === "string"
            ? creator.user_metadata.display_name.trim()
            : "";

        const normalizedDisplayName =
          creatorDisplayName || "Creator";

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("creator_profiles")
          .select(
            `
              username,
              avatar_url,
              avatar_style,
              avatar_bg,
              avatar_zoom,
              avatar_x,
              avatar_y,
              avatar_frame,
              bio
            `,
          )
          .eq("id", creator.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            profileError.message,
          );
        }

        const loadedPublicProfile = {
          username:
            typeof profileData?.username ===
            "string"
              ? profileData.username
              : "",
          avatarUrl:
            typeof profileData?.avatar_url ===
            "string"
              ? profileData.avatar_url
              : "",
          bio:
            typeof profileData?.bio === "string"
              ? profileData.bio
              : "",
        };

        if (!cancelled) {
          setAccount({
            displayName:
              normalizedDisplayName,
            email:
              creator.email ??
              "E-posta bulunamadı",
            emailVerified: Boolean(
              creator.email_confirmed_at,
            ),
            createdAt:
              creator.created_at ?? null,
          });

          setDisplayName(
            normalizedDisplayName,
          );

          setPublicProfile(
            loadedPublicProfile,
          );

          setUsername(
            loadedPublicProfile.username,
          );

          setAvatarUrl(
            loadedPublicProfile.avatarUrl,
          );

          setAvatarSettings({
            avatarUrl:
              loadedPublicProfile.avatarUrl,
            avatarStyle:
              (profileData?.avatar_style ??
                "classic") as CreatorAvatarSettings["avatarStyle"],
            avatarBg:
              (profileData?.avatar_bg ??
                "violet") as CreatorAvatarSettings["avatarBg"],
            avatarZoom:
              Number(
                profileData?.avatar_zoom ??
                  1,
              ),
            avatarX:
              Number(
                profileData?.avatar_x ??
                  50,
              ),
            avatarY:
              Number(
                profileData?.avatar_y ??
                  50,
              ),
            avatarFrame:
              profileData?.avatar_frame ??
              true,
          });

          setBio(
            loadedPublicProfile.bio,
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Hesap bilgileri yüklenemedi.";

        console.error(
          "Creator hesabı yüklenemedi:",
          error,
        );

        if (!cancelled) {
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDisplayNameSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!account || saving) {
      return;
    }

    const normalizedDisplayName =
      displayName.trim();

    if (
      normalizedDisplayName ===
      account.displayName
    ) {
      return;
    }

    try {
      setSaving(true);
      setSaveErrorMessage(null);
      setSuccessMessage(null);

      const updatedCreator =
        await updateCreatorDisplayName(
          normalizedDisplayName,
        );

      const updatedDisplayName =
        typeof updatedCreator.user_metadata
          ?.display_name === "string"
          ? updatedCreator.user_metadata.display_name.trim()
          : normalizedDisplayName;

      setAccount((currentAccount) =>
        currentAccount
          ? {
              ...currentAccount,
              displayName:
                updatedDisplayName,
            }
          : currentAccount,
      );

      setDisplayName(
        updatedDisplayName,
      );

      const creator =
        await getCurrentCreator();

      if (creator) {
        const { error: profileNameError } =
          await supabase
            .from("creator_profiles")
            .update({
              display_name:
                updatedDisplayName,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", creator.id);

        if (profileNameError) {
          console.error(
            "Public creator adı güncellenemedi:",
            profileNameError,
          );
        }
      }

      setSuccessMessage(
        "Creator adı güncellendi.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Creator adı güncellenemedi.";

      setSaveErrorMessage(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarSettingsSave() {
    if (avatarSettingsSaving) {
      return;
    }

    try {
      setAvatarSettingsSaving(true);
      setAvatarSettingsError(null);
      setAvatarSettingsSuccess(null);

      await saveCurrentCreatorAvatarSettings(
        avatarSettings,
      );

      setAvatarUrl(
        avatarSettings.avatarUrl,
      );

      setPublicProfile(
        (currentProfile) => ({
          ...currentProfile,
          avatarUrl:
            avatarSettings.avatarUrl,
        }),
      );

      setAvatarSettingsSuccess(
        "Avatar ayarların kaydedildi.",
      );
    } catch (error) {
      setAvatarSettingsError(
        error instanceof Error
          ? error.message
          : "Avatar ayarları kaydedilemedi.",
      );
    } finally {
      setAvatarSettingsSaving(false);
    }
  }

  async function handlePublicProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!account || publicProfileSaving) {
      return;
    }

    const creator =
      await getCurrentCreator();

    if (!creator) {
      window.location.href =
        "/creator-auth";

      return;
    }

    const normalizedUsername =
      username
        .trim()
        .toLocaleLowerCase("tr-TR")
        .replace(/\s+/g, "");

    const normalizedAvatarUrl =
      avatarUrl.trim();

    const normalizedBio =
      bio.trim();

    if (
      normalizedUsername &&
      !/^[a-z0-9._]{3,30}$/.test(
        normalizedUsername,
      )
    ) {
      setPublicProfileError(
        "Kullanıcı adı 3-30 karakter olmalı ve yalnızca küçük harf, rakam, nokta veya alt çizgi içermeli.",
      );

      return;
    }

    if (normalizedBio.length > 160) {
      setPublicProfileError(
        "Bio en fazla 160 karakter olabilir.",
      );

      return;
    }

    try {
      setPublicProfileSaving(true);
      setPublicProfileError(null);
      setPublicProfileSuccess(null);

      const { error } = await supabase
        .from("creator_profiles")
        .upsert(
          {
            id: creator.id,
            display_name:
              account.displayName,
            username:
              normalizedUsername || null,
            avatar_url:
              normalizedAvatarUrl || null,
            bio:
              normalizedBio || null,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        );

      if (error) {
        if (
          error.code === "23505" ||
          error.message
            .toLocaleLowerCase("tr-TR")
            .includes("duplicate")
        ) {
          throw new Error(
            "Bu kullanıcı adı başka bir creator tarafından kullanılıyor.",
          );
        }

        throw new Error(error.message);
      }

      const updatedProfile = {
        username: normalizedUsername,
        avatarUrl: avatarUrl,
        bio: normalizedBio,
      };

      setPublicProfile(updatedProfile);
      setUsername(updatedProfile.username);
      setAvatarUrl(updatedProfile.avatarUrl);
      setBio(updatedProfile.bio);

      setPublicProfileSuccess(
        "Public creator profili güncellendi.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Public profil güncellenemedi.";

      setPublicProfileError(message);
    } finally {
      setPublicProfileSaving(false);
    }
  }

  const displayNameChanged =
    Boolean(account) &&
    displayName.trim() !==
      account?.displayName;

  const publicProfileChanged =
    username.trim() !==
      publicProfile.username ||
    bio.trim() !==
      publicProfile.bio;

  return (
    <main className="min-h-screen bg-[#f8f8fa] text-foreground">
      <CreatorNavigation
        onSignOut={async () => {
          await signOutCreator();

          window.location.href =
            "/creator-auth";
        }}
      />

      <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <h1 className="text-[11px] font-black uppercase tracking-[0.13em] sm:text-xs">
            Hesap
          </h1>

          <span className="text-[9px] font-black uppercase tracking-[0.08em] text-muted-foreground">
            Profil
          </span>
        </header>

        {loading && (
          <section className="mt-4 rounded-[20px] border border-border bg-white p-10 text-center">
            <p className="text-xs font-bold text-muted-foreground">
              Hesap bilgileri yükleniyor...
            </p>
          </section>
        )}

        {!loading && errorMessage && (
          <section className="mt-4 rounded-[18px] border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-bold text-red-700">
              {errorMessage}
            </p>
          </section>
        )}

        {!loading &&
          !errorMessage &&
          account && (
            <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[22px] border border-border bg-white p-5 shadow-[0_14px_45px_rgba(22,12,34,0.04)] sm:p-6">
                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-primary">
                  Creator profili
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[17px] bg-foreground text-sm font-black text-background">
                    {avatarSettings.avatarUrl.trim() ? (
                      <img
                        src={avatarSettings.avatarUrl.trim()}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(
                        account.displayName,
                      )
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black tracking-[-0.035em] sm:text-2xl">
                      {account.displayName}
                    </h2>

                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                      {account.email}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleDisplayNameSubmit
                  }
                  className="mt-6 rounded-[16px] border border-border bg-[#fafafa] p-4"
                >
                  <label
                    htmlFor="display-name"
                    className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground"
                  >
                    Creator adı
                  </label>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="display-name"
                      type="text"
                      value={displayName}
                      maxLength={50}
                      onChange={(event) => {
                        setDisplayName(
                          event.target.value,
                        );

                        setSaveErrorMessage(
                          null,
                        );

                        setSuccessMessage(null);
                      }}
                      className="h-10 min-w-0 flex-1 rounded-[12px] border border-border bg-white px-3 text-[10px] font-bold outline-none transition focus:border-primary"
                    />

                    <button
                      type="submit"
                      disabled={
                        !displayNameChanged ||
                        saving
                      }
                      className="flex h-10 shrink-0 items-center justify-center rounded-[12px] bg-black px-5 text-[9px] font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {saving
                        ? "Kaydediliyor..."
                        : "Kaydet"}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-[8px] text-muted-foreground">
                      En fazla 50 karakter
                    </p>

                    <p className="text-[8px] font-bold text-muted-foreground">
                      {displayName.length}/50
                    </p>
                  </div>

                  {saveErrorMessage && (
                    <p className="mt-3 text-[9px] font-bold text-red-600">
                      {saveErrorMessage}
                    </p>
                  )}

                  {successMessage && (
                    <p className="mt-3 text-[9px] font-bold text-emerald-700">
                      {successMessage}
                    </p>
                  )}
                </form>

                <form
                  onSubmit={
                    handlePublicProfileSubmit
                  }
                  className="mt-4 rounded-[16px] border border-border bg-[#fafafa] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground">
                        Public creator profili
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        Experience’larında ve public creator sayfanda görünür.
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[7px] font-black text-primary">
                      Herkese açık
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div>
                      <label
                        htmlFor="creator-username"
                        className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground"
                      >
                        Kullanıcı adı
                      </label>

                      <div className="mt-2 flex h-10 items-center rounded-[12px] border border-border bg-white px-3 focus-within:border-primary">
                        <span className="text-[10px] font-black text-muted-foreground">
                          @
                        </span>

                        <input
                          id="creator-username"
                          type="text"
                          value={username}
                          maxLength={30}
                          onChange={(event) => {
                            setUsername(
                              event.target.value,
                            );
                            setPublicProfileError(
                              null,
                            );
                            setPublicProfileSuccess(
                              null,
                            );
                          }}
                          placeholder="ayseyilmaz"
                          className="h-full min-w-0 flex-1 bg-transparent pl-1 text-[10px] font-bold outline-none"
                        />
                      </div>

                      <p className="mt-1.5 text-[8px] text-muted-foreground">
                        3-30 karakter · küçük harf, rakam, nokta veya _
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label
                          htmlFor="creator-bio"
                          className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground"
                        >
                          Bio
                        </label>

                        <span className="text-[8px] font-bold text-muted-foreground">
                          {bio.length}/160
                        </span>
                      </div>

                      <textarea
                        id="creator-bio"
                        value={bio}
                        maxLength={160}
                        rows={3}
                        onChange={(event) => {
                          setBio(
                            event.target.value,
                          );
                          setPublicProfileError(
                            null,
                          );
                          setPublicProfileSuccess(
                            null,
                          );
                        }}
                        placeholder="Kendini ve hazırladığın Experience’ları kısaca anlat."
                        className="mt-2 w-full resize-none rounded-[12px] border border-border bg-white px-3 py-3 text-[10px] font-bold leading-4 outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  {publicProfileError && (
                    <p className="mt-3 text-[9px] font-bold text-red-600">
                      {publicProfileError}
                    </p>
                  )}

                  {publicProfileSuccess && (
                    <p className="mt-3 text-[9px] font-bold text-emerald-700">
                      {publicProfileSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={
                      !publicProfileChanged ||
                      publicProfileSaving
                    }
                    className="mt-4 flex h-10 w-full items-center justify-center rounded-[12px] bg-black text-[9px] font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {publicProfileSaving
                      ? "Kaydediliyor..."
                      : "Public profili kaydet"}
                  </button>
                </form>

                <div className="mt-4">
                  <AvatarCustomizer
                    value={avatarSettings}
                    onChange={(nextValue) => {
                      setAvatarSettings(
                        nextValue,
                      );
                      setAvatarSettingsError(
                        null,
                      );
                      setAvatarSettingsSuccess(
                        null,
                      );
                    }}
                    disabled={
                      avatarSettingsSaving
                    }
                    displayName={
                      displayName.trim() ||
                      account.displayName
                    }
                    username={username}
                    bio={bio}
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        void handleAvatarSettingsSave();
                      }}
                      disabled={
                        avatarSettingsSaving
                      }
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[13px] font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {avatarSettingsSaving
                        ? "Kaydediliyor..."
                        : "Avatarı kaydet"}
                    </button>

                    {avatarSettingsSuccess ? (
                      <p className="text-[12px] font-bold text-emerald-700">
                        {
                          avatarSettingsSuccess
                        }
                      </p>
                    ) : null}

                    {avatarSettingsError ? (
                      <p className="text-[12px] font-bold text-red-600">
                        {
                          avatarSettingsError
                        }
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 divide-y divide-border rounded-[16px] border border-border bg-[#fafafa] px-4">
                  <AccountRow
                    label="E-posta"
                    value={account.email}
                  />

                  <AccountRow
                    label="E-posta durumu"
                    value={
                      account.emailVerified
                        ? "Doğrulandı"
                        : "Doğrulanmadı"
                    }
                    status={
                      account.emailVerified
                    }
                  />

                  <AccountRow
                    label="Üyelik tarihi"
                    value={
                      account.createdAt
                        ? formatDate(
                            account.createdAt,
                          )
                        : "Bilinmiyor"
                    }
                  />
                </div>
              </div>

              <aside className="space-y-4">
                <section className="rounded-[22px] border border-border bg-white p-5 shadow-[0_14px_45px_rgba(22,12,34,0.04)]">
                  <p className="text-[8px] font-black uppercase tracking-[0.09em] text-muted-foreground">
                    Güvenlik
                  </p>

                  <h2 className="mt-3 text-base font-black">
                    Şifre ve oturumlar
                  </h2>

                  <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                    Şifre değiştirme, sıfırlama
                    ve tüm cihazlardan çıkış
                    işlemleri artık Güvenlik
                    sayfasında.
                  </p>

                  <a
                    href="/creator-security"
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-[12px] bg-black px-4 text-[9px] font-black text-white transition hover:bg-primary"
                  >
                    Güvenliğe git →
                  </a>
                </section>

                <section className="rounded-[22px] border border-border bg-white p-5 shadow-[0_14px_45px_rgba(22,12,34,0.04)]">
                  <p className="text-[8px] font-black uppercase tracking-[0.09em] text-muted-foreground">
                    Oturum
                  </p>

                  <h2 className="mt-3 text-base font-black">
                    Bu cihazdaki oturumu kapat
                  </h2>

                  <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                    Çıkış yaptığında yeniden
                    giriş yapman gerekir.
                  </p>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOutCreator();

                      window.location.href =
                        "/creator-auth";
                    }}
                    className="mt-5 text-[9px] font-black text-red-600 transition hover:text-red-700"
                  >
                    Çıkış yap →
                  </button>
                </section>
              </aside>
            </section>
          )}
      </div>
    </main>
  );
}

function AccountRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </span>

      <div className="flex min-w-0 items-center justify-end gap-2">
        {typeof status ===
          "boolean" && (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              status
                ? "bg-emerald-400"
                : "bg-amber-400"
            }`}
          />
        )}

        <span className="truncate text-right text-[9px] font-black">
          {value}
        </span>
      </div>
    </div>
  );
}

function getInitials(
  value: string,
) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "CR";
  }

  return words
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Bilinmiyor";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}