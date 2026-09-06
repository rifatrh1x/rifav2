export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // 1. Create all tables if they don't exist (no CLI needed).
      const { ensureSchema } = await import("@/db/migrate");
      await ensureSchema();
    } catch (error) {
      console.error("Schema setup failed:", error);
    }
    try {
      // 2. Seed realistic demo data on first boot.
      const { seedIfEmpty } = await import("@/db/seed");
      await seedIfEmpty();
    } catch (error) {
      console.error("Seeding failed:", error);
    }
  }
}
