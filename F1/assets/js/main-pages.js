/* Purpose: Loads the main teams and drivers pages from the league API without changing the site layout. */

let currentSiteSession = null;

function fetchJson(url) {
  return fetch(url).then(function handleResponse(response) {
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    return response.json();
  });
}

function getFavoriteTeamId() {
  const rawValue = currentSiteSession && currentSiteSession.favoriteTeamId;
  const numericValue = Number(rawValue);

  return Number.isInteger(numericValue) && numericValue > 0 ?
      numericValue
    : null;
}

function getFavoriteTeamSlug() {
  return currentSiteSession && currentSiteSession.favoriteTeamSlug ?
      String(currentSiteSession.favoriteTeamSlug)
    : "";
}

function isFavoriteTeam(teamIdValue, teamSlugValue) {
  const favoriteTeamId = getFavoriteTeamId();
  const favoriteTeamSlug = getFavoriteTeamSlug();
  const numericTeamId = Number(teamIdValue);

  if (
    favoriteTeamId &&
    Number.isInteger(numericTeamId) &&
    numericTeamId === favoriteTeamId
  ) {
    return true;
  }

  return (
    Boolean(favoriteTeamSlug) &&
    String(teamSlugValue || "") === favoriteTeamSlug
  );
}

function applyFavoriteTeamHighlights(rootNode) {
  const root = rootNode || document;
  const candidates = [];

  if (
    root instanceof HTMLElement &&
    (root.dataset.teamId || root.dataset.teamSlug)
  ) {
    candidates.push(root);
  }

  root
    .querySelectorAll("[data-team-id], [data-team-slug]")
    .forEach(function addCandidate(node) {
      candidates.push(node);
    });

  candidates.forEach(function toggleHighlight(node) {
    node.classList.toggle(
      "favorite-team-highlight",
      isFavoriteTeam(node.dataset.teamId, node.dataset.teamSlug),
    );
  });
}

function upsertAdminNavLink(session) {
  const nav =
    document.querySelector('.site-nav[aria-label="Main navigation"]') ||
    document.querySelector(".site-nav");
  let adminLink = document.getElementById("adminNavLink");

  if (!nav) {
    return;
  }

  if (!session || !session.isAdmin) {
    if (adminLink) {
      adminLink.remove();
    }
    return;
  }

  if (!adminLink) {
    adminLink = document.createElement("a");
    adminLink.id = "adminNavLink";
    adminLink.className = "site-nav__link";
    adminLink.href = "admin.html";
    adminLink.textContent = "Admin";
    nav.appendChild(adminLink);
  }
}

function renderSessionBanner(session) {
  const header = document.querySelector("header");
  const headerBar = document.querySelector(".site-header__bar");
  let banner = document.getElementById("sessionBanner");

  if (!header) {
    return;
  }

  if (!session || !session.authenticated) {
    if (banner) {
      banner.remove();
    }
    return;
  }

  if (!banner) {
    banner = document.createElement("p");
    banner.id = "sessionBanner";
    banner.className = "session-banner";

    if (headerBar && headerBar.parentNode === header) {
      header.insertBefore(banner, headerBar.nextSibling);
    } else {
      header.insertBefore(banner, header.firstChild);
    }
  }

  banner.textContent = "Welcome Back: " + session.user + "!";
}

function loadSessionNavigation() {
  fetchJson("/api/session")
    .then(function handleSession(session) {
      currentSiteSession = session && session.authenticated ? session : null;
      upsertAdminNavLink(session);
      renderSessionBanner(session);
      applyFavoriteTeamHighlights(document);
    })
    .catch(function ignoreSessionError() {
      currentSiteSession = null;
      upsertAdminNavLink(null);
      renderSessionBanner(null);
      applyFavoriteTeamHighlights(document);
    });
}

