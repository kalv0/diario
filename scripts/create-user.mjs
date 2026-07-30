#!/usr/bin/env node
/**
 * Alta de usuarios del diario. No hay registro público: las cuentas se crean
 * siempre desde aquí (es lo que el popup de la demo llama "el administrador").
 *
 *   npm run user:create -- <usuario> <contraseña> ["Nombre visible"]
 *
 * Dentro del contenedor:
 *   docker compose exec app node scripts/create-user.mjs raul micontraseña "Raúl"
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
