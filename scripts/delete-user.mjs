#!/usr/bin/env node
/**
 * Borra una cuenta y, en cascada, todas sus entradas del diario.
 *
 *   npm run user:delete -- <usuario>              # muestra qué se borraría
 *   npm run user:delete -- <usuario> --confirmar  # lo borra de verdad
 *
 * No lo hace `sync-users.mjs` a propósito: quitar a alguien del fichero .users
 * no puede significar perder su diario sin más.
 */
import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const username = args.find((a) => !a.startsWith("--"))?.toLowerCase();
const confirmed = args.includes("--confirmar");

if (!username) {
  console.error("Uso: node scripts/delete-user.mjs <usuario> [--confirmar]");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { _count: { select: { experiences: true } } },
  });

  if (!user) {
    console.error(`✖ No existe la cuenta "${username}".`);
    process.exit(1);
  }

  if (!confirmed) {
    console.log(`La cuenta "${user.username}" tiene ${user._count.experiences} entradas.`);
    console.log("Esto es irreversible. Para borrarla de verdad:");
    console.log(`  npm run user:delete -- ${user.username} --confirmar`);
    process.exit(0);
  }

  await prisma.user.delete({ where: { username } });
  console.log(`✔ Cuenta "${username}" y sus ${user._count.experiences} entradas borradas.`);
} finally {
  await prisma.$disconnect();
}
