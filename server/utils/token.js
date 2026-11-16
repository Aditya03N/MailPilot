import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "mailpilot_super_secure_jwt_secret_key_2026_x89q",
    {
      expiresIn: "30d",
    },
  );
};

export const generateTeamCode = (name = "MAIL") => {
  const prefix = (
    name.replace(/[^A-Za-z]/g, "").slice(0, 4) || "MAIL"
  ).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
  return `${prefix}-${randomPart}`;
};
