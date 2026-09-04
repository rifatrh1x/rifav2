import "dotenv/config";
import { seedIfEmpty } from "../src/db/seed";

seedIfEmpty()
  .then(() => {
    console.log("Seeding complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