function getQueryValue(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function makeMainLogoClickable() {
  const logo = document.getElementById("Formula1");

  if (!logo) {
    return;
  }

  logo.style.cursor = "pointer";
  logo.addEventListener("click", function handleClick() {
    window.location.href = "index.html";
  });
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function formatRaceDate(dateValue) {
  if (!dateValue) {
    return "Date to be confirmed";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function createRaceFeedCard(titleText, subtitleText) {
  const article = document.createElement("article");
  const title = document.createElement("h3");
  const subtitle = document.createElement("p");

  article.className = "race-feed__card";
  title.textContent = titleText;
  subtitle.textContent = subtitleText;
  subtitle.className = "race-feed__meta";
  article.appendChild(title);
  article.appendChild(subtitle);

  return article;
}

function createTile(imagePath, altText) {
  const tile = document.createElement("div");
  const image = document.createElement("img");

  tile.className = "driver-tile";
  image.src = imagePath || "assets/images/F1Logo.png";
  image.alt = altText;

  tile.appendChild(image);

  return tile;
}

function getTeamPageUrl(teamSlugOrId) {
  const teamValue = String(teamSlugOrId || "").trim();

  if (teamValue && !/^\d+$/.test(teamValue)) {
    return "Team_Sites/" + encodeURIComponent(teamValue) + "/index.html";
  }

  return "teamprofile.html?team=" + encodeURIComponent(teamValue);
}

function createTeamCard(team) {
  const section = document.createElement("section");
  const link = document.createElement("a");
  const title = document.createElement("h2");
  const row = document.createElement("div");
  const meta = document.createElement("div");
  const description = document.createElement("p");

  section.className = "driver-card";
  section.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  section.dataset.teamSlug = team.slug || "";
  link.href = getTeamPageUrl(team.slug);
  title.textContent = team.name;
  row.className = "driver-card__row";
  meta.className = "driver-meta";
  description.textContent = team.description;

  row.appendChild(createTile(team.logoImage || team.teamImage, team.name));
  meta.appendChild(description);
  row.appendChild(meta);
  link.appendChild(title);
  link.appendChild(row);
  section.appendChild(link);

  return section;
}

function createTeamInfoCard(team, descriptionText) {
  const article = document.createElement("section");
  const row = document.createElement("div");
  const meta = document.createElement("div");
  const title = document.createElement("h2");
  const description = document.createElement("p");

  article.className = "driver-card";
  article.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  article.dataset.teamSlug = team.slug || "";
  row.className = "driver-card__row";
  meta.className = "driver-meta";
  title.textContent = team.name;
  description.textContent = descriptionText || team.description || "";

  row.appendChild(createTile(team.teamImage || team.logoImage, team.name));
  meta.appendChild(description);
  row.appendChild(meta);
  article.appendChild(title);
  article.appendChild(row);

  return article;
}

function createTeamSection(titleText, listClassName) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  const container = document.createElement("div");

  section.className = "team-section";
  title.textContent = titleText;

  if (listClassName) {
    container.className = listClassName;
  }

  section.appendChild(title);
  section.appendChild(container);

  return {
    section: section,
    container: container,
  };
}

function createParagraphCard(titleText, paragraphs, team) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  const meta = document.createElement("div");

  section.className = "driver-card";
  section.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  section.dataset.teamSlug = team.slug || "";
  meta.className = "driver-meta";
  title.textContent = titleText;

  (Array.isArray(paragraphs) ? paragraphs : []).forEach(
    function appendParagraph(paragraphText) {
      const paragraph = document.createElement("p");
      paragraph.textContent = String(paragraphText || "");
      meta.appendChild(paragraph);
    },
  );

  section.appendChild(title);
  section.appendChild(meta);

  return section;
}

function createQuickFactsCard(titleText, facts, team) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  const meta = document.createElement("div");
  const list = document.createElement("ul");

  section.className = "driver-card";
  section.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  section.dataset.teamSlug = team.slug || "";
  meta.className = "driver-meta";
  list.className = "team-detail-list";
  title.textContent = titleText;

  (Array.isArray(facts) ? facts : []).forEach(function appendFact(fact) {
    const item = document.createElement("li");
    const label = String((fact && fact.label) || "").trim();
    const value = String((fact && fact.value) || "").trim();

    item.textContent = label ? label + ": " + value : value;
    list.appendChild(item);
  });

  meta.appendChild(list);
  section.appendChild(title);
  section.appendChild(meta);

  return section;
}

function createSummaryCard(summary, seasonKey, team) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  const meta = document.createElement("div");
  const overview = document.createElement("p");
  const statsList = document.createElement("ul");
  const notesList = document.createElement("ul");

  section.className = "driver-card";
  section.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  section.dataset.teamSlug = team.slug || "";
  meta.className = "driver-meta";
  statsList.className = "team-detail-list";
  notesList.className = "team-detail-list";
  title.textContent = String(seasonKey) + " Statistics";
  overview.textContent =
    summary && summary.overview ? String(summary.overview) : "";

  (Array.isArray(summary && summary.stats) ? summary.stats : []).forEach(
    function appendStat(stat) {
      const item = document.createElement("li");
      item.textContent =
        String(stat.label || "") + ": " + String(stat.value || "");
      statsList.appendChild(item);
    },
  );

  (Array.isArray(summary && summary.notes) ? summary.notes : []).forEach(
    function appendNote(noteText) {
      const item = document.createElement("li");
      item.textContent = String(noteText || "");
      notesList.appendChild(item);
    },
  );

  if (overview.textContent) {
    meta.appendChild(overview);
  }

  if (statsList.childNodes.length > 0) {
    meta.appendChild(statsList);
  }

  if (notesList.childNodes.length > 0) {
    meta.appendChild(notesList);
  }

  if (summary && summary.tableNote) {
    const note = document.createElement("p");
    note.textContent = String(summary.tableNote);
    meta.appendChild(note);
  }

  section.appendChild(title);
  section.appendChild(meta);

  return section;
}

