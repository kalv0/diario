#!/usr/bin/env node
/** Lista las cuentas existentes y cuántas experiencias tiene cada una. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { experiences: true } } },
  });

  if (users.length === 0) {
    console.log("No hay usuarios todavía. Crea uno con: npm run user:create -- <usuario> <contraseña>");
  } else {
    for (const u of users) {
      console.log(
        `${u.username.padEnd(20)} ${String(u._count.experiences).padStart(5)} experiencias   alta ${u.createdAt.toISOString().slice(0, 10)}`,
      );
    }
  }
} finally {
  await prisma.$disconnect();
}
