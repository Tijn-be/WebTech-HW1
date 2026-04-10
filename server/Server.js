/* Purpose: Serves the site, the main teams and players API, and the SQLite-backed team mini-site data. */

const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  authenticateUser,
  databasePath,
  get,
  registerUser,
  updateUserProfile,
} = require("../src/server/db/leagueDatabase");
const {
  getPlayerById,
  getPlayers,
  getPlayersByTeamSlugOrId,
  getTeamGamesBySlugOrId,
  getTeamBySlugOrId,
  getTeams,
  isNumericIdentifier,
} = require("../src/server/utils/teamPlayerDataHelper");
const {
  createAdminPlayer,
  getAdminDashboardData,
  updateAdminPlayerTeam,
  updateAdminRaceScores,
} = require("../src/server/utils/adminDataHelper");
const {
  getDriverImage,
  getLeagueInfo,
  getRootGroupMembers,
  getRootLeaderboard,
  getLatestScores,
  getTeamSiteCars,
  getTeamSiteContent,
  getTeamSiteDrivers,
  getTeamSiteRaceData,
  getRootSiteData,
  getTeamSiteData,
  getUpcomingRaces,
} = require("../src/server/utils/teamSiteDataHelper");
const {
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSession,
  deleteSession,
  getSession,
  sessionCookieName,
} = require("../src/server/services/sessionStore");

const port = 8004;
const rootDirectory = path.join(__dirname, "..");
const siteDirectory = path.join(rootDirectory, "F1");
const requestLogPath = path.join(rootDirectory, "storage", "http-requests.log");

const contentTypeByExtension = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
};

function readRequestBody(request) {
  return new Promise(function readBody(resolve) {
    let body = "";

    request.on("data", function collectChunk(chunk) {
      body += chunk.toString();
    });

    request.on("end", function endBody() {
      resolve(body);
    });
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function sendFile(response, statusCode, contentType, buffer) {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(buffer);
}

function sendRedirect(response, locationPath) {
  response.writeHead(302, { Location: locationPath });
  response.end();
}

function logHttpRequest(request, requestPath) {
  const logLine =
    new Date().toISOString() +
    " " +
    String(request.method || "GET") +
    " " +
    String(requestPath || "/") +
    " " +
    String(request.socket && request.socket.remoteAddress ? request.socket.remoteAddress : "-") +
    "\n";

  fs.appendFile(requestLogPath, logLine, function ignoreLogError() {});
}

function getContentType(filePath) {
  return contentTypeByExtension[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function parseCookies(request) {
  const cookieHeader = String(request.headers.cookie || "");

  return cookieHeader.split(";").reduce(function collectCookies(cookieMap, cookiePart) {
    const separatorIndex = cookiePart.indexOf("=");

    if (separatorIndex <= 0) {
      return cookieMap;
    }

    const cookieName = cookiePart.slice(0, separatorIndex).trim();
    const cookieValue = cookiePart.slice(separatorIndex + 1).trim();

    if (cookieName) {
      cookieMap[cookieName] = decodeURIComponent(cookieValue);
    }

    return cookieMap;
  }, {});
}

function getRequestSession(request) {
  const cookies = parseCookies(request);
  return getSession(cookies[sessionCookieName] || "");
}

function buildSessionPayload(session) {
  if (!session) {
    return {
      authenticated: false,
    };
  }

  return {
    authenticated: true,
    user: session.displayName,
    firstName: session.firstName,
    lastName: session.lastName,
    email: session.email,
    role: session.role,
    isAdmin: session.isAdmin,
    favoriteTeamId: session.favoriteTeamId,
    favoriteTeamSlug: session.favoriteTeamSlug,
  };
}

function requireAdminSession(request, response) {
  const session = getRequestSession(request);

  if (!session) {
    sendJson(response, 401, {
      message: "Log in as an admin to continue.",
    });
    return null;
  }

  if (!session.isAdmin) {
    sendJson(response, 403, {
      message: "Admin access required.",
    });
    return null;
  }

  return session;
}

function resolveStaticFilePath(requestPath) {
  const requestedPath = requestPath === "/" ? "/index.html" : requestPath;
  const normalizedPath = path
    .normalize(requestedPath)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\]+/, "");
  const fullPath = path.join(siteDirectory, normalizedPath);

  if (fullPath.indexOf(siteDirectory) !== 0) {
    return null;
  }

  return fullPath;
}

async function ensureLeagueData() {
  const teamsTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'teams'",
    [],
  );
  const playersTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'players'",
    [],
  );
  const teamSiteTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'team_site_data'",
    [],
  );
  const rootSiteTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'root_site_data'",
    [],
  );
  const driverImagesTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'driver_images'",
    [],
  );
  const usersTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'",
    [],
  );
  const racesTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'races'",
    [],
  );
  const raceEntriesTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'race_entries'",
    [],
  );
  const scoresTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'scores'",
    [],
  );
  const teamMembershipsTable = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'team_memberships'",
    [],
  );
  const teamCountRow = teamsTable ? await get("SELECT COUNT(*) AS count FROM teams", []) : { count: 0 };
  const userCountRow = usersTable ? await get("SELECT COUNT(*) AS count FROM users", []) : { count: 0 };

  if (
    !teamsTable ||
    !playersTable ||
    !teamSiteTable ||
    !rootSiteTable ||
    !driverImagesTable ||
    !usersTable ||
    !racesTable ||
    !raceEntriesTable ||
    !scoresTable ||
    !teamMembershipsTable ||
    !teamCountRow ||
    !userCountRow ||
    Number(teamCountRow.count) === 0
  ) {
    throw new Error(
      "League database is not initialized. Expected prebuilt SQLite data at " + databasePath,
    );
  }
}

