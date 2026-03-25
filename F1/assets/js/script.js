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
    this.wikiUrl = driverData.wikiUrl;
    this.image = driverData.image || this.photo;
  }
}

//---Wikipedia---
const driverWikiById = {
  "Alexander-Albon": "https://en.wikipedia.org/wiki/Alex_Albon",
  "Christian-Klien": "https://en.wikipedia.org/wiki/Christian_Klien",
  "Daniel-Ricciardo": "https://en.wikipedia.org/wiki/Daniel_Ricciardo",
  "Daniil-Kvyat": "https://en.wikipedia.org/wiki/Daniil_Kvyat",
  "David-Coulthard": "https://en.wikipedia.org/wiki/David_Coulthard",
  "Isack-Hadjar": "https://en.wikipedia.org/wiki/Isack_Hadjar",
  "Liam-Lawson": "https://en.wikipedia.org/wiki/Liam_Lawson",
  "Mark-Webber": "https://en.wikipedia.org/wiki/Mark_Webber",
  "Max-Verstappen": "https://en.wikipedia.org/wiki/Max_Verstappen",
  "Pierre-Gasly": "https://en.wikipedia.org/wiki/Pierre_Gasly",
  "Robert-Doornbos": "https://en.wikipedia.org/wiki/Robert_Doornbos",
  "Sebastian-Vettel": "https://en.wikipedia.org/wiki/Sebastian_Vettel",
  "Sergio-Perez": "https://en.wikipedia.org/wiki/Sergio_P%C3%A9rez",
  "Vitantonio-Liuzzi": "https://en.wikipedia.org/wiki/Vitantonio_Liuzzi",
  "Yuki-Tsunoda": "https://en.wikipedia.org/wiki/Yuki_Tsunoda",
};
const driverWikiByName = {
  "Alexander Albon": "https://en.wikipedia.org/wiki/Alex_Albon",
  "Christian Klien": "https://en.wikipedia.org/wiki/Christian_Klien",
  "Daniel Ricciardo": "https://en.wikipedia.org/wiki/Daniel_Ricciardo",
  "Daniil Kvyat": "https://en.wikipedia.org/wiki/Daniil_Kvyat",
  "David Coulthard": "https://en.wikipedia.org/wiki/David_Coulthard",
  "Isack Hadjar": "https://en.wikipedia.org/wiki/Isack_Hadjar",
  "Liam Lawson": "https://en.wikipedia.org/wiki/Liam_Lawson",
  "Mark Webber": "https://en.wikipedia.org/wiki/Mark_Webber",
  "Max Verstappen": "https://en.wikipedia.org/wiki/Max_Verstappen",
  "Pierre Gasly": "https://en.wikipedia.org/wiki/Pierre_Gasly",
  "Robert Doornbos": "https://en.wikipedia.org/wiki/Robert_Doornbos",
  "Sebastian Vettel": "https://en.wikipedia.org/wiki/Sebastian_Vettel",
  "Sergio Perez": "https://en.wikipedia.org/wiki/Sergio_P%C3%A9rez",
  "Vitantonio Liuzzi": "https://en.wikipedia.org/wiki/Vitantonio_Liuzzi",
  "Yuki Tsunoda": "https://en.wikipedia.org/wiki/Yuki_Tsunoda",
};
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

