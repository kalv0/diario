"use server";

import { redirect } from "next/navigation";
import { authenticate, endSession, startSession } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!username || !password) {
    return { error: "Escribe usuario y contraseña." };
  }

  const user = await authenticate(username, password);
  if (!user) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await startSession(user);
  // Solo aceptamos rutas internas como destino, nunca URLs absolutas.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}
