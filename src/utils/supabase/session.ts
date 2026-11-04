export const sessionCookieName = "blooms-staff-auth";
export const legacySessionCookie = "blooms-staff-session";
export const sessionCookieOptions = {
  name: sessionCookieName,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};
export function isSessionCookie(name: string) {
  return name === sessionCookieName || name.startsWith(sessionCookieName + ".");
}
export function isAuthCookie(name: string) {
  return (
    isSessionCookie(name) ||
    name.startsWith(sessionCookieName + "-") ||
    name === legacySessionCookie
  );
}
