// src/lib/crypto/token-crypto.ts
import crypto from "crypto";
import Cookies from "js-cookie";


const algorithm = "aes-256-cbc";

const getKey = () => {
  const secret = process.env.JWT_SECRET!;
  return Buffer.from(secret.padEnd(32, "0").slice(0, 32));
};

export function decryptToken(encryptedToken: string): string {
  const [ivHex, encryptedHex] = encryptedToken.split(":");

  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);

  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}


export function getAccessToken(): string | null {
  return Cookies.get("lumi_a_t") || "null";
  
}