/* Purpose: Provides the client-side behavior for this team mini-site, including team info, drivers, cars, statistics, and race data. */
function getMiniSiteBasePath() {
  const currentScript = document.currentScript || Array.from(document.scripts || []).find(
    function findScript(scriptNode) {
      return /\/Team_Sites\/[^/]+\/assets\/js\/script\.js(?:\?|$)/.test(
        String((scriptNode && scriptNode.src) || ""),
      );
    },
  );

  if (!currentScript || !currentScript.src) {
    return "";
  }

  return new URL(currentScript.src, window.location.href).pathname.replace(
    /\/Team_Sites\/[^/]+\/assets\/js\/script\.js$/,
    "",
  );
}

function resolveSiteAssetUrl(pathValue) {
  const normalizedPath = String(pathValue || "");

  if (!normalizedPath) {
    return normalizedPath;
  }

  if (/^(https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith("data:")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/")) {
    return getMiniSiteBasePath() + normalizedPath;
  }

  return normalizedPath;
}
//---Classes---
class Person {
  #firstName;
  #lastName;
  #born;
  #nationality;

  constructor({
    firstName,
    lastName,
    born = "1 January 2000",
    nationality = "Unknown",
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.born = born;
    this.nationality = nationality;
  }

  get firstName() {
    return this.#firstName;
  }
  set firstName(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("First name must be a string");
    }
    this.#firstName = value.trim();
  }

  get lastName() {
    return this.#lastName;
  }
  set lastName(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Last name must be a string");
    }
    this.#lastName = value.trim();
  }

  get born() {
    return this.#born;
  }
  set born(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Born must be a string");
    }
    this.#born = value.trim();
  }

  get nationality() {
    return this.#nationality;
  }
  set nationality(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Nationality must be a string");
    }
    this.#nationality = value.trim();
  }
}
class Course {
  #title;
  #teacher;
  #description;

  constructor({ title, teacher, description }) {
    this.title = title;
    this.teacher = teacher;
    this.description = description;
  }

  get title() {
    return this.#title;
  }
  set title(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Title must be a string");
    }
    this.#title = value.trim();
  }

  get teacher() {
    return this.#teacher;
  }
  set teacher(value) {
    if (!value || typeof value !== "object") {
      throw new Error("Teacher must be an object");
    }
    this.#teacher = value;
  }

  get description() {
    return this.#description;
  }
  set description(value) {
    if (typeof value !== "string") {
      throw new Error("Description must be a string");
    }
    this.#description = value;
  }
}
class Team {
  #title;
  #country;
  #city;

  constructor({ title, country, city }) {
    this.title = title;
    this.country = country;
    this.city = city;
  }

  get title() {
    return this.#title;
  }
  set title(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Team title must be a string");
    }
    this.#title = value.trim();
  }

  get country() {
    return this.#country;
  }
  set country(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Country must be a string");
    }
    this.#country = value.trim();
  }

  get city() {
    return this.#city;
  }
  set city(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("City must be a string");
    }
    this.#city = value.trim();
  }
}
class GroupMember extends Person {
  #age;
  #email;
  #photo;
  #major;
  #hobbies;
  #courses;

  constructor({
    firstName,
    lastName,
    age,
    email,
    photo,
    major,
    hobbies = [],
    courses = [],
  }) {
    super({
      firstName,
      lastName,
      born: "1 January 2000",
      nationality: "Unknown",
    });
    this.age = age;
    this.email = email;
    this.photo = photo;
    this.major = major;
    this.hobbies = hobbies;
    this.courses = courses;
  }

  get age() {
    return this.#age;
  }
  set age(value) {
    if (!Number.isInteger(Number(value))) {
      throw new Error("Age must be a number");
    }
    this.#age = Number(value);
  }

  get email() {
    return this.#email;
  }
  set email(value) {
    if (typeof value !== "string" || !value.includes("@")) {
      throw new Error("Email must be valid");
    }
    this.#email = value;
  }