function createTeamSiteDriverCard(driver, team) {
  const section = document.createElement("section");
  const heading = document.createElement("h3");
  const row = document.createElement("div");
  const meta = document.createElement("div");
  const birthLine = document.createElement("p");
  const nationalityLine = document.createElement("p");
  const roleLine = document.createElement("p");
  const numberLine = document.createElement("p");
  const winsLine = document.createElement("p");

  section.className = "driver-card";
  section.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  section.dataset.teamSlug = team.slug || "";
  row.className = "driver-card__row";
  meta.className = "driver-meta";

  if (driver && driver.playerId) {
    const link = document.createElement("a");
    link.href = "playerprofile.html?id=" + encodeURIComponent(driver.playerId);
    link.textContent = String(
      driver.fullName || driver.name || "Unknown Driver",
    );
    heading.appendChild(link);
  } else {
    heading.textContent = String(
      (driver && (driver.fullName || driver.name)) || "Unknown Driver",
    );
  }

  birthLine.textContent =
    "Date of birth: " +
    String((driver && (driver.birthDate || driver.born)) || "-");
  nationalityLine.textContent =
    "Nationality: " + String((driver && driver.nationality) || "-");
  roleLine.textContent = "Role: " + String((driver && driver.role) || "Driver");
  numberLine.textContent =
    "Number: " + String((driver && driver.number) || "N/A");
  winsLine.textContent = "Wins: " + String((driver && driver.wins) || "0");

  row.appendChild(
    createTile(
      (driver && (driver.photo || driver.image)) || "assets/images/F1Logo.png",
      String((driver && (driver.fullName || driver.name)) || "Driver"),
    ),
  );
  meta.appendChild(birthLine);
  meta.appendChild(nationalityLine);
  meta.appendChild(roleLine);
  meta.appendChild(numberLine);
  meta.appendChild(winsLine);
  row.appendChild(meta);
  section.appendChild(heading);
  section.appendChild(row);

  return section;
}

function createCarCard(car, team) {
  const section = document.createElement("section");
  const title = document.createElement("h3");
  const row = document.createElement("div");
  const meta = document.createElement("div");
  const notesLine = document.createElement("p");
  const engineLine = document.createElement("p");
  const powerLine = document.createElement("p");
  const racesLine = document.createElement("p");
  const driversLine = document.createElement("p");

  section.className = "driver-card";
  section.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  section.dataset.teamSlug = team.slug || "";
  row.className = "driver-card__row";
  meta.className = "driver-meta";
  title.textContent =
    String((car && car.name) || "Team Car") +
    (car && car.season ? " (" + String(car.season) + ")" : "");
  notesLine.textContent = String((car && car.notes) || "");
  engineLine.textContent = "Engine: " + String((car && car.engine) || "-");
  powerLine.textContent = "Power: " + String((car && car.power) || "-");
  racesLine.textContent = "Races: " + String((car && car.races) || "-");
  driversLine.textContent =
    "Drivers: " +
    (Array.isArray(car && car.drivers) && car.drivers.length > 0 ?
      car.drivers
        .map(function mapDriver(driver) {
          return String((driver && driver.name) || "");
        })
        .filter(Boolean)
        .join(", ")
    : "-");

  row.appendChild(
    createTile(
      (car && car.image) || "assets/images/F1Logo.png",
      String((car && car.name) || "Car"),
    ),
  );
  meta.appendChild(notesLine);
  meta.appendChild(engineLine);
  meta.appendChild(powerLine);
  meta.appendChild(racesLine);
  meta.appendChild(driversLine);
  row.appendChild(meta);
  section.appendChild(title);
  section.appendChild(row);

  return section;
}

