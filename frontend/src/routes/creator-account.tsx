import { CreatorNavigation } from "@/components/CreatorNavigation";
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
  updateCreatorPassword,
} from "@/services/auth";
import { supabase } from "@/services/supabase";

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
  "/creator-account",
)({
  component: CreatorAccountPage,
});

function CreatorAccountPage() {
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
    avatarUploading,
    setAvatarUploading,
  ] = useState(false);

  const [
    avatarError,
    setAvatarError,
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

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    passwordErrorMessage,
    setPasswordErrorMessage,
  ] = useState<string | null>(null);

  const [
    passwordSuccessMessage,
    setPasswordSuccessMessage,
  ] = useState<string | null>(null);

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

  async function handleAvatarUpload(
    file: File,
  ) {
    if (avatarUploading) {
      return;
    }

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png"
    ) {
      setAvatarError(
        "Yalnızca JPEG veya PNG yükleyebilirsin.",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(
        "Profil fotoğrafı en fazla 5 MB olabilir.",
      );
      return;
    }

    const creator =
      await getCurrentCreator();

    if (!creator) {
      window.location.href =
        "/creator-auth";
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarError(null);
      setPublicProfileError(null);
      setPublicProfileSuccess(null);

      const avatarPath =
        `${creator.id}/avatar`;

      const { error: uploadError } =
        await supabase.storage
          .from("creator-avatars")
          .upload(
            avatarPath,
            file,
            {
              upsert: true,
              contentType: file.type,
              cacheControl: "3600",
            },
          );

      if (uploadError) {
        throw new Error(
          uploadError.message,
        );
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("creator-avatars")
          .getPublicUrl(avatarPath);

      const publicAvatarUrl =
        `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error: profileError } =
        await supabase
          .from("creator_profiles")
          .update({
            avatar_url:
              publicAvatarUrl,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", creator.id);

      if (profileError) {
        throw new Error(
          profileError.message,
        );
      }

      setAvatarUrl(publicAvatarUrl);

      setPublicProfile(
        (currentProfile) => ({
          ...currentProfile,
          avatarUrl:
            publicAvatarUrl,
        }),
      );

      setPublicProfileSuccess(
        "Profil fotoğrafı güncellendi.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profil fotoğrafı yüklenemedi.";

      setAvatarError(message);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    if (avatarUploading) {
      return;
    }

    const creator =
      await getCurrentCreator();

    if (!creator) {
      window.location.href =
        "/creator-auth";
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarError(null);
      setPublicProfileError(null);
      setPublicProfileSuccess(null);

      const avatarPath =
        `${creator.id}/avatar`;

      const { error: removeError } =
        await supabase.storage
          .from("creator-avatars")
          .remove([avatarPath]);

      if (removeError) {
        throw new Error(
          removeError.message,
        );
      }

      const { error: profileError } =
        await supabase
          .from("creator_profiles")
          .update({
            avatar_url: null,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", creator.id);

      if (profileError) {
        throw new Error(
          profileError.message,
        );
      }

      setAvatarUrl("");

      setPublicProfile(
        (currentProfile) => ({
          ...currentProfile,
          avatarUrl: "",
        }),
      );

      setPublicProfileSuccess(
        "Profil fotoğrafı kaldırıldı.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profil fotoğrafı kaldırılamadı.";

      setAvatarError(message);
    } finally {
      setAvatarUploading(false);
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
        avatarUrl: normalizedAvatarUrl,
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

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (passwordSaving) {
      return;
    }

    setPasswordErrorMessage(null);
    setPasswordSuccessMessage(null);

    if (newPassword.length < 8) {
      setPasswordErrorMessage(
        "Yeni şifre en az 8 karakter olmalı.",
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage(
        "Şifreler eşleşmiyor.",
      );

      return;
    }

    try {
      setPasswordSaving(true);

      await updateCreatorPassword(
        newPassword,
      );

      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccessMessage(
        "Şifre güncellendi.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Şifre güncellenemedi.";

      setPasswordErrorMessage(
        message,
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  const displayNameChanged =
    Boolean(account) &&
    displayName.trim() !==
      account?.displayName;

  const publicProfileChanged =
    username.trim() !==
      publicProfile.username ||
    avatarUrl.trim() !==
      publicProfile.avatarUrl ||
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
            Profil ve güvenlik
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
                    {avatarUrl.trim() ? (
                      <img
                        src={avatarUrl.trim()}
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
                      <p className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground">
                        Profil fotoğrafı
                      </p>

                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <label
                          htmlFor="creator-avatar-file"
                          className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[12px] border border-border bg-white px-4 text-[9px] font-black transition hover:border-primary hover:text-primary ${
                            avatarUploading
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          {avatarUploading
                            ? "Yükleniyor..."
                            : avatarUrl
                              ? "Fotoğrafı değiştir"
                              : "Fotoğraf seç"}

                          <input
                            id="creator-avatar-file"
                            type="file"
                            accept="image/jpeg,image/png"
                            disabled={
                              avatarUploading
                            }
                            onChange={(event) => {
                              const file =
                                event.target
                                  .files?.[0];

                              if (file) {
                                void handleAvatarUpload(
                                  file,
                                );
                              }

                              event.currentTarget.value =
                                "";
                            }}
                            className="hidden"
                          />
                        </label>

                        {avatarUrl && (
                          <button
                            type="button"
                            disabled={
                              avatarUploading
                            }
                            onClick={() => {
                              void handleAvatarRemove();
                            }}
                            className="flex h-10 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 px-4 text-[9px] font-black text-red-600 transition hover:border-red-300 disabled:cursor-wait disabled:opacity-50"
                          >
                            Kaldır
                          </button>
                        )}
                      </div>

                      <p className="mt-1.5 text-[8px] text-muted-foreground">
                        JPEG veya PNG · en fazla 5 MB
                      </p>

                      {avatarError && (
                        <p className="mt-2 text-[9px] font-bold text-red-600">
                          {avatarError}
                        </p>
                      )}
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
                    Şifreyi değiştir
                  </h2>

                  <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                    Yeni şifren en az 8 karakter
                    olmalı.
                  </p>

                  <form
                    onSubmit={
                      handlePasswordSubmit
                    }
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label
                        htmlFor="new-password"
                        className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground"
                      >
                        Yeni şifre
                      </label>

                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => {
                          setNewPassword(
                            event.target.value,
                          );

                          setPasswordErrorMessage(
                            null,
                          );

                          setPasswordSuccessMessage(
                            null,
                          );
                        }}
                        autoComplete="new-password"
                        className="mt-2 h-10 w-full rounded-[12px] border border-border bg-[#fafafa] px-3 text-[10px] font-bold outline-none transition focus:border-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="text-[7px] font-black uppercase tracking-[0.07em] text-muted-foreground"
                      >
                        Yeni şifre tekrar
                      </label>

                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(
                            event.target.value,
                          );

                          setPasswordErrorMessage(
                            null,
                          );

                          setPasswordSuccessMessage(
                            null,
                          );
                        }}
                        autoComplete="new-password"
                        className="mt-2 h-10 w-full rounded-[12px] border border-border bg-[#fafafa] px-3 text-[10px] font-bold outline-none transition focus:border-primary"
                      />
                    </div>

                    {passwordErrorMessage && (
                      <p className="text-[9px] font-bold text-red-600">
                        {
                          passwordErrorMessage
                        }
                      </p>
                    )}

                    {passwordSuccessMessage && (
                      <p className="text-[9px] font-bold text-emerald-700">
                        {
                          passwordSuccessMessage
                        }
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        passwordSaving ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="flex h-10 w-full items-center justify-center rounded-[12px] bg-black text-[9px] font-black text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {passwordSaving
                        ? "Güncelleniyor..."
                        : "Şifreyi güncelle"}
                    </button>
                  </form>
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