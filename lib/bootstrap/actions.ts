"use server";

import { requireSuperAdmin } from "@/lib/auth/session";

import {
  getSuperAdminBootstrapHealth,
  runSuperAdminBootstrap,
} from "./super-admin";
import type { BootstrapHealth, BootstrapRunResult } from "./types";

export async function verifyBootstrapSuperAdminHealth(): Promise<BootstrapHealth> {
  await requireSuperAdmin();
  return getSuperAdminBootstrapHealth();
}

export async function repairBootstrapSuperAdmin(): Promise<BootstrapRunResult> {
  const profile = await requireSuperAdmin();
  return runSuperAdminBootstrap({
    source: "admin_repair",
    actorId: profile.id,
  });
}
