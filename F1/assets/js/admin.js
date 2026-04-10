/* Purpose: Makes the public-facing admin page editable for race scores and player team changes while reusing the site's shared layout. */

const dashboardState = {
  dashboard: null,
  session: null,
  selectedUpcomingRaceId: null,
  selectedCompletedRaceId: null,
};

function getAppBasePath() {
  const matchingScript = Array.from(document.scripts || []).find(
    function findScript(scriptNode) {
      return /\/assets\/js\/(main-pages|script|admin)\.js(?:\?|$)/.test(
        String((scriptNode && scriptNode.src) || ""),
      );
    },
  );

  if (!matchingScript || !matchingScript.src) {
    return "";
  }

  return new URL(matchingScript.src, window.location.href).pathname.replace(
    /\/assets\/js\/[^/]+$/,
    "",
  );
}

function buildAppUrl(pathValue) {
  const normalizedPath = String(pathValue || "");

  if (!normalizedPath.startsWith("/")) {
    return normalizedPath;
  }

  return getAppBasePath() + normalizedPath;
}

function resolveAssetUrl(pathValue) {
  const normalizedPath = String(pathValue || "");

  if (!normalizedPath) {
    return normalizedPath;
  }

  if (/^(https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith("data:")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/")) {
    return buildAppUrl(normalizedPath);
  }

  return normalizedPath;
}

function fetchJson(url, options) {
  return fetch(
    buildAppUrl(url),
    Object.assign({ credentials: "same-origin" }, options || {}),
  ).then(async function handleResponse(response) {
    let payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(
        payload && payload.message ? payload.message : "Request failed.",
      );
    }

    return payload;
  });
}