function createTeamRaceCard(team, game) {
  const card = createRaceFeedCard(
    "Round " + String(game.roundNumber) + " - " + String(game.name),
    String(game.circuitName) +
      " | " +
      formatRaceDate(game.scheduledAt) +
      " | " +
      (game.status === "completed" ? "Completed" : "Upcoming"),
  );
  const summary = document.createElement("p");
  const resultList = document.createElement("ul");

  card.dataset.teamId =
    team.id === null || team.id === undefined ? "" : String(team.id);
  card.dataset.teamSlug = team.slug || "";
  summary.className = "race-feed__meta";
  resultList.className = "race-feed__results";

  if (game.status === "completed") {
    summary.textContent =
      "Team points: " +
      String(game.teamPoints) +
      " | Best finish: " +
      (game.bestFinish === null ? "-" : String(game.bestFinish));
  } else {
    summary.textContent = "Upcoming race for " + team.name + ".";
  }

  game.results.forEach(function appendResult(result) {
    const item = document.createElement("li");
    const link = document.createElement("a");

    if (result.playerId) {
      link.href =
        "playerprofile.html?id=" + encodeURIComponent(result.playerId);
      link.textContent = String(result.fullName);
      item.appendChild(link);
    } else {
      item.textContent = String(result.fullName);
    }

    if (game.status === "completed" && result.finishPosition !== null) {
      if (!item.firstChild) {
        item.textContent =
          String(result.finishPosition) + ". " + String(result.fullName);
      } else {
        item.insertBefore(
          document.createTextNode(String(result.finishPosition) + ". "),
          item.firstChild,
        );
      }

      item.appendChild(
        document.createTextNode(" - " + String(result.points) + " pts"),
      );

      if (result.resultTime) {
        item.appendChild(
          document.createTextNode(" - " + String(result.resultTime)),
        );
      }
    }

    resultList.appendChild(item);
  });

  card.appendChild(summary);
  card.appendChild(resultList);

  return card;
}

function getLatestSeasonPayload(raceData) {
  const seasonKeys = Object.keys(raceData || {})
    .filter(function filterSeasonKey(seasonKey) {
      return /^\d+$/.test(String(seasonKey));
    })
    .sort(function sortSeasons(leftValue, rightValue) {
      return Number(leftValue) - Number(rightValue);
    });

  if (seasonKeys.length === 0) {
    return {
      seasonKey: "",
      payload: null,
    };
  }

  return {
    seasonKey: seasonKeys[seasonKeys.length - 1],
    payload: raceData[seasonKeys[seasonKeys.length - 1]] || null,
  };
}

function createPlayerCard(player) {
  const section = document.createElement("section");
  const titleLink = document.createElement("a");
  const title = document.createElement("h2");
  const row = document.createElement("div");
  const meta = document.createElement("div");
  const teamLine = document.createElement("p");
  const teamLink = document.createElement("a");
  const roleLine = document.createElement("p");
  const summaryLine = document.createElement("p");

  section.className = "driver-card";
  section.dataset.teamId =
    player.teamId === null || player.teamId === undefined ?
      ""
    : String(player.teamId);
  section.dataset.teamSlug = player.teamSlug || "";
  titleLink.href = "playerprofile.html?id=" + encodeURIComponent(player.id);
  title.textContent = player.fullName;
  row.className = "driver-card__row";
  meta.className = "driver-meta";
  teamLine.textContent = "Team: ";
  teamLink.href = getTeamPageUrl(player.teamSlug || player.teamId || "");
  teamLink.textContent = player.teamName || "Unknown";
  teamLine.appendChild(teamLink);
  roleLine.textContent = "Role: " + (player.position || "Driver");
  summaryLine.textContent =
    "Number: " +
    (player.number === null || player.number === undefined ?
      "-"
    : String(player.number)) +
    " | Age or date of birth: " +
    String(player.ageOrDob || "-");

  row.appendChild(createTile(player.photo, player.fullName));
  meta.appendChild(teamLine);
  meta.appendChild(roleLine);
  meta.appendChild(summaryLine);
  row.appendChild(meta);
  titleLink.appendChild(title);
  section.appendChild(titleLink);
  section.appendChild(row);

  return section;
}

