import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export async function signUpCreator({
  email,
  password,
  displayName,
}: SignUpInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedDisplayName = displayName.trim();

  if (!normalizedDisplayName) {
    throw new Error("Creator adı boş bırakılamaz.");
  }

  if (!normalizedEmail) {
    throw new Error("E-posta adresi boş bırakılamaz.");
  }

  if (password.length < 8) {
    throw new Error("Şifre en az 8 karakter olmalı.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/creator-auth`,
      data: {
        display_name: normalizedDisplayName,
      },
    },
  });

  if (error) {
    throw new Error(`Kayıt oluşturulamadı: ${error.message}`);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signInCreator({
  email,
  password,
}: SignInInput) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (error) {
    if (error.message === "Invalid login credentials") {
      throw new Error(
        "E-posta veya şifre hatalı. E-postanı doğruladıysan kayıt sırasında kullandığın şifreyle tekrar dene.",
      );
    }

    if (
      error.message
        .toLowerCase()
        .includes("email not confirmed")
    ) {
      throw new Error(
        "E-posta adresin henüz doğrulanmamış. Gelen kutundaki doğrulama bağlantısını aç.",
      );
    }

    throw new Error(
      `Giriş yapılamadı: ${error.message}`,
    );
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function requestCreatorPasswordReset(
  email: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "E-posta adresi boş bırakılamaz.",
    );
  }

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo:
          `${window.location.origin}/creator-reset-password`,
      },
    );

  if (error) {
    throw new Error(
      `Şifre sıfırlama bağlantısı gönderilemedi: ${error.message}`,
    );
  }
}

export async function completeCreatorPasswordReset(
  newPassword: string,
): Promise<User> {
  if (newPassword.length < 8) {
    throw new Error(
      "Yeni şifre en az 8 karakter olmalı.",
    );
  }

  const { data, error } =
    await supabase.auth.updateUser({
      password: newPassword,
    });

  if (error) {
    throw new Error(
      `Yeni şifre kaydedilemedi: ${error.message}`,
    );
  }

  return data.user;
}
export async function resendCreatorVerificationEmail(
  email: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "E-posta adresi boş bırakılamaz.",
    );
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
    options: {
      emailRedirectTo:
        `${window.location.origin}/creator-auth`,
    },
  });

  if (error) {
    throw new Error(
      `Doğrulama e-postası tekrar gönderilemedi: ${error.message}`,
    );
  }
}
export async function signOutCreator() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw new Error(
      `Çıkış yapılamadı: ${error.message}`,
    );
  }
}

export async function getCurrentCreator(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function updateCreatorDisplayName(
  displayName: string,
): Promise<User> {
  const normalizedDisplayName =
    displayName.trim();

  if (!normalizedDisplayName) {
    throw new Error(
      "Creator adı boş bırakılamaz.",
    );
  }

  if (normalizedDisplayName.length > 50) {
    throw new Error(
      "Creator adı en fazla 50 karakter olabilir.",
    );
  }

  const { data, error } =
    await supabase.auth.updateUser({
      data: {
        display_name:
          normalizedDisplayName,
      },
    });

  if (error) {
    throw new Error(
      `Creator adı güncellenemedi: ${error.message}`,
    );
  }

  return data.user;
}

export async function updateCreatorPassword(
  newPassword: string,
): Promise<User> {
  if (newPassword.length < 8) {
    throw new Error(
      "Yeni şifre en az 8 karakter olmalı.",
    );
  }

  const { data, error } =
    await supabase.auth.updateUser({
      password: newPassword,
    });

  if (error) {
    throw new Error(
      `Şifre güncellenemedi: ${error.message}`,
    );
  }

  return data.user;
}