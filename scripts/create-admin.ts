import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

function readHidden(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Run this command in an interactive terminal so the password stays hidden.");
  }

  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdout.write(prompt);

  return new Promise((resolve, reject) => {
    let value = "";

    const cleanup = () => {
      process.stdin.off("keypress", onKeypress);
      process.stdin.setRawMode(false);
      process.stdout.write("\n");
    };

    const onKeypress = (character: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Cancelled."));
      } else if (key.name === "return" || key.name === "enter") {
        cleanup();
        resolve(value);
      } else if (key.name === "backspace") {
        value = value.slice(0, -1);
      } else if (!key.ctrl && character) {
        value += character;
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set.");

  let database: URL;
  try {
    database = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL.");
  }

  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.info(`Target database host: ${database.hostname}`);
    const confirmation = await terminal.question("Type CREATE to confirm this database: ");
    if (confirmation !== "CREATE") throw new Error("Cancelled.");

    const email = (await terminal.question("New admin email: ")).trim().toLowerCase();
    const name = (await terminal.question("Admin name: ")).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    if (!name || name.length > 120) {
      throw new Error("Name must contain 1 to 120 characters.");
    }
    if (!process.stdin.isTTY) {
      throw new Error("Run this command in an interactive terminal so the password stays hidden.");
    }

    terminal.close();

    const password = await readHidden("New password (minimum 8 characters): ");
    const passwordConfirmation = await readHidden("Confirm password: ");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    if (password !== passwordConfirmation) throw new Error("Passwords do not match.");

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new Error(`An account already exists for ${email}. Choose a different email; this command does not overwrite users.`);
    }

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    console.info(`Created active SUPER_ADMIN account for ${email}. Sign in at /admin/login.`);
  } finally {
    terminal.close();
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Admin creation failed.");
  process.exitCode = 1;
});