function renderTeamSectionNavigation(teamSlug, activePage) {
  const nav = document.getElementById("teamSectionNav");
  const teamValue = String(teamSlug || "").trim();

  if (!nav) {
    return;
  }

  clearNode(nav);

  if (!teamValue) {
    return;
  }

  [
    { href: "teamprofile.html", label: "Team Info", page: "team-info" },
    { href: "teamplayers.html", label: "Drivers", page: "team-players" },
    { href: "teamgames.html", label: "Races", page: "team-games" },
  ].forEach(function appendLink(linkData) {
    const link = document.createElement("a");

    link.className = "site-nav__link";
    link.href = linkData.href + "?team=" + encodeURIComponent(teamValue);
    link.textContent = linkData.label;

    if (linkData.page === activePage) {
      link.style.color = "red";
      link.setAttribute("aria-current", "page");
    }

    nav.appendChild(link);
  });
}

function loadTeamsPage() {
  const list = document.getElementById("teamsList");
  const status = document.getElementById("teamsStatus");

  if (!list || !status) {
    return;
  }

  fetchJson("/api/teams")
    .then(function renderTeams(teams) {
      clearNode(list);
      teams.forEach(function appendTeam(team) {
        list.appendChild(createTeamCard(team));
      });
      applyFavoriteTeamHighlights(list);
      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load teams.";
    });
}

function loadPlayersPage() {
  const list = document.getElementById("driversList");
  const status = document.getElementById("playersStatus");

  if (!list || !status) {
    return;
  }

  fetchJson("/api/players")
    .then(function renderPlayers(players) {
      clearNode(list);
      players.forEach(function appendPlayer(player) {
        list.appendChild(createPlayerCard(player));
      });
      applyFavoriteTeamHighlights(list);
      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load drivers.";
    });
}

function loadTeamProfilePage() {
  const teamSlug = getQueryValue("team");
  const status = document.getElementById("teamInfoStatus");
  const title = document.getElementById("teamInfoTitle");
  const teamCard = document.getElementById("teamInfoCard");

  if (!status || !title || !teamCard) {
    return;
  }

  if (!teamSlug) {
    status.textContent = "Open a team from the Teams page to load its info.";
    return;
  }

  Promise.all([
    fetchJson("/api/teams/" + encodeURIComponent(teamSlug)),
    fetchJson("/api/team-sites/" + encodeURIComponent(teamSlug) + "/content"),
    fetchJson("/api/team-sites/" + encodeURIComponent(teamSlug) + "/drivers"),
    fetchJson("/api/team-sites/" + encodeURIComponent(teamSlug) + "/cars"),
    fetchJson("/api/team-sites/" + encodeURIComponent(teamSlug) + "/race-data"),
    fetchJson("/api/teams/" + encodeURIComponent(teamSlug) + "/games"),
  ])
    .then(function renderTeam(values) {
      const team = values[0];
      const teamContent = values[1] || {};
      const teamDrivers = Array.isArray(values[2]) ? values[2] : [];
      const teamCars = Array.isArray(values[3]) ? values[3] : [];
      const raceData = values[4] || {};
      const gamesPayload = values[5] || {};
      const latestSeasonPayload = getLatestSeasonPayload(raceData);
      const homeContent = teamContent.home || {};
      const profileContent = teamContent.profile || {};

      clearNode(teamCard);
      renderTeamSectionNavigation(team.slug, "team-info");
      title.textContent = team.name + " Team Info";

      teamCard.appendChild(
        createTeamInfoCard(
          team,
          teamContent.teamDescription || team.description,
        ),
      );

      if (Array.isArray(homeContent.intro) && homeContent.intro.length > 0) {
        teamCard.appendChild(
          createParagraphCard("Overview", homeContent.intro, team),
        );
      }

      if (
        Array.isArray(homeContent.quickFacts) &&
        homeContent.quickFacts.length > 0
      ) {
        teamCard.appendChild(
          createQuickFactsCard("Quick Facts", homeContent.quickFacts, team),
        );
      }

      (Array.isArray(homeContent.readingBlocks) ?
        homeContent.readingBlocks
      : []
      ).forEach(function appendReadingBlock(readingBlock) {
        teamCard.appendChild(
          createParagraphCard(
            String((readingBlock && readingBlock.title) || "Team Details"),
            [String((readingBlock && readingBlock.body) || "")],
            team,
          ),
        );
      });

      if (
        Array.isArray(profileContent.history) &&
        profileContent.history.length > 0
      ) {
        teamCard.appendChild(
          createParagraphCard("History", profileContent.history, team),
        );
      }

      if (
        Array.isArray(profileContent.teamMembers) &&
        profileContent.teamMembers.length > 0
      ) {
        teamCard.appendChild(
          createParagraphCard(
            "Team Structure",
            profileContent.teamMembers,
            team,
          ),
        );
      }

      if (
        profileContent.featuredCircuit &&
        Array.isArray(profileContent.featuredCircuit.paragraphs)
      ) {
        teamCard.appendChild(
          createParagraphCard(
            "Featured Circuit: " +
              String(profileContent.featuredCircuit.name || ""),
            profileContent.featuredCircuit.paragraphs,
            team,
          ),
        );
      }

      if (latestSeasonPayload.payload && latestSeasonPayload.payload.summary) {
        teamCard.appendChild(
          createSummaryCard(
            latestSeasonPayload.payload.summary,
            latestSeasonPayload.seasonKey,
            team,
          ),
        );
      }

      if (teamDrivers.length > 0) {
        const driverSection = createTeamSection("Drivers", "team-driver-list");

        teamDrivers.forEach(function appendDriver(driver) {
          driverSection.container.appendChild(
            createTeamSiteDriverCard(driver, team),
          );
        });

        teamCard.appendChild(driverSection.section);
      }

      if (teamCars.length > 0) {
        const carSection = createTeamSection("Cars", "team-car-list");

        teamCars.forEach(function appendCar(car) {
          carSection.container.appendChild(createCarCard(car, team));
        });

        teamCard.appendChild(carSection.section);
      }

      if (Array.isArray(gamesPayload.games) && gamesPayload.games.length > 0) {
        const raceSection = createTeamSection("Races", "race-feed");

        gamesPayload.games.forEach(function appendRace(game) {
          raceSection.container.appendChild(createTeamRaceCard(team, game));
        });

        teamCard.appendChild(raceSection.section);
      }

      applyFavoriteTeamHighlights(teamCard);
      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load this team info.";
    });
}