function getDriverWikiUrl(driver) {
  if (driver && typeof driver.wikiUrl === "string" && driver.wikiUrl.trim() !== "") {
    return driver.wikiUrl;
  }

  if (driver && driver.id && driverWikiById[driver.id]) {
    return driverWikiById[driver.id];
  }

  if (driver && driver.name && driverWikiByName[driver.name]) {
    return driverWikiByName[driver.name];
  }

  const rawName =
    (driver && (driver.name || driver.fullName)) ||
    (driver && driver.id ? String(driver.id).replace(/-/g, " ") : "Formula One driver");

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(rawName).replace(/%20/g, "_")}`;
}

function getCarWikiUrl(car) {
  if (!car) {
    return "https://en.wikipedia.org/wiki/Red_Bull_Racing";
  }

  let code = "";

  if (car.id) {
    code = car.id;
  } else if (car.name) {
    code = String(car.name).replace("Red Bull ", "").trim();
  }

  if (carWikiByCode[code]) {
    return carWikiByCode[code];
  }

  return "https://en.wikipedia.org/wiki/Red_Bull_Racing";
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

//---Drivers page---
const driversList = document.getElementById("driversList");
const driversFileInput = document.getElementById("driversFileInput");
const driversUploadArea = document.getElementById("driversUploadArea");

if (driversList && driversFileInput && driversUploadArea) {
  //Uploads Drivers Data
  async function uploadDriversData() {
    try {
      const response = await fetch("data/driversData.json");
      if (!response.ok) throw new Error("Couldn't find file");

      const data = await response.json();

      if (isDriversData(data)) {
        renderDriversList(data);
        driversUploadArea.style.display = "none";
      }
    } catch (err) {
      console.warn("Could not load JSON file.\n\n" + err.message);
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
      link.href = getDriverWikiUrl(driver);
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const title = document.createElement("h2");
      title.textContent = driver.name;

      const row = document.createElement("div");
      row.classList.add("driver-card__row");

      const tile = document.createElement("div");
      tile.classList.add("driver-tile");

      const image = document.createElement("img");
      image.src = driver.image;
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

    if (typeof refreshAccessibilityOptions === "function") {
      refreshAccessibilityOptions();
    }
  }

  //Reads & Uploads File
  driversFileInput.addEventListener("change", function (e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (!isDriversData(data)) {
          throw new Error("Please upload a valid driversData.json file.");
        }

        renderDriversList(data);

        driversUploadArea.style.display = "none";
      } catch (err) {
        alert("Could not load JSON file.\n\n" + err.message);
      }
    };

    reader.readAsText(selectedFile);
  });

  uploadDriversData();
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

  //Uploads raceResults
  async function uploadData() {
    const response = await fetch("data/raceData.json");

    raceResults = await response.json();

    updateContent("2025");
  }

  //Updates by year selected
  function updateContent(year) {
    updateTeamsYearLink(year);
    const data = raceResults[year];

    //Cars
    while (CarContainer.firstChild) {
      CarContainer.removeChild(CarContainer.firstChild);
    }

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
        image.src = `assets/images/cars/${item.img}`;
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
    while (driverContainer.firstChild) {
      driverContainer.removeChild(driverContainer.firstChild);
    }

    if (data && data.drivers) {
      data.drivers.forEach((item) => {
        const divWrap = document.createElement("div");

        const aWrap = document.createElement("a");
        aWrap.href = getDriverWikiUrl(item);
        aWrap.target = "_blank";
        aWrap.rel = "noopener noreferrer";

        const tileWrap = document.createElement("div");
        tileWrap.classList.add("driver-tile");

        const image = document.createElement("img");
        image.src = `assets/images/drivers/${item.img}`;
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
    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }

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
        tdName.rowSpan = 2;
        tdName.textContent = item.Drivers;
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

  updateContent(yearSelect.value);
  uploadData();
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
  fetch("data/carsData.json")
    .then((response) => response.json()) //Reads file
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
        image.src = car.image;
        image.alt = car.name;

        imageLink.appendChild(image);
        imageCell.appendChild(imageLink);

        const driversCell = document.createElement("td");
        car.drivers.forEach((driver, index) => {
          const link = document.createElement("a");
          link.href = `drivers.html#${driver.id}`;
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
      link.href = getDriverWikiUrl(driver);
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const tile = document.createElement("div");
      tile.classList.add("driver-tile");

      const image = document.createElement("img");
      image.src = `assets/images/drivers/${driver.img}`;
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

    teamYearTitle.textContent = `Team Overview - ${year}`;
    renderTeamDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    renderTeamSummary(year, data);

    if (typeof refreshAccessibilityOptions === "function") {
      refreshAccessibilityOptions();
    }
  }

  //Uploads page content
  fetch("data/raceData.json")
    .then((response) => response.json()) //Reads file
    .then((data) => {
      //Uploads teamRaceData
      teamRaceData = data;
      const years = Object.keys(teamRaceData).sort(
        (a, b) => Number(a) - Number(b),
      );

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

//---About page---
const fileInput = document.getElementById("fileInput");
const playerContainer =
  document.getElementById("playerContainer") ||
  document.getElementById("studentContainer");

if (fileInput && playerContainer) {
  //Checks Group Members data
  function isGroupMembersData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    const first = data[0];
    if (!first || typeof first !== "object") {
      return false;
    }

    return (
      "firstName" in first &&
      "lastName" in first &&
      "major" in first &&
      "courses" in first
    );
  }

  //Reads & Uploads File
  fileInput.addEventListener("change", function (e) {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (!isGroupMembersData(data)) {
          throw new Error("Please upload a valid groupMembers.json file.");
        }

        while (playerContainer.firstChild) {
          playerContainer.removeChild(playerContainer.firstChild);
        }

        data.forEach((memberData) => {
          const groupMemberObj = new GroupMember(memberData);
          playerContainer.appendChild(groupMemberObj.render());
        });

        if (typeof refreshAccessibilityOptions === "function") {
          refreshAccessibilityOptions();
        }

        const uploadArea = document.getElementById("uploadArea");
        if (uploadArea) {
          uploadArea.style.display = "none";
        }
      } catch (err) {
        alert("Could not load JSON file.\n\n" + err.message);
      }
    };

    const selectedFile = e.target.files[0];
    if (selectedFile) {
      reader.readAsText(selectedFile);
    }
  });
}

