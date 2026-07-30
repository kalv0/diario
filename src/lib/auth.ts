import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { SESSION_COOKIE, sessionMaxAgeSeconds, signSession, verifySession } from "./session";

export interface CurrentUser {
  id: string;
  username: string;
  displayName: string | null;
}

/** Comprueba credenciales. Devuelve el usuario o null, sin distinguir el motivo. */
export async function authenticate(username: string, password: string): Promise<CurrentUser | null> {
  const user = await prisma.user.findUnique({ where: { username: username.trim().toLowerCase() } });
  // Comparamos siempre, incluso sin usuario, para no filtrar por tiempo de
  // respuesta qué nombres existen.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) return null;
  return { id: user.id, username: user.username, displayName: user.displayName };
}

export async function startSession(user: CurrentUser): Promise<void> {
  const token = await signSession({ uid: user.id, username: user.username });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Usuario de la petición actual, o null si no hay sesión válida. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const payload = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.uid } });
  if (!user) return null;
  return { id: user.id, username: user.username, displayName: user.displayName };
}

/** Igual que getCurrentUser pero lanza si no hay sesión (rutas ya protegidas). */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
