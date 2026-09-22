/**
 * Zero-install local MongoDB for development, powered by mongodb-memory-server.
 * Runs a real mongod as a single-node replica set (required for Prisma
 * transactions) on localhost:27017, with persistent data in ~/lumiere-mongodata.
 *
 *   node scripts/db-server.mjs   (or: npm run db:server)
 *
 * Leave it running in its own terminal. Stop with Ctrl+C.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = process.env.MONGO_DATA_DIR || path.join(os.homedir(), "lumiere-mongodata");
mkdirSync(dataDir, { recursive: true });

async function main() {
  console.log("[db] starting MongoDB (single-node replica set) on localhost:27017…");
  console.log("[db] (first run downloads the mongod binary — this can take a minute)");

  const replSet = await MongoMemoryReplSet.create({
    replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
    instanceOpts: [{ port: 27017, dbPath: dataDir, storageEngine: "wiredTiger" }],
  });

  const uri = replSet.getUri("lumiere");
  console.log(`[db] URI: ${uri}`);
  console.log("[db] READY — set DATABASE_URL to:");
  console.log('     mongodb://127.0.0.1:27017/lumiere?replicaSet=rs0');

  const shutdown = async () => {
    console.log("\n[db] stopping (keeping data)…");
    try {
      // doCleanup:false keeps the data directory so content persists.
      await replSet.stop({ doCleanup: false, force: false });
    } catch {}
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  setInterval(() => {}, 1 << 30);
}

main().catch((err) => {
  console.error("[db] failed:", err);
  process.exit(1);
});