//---Accessibility features---
let refreshAccessibilityOptions = null;

//Select features

function initAccessibilityControls() {
  return;
  const host =
    document.querySelector("footer") || document.querySelector("header");

  if (!host || document.getElementById("elementMenu")) {
    return;
  }

  const panel = document.createElement("section");
  panel.classList.add("accessibility-controls");

  const title = document.createElement("p");
  title.classList.add("accessibility-controls__title");
  title.textContent = "Accessibility Features";

  const elementLabel = document.createElement("label");
  elementLabel.setAttribute("for", "elementMenu");
  elementLabel.textContent = "Select element:";

  const elementMenu = document.createElement("select");
  elementMenu.id = "elementMenu";

  const styleLabel = document.createElement("label");
  styleLabel.setAttribute("for", "styleMenu");
  styleLabel.textContent = "Selected element:";

  const styleMenu = document.createElement("select");
  styleMenu.id = "styleMenu";

  styleMenu.appendChild(new Option("Text options", ""));
  styleMenu.appendChild(new Option("Text size: small", "sizeSmall"));
  styleMenu.appendChild(new Option("Text size: default", "sizeDefault"));
  styleMenu.appendChild(new Option("Text size: large", "sizeLarge"));
  styleMenu.appendChild(new Option("Text color: default", "colorDefault"));
  styleMenu.appendChild(new Option("Text color: red", "colorRed"));
  styleMenu.appendChild(new Option("Text color: blue", "colorBlue"));

  const generalLabel = document.createElement("label");
  generalLabel.setAttribute("for", "generalMenu");
  generalLabel.textContent = "Website accessibility:";

  const generalMenu = document.createElement("select");
  generalMenu.id = "generalMenu";

  generalMenu.appendChild(new Option("Site options", ""));
  generalMenu.appendChild(new Option("Site text: small", "textSmall"));
  generalMenu.appendChild(new Option("Site text: default", "textDefault"));
  generalMenu.appendChild(new Option("Site text: large", "textLarge"));
  generalMenu.appendChild(new Option("Color theme: default", "themeDefault"));
  generalMenu.appendChild(new Option("Color theme: dark", "themeDark"));
  generalMenu.appendChild(new Option("Color theme: light", "themeLight"));
  generalMenu.appendChild(
    new Option("Color theme: high contrast", "themeContrast"),
  );

  panel.appendChild(title);
  panel.appendChild(elementLabel);
  panel.appendChild(elementMenu);
  panel.appendChild(styleLabel);
  panel.appendChild(styleMenu);
  panel.appendChild(generalLabel);
  panel.appendChild(generalMenu);

  host.appendChild(panel);

  //Applies Site Theme
  function applyTheme(theme) {
    document.body.classList.remove(
      "theme-dark",
      "theme-light",
      "theme-contrast",
    );

    if (theme === "themeDark") {
      document.body.classList.add("theme-dark");
    }
    if (theme === "themeLight") {
      document.body.classList.add("theme-light");
    }
    if (theme === "themeContrast") {
      document.body.classList.add("theme-contrast");
    }
  }

  //Applies Site Textsize
  function applySiteText(size) {
    document.body.classList.remove("site-font-small", "site-font-large");

    if (size === "textSmall") {
      document.body.classList.add("site-font-small");
    }
    if (size === "textLarge") {
      document.body.classList.add("site-font-large");
    }
  }

  //Applies Element size & color
  function applyOnElement(target, action) {
    if (!target) {
      return;
    }

    if (action === "sizeSmall") {
      target.classList.remove(
        "accessibility-size-small",
        "accessibility-size-large",
      );
      target.classList.add("accessibility-size-small");
    }
    if (action === "sizeDefault") {
      target.classList.remove(
        "accessibility-size-small",
        "accessibility-size-large",
      );
    }
    if (action === "sizeLarge") {
      target.classList.remove(
        "accessibility-size-small",
        "accessibility-size-large",
      );
      target.classList.add("accessibility-size-large");
    }
    if (action === "colorDefault") {
      target.classList.remove(
        "accessibility-color-red",
        "accessibility-color-blue",
      );
    }
    if (action === "colorRed") {
      target.classList.remove(
        "accessibility-color-red",
        "accessibility-color-blue",
      );
      target.classList.add("accessibility-color-red");
    }
    if (action === "colorBlue") {
      target.classList.remove(
        "accessibility-color-red",
        "accessibility-color-blue",
      );
      target.classList.add("accessibility-color-blue");
    }
  }

  let elementIdCounter = 1;
  let targetsById = new Map();

  //Checks Element ID
  function ensureAccessibilityId(element) {
    if (!element.dataset.accessibilityId) {
      element.dataset.accessibilityId = `accessibility-${elementIdCounter}`;
      elementIdCounter += 1;
    }

    return element.dataset.accessibilityId;
  }

  //Names Element ID
  function buildElementLabel(element, index) {
    const tag = element.tagName.toLowerCase();
    const firstClass =
      typeof element.className === "string" ?
        element.className.split(" ").find((name) => name.trim() !== "")
      : "";

    if (element.id) {
      return `${tag}#${element.id}`;
    }

    if (firstClass) {
      return `${tag}.${firstClass}`;
    }

    return `${tag} (${index + 1})`;
  }

  //Organizes Elements
  function collectTargets() {
    const targets = [document.body];
    const dynamicTargets = document.querySelectorAll(
      "header, main, footer, nav, article, section, aside",
    );

    dynamicTargets.forEach((element) => {
      if (element !== panel && !panel.contains(element)) {
        targets.push(element);
      }
    });

    return targets;
  }

  //Fills Menu with Elements
  function fillElementMenu() {
    const previousValue = elementMenu.value;

    while (elementMenu.firstChild) {
      elementMenu.removeChild(elementMenu.firstChild);
    }

    targetsById = new Map();
    const targets = collectTargets();

    targets.forEach((element, index) => {
      const accessibilityId = ensureAccessibilityId(element);
      const label = buildElementLabel(element, index);
      targetsById.set(accessibilityId, element);
      elementMenu.appendChild(new Option(label, accessibilityId));
    });

    if (previousValue && targetsById.has(previousValue)) {
      elementMenu.value = previousValue;
    }
  }

  //Refills Menu with Elements
  function refreshMenus() {
    fillElementMenu();
  }

  refreshMenus();
  refreshAccessibilityOptions = function () {
    refreshMenus();
  };

  applyTheme(localStorage.getItem("siteTheme") || "themeDefault");
  applySiteText(localStorage.getItem("siteTextSize") || "textDefault");

  //Selecting element applications
  styleMenu.addEventListener("change", function () {
    const target = targetsById.get(elementMenu.value) || document.body;
    applyOnElement(target, styleMenu.value);
    styleMenu.value = "";
  });

  //Selecting site applications
  generalMenu.addEventListener("change", function () {
    const action = generalMenu.value;

    if (action.startsWith("theme")) {
      applyTheme(action);
      localStorage.setItem("siteTheme", action);
    }

    if (action.startsWith("text")) {
      applySiteText(action);
      localStorage.setItem("siteTextSize", action);
    }

    generalMenu.value = "";
  });
}

//Selecting features
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAccessibilityControls);
} else {
  initAccessibilityControls();
}
