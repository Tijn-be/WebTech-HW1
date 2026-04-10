/* Purpose: Provides admin dashboard reads and protected write operations for race score management and player-team assignments. */

const { all, database, get, run } = require("../db/leagueDatabase");

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

function getLatestSeason() {
  const row = get("SELECT MAX(season) AS season FROM races", []);
  const seasonValue = Number(row && row.season);

  return Number.isInteger(seasonValue) && seasonValue > 0 ? seasonValue : null;
}

function calculatePoints(finishPosition) {
  return pointsByFinishPosition[finishPosition] || 0;
}

function buildPlayerDisplayName(playerRow) {
  return String((stringValue(playerRow.first_name) + " " + stringValue(playerRow.last_name)).trim());
}

function ensureTeamExists(teamId) {
  if (teamId === null) {
    return null;
  }

  const teamRow = get("SELECT id, slug, name FROM teams WHERE id = ?", [teamId]);

  if (!teamRow) {
    throw new Error("Selected team does not exist.");
  }

  return teamRow;
}

function getAdminPlayers() {
  return all(
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
  ).map(function mapPlayerRow(playerRow) {
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

function getAdminTeams() {
  return all(
    "SELECT id, slug, name FROM teams ORDER BY name",
    [],
  );
}

function getAdminRaces(season) {
  const raceRows = all(
    "SELECT id, season, round_number, name, circuit_name, scheduled_at, status " +
      "FROM races WHERE season = ? ORDER BY round_number, id",
    [season],
  );
  const scoreRows = all(
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

function getAdminDashboardData() {
  const season = getLatestSeason();

  return {
    season: season,
    teams: getAdminTeams(),
    players: getAdminPlayers(),
    races: season ? getAdminRaces(season) : [],
  };
}

function syncPlayerMembership(playerId, teamId, season) {
  if (teamId === null) {
    run(
      "UPDATE team_memberships " +
        "SET is_current = 0, end_season = CASE WHEN end_season = 0 THEN ? ELSE end_season END " +
        "WHERE player_id = ? AND is_current = 1",
      [season, playerId],
    );
    return;
  }

  run(
    "UPDATE team_memberships " +
      "SET is_current = 0, end_season = CASE WHEN end_season = 0 THEN ? ELSE end_season END " +
      "WHERE player_id = ? AND is_current = 1 AND team_id <> ?",
    [season, playerId, teamId],
  );
  run(
    "INSERT OR IGNORE INTO team_memberships (player_id, team_id, start_season, end_season, is_current) " +
      "VALUES (?, ?, ?, 0, 1)",
    [playerId, teamId, season],
  );
  run(
    "UPDATE team_memberships SET is_current = 1, end_season = 0 WHERE player_id = ? AND team_id = ?",
    [playerId, teamId],
  );
}

function syncScheduledScoresForPlayer(playerId, teamId, season) {
  if (teamId === null) {
    run("DELETE FROM scores WHERE player_id = ? AND status = 'scheduled'", [playerId]);
    return;
  }

  run(
    "UPDATE scores SET team_id = ? WHERE player_id = ? AND status = 'scheduled'",
    [teamId, playerId],
  );

  const upcomingRaceRows = all(
    "SELECT id FROM races WHERE season = ? AND status = 'upcoming' ORDER BY round_number",
    [season],
  );
  const scheduledRaceIds = new Set(
    all(
      "SELECT race_id FROM scores WHERE player_id = ? AND status = 'scheduled'",
      [playerId],
    ).map(function mapRaceId(row) {
      return Number(row.race_id);
    }),
  );

  upcomingRaceRows.forEach(function ensureScheduledRow(raceRow) {
    if (!scheduledRaceIds.has(Number(raceRow.id))) {
      run(
        "INSERT OR IGNORE INTO scores (race_id, team_id, player_id, finish_position, points, result_time, status) " +
          "VALUES (?, ?, ?, NULL, 0, NULL, 'scheduled')",
        [raceRow.id, teamId, playerId],
      );
    }
  });
}

function getAdminPlayerById(playerId) {
  return getAdminPlayers().find(function findPlayer(playerRow) {
    return Number(playerRow.id) === Number(playerId);
  }) || null;
}

function createAdminPlayer(playerInput) {
  const firstName = stringValue(playerInput.firstName);
  const lastName = stringValue(playerInput.lastName);
  const dateOfBirth = stringValue(playerInput.dateOfBirth);
  const role = stringValue(playerInput.role) || "Driver";
  const photo = stringValue(playerInput.photo) || "/assets/images/F1Logo.png";
  const number = parseOptionalPositiveInteger(playerInput.number);
  const teamId = parseOptionalPositiveInteger(playerInput.teamId);
  const season = getLatestSeason() || new Date().getUTCFullYear();

  if (!firstName || !lastName || !dateOfBirth) {
    throw new Error("First name, last name, and date of birth are required.");
  }

  ensureTeamExists(teamId);

  database.exec("BEGIN");

  try {
    const result = run(
      "INSERT INTO players (current_team_id, first_name, last_name, date_of_birth, role, driver_number, photo, is_active) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [teamId, firstName, lastName, dateOfBirth, role, number, photo, teamId === null ? 0 : 1],
    );
    const playerId = Number(result.lastInsertRowid);

    syncPlayerMembership(playerId, teamId, season);
    syncScheduledScoresForPlayer(playerId, teamId, season);
    database.exec("COMMIT");

    return getAdminPlayerById(playerId);
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function updateAdminPlayerTeam(playerId, teamIdValue) {
  const player = get(
    "SELECT id FROM players WHERE id = ?",
    [playerId],
  );
  const teamId = parseOptionalPositiveInteger(teamIdValue);
  const season = getLatestSeason() || new Date().getUTCFullYear();

  if (!player) {
    throw new Error("Player not found.");
  }

  ensureTeamExists(teamId);

  database.exec("BEGIN");

  try {
    run(
      "UPDATE players SET current_team_id = ?, is_active = ? WHERE id = ?",
      [teamId, teamId === null ? 0 : 1, playerId],
    );
    syncPlayerMembership(playerId, teamId, season);
    syncScheduledScoresForPlayer(playerId, teamId, season);
    database.exec("COMMIT");

    return getAdminPlayerById(playerId);
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function recalculateRaceEntries(raceId, raceStatus) {
  const teamRows = all(
    "SELECT team_id FROM race_entries WHERE race_id = ? ORDER BY team_id",
    [raceId],
  );

  teamRows.forEach(function updateTeamEntry(teamRow) {
    const pointsRow = get(
      "SELECT COALESCE(SUM(points + COALESCE(bonus_points, 0)), 0) AS total_points " +
        "FROM scores WHERE race_id = ? AND team_id = ? AND status = 'completed'",
      [raceId, teamRow.team_id],
    );

    run(
      "UPDATE race_entries SET team_points = ?, entry_status = ? WHERE race_id = ? AND team_id = ?",
      [
        Number(pointsRow && pointsRow.total_points) || 0,
        raceStatus === "completed" ? "completed" : "scheduled",
        raceId,
        teamRow.team_id,
      ],
    );
  });
}

function updateAdminRaceScores(raceIdValue, scoreInput) {
  const raceId = parseOptionalPositiveInteger(raceIdValue);
  const race = get(
    "SELECT id FROM races WHERE id = ?",
    [raceId],
  );
  const existingScoreRows = all(
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

  database.exec("BEGIN");

  try {
    normalizedUpdates.forEach(function updateScoreRow(updateRow) {
      run(
        "UPDATE scores SET finish_position = ?, points = ?, result_time = ?, status = ? WHERE id = ?",
        [
          updateRow.finishPosition,
          updateRow.finishPosition === null ? 0 : calculatePoints(updateRow.finishPosition),
          updateRow.resultTime,
          scoreStatus,
          updateRow.scoreId,
        ],
      );
    });
    run(
      "UPDATE races SET status = ? WHERE id = ?",
      [raceStatus, raceId],
    );
    recalculateRaceEntries(raceId, raceStatus);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
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