function clearNodeContent(node) {
  if (!node) {
    return;
  }

  if (typeof clearNode === "function") {
    clearNode(node);
    return;
  }

  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function createSharedTile(imagePath, altText) {
  if (typeof createTile === "function") {
    return createTile(imagePath, altText);
  }

  const tile = document.createElement("div");
  const image = document.createElement("img");

  tile.className = "driver-tile";
  image.src = resolveAssetUrl(imagePath || "assets/images/F1Logo.png");
  image.alt = altText;
  tile.appendChild(image);
  return tile;
}

function setFeedback(message, isError) {
  const feedbackNode = document.getElementById("adminFeedback");

  if (!feedbackNode) {
    return;
  }

  feedbackNode.textContent = message || "";
  feedbackNode.classList.toggle("admin-feedback--error", Boolean(isError));
}

function calculatePoints(finishPosition) {
  const numericPosition = Number(finishPosition);

  if (numericPosition === 1) {
    return 25;
  }
  if (numericPosition === 2) {
    return 18;
  }
  if (numericPosition === 3) {
    return 15;
  }
  if (numericPosition === 4) {
    return 12;
  }
  if (numericPosition === 5) {
    return 10;
  }
  if (numericPosition === 6) {
    return 8;
  }
  if (numericPosition === 7) {
    return 6;
  }
  if (numericPosition === 8) {
    return 4;
  }
  if (numericPosition === 9) {
    return 2;
  }
  if (numericPosition === 10) {
    return 1;
  }

  return 0;
}

function clearSelectOptions(selectNode) {
  while (selectNode.firstChild) {
    selectNode.removeChild(selectNode.firstChild);
  }
}

function appendSelectOption(selectNode, value, label, isSelected) {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = label;

  if (isSelected) {
    option.selected = true;
  }

  selectNode.appendChild(option);
}

function populateTeamSelect(
  selectNode,
  teams,
  selectedValue,
  includeNoneLabel,
) {
  clearSelectOptions(selectNode);

  if (includeNoneLabel) {
    appendSelectOption(
      selectNode,
      "",
      includeNoneLabel,
      String(selectedValue || "") === "",
    );
  }

  teams.forEach(function addTeamOption(team) {
    appendSelectOption(
      selectNode,
      String(team.id),
      team.name,
      String(team.id) === String(selectedValue),
    );
  });
}

function populatePlayerSelect(
  selectNode,
  players,
  selectedValue,
  onlyAssignedPlayers,
  emptyLabel,
) {
  const filteredPlayers = players.filter(function filterPlayers(player) {
    return onlyAssignedPlayers ? Boolean(player.teamId) : true;
  });

  clearSelectOptions(selectNode);

  if (filteredPlayers.length === 0) {
    appendSelectOption(selectNode, "", emptyLabel, true);
    return;
  }

  filteredPlayers.forEach(function addPlayerOption(player) {
    appendSelectOption(
      selectNode,
      String(player.id),
      player.fullName +
        (player.teamName ? " - " + player.teamName : " - Unassigned"),
      String(player.id) === String(selectedValue),
    );
  });
}

function getRacesByStatus(status) {
  const dashboard = dashboardState.dashboard;

  if (!dashboard || !Array.isArray(dashboard.races)) {
    return [];
  }

  return dashboard.races.filter(function filterRace(race) {
    return race.status === status;
  });
}

function getRaceById(raceId) {
  const dashboard = dashboardState.dashboard;

  if (!dashboard || !Array.isArray(dashboard.races)) {
    return null;
  }

  return (
    dashboard.races.find(function findRace(race) {
      return String(race.id) === String(raceId);
    }) || null
  );
}

function renderSessionSummary() {
  const sessionText = document.getElementById("adminSessionText");

  if (!sessionText || !dashboardState.session) {
    return;
  }

  sessionText.textContent =
    "Signed in as " +
    dashboardState.session.user +
    " (" +
    dashboardState.session.email +
    ").";
}

function renderRaceSelect(selectId, races, selectedRaceId, emptyLabel) {
  const raceSelect = document.getElementById(selectId);

  if (!raceSelect) {
    return selectedRaceId;
  }

  clearSelectOptions(raceSelect);

  if (!races.length) {
    const emptyOption = document.createElement("option");

    emptyOption.value = "";
    emptyOption.textContent = emptyLabel;
    raceSelect.appendChild(emptyOption);
    raceSelect.disabled = true;
    return null;
  }

  raceSelect.disabled = false;

  races.forEach(function appendRaceOption(race) {
    const option = document.createElement("option");

    option.value = String(race.id);
    option.textContent =
      "Round " + String(race.roundNumber) + " - " + race.name;
    raceSelect.appendChild(option);
  });

  if (
    selectedRaceId &&
    races.some(function hasRace(race) {
      return String(race.id) === String(selectedRaceId);
    })
  ) {
    raceSelect.value = String(selectedRaceId);
    return selectedRaceId;
  }

  raceSelect.value = String(races[0].id);
  return races[0].id;
}

function buildRaceSummary(race, emptyHint) {
  if (!race) {
    return emptyHint;
  }

  return (
    race.name +
    " on " +
    race.circuitName +
    " is currently marked " +
    race.status +
    "."
  );
}

function renderRaceEditor(summaryId, resultsBodyId, raceId, emptyHint) {
  const raceSummary = document.getElementById(summaryId);
  const raceResultsBody = document.getElementById(resultsBodyId);
  const race = getRaceById(raceId);

  if (!raceSummary || !raceResultsBody) {
    return;
  }

  clearNodeContent(raceResultsBody);
  raceSummary.textContent = buildRaceSummary(race, emptyHint);

  if (!race) {
    return;
  }

  race.results.forEach(function appendResultRow(result) {
    const row = document.createElement("tr");
    const driverCell = document.createElement("td");
    const teamCell = document.createElement("td");
    const positionCell = document.createElement("td");
    const timeCell = document.createElement("td");
    const pointsCell = document.createElement("td");
    const positionInput = document.createElement("input");
    const timeInput = document.createElement("input");

    row.dataset.playerId = String(result.playerId);
    driverCell.textContent =
      result.fullName +
      (result.number ? " (#" + String(result.number) + ")" : "");
    teamCell.textContent = result.teamName;
    positionInput.type = "number";
    positionInput.min = "1";
    positionInput.value =
      result.finishPosition === null ? "" : String(result.finishPosition);
    positionInput.className = "admin-input";
    timeInput.type = "text";
    timeInput.value = result.resultTime || "";
    timeInput.className = "admin-input";
    pointsCell.textContent = String(result.points || 0);

    positionInput.addEventListener("input", function handlePositionInput() {
      pointsCell.textContent = String(calculatePoints(positionInput.value));
    });

    positionCell.appendChild(positionInput);
    timeCell.appendChild(timeInput);
    row.appendChild(driverCell);
    row.appendChild(teamCell);
    row.appendChild(positionCell);
    row.appendChild(timeCell);
    row.appendChild(pointsCell);
    raceResultsBody.appendChild(row);
  });
}

function renderCreatePlayerForm() {
  const teamSelect = document.getElementById("createTeamId");
  const dashboard = dashboardState.dashboard;

  if (!teamSelect || !dashboard) {
    return;
  }

  populateTeamSelect(
    teamSelect,
    dashboard.teams,
    dashboard.teams[0] && dashboard.teams[0].id,
    "",
  );
}

function renderPlayerAssignmentForms() {
  const dashboard = dashboardState.dashboard;
  const assignPlayerSelect = document.getElementById("assignPlayerId");
  const assignTeamSelect = document.getElementById("assignTeamId");
  const removePlayerSelect = document.getElementById("removePlayerId");
  const assignPlayerForm = document.getElementById("assignPlayerForm");
  const removePlayerForm = document.getElementById("removePlayerForm");
  const assignedPlayers =
    dashboard ?
      dashboard.players.filter(function filterAssignedPlayer(player) {
        return Boolean(player.teamId);
      })
    : [];

  if (
    !dashboard ||
    !assignPlayerSelect ||
    !assignTeamSelect ||
    !removePlayerSelect ||
    !assignPlayerForm ||
    !removePlayerForm
  ) {
    return;
  }

  populatePlayerSelect(
    assignPlayerSelect,
    dashboard.players,
    dashboard.players[0] && dashboard.players[0].id,
    false,
    "No players available",
  );
  populateTeamSelect(
    assignTeamSelect,
    dashboard.teams,
    dashboard.teams[0] && dashboard.teams[0].id,
    "",
  );
  populatePlayerSelect(
    removePlayerSelect,
    assignedPlayers,
    assignedPlayers[0] && assignedPlayers[0].id,
    false,
    "No assigned players available",
  );
  assignPlayerSelect.disabled = !dashboard.players.length;
  assignTeamSelect.disabled = !dashboard.teams.length;
  removePlayerSelect.disabled = !assignedPlayers.length;
  assignPlayerForm.querySelector('button[type="submit"]').disabled =
    !dashboard.players.length || !dashboard.teams.length;
  removePlayerForm.querySelector('button[type="submit"]').disabled =
    !assignedPlayers.length;
}

function createEditablePlayerCard(player) {
  const article = document.createElement("article");
  const title = document.createElement("h3");
  const row = document.createElement("div");
  const meta = document.createElement("div");
  const teamLine = document.createElement("p");
  const statusLine = document.createElement("p");
  const teamLabel = document.createElement("label");
  const teamSelect = document.createElement("select");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  const removeButton = document.createElement("button");

  article.className = "driver-card";
  row.className = "driver-card__row";
  meta.className = "driver-meta";
  title.textContent =
    player.fullName +
    (player.number ? " (#" + String(player.number) + ")" : "");
  teamLine.textContent = "Current team: " + (player.teamName || "Unassigned");
  statusLine.textContent =
    "Status: " + (player.isActive ? "Active" : "Inactive");
  teamLabel.textContent = "Team assignment";
  teamSelect.className = "admin-input";
  populateTeamSelect(
    teamSelect,
    dashboardState.dashboard ? dashboardState.dashboard.teams : [],
    player.teamId,
    "Unassigned",
  );
  actions.className = "admin-actions";
  saveButton.type = "button";
  saveButton.textContent = "Save";
  removeButton.type = "button";
  removeButton.textContent = "Remove";

  saveButton.addEventListener("click", function handleSaveClick() {
    setPlayerTeam(player.id, teamSelect.value || null);
  });

  removeButton.addEventListener("click", function handleRemoveClick() {
    setPlayerTeam(player.id, null);
  });

  teamLabel.appendChild(teamSelect);
  actions.appendChild(saveButton);
  actions.appendChild(removeButton);
  meta.appendChild(teamLine);
  meta.appendChild(statusLine);
  meta.appendChild(teamLabel);
  meta.appendChild(actions);
  row.appendChild(createSharedTile(player.photo, player.fullName));
  row.appendChild(meta);
  article.appendChild(title);
  article.appendChild(row);

  return article;
}

function renderPlayersCards() {
  const cardsContainer = document.getElementById("adminPlayersCards");
  const dashboard = dashboardState.dashboard;

  if (!cardsContainer || !dashboard) {
    return;
  }

  clearNodeContent(cardsContainer);

  dashboard.players.forEach(function appendPlayerCard(player) {
    cardsContainer.appendChild(createEditablePlayerCard(player));
  });
}

function renderDashboard() {
  const upcomingRaces = getRacesByStatus("upcoming");
  const completedRaces = getRacesByStatus("completed");

  renderSessionSummary();
  dashboardState.selectedUpcomingRaceId = renderRaceSelect(
    "adminUpcomingRaceSelect",
    upcomingRaces,
    dashboardState.selectedUpcomingRaceId,
    "No upcoming races available",
  );
  dashboardState.selectedCompletedRaceId = renderRaceSelect(
    "adminCompletedRaceSelect",
    completedRaces,
    dashboardState.selectedCompletedRaceId,
    "No completed races available",
  );
  renderRaceEditor(
    "adminUpcomingRaceSummary",
    "adminUpcomingRaceResults",
    dashboardState.selectedUpcomingRaceId,
    "There are no upcoming races to score right now.",
  );
  renderRaceEditor(
    "adminCompletedRaceSummary",
    "adminCompletedRaceResults",
    dashboardState.selectedCompletedRaceId,
    "There are no completed races to edit right now.",
  );
  renderCreatePlayerForm();
  renderPlayerAssignmentForms();
  renderPlayersCards();
}

function loadDashboard() {
  return fetchJson("/api/admin/dashboard")
    .then(function handleDashboard(dashboard) {
      dashboardState.dashboard = dashboard;
      renderDashboard();
    })
    .catch(function handleDashboardError(error) {
      setFeedback(error.message || "Could not load admin page.", true);
      throw error;
    });
}

function ensureAdminSession() {
  return fetchJson("/api/session")
    .then(function handleSession(session) {
      if (!session || !session.authenticated || !session.isAdmin) {
        window.location.href = "index.html";
        return null;
      }

      dashboardState.session = session;
      renderSessionSummary();
      return session;
    })
    .catch(function handleSessionError() {
      window.location.href = "index.html";
      return null;
    });
}

function saveRaceScores(raceId, resultsBodyId, pendingMessage, successMessage) {
  const raceResultsBody = document.getElementById(resultsBodyId);
  const race = getRaceById(raceId);

  if (!race || !raceResultsBody) {
    setFeedback("Pick a race before saving scores.", true);
    return;
  }

  const results = Array.from(raceResultsBody.querySelectorAll("tr")).map(
    function mapRow(row) {
      const inputs = row.querySelectorAll("input");

      return {
        playerId: Number(row.dataset.playerId),
        finishPosition: inputs[0].value,
        resultTime: inputs[1].value,
      };
    },
  );

  setFeedback(pendingMessage, false);

  fetchJson("/api/admin/races/" + encodeURIComponent(race.id) + "/scores", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results: results }),
  })
    .then(function handleSaveSuccess() {
      setFeedback(successMessage, false);
      return loadDashboard();
    })
    .catch(function handleSaveError(error) {
      setFeedback(error.message || "Could not save race scores.", true);
    });
}