  get photo() {
    return this.#photo;
  }
  set photo(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Photo must be a string");
    }
    this.#photo = value.trim();
  }

  get major() {
    return this.#major;
  }
  set major(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Major must be a string");
    }
    this.#major = value.trim();
  }

  get hobbies() {
    return this.#hobbies;
  }
  set hobbies(value) {
    if (!Array.isArray(value)) {
      throw new Error("Hobbies must be an array");
    }
    this.#hobbies = value;
  }

  get courses() {
    return this.#courses;
  }
  set courses(value) {
    if (!Array.isArray(value)) {
      throw new Error("Courses must be an array");
    }
    this.#courses = value.map((courseData) =>
      courseData instanceof Course ? courseData : new Course(courseData),
    );
  }

  render() {
    const section = document.createElement("section");
    section.classList.add("student-section");

    const tileDiv = document.createElement("div");
    tileDiv.classList.add("student-tile");

    const name = document.createElement("h2");
    name.textContent = `${this.firstName} ${this.lastName}`;

    const img = document.createElement("img");
    img.src = this.photo;
    img.alt = `${this.firstName} ${this.lastName}`;
    img.classList.add("player-photo");

    tileDiv.appendChild(name);
    tileDiv.appendChild(img);

    const content = document.createElement("div");
    content.classList.add("student-content");

    const info = document.createElement("pre");
    info.textContent = `Major: ${this.major}\nAge: ${this.age}\nHobbies: ${this.hobbies.join(", ")}`;

    const mailContainer = document.createElement("p");
    mailContainer.textContent = "Mail: ";

    const mailLink = document.createElement("a");
    mailLink.href = `mailto:${this.email}`;
    mailLink.textContent = this.email;
    mailContainer.appendChild(mailLink);

    const coursesTitle = document.createElement("h3");
    coursesTitle.textContent = "Courses:";

    const coursesList = document.createElement("ul");
    this.courses.forEach((course) => {
      const listItem = document.createElement("li");
      const listName = document.createElement("h5");
      listName.textContent = `${course.title} - ${course.teacher.firstName} ${course.teacher.lastName}`;
      const listDescription = document.createElement("div");
      listDescription.textContent = course.description;
      listDescription.style.fontSize = "0.8em";
      listItem.appendChild(listName);
      listItem.appendChild(listDescription);
      coursesList.appendChild(listItem);
    });

    content.appendChild(info);
    content.appendChild(mailContainer);
    content.appendChild(coursesTitle);
    content.appendChild(coursesList);

    section.appendChild(tileDiv);
    section.appendChild(content);

    return section;
  }
}
class Player extends Person {
  #role;
  #number;
  #photo;
  #formerTeams;

  constructor(playerData) {
    const fullName = typeof playerData.name === "string" ? playerData.name : "";
    const nameParts = fullName.split(" ");
    const firstName = playerData.firstName || nameParts[0] || "Driver";
    const lastName =
      playerData.lastName || nameParts.slice(1).join(" ") || "Unknown";
    const born = playerData.born || playerData.birthDate || "1 January 2000";
    const nationality = playerData.nationality || "Unknown";

    super({ firstName, lastName, born, nationality });

    this.role = playerData.role || "Driver";
    this.number = playerData.number;
    this.photo = playerData.photo || playerData.image;
    this.formerTeams = playerData.formerTeams || [];
  }

  get role() {
    return this.#role;
  }
  set role(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Role must be a string");
    }
    this.#role = value.trim();
  }

  get number() {
    return this.#number;
  }
  set number(value) {
    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error("Number must be present");
    }
    this.#number = value;
  }

  get photo() {
    return this.#photo;
  }
  set photo(value) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Photo must be a string");
    }
    this.#photo = value.trim();
  }

  get formerTeams() {
    return this.#formerTeams;
  }
  set formerTeams(value) {
    if (!Array.isArray(value)) {
      throw new Error("Former teams must be an array");
    }
    this.#formerTeams = value.map((teamData) =>
      teamData instanceof Team ? teamData : new Team(teamData),
    );
  }
}
class Driver extends Player {
  constructor(driverData) {
    super(driverData);

    const fullName = typeof driverData.name === "string" ? driverData.name : "";
    const nameParts = fullName.split(" ");
    const firstName = driverData.firstName || nameParts[0] || "Driver";
    const lastName =
      driverData.lastName || nameParts.slice(1).join(" ") || "Unknown";

    this.id = driverData.id;
    this.name = driverData.name || `${firstName} ${lastName}`;
    this.fullName = driverData.fullName || this.name;
    this.age = driverData.age;
    this.birthDate = driverData.birthDate || this.born;
    this.birthPlace = driverData.birthPlace;
    this.wins = driverData.wins;
    this.image = driverData.image || this.photo;
  }
}

