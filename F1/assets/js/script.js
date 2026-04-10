/* Purpose: Provides the client-side behavior for the main F1 site pages. */

let currentSiteSession = null;

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

function requestJson(url, options) {
  return fetch(
    buildAppUrl(url),
    Object.assign({ credentials: "same-origin" }, options || {}),
  ).then(async function handleResponse(response) {
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload && payload.message ? payload.message : "Request failed.",
      );
    }

    return payload;
  });
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function getTeamPageUrl(teamSlugOrId) {
  const teamValue = String(teamSlugOrId || "").trim();

  if (teamValue && !/^\d+$/.test(teamValue)) {
    return "Team_Sites/" + encodeURIComponent(teamValue) + "/index.html";
  }

  return "teamprofile.html?team=" + encodeURIComponent(teamValue);
}

function resetSelectWithPlaceholder(selectNode, placeholderText) {
  clearNode(selectNode);

  {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = placeholderText;
    selectNode.appendChild(option);
  }
}

function createTile(imagePath, altText) {
  const tile = document.createElement("div");
  const image = document.createElement("img");

  tile.className = "driver-tile";
  image.src = imagePath || "assets/images/F1Logo.png";
  image.alt = altText || "";
  tile.appendChild(image);

  return tile;
}

function formatRaceDate(dateValue) {
  if (!dateValue) {
    return "Date to be confirmed";
  }

  {
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
}

function getFavoriteTeamId() {
  const numericValue = Number(
    currentSiteSession && currentSiteSession.favoriteTeamId,
  );

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

function applyFavoriteTeamHighlighting() {
  document
    .querySelectorAll("[data-team-id], [data-team-slug]")
    .forEach(function toggle(node) {
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
  const logInBox = document.getElementById("logInBox");
  const logOutBox = document.getElementById("logOutBox");
  let banner = document.getElementById("sessionBanner");

  if (!header || logInBox || logOutBox) {
    if (banner) {
      banner.remove();
    }
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

function syncProfileForm(session) {
  const firstNameInput = document.getElementById("profileFirstName");
  const lastNameInput = document.getElementById("profileLastName");
  const emailInput = document.getElementById("profileEmail");
  const favoriteTeamSelect = document.getElementById("profileFavoriteTeamId");
  const passwordInput = document.getElementById("profilePassword");
  const passwordConfirmInput = document.getElementById(
    "profilePasswordConfirm",
  );
  const errorDisplay = document.getElementById("profile-error-message");

  if (!firstNameInput || !lastNameInput || !emailInput || !favoriteTeamSelect) {
    return;
  }

  if (!session || !session.authenticated) {
    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";
    favoriteTeamSelect.value = "";

    if (passwordInput) {
      passwordInput.value = "";
    }
    if (passwordConfirmInput) {
      passwordConfirmInput.value = "";
    }
    if (errorDisplay) {
      errorDisplay.style.display = "none";
    }
    return;
  }

  firstNameInput.value = session.firstName || "";
  lastNameInput.value = session.lastName || "";
  emailInput.value = session.email || "";
  favoriteTeamSelect.value =
    session.favoriteTeamId ? String(session.favoriteTeamId) : "";

  if (passwordInput) {
    passwordInput.value = "";
  }
  if (passwordConfirmInput) {
    passwordConfirmInput.value = "";
  }
  if (errorDisplay) {
    errorDisplay.style.display = "none";
  }
}

function setLoggedInState(session) {
  const logInBox = document.getElementById("logInBox");
  const logOutBox = document.getElementById("logOutBox");
  const userDisplayName = document.getElementById("userDisplayName");
  const adminHomeLink = document.getElementById("adminHomeLink");
  const errorDisplay = document.getElementById("error-message");

  currentSiteSession = session && session.authenticated ? session : null;

  upsertAdminNavLink(currentSiteSession);
  renderSessionBanner(currentSiteSession);

  if (!logInBox || !logOutBox || !userDisplayName) {
    applyFavoriteTeamHighlighting();
    return;
  }

  if (!currentSiteSession) {
    logInBox.style.display = "block";
    logOutBox.style.display = "none";

    if (adminHomeLink) {
      adminHomeLink.textContent = "";
    }
    if (errorDisplay) {
      errorDisplay.style.display = "none";
    }
    syncProfileForm(null);
    applyFavoriteTeamHighlighting();
    return;
  }

  logInBox.style.display = "none";
  logOutBox.style.display = "block";
  userDisplayName.textContent = currentSiteSession.user;

  if (adminHomeLink) {
    clearNode(adminHomeLink);

    if (currentSiteSession.isAdmin) {
      {
        const adminLink = document.createElement("a");
        adminLink.href = "admin.html";
        adminLink.textContent = "Open admin dashboard";
        adminHomeLink.appendChild(adminLink);
      }
    }
  }

  syncProfileForm(currentSiteSession);
  applyFavoriteTeamHighlighting();
}

function loadCurrentSession() {
  requestJson("/api/session")
    .then(function handleSession(session) {
      setLoggedInState(session);
    })
    .catch(function handleError() {
      setLoggedInState(null);
    });
}

function populateFavoriteTeamSelects() {
  const registerSelect = document.getElementById("registerFavoriteTeamId");
  const profileSelect = document.getElementById("profileFavoriteTeamId");

  if (!registerSelect && !profileSelect) {
    return;
  }

  requestJson("/api/teams")
    .then(function handleTeams(teams) {
      if (registerSelect) {
        resetSelectWithPlaceholder(registerSelect, "Select favorite team");
      }
      if (profileSelect) {
        resetSelectWithPlaceholder(profileSelect, "Select favorite team");
      }

      teams.forEach(function appendTeam(team) {
        if (registerSelect) {
          const registerOption = document.createElement("option");
          registerOption.value = String(team.id);
          registerOption.textContent = team.name;
          registerSelect.appendChild(registerOption);
        }

        if (profileSelect) {
          const profileOption = document.createElement("option");
          profileOption.value = String(team.id);
          profileOption.textContent = team.name;
          profileSelect.appendChild(profileOption);
        }
      });

      syncProfileForm(currentSiteSession);
    })
    .catch(function handleError() {
      if (registerSelect) {
        resetSelectWithPlaceholder(registerSelect, "Could not load teams");
      }
      if (profileSelect) {
        resetSelectWithPlaceholder(profileSelect, "Could not load teams");
      }
    });
}

function bindLoginForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const profileForm = document.getElementById("profileForm");
  const logoutButton = document.getElementById("logoutButton");

  if (loginForm) {
    loginForm.addEventListener("submit", function handleLogin(event) {
      const errorDisplay = document.getElementById("error-message");
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      event.preventDefault();

      if (password.length < 6) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Password too short!";
        return;
      }

      requestJson("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      })
        .then(function handleLoginResponse(payload) {
          if (!payload.success) {
            errorDisplay.style.display = "block";
            errorDisplay.textContent = payload.message;
            return;
          }

          setLoggedInState(Object.assign({ authenticated: true }, payload));
        })
        .catch(function handleLoginError(error) {
          errorDisplay.style.display = "block";
          errorDisplay.textContent = error.message;
        });
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function handleRegister(event) {
      const errorDisplay = document.getElementById("register-error-message");
      const firstName = document.getElementById("registerFirstName").value;
      const lastName = document.getElementById("registerLastName").value;
      const email = document.getElementById("registerEmail").value;
      const favoriteTeamId = document.getElementById(
        "registerFavoriteTeamId",
      ).value;
      const password = document.getElementById("registerPassword").value;
      const passwordConfirm = document.getElementById(
        "registerPasswordConfirm",
      ).value;

      event.preventDefault();

      if (password.length < 6) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Password too short!";
        return;
      }

      if (password !== passwordConfirm) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Passwords do not match.";
        return;
      }

      requestJson("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          favoriteTeamId: favoriteTeamId,
          password: password,
        }),
      })
        .then(function handleRegisterResponse(payload) {
          if (!payload.success) {
            errorDisplay.style.display = "block";
            errorDisplay.textContent = payload.message;
            return;
          }

          errorDisplay.style.display = "none";
          registerForm.reset();
          setLoggedInState(Object.assign({ authenticated: true }, payload));
        })
        .catch(function handleRegisterError(error) {
          errorDisplay.style.display = "block";
          errorDisplay.textContent = error.message;
        });
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", function handleProfileSave(event) {
      const errorDisplay = document.getElementById("profile-error-message");
      const firstName = document.getElementById("profileFirstName").value;
      const lastName = document.getElementById("profileLastName").value;
      const email = document.getElementById("profileEmail").value;
      const favoriteTeamId = document.getElementById(
        "profileFavoriteTeamId",
      ).value;
      const password = document.getElementById("profilePassword").value;
      const passwordConfirm = document.getElementById(
        "profilePasswordConfirm",
      ).value;

      event.preventDefault();

      if (password && password.length < 6) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Password too short!";
        return;
      }

      if (password !== passwordConfirm) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Passwords do not match.";
        return;
      }

      requestJson("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          favoriteTeamId: favoriteTeamId,
          password: password,
        }),
      })
        .then(function handleProfileResponse(payload) {
          if (!payload.success) {
            errorDisplay.style.display = "block";
            errorDisplay.textContent = payload.message;
            return;
          }

          errorDisplay.style.display = "none";
          setLoggedInState(Object.assign({ authenticated: true }, payload));
        })
        .catch(function handleProfileError(error) {
          errorDisplay.style.display = "block";
          errorDisplay.textContent = error.message;
        });
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", function handleLogout() {
      requestJson("/logout", { method: "POST" })
        .then(function handleLogoutResponse() {
          setLoggedInState(null);

          if (loginForm) {
            loginForm.reset();
          }
        })
        .catch(function handleLogoutError() {});
    });
  }
}

