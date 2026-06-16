export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runSuperAdminBootstrapOnStartup } = await import(
      "@/lib/bootstrap/super-admin"
    );

    try {
      await runSuperAdminBootstrapOnStartup();
    } catch (error) {
      console.error(
        "[bootstrap:super-admin] startup check failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }
}