//---Wikipedia---
const carWikiByCode = {
  RB1: "https://en.wikipedia.org/wiki/Red_Bull_RB1",
  RB2: "https://en.wikipedia.org/wiki/Red_Bull_RB2",
  RB3: "https://en.wikipedia.org/wiki/Red_Bull_RB3",
  RB4: "https://en.wikipedia.org/wiki/Red_Bull_RB4",
  RB5: "https://en.wikipedia.org/wiki/Red_Bull_RB5",
  RB6: "https://en.wikipedia.org/wiki/Red_Bull_RB6",
  RB7: "https://en.wikipedia.org/wiki/Red_Bull_RB7",
  RB8: "https://en.wikipedia.org/wiki/Red_Bull_RB8",
  RB9: "https://en.wikipedia.org/wiki/Red_Bull_RB9",
  RB10: "https://en.wikipedia.org/wiki/Red_Bull_RB10",
  RB11: "https://en.wikipedia.org/wiki/Red_Bull_RB11",
  RB12: "https://en.wikipedia.org/wiki/Red_Bull_RB12",
  RB13: "https://en.wikipedia.org/wiki/Red_Bull_RB13",
  RB14: "https://en.wikipedia.org/wiki/Red_Bull_RB14",
  RB15: "https://en.wikipedia.org/wiki/Red_Bull_RB15",
  RB16: "https://en.wikipedia.org/wiki/Red_Bull_RB16",
  RB17: "https://en.wikipedia.org/wiki/Red_Bull_RB16B",
  RB18: "https://en.wikipedia.org/wiki/Red_Bull_RB18",
  RB19: "https://en.wikipedia.org/wiki/Red_Bull_RB19",
  RB20: "https://en.wikipedia.org/wiki/Red_Bull_RB20",
  RB21: "https://en.wikipedia.org/wiki/Red_Bull_RB21",
};
const teamFactsByTitle = {
  "Red Bull Racing":
    "Entered Formula One in 2005 after purchasing Jaguar Racing and is based in Milton Keynes.",
  Williams:
    "British constructor founded in 1977 and based in Grove, Oxfordshire.",
  "Williams Racing":
    "British constructor founded in 1977 and based in Grove, Oxfordshire.",
  "Jaguar Racing":
    "Competed in Formula One from 2000 to 2004 before being sold to Red Bull.",
  "HRT F1 Team": "Spanish team that competed in Formula One from 2010 to 2012.",
  "Toro Rosso":
    "Faenza-based Italian team that raced from 2006 to 2019 before rebranding.",
  McLaren:
    "Woking-based British team that has competed in Formula One since the 1960s.",
  "Racing Bulls":
    "Current name of the Faenza-based team that previously raced as AlphaTauri.",
  Minardi:
    "Italian team that raced in Formula One from 1985 to 2005 before becoming Toro Rosso.",
  Alpine: "Renault-owned Enstone team racing under the Alpine name since 2021.",
  "BMW Sauber":
    "Team identity used during BMW ownership of Sauber from 2006 to 2009.",
  Sauber:
    "Swiss constructor based in Hinwil that first entered Formula One in 1993.",
  "Force India":
    "Silverstone-based team that competed from 2008 to 2018 before becoming Racing Point.",
  AlphaTauri:
    "Team name used from 2020 to 2023 before the change to Racing Bulls.",
};

function getPlayerProfileUrl(driver) {
  const playerId = Number(driver && driver.playerId);

  if (Number.isInteger(playerId) && playerId > 0) {
    return "../../playerprofile.html?id=" + encodeURIComponent(playerId);
  }

  return "../../playerprofile.html";
}

function getCarWikiUrl(car) {
  if (car && typeof car.wikiUrl === "string" && car.wikiUrl.trim() !== "") {
    return car.wikiUrl;
  }

  if (!car) {
    return "https://en.wikipedia.org/wiki/Special:Search?search=Formula+One+car";
  }

  let code = "";

  if (car.id) {
    code = car.id;
  } else if (car.name) {
    code = String(car.name).trim();
  }

  if (carWikiByCode[code]) {
    return carWikiByCode[code];
  }

  return (
    "https://en.wikipedia.org/wiki/Special:Search?search=" +
    encodeURIComponent(code || "Formula One car")
  );
}

function getTeamPreviewInfo(team) {
  const title = String(team.title || "Unknown team").trim();
  const city = String(team.city || "Unknown city").trim();
  const country = String(team.country || "Unknown country").trim();
  const fact = teamFactsByTitle[title];

  if (!fact) {
    return `${title} (${city}, ${country})`;
  }

  return `${title} (${city}, ${country})\n${fact}`;
}

function fetchJson(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    return response.json();
  });
}

function getCurrentTeamSlug() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const teamSitesIndex = pathParts.indexOf("Team_Sites");

  if (teamSitesIndex >= 0 && pathParts[teamSitesIndex + 1]) {
    return pathParts[teamSitesIndex + 1];
  }

  return "";
}

function getTeamApiPath(resourceName) {
  return (
    "/api/team-sites/" +
    encodeURIComponent(getCurrentTeamSlug()) +
    "/" +
    resourceName
  );
}

let teamContentPromise = null;

function loadTeamContent() {
  if (!teamContentPromise) {
    teamContentPromise = fetchJson(getTeamApiPath("content")).catch(
      function () {
        return {};
      },
    );
  }

  return teamContentPromise;
}

