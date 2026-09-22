import { prisma } from "@/lib/db";

interface LogInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  summary?: string;
  ipAddress?: string | null;
}

/** Records an admin action. Never throws into the caller's flow. */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        summary: input.summary,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}
