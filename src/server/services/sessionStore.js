/* Purpose: Maintains short-lived in-memory login sessions for the site and formats the session cookie used by the raw Node server. */

const crypto = require("crypto");

const sessionCookieName = "f1_session";
const sessionLifetimeMs = 1000 * 60 * 60 * 8;
const sessionsById = new Map();

function cleanupExpiredSessions() {
  const now = Date.now();

  sessionsById.forEach(function deleteExpiredSession(sessionValue, sessionId) {
    if (!sessionValue || Number(sessionValue.expiresAt) <= now) {
      sessionsById.delete(sessionId);
    }
  });
}

function createSession(user) {
  cleanupExpiredSessions();

  const sessionId = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  const session = {
    id: sessionId,
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    isAdmin: Boolean(user.isAdmin),
    favoriteTeamId: user.favoriteTeamId || null,
    favoriteTeamSlug: user.favoriteTeamSlug || null,
    createdAt: now,
    expiresAt: now + sessionLifetimeMs,
  };

  sessionsById.set(sessionId, session);
  return session;
}

function getSession(sessionId) {
  cleanupExpiredSessions();

  if (!sessionId || !sessionsById.has(sessionId)) {
    return null;
  }

  const session = sessionsById.get(sessionId);

  if (!session || Number(session.expiresAt) <= Date.now()) {
    sessionsById.delete(sessionId);
    return null;
  }

  session.expiresAt = Date.now() + sessionLifetimeMs;
  sessionsById.set(sessionId, session);
  return session;
}

function deleteSession(sessionId) {
  if (sessionId) {
    sessionsById.delete(sessionId);
  }
}

function buildSessionCookie(sessionId) {
  return (
    sessionCookieName +
    "=" +
    String(sessionId) +
    "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" +
    String(Math.floor(sessionLifetimeMs / 1000))
  );
}

function buildExpiredSessionCookie() {
  return sessionCookieName + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

module.exports = {
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSession,
  deleteSession,
  getSession,
  sessionCookieName,
};