function renderLeaderboard() {
  const leaderBody = document.getElementById("leaderboard-body");

  if (!leaderBody) {
    return;
  }

  requestJson("/api/root/leaderboard")
    .then(function handleLeaderboardRows(rows) {
      clearNode(leaderBody);

      rows.forEach(function appendRow(rowData) {
        const row = document.createElement("tr");
        const rankCell = document.createElement("td");
        const teamCell = document.createElement("td");
        const teamLink = document.createElement("a");
        const winsCell = document.createElement("td");
        const podiumsCell = document.createElement("td");
        const pointsCell = document.createElement("td");

        row.dataset.teamId =
          rowData.teamId === null || rowData.teamId === undefined ?
            ""
          : String(rowData.teamId);
        row.dataset.teamSlug = rowData.teamSlug || "";
        rankCell.textContent = String(rowData.rank);
        teamLink.href = getTeamPageUrl(
          rowData.teamSlug || rowData.teamId || "",
        );
        teamLink.textContent = rowData.team;
        teamCell.style.textAlign = "left";
        teamCell.appendChild(teamLink);
        winsCell.textContent = String(rowData.wins);
        winsCell.style.textAlign = "center";
        podiumsCell.textContent = String(rowData.podiums);
        podiumsCell.style.textAlign = "center";
        pointsCell.textContent = String(rowData.points);
        pointsCell.style.textAlign = "right";

        row.appendChild(rankCell);
        row.appendChild(teamCell);
        row.appendChild(winsCell);
        row.appendChild(podiumsCell);
        row.appendChild(pointsCell);
        leaderBody.appendChild(row);
      });

      applyFavoriteTeamHighlighting();
    })
    .catch(function handleLeaderboardError(error) {
      console.error(error);
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

function renderLatestScores() {
  const latestScoresList = document.getElementById("latestScoresList");
  const latestScoresStatus = document.getElementById("latestScoresStatus");

  if (!latestScoresList || !latestScoresStatus) {
    return;
  }

  requestJson("/api/root/latest-scores")
    .then(function handleLatestScores(races) {
      clearNode(latestScoresList);

      if (!Array.isArray(races) || races.length === 0) {
        latestScoresStatus.textContent = "No completed races available yet.";
        return;
      }

      latestScoresStatus.textContent = "";

      races.forEach(function appendRace(race) {
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
        latestScoresList.appendChild(card);
      });

      applyFavoriteTeamHighlighting();
    })
    .catch(function handleLatestScoresError() {
      latestScoresStatus.textContent = "Could not load latest scores.";
    });
}

function renderUpcomingRaces() {
  const upcomingRacesList = document.getElementById("upcomingRacesList");
  const upcomingRacesStatus = document.getElementById("upcomingRacesStatus");

  if (!upcomingRacesList || !upcomingRacesStatus) {
    return;
  }

  requestJson("/api/root/upcoming-races")
    .then(function handleUpcomingRaces(races) {
      clearNode(upcomingRacesList);

      if (!Array.isArray(races) || races.length === 0) {
        upcomingRacesStatus.textContent = "No upcoming races remain.";
        return;
      }

      upcomingRacesStatus.textContent = "";

      races.forEach(function appendRace(race) {
        upcomingRacesList.appendChild(
          createRaceFeedCard(
            "Round " + String(race.roundNumber) + " - " + String(race.name),
            String(race.circuitName) + " | " + formatRaceDate(race.scheduledAt),
          ),
        );
      });
    })
    .catch(function handleUpcomingRacesError() {
      upcomingRacesStatus.textContent = "Could not load upcoming races.";
    });
}

function renderGroupMembers() {
  const status = document.getElementById("groupMembersStatus");
  const container = document.getElementById("playerContainer");

  if (!status || !container) {
    return;
  }

  requestJson("/api/root/group-members")
    .then(function handleMembers(members) {
      clearNode(container);

      if (!Array.isArray(members) || members.length === 0) {
        status.textContent = "No group members available.";
        return;
      }

      members.forEach(function appendMember(member) {
        const article = document.createElement("article");
        const title = document.createElement("h2");
        const row = document.createElement("div");
        const meta = document.createElement("div");
        const age = document.createElement("p");
        const major = document.createElement("p");
        const email = document.createElement("p");
        const emailLink = document.createElement("a");
        const hobbies = document.createElement("p");
        const coursesTitle = document.createElement("p");
        const coursesList = document.createElement("ul");

        article.className = "driver-card";
        row.className = "driver-card__row";
        meta.className = "driver-meta";
        title.textContent =
          String(member.firstName || "") + " " + String(member.lastName || "");
        age.textContent = "Age: " + String(member.age || "-");
        major.textContent = "Major: " + String(member.major || "Unknown");
        email.textContent = "Email: ";
        emailLink.href = "mailto:" + String(member.email || "");
        emailLink.textContent = String(member.email || "");
        email.appendChild(emailLink);
        hobbies.textContent =
          "Hobbies: " +
          (Array.isArray(member.hobbies) && member.hobbies.length > 0 ?
            member.hobbies.join(", ")
          : "-");
        coursesTitle.textContent = "Courses:";

        (Array.isArray(member.courses) ? member.courses : []).forEach(
          function appendCourse(course) {
            const item = document.createElement("li");
            const heading = document.createElement("p");
            const description = document.createElement("p");
            const teacher = course && course.teacher ? course.teacher : {};

            heading.textContent =
              String(course && course.title ? course.title : "") +
              (teacher.firstName || teacher.lastName ?
                " - " +
                String(teacher.firstName || "") +
                " " +
                String(teacher.lastName || "")
              : "");
            description.textContent = String(
              (course && course.description) || "",
            );
            item.appendChild(heading);
            item.appendChild(description);
            coursesList.appendChild(item);
          },
        );

        row.appendChild(createTile(member.photo, title.textContent));
        meta.appendChild(age);
        meta.appendChild(major);
        meta.appendChild(email);
        meta.appendChild(hobbies);
        meta.appendChild(coursesTitle);
        meta.appendChild(coursesList);
        row.appendChild(meta);
        article.appendChild(title);
        article.appendChild(row);
        container.appendChild(article);
      });

      status.textContent = "";
    })
    .catch(function handleGroupMembersError() {
      status.textContent = "Could not load group members.";
    });
}

function makeMainLogoClickable() {
  const logo = document.getElementById("Formula1");

  if (!logo) {
    return;
  }

  logo.style.cursor = "pointer";
  logo.addEventListener("click", function handleLogoClick() {
    window.location.href = "index.html";
  });
}

function startPage() {
  makeMainLogoClickable();
  bindLoginForms();
  loadCurrentSession();
  populateFavoriteTeamSelects();
  renderLeaderboard();
  renderLatestScores();
  renderUpcomingRaces();
  renderGroupMembers();
}

startPage();