function setPlayerTeam(playerId, teamId) {
  setFeedback("Saving player assignment...", false);

  fetchJson("/api/admin/players/" + encodeURIComponent(playerId) + "/team", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId: teamId }),
  })
    .then(function handleAssignmentSuccess() {
      setFeedback("Player assignment saved.", false);
      return loadDashboard();
    })
    .catch(function handleAssignmentError(error) {
      setFeedback(error.message || "Could not save player assignment.", true);
    });
}

function handleCreatePlayerSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const payload = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    dateOfBirth: form.dateOfBirth.value,
    role: form.role.value,
    number: form.number.value,
    photo: form.photo.value,
    teamId: form.teamId.value,
  };

  setFeedback("Creating player...", false);

  fetchJson("/api/admin/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(function handleCreateSuccess() {
      form.reset();
      setFeedback("Player created.", false);
      return loadDashboard();
    })
    .catch(function handleCreateError(error) {
      setFeedback(error.message || "Could not create player.", true);
    });
}

function handleAssignPlayerSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  setPlayerTeam(form.playerId.value, form.teamId.value);
}

function handleRemovePlayerSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  setPlayerTeam(form.playerId.value, null);
}

function handleLogout() {
  fetchJson("/logout", { method: "POST" })
    .then(function handleLogoutSuccess() {
      window.location.href = "index.html";
    })
    .catch(function handleLogoutError() {
      window.location.href = "index.html";
    });
}

