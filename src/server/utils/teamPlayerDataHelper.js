/* Purpose: Reads teams and players from the league database for the main site API. */

const { all, get } = require("../db/leagueDatabase");
const { Team } = require("../models/Team");
const { Player } = require("../models/Player");

const playerSelectSql =
  "SELECT " +
  "players.id, " +
  "players.current_team_id AS team_id, " +
  "players.first_name, " +
  "players.last_name, " +
  "players.date_of_birth AS age_or_dob, " +
  "players.role AS position, " +
  "players.driver_number AS number, " +
  "players.photo, " +
  "teams.slug AS team_slug, " +
  "teams.name AS team_name " +
  "FROM players " +
  "LEFT JOIN teams ON teams.id = players.current_team_id";

function isNumericIdentifier(rawValue) {
  return /^\d+$/.test(String(rawValue).trim());
}

function mapTeams(teamRows) {
  return teamRows.map(function mapRow(teamRow) {
    return new Team(teamRow);
  });
}

function mapPlayers(playerRows) {
  return playerRows.map(function mapRow(playerRow) {
    return new Player(playerRow);
  });
}

async function getTeams() {
  const teamRows = await all(
    "SELECT id, slug, name, description, logo_image, team_image " +
      "FROM teams " +
      "ORDER BY name",
    [],
  );

  return mapTeams(teamRows);
}

async function getTeamBySlugOrId(teamIdentifier) {
  const value = String(teamIdentifier).trim();
  const whereColumn = isNumericIdentifier(value) ? "id" : "slug";
  const parameter = isNumericIdentifier(value) ? Number(value) : value;
  const teamRow = await get(
    "SELECT id, slug, name, description, logo_image, team_image " +
      "FROM teams " +
      "WHERE " +
      whereColumn +
      " = ?",
    [parameter],
  );

  if (!teamRow) {
    return null;
  }

  return new Team(teamRow);
}

async function getPlayers() {
  const playerRows = await all(
    playerSelectSql +
      " WHERE players.is_active = 1 " +
      " ORDER BY teams.name, players.last_name, players.first_name",
    [],
  );

  return mapPlayers(playerRows);
}

async function getPlayersByTeamSlugOrId(teamIdentifier) {
  const team = await getTeamBySlugOrId(teamIdentifier);

  if (!team) {
    return null;
  }

  const playerRows = await all(
    playerSelectSql +
      " WHERE players.current_team_id = ? AND players.is_active = 1 " +
      "ORDER BY players.last_name, players.first_name",
    [team.id],
  );

  return {
    team: team,
    players: mapPlayers(playerRows),
  };
}

async function getLatestSeason() {
  const seasonRow = await get("SELECT MAX(season) AS season FROM races", []);
  const seasonValue = Number(seasonRow && seasonRow.season);

  return Number.isInteger(seasonValue) && seasonValue > 0 ? seasonValue : null;
}

function buildPlayerName(firstName, lastName) {
  return String((String(firstName || "") + " " + String(lastName || "")).trim());
}

async function getTeamGamesBySlugOrId(teamIdentifier) {
  const team = await getTeamBySlugOrId(teamIdentifier);
  const season = await getLatestSeason();

  if (!team) {
    return null;
  }

  if (!season) {
    return {
      season: null,
      games: [],
    };
  }

  const raceRows = await all(
    "SELECT " +
      "races.id, " +
      "races.season, " +
      "races.round_number, " +
      "races.name, " +
      "races.circuit_name, " +
      "races.scheduled_at, " +
      "races.status " +
      "FROM races " +
      "INNER JOIN race_entries ON race_entries.race_id = races.id " +
      "WHERE race_entries.team_id = ? AND races.season = ? " +
      "ORDER BY races.round_number, races.id",
    [team.id, season],
  );

  if (raceRows.length === 0) {
    return {
      season: season,
      games: [],
    };
  }

  const placeholders = raceRows.map(function mapPlaceholder() {
    return "?";
  }).join(", ");
  const scoreRows = await all(
    "SELECT " +
      "scores.race_id, " +
      "scores.player_id, " +
      "scores.finish_position, " +
      "scores.points, " +
      "COALESCE(scores.bonus_points, 0) AS bonus_points, " +
      "scores.result_time, " +
      "players.first_name, " +
      "players.last_name " +
      "FROM scores " +
      "INNER JOIN players ON players.id = scores.player_id " +
      "WHERE scores.team_id = ? AND scores.race_id IN (" +
      placeholders +
      ") " +
      "ORDER BY scores.race_id, COALESCE(scores.finish_position, 999), players.last_name, players.first_name",
    [team.id].concat(
      raceRows.map(function mapRaceRow(raceRow) {
        return raceRow.id;
      }),
    ),
  );
  const scoreRowsByRaceId = new Map();

  scoreRows.forEach(function indexScoreRow(scoreRow) {
    const raceScores = scoreRowsByRaceId.get(scoreRow.race_id) || [];

    raceScores.push({
      playerId: scoreRow.player_id,
      fullName: buildPlayerName(scoreRow.first_name, scoreRow.last_name),
      finishPosition:
        scoreRow.finish_position === null || scoreRow.finish_position === undefined
          ? null
          : Number(scoreRow.finish_position),
      points: (Number(scoreRow.points) || 0) + (Number(scoreRow.bonus_points) || 0),
      resultTime: scoreRow.result_time || "",
    });
    scoreRowsByRaceId.set(scoreRow.race_id, raceScores);
  });

  return {
    season: season,
    games: raceRows.map(function mapRaceRow(raceRow) {
      const results = scoreRowsByRaceId.get(raceRow.id) || [];
      const completedResults = results.filter(function filterCompletedResult(resultRow) {
        return Number.isInteger(resultRow.finishPosition) && resultRow.finishPosition > 0;
      });

      return {
        id: raceRow.id,
        season: raceRow.season,
        roundNumber: raceRow.round_number,
        name: raceRow.name,
        circuitName: raceRow.circuit_name,
        scheduledAt: raceRow.scheduled_at,
        status: raceRow.status,
        teamPoints: completedResults.reduce(function addPoints(totalPoints, resultRow) {
          return totalPoints + (Number(resultRow.points) || 0);
        }, 0),
        bestFinish: completedResults.reduce(function findBestFinish(bestFinish, resultRow) {
          if (bestFinish === null || resultRow.finishPosition < bestFinish) {
            return resultRow.finishPosition;
          }

          return bestFinish;
        }, null),
        results: results,
      };
    }),
  };
}

async function getPlayerById(playerIdentifier) {
  const numericIdentifier = Number(playerIdentifier);

  if (!Number.isInteger(numericIdentifier) || numericIdentifier <= 0) {
    return null;
  }

  const playerRow = await get(
    playerSelectSql + " WHERE players.id = ?",
    [numericIdentifier],
  );

  if (!playerRow) {
    return null;
  }

  return new Player(playerRow);
}

module.exports = {
  getPlayerById,
  getPlayers,
  getPlayersByTeamSlugOrId,
  getTeamGamesBySlugOrId,
  getTeamBySlugOrId,
  getTeams,
  isNumericIdentifier,
};