function requireAuthenticatedSession(request, response) {
  const session = getRequestSession(request);

  if (!session) {
    sendJson(response, 401, {
      message: "Log in to continue.",
    });
    return null;
  }

  return session;
}

async function handleLogin(request, response) {
  try {
    const requestBody = await readRequestBody(request);
    const parsedBody = JSON.parse(requestBody || "{}");
    const user = await authenticateUser(parsedBody.email, parsedBody.password);

    if (!user) {
      sendJson(response, 200, {
        success: false,
        message: "Wrong email or password",
      });
      return;
    }

    {
      const session = createSession(user);
      response.setHeader("Set-Cookie", buildSessionCookie(session.id));
    }

    sendJson(response, 200, {
      success: true,
      user: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      favoriteTeamId: user.favoriteTeamId,
      favoriteTeamSlug: user.favoriteTeamSlug,
    });
  } catch (error) {
    sendJson(response, 400, {
      success: false,
      message: "Invalid login request",
    });
  }
}

async function handleRegister(request, response) {
  try {
    const requestBody = await readRequestBody(request);
    const parsedBody = JSON.parse(requestBody || "{}");
    const user = await registerUser(parsedBody);

    if (!user) {
      sendJson(response, 200, {
        success: false,
        message: "Registration failed.",
      });
      return;
    }

    {
      const session = createSession(user);
      response.setHeader("Set-Cookie", buildSessionCookie(session.id));
    }

    sendJson(response, 200, {
      success: true,
      user: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      favoriteTeamId: user.favoriteTeamId,
      favoriteTeamSlug: user.favoriteTeamSlug,
    });
  } catch (error) {
    sendJson(response, 200, {
      success: false,
      message: error.message || "Invalid registration request",
    });
  }
}

async function handleProfileUpdate(request, response) {
  const session = requireAuthenticatedSession(request, response);

  if (!session) {
    return;
  }

  try {
    const requestBody = await readRequestBody(request);
    const parsedBody = JSON.parse(requestBody || "{}");
    const updatedUser = await updateUserProfile(session.userId, parsedBody);

    deleteSession(session.id);

    {
      const nextSession = createSession(updatedUser);
      response.setHeader("Set-Cookie", buildSessionCookie(nextSession.id));
    }

    sendJson(response, 200, {
      success: true,
      user: updatedUser.displayName,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin,
      favoriteTeamId: updatedUser.favoriteTeamId,
      favoriteTeamSlug: updatedUser.favoriteTeamSlug,
    });
  } catch (error) {
    sendJson(response, 200, {
      success: false,
      message: error.message || "Invalid profile update request",
    });
  }
}

