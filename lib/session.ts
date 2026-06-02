import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "ssga-secure-session-secret-string-at-least-32-chars-long",
  cookieName: "ssga_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax"
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}

export async function getValidSession() {
  const session = await getSession();

  // Simple check: Is the cookie present and valid?
  if (!session.isLoggedIn) {
    // Removed session.destroy() because Server Components cannot mutate cookies.
    // Returning null is enough to tell the app the session is invalid.
    return null;
  }

  return session;
}