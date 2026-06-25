import crypto from "crypto";

type Role = "Superadmin" | "Admin" | "Faculty" | "Student";

export type AuthTokenUser = {
  email: string;
  role: Role;
  name: string;
};

type AuthTokenPayload = AuthTokenUser & {
  iat: number;
  exp: number;
};

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SECRET = process.env.JWT_SECRET || process.env.AUTH_TOKEN_SECRET;

if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("Missing JWT_SECRET environment variable");
}

const getSecret = () => SECRET || "development-only-change-me";

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createAuthToken(user: AuthTokenUser): string {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + TOKEN_TTL_MS) / 1000),
  });
  const unsignedToken = `${header}.${payload}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAuthToken(token?: string): AuthTokenUser | null {
  if (!token) return null;

  const [header, payload, signature] = token.replace(/^Bearer\s+/i, "").split(".");
  if (!header || !payload || !signature) return null;

  const expectedSignature = sign(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString()) as {
      alg?: string;
      typ?: string;
    };
    if (decodedHeader.alg !== "HS256" || decodedHeader.typ !== "JWT") return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as AuthTokenPayload;
    if (!data.email || !data.role || !data.name || Math.floor(Date.now() / 1000) > data.exp) {
      return null;
    }

    return {
      email: data.email,
      role: data.role,
      name: data.name,
    };
  } catch {
    return null;
  }
}