function loadTeamPlayersPage() {
  const teamSlug = getQueryValue("team");
  const status = document.getElementById("teamPlayersStatus");
  const title = document.getElementById("teamPlayersTitle");
  const list = document.getElementById("teamPlayersList");

  if (!status || !title || !list) {
    return;
  }

  if (!teamSlug) {
    status.textContent = "Open a team from the Teams page to load its drivers.";
    return;
  }

  Promise.all([
    fetchJson("/api/teams/" + encodeURIComponent(teamSlug)),
    fetchJson("/api/teams/" + encodeURIComponent(teamSlug) + "/players"),
  ])
    .then(function renderPlayers(values) {
      const team = values[0];
      const players = values[1];

      clearNode(list);
      renderTeamSectionNavigation(team.slug, "team-players");
      title.textContent = team.name + " Drivers";

      players.forEach(function appendPlayer(player) {
        list.appendChild(createPlayerCard(player));
      });

      applyFavoriteTeamHighlights(list);
      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load this team.";
    });
}

function loadTeamGamesPage() {
  const teamSlug = getQueryValue("team");
  const status = document.getElementById("teamGamesStatus");
  const title = document.getElementById("teamGamesTitle");
  const list = document.getElementById("teamGamesList");

  if (!status || !title || !list) {
    return;
  }

  if (!teamSlug) {
    status.textContent = "Open a team from the Teams page to load its races.";
    return;
  }

  Promise.all([
    fetchJson("/api/teams/" + encodeURIComponent(teamSlug)),
    fetchJson("/api/teams/" + encodeURIComponent(teamSlug) + "/games"),
  ])
    .then(function renderGames(values) {
      const team = values[0];
      const gamesPayload = values[1];

      clearNode(list);
      renderTeamSectionNavigation(team.slug, "team-games");
      title.textContent = team.name + " Races";

      if (
        !Array.isArray(gamesPayload.games) ||
        gamesPayload.games.length === 0
      ) {
        status.textContent = "No races are available for this team.";
        return;
      }

      gamesPayload.games.forEach(function appendGame(game) {
        list.appendChild(createTeamRaceCard(team, game));
      });

      applyFavoriteTeamHighlights(list);
      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load this team.";
    });
}

