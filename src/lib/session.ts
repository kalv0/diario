// Importamos los submódulos concretos en vez del índice de jose: el índice
// arrastra el código de JWE, que usa CompressionStream y no existe en el
// runtime edge donde corre el middleware.
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

/**
 * Sesión en cookie firmada (JWT HS256). Este módulo no toca la base de datos
 * a propósito: lo importa también el middleware, que corre en el runtime edge.
 */

export const SESSION_COOKIE = "dds_session";

export interface SessionPayload {
  uid: string;
  username: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET no está definido o es demasiado corto (mínimo 32 caracteres). Revisa tu archivo .env.",
    );
  }
  return new TextEncoder().encode(secret);
}

export function sessionMaxAgeSeconds(): number {
  const days = Number(process.env.SESSION_DAYS ?? 30);
  return (Number.isFinite(days) && days > 0 ? days : 30) * 24 * 60 * 60;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds()}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.uid !== "string" || typeof payload.username !== "string") return null;
    return { uid: payload.uid, username: payload.username };
  } catch {
    return null;
  }
}
