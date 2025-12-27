import { CookieOptions } from "express";
import { ENV_VALUE } from "./env";

const sameSiteFromEnv = (): "lax" | "strict" | "none" | undefined => {
  // CHANGE B — cast env to allowed sameSite values or undefined
  const v = ENV_VALUE.COOKIE.SAMESITE.toLowerCase();
  if (v === "lax" || v === "strict" || v === "none") return v;
  return undefined;
};

export const getAccessTokenOptions = (): CookieOptions | any => {
  const fallback = 15 * 60 * 1000; // 15 minutes in ms
  const maxAge = ENV_VALUE.JWT.ACCESS_TOKEN_EXPIRY;

  return {
    httpOnly: ENV_VALUE.COOKIE.HTTPONLY === "true",
    secure: ENV_VALUE.COOKIE.SECURE === "true",
    sameSite: sameSiteFromEnv(),
    maxAge: maxAge ? Number(maxAge) * 60 * 1000 : fallback,
    // ...(ENV_VALUE.COOKIE.PARTITIONED === "true" ? { partitioned: true } : {}),
  };
};

export const getRefreshTokenOptions = (): CookieOptions => {
  const fallback = 7 * 24 * 60 * 60 * 1000; // 7 days
  const maxAge = ENV_VALUE.JWT.REFRESH_TOKEN_EXPIRY;

  return {
    httpOnly: ENV_VALUE.COOKIE.HTTPONLY === "true",
    secure: ENV_VALUE.COOKIE.SECURE === "true",
    sameSite: sameSiteFromEnv(),
    maxAge: maxAge ? Number(maxAge) * 24 * 60 * 60 * 1000 : fallback,
    // ...(ENV_VALUE.COOKIE.PARTITIONED === "true" ? { partitioned: true } : {}),
  };
};

export const getClearCookieOptions = (): CookieOptions => ({
  httpOnly: ENV_VALUE.COOKIE.HTTPONLY === "true",
  secure: ENV_VALUE.COOKIE.SECURE === "true",
  sameSite: sameSiteFromEnv(),
  // ...(ENV_VALUE.COOKIE.PARTITIONED === "true" ? { partitioned: true } : {}),
});
