import crypto from "crypto";

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const PREFIX = "pbkdf2";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `${PREFIX}:${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  const [prefix, iterations, salt, storedHash] = storedPassword.split(":");

  if (prefix !== PREFIX || !iterations || !salt || !storedHash) {
    return false;
  }

  try {
    const hash = crypto
      .pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, DIGEST)
      .toString("hex");

    const hashBuffer = Buffer.from(hash, "hex");
    const storedHashBuffer = Buffer.from(storedHash, "hex");

    return (
      hashBuffer.length === storedHashBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, storedHashBuffer)
    );
  } catch {
    return false;
  }
}
