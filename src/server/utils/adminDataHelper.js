/* Purpose: Provides admin dashboard reads and protected write operations for race score management and player-team assignments. */

const { all, exec, get, run } = require("../db/leagueDatabase");

const pointsByFinishPosition = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

function stringValue(rawValue) {
  return String(rawValue || "").trim();
}

function parseOptionalPositiveInteger(rawValue) {
  if (rawValue === null || rawValue === undefined || stringValue(rawValue) === "") {
    return null;
  }

  const parsedValue = Number.parseInt(String(rawValue), 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

async function getLatestSeason() {
  const row = await get("SELECT MAX(season) AS season FROM races", []);
  const seasonValue = Number(row && row.season);

  return Number.isInteger(seasonValue) && seasonValue > 0 ? seasonValue : null;
}

function calculatePoints(finishPosition) {
  return pointsByFinishPosition[finishPosition] || 0;
}

function buildPlayerDisplayName(playerRow) {
  return String((stringValue(playerRow.first_name) + " " + stringValue(playerRow.last_name)).trim());
}

async function ensureTeamExists(teamId) {
  if (teamId === null) {
    return null;
  }

  const teamRow = await get("SELECT id, slug, name FROM teams WHERE id = ?", [teamId]);

  if (!teamRow) {
    throw new Error("Selected team does not exist.");
  }

  return teamRow;
}

async function getAdminPlayers() {
  return (await all(
    "SELECT " +
      "players.id, " +
      "players.first_name, " +
      "players.last_name, " +
      "players.date_of_birth, " +
      "players.role, " +
      "players.driver_number, " +
      "players.photo, " +
      "players.is_active, " +
      "players.current_team_id, " +
      "teams.slug AS team_slug, " +
      "teams.name AS team_name " +
      "FROM players " +
      "LEFT JOIN teams ON teams.id = players.current_team_id " +
      "ORDER BY players.is_active DESC, COALESCE(teams.name, 'ZZZ'), players.last_name, players.first_name",
    [],
  )).map(function mapPlayerRow(playerRow) {
    return {
      id: playerRow.id,
      firstName: playerRow.first_name,
      lastName: playerRow.last_name,
      fullName: buildPlayerDisplayName(playerRow),
      dateOfBirth: playerRow.date_of_birth,
      role: playerRow.role,
      number: playerRow.driver_number,
      photo: playerRow.photo,
      isActive: Number(playerRow.is_active) === 1,
      teamId: playerRow.current_team_id,
      teamSlug: playerRow.team_slug || null,
      teamName: playerRow.team_name || null,
    };
  });
}

async function getAdminTeams() {
  return all(
    "SELECT id, slug, name FROM teams ORDER BY name",
    [],
  );
}

async function getAdminRaces(season) {
  const raceRows = await all(
    "SELECT id, season, round_number, name, circuit_name, scheduled_at, status " +
      "FROM races WHERE season = ? ORDER BY round_number, id",
    [season],
  );
  const scoreRows = await all(
    "SELECT " +
      "scores.id, " +
      "scores.race_id, " +
      "scores.player_id, " +
      "scores.team_id, " +
      "scores.finish_position, " +
      "scores.points, " +
      "scores.result_time, " +
      "scores.status, " +
      "players.first_name, " +
      "players.last_name, " +
      "players.driver_number, " +
      "teams.name AS team_name, " +
      "teams.slug AS team_slug " +
      "FROM scores " +
      "INNER JOIN races ON races.id = scores.race_id " +
      "INNER JOIN players ON players.id = scores.player_id " +
      "LEFT JOIN teams ON teams.id = scores.team_id " +
      "WHERE races.season = ? " +
      "ORDER BY races.round_number, COALESCE(scores.finish_position, 999), teams.name, COALESCE(players.driver_number, 999), players.last_name, players.first_name",
    [season],
  );
  const scoreRowsByRaceId = new Map();

  scoreRows.forEach(function indexScoreRow(scoreRow) {
    const rowsForRace = scoreRowsByRaceId.get(scoreRow.race_id) || [];

    rowsForRace.push({
      scoreId: scoreRow.id,
      playerId: scoreRow.player_id,
      teamId: scoreRow.team_id,
      teamName: scoreRow.team_name || "Unknown",
      teamSlug: scoreRow.team_slug || null,
      fullName: buildPlayerDisplayName(scoreRow),
      number: scoreRow.driver_number,
      finishPosition: scoreRow.finish_position,
      points: Number(scoreRow.points) || 0,
      resultTime: scoreRow.result_time || "",
      status: scoreRow.status,
    });
    scoreRowsByRaceId.set(scoreRow.race_id, rowsForRace);
  });

  return raceRows.map(function mapRaceRow(raceRow) {
    return {
      id: raceRow.id,
      season: raceRow.season,
      roundNumber: raceRow.round_number,
      name: raceRow.name,
      circuitName: raceRow.circuit_name,
      scheduledAt: raceRow.scheduled_at,
      status: raceRow.status,
      results: scoreRowsByRaceId.get(raceRow.id) || [],
    };
  });
}

async function getAdminDashboardData() {
  const season = await getLatestSeason();

  return {
    season: season,
    teams: await getAdminTeams(),
    players: await getAdminPlayers(),
    races: season ? await getAdminRaces(season) : [],
  };
}

async function syncPlayerMembership(playerId, teamId, season) {
  if (teamId === null) {
    await run(
      "UPDATE team_memberships " +
        "SET is_current = 0, end_season = CASE WHEN end_season = 0 THEN ? ELSE end_season END " +
        "WHERE player_id = ? AND is_current = 1",
      [season, playerId],
    );
    return;
  }

  await run(
    "UPDATE team_memberships " +
      "SET is_current = 0, end_season = CASE WHEN end_season = 0 THEN ? ELSE end_season END " +
      "WHERE player_id = ? AND is_current = 1 AND team_id <> ?",
    [season, playerId, teamId],
  );
  await run(
    "INSERT OR IGNORE INTO team_memberships (player_id, team_id, start_season, end_season, is_current) " +
      "VALUES (?, ?, ?, 0, 1)",
    [playerId, teamId, season],
  );
  await run(
    "UPDATE team_memberships SET is_current = 1, end_season = 0 WHERE player_id = ? AND team_id = ?",
    [playerId, teamId],
  );
}

async function syncScheduledScoresForPlayer(playerId, teamId, season) {
  if (teamId === null) {
    await run("DELETE FROM scores WHERE player_id = ? AND status = 'scheduled'", [playerId]);
    return;
  }

  await run(
    "UPDATE scores SET team_id = ? WHERE player_id = ? AND status = 'scheduled'",
    [teamId, playerId],
  );

  const upcomingRaceRows = await all(
    "SELECT id FROM races WHERE season = ? AND status = 'upcoming' ORDER BY round_number",
    [season],
  );
  const scheduledRaceIds = new Set(
    (await all(
      "SELECT race_id FROM scores WHERE player_id = ? AND status = 'scheduled'",
      [playerId],
    )).map(function mapRaceId(row) {
      return Number(row.race_id);
    }),
  );

  for (const raceRow of upcomingRaceRows) {
    if (!scheduledRaceIds.has(Number(raceRow.id))) {
      await run(
        "INSERT OR IGNORE INTO scores (race_id, team_id, player_id, finish_position, points, result_time, status) " +
          "VALUES (?, ?, ?, NULL, 0, NULL, 'scheduled')",
        [raceRow.id, teamId, playerId],
      );
    }
  }
}

async function getAdminPlayerById(playerId) {
  return (await getAdminPlayers()).find(function findPlayer(playerRow) {
    return Number(playerRow.id) === Number(playerId);
  }) || null;
}

async function createAdminPlayer(playerInput) {
  const firstName = stringValue(playerInput.firstName);
  const lastName = stringValue(playerInput.lastName);
  const dateOfBirth = stringValue(playerInput.dateOfBirth);
  const role = stringValue(playerInput.role) || "Driver";
  const photo = stringValue(playerInput.photo) || "/assets/images/F1Logo.png";
  const number = parseOptionalPositiveInteger(playerInput.number);
  const teamId = parseOptionalPositiveInteger(playerInput.teamId);
  const season = (await getLatestSeason()) || new Date().getUTCFullYear();

  if (!firstName || !lastName || !dateOfBirth) {
    throw new Error("First name, last name, and date of birth are required.");
  }

  await ensureTeamExists(teamId);

  await exec("BEGIN");

  try {
    const result = await run(
      "INSERT INTO players (current_team_id, first_name, last_name, date_of_birth, role, driver_number, photo, is_active) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [teamId, firstName, lastName, dateOfBirth, role, number, photo, teamId === null ? 0 : 1],
    );
    const playerId = Number(result.lastInsertRowid);

    await syncPlayerMembership(playerId, teamId, season);
    await syncScheduledScoresForPlayer(playerId, teamId, season);
    await exec("COMMIT");

    return getAdminPlayerById(playerId);
  } catch (error) {
    await exec("ROLLBACK");
    throw error;
  }
}

async function updateAdminPlayerTeam(playerId, teamIdValue) {
  const player = await get(
    "SELECT id FROM players WHERE id = ?",
    [playerId],
  );
  const teamId = parseOptionalPositiveInteger(teamIdValue);
  const season = (await getLatestSeason()) || new Date().getUTCFullYear();

  if (!player) {
    throw new Error("Player not found.");
  }

  await ensureTeamExists(teamId);

  await exec("BEGIN");

  try {
    await run(
      "UPDATE players SET current_team_id = ?, is_active = ? WHERE id = ?",
      [teamId, teamId === null ? 0 : 1, playerId],
    );
    await syncPlayerMembership(playerId, teamId, season);
    await syncScheduledScoresForPlayer(playerId, teamId, season);
    await exec("COMMIT");

    return getAdminPlayerById(playerId);
  } catch (error) {
    await exec("ROLLBACK");
    throw error;
  }
}

async function recalculateRaceEntries(raceId, raceStatus) {
  const teamRows = await all(
    "SELECT team_id FROM race_entries WHERE race_id = ? ORDER BY team_id",
    [raceId],
  );

  for (const teamRow of teamRows) {
    const pointsRow = await get(
      "SELECT COALESCE(SUM(points + COALESCE(bonus_points, 0)), 0) AS total_points " +
        "FROM scores WHERE race_id = ? AND team_id = ? AND status = 'completed'",
      [raceId, teamRow.team_id],
    );

    await run(
      "UPDATE race_entries SET team_points = ?, entry_status = ? WHERE race_id = ? AND team_id = ?",
      [
        Number(pointsRow && pointsRow.total_points) || 0,
        raceStatus === "completed" ? "completed" : "scheduled",
        raceId,
        teamRow.team_id,
      ],
    );
  }
}

async function updateAdminRaceScores(raceIdValue, scoreInput) {
  const raceId = parseOptionalPositiveInteger(raceIdValue);
  const race = await get(
    "SELECT id FROM races WHERE id = ?",
    [raceId],
  );
  const existingScoreRows = await all(
    "SELECT id, player_id FROM scores WHERE race_id = ? ORDER BY id",
    [raceId],
  );

  if (!race) {
    throw new Error("Race not found.");
  }

  if (!Array.isArray(scoreInput) || scoreInput.length !== existingScoreRows.length) {
    throw new Error("A full score sheet is required for each race update.");
  }

  const updatesByPlayerId = new Map();

  scoreInput.forEach(function normalizeInputRow(inputRow) {
    const playerId = parseOptionalPositiveInteger(inputRow.playerId);
    const finishPosition = parseOptionalPositiveInteger(inputRow.finishPosition);
    const resultTime = stringValue(inputRow.resultTime) || null;

    if (playerId === null) {
      throw new Error("Each submitted race result must include a valid player id.");
    }

    updatesByPlayerId.set(playerId, {
      finishPosition: finishPosition,
      resultTime: resultTime,
    });
  });

  const usedFinishPositions = new Set();
  const normalizedUpdates = existingScoreRows.map(function mapExistingRow(scoreRow) {
    const inputRow = updatesByPlayerId.get(Number(scoreRow.player_id));

    if (!inputRow) {
      throw new Error("Each current race entry must be submitted.");
    }

    if (inputRow.finishPosition !== null) {
      if (usedFinishPositions.has(inputRow.finishPosition)) {
        throw new Error("Finish positions must be unique within a race.");
      }

      usedFinishPositions.add(inputRow.finishPosition);
    }

    return {
      scoreId: scoreRow.id,
      playerId: scoreRow.player_id,
      finishPosition: inputRow.finishPosition,
      resultTime: inputRow.resultTime,
    };
  });
  const hasCompletedResults = normalizedUpdates.some(function hasRaceResult(updateRow) {
    return updateRow.finishPosition !== null;
  });
  const raceStatus = hasCompletedResults ? "completed" : "upcoming";
  const scoreStatus = hasCompletedResults ? "completed" : "scheduled";

  await exec("BEGIN");

  try {
    for (const updateRow of normalizedUpdates) {
      await run(
        "UPDATE scores SET finish_position = ?, points = ?, result_time = ?, status = ? WHERE id = ?",
        [
          updateRow.finishPosition,
          updateRow.finishPosition === null ? 0 : calculatePoints(updateRow.finishPosition),
          updateRow.resultTime,
          scoreStatus,
          updateRow.scoreId,
        ],
      );
    }
    await run(
      "UPDATE races SET status = ? WHERE id = ?",
      [raceStatus, raceId],
    );
    await recalculateRaceEntries(raceId, raceStatus);
    await exec("COMMIT");
  } catch (error) {
    await exec("ROLLBACK");
    throw error;
  }

  return getAdminDashboardData();
}

module.exports = {
  createAdminPlayer,
  getAdminDashboardData,
  updateAdminPlayerTeam,
  updateAdminRaceScores,
};
