#!/usr/bin/env node
/**
 * Alta suelta de una cuenta, sin pasar por `.users`.
 *
 * La vía normal es declarar las cuentas en `.users` y dejar que el contenedor
 * las sincronice al arrancar (ver scripts/sync-users.mjs). Esto es la salida de
 * emergencia: recuperar el acceso sin reiniciar, o probar algo en local.
 *
 *   npm run user:create -- <usuario> <contraseña> ["Nombre visible"]
 *
 * Ojo: lo que se cree aquí y no esté en `.users` saldrá avisado como sobrante
 * en el siguiente arranque. Si la cuenta es para quedarse, ponla en el fichero.
 *
 * Si el usuario ya existe, se le actualiza la contraseña.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [username, password, displayName] = process.argv.slice(2);

if (!username || !password) {
  console.error("Uso: node scripts/create-user.mjs <usuario> <contraseña> [\"Nombre visible\"]");
  process.exit(1);
}

if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { username: username.toLowerCase() },
    update: { passwordHash, displayName: displayName ?? undefined },
    create: {
      username: username.toLowerCase(),
      passwordHash,
      displayName: displayName ?? null,
    },
  });
  console.log(`✔ Usuario "${user.username}" listo (id ${user.id}).`);
} catch (error) {
  console.error("✖ No se pudo crear el usuario:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
