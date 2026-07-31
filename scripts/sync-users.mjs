#!/usr/bin/env node
/**
 * Sincroniza las cuentas del diario con el fichero `.users`.
 *
 * Es el único sitio desde el que se administran los usuarios: se edita el
 * fichero y se reinicia (o se ejecuta `npm run users:sync`). El contenedor lo
 * corre en cada arranque, así que el estado del fichero manda.
 *
 * Formato, una cuenta por línea:
 *
 *     usuario:contraseña
 *     usuario:contraseña:Nombre visible
 *
 * Las líneas vacías y las que empiezan por `#` se ignoran. La contraseña no
 * puede contener `:` — es el separador y no hay escape que valga la pena.
 *
 * Qué hace con lo que encuentra:
 *  - usuario del fichero que no existe  -> lo crea
 *  - usuario que existe con otra contraseña o nombre -> lo actualiza
 *  - usuario en la base de datos que NO está en el fichero -> lo avisa y lo
 *    deja en paz. Borrarlo se llevaría por delante todas sus entradas, y eso
 *    no puede ser un efecto secundario de arrancar el contenedor.
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const USERS_FILE = process.env.USERS_FILE || path.resolve(process.cwd(), ".users");
const MIN_PASSWORD_LENGTH = 8;

function parseUsersFile(contents) {
  const users = [];
  const errors = [];

  contents.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const parts = line.split(":");
    const at = `línea ${index + 1}`;

    if (parts.length < 2) {
      errors.push(`${at}: falta la contraseña (formato: usuario:contraseña[:Nombre visible]).`);
      return;
    }
    if (parts.length > 3) {
      errors.push(`${at}: demasiados ":". La contraseña no puede contener dos puntos.`);
      return;
    }

    const username = parts[0].trim().toLowerCase();
    const password = parts[1];
    const displayName = parts[2]?.trim() || null;

    if (!username) return errors.push(`${at}: usuario vacío.`);
    if (!/^[a-z0-9._-]+$/.test(username)) {
      return errors.push(`${at}: el usuario "${username}" solo admite letras, números, punto, guion y guion bajo.`);
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return errors.push(`${at}: la contraseña de "${username}" tiene menos de ${MIN_PASSWORD_LENGTH} caracteres.`);
    }
    if (users.some((u) => u.username === username)) {
      return errors.push(`${at}: "${username}" está repetido.`);
    }

    users.push({ username, password, displayName });
  });

  return { users, errors };
}

if (!fs.existsSync(USERS_FILE)) {
  console.error(`✖ No existe ${USERS_FILE}.`);
  console.error("  Copia .users.example a .users y define ahí las cuentas.");
  process.exit(1);
}

const { users, errors } = parseUsersFile(fs.readFileSync(USERS_FILE, "utf8"));

if (errors.length > 0) {
  console.error(`✖ ${USERS_FILE} tiene errores:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

if (users.length === 0) {
  console.error(`✖ ${USERS_FILE} no define ninguna cuenta. Sin cuentas nadie puede entrar.`);
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  for (const { username, password, displayName } of users) {
    const existing = await prisma.user.findUnique({ where: { username } });

    if (!existing) {
      await prisma.user.create({
        data: { username, passwordHash: await bcrypt.hash(password, 12), displayName },
      });
      console.log(`+ ${username}: cuenta creada.`);
      continue;
    }

    const samePassword = await bcrypt.compare(password, existing.passwordHash);
    const sameName = (existing.displayName ?? null) === displayName;
    if (samePassword && sameName) {
      console.log(`= ${username}: sin cambios.`);
      continue;
    }

    await prisma.user.update({
      where: { username },
      data: {
        passwordHash: samePassword ? existing.passwordHash : await bcrypt.hash(password, 12),
        displayName,
      },
    });
    console.log(`~ ${username}: actualizado${samePassword ? "" : " (contraseña nueva)"}.`);
  }

  const known = new Set(users.map((u) => u.username));
  const extra = (await prisma.user.findMany({ include: { _count: { select: { experiences: true } } } })).filter(
    (u) => !known.has(u.username),
  );

  for (const user of extra) {
    console.warn(
      `! ${user.username}: está en la base de datos pero no en .users. Se deja como está ` +
        `(tiene ${user._count.experiences} entradas). Para borrarlo: npm run user:delete -- ${user.username}`,
    );
  }

  console.log(`✔ ${users.length} ${users.length === 1 ? "cuenta sincronizada" : "cuentas sincronizadas"}.`);
} catch (error) {
  console.error("✖ No se han podido sincronizar las cuentas:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
