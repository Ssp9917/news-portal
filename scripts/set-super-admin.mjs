// scripts/set-super-admin.mjs
// Usage: node scripts/set-super-admin.mjs <email>
// Example: node scripts/set-super-admin.mjs admin@example.com

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

function loadDotenv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadDotenv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("❌ Please provide an email: node scripts/set-super-admin.mjs <email>");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  isActive: Boolean,
  tenantId: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  user.role = "super_admin";
  user.isActive = true;
  await user.save();

  console.log(`✅ User "${email}" has been promoted to super_admin`);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
