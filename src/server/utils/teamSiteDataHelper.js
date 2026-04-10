/* Purpose: Reads stored presentation data, generates current leaderboard and current-season race views from normalized league tables, and serves driver images. */

const fs = require("fs");
const path = require("path");
const { all, get } = require("../db/leagueDatabase");

const rootDirectory = path.join(__dirname, "..", "..", "..");
const teamSitesDirectory = path.join(rootDirectory, "F1", "Team_Sites");
const assetDirectoryCache = new Map();

function stringValue(rawValue) {
  return String(rawValue || "").trim();
}

function normalizeDriverImageKey(rawValue) {
  return String(rawValue || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getAssetDirectoryEntries(teamSlug, assetFolderName) {
  const cacheKey = String(teamSlug || "") + ":" + String(assetFolderName || "");

  if (assetDirectoryCache.has(cacheKey)) {
    return assetDirectoryCache.get(cacheKey);
  }

  try {
    const entries = fs.readdirSync(
      path.join(teamSitesDirectory, String(teamSlug || ""), "assets", "images", String(assetFolderName || "")),
      { withFileTypes: true },
    )
      .filter(function filterFile(entry) {
        return entry.isFile();
      })
      .map(function mapFile(entry) {
        return {
          name: entry.name,
          key: normalizeDriverImageKey(path.parse(entry.name).name),
        };
      });

    assetDirectoryCache.set(cacheKey, entries);
    return entries;
  } catch (error) {
    assetDirectoryCache.set(cacheKey, []);
    return [];
  }
}

function resolveTeamAssetPath(teamSlug, assetFolderName, candidates) {
  const entries = getAssetDirectoryEntries(teamSlug, assetFolderName);
  const candidateKeys = (Array.isArray(candidates) ? candidates : [])
    .map(function mapCandidate(candidateValue) {
      return normalizeDriverImageKey(path.parse(String(candidateValue || "")).name);
    })
    .filter(Boolean);

  for (let index = 0; index < candidateKeys.length; index += 1) {
    const candidateKey = candidateKeys[index];
    const match = entries.find(function findEntry(entry) {
      return entry.key === candidateKey;
    });

    if (match) {
      return "/Team_Sites/" + String(teamSlug || "") + "/assets/images/" + String(assetFolderName || "") + "/" + match.name;
    }
  }

  return "";
}

function resolveTeamDriverImagePath(teamSlug, driverRow, displayName) {
  const localPath = resolveTeamAssetPath(teamSlug, "drivers", [
    driverRow && driverRow.img,
    driverRow && driverRow.image,
    driverRow && driverRow.photo,
    driverRow && driverRow.id,
    displayName,
  ]);

  if (localPath) {
    return localPath;
  }

  return (
    stringValue(driverRow && (driverRow.image || driverRow.photo)) ||
    "/api/driver-images/" + normalizeDriverImageKey(displayName) + ".jpg"
  );
}

function resolveTeamCarImagePath(teamSlug, carRow) {
  const localPath = resolveTeamAssetPath(teamSlug, "cars", [
    carRow && carRow.image,
    String(carRow && carRow.season ? carRow.season : "") + "-" + String(carRow && carRow.id ? carRow.id : ""),
    carRow && carRow.id,
    carRow && carRow.name,
  ]);

  if (localPath) {
    return localPath;
  }

  return stringValue(carRow && carRow.image);
}

function readStoredPayload(tableName, whereColumn, keyValue, fileName) {
  const row = get(
    "SELECT payload FROM " +
      tableName +
      " WHERE " +
      whereColumn +
      " = ? AND file_name = ?",
    [keyValue, fileName],
  );

  if (!row) {
    return null;
  }

  return JSON.parse(row.payload);
}

function getTeamSiteData(teamSlug, fileName) {
  return readStoredPayload("team_site_data", "team_slug", teamSlug, fileName);
}

function getRootSiteData(fileName) {
  return readStoredPayload("root_site_data", "scope_key", "root", fileName);
}

function getLeagueInfo() {
  return getRootSiteData("leagueInfo.json") || {
    title: "League Info",
    intro: "League information is currently unavailable.",
    sections: [],
  };
}

function getLatestSeason() {
  const row = get("SELECT MAX(season) AS season FROM races", []);
  const seasonValue = Number(row && row.season);

  return Number.isInteger(seasonValue) && seasonValue > 0 ? seasonValue : null;
}

function buildDriverName(firstName, lastName) {
  return String((stringValue(firstName) + " " + stringValue(lastName)).trim());
}

function buildDriverId(displayName) {
  return stringValue(displayName)
    .replace(/['’]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(function mapNamePart(namePart) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    })
    .join("-");
}

function formatList(values) {
  const cleanedValues = (Array.isArray(values) ? values : [])
    .map(function mapValue(value) {
      return stringValue(value);
    })
    .filter(Boolean);

  if (cleanedValues.length === 0) {
    return "not recorded";
  }

  if (cleanedValues.length === 1) {
    return cleanedValues[0];
  }

  if (cleanedValues.length === 2) {
    return cleanedValues[0] + " and " + cleanedValues[1];
  }

  return cleanedValues.slice(0, -1).join(", ") + ", and " + cleanedValues[cleanedValues.length - 1];
}

function resolvePlayerReference(driverLike) {
  const displayName = stringValue(
    driverLike &&
      (driverLike.fullName ||
        driverLike.name ||
        driverLike.Drivers ||
        (driverLike.id ? String(driverLike.id).replace(/-/g, " ") : "")),
  );

  if (!displayName) {
    return {
      playerId: null,
      teamId: null,
      teamSlug: null,
    };
  }

  let playerRow = get(
    "SELECT players.id, players.current_team_id, teams.slug AS team_slug " +
      "FROM players " +
      "LEFT JOIN teams ON teams.id = players.current_team_id " +
      "WHERE lower(trim(players.first_name || ' ' || players.last_name)) = lower(?) " +
      "LIMIT 1",
    [displayName],
  );

  if (!playerRow) {
    const displayNameParts = displayName.split(/\s+/).filter(Boolean);

    if (displayNameParts.length > 2) {
      playerRow = get(
        "SELECT players.id, players.current_team_id, teams.slug AS team_slug " +
          "FROM players " +
          "LEFT JOIN teams ON teams.id = players.current_team_id " +
          "WHERE lower(trim(players.first_name || ' ' || players.last_name)) = lower(?) " +
          "LIMIT 1",
        [displayNameParts.slice(1).join(" ")],
      );
    }
  }

  if (!playerRow) {
    return {
      playerId: null,
      teamId: null,
      teamSlug: null,
    };
  }

  return {
    playerId: Number(playerRow.id),
    teamId: playerRow.current_team_id === null ? null : Number(playerRow.current_team_id),
    teamSlug: playerRow.team_slug || null,
  };
}

function attachPlayerReference(driverLike) {
  return Object.assign({}, driverLike, resolvePlayerReference(driverLike));
}

function getSeasonCars(teamSlug, season) {
  const cars = getTeamSiteData(teamSlug, "carsData.json");

  if (!Array.isArray(cars) || cars.length === 0) {
    return [];
  }

  const exactSeasonCars = cars.filter(function filterExactSeason(carRow) {
    return Number(carRow && carRow.season) === Number(season);
  });

  if (exactSeasonCars.length > 0) {
    return exactSeasonCars.map(function mapExactSeasonCar(carRow) {
      return Object.assign({}, carRow, {
        image: resolveTeamCarImagePath(teamSlug, carRow),
      });
    });
  }

  const seasonRows = cars.filter(function filterSeasonRows(carRow) {
    return Number.isInteger(Number(carRow && carRow.season));
  });

  if (seasonRows.length === 0) {
    return cars.slice(0, 1).map(function mapFallbackCar(carRow) {
      return Object.assign({}, carRow, {
        image: resolveTeamCarImagePath(teamSlug, carRow),
      });
    });
  }

  const nearestPastSeason = seasonRows.reduce(function findNearestSeason(bestSeason, carRow) {
    const carSeason = Number(carRow.season);

    if (carSeason <= Number(season) && carSeason > bestSeason) {
      return carSeason;
    }

    return bestSeason;
  }, 0);

  if (nearestPastSeason > 0) {
    return cars.filter(function filterNearestSeason(carRow) {
      return Number(carRow && carRow.season) === nearestPastSeason;
    }).map(function mapNearestSeasonCar(carRow) {
      return Object.assign({}, carRow, {
        image: resolveTeamCarImagePath(teamSlug, carRow),
      });
    });
  }

  const latestSeason = seasonRows.reduce(function findLatestSeason(bestSeason, carRow) {
    return Math.max(bestSeason, Number(carRow.season));
  }, 0);

  return cars.filter(function filterLatestSeason(carRow) {
    return Number(carRow && carRow.season) === latestSeason;
  }).map(function mapLatestSeasonCar(carRow) {
    return Object.assign({}, carRow, {
      image: resolveTeamCarImagePath(teamSlug, carRow),
    });
  });
}

function getStoredTeamDrivers(teamSlug) {
  const driverRows = all(
    "SELECT " +
      "driver_key, driver_id, display_name, full_name, wiki_url, image_path, age_text, birth_date, birth_place, nationality, driver_number, wins_text, first_name, last_name, born_text, role, photo " +
      "FROM team_site_drivers " +
      "WHERE team_slug = ? " +
      "ORDER BY sort_order, display_name",
    [teamSlug],
  );

  if (driverRows.length === 0) {
    return [];
  }

  const formerTeamRows = all(
    "SELECT driver_key, title, city, country " +
      "FROM team_site_driver_former_teams " +
      "WHERE team_slug = ? " +
      "ORDER BY driver_key, sort_order",
    [teamSlug],
  );
  const formerTeamsByDriverKey = new Map();

  formerTeamRows.forEach(function indexFormerTeam(formerTeamRow) {
    const driverFormerTeams = formerTeamsByDriverKey.get(formerTeamRow.driver_key) || [];
    driverFormerTeams.push({
      title: stringValue(formerTeamRow.title),
      city: stringValue(formerTeamRow.city),
      country: stringValue(formerTeamRow.country),
    });
    formerTeamsByDriverKey.set(formerTeamRow.driver_key, driverFormerTeams);
  });

  return driverRows.map(function mapStoredDriver(driverRow) {
    const displayName =
      stringValue(driverRow && (driverRow.display_name || driverRow.full_name)) ||
      buildDriverName(driverRow && driverRow.first_name, driverRow && driverRow.last_name) ||
      "Unknown Driver";
    const playerReference = resolvePlayerReference({
      name: displayName,
      fullName: displayName,
      id: driverRow && driverRow.driver_id,
    });
    const resolvedImage = resolveTeamDriverImagePath(teamSlug, driverRow, displayName);

    return {
      id: stringValue(driverRow && driverRow.driver_id) || buildDriverId(displayName),
      name: displayName,
      wikiUrl: stringValue(driverRow && driverRow.wiki_url),
      image: resolvedImage,
      fullName: stringValue(driverRow && driverRow.full_name) || displayName,
      age: stringValue(driverRow && driverRow.age_text),
      birthDate: stringValue(driverRow && driverRow.birth_date),
      birthPlace: stringValue(driverRow && driverRow.birth_place),
      nationality: stringValue(driverRow && driverRow.nationality),
      number: stringValue(driverRow && driverRow.driver_number),
      wins: stringValue(driverRow && driverRow.wins_text),
      firstName: stringValue(driverRow && driverRow.first_name),
      lastName: stringValue(driverRow && driverRow.last_name),
      born: stringValue(driverRow && driverRow.born_text),
      role: stringValue(driverRow && driverRow.role) || "Driver",
      photo: resolvedImage,
      formerTeams: formerTeamsByDriverKey.get(driverRow.driver_key) || [],
      playerId: playerReference.playerId,
      teamId: playerReference.teamId,
      teamSlug: playerReference.teamSlug,
    };
  });
}

function getCurrentTeamDrivers(teamSlug) {
  const driverRows = all(
      "SELECT " +
      "players.id, " +
      "teams.id AS team_id, " +
      "teams.slug AS team_slug, " +
      "players.first_name, " +
      "players.last_name, " +
      "players.date_of_birth, " +
      "players.role, " +
      "players.photo, " +
      "players.driver_number " +
      "FROM players " +
      "INNER JOIN teams ON teams.id = players.current_team_id " +
      "WHERE teams.slug = ? AND players.is_active = 1 " +
      "ORDER BY COALESCE(players.driver_number, 999), players.last_name, players.first_name",
    [teamSlug],
  );

  if (driverRows.length > 0) {
    return driverRows.map(function mapCurrentDriver(driverRow) {
      const displayName = buildDriverName(driverRow.first_name, driverRow.last_name);
      const resolvedImage = resolveTeamDriverImagePath(teamSlug, driverRow, displayName);

      return {
        playerId: driverRow.id,
        teamId: Number(driverRow.team_id),
        teamSlug: driverRow.team_slug,
        id: buildDriverId(displayName),
        name: displayName,
        fullName: displayName,
        firstName: stringValue(driverRow.first_name),
        lastName: stringValue(driverRow.last_name),
        age: "Unknown",
        birthDate: stringValue(driverRow.date_of_birth),
        birthPlace: "Unknown",
        nationality: "Unknown",
        number:
          driverRow.driver_number === null || driverRow.driver_number === undefined
            ? "N/A"
            : String(driverRow.driver_number),
        wins: "0",
        born: stringValue(driverRow.date_of_birth),
        role: stringValue(driverRow.role) || "Driver",
        image: resolvedImage,
        photo: resolvedImage,
        formerTeams: [],
      };
    });
  }

  return getStoredTeamDrivers(teamSlug);
}

function getCurrentSeasonConstructorStandings(season) {
  return all(
    "SELECT " +
      "teams.id, " +
      "teams.name, " +
      "COALESCE(SUM(CASE WHEN races.season = ? AND scores.status = 'completed' THEN scores.points + COALESCE(scores.bonus_points, 0) ELSE 0 END), 0) AS points, " +
      "COALESCE(SUM(CASE WHEN races.season = ? AND scores.status = 'completed' AND scores.finish_position = 1 THEN 1 ELSE 0 END), 0) AS wins, " +
      "COALESCE(SUM(CASE WHEN races.season = ? AND scores.status = 'completed' AND scores.finish_position <= 3 THEN 1 ELSE 0 END), 0) AS podiums " +
      "FROM teams " +
      "LEFT JOIN scores ON scores.team_id = teams.id " +
      "LEFT JOIN races ON races.id = scores.race_id " +
      "GROUP BY teams.id, teams.name " +
      "ORDER BY points DESC, wins DESC, podiums DESC, teams.name ASC",
    [season, season, season],
  );
}

function buildTeamSeasonSummary(teamRow, season, scheduleRows, teamScoreRows) {
  const completedScoreRows = teamScoreRows.filter(function filterCompletedScoreRows(scoreRow) {
    return scoreRow.status === "completed";
  });
  const constructorStandings = getCurrentSeasonConstructorStandings(season);
  const championshipPosition =
    constructorStandings.findIndex(function findStandingRow(standingRow) {
      return Number(standingRow.id) === Number(teamRow.id);
    }) + 1;
  const totalPoints = completedScoreRows.reduce(function addPoints(totalPointsValue, scoreRow) {
    return totalPointsValue + (Number(scoreRow.points) || 0) + (Number(scoreRow.bonus_points) || 0);
  }, 0);
  const wins = completedScoreRows.filter(function filterWins(scoreRow) {
    return Number(scoreRow.finish_position) === 1;
  }).length;
  const podiums = completedScoreRows.filter(function filterPodiums(scoreRow) {
    return Number(scoreRow.finish_position) > 0 && Number(scoreRow.finish_position) <= 3;
  }).length;
  const bestFinish = completedScoreRows.reduce(function findBestFinish(bestFinishValue, scoreRow) {
    const finishPosition = Number(scoreRow.finish_position);

    if (!Number.isInteger(finishPosition) || finishPosition <= 0) {
      return bestFinishValue;
    }

    if (bestFinishValue === null || finishPosition < bestFinishValue) {
      return finishPosition;
    }

    return bestFinishValue;
  }, null);
  const completedRaces = scheduleRows.filter(function filterCompletedRaceRows(raceRow) {
    return raceRow.status === "completed";
  });
  const upcomingRaces = scheduleRows.filter(function filterUpcomingRaceRows(raceRow) {
    return raceRow.status === "upcoming";
  });
  const latestCompletedRace =
    completedRaces.length > 0 ? completedRaces[completedRaces.length - 1] : null;
  const nextUpcomingRace = upcomingRaces.length > 0 ? upcomingRaces[0] : null;

  return {
    headline: teamRow.name + " - " + String(season) + " Season",
    overview:
      teamRow.name +
      " has " +
      String(totalPoints) +
      " points after " +
      String(completedRaces.length) +
      " completed grands prix in " +
      String(season) +
      ", with " +
      String(wins) +
      " wins and " +
      String(podiums) +
      " podium finishes.",
    stats: [
      { label: "Championship position", value: championshipPosition > 0 ? String(championshipPosition) : "-" },
      { label: "Team points", value: String(totalPoints) },
      { label: "Completed weekends", value: String(completedRaces.length) },
      { label: "Upcoming weekends", value: String(upcomingRaces.length) },
      { label: "Wins", value: String(wins) },
      { label: "Podiums", value: String(podiums) },
      { label: "Best finish", value: bestFinish === null ? "-" : String(bestFinish) },
    ],
    notes: [
      latestCompletedRace
        ? "Latest completed race: Round " +
          String(latestCompletedRace.round_number) +
          " at " +
          latestCompletedRace.circuit_name +
          "."
        : "No completed races are seeded yet.",
      nextUpcomingRace
        ? "Next scheduled race: Round " +
          String(nextUpcomingRace.round_number) +
          " at " +
          nextUpcomingRace.circuit_name +
          "."
        : "No upcoming races remain in the current schedule.",
    ],
    tableNote:
      "Completed rounds show finishing position and result time. Upcoming rounds stay blank until scores are entered.",
  };
}

function buildCurrentSeasonTeamRacePayload(teamSlug) {
  const currentSeason = getLatestSeason();
  const teamRow = get("SELECT id, slug, name FROM teams WHERE slug = ?", [teamSlug]);

  if (!currentSeason || !teamRow) {
    return null;
  }

  const currentDrivers = getCurrentTeamDrivers(teamSlug);
  const scheduleRows = all(
    "SELECT id, round_number, name, circuit_name, status " +
      "FROM races " +
      "WHERE season = ? " +
      "ORDER BY round_number, id",
    [currentSeason],
  );

  if (scheduleRows.length === 0) {
    return null;
  }

  const teamScoreRows = all(
    "SELECT " +
      "scores.player_id, " +
      "scores.finish_position, " +
      "scores.points, " +
      "scores.bonus_points, " +
      "scores.result_time, " +
      "scores.status, " +
      "races.round_number " +
      "FROM scores " +
      "INNER JOIN races ON races.id = scores.race_id " +
      "WHERE scores.team_id = ? AND races.season = ? " +
      "ORDER BY races.round_number, scores.player_id",
    [teamRow.id, currentSeason],
  );
  const scoreRowByPlayerAndRound = new Map();

  teamScoreRows.forEach(function indexTeamScore(scoreRow) {
    scoreRowByPlayerAndRound.set(
      String(scoreRow.player_id) + ":" + String(scoreRow.round_number),
      scoreRow,
    );
  });

  return {
    seasonKey: String(currentSeason),
    payload: {
      Car: getSeasonCars(teamSlug, currentSeason),
      drivers: currentDrivers.map(function mapDriverForPayload(driverRow) {
        return {
          id: driverRow.id,
          name: driverRow.name,
          image: driverRow.image,
        };
      }),
      races: currentDrivers.map(function mapDriverRaceRow(driverRow) {
        return {
          Drivers: driverRow.name,
          results: scheduleRows.map(function mapRaceResult(raceRow) {
            const scoreRow = scoreRowByPlayerAndRound.get(
              String(driverRow.playerId) + ":" + String(raceRow.round_number),
            );
            const isCompletedScore = Boolean(
              scoreRow &&
                scoreRow.status === "completed" &&
                Number.isInteger(Number(scoreRow.finish_position)),
            );

            return {
              GP: raceRow.circuit_name || stringValue(raceRow.name).replace(/\s+Grand Prix$/, ""),
              Place: isCompletedScore && Number.isInteger(Number(scoreRow.finish_position)) ? String(scoreRow.finish_position) : "",
              Time: scoreRow && scoreRow.status === "completed" ? stringValue(scoreRow.result_time) : "",
            };
          }),
        };
      }),
      summary: buildTeamSeasonSummary(teamRow, currentSeason, scheduleRows, teamScoreRows),
    },
  };
}

function getRootLeaderboard() {
  const currentSeason = getLatestSeason();

  if (!currentSeason) {
    return [];
  }

  return all(
    "SELECT " +
      "teams.id AS team_id, " +
      "teams.slug AS team_slug, " +
      "teams.name AS team_name, " +
      "COALESCE(SUM(CASE WHEN races.season = ? AND scores.status = 'completed' THEN scores.points + COALESCE(scores.bonus_points, 0) ELSE 0 END), 0) AS points, " +
      "COALESCE(SUM(CASE WHEN races.season = ? AND scores.status = 'completed' AND scores.finish_position = 1 THEN 1 ELSE 0 END), 0) AS wins, " +
      "COALESCE(SUM(CASE WHEN races.season = ? AND scores.status = 'completed' AND scores.finish_position <= 3 THEN 1 ELSE 0 END), 0) AS podiums, " +
      "COALESCE(COUNT(DISTINCT CASE WHEN races.season = ? AND scores.status = 'completed' THEN races.id END), 0) AS completed_races, " +
      "MIN(CASE WHEN races.season = ? AND scores.status = 'completed' THEN scores.finish_position END) AS best_finish " +
      "FROM teams " +
      "LEFT JOIN scores ON scores.team_id = teams.id " +
      "LEFT JOIN races ON races.id = scores.race_id " +
      "GROUP BY teams.id, teams.slug, teams.name " +
      "ORDER BY points DESC, wins DESC, podiums DESC, COALESCE(best_finish, 999) ASC, teams.name ASC",
    [currentSeason, currentSeason, currentSeason, currentSeason, currentSeason],
  ).map(function mapLeaderboardRow(row, rowIndex) {
    return {
      rank: rowIndex + 1,
      season: currentSeason,
      teamId: row.team_id === null ? null : Number(row.team_id),
      teamSlug: row.team_slug || null,
      team: row.team_name || "Unknown",
      points: Number(row.points) || 0,
      wins: Number(row.wins) || 0,
      podiums: Number(row.podiums) || 0,
      completedRaces: Number(row.completed_races) || 0,
      bestFinish: row.best_finish === null ? null : Number(row.best_finish),
    };
  });
}

function getLatestScores(limitValue) {
  const currentSeason = getLatestSeason();
  const limit = Number.isInteger(Number(limitValue)) && Number(limitValue) > 0 ? Number(limitValue) : 10;

  if (!currentSeason) {
    return [];
  }

  const raceRows = all(
    "SELECT id, season, round_number, name, circuit_name, scheduled_at " +
      "FROM races " +
      "WHERE season = ? AND status = 'completed' " +
      "ORDER BY round_number DESC, id DESC " +
      "LIMIT ?",
    [currentSeason, limit],
  );

  if (raceRows.length === 0) {
    return [];
  }

  const placeholders = raceRows.map(function mapPlaceholder() {
    return "?";
  }).join(", ");
  const scoreRows = all(
    "SELECT " +
      "scores.race_id, " +
      "scores.player_id, " +
      "scores.team_id, " +
      "scores.finish_position, " +
      "scores.points, " +
      "scores.result_time, " +
      "players.first_name, " +
      "players.last_name, " +
      "teams.slug AS team_slug, " +
      "teams.name AS team_name " +
      "FROM scores " +
      "INNER JOIN players ON players.id = scores.player_id " +
      "LEFT JOIN teams ON teams.id = scores.team_id " +
      "WHERE scores.status = 'completed' AND scores.race_id IN (" +
      placeholders +
      ") " +
      "ORDER BY scores.race_id DESC, COALESCE(scores.finish_position, 999) ASC, players.last_name ASC, players.first_name ASC",
    raceRows.map(function mapRaceId(raceRow) {
      return raceRow.id;
    }),
  );
  const scoresByRaceId = new Map();

  scoreRows.forEach(function indexScoreRow(scoreRow) {
    const raceScores = scoresByRaceId.get(scoreRow.race_id) || [];

    raceScores.push({
      playerId: scoreRow.player_id,
      name: buildDriverName(scoreRow.first_name, scoreRow.last_name),
      teamId: scoreRow.team_id === null ? null : Number(scoreRow.team_id),
      teamSlug: scoreRow.team_slug || null,
      team: scoreRow.team_name || "Unknown",
      finishPosition: Number(scoreRow.finish_position) || null,
      points: Number(scoreRow.points) || 0,
      resultTime: stringValue(scoreRow.result_time),
    });
    scoresByRaceId.set(scoreRow.race_id, raceScores);
  });

  return raceRows.map(function mapRaceRow(raceRow) {
    return {
      id: raceRow.id,
      season: raceRow.season,
      roundNumber: raceRow.round_number,
      name: raceRow.name,
      circuitName: raceRow.circuit_name,
      scheduledAt: raceRow.scheduled_at,
      results: (scoresByRaceId.get(raceRow.id) || []).slice(0, 3),
    };
  });
}

function getUpcomingRaces(limitValue) {
  const currentSeason = getLatestSeason();
  const limit = Number.isInteger(Number(limitValue)) && Number(limitValue) > 0 ? Number(limitValue) : 10;

  if (!currentSeason) {
    return [];
  }

  return all(
    "SELECT id, season, round_number, name, circuit_name, scheduled_at " +
      "FROM races " +
      "WHERE season = ? AND status = 'upcoming' " +
      "ORDER BY round_number ASC, id ASC " +
      "LIMIT ?",
    [currentSeason, limit],
  ).map(function mapRaceRow(raceRow) {
    return {
      id: raceRow.id,
      season: raceRow.season,
      roundNumber: raceRow.round_number,
      name: raceRow.name,
      circuitName: raceRow.circuit_name,
      scheduledAt: raceRow.scheduled_at,
    };
  });
}

function getRootGroupMembers() {
  return getRootSiteData("groupMembers.json") || [];
}

function getTeamSiteDrivers(teamSlug) {
  const storedDrivers = getStoredTeamDrivers(teamSlug);
  const currentDrivers = getCurrentTeamDrivers(teamSlug);
  const mergedDrivers = storedDrivers.slice();
  const knownDriverNames = new Set();
  const knownPlayerIds = new Set();

  storedDrivers.forEach(function indexStoredDriver(driverRow) {
    if (driverRow && driverRow.playerId) {
      knownPlayerIds.add(Number(driverRow.playerId));
    }

    knownDriverNames.add(normalizeDriverImageKey(driverRow && (driverRow.name || driverRow.fullName)));
  });

  currentDrivers.forEach(function appendCurrentDriver(driverRow) {
    const normalizedDriverName = normalizeDriverImageKey(driverRow.name);

    if (
      !normalizedDriverName ||
      knownDriverNames.has(normalizedDriverName) ||
      (driverRow.playerId && knownPlayerIds.has(Number(driverRow.playerId)))
    ) {
      return;
    }

    knownDriverNames.add(normalizedDriverName);
    mergedDrivers.push(driverRow);
  });

  return mergedDrivers;
}

function getTeamSiteCars(teamSlug) {
  const cars = getTeamSiteData(teamSlug, "carsData.json") || [];

  return cars.map(function mapCarRow(carRow) {
    return Object.assign({}, carRow, {
      image: resolveTeamCarImagePath(teamSlug, carRow),
      drivers: Array.isArray(carRow.drivers)
        ? carRow.drivers.map(function mapCarDriver(driverRow) {
            return attachPlayerReference(driverRow);
          })
        : [],
    });
  });
}

function enrichRacePayloadWithPlayerReferences(teamSlug, racePayloadBySeason) {
  const enrichedPayload = {};

  Object.keys(racePayloadBySeason || {}).forEach(function mapSeasonPayload(seasonKey) {
    const seasonPayload = racePayloadBySeason[seasonKey] || {};
    const drivers = Array.isArray(seasonPayload.drivers)
      ? seasonPayload.drivers.map(function mapDriver(driverRow) {
          const enrichedDriver = attachPlayerReference(driverRow);
          const displayName = stringValue(enrichedDriver.name || enrichedDriver.fullName);

          return Object.assign({}, enrichedDriver, {
            image: resolveTeamDriverImagePath(teamSlug, enrichedDriver, displayName),
          });
        })
      : [];
    const playerIdByName = new Map();

    drivers.forEach(function indexDriver(driverRow) {
      const driverName = stringValue(driverRow.name || driverRow.fullName);

      if (driverName) {
        playerIdByName.set(driverName, driverRow.playerId || null);
      }
    });

    enrichedPayload[seasonKey] = Object.assign({}, seasonPayload, {
      Car: Array.isArray(seasonPayload.Car)
        ? seasonPayload.Car.map(function mapCarRow(carRow) {
            return Object.assign({}, carRow, {
              image: resolveTeamCarImagePath(teamSlug, carRow),
              drivers: Array.isArray(carRow.drivers)
                ? carRow.drivers.map(function mapCarDriver(driverRow) {
                    return attachPlayerReference(driverRow);
                  })
                : [],
            });
          })
        : [],
      drivers: drivers,
      races: Array.isArray(seasonPayload.races)
        ? seasonPayload.races.map(function mapRaceRow(raceRow) {
            const driverName = stringValue(raceRow.Drivers);
            const reference = attachPlayerReference({
              name: driverName,
              fullName: driverName,
            });

            return Object.assign({}, raceRow, {
              playerId:
                reference.playerId || playerIdByName.get(driverName) || null,
            });
          })
        : [],
    });
  });

  return enrichedPayload;
}

function getTeamSiteRaceData(teamSlug) {
  const archivedRaceData = getTeamSiteData(teamSlug, "raceData.json");
  const mergedRaceData =
    archivedRaceData && typeof archivedRaceData === "object" && !Array.isArray(archivedRaceData)
      ? Object.assign({}, archivedRaceData)
      : {};
  const currentSeasonPayload = buildCurrentSeasonTeamRacePayload(teamSlug);

  if (!currentSeasonPayload) {
    return enrichRacePayloadWithPlayerReferences(teamSlug, mergedRaceData);
  }

  mergedRaceData[currentSeasonPayload.seasonKey] = currentSeasonPayload.payload;
  return enrichRacePayloadWithPlayerReferences(teamSlug, mergedRaceData);
}

function getTeamSiteContent(teamSlug) {
  const contentPayload = getTeamSiteData(teamSlug, "contentData.json") || {};
  const currentSeason = getLatestSeason();
  const teamRow = get("SELECT id, name FROM teams WHERE slug = ?", [teamSlug]);
  const currentDrivers = getCurrentTeamDrivers(teamSlug);
  const currentCars = currentSeason ? getSeasonCars(teamSlug, currentSeason) : [];
  const constructorStandings = currentSeason ? getCurrentSeasonConstructorStandings(currentSeason) : [];
  const championshipPosition =
    constructorStandings.findIndex(function findStandingRow(standingRow) {
      return Number(standingRow.id) === Number(teamRow && teamRow.id);
    }) + 1;
  const latestDriversText = formatList(
    currentDrivers.map(function mapDriver(driverRow) {
      return driverRow.name;
    }),
  );
  const latestCarsText = formatList(
    currentCars.map(function mapCar(carRow) {
      return carRow.name || carRow.id;
    }),
  );
  const homePayload = Object.assign({}, contentPayload.home || {});
  const quickFacts = Array.isArray(homePayload.quickFacts) ? homePayload.quickFacts.slice() : [];

  function upsertQuickFact(labelText, valueText) {
    const existingIndex = quickFacts.findIndex(function findFact(factRow) {
      return stringValue(factRow && factRow.label).toLowerCase() === String(labelText).toLowerCase();
    });
    const nextFact = { label: labelText, value: valueText };

    if (existingIndex >= 0) {
      quickFacts[existingIndex] = nextFact;
      return;
    }

    quickFacts.push(nextFact);
  }

  if (currentSeason) {
    upsertQuickFact("Latest season", String(currentSeason));
  }

  if (latestCarsText !== "not recorded") {
    upsertQuickFact("Latest car", latestCarsText);
  }

  if (latestDriversText !== "not recorded") {
    upsertQuickFact("Latest drivers", latestDriversText);
  }

  if (championshipPosition > 0) {
    upsertQuickFact("Current standing", String(championshipPosition));
  }

  homePayload.quickFacts = quickFacts;

  return Object.assign({}, contentPayload, {
    home: homePayload,
  });
}

function getDriverImage(imageKey) {
  const row = get(
    "SELECT file_name, content_type, image_blob FROM driver_images WHERE image_key = ?",
    [normalizeDriverImageKey(imageKey)],
  );

  if (!row) {
    return null;
  }

  return {
    fileName: row.file_name,
    contentType: row.content_type,
    imageBuffer: Buffer.from(row.image_blob),
  };
}

module.exports = {
  getDriverImage,
  getLeagueInfo,
  getRootGroupMembers,
  getRootLeaderboard,
  getLatestScores,
  getUpcomingRaces,
  getRootSiteData,
  getTeamSiteCars,
  getTeamSiteContent,
  getTeamSiteData,
  getTeamSiteDrivers,
  getTeamSiteRaceData,
};