function loadPlayerProfilePage() {
  const playerId = getQueryValue("id");
  const intro = document.getElementById("playerProfileIntro");
  const status = document.getElementById("playerProfileStatus");
  const profileCard = document.getElementById("playerProfileCard");

  if (!status || !profileCard || !intro) {
    return;
  }

  if (!playerId) {
    status.textContent =
      "Open a driver from the Drivers page to load a profile.";
    return;
  }

  fetchJson("/api/players/" + encodeURIComponent(playerId))
    .then(function renderPlayer(player) {
      const section = document.createElement("section");
      const row = document.createElement("div");
      const meta = document.createElement("div");
      const title = document.createElement("h2");
      const teamLine = document.createElement("p");
      const teamLink = document.createElement("a");
      const firstNameLine = document.createElement("p");
      const lastNameLine = document.createElement("p");
      const birthLine = document.createElement("p");
      const roleLine = document.createElement("p");
      const numberLine = document.createElement("p");

      clearNode(intro);
      clearNode(profileCard);

      section.className = "driver-card";
      section.dataset.teamId =
        player.teamId === null || player.teamId === undefined ?
          ""
        : String(player.teamId);
      section.dataset.teamSlug = player.teamSlug || "";
      row.className = "driver-card__row";
      meta.className = "driver-meta";
      title.textContent = player.fullName;
      teamLine.textContent = "Team: ";
      teamLink.href = getTeamPageUrl(player.teamSlug || player.teamId || "");
      teamLink.textContent = player.teamName || "Unknown";
      teamLine.appendChild(teamLink);
      firstNameLine.textContent = "First name: " + (player.firstName || "");
      lastNameLine.textContent = "Last name: " + (player.lastName || "");
      birthLine.textContent =
        "Age or date of birth: " + (player.ageOrDob || "");
      roleLine.textContent = "Role: " + (player.position || "");
      numberLine.textContent =
        "Number: " +
        (player.number === null || player.number === undefined ?
          "-"
        : player.number);

      {
        const summaryParagraph = document.createElement("p");
        summaryParagraph.textContent =
          player.fullName +
          " races for " +
          (player.teamName || "their current team") +
          " as " +
          (player.position || "driver").toLowerCase() +
          ". This page collects the core personal and sporting details stored for that profile in the site database.";
        intro.appendChild(summaryParagraph);
      }

      row.appendChild(createTile(player.photo, player.fullName));
      meta.appendChild(teamLine);
      meta.appendChild(firstNameLine);
      meta.appendChild(lastNameLine);
      meta.appendChild(birthLine);
      meta.appendChild(roleLine);
      meta.appendChild(numberLine);
      row.appendChild(meta);
      section.appendChild(title);
      section.appendChild(row);
      profileCard.appendChild(section);

      applyFavoriteTeamHighlights(profileCard);
      status.textContent = "";
    })
    .catch(function handleError() {
      clearNode(intro);
      status.textContent = "Could not load this driver.";
    });
}

function loadLeagueInfoPage() {
  const status = document.getElementById("leagueInfoStatus");
  const intro = document.getElementById("leagueInfoIntro");
  const sectionsContainer = document.getElementById("leagueInfoSections");

  if (!status || !intro || !sectionsContainer) {
    return;
  }

  fetchJson("/api/root/league-info")
    .then(function renderLeagueInfo(leagueInfo) {
      clearNode(intro);
      clearNode(sectionsContainer);

      if (
        Array.isArray(leagueInfo.introParagraphs) &&
        leagueInfo.introParagraphs.length > 0
      ) {
        leagueInfo.introParagraphs.forEach(
          function appendIntroParagraph(paragraphText) {
            const paragraph = document.createElement("p");
            paragraph.textContent = paragraphText || "";
            intro.appendChild(paragraph);
          },
        );
      } else {
        intro.textContent = leagueInfo.intro || "";
      }

      (leagueInfo.sections || []).forEach(function appendSection(sectionData) {
        const section = document.createElement("section");
        const heading = document.createElement("h2");

        if (sectionData.id) {
          section.id = sectionData.id;
        }

        heading.textContent = sectionData.title || "";
        section.appendChild(heading);

        if (
          Array.isArray(sectionData.paragraphs) &&
          sectionData.paragraphs.length > 0
        ) {
          sectionData.paragraphs.forEach(
            function appendParagraph(paragraphText) {
              const paragraph = document.createElement("p");
              paragraph.textContent = paragraphText || "";
              section.appendChild(paragraph);
            },
          );
        } else {
          const paragraph = document.createElement("p");
          paragraph.textContent = sectionData.body || "";
          section.appendChild(paragraph);
        }

        sectionsContainer.appendChild(section);
      });

      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load league information.";
    });
}