function startAdminPage() {
  const upcomingRaceSelect = document.getElementById("adminUpcomingRaceSelect");
  const completedRaceSelect = document.getElementById(
    "adminCompletedRaceSelect",
  );
  const upcomingRaceForm = document.getElementById("upcomingRaceForm");
  const completedRaceForm = document.getElementById("completedRaceForm");
  const createPlayerForm = document.getElementById("createPlayerForm");
  const assignPlayerForm = document.getElementById("assignPlayerForm");
  const removePlayerForm = document.getElementById("removePlayerForm");
  const logoutButton = document.getElementById("adminLogoutButton");

  if (upcomingRaceSelect) {
    upcomingRaceSelect.addEventListener(
      "change",
      function handleUpcomingRaceChange() {
        dashboardState.selectedUpcomingRaceId =
          upcomingRaceSelect.value || null;
        renderRaceEditor(
          "adminUpcomingRaceSummary",
          "adminUpcomingRaceResults",
          dashboardState.selectedUpcomingRaceId,
          "There are no upcoming races to score right now.",
        );
      },
    );
  }

  if (completedRaceSelect) {
    completedRaceSelect.addEventListener(
      "change",
      function handleCompletedRaceChange() {
        dashboardState.selectedCompletedRaceId =
          completedRaceSelect.value || null;
        renderRaceEditor(
          "adminCompletedRaceSummary",
          "adminCompletedRaceResults",
          dashboardState.selectedCompletedRaceId,
          "There are no completed races to edit right now.",
        );
      },
    );
  }

  if (upcomingRaceForm) {
    upcomingRaceForm.addEventListener(
      "submit",
      function handleUpcomingRaceSubmit(event) {
        event.preventDefault();
        saveRaceScores(
          dashboardState.selectedUpcomingRaceId,
          "adminUpcomingRaceResults",
          "Saving upcoming race scores...",
          "Upcoming race scores saved.",
        );
      },
    );
  }

  if (completedRaceForm) {
    completedRaceForm.addEventListener(
      "submit",
      function handleCompletedRaceSubmit(event) {
        event.preventDefault();
        saveRaceScores(
          dashboardState.selectedCompletedRaceId,
          "adminCompletedRaceResults",
          "Saving edited race scores...",
          "Existing race scores saved.",
        );
      },
    );
  }

  if (createPlayerForm) {
    createPlayerForm.addEventListener("submit", handleCreatePlayerSubmit);
  }

  if (assignPlayerForm) {
    assignPlayerForm.addEventListener("submit", handleAssignPlayerSubmit);
  }

  if (removePlayerForm) {
    removePlayerForm.addEventListener("submit", handleRemovePlayerSubmit);
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  ensureAdminSession().then(function handleAdminReady(session) {
    if (!session) {
      return;
    }

    loadDashboard();
  });
}

startAdminPage();