function clearElementChildren(node) {
  while (node && node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function removeSectionParagraphs(sectionElement) {
  if (!sectionElement) {
    return;
  }

  Array.from(sectionElement.querySelectorAll(":scope > p")).forEach(
    function (paragraph) {
      paragraph.remove();
    },
  );
}

function createFactList(facts) {
  const listElement = document.createElement("ul");

  facts.forEach(function (fact) {
    const itemElement = document.createElement("li");
    const label = fact && fact.label ? String(fact.label).trim() : "";
    const value = fact && fact.value ? String(fact.value).trim() : "";

    itemElement.textContent = (label ? label + ": " : "") + value;
    listElement.appendChild(itemElement);
  });

  return listElement;
}

function createReadingBlock(block) {
  const articleElement = document.createElement("article");
  const titleElement = document.createElement("h3");
  const paragraphElement = document.createElement("p");

  titleElement.textContent = block.title || "Team note";
  paragraphElement.textContent = block.body || "";

  articleElement.appendChild(titleElement);
  articleElement.appendChild(paragraphElement);

  return articleElement;
}

function renderHomeNarrative(content) {
  const homeContent = content && content.home ? content.home : null;
  const welcomeSection = document.querySelector(
    'section[aria-labelledby="welcome-title"]',
  );
  const quickLinksSection = document.querySelector(
    'section[aria-labelledby="quick-links-title"]',
  );
  const mainElement = document.querySelector("main");

  if (!homeContent || !welcomeSection || !mainElement) {
    return;
  }

  removeSectionParagraphs(welcomeSection);
  (Array.isArray(homeContent.intro) ? homeContent.intro : []).forEach(
    function (paragraphText) {
      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      welcomeSection.appendChild(paragraph);
    },
  );

  let readingSection = document.getElementById("teamReadingMaterial");

  if (!readingSection) {
    readingSection = document.createElement("section");
    readingSection.id = "teamReadingMaterial";

    if (quickLinksSection && quickLinksSection.parentNode) {
      quickLinksSection.parentNode.insertBefore(
        readingSection,
        quickLinksSection.nextSibling,
      );
    } else {
      mainElement.appendChild(readingSection);
    }
  }

  clearElementChildren(readingSection);

  {
    const titleElement = document.createElement("h2");
    titleElement.textContent = "Team Reading Material";
    readingSection.appendChild(titleElement);
  }

  (Array.isArray(homeContent.readingBlocks) ?
    homeContent.readingBlocks
  : []
  ).forEach(function (block) {
    readingSection.appendChild(createReadingBlock(block));
  });

  if (
    Array.isArray(homeContent.quickFacts) &&
    homeContent.quickFacts.length > 0
  ) {
    const factsTitle = document.createElement("h3");
    factsTitle.textContent = "Quick facts";
    readingSection.appendChild(factsTitle);
    readingSection.appendChild(createFactList(homeContent.quickFacts));
  }
}

function renderProfileNarrative(content) {
  const profileContent = content && content.profile ? content.profile : null;
  const historySection = document.getElementById("History");
  const teamMembersSection = document.getElementById("TeamMembers");
  const featuredCircuitSection = document.getElementById("FeaturedCircuit");

  if (!profileContent) {
    return;
  }

  if (historySection) {
    removeSectionParagraphs(historySection);
    (Array.isArray(profileContent.history) ?
      profileContent.history
    : []
    ).forEach(function (paragraphText) {
      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      historySection.appendChild(paragraph);
    });
  }

  if (teamMembersSection) {
    removeSectionParagraphs(teamMembersSection);
    (Array.isArray(profileContent.teamMembers) ?
      profileContent.teamMembers
    : []
    ).forEach(function (paragraphText) {
      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      teamMembersSection.appendChild(paragraph);
    });
  }

  if (featuredCircuitSection && profileContent.featuredCircuit) {
    let circuitName = featuredCircuitSection.querySelector("h4");

    if (!circuitName) {
      circuitName = document.createElement("h4");
      featuredCircuitSection.appendChild(circuitName);
    }

    circuitName.textContent =
      profileContent.featuredCircuit.name || "Featured circuit";
    removeSectionParagraphs(featuredCircuitSection);

    (Array.isArray(profileContent.featuredCircuit.paragraphs) ?
      profileContent.featuredCircuit.paragraphs
    : []
    ).forEach(function (paragraphText) {
      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      featuredCircuitSection.appendChild(paragraph);
    });
  }
}

function initNarrativePages() {
  loadTeamContent().then(function (content) {
    renderHomeNarrative(content);
    renderProfileNarrative(content);
  });
}

initNarrativePages();

//---Drivers page---
const driversList = document.getElementById("driversList");

if (driversList) {
  //Loads driver data
  async function loadDriversData() {
    try {
      const data = await fetchJson(getTeamApiPath("drivers"));

      if (isDriversData(data)) {
        renderDriversList(data);
      }
    } catch (err) {
      console.warn("Could not load driver data.\n\n" + err.message);
    }
  }

  //Checks Drivers data
  function isDriversData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    const first = data[0];
    if (!first || typeof first !== "object") {
      return false;
    }

    return (
      "name" in first &&
      "fullName" in first &&
      "birthDate" in first &&
      "formerTeams" in first
    );
  }

  //Updates Drivers content
  function renderDriversList(drivers) {
    if (!driversList) {
      return;
    }

    while (driversList.firstChild) {
      driversList.removeChild(driversList.firstChild);
    }

    drivers.forEach((driverData) => {
      const driver = new Driver(driverData);
      const section = document.createElement("section");
      section.id = driver.id;
      section.classList.add("driver-card");

      const link = document.createElement("a");
      link.href = getPlayerProfileUrl(driver);

      const title = document.createElement("h2");
      title.textContent = driver.name;

      const row = document.createElement("div");
      row.classList.add("driver-card__row");

      const tile = document.createElement("div");
      tile.classList.add("driver-tile");

      const image = document.createElement("img");
      image.src = resolveSiteAssetUrl(driver.image);
      image.alt = driver.name;

      const bio = document.createElement("pre");
      bio.classList.add("drivers-bio");
      bio.textContent =
        "Full name: " +
        driver.fullName +
        "\nCurrent age: " +
        driver.age +
        "\nBirth date: " +
        driver.birthDate +
        "\nPlace of birth: " +
        driver.birthPlace +
        "\nNationality: " +
        driver.nationality +
        "\nCurrent car number: " +
        driver.number +
        "\nWins: " +
        driver.wins;

      const formerTeamsTitle = document.createElement("h3");
      formerTeamsTitle.classList.add("former-teams-title");
      formerTeamsTitle.textContent = "Former teams:";

      const formerTeamsList = document.createElement("ul");
      formerTeamsList.classList.add("former-teams-list");

      driver.formerTeams.forEach((team) => {
        const item = document.createElement("li");
        item.classList.add("team-item");
        item.textContent = team.title;
        item.dataset.teamInfo = getTeamPreviewInfo(team);

        formerTeamsList.appendChild(item);
      });

      let teamTooltip = document.getElementById("teamTooltip");
      if (!teamTooltip) {
        teamTooltip = document.createElement("div");
        teamTooltip.id = "teamTooltip";
        teamTooltip.classList.add("team-tooltip");
        teamTooltip.setAttribute("role", "tooltip");
        document.body.appendChild(teamTooltip);
      }

      formerTeamsList.addEventListener(
        "mouseover",
        function (event) {
          const targetItem = event.target.closest(".team-item");
          if (!targetItem) {
            return;
          }

          teamTooltip.textContent = targetItem.dataset.teamInfo;
          teamTooltip.style.left = `${event.pageX + 10}px`;
          teamTooltip.style.top = `${event.pageY + 10}px`;
          teamTooltip.classList.add("team-tooltip--visible");
        },
        true,
      );

      formerTeamsList.addEventListener("mousemove", function (event) {
        if (teamTooltip.classList.contains("team-tooltip--visible")) {
          teamTooltip.style.left = `${event.pageX + 10}px`;
          teamTooltip.style.top = `${event.pageY + 10}px`;
        }
      });

      formerTeamsList.addEventListener("mouseout", function () {
        teamTooltip.classList.remove("team-tooltip--visible");
      });

      tile.appendChild(image);

      const driverMeta = document.createElement("div");
      driverMeta.classList.add("driver-meta");
      driverMeta.appendChild(bio);
      driverMeta.appendChild(formerTeamsTitle);
      driverMeta.appendChild(formerTeamsList);

      row.appendChild(tile);
      row.appendChild(driverMeta);
      link.appendChild(title);
      link.appendChild(row);
      section.appendChild(link);
      driversList.appendChild(section);
    });
  }

  loadDriversData();
}

//---Statistics page---
const yearSelect = document.getElementById("yearSelect");
const CarContainer = document.getElementById("carType");
const tableBody = document.getElementById("raceData");
const driverContainer = document.getElementById("DriversPic");
const teamsYearLink = document.getElementById("teamsYearLink");

if (
  yearSelect &&
  CarContainer &&
  tableBody &&
  driverContainer &&
  teamsYearLink
) {
  let raceResults = {};

  function ensureStatisticsSummarySection() {
    const mainElement = document.querySelector("main");
    const racesWrapper = document.querySelector(".stats-races");
    let summarySection = document.getElementById("seasonSummary");
    let summaryTitle = document.getElementById("seasonSummaryTitle");
    let summaryText = document.getElementById("seasonSummaryText");
    let summaryStats = document.getElementById("seasonSummaryStats");
    let summaryNotes = document.getElementById("seasonSummaryNotes");

    if (!summarySection && mainElement) {
      summarySection = document.createElement("section");
      summarySection.id = "seasonSummary";
      summaryTitle = document.createElement("h2");
      summaryTitle.id = "seasonSummaryTitle";
      summaryText = document.createElement("p");
      summaryText.id = "seasonSummaryText";
      summaryStats = document.createElement("ul");
      summaryStats.id = "seasonSummaryStats";
      summaryNotes = document.createElement("ul");
      summaryNotes.id = "seasonSummaryNotes";

      summarySection.appendChild(summaryTitle);
      summarySection.appendChild(summaryText);
      summarySection.appendChild(summaryStats);
      summarySection.appendChild(summaryNotes);

      if (racesWrapper && racesWrapper.parentNode) {
        racesWrapper.parentNode.insertBefore(summarySection, racesWrapper);
      } else {
        mainElement.appendChild(summarySection);
      }
    }

    return {
      section: summarySection,
      title: summaryTitle || document.getElementById("seasonSummaryTitle"),
      text: summaryText || document.getElementById("seasonSummaryText"),
      stats: summaryStats || document.getElementById("seasonSummaryStats"),
      notes: summaryNotes || document.getElementById("seasonSummaryNotes"),
    };
  }

  function ensureRaceTableNote() {
    const racesSection = document.getElementById("Races");
    let noteElement = document.getElementById("raceTableNote");

    if (!noteElement && racesSection) {
      noteElement = document.createElement("p");
      noteElement.id = "raceTableNote";
      racesSection.insertBefore(
        noteElement,
        racesSection.querySelector("table"),
      );
    }

    return noteElement;
  }

  function renderStatisticsSummary(year, data) {
    const summaryNodes = ensureStatisticsSummarySection();
    const raceTableNote = ensureRaceTableNote();
    const summary = data && data.summary ? data.summary : null;

    if (!summary || !summaryNodes.section) {
      return;
    }

    summaryNodes.title.textContent =
      summary.headline || "Season summary - " + year;
    summaryNodes.text.textContent = summary.overview || "";
    clearElementChildren(summaryNodes.stats);
    clearElementChildren(summaryNodes.notes);

    (Array.isArray(summary.stats) ? summary.stats : []).forEach(
      function (item) {
        const listItem = document.createElement("li");
        listItem.textContent =
          String(item.label || "Stat") + ": " + String(item.value || "");
        summaryNodes.stats.appendChild(listItem);
      },
    );

    (Array.isArray(summary.notes) ? summary.notes : []).forEach(
      function (note) {
        const listItem = document.createElement("li");
        listItem.textContent = note;
        summaryNodes.notes.appendChild(listItem);
      },
    );

    if (raceTableNote) {
      raceTableNote.textContent = summary.tableNote || "";
    }
  }

  //Uploads raceResults
  async function uploadData() {
    raceResults = await fetchJson(getTeamApiPath("race-data"));

    while (yearSelect.firstChild) {
      yearSelect.removeChild(yearSelect.firstChild);
    }

    Object.keys(raceResults)
      .sort((leftYear, rightYear) => Number(leftYear) - Number(rightYear))
      .forEach((year) => {
        yearSelect.appendChild(new Option(year, year));
      });

    if (!yearSelect.options.length) {
      return;
    }

    {
      const requestedYear = new URLSearchParams(window.location.search).get(
        "year",
      );
      const initialYear =
        (
          Array.from(yearSelect.options).some(
            (option) => option.value === requestedYear,
          )
        ) ?
          requestedYear
        : yearSelect.options[yearSelect.options.length - 1].value;

      yearSelect.value = initialYear;
      updateContent(initialYear);
    }
  }

  //Updates by year selected
  function updateContent(year) {
    updateTeamsYearLink(year);
    const data = raceResults[year];
    renderStatisticsSummary(year, data);

    //Cars
    clearElementChildren(CarContainer);

    if (data && data.Car) {
      data.Car.forEach((item) => {
        const divWrap = document.createElement("div");

        const aWrap = document.createElement("a");
        aWrap.href = getCarWikiUrl(item);
        aWrap.target = "_blank";
        aWrap.rel = "noopener noreferrer";

        const tileWrap = document.createElement("div");
        tileWrap.classList.add("stats-car--tile");

        const image = document.createElement("img");
        image.src = resolveSiteAssetUrl(item.image);
        image.alt = item.name;

        const caption = document.createElement("figcaption");
        caption.textContent = item.name;

        tileWrap.appendChild(image);
        aWrap.appendChild(tileWrap);
        aWrap.appendChild(caption);
        divWrap.appendChild(aWrap);

        CarContainer.appendChild(divWrap);
      });
    }

    //Drivers
    clearElementChildren(driverContainer);

    if (data && data.drivers) {
      data.drivers.forEach((item) => {
        const divWrap = document.createElement("div");

        const aWrap = document.createElement("a");
        aWrap.href = getPlayerProfileUrl(item);

        const tileWrap = document.createElement("div");
        tileWrap.classList.add("driver-tile");

        const image = document.createElement("img");
        image.src = resolveSiteAssetUrl(item.image);
        image.alt = item.name;

        const caption = document.createElement("figcaption");
        caption.textContent = item.name;

        tileWrap.appendChild(image);
        aWrap.appendChild(tileWrap);
        aWrap.appendChild(caption);
        divWrap.appendChild(aWrap);

        driverContainer.appendChild(divWrap);
      });
    }

    //Races
    clearElementChildren(tableBody);

    if (data && Array.isArray(data.races) && data.races.length > 0) {
      const headerRow = document.createElement("tr");
      const thDriver = document.createElement("th");
      thDriver.textContent = "Drivers";
      headerRow.appendChild(thDriver);

      data.races[0].results.forEach((res) => {
        const th = document.createElement("th");
        th.textContent = res.GP || "";
        headerRow.appendChild(th);
      });
      tableBody.appendChild(headerRow);

      data.races.forEach((item) => {
        const rowPlace = document.createElement("tr");
        const rowTime = document.createElement("tr");

        const tdName = document.createElement("td");
        const driverLink = document.createElement("a");
        driverLink.href = getPlayerProfileUrl(item);
        driverLink.textContent = item.Drivers;
        tdName.rowSpan = 2;
        tdName.appendChild(driverLink);
        rowPlace.appendChild(tdName);

        item.results.forEach((res) => {
          const tdPlace = document.createElement("td");
          tdPlace.textContent = res.Place || "-";
          rowPlace.appendChild(tdPlace);

          const tdTime = document.createElement("td");
          tdTime.textContent = res.Time || "-";
          rowTime.appendChild(tdTime);
        });

        tableBody.appendChild(rowPlace);
        tableBody.appendChild(rowTime);
      });
    }
  }

  //Links Team Page by year selected
  function updateTeamsYearLink(year) {
    teamsYearLink.href = `teams.html?year=${year}`;
  }

  //Selecting year
  yearSelect.addEventListener("change", (event) =>
    updateContent(event.target.value),
  );

  uploadData().catch((error) => console.error(error));
}

//---Cars page---
const carsTableBody = document.getElementById("carsTableBody");

if (carsTableBody) {
  //Adds table content
  function createCell(value) {
    const td = document.createElement("td");
    td.textContent = String(value);
    return td;
  }

  //Uploads table content
  fetchJson(getTeamApiPath("cars"))
    .then((cars) => {
      //Creates table
      while (carsTableBody.firstChild) {
        carsTableBody.removeChild(carsTableBody.firstChild);
      }

      cars.forEach((car) => {
        const row = document.createElement("tr");
        row.id = car.id;

        const imageCell = document.createElement("td");

        const imageLink = document.createElement("a");
        imageLink.href = getCarWikiUrl(car);
        imageLink.target = "_blank";
        imageLink.rel = "noopener noreferrer";

        const image = document.createElement("img");
        image.src = resolveSiteAssetUrl(car.image);
        image.alt = car.name;

        imageLink.appendChild(image);
        imageCell.appendChild(imageLink);

        const driversCell = document.createElement("td");
        car.drivers.forEach((driver, index) => {
          const link = document.createElement("a");
          link.href = getPlayerProfileUrl(driver);
          link.textContent = driver.name;
          driversCell.appendChild(link);

          if (index < car.drivers.length - 1) {
            driversCell.appendChild(document.createTextNode(", "));
          }
        });

        row.appendChild(imageCell);
        row.appendChild(createCell(car.name));
        row.appendChild(createCell(car.notes));
        row.appendChild(createCell(car.season));
        row.appendChild(createCell(car.engine));
        row.appendChild(driversCell);
        row.appendChild(createCell(car.races));
        row.appendChild(createCell(car.wins));
        row.appendChild(createCell(car.poles));
        row.appendChild(createCell(car.fastestLaps));
        row.appendChild(createCell(car.power));

        carsTableBody.appendChild(row);
      });
    })
    .catch((error) => console.error(error)); //Results error
}

//---Teams page---
const teamYearSelect = document.getElementById("teamYearSelect");
const teamDrivers = document.getElementById("teamDrivers");
const teamSummaryText = document.getElementById("teamSummaryText");
const teamSummaryList = document.getElementById("teamSummaryList");
const teamYearTitle = document.getElementById("teamYearTitle");

if (
  teamYearSelect &&
  teamDrivers &&
  teamSummaryText &&
  teamSummaryList &&
  teamYearTitle
) {
  let teamRaceData = {};

  //Empties node
  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  //Returns usable number
  function parsePlace(placeValue) {
    const parsed = Number(placeValue);
    return Number.isFinite(parsed) ? parsed : null;
  }

  //Changes URL by year selected
  function updateTeamsYearInUrl(year) {
    window.history.replaceState({}, "", `teams.html?year=${year}`);
  }

  //Updates Team Members content
  function renderTeamDrivers(drivers) {
    clearNode(teamDrivers);

    drivers.forEach((driver) => {
      const card = document.createElement("div");

      const link = document.createElement("a");
      link.href = getPlayerProfileUrl(driver);

      const tile = document.createElement("div");
      tile.classList.add("driver-tile");

      const image = document.createElement("img");
      image.src = resolveSiteAssetUrl(driver.image);
      image.alt = driver.name;

      const caption = document.createElement("figcaption");
      caption.textContent = driver.name;

      tile.appendChild(image);
      link.appendChild(tile);
      link.appendChild(caption);
      card.appendChild(link);
      teamDrivers.appendChild(card);
    });
  }

  //Updates Team Overview content
  function renderTeamSummary(year, data) {
    clearNode(teamSummaryList);
    const summary = data && data.summary ? data.summary : null;

    if (summary) {
      teamSummaryText.textContent = summary.overview || "";

      (Array.isArray(summary.stats) ? summary.stats : []).forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent =
          String(item.label || "Stat") + ": " + String(item.value || "");
        teamSummaryList.appendChild(listItem);
      });

      (Array.isArray(summary.notes) ? summary.notes : []).forEach((note) => {
        const listItem = document.createElement("li");
        listItem.textContent = note;
        teamSummaryList.appendChild(listItem);
      });

      return;
    }

    const races = Array.isArray(data.races) ? data.races : [];
    const drivers = Array.isArray(data.drivers) ? data.drivers : [];
    const firstResults =
      races.length > 0 && Array.isArray(races[0].results) ?
        races[0].results
      : [];
    const raceWeekends =
      firstResults.length > 0 ?
        firstResults.filter((result) => result.GP).length
      : 0;

    let teamWins = 0;
    let teamPodiums = 0;

    races.forEach((driverRow) => {
      let starts = 0;
      let wins = 0;
      let podiums = 0;
      let bestFinish = null;

      const results = Array.isArray(driverRow.results) ? driverRow.results : [];

      results.forEach((result) => {
        const place = parsePlace(result.Place);
        if (place === null) {
          return;
        }

        starts += 1;

        if (place === 1) {
          wins += 1;
          teamWins += 1;
        }

        if (place <= 3) {
          podiums += 1;
          teamPodiums += 1;
        }

        if (bestFinish === null || place < bestFinish) {
          bestFinish = place;
        }
      });

      const item = document.createElement("li");
      item.textContent =
        `${driverRow.Drivers}: starts ${starts}, wins ${wins}, podiums ${podiums}, best finish ` +
        `${bestFinish === null ? "-" : bestFinish}`;
      teamSummaryList.appendChild(item);
    });

    teamSummaryText.textContent =
      `Year ${year}: ${drivers.length} drivers, ${raceWeekends} race weekends, ` +
      `${teamWins} wins, ${teamPodiums} podiums.`;
  }

  //Updates by year selected
  function renderTeamYear(year) {
    const data = teamRaceData[year];

    if (!data) {
      teamYearTitle.textContent = "Team Overview";
      teamSummaryText.textContent = "No data available for this year.";
      clearNode(teamDrivers);
      clearNode(teamSummaryList);
      return;
    }

    teamYearTitle.textContent =
      data.summary && data.summary.headline ?
        data.summary.headline
      : `Team Overview - ${year}`;
    renderTeamDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    renderTeamSummary(year, data);
  }

  //Uploads page content
  fetchJson(getTeamApiPath("race-data"))
    .then((data) => {
      //Uploads teamRaceData
      teamRaceData = data;
      const years = Object.keys(teamRaceData).sort(
        (a, b) => Number(a) - Number(b),
      );

      while (teamYearSelect.firstChild) {
        teamYearSelect.removeChild(teamYearSelect.firstChild);
      }

      years.forEach((year) => {
        teamYearSelect.appendChild(new Option(year, year));
      });

      let requestedYear = "";
      if (window.location.search.startsWith("?year=")) {
        requestedYear = window.location.search.replace("?year=", "");
      }
      const initialYear =
        years.includes(requestedYear) ? requestedYear : years[years.length - 1];

      teamYearSelect.value = initialYear;
      updateTeamsYearInUrl(initialYear);
      renderTeamYear(initialYear);

      teamYearSelect.addEventListener("change", function () {
        const selectedYear = teamYearSelect.value;
        updateTeamsYearInUrl(selectedYear);
        renderTeamYear(selectedYear);
      });
    })
    .catch((error) => console.error(error)); //Results error
}