async function handleApiRequest(requestPath, response) {
  const driverImageMatch = requestPath.match(/^\/api\/driver-images\/([^/]+)\.jpg$/);
  const rootMatch = requestPath.match(/^\/api\/root\/([^/]+)$/);
  const teamSiteContentMatch = requestPath.match(/^\/api\/team-sites\/([^/]+)\/content$/);
  const teamSiteDriversMatch = requestPath.match(/^\/api\/team-sites\/([^/]+)\/drivers$/);
  const teamSiteCarsMatch = requestPath.match(/^\/api\/team-sites\/([^/]+)\/cars$/);
  const teamSiteRaceMatch = requestPath.match(/^\/api\/team-sites\/([^/]+)\/race-data$/);
  const teamGamesMatch = requestPath.match(/^\/api\/teams\/([^/]+)\/games$/);
  const teamPlayersMatch = requestPath.match(/^\/api\/teams\/([^/]+)\/players$/);
  const teamMatch = requestPath.match(/^\/api\/teams\/([^/]+)$/);
  const playerMatch = requestPath.match(/^\/api\/players\/([^/]+)$/);

  if (driverImageMatch) {
    const imageRecord = await getDriverImage(driverImageMatch[1]);

    if (!imageRecord) {
      response.writeHead(404);
      response.end("Not found");
      return true;
    }

    sendFile(response, 200, imageRecord.contentType, imageRecord.imageBuffer);
    return true;
  }

  if (rootMatch) {
    if (rootMatch[1] === "leaderboard") {
      sendJson(response, 200, await getRootLeaderboard());
      return true;
    }

    if (rootMatch[1] === "league-info") {
      sendJson(response, 200, await getLeagueInfo());
      return true;
    }

    if (rootMatch[1] === "latest-scores") {
      sendJson(response, 200, await getLatestScores());
      return true;
    }

    if (rootMatch[1] === "upcoming-races") {
      sendJson(response, 200, await getUpcomingRaces());
      return true;
    }

    if (rootMatch[1] === "group-members") {
      sendJson(response, 200, await getRootGroupMembers());
      return true;
    }
  }

  if (teamSiteDriversMatch) {
    sendJson(response, 200, await getTeamSiteDrivers(teamSiteDriversMatch[1]));
    return true;
  }

  if (teamSiteContentMatch) {
    sendJson(response, 200, await getTeamSiteContent(teamSiteContentMatch[1]));
    return true;
  }

  if (teamSiteCarsMatch) {
    sendJson(response, 200, await getTeamSiteCars(teamSiteCarsMatch[1]));
    return true;
  }

  if (teamSiteRaceMatch) {
    sendJson(response, 200, await getTeamSiteRaceData(teamSiteRaceMatch[1]));
    return true;
  }

  if (requestPath === "/api/teams") {
    sendJson(response, 200, await getTeams());
    return true;
  }

  if (teamGamesMatch) {
    const result = await getTeamGamesBySlugOrId(teamGamesMatch[1]);

    if (!result) {
      sendJson(response, 404, { message: "Team not found" });
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  if (teamPlayersMatch) {
    const result = await getPlayersByTeamSlugOrId(teamPlayersMatch[1]);

    if (!result) {
      sendJson(response, 404, { message: "Team not found" });
      return true;
    }

    sendJson(response, 200, result.players);
    return true;
  }

  if (teamMatch) {
    const team = await getTeamBySlugOrId(teamMatch[1]);

    if (!team) {
      sendJson(response, 404, { message: "Team not found" });
      return true;
    }

    sendJson(response, 200, team);
    return true;
  }

  if (requestPath === "/api/players") {
    sendJson(response, 200, await getPlayers());
    return true;
  }

  if (playerMatch) {
    if (!isNumericIdentifier(playerMatch[1])) {
      sendJson(response, 400, { message: "Player id must be a positive integer" });
      return true;
    }

    {
      const player = await getPlayerById(playerMatch[1]);

      if (!player) {
        sendJson(response, 404, { message: "Player not found" });
        return true;
      }

      sendJson(response, 200, player);
      return true;
    }
  }

  return false;
}

async function handleAdminApiRequest(request, requestPath, response) {
  const adminDashboardMatch = requestPath === "/api/admin/dashboard";
  const adminPlayerCreateMatch = requestPath === "/api/admin/players";
  const adminPlayerTeamMatch = requestPath.match(/^\/api\/admin\/players\/(\d+)\/team$/);
  const adminRaceScoresMatch = requestPath.match(/^\/api\/admin\/races\/(\d+)\/scores$/);

  if (!adminDashboardMatch && !adminPlayerCreateMatch && !adminPlayerTeamMatch && !adminRaceScoresMatch) {
    return false;
  }

  if (!requireAdminSession(request, response)) {
    return true;
  }

  try {
    if (request.method === "GET" && adminDashboardMatch) {
      sendJson(response, 200, await getAdminDashboardData());
      return true;
    }

    if (request.method === "POST" && adminPlayerCreateMatch) {
      const requestBody = await readRequestBody(request);
      const parsedBody = JSON.parse(requestBody || "{}");
      const player = await createAdminPlayer(parsedBody);

      sendJson(response, 200, {
        success: true,
        player: player,
      });
      return true;
    }

    if (request.method === "PATCH" && adminPlayerTeamMatch) {
      const requestBody = await readRequestBody(request);
      const parsedBody = JSON.parse(requestBody || "{}");
      const player = await updateAdminPlayerTeam(adminPlayerTeamMatch[1], parsedBody.teamId);

      sendJson(response, 200, {
        success: true,
        player: player,
      });
      return true;
    }

    if ((request.method === "PUT" || request.method === "PATCH") && adminRaceScoresMatch) {
      const requestBody = await readRequestBody(request);
      const parsedBody = JSON.parse(requestBody || "{}");

      await updateAdminRaceScores(adminRaceScoresMatch[1], parsedBody.results);
      sendJson(response, 200, {
        success: true,
      });
      return true;
    }
  } catch (error) {
    sendJson(response, 400, {
      message: error.message || "Admin request failed.",
    });
    return true;
  }

  sendJson(response, 405, { message: "Method not allowed" });
  return true;
}

async function handleStoredRootData(requestPath, response) {
  const rootDataMatch = requestPath.match(/^\/data\/([^/]+\.json)$/);

  if (!rootDataMatch) {
    return false;
  }

  if (rootDataMatch[1] === "leaderData.json") {
    sendJson(response, 200, await getRootLeaderboard());
    return true;
  }

  {
    const payload = await getRootSiteData(rootDataMatch[1]);

    if (!payload) {
      return false;
    }

    sendJson(response, 200, payload);
    return true;
  }
}

async function handleStoredTeamData(requestPath, response) {
  const teamDataMatch = requestPath.match(/^\/Team_Sites\/([^/]+)\/data\/([^/]+\.json)$/);

  if (!teamDataMatch) {
    return false;
  }

  if (teamDataMatch[2] === "raceData.json") {
    sendJson(response, 200, await getTeamSiteRaceData(teamDataMatch[1]));
    return true;
  }

  if (teamDataMatch[2] === "driversData.json") {
    sendJson(response, 200, await getTeamSiteDrivers(teamDataMatch[1]));
    return true;
  }

  {
    const payload = await getTeamSiteData(teamDataMatch[1], teamDataMatch[2]);

    if (!payload) {
      sendJson(response, 404, { message: "Data file not found" });
      return true;
    }

    sendJson(response, 200, payload);
    return true;
  }
}

function serveStaticFile(requestPath, response) {
  const filePath = resolveStaticFilePath(requestPath);

  if (!filePath) {
    response.writeHead(403);
    response.end("Access denied");
    return;
  }

  fs.readFile(filePath, function handleReadFile(error, data) {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    sendFile(response, 200, getContentType(filePath), data);
  });
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const requestPath = decodeURIComponent(requestUrl.pathname);

  logHttpRequest(request, requestPath);

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "POST" && requestPath === "/login") {
    await handleLogin(request, response);
    return;
  }

  if (request.method === "POST" && requestPath === "/register") {
    await handleRegister(request, response);
    return;
  }

  if ((request.method === "PATCH" || request.method === "POST") && requestPath === "/api/profile") {
    await handleProfileUpdate(request, response);
    return;
  }

  if (request.method === "POST" && requestPath === "/logout") {
    const session = getRequestSession(request);

    if (session) {
      deleteSession(session.id);
    }

    response.setHeader("Set-Cookie", buildExpiredSessionCookie());
    sendJson(response, 200, { success: true });
    return;
  }

  if (request.method === "GET" && requestPath === "/api/session") {
    sendJson(response, 200, buildSessionPayload(getRequestSession(request)));
    return;
  }

  if (requestPath.startsWith("/api/admin/")) {
    if (await handleAdminApiRequest(request, requestPath, response)) {
      return;
    }
  }

  if (request.method === "GET" && requestPath === "/admin.html") {
    const session = getRequestSession(request);

    if (!session || !session.isAdmin) {
      sendRedirect(response, "/index.html");
      return;
    }
  }

  if (request.method === "GET" && (await handleApiRequest(requestPath, response))) {
    return;
  }

  if (request.method === "GET" && (await handleStoredRootData(requestPath, response))) {
    return;
  }

  if (request.method === "GET" && (await handleStoredTeamData(requestPath, response))) {
    return;
  }

  serveStaticFile(requestPath, response);
}

ensureLeagueData()
  .then(function startServer() {
    http
      .createServer(function createServer(request, response) {
        handleRequest(request, response).catch(function handleError(error) {
          console.error("Request handling failed.", error);
          sendJson(response, 500, { message: "Internal server error" });
        });
      })
      .listen(port, "0.0.0.0", function handleListen() {
        console.log("Server running on http://127.0.0.1:" + String(port) + "/");
      });
  })
  .catch(function handleStartupError(error) {
    console.error("Server startup failed.", error);
    process.exit(1);
  });