function loadLatestScoresPage() {
  const status = document.getElementById("latestScoresPageStatus");
  const list = document.getElementById("latestScoresPageList");

  if (!status || !list) {
    return;
  }

  fetchJson("/api/root/latest-scores")
    .then(function renderLatestScores(latestRaces) {
      clearNode(list);

      if (!Array.isArray(latestRaces) || latestRaces.length === 0) {
        status.textContent = "No completed races available yet.";
        return;
      }

      latestRaces.forEach(function appendRace(race) {
        const card = createRaceFeedCard(
          "Round " + String(race.roundNumber) + " - " + String(race.name),
          String(race.circuitName) + " | " + formatRaceDate(race.scheduledAt),
        );
        const resultList = document.createElement("ul");

        resultList.className = "race-feed__results";

        race.results.forEach(function appendResult(result) {
          const item = document.createElement("li");
          const playerLink = document.createElement("a");
          const teamLink = document.createElement("a");

          playerLink.href =
            "playerprofile.html?id=" + encodeURIComponent(result.playerId);
          playerLink.textContent =
            String(result.finishPosition) + ". " + String(result.name);
          teamLink.href = getTeamPageUrl(
            result.teamSlug || result.teamId || "",
          );
          teamLink.textContent = String(result.team);
          teamLink.dataset.teamId =
            result.teamId === null || result.teamId === undefined ?
              ""
            : String(result.teamId);
          teamLink.dataset.teamSlug = result.teamSlug || "";
          item.appendChild(playerLink);
          item.appendChild(document.createTextNode(" ("));
          item.appendChild(teamLink);
          item.appendChild(
            document.createTextNode(") - " + String(result.points) + " pts"),
          );

          if (result.resultTime) {
            item.appendChild(
              document.createTextNode(" - " + String(result.resultTime)),
            );
          }

          resultList.appendChild(item);
        });

        card.appendChild(resultList);
        list.appendChild(card);
      });

      applyFavoriteTeamHighlights(list);
      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load latest scores.";
    });
}

function loadUpcomingRacesPage() {
  const status = document.getElementById("upcomingGamesPageStatus");
  const list = document.getElementById("upcomingGamesPageList");

  if (!status || !list) {
    return;
  }

  fetchJson("/api/root/upcoming-races")
    .then(function renderUpcomingRaces(upcomingRaces) {
      clearNode(list);

      if (!Array.isArray(upcomingRaces) || upcomingRaces.length === 0) {
        status.textContent = "No upcoming races remain.";
        return;
      }

      upcomingRaces.forEach(function appendRace(race) {
        list.appendChild(
          createRaceFeedCard(
            "Round " + String(race.roundNumber) + " - " + String(race.name),
            String(race.circuitName) + " | " + formatRaceDate(race.scheduledAt),
          ),
        );
      });

      status.textContent = "";
    })
    .catch(function handleError() {
      status.textContent = "Could not load upcoming games.";
    });
}

function startPage() {
  const page = document.body.dataset.page || "";

  makeMainLogoClickable();
  loadSessionNavigation();

  if (page === "teams") {
    loadTeamsPage();
    return;
  }

  if (page === "players") {
    loadPlayersPage();
    return;
  }

  if (page === "team-profile") {
    loadTeamProfilePage();
    return;
  }

  if (page === "team-players") {
    loadTeamPlayersPage();
    return;
  }

  if (page === "team-games") {
    loadTeamGamesPage();
    return;
  }

  if (page === "league-info") {
    loadLeagueInfoPage();
    return;
  }

  if (page === "latest-scores") {
    loadLatestScoresPage();
    return;
  }

  if (page === "upcoming-games") {
    loadUpcomingRacesPage();
    return;
  }

  if (page === "player-profile") {
    loadPlayerProfilePage();
  }
}

startPage();
