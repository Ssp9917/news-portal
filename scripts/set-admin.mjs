/**
 * Upserts an admin user (bcrypt password) in MongoDB `news_db`.
 *
 * Usage (recommended — avoids shell history):
 *   ADMIN_EMAIL=you@site.com ADMIN_PASSWORD=secret node scripts/set-admin.mjs
 *
 * Or positional:
 *   node scripts/set-admin.mjs you@site.com secret
 *
 * Loads variables from `.env` in project root when present (`MONGODB_URI`).
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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

const uri = process.env.MONGODB_URI;
const email = (process.env.ADMIN_EMAIL || process.argv[2] || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.argv[3];

if (!uri) {
  console.error("Missing MONGODB_URI. Set it in .env or the environment.");
  process.exit(1);
}

if (!email || !password) {
  console.error(
    "Provide admin email and password:\n  ADMIN_EMAIL=x ADMIN_PASSWORD=y node scripts/set-admin.mjs\n  or\n  node scripts/set-admin.mjs admin@example.com yourpassword"
  );
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(uri, { dbName: "news_db" });
  const hash = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        password: hash,
        role: "admin",
      },
    },
    { upsert: true, new: true }
  );

  console.log(`Admin OK: ${email} (password updated, role admin)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
