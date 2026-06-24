require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");
const crypto = require("crypto");

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `pbkdf2:${ITERATIONS}:${salt}:${hash}`;
}

const MONGODB_URI = process.env.MONGODB_DIRECT_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Add it to .env.local or set it before running this script.");
  process.exit(1);
}

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: node scripts/seed-superadmin.js "Your Name" email@example.com "password"');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "faculty", "student"],
      default: "student",
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const normalizedEmail = email.toLowerCase();
  const passwordHash = hashPassword(password);
  const existing = await User.findOne({ email: normalizedEmail }).select("+password");

  if (existing) {
    existing.name = name;
    existing.password = passwordHash;
    existing.role = "superadmin";
    existing.status = "active";
    await existing.save();
    console.log(`Updated existing superadmin: ${normalizedEmail}`);
  } else {
    await User.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
      role: "superadmin",
      status: "active",
    });
    console.log(`Created superadmin: ${normalizedEmail}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
