/* Purpose: Ensures the league database uses the normalized schema and seeds the current runtime content. */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { User } = require("../models/User");

const currentSchemaVersion = "5";
const rootDirectory = path.resolve(__dirname, "..", "..", "..");
const storageDirectory = path.join(rootDirectory, "storage");
const currentRaceSeedVersion = "3";
const minimumSeededUserCount = 3;
const minimumSeededPlayerCount = 50;
const defaultRaceSeason = 2026;
const defaultRaceSchedule = [
  { roundNumber: 1, circuitName: "Australia", name: "Australia Grand Prix", scheduledAt: "2026-03-08T13:00:00.000Z" },
  { roundNumber: 2, circuitName: "China", name: "China Grand Prix", scheduledAt: "2026-03-15T13:00:00.000Z" },
  { roundNumber: 3, circuitName: "Japan", name: "Japan Grand Prix", scheduledAt: "2026-03-29T13:00:00.000Z" },
  { roundNumber: 4, circuitName: "Miami", name: "Miami Grand Prix", scheduledAt: "2026-05-03T13:00:00.000Z" },
  { roundNumber: 5, circuitName: "Canada", name: "Canadian Grand Prix", scheduledAt: "2026-05-24T13:00:00.000Z" },
  { roundNumber: 6, circuitName: "Monaco", name: "Monaco Grand Prix", scheduledAt: "2026-06-07T13:00:00.000Z" },
  { roundNumber: 7, circuitName: "Barcelona-Catalunya", name: "Spanish Grand Prix", scheduledAt: "2026-06-14T13:00:00.000Z" },
  { roundNumber: 8, circuitName: "Austria", name: "Austrian Grand Prix", scheduledAt: "2026-06-28T13:00:00.000Z" },
  { roundNumber: 9, circuitName: "Great Britain", name: "British Grand Prix", scheduledAt: "2026-07-05T13:00:00.000Z" },
  { roundNumber: 10, circuitName: "Belgium", name: "Belgian Grand Prix", scheduledAt: "2026-07-19T13:00:00.000Z" },
  { roundNumber: 11, circuitName: "Hungary", name: "Hungarian Grand Prix", scheduledAt: "2026-07-26T13:00:00.000Z" },
  { roundNumber: 12, circuitName: "Netherlands", name: "Dutch Grand Prix", scheduledAt: "2026-08-23T13:00:00.000Z" },
  { roundNumber: 13, circuitName: "Italy", name: "Italian Grand Prix", scheduledAt: "2026-09-06T13:00:00.000Z" },
  { roundNumber: 14, circuitName: "Spain", name: "Spanish Grand Prix", scheduledAt: "2026-09-13T13:00:00.000Z" },
  { roundNumber: 15, circuitName: "Azerbaijan", name: "Azerbaijan Grand Prix", scheduledAt: "2026-09-26T13:00:00.000Z" },
  { roundNumber: 16, circuitName: "Singapore", name: "Singapore Grand Prix", scheduledAt: "2026-10-11T13:00:00.000Z" },
  { roundNumber: 17, circuitName: "United States", name: "United States Grand Prix", scheduledAt: "2026-10-25T13:00:00.000Z" },
  { roundNumber: 18, circuitName: "Mexico", name: "Mexico City Grand Prix", scheduledAt: "2026-11-01T13:00:00.000Z" },
  { roundNumber: 19, circuitName: "Brazil", name: "Sao Paulo Grand Prix", scheduledAt: "2026-11-08T13:00:00.000Z" },
  { roundNumber: 20, circuitName: "Las Vegas", name: "Las Vegas Grand Prix", scheduledAt: "2026-11-21T13:00:00.000Z" },
  { roundNumber: 21, circuitName: "Qatar", name: "Qatar Grand Prix", scheduledAt: "2026-11-29T13:00:00.000Z" },
  { roundNumber: 22, circuitName: "Abu Dhabi", name: "Abu Dhabi Grand Prix", scheduledAt: "2026-12-06T13:00:00.000Z" },
];
const teamStrengthBySlug = {
  McLaren: 100,
  Red_Bull: 98,
  Ferrari: 96,
  Mercedes: 94,
  Williams: 86,
  Racing_Bulls: 84,
  Aston_Martin: 82,
  Alpine: 80,
  Haas: 78,
  Audi: 76,
  Cadillac: 74,
};

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
const currentLeagueInfo = {
  title: "League Info",
  intro:
    "Formula 1 became an official world championship in 1950 and has grown into the highest-profile form of international single-seater racing. Success depends on the work of teams as much as drivers, with engineering, strategy, pit stops, and car development shaping every season.",
  sections: [
    {
      id: "history",
      title: "History",
      paragraphs: [
        "The earliest organised car races took shape in France in the late nineteenth century, and the first Grands Prix introduced rules about the size, weight, and technical shape of the cars that could compete.",
        "After World War II, international racing expanded quickly and the FIA adopted the formal Formula 1 ruleset in 1946. That framework shaped the championship that still defines top-level single-seater racing today.",
        "Across its history, Formula 1 has combined technical innovation with intense competition between drivers and constructors, while the machinery has continued to evolve with each new era of regulations.",
      ],
    },
    {
      id: "league-structure",
      title: "League Structure",
      paragraphs: [
        "Each Formula 1 season is built around teams entering two cars, a calendar of Grands Prix, and championship points awarded from race and sprint results. In this project data, the live 2026 grid consists of 11 teams.",
        "Teams compete for both driver points and constructor points, with the constructor total coming from the combined weekend results of the team's drivers. Race weekends are also shaped by qualifying, tyre strategy, pit stops, and changing track conditions.",
        "Formula 1 uses trackside signals and safety procedures, including flags, pit rules, and the safety car, to manage racing conditions and protect drivers during dangerous moments.",
      ],
    },
    {
      id: "featured-circuits",
      title: "Featured Circuits",
      paragraphs: [
        "Tracks such as Silverstone, Monza, Suzuka, Spa-Francorchamps, Monaco, and the Red Bull Ring are strongly tied to Formula 1's history, atmosphere, and competitive identity.",
        "Modern calendars also bring the championship to circuits such as Albert Park, Shanghai, Montreal, Marina Bay, Austin, and Yas Marina, showing how global the sport has become.",
      ],
    },
  ],
};
const currentDriverLineup = [
  { teamSlug: "Alpine", firstName: "Pierre", lastName: "Gasly", number: 10, dateOfBirth: "7 February 1996", photo: "/api/driver-images/pierregasly.jpg" },
  { teamSlug: "Alpine", firstName: "Franco", lastName: "Colapinto", number: 43, dateOfBirth: "27 May 2003", photo: "/api/driver-images/francocolapinto.jpg" },
  { teamSlug: "Aston_Martin", firstName: "Fernando", lastName: "Alonso", number: 14, dateOfBirth: "29 July 1981", photo: "/api/driver-images/fernandoalonso.jpg" },
  { teamSlug: "Aston_Martin", firstName: "Lance", lastName: "Stroll", number: 18, dateOfBirth: "29 October 1998", photo: "/api/driver-images/lancestroll.jpg" },
  { teamSlug: "Audi", firstName: "Nico", lastName: "Hulkenberg", number: 27, dateOfBirth: "19 August 1987", photo: "/api/driver-images/nicohulkenberg.jpg" },
  { teamSlug: "Audi", firstName: "Gabriel", lastName: "Bortoleto", number: 5, dateOfBirth: "14 October 2004", photo: "/api/driver-images/gabrielbortoleto.jpg" },
  { teamSlug: "Cadillac", firstName: "Sergio", lastName: "Perez", number: 11, dateOfBirth: "26 January 1990", photo: "/api/driver-images/sergioperez.jpg" },
  { teamSlug: "Cadillac", firstName: "Valtteri", lastName: "Bottas", number: 77, dateOfBirth: "28 August 1989", photo: "/api/driver-images/valtteribottas.jpg" },
  { teamSlug: "Ferrari", firstName: "Charles", lastName: "Leclerc", number: 16, dateOfBirth: "16 October 1997", photo: "/api/driver-images/charlesleclerc.jpg" },
  { teamSlug: "Ferrari", firstName: "Lewis", lastName: "Hamilton", number: 44, dateOfBirth: "7 January 1985", photo: "/api/driver-images/lewishamilton.jpg" },
  { teamSlug: "Haas", firstName: "Esteban", lastName: "Ocon", number: 31, dateOfBirth: "17 September 1996", photo: "/api/driver-images/estebanocon.jpg" },
  { teamSlug: "Haas", firstName: "Oliver", lastName: "Bearman", number: 87, dateOfBirth: "8 May 2005", photo: "/api/driver-images/oliverbearman.jpg" },
  { teamSlug: "McLaren", firstName: "Lando", lastName: "Norris", number: 1, dateOfBirth: "13 November 1999", photo: "/api/driver-images/landonorris.jpg" },
  { teamSlug: "McLaren", firstName: "Oscar", lastName: "Piastri", number: 81, dateOfBirth: "6 April 2001", photo: "/api/driver-images/oscarpiastri.jpg" },
  { teamSlug: "Mercedes", firstName: "George", lastName: "Russell", number: 63, dateOfBirth: "15 February 1998", photo: "/api/driver-images/georgerussell.jpg" },
  { teamSlug: "Mercedes", firstName: "Kimi", lastName: "Antonelli", number: 12, dateOfBirth: "25 August 2006", photo: "/api/driver-images/andreakimiantonelli.jpg" },
  { teamSlug: "Racing_Bulls", firstName: "Liam", lastName: "Lawson", number: 30, dateOfBirth: "11 February 2002", photo: "/api/driver-images/liamlawson.jpg" },
  { teamSlug: "Racing_Bulls", firstName: "Arvid", lastName: "Lindblad", number: 41, dateOfBirth: "8 August 2007", photo: "https://media.formula1.com/image/upload/t_16by9Centre/c_lfill%2Cw_3392/q_auto/v1740000001/fom-website/2026/Racing%20Bulls%20%28VCARB%29/GettyImages-2250911260.webp" },
  { teamSlug: "Red_Bull", firstName: "Max", lastName: "Verstappen", number: 3, dateOfBirth: "30 September 1997", photo: "/api/driver-images/maxverstappen.jpg" },
  { teamSlug: "Red_Bull", firstName: "Isack", lastName: "Hadjar", number: 6, dateOfBirth: "28 September 2004", photo: "/api/driver-images/isackhadjar.jpg" },
  { teamSlug: "Williams", firstName: "Alexander", lastName: "Albon", number: 23, dateOfBirth: "23 March 1996", photo: "/api/driver-images/alexanderalbon.jpg" },
  { teamSlug: "Williams", firstName: "Carlos", lastName: "Sainz", number: 55, dateOfBirth: "1 September 1994", photo: "/api/driver-images/carlossainz.jpg" },
];
const completedRaceResultsByRound = {
  1: [
    { driverName: "George Russell", finishPosition: 1, points: 25, resultTime: "1:23:06.801" },
    { driverName: "Kimi Antonelli", finishPosition: 2, points: 18, resultTime: "+2.974s" },
    { driverName: "Charles Leclerc", finishPosition: 3, points: 15, resultTime: "+15.519s" },
    { driverName: "Lewis Hamilton", finishPosition: 4, points: 12, resultTime: "+16.144s" },
    { driverName: "Lando Norris", finishPosition: 5, points: 10, resultTime: "+51.741s" },
    { driverName: "Max Verstappen", finishPosition: 6, points: 8, resultTime: "+54.617s" },
    { driverName: "Oliver Bearman", finishPosition: 7, points: 6, resultTime: "+1 lap" },
    { driverName: "Arvid Lindblad", finishPosition: 8, points: 4, resultTime: "+1 lap" },
    { driverName: "Gabriel Bortoleto", finishPosition: 9, points: 2, resultTime: "+1 lap" },
    { driverName: "Pierre Gasly", finishPosition: 10, points: 1, resultTime: "+1 lap" },
    { driverName: "Esteban Ocon", finishPosition: 11, points: 0, resultTime: "+1 lap" },
    { driverName: "Alexander Albon", finishPosition: 12, points: 0, resultTime: "+1 lap" },
    { driverName: "Liam Lawson", finishPosition: 13, points: 0, resultTime: "+1 lap" },
    { driverName: "Franco Colapinto", finishPosition: 14, points: 0, resultTime: "+2 laps" },
    { driverName: "Carlos Sainz", finishPosition: 15, points: 0, resultTime: "+2 laps" },
    { driverName: "Sergio Perez", finishPosition: 16, points: 0, resultTime: "+3 laps" },
    { driverName: "Lance Stroll", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Fernando Alonso", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Valtteri Bottas", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Isack Hadjar", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Oscar Piastri", finishPosition: null, points: 0, resultTime: "DNS" },
    { driverName: "Nico Hulkenberg", finishPosition: null, points: 0, resultTime: "DNS" },
  ],
  2: [
    { driverName: "Kimi Antonelli", finishPosition: 1, points: 25, resultTime: "1:33:15.607" },
    { driverName: "George Russell", finishPosition: 2, points: 18, resultTime: "+5.515s" },
    { driverName: "Lewis Hamilton", finishPosition: 3, points: 15, resultTime: "+25.267s" },
    { driverName: "Charles Leclerc", finishPosition: 4, points: 12, resultTime: "+28.894s" },
    { driverName: "Oliver Bearman", finishPosition: 5, points: 10, resultTime: "+57.268s" },
    { driverName: "Pierre Gasly", finishPosition: 6, points: 8, resultTime: "+59.647s" },
    { driverName: "Liam Lawson", finishPosition: 7, points: 6, resultTime: "+80.588s" },
    { driverName: "Isack Hadjar", finishPosition: 8, points: 4, resultTime: "+87.247s" },
    { driverName: "Carlos Sainz", finishPosition: 9, points: 2, resultTime: "+1 lap" },
    { driverName: "Franco Colapinto", finishPosition: 10, points: 1, resultTime: "+1 lap" },
    { driverName: "Nico Hulkenberg", finishPosition: 11, points: 0, resultTime: "+1 lap" },
    { driverName: "Arvid Lindblad", finishPosition: 12, points: 0, resultTime: "+1 lap" },
    { driverName: "Valtteri Bottas", finishPosition: 13, points: 0, resultTime: "+1 lap" },
    { driverName: "Esteban Ocon", finishPosition: 14, points: 0, resultTime: "+1 lap" },
    { driverName: "Sergio Perez", finishPosition: 15, points: 0, resultTime: "+1 lap" },
    { driverName: "Max Verstappen", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Fernando Alonso", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Lance Stroll", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Oscar Piastri", finishPosition: null, points: 0, resultTime: "DNS" },
    { driverName: "Lando Norris", finishPosition: null, points: 0, resultTime: "DNS" },
    { driverName: "Gabriel Bortoleto", finishPosition: null, points: 0, resultTime: "DNS" },
    { driverName: "Alexander Albon", finishPosition: null, points: 0, resultTime: "DNS" },
  ],
  3: [
    { driverName: "Kimi Antonelli", finishPosition: 1, points: 25, resultTime: "1:28:03.403" },
    { driverName: "Oscar Piastri", finishPosition: 2, points: 18, resultTime: "+13.722s" },
    { driverName: "Charles Leclerc", finishPosition: 3, points: 15, resultTime: "+15.270s" },
    { driverName: "George Russell", finishPosition: 4, points: 12, resultTime: "+15.754s" },
    { driverName: "Lando Norris", finishPosition: 5, points: 10, resultTime: "+23.479s" },
    { driverName: "Lewis Hamilton", finishPosition: 6, points: 8, resultTime: "+25.037s" },
    { driverName: "Pierre Gasly", finishPosition: 7, points: 6, resultTime: "+32.340s" },
    { driverName: "Max Verstappen", finishPosition: 8, points: 4, resultTime: "+32.677s" },
    { driverName: "Liam Lawson", finishPosition: 9, points: 2, resultTime: "+50.180s" },
    { driverName: "Esteban Ocon", finishPosition: 10, points: 1, resultTime: "+51.216s" },
    { driverName: "Nico Hulkenberg", finishPosition: 11, points: 0, resultTime: "+52.280s" },
    { driverName: "Isack Hadjar", finishPosition: 12, points: 0, resultTime: "+56.154s" },
    { driverName: "Gabriel Bortoleto", finishPosition: 13, points: 0, resultTime: "+59.078s" },
    { driverName: "Arvid Lindblad", finishPosition: 14, points: 0, resultTime: "+59.848s" },
    { driverName: "Carlos Sainz", finishPosition: 15, points: 0, resultTime: "+65.008s" },
    { driverName: "Franco Colapinto", finishPosition: 16, points: 0, resultTime: "+65.773s" },
    { driverName: "Sergio Perez", finishPosition: 17, points: 0, resultTime: "+92.453s" },
    { driverName: "Fernando Alonso", finishPosition: 18, points: 0, resultTime: "+1 lap" },
    { driverName: "Valtteri Bottas", finishPosition: 19, points: 0, resultTime: "+1 lap" },
    { driverName: "Alexander Albon", finishPosition: 20, points: 0, resultTime: "+2 laps" },
    { driverName: "Lance Stroll", finishPosition: null, points: 0, resultTime: "DNF" },
    { driverName: "Oliver Bearman", finishPosition: null, points: 0, resultTime: "DNF" },
  ],
};
const sprintBonusPointsByRound = {
  2: {
    "George Russell": 8,
    "Charles Leclerc": 7,
    "Lewis Hamilton": 6,
    "Lando Norris": 5,
    "Kimi Antonelli": 4,
    "Oscar Piastri": 3,
    "Liam Lawson": 2,
    "Oliver Bearman": 1,
  },
};

const defaultRootGroupMembers = [
  {
    firstName: "Tijn",
    lastName: "Bisschop",
    age: 19,
    email: "h.f.a.bisschop@students.uu.nl",
    photo: "assets/images/students/Tijn_Bisschop.png",
    major: "Informatica and Mathematics",
    hobbies: ["Netflix", "Skating", "Singing"],
    courses: [
      {
        title: "Webtechnology",
        description:
          "Internet is the most relevant information technology of our age. World Wide Web is its most important application. We all use it daily for our routine information tasks. In this course, you will learn the architecture of WWW, its main protocols, representation formats, and development technologies. The practical component of the course will focus on design and implementation of Web applications that are interactive and secure.",
        teacher: {
          firstName: "Sergey",
          lastName: "Sosnovsky",
        },
      },
      {
        title: "Databases",
        description:
          "Business processes primarily revolve around information processing. This information must be maintained, which is why database management systems (DBMSs) exist. The differences from simple file systems are numerous. For example, there are 'query languages' for easy information retrieval, 'transaction systems' to ensure that many users can access and modify the information simultaneously, and schema information to understand the actual meaning of the data. This course covers the basics of relational databases, with an emphasis on design and query languages. We also examine the internal workings of a database system: how transactions are processed, how a query is optimized, and how it is executed. Finally, we will discuss some recent developments, such as NoSQL databases.",
        teacher: {
          firstName: "Hans",
          lastName: "Philippi",
        },
      },
      {
        title: "Analysis",
        description:
          "The goal of this course is to provide an introduction to analysis. This course forms an important foundation for almost all advanced courses in mathematics. Experience from previous years shows that the course is considered relatively difficult. Therefore, keep up with the course every week. Even if you don't pass the exam, it's important to acquire sufficient knowledge to be able to take second-year courses next year.",
        teacher: {
          firstName: "Erik",
          lastName: "van den Ban",
        },
      },
    ],
  },
  {
    firstName: "Darryl",
    lastName: "Chedi",
    age: 19,
    email: "s.r.chedi@students.uu.nl",
    photo: "assets/images/students/Darryl_Chedi.jpg",
    major: "Computer Science",
    hobbies: ["Drawing", "Gaming", "Travelling"],
    courses: [
      {
        title: "Webtechnology",
        description:
          "Internet is the most relevant information technology of our age. World Wide Web is its most important application. We all use it daily for our routine information tasks. In this course, you will learn the architecture of WWW, its main protocols, representation formats, and development technologies. The practical component of the course will focus on design and implementation of Web applications that are interactive and secure.",
        teacher: {
          firstName: "Sergey",
          lastName: "Sosnovsky",
        },
      },
      {
        title: "Databases",
        description:
          'Business processes primarily revolve around information processing. This information must be maintained, which is why database management systems (DBMSs) exist. The differences from simple file systems are numerous. For example, there are "query languages" for easy information retrieval, "transaction systems" to ensure that many users can access and modify the information simultaneously, and schema information to understand the actual meaning of the data. This course covers the basics of relational databases, with an emphasis on design and query languages. We also examine the internal workings of a database system: how transactions are processed, how a query is optimized, and how it is executed. Finally, we will discuss some recent developments, such as NoSQL databases.',
        teacher: {
          firstName: "Hans",
          lastName: "Philippi",
        },
      },
    ],
  },
  {
    firstName: "Benjamin",
    lastName: "Tak",
    age: 19,
    email: "b.m.j.tak@students.uu.nl",
    photo: "assets/images/students/Benjamin_Tak.jpg",
    major: "Computer Science",
    hobbies: ["Programming", "Gaming", "Poker"],
    courses: [
      {
        title: "Webtechnology",
        description:
          "Internet is the most relevant information technology of our age. World Wide Web is its most important application. We all use it daily for our routine information tasks. In this course, you will learn the architecture of WWW, its main protocols, representation formats, and development technologies. The practical component of the course will focus on design and implementation of Web applications that are interactive and secure.",
        teacher: {
          firstName: "Sergey",
          lastName: "Sosnovsky",
        },
      },
      {
        title: "Databases",
        description:
          'Business processes primarily revolve around information processing. This information must be maintained, which is why database management systems (DBMSs) exist. The differences from simple file systems are numerous. For example, there are "query languages" for easy information retrieval, "transaction systems" to ensure that many users can access and modify the information simultaneously, and schema information to understand the actual meaning of the data. This course covers the basics of relational databases, with an emphasis on design and query languages. We also examine the internal workings of a database system: how transactions are processed, how a query is optimized, and how it is executed. Finally, we will discuss some recent developments, such as NoSQL databases.',
        teacher: {
          firstName: "Hans",
          lastName: "Philippi",
        },
      },
    ],
  },
];

function stringValue(rawValue) {
  return String(rawValue || "").trim();
}

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(identifier))) {
    throw new Error("Unsafe SQLite identifier: " + String(identifier));
  }

  return '"' + String(identifier) + '"';
}

async function tableExists(database, tableName) {
  return Boolean(
    await database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(tableName),
  );
}

async function getTableColumns(database, tableName) {
  if (!(await tableExists(database, tableName))) {
    return [];
  }

  return database.prepare("PRAGMA table_info(" + quoteIdentifier(tableName) + ")").all();
}

async function columnExists(database, tableName, columnName) {
  return (await getTableColumns(database, tableName)).some(function hasColumn(column) {
    return column.name === columnName;
  });
}

function normalizeEntityToken(rawValue) {
  return String(rawValue || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function splitDisplayName(displayName) {
  const cleanedName = stringValue(displayName).replace(/\s+/g, " ");

  if (!cleanedName) {
    return {
      firstName: "Unknown",
      lastName: "Driver",
    };
  }

  const nameParts = cleanedName.split(" ");

  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: "Driver",
    };
  }

  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" "),
  };
}

function toDisplayName(firstName, lastName) {
  return String((stringValue(firstName) + " " + stringValue(lastName)).trim());
}

function buildDriverId(displayName) {
  return stringValue(displayName)
    .replace(/['â€™]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(function mapNamePart(namePart) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    })
    .join("-");
}

function buildPlayerTokens(firstName, lastName, displayName) {
  const tokens = new Set();
  const normalizedDisplayName = normalizeEntityToken(displayName);
  const normalizedFullName = normalizeEntityToken(toDisplayName(firstName, lastName));
  const normalizedLastName = normalizeEntityToken(lastName);
  const displayNameParts = stringValue(displayName).split(/\s+/).filter(Boolean);

  if (normalizedDisplayName) {
    tokens.add(normalizedDisplayName);
  }

  if (normalizedFullName) {
    tokens.add(normalizedFullName);
  }

  if (stringValue(lastName).includes(" ") && normalizedLastName) {
    tokens.add(normalizedLastName);
  }

  if (displayNameParts.length > 2) {
    tokens.add(normalizeEntityToken(displayNameParts.slice(1).join(" ")));
  }

  return Array.from(tokens);
}

function parseDriverNumber(rawValue) {
  const parsedValue = Number.parseInt(stringValue(rawValue), 10);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function calculatePoints(finishPosition) {
  return pointsByFinishPosition[finishPosition] || 0;
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return salt + ":" + hash;
}

function normalizeEmailAddress(rawValue) {
  return stringValue(rawValue).toLowerCase();
}

function verifyPassword(password, storedPasswordHash) {
  const normalizedPasswordHash = stringValue(storedPasswordHash);

  if (!normalizedPasswordHash.includes(":")) {
    return String(password) === normalizedPasswordHash;
  }

  const hashParts = normalizedPasswordHash.split(":");

  if (hashParts.length !== 2) {
    return false;
  }

  const salt = hashParts[0];
  const storedHashBuffer = Buffer.from(hashParts[1], "hex");
  const candidateHashBuffer = crypto.scryptSync(String(password), salt, storedHashBuffer.length);

  return (
    storedHashBuffer.length === candidateHashBuffer.length &&
    crypto.timingSafeEqual(storedHashBuffer, candidateHashBuffer)
  );
}

async function getSchemaMetaValue(database, keyValue) {
  if (!(await tableExists(database, "schema_meta"))) {
    return null;
  }

  const schemaRow = await database
    .prepare("SELECT value FROM schema_meta WHERE key = ?")
    .get(keyValue);

  return schemaRow ? String(schemaRow.value) : null;
}

async function setSchemaMetaValue(database, keyValue, value) {
  await database
    .prepare(
      "INSERT INTO schema_meta (key, value) VALUES (?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(keyValue, String(value));
}

async function getSchemaVersion(database) {
  return getSchemaMetaValue(database, "league_schema_version");
}

async function setSchemaVersion(database, versionValue) {
  await setSchemaMetaValue(database, "league_schema_version", versionValue);
}

async function readExistingTeams(database) {
  if (!(await tableExists(database, "teams"))) {
    return [];
  }

  return database
    .prepare(
      "SELECT id, slug, name, description, logo_image, team_image " +
        "FROM teams ORDER BY id",
    )
    .all();
}

async function readExistingPlayers(database) {
  if (!(await tableExists(database, "players"))) {
    return [];
  }

  if (await columnExists(database, "players", "current_team_id")) {
    return database
      .prepare(
        "SELECT id, current_team_id AS team_id, first_name, last_name, date_of_birth, role, " +
          "driver_number, photo, COALESCE(is_active, 1) AS is_active " +
          "FROM players ORDER BY id",
      )
      .all();
  }

  return database
    .prepare(
      "SELECT id, team_id, first_name, last_name, age_or_dob AS date_of_birth, position AS role, " +
        "number AS driver_number, photo, 1 AS is_active " +
        "FROM players ORDER BY id",
    )
    .all();
}

async function readExistingUsers(database) {
  if (!(await tableExists(database, "users"))) {
    return [];
  }

  if (
    (await columnExists(database, "users", "email")) &&
    (await columnExists(database, "users", "first_name")) &&
    (await columnExists(database, "users", "last_name")) &&
    (await columnExists(database, "users", "password_hash"))
  ) {
    const hasRoleColumn = await columnExists(database, "users", "role");
    const hasIsAdminColumn = await columnExists(database, "users", "is_admin");
    const hasFavoriteTeamColumn = await columnExists(database, "users", "favorite_team_id");

    return database
      .prepare(
        "SELECT email, first_name, last_name, password_hash, " +
          (hasFavoriteTeamColumn ? "favorite_team_id" : "NULL AS favorite_team_id") +
          ", " +
          (hasRoleColumn ? "role" : "'visitor' AS role") +
          ", " +
          (hasIsAdminColumn
            ? "is_admin"
            : hasRoleColumn
              ? "CASE WHEN role = 'admin' THEN 1 ELSE 0 END AS is_admin"
              : "0 AS is_admin") +
          " FROM users ORDER BY id",
      )
      .all();
  }

  return [];
}

async function readExistingUsersForSeed(database) {
  const normalizedUsers = await readExistingUsers(database);

  if (normalizedUsers.length > 0) {
    return normalizedUsers.map(function mapNormalizedUser(userRow) {
      return {
        email: userRow.email,
        first_name: userRow.first_name,
        last_name: userRow.last_name,
        password_hash: userRow.password_hash,
        favorite_team_id: userRow.favorite_team_id,
        role: userRow.role,
        is_admin: Number(userRow.is_admin) ? 1 : 0,
      };
    });
  }

  return [];
}

async function ensureSupportTables(database) {
  await database.exec(
    "CREATE TABLE IF NOT EXISTS schema_meta (" +
      "key TEXT PRIMARY KEY, " +
      "value TEXT NOT NULL" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS root_site_data (" +
      "scope_key TEXT NOT NULL, " +
      "file_name TEXT NOT NULL, " +
      "payload TEXT NOT NULL, " +
      "PRIMARY KEY (scope_key, file_name)" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS driver_images (" +
      "image_key TEXT PRIMARY KEY, " +
      "file_name TEXT NOT NULL, " +
      "content_type TEXT NOT NULL, " +
      "image_blob BLOB NOT NULL" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS team_site_data (" +
      "team_slug TEXT NOT NULL, " +
      "file_name TEXT NOT NULL, " +
      "payload TEXT NOT NULL, " +
      "PRIMARY KEY (team_slug, file_name)" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS team_site_drivers (" +
      "team_slug TEXT NOT NULL, " +
      "driver_key TEXT NOT NULL, " +
      "sort_order INTEGER NOT NULL DEFAULT 0, " +
      "driver_id TEXT NOT NULL, " +
      "display_name TEXT NOT NULL, " +
      "full_name TEXT, " +
      "wiki_url TEXT, " +
      "image_path TEXT, " +
      "age_text TEXT, " +
      "birth_date TEXT, " +
      "birth_place TEXT, " +
      "nationality TEXT, " +
      "driver_number TEXT, " +
      "wins_text TEXT, " +
      "first_name TEXT, " +
      "last_name TEXT, " +
      "born_text TEXT, " +
      "role TEXT, " +
      "photo TEXT, " +
      "PRIMARY KEY (team_slug, driver_key)" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS team_site_driver_former_teams (" +
      "team_slug TEXT NOT NULL, " +
      "driver_key TEXT NOT NULL, " +
      "sort_order INTEGER NOT NULL DEFAULT 0, " +
      "title TEXT NOT NULL, " +
      "city TEXT, " +
      "country TEXT, " +
      "PRIMARY KEY (team_slug, driver_key, sort_order)" +
      ")",
  );
}

async function ensureDefaultRootSiteData(database) {
  await database
    .prepare(
      "INSERT OR REPLACE INTO root_site_data (scope_key, file_name, payload) VALUES (?, ?, ?)",
    )
    .run("root", "groupMembers.json", JSON.stringify(defaultRootGroupMembers));
  await database
    .prepare(
      "INSERT OR REPLACE INTO root_site_data (scope_key, file_name, payload) VALUES (?, ?, ?)",
    )
    .run("root", "leagueInfo.json", JSON.stringify(currentLeagueInfo));
  await database
    .prepare("DELETE FROM root_site_data WHERE scope_key = ? AND file_name = ?")
    .run("root", "leaderData.json");
}

function buildTeamSiteDriverKey(driverRecord, sortOrder) {
  const derivedName =
    stringValue(driverRecord && (driverRecord.id || driverRecord.fullName || driverRecord.name)) ||
    toDisplayName(driverRecord && driverRecord.firstName, driverRecord && driverRecord.lastName) ||
    "driver-" + String(sortOrder);

  return normalizeEntityToken(derivedName) || "driver-" + String(sortOrder);
}

async function syncTeamSiteDriversFromLegacyPayloads(database) {
  if (
    !(await tableExists(database, "team_site_data")) ||
    !(await tableExists(database, "team_site_drivers"))
  ) {
    return;
  }

  const legacyDriverRows = await database
    .prepare("SELECT team_slug, payload FROM team_site_data WHERE file_name = ? ORDER BY team_slug")
    .all("driversData.json");

  if (legacyDriverRows.length === 0) {
    return;
  }

  const deleteTeamDrivers = database.prepare("DELETE FROM team_site_drivers WHERE team_slug = ?");
  const deleteFormerTeams = database.prepare("DELETE FROM team_site_driver_former_teams WHERE team_slug = ?");
  const insertDriver = database.prepare(
    "INSERT INTO team_site_drivers (" +
      "team_slug, driver_key, sort_order, driver_id, display_name, full_name, wiki_url, image_path, age_text, birth_date, birth_place, nationality, driver_number, wins_text, first_name, last_name, born_text, role, photo" +
      ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertFormerTeam = database.prepare(
    "INSERT INTO team_site_driver_former_teams (" +
      "team_slug, driver_key, sort_order, title, city, country" +
      ") VALUES (?, ?, ?, ?, ?, ?)",
  );
  const deleteLegacyRows = database.prepare("DELETE FROM team_site_data WHERE team_slug = ? AND file_name = ?");

  for (const row of legacyDriverRows) {
    let payload = [];

    try {
      payload = JSON.parse(row.payload);
    } catch (error) {
      payload = [];
    }

    await deleteFormerTeams.run(row.team_slug);
    await deleteTeamDrivers.run(row.team_slug);

    for (const [driverIndex, driverRecord] of (Array.isArray(payload) ? payload : []).entries()) {
      if (!driverRecord || typeof driverRecord !== "object") {
        continue;
      }

      const derivedName =
        stringValue(driverRecord.fullName || driverRecord.name) ||
        toDisplayName(driverRecord.firstName, driverRecord.lastName) ||
        "Unknown Driver";
      const splitName = splitDisplayName(derivedName);
      const driverKey = buildTeamSiteDriverKey(driverRecord, driverIndex);

      await insertDriver.run(
        row.team_slug,
        driverKey,
        driverIndex,
        stringValue(driverRecord.id) || buildDriverId(derivedName),
        derivedName,
        stringValue(driverRecord.fullName) || derivedName,
        stringValue(driverRecord.wikiUrl),
        stringValue(driverRecord.image),
        stringValue(driverRecord.age),
        stringValue(driverRecord.birthDate),
        stringValue(driverRecord.birthPlace),
        stringValue(driverRecord.nationality),
        stringValue(driverRecord.number),
        stringValue(driverRecord.wins),
        stringValue(driverRecord.firstName) || splitName.firstName,
        stringValue(driverRecord.lastName) || splitName.lastName,
        stringValue(driverRecord.born),
        stringValue(driverRecord.role) || "Driver",
        stringValue(driverRecord.photo) || stringValue(driverRecord.image),
      );

      for (const [formerTeamIndex, formerTeam] of (Array.isArray(driverRecord.formerTeams)
        ? driverRecord.formerTeams
        : []).entries()) {
        if (!formerTeam || typeof formerTeam !== "object" || !stringValue(formerTeam.title)) {
          continue;
        }

        await insertFormerTeam.run(
          row.team_slug,
          driverKey,
          formerTeamIndex,
          stringValue(formerTeam.title),
          stringValue(formerTeam.city),
          stringValue(formerTeam.country),
        );
      }
    }

    await deleteLegacyRows.run(row.team_slug, "driversData.json");
  }
}

async function createNormalizedCoreTables(database) {
  await database.exec(
    "CREATE TABLE IF NOT EXISTS teams (" +
      "id INTEGER PRIMARY KEY, " +
      "slug TEXT NOT NULL UNIQUE, " +
      "name TEXT NOT NULL, " +
      "description TEXT NOT NULL, " +
      "logo_image TEXT NOT NULL, " +
      "team_image TEXT NOT NULL, " +
      "base_location TEXT, " +
      "founded_year INTEGER" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS users (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "email TEXT NOT NULL UNIQUE, " +
      "first_name TEXT NOT NULL, " +
      "last_name TEXT NOT NULL, " +
      "password_hash TEXT NOT NULL, " +
      "favorite_team_id INTEGER, " +
      "is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)), " +
      "role TEXT NOT NULL DEFAULT 'visitor', " +
      "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
      "FOREIGN KEY (favorite_team_id) REFERENCES teams(id) ON DELETE SET NULL" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS players (" +
      "id INTEGER PRIMARY KEY, " +
      "current_team_id INTEGER, " +
      "first_name TEXT NOT NULL, " +
      "last_name TEXT NOT NULL, " +
      "date_of_birth TEXT NOT NULL, " +
      "role TEXT NOT NULL, " +
      "driver_number INTEGER, " +
      "photo TEXT NOT NULL, " +
      "is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)), " +
      "FOREIGN KEY (current_team_id) REFERENCES teams(id) ON DELETE SET NULL" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS team_memberships (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "player_id INTEGER NOT NULL, " +
      "team_id INTEGER NOT NULL, " +
      "start_season INTEGER NOT NULL DEFAULT 0, " +
      "end_season INTEGER NOT NULL DEFAULT 0, " +
      "is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0, 1)), " +
      "FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE, " +
      "FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, " +
      "UNIQUE (player_id, team_id, start_season, end_season, is_current)" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS races (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "slug TEXT NOT NULL UNIQUE, " +
      "season INTEGER NOT NULL, " +
      "round_number INTEGER, " +
      "name TEXT NOT NULL, " +
      "circuit_name TEXT NOT NULL, " +
      "scheduled_at TEXT, " +
      "status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed'))" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS race_entries (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "race_id INTEGER NOT NULL, " +
      "team_id INTEGER NOT NULL, " +
      "entry_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (entry_status IN ('scheduled', 'completed')), " +
      "team_points INTEGER NOT NULL DEFAULT 0, " +
      "FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE, " +
      "FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, " +
      "UNIQUE (race_id, team_id)" +
      ")",
  );
  await database.exec(
    "CREATE TABLE IF NOT EXISTS scores (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
      "race_id INTEGER NOT NULL, " +
      "team_id INTEGER NOT NULL, " +
      "player_id INTEGER NOT NULL, " +
      "finish_position INTEGER, " +
      "points INTEGER NOT NULL DEFAULT 0, " +
      "bonus_points INTEGER NOT NULL DEFAULT 0, " +
      "result_time TEXT, " +
      "status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')), " +
      "FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE, " +
      "FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, " +
      "FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE, " +
      "FOREIGN KEY (race_id, team_id) REFERENCES race_entries(race_id, team_id) ON DELETE CASCADE, " +
      "UNIQUE (race_id, player_id)" +
      ")",
  );
  await database.exec(
    "CREATE INDEX IF NOT EXISTS idx_players_current_team_id ON players(current_team_id)",
  );
  await database.exec(
    "CREATE INDEX IF NOT EXISTS idx_team_memberships_player_id ON team_memberships(player_id)",
  );
  await database.exec(
    "CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON team_memberships(team_id)",
  );
  await database.exec(
    "CREATE INDEX IF NOT EXISTS idx_race_entries_race_id ON race_entries(race_id)",
  );
  await database.exec(
    "CREATE INDEX IF NOT EXISTS idx_scores_race_id ON scores(race_id)",
  );
  await database.exec(
    "CREATE INDEX IF NOT EXISTS idx_scores_player_id ON scores(player_id)",
  );
}

async function insertTeams(database, teams) {
  const insertTeam = database.prepare(
    "INSERT INTO teams (id, slug, name, description, logo_image, team_image, base_location, founded_year) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );

  for (const teamRow of teams) {
    await insertTeam.run(
      teamRow.id,
      teamRow.slug,
      teamRow.name,
      teamRow.description,
      teamRow.logo_image,
      teamRow.team_image,
      null,
      null,
    );
  }
}

async function insertActivePlayers(database, players) {
  const insertPlayer = database.prepare(
    "INSERT INTO players (id, current_team_id, first_name, last_name, date_of_birth, role, driver_number, photo, is_active) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  for (const playerRow of players) {
    await insertPlayer.run(
      playerRow.id,
      playerRow.team_id,
      playerRow.first_name,
      playerRow.last_name,
      playerRow.date_of_birth,
      playerRow.role,
      playerRow.driver_number,
      playerRow.photo,
      playerRow.is_active ? 1 : 0,
    );
  }
}

function capitalizeWord(wordValue) {
  const cleanedWord = stringValue(wordValue);

  if (!cleanedWord) {
    return "";
  }

  return cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1).toLowerCase();
}

function buildSeedUsers(existingUsers, teamIdBySlug) {
  const seedUsers = [];
  const seenEmails = new Set();

  function pushUser(seedUser) {
    const normalizedEmail = normalizeEmailAddress(seedUser.email);

    if (!normalizedEmail || seenEmails.has(normalizedEmail)) {
      return;
    }

    seenEmails.add(normalizedEmail);
    seedUsers.push(seedUser);
  }

  existingUsers.forEach(function addExistingUser(userRow) {
    const normalizedEmail = normalizeEmailAddress(userRow.email);
    const normalizedExistingLogin = normalizeEmailAddress(userRow.username);
    const fallbackLogin =
      normalizedEmail || normalizedExistingLogin || "visitor@f1.local";
    const hasStructuredFields =
      Boolean(normalizedEmail) &&
      Boolean(stringValue(userRow.first_name)) &&
      Boolean(stringValue(userRow.last_name)) &&
      Boolean(stringValue(userRow.password_hash));
    const fallbackName =
      fallbackLogin === "admin" || fallbackLogin === "admin@f1.local"
        ? "Admin User"
        : fallbackLogin.replace(/@.*$/, "").replace(/[._-]+/g, " ");
    const nameParts = splitDisplayName(fallbackName);
    const resolvedEmail =
      normalizedEmail ||
      (normalizedExistingLogin.includes("@")
        ? normalizedExistingLogin
        : normalizedExistingLogin
          ? normalizedExistingLogin + "@f1.local"
          : "visitor@f1.local");
    const isAdminUser =
      Number(userRow.is_admin) === 1 ||
      stringValue(userRow.role) === "admin" ||
      resolvedEmail === "admin@f1.local" ||
      normalizedExistingLogin === "admin";

    pushUser({
      email: resolvedEmail,
      firstName: stringValue(userRow.first_name) || capitalizeWord(nameParts.firstName),
      lastName: stringValue(userRow.last_name) || capitalizeWord(nameParts.lastName),
      password:
        hasStructuredFields ? "" : stringValue(userRow.password) || resolvedEmail + "123456",
      passwordHash: hasStructuredFields ? stringValue(userRow.password_hash) : "",
      favoriteTeamId:
        userRow.favorite_team_id ||
        (isAdminUser ? teamIdBySlug.get("Red_Bull") || null : null),
      role: stringValue(userRow.role) || (isAdminUser ? "admin" : "visitor"),
      isAdmin: isAdminUser ? 1 : 0,
    });
  });

  [
    {
      email: "admin@f1.local",
      firstName: "Admin",
      lastName: "User",
      password: "dolfijn123",
      passwordHash: "",
      favoriteTeamId: teamIdBySlug.get("Red_Bull") || null,
      role: "admin",
      isAdmin: 1,
    },
    {
      email: "racefan@f1.local",
      firstName: "Race",
      lastName: "Fan",
      password: "racefan123",
      passwordHash: "",
      favoriteTeamId: teamIdBySlug.get("McLaren") || null,
      role: "visitor",
      isAdmin: 0,
    },
    {
      email: "gridwatcher@f1.local",
      firstName: "Grid",
      lastName: "Watcher",
      password: "gridwatch123",
      passwordHash: "",
      favoriteTeamId: teamIdBySlug.get("Williams") || null,
      role: "visitor",
      isAdmin: 0,
    },
  ].forEach(pushUser);

  return seedUsers;
}

async function syncTeamMemberships(database) {
  const insertMembership = database.prepare(
    "INSERT OR IGNORE INTO team_memberships (player_id, team_id, start_season, end_season, is_current) " +
      "VALUES (?, ?, ?, ?, ?)",
  );
  const activePlayers = await database
    .prepare(
      "SELECT id, current_team_id FROM players " +
        "WHERE current_team_id IS NOT NULL AND is_active = 1",
    )
    .all();

  await database.exec("DELETE FROM team_memberships");

  for (const playerRow of activePlayers) {
    await insertMembership.run(playerRow.id, playerRow.current_team_id, 0, 0, 1);
  }
}

async function buildPlayersByToken(database) {
  const playersByToken = new Map();
  const playerRows = await database
    .prepare("SELECT id, first_name, last_name FROM players ORDER BY id")
    .all();

  playerRows.forEach(function addPlayer(playerRow) {
    buildPlayerTokens(
      playerRow.first_name,
      playerRow.last_name,
      toDisplayName(playerRow.first_name, playerRow.last_name),
    ).forEach(function addToken(playerToken) {
      if (playerToken && !playersByToken.has(playerToken)) {
        playersByToken.set(playerToken, playerRow.id);
      }
    });
  });

  return playersByToken;
}

async function insertInactivePlayersFromTeamData(database) {
  if (!(await tableExists(database, "team_site_drivers"))) {
    return;
  }

  const insertPlayer = database.prepare(
    "INSERT INTO players (current_team_id, first_name, last_name, date_of_birth, role, driver_number, photo, is_active) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
  );
  const playersByToken = await buildPlayersByToken(database);
  const playerTeamStateById = new Map();
  const teamRows = await database.prepare("SELECT id, slug FROM teams ORDER BY id").all();
  const teamIdBySlug = new Map();
  const insertMembership = database.prepare(
    "INSERT OR IGNORE INTO team_memberships (player_id, team_id, start_season, end_season, is_current) " +
      "VALUES (?, ?, ?, ?, 0)",
  );
  const driverRows = await database
    .prepare(
      "SELECT team_slug, driver_id, display_name, full_name, first_name, last_name, birth_date, born_text, role, driver_number, photo, image_path " +
        "FROM team_site_drivers " +
        "ORDER BY team_slug, sort_order, display_name",
    )
    .all();

  teamRows.forEach(function indexTeam(teamRow) {
    teamIdBySlug.set(teamRow.slug, teamRow.id);
  });
  (await database
    .prepare("SELECT id, current_team_id, is_active FROM players ORDER BY id")
    .all())
    .forEach(function indexPlayerState(playerRow) {
      playerTeamStateById.set(playerRow.id, {
        currentTeamId: playerRow.current_team_id,
        isActive: Number(playerRow.is_active) === 1,
      });
    });

  for (const driverRecord of driverRows) {
      const derivedName =
        driverRecord.full_name ||
        driverRecord.display_name ||
        toDisplayName(driverRecord.first_name, driverRecord.last_name);
      const splitName = splitDisplayName(derivedName);
      const playerTokens = buildPlayerTokens(
        splitName.firstName,
        splitName.lastName,
        driverRecord.full_name || driverRecord.display_name || driverRecord.driver_id,
      );
      const existingPlayerToken = playerTokens.find(function findPlayerId(playerToken) {
        return playersByToken.has(playerToken);
      });

      if (existingPlayerToken) {
        const existingPlayerId = playersByToken.get(existingPlayerToken);
        const teamId = teamIdBySlug.get(driverRecord.team_slug);
        const playerState = playerTeamStateById.get(existingPlayerId) || {
          currentTeamId: null,
          isActive: false,
        };

        playerTokens.forEach(function indexAlias(playerToken) {
          if (playerToken) {
            playersByToken.set(playerToken, existingPlayerId);
          }
        });

        if (teamId && (!playerState.isActive || playerState.currentTeamId !== teamId)) {
          await insertMembership.run(existingPlayerId, teamId, 0, 0);
        }
        continue;
      }

      const photoPath =
        stringValue(driverRecord.photo) ||
        stringValue(driverRecord.image_path) ||
        "/api/driver-images/" + normalizeEntityToken(derivedName) + ".jpg";
      const insertResult = await insertPlayer.run(
        null,
        splitName.firstName,
        splitName.lastName,
        stringValue(driverRecord.birth_date || driverRecord.born_text || "Unknown"),
        stringValue(driverRecord.role || "Driver"),
        parseDriverNumber(driverRecord.driver_number),
        photoPath,
      );
      const playerId = Number(insertResult.lastInsertRowid);
      const teamId = teamIdBySlug.get(driverRecord.team_slug);

      playerTokens.forEach(function indexPlayer(playerToken) {
        if (playerToken && !playersByToken.has(playerToken)) {
          playersByToken.set(playerToken, playerId);
        }
      });

      if (teamId) {
        await insertMembership.run(playerId, teamId, 0, 0);
      }

      playerTeamStateById.set(playerId, {
        currentTeamId: null,
        isActive: false,
      });
  }
}

function buildRaceSlug(season, circuitName) {
  return String(season) + "-" + normalizeEntityToken(circuitName || "race");
}

function buildScheduledAt(raceSeed) {
  return stringValue(raceSeed && raceSeed.scheduledAt) || null;
}

async function readStoredSitePayload(database, tableName, keyColumn, keyValue, fileName) {
  const row = await database
    .prepare(
      "SELECT payload FROM " +
        tableName +
        " WHERE " +
        keyColumn +
        " = ? AND file_name = ?",
    )
    .get(keyValue, fileName);

  if (!row || !row.payload) {
    return null;
  }

  return JSON.parse(row.payload);
}

async function writeStoredSitePayload(database, tableName, keyColumn, keyValue, fileName, payload) {
  await database
    .prepare(
      "INSERT INTO " +
        tableName +
        " (" +
        keyColumn +
        ", file_name, payload) VALUES (?, ?, ?) " +
        "ON CONFLICT(" +
        keyColumn +
        ", file_name) DO UPDATE SET payload = excluded.payload",
    )
    .run(keyValue, fileName, JSON.stringify(payload));
}

function buildCurrentDriverPhotoPath(driverSeed, existingPlayerRow) {
  const seededPhoto = stringValue(driverSeed.photo);

  if (seededPhoto) {
    return seededPhoto;
  }

  if (existingPlayerRow && stringValue(existingPlayerRow.photo)) {
    return stringValue(existingPlayerRow.photo);
  }

  return "/api/driver-images/" + normalizeEntityToken(toDisplayName(driverSeed.firstName, driverSeed.lastName)) + ".jpg";
}

async function syncCurrentActiveDrivers(database) {
  const teamRows = await database.prepare("SELECT id, slug FROM teams ORDER BY id").all();
  const existingPlayers = await database
    .prepare("SELECT id, first_name, last_name, photo FROM players ORDER BY id")
    .all();
  const teamIdBySlug = new Map();
  const playerByToken = new Map();
  const insertPlayer = database.prepare(
    "INSERT INTO players (current_team_id, first_name, last_name, date_of_birth, role, driver_number, photo, is_active) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
  );
  const updatePlayer = database.prepare(
    "UPDATE players SET current_team_id = ?, first_name = ?, last_name = ?, date_of_birth = ?, role = ?, driver_number = ?, photo = ?, is_active = 1 " +
      "WHERE id = ?",
  );

  teamRows.forEach(function indexTeam(teamRow) {
    teamIdBySlug.set(teamRow.slug, Number(teamRow.id));
  });

  existingPlayers.forEach(function indexPlayer(playerRow) {
    buildPlayerTokens(
      playerRow.first_name,
      playerRow.last_name,
      toDisplayName(playerRow.first_name, playerRow.last_name),
    ).forEach(function indexToken(playerToken) {
      if (playerToken && !playerByToken.has(playerToken)) {
        playerByToken.set(playerToken, playerRow);
      }
    });
  });

  await database.exec("UPDATE players SET current_team_id = NULL, is_active = 0 WHERE is_active = 1");

  for (const driverSeed of currentDriverLineup) {
    const teamId = teamIdBySlug.get(driverSeed.teamSlug);
    const displayName = toDisplayName(driverSeed.firstName, driverSeed.lastName);
    const playerTokens = buildPlayerTokens(driverSeed.firstName, driverSeed.lastName, displayName);
    const existingPlayer = playerTokens.reduce(function findPlayer(foundPlayer, playerToken) {
      return foundPlayer || playerByToken.get(playerToken) || null;
    }, null);
    const photoPath = buildCurrentDriverPhotoPath(driverSeed, existingPlayer);
    let playerId = existingPlayer ? Number(existingPlayer.id) : null;

    if (!teamId) {
      continue;
    }

    if (playerId) {
      await updatePlayer.run(
        teamId,
        driverSeed.firstName,
        driverSeed.lastName,
        driverSeed.dateOfBirth,
        "Driver",
        driverSeed.number,
        photoPath,
        playerId,
      );
    } else {
      const insertResult = await insertPlayer.run(
        teamId,
        driverSeed.firstName,
        driverSeed.lastName,
        driverSeed.dateOfBirth,
        "Driver",
        driverSeed.number,
        photoPath,
      );
      playerId = Number(insertResult.lastInsertRowid);
    }

    playerTokens.forEach(function indexToken(playerToken) {
      if (playerToken) {
        playerByToken.set(playerToken, {
          id: playerId,
          first_name: driverSeed.firstName,
          last_name: driverSeed.lastName,
          photo: photoPath,
        });
      }
    });
  }
}

function buildCarImagePath(teamSlug, fileName) {
  return "/Team_Sites/" + String(teamSlug || "") + "/assets/images/cars/" + String(fileName || "");
}

function buildDriverSiteReference(driverRow) {
  const displayName = toDisplayName(driverRow.first_name, driverRow.last_name);

  return {
    id: buildDriverId(displayName),
    name: displayName,
    fullName: displayName,
    firstName: driverRow.first_name,
    lastName: driverRow.last_name,
    age: "Unknown",
    birthDate: driverRow.date_of_birth,
    birthPlace: "Unknown",
    nationality: "Unknown",
    number: driverRow.driver_number === null || driverRow.driver_number === undefined ? "N/A" : String(driverRow.driver_number),
    wins: "0",
    born: driverRow.date_of_birth,
    role: stringValue(driverRow.role) || "Driver",
    image: driverRow.photo,
    photo: driverRow.photo,
    formerTeams: [],
  };
}

async function buildCurrentTeamDriverReferences(database) {
  const driversByTeamSlug = new Map();
  const driverRows = await database
    .prepare(
      "SELECT teams.slug AS team_slug, players.first_name, players.last_name, players.driver_number, players.date_of_birth, players.photo, players.role " +
        "FROM players " +
        "INNER JOIN teams ON teams.id = players.current_team_id " +
        "WHERE players.is_active = 1 " +
        "ORDER BY teams.slug, COALESCE(players.driver_number, 999), players.last_name, players.first_name",
    )
    .all();

  driverRows.forEach(function groupDriver(driverRow) {
    const teamDrivers = driversByTeamSlug.get(driverRow.team_slug) || [];
    teamDrivers.push(buildDriverSiteReference(driverRow));
    driversByTeamSlug.set(driverRow.team_slug, teamDrivers);
  });

  return driversByTeamSlug;
}

function buildCurrentSeasonCarRow(teamSlug, teamName, fileName, driverRows) {
  const carId = String(path.parse(fileName).name).replace(/^\d{4}-/, "");

  return {
    id: carId,
    image: buildCarImagePath(teamSlug, fileName),
    name: teamName + " " + carId,
    notes: teamName + " chassis for the 2026 Formula One season.",
    season: defaultRaceSeason,
    engine: "2026 Formula One power unit",
    drivers: (Array.isArray(driverRows) ? driverRows : []).map(function mapDriver(driverRow) {
      return {
        id: driverRow.id,
        name: driverRow.name,
      };
    }),
    races: defaultRaceSchedule.length,
    wins: "-",
    poles: "-",
    fastestLaps: "-",
    power: "2026 Formula One specification",
  };
}

function findPreferredCarAssetFileName(carsDirectory) {
  if (!fs.existsSync(carsDirectory)) {
    return "";
  }

  const carAssets = fs
    .readdirSync(carsDirectory)
    .filter(function filterCarAsset(fileName) {
      return /\.(jpg|jpeg|png|webp)$/i.test(String(fileName || ""));
    })
    .sort();

  const currentSeasonAsset = carAssets.find(function findCurrentSeasonAsset(fileName) {
    return new RegExp("^" + String(defaultRaceSeason) + "-.*\\.(jpg|jpeg|png|webp)$", "i").test(
      String(fileName || ""),
    );
  });

  if (currentSeasonAsset) {
    return currentSeasonAsset;
  }

  return carAssets.length > 0 ? carAssets[carAssets.length - 1] : "";
}

async function syncCurrentTeamSitePayloads(database) {
  if (!(await tableExists(database, "team_site_data"))) {
    return;
  }

  const teams = await database.prepare("SELECT slug, name FROM teams ORDER BY slug").all();
  const currentDriversByTeamSlug = await buildCurrentTeamDriverReferences(database);

  for (const teamRow of teams) {
    const currentDrivers = currentDriversByTeamSlug.get(teamRow.slug) || [];
    const carsPayload = await readStoredSitePayload(
      database,
      "team_site_data",
      "team_slug",
      teamRow.slug,
      "carsData.json",
    );
    const mergedCars = Array.isArray(carsPayload) ? carsPayload.slice() : [];
    const carsDirectory = path.join(rootDirectory, "F1", "Team_Sites", teamRow.slug, "assets", "images", "cars");
    const latestCarRow = mergedCars.find(function findLatestCar(carRow) {
      return Number(carRow && carRow.season) === defaultRaceSeason;
    });

    if (!latestCarRow) {
      const preferredCarAsset = findPreferredCarAssetFileName(carsDirectory);

      if (preferredCarAsset) {
        mergedCars.push(
          buildCurrentSeasonCarRow(teamRow.slug, teamRow.name, preferredCarAsset, currentDrivers),
        );
      }
    }

    if (Array.isArray(mergedCars)) {
      mergedCars.forEach(function refreshCurrentCarDrivers(carRow) {
        if (Number(carRow && carRow.season) !== defaultRaceSeason) {
          return;
        }

        const currentImageValue = stringValue(carRow && carRow.image);
        const currentFileName =
          path.basename(currentImageValue || "") || findPreferredCarAssetFileName(carsDirectory);
        const refreshedCarRow = buildCurrentSeasonCarRow(
          teamRow.slug,
          teamRow.name,
          currentFileName,
          currentDrivers,
        );

        Object.assign(carRow, refreshedCarRow, {
          image: currentImageValue || refreshedCarRow.image,
        });
      });
    }

    await writeStoredSitePayload(
      database,
      "team_site_data",
      "team_slug",
      teamRow.slug,
      "carsData.json",
      mergedCars,
    );
  }
}

async function rebuildDerivedRaceData(database) {
  await database.exec("DELETE FROM scores");
  await database.exec("DELETE FROM race_entries");
  await database.exec("DELETE FROM races");
  await seedRacesAndScores(database);
  await setSchemaMetaValue(database, "race_seed_version", currentRaceSeedVersion);
}

async function seedRacesAndScores(database) {
  const raceCount = (await database.prepare("SELECT COUNT(*) AS count FROM races").get()).count;
  const scoreCount = (await database.prepare("SELECT COUNT(*) AS count FROM scores").get()).count;

  if (Number(raceCount) > 0 || Number(scoreCount) > 0) {
    return;
  }

  const teamRows = await database.prepare("SELECT id, slug FROM teams ORDER BY id").all();
  const activePlayerRows = await database
    .prepare(
      "SELECT players.id, players.current_team_id, players.driver_number, players.first_name, players.last_name, teams.slug AS team_slug " +
        "FROM players " +
        "INNER JOIN teams ON teams.id = players.current_team_id " +
        "WHERE players.is_active = 1 AND players.current_team_id IS NOT NULL " +
        "ORDER BY players.current_team_id, players.last_name, players.first_name",
    )
    .all();
  const insertRaceEntry = database.prepare(
    "INSERT OR IGNORE INTO race_entries (race_id, team_id, entry_status, team_points) VALUES (?, ?, ?, 0)",
  );
  const insertRace = database.prepare(
    "INSERT INTO races (slug, season, round_number, name, circuit_name, scheduled_at, status) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  const insertScore = database.prepare(
    "INSERT OR IGNORE INTO scores (race_id, team_id, player_id, finish_position, points, bonus_points, result_time, status) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const activePlayerByName = new Map();

  if (teamRows.length === 0 || activePlayerRows.length === 0 || defaultRaceSchedule.length === 0) {
    return;
  }

  activePlayerRows.forEach(function indexActivePlayer(playerRow) {
    activePlayerByName.set(
      normalizeEntityToken(toDisplayName(playerRow.first_name, playerRow.last_name)),
      playerRow,
    );
  });

  for (const raceSeed of defaultRaceSchedule) {
    const completedResults = completedRaceResultsByRound[raceSeed.roundNumber] || null;
    const raceStatus = completedResults ? "completed" : "upcoming";
    const insertRaceResult = await insertRace.run(
      buildRaceSlug(defaultRaceSeason, raceSeed.circuitName),
      defaultRaceSeason,
      raceSeed.roundNumber,
      raceSeed.name,
      raceSeed.circuitName,
      buildScheduledAt(raceSeed),
      raceStatus,
    );
    const raceId = Number(insertRaceResult.lastInsertRowid);

    for (const teamRow of teamRows) {
      await insertRaceEntry.run(
        raceId,
        teamRow.id,
        raceStatus === "completed" ? "completed" : "scheduled",
      );
    }

    if (completedResults) {
      for (const resultRow of completedResults) {
        const playerRow = activePlayerByName.get(normalizeEntityToken(resultRow.driverName));

        if (!playerRow) {
          continue;
        }

        await insertScore.run(
          raceId,
          playerRow.current_team_id,
          playerRow.id,
          Number.isInteger(resultRow.finishPosition) ? resultRow.finishPosition : null,
          Number(resultRow.points) || 0,
          Number((sprintBonusPointsByRound[raceSeed.roundNumber] || {})[resultRow.driverName]) || 0,
          stringValue(resultRow.resultTime),
          "completed",
        );
      }
      continue;
    }

    for (const driverRow of activePlayerRows) {
      await insertScore.run(
        raceId,
        driverRow.current_team_id,
        driverRow.id,
        null,
        0,
        0,
        null,
        "scheduled",
      );
    }
  }

  await database.exec(
    "UPDATE races " +
      "SET status = CASE " +
      "WHEN EXISTS (" +
      "  SELECT 1 FROM scores WHERE scores.race_id = races.id AND scores.status = 'completed'" +
      ") THEN 'completed' " +
      "ELSE 'upcoming' END",
  );
  await database.exec(
    "UPDATE race_entries " +
      "SET entry_status = CASE " +
      "WHEN EXISTS (" +
      "  SELECT 1 FROM scores WHERE scores.race_id = race_entries.race_id " +
      "  AND scores.team_id = race_entries.team_id AND scores.status = 'completed'" +
      ") THEN 'completed' " +
      "ELSE 'scheduled' END, " +
      "team_points = COALESCE((" +
      "  SELECT SUM(scores.points + COALESCE(scores.bonus_points, 0)) FROM scores WHERE scores.race_id = race_entries.race_id " +
      "  AND scores.team_id = race_entries.team_id AND scores.status = 'completed'" +
      "), 0)",
  );
}

async function hasNormalizedCore(database) {
  return (
    (await getSchemaVersion(database)) === currentSchemaVersion &&
    (await columnExists(database, "players", "current_team_id")) &&
    (await columnExists(database, "players", "date_of_birth")) &&
    (await columnExists(database, "players", "role")) &&
    (await columnExists(database, "players", "driver_number")) &&
    (await columnExists(database, "players", "is_active")) &&
    (await columnExists(database, "users", "email")) &&
    (await columnExists(database, "users", "first_name")) &&
    (await columnExists(database, "users", "last_name")) &&
    (await columnExists(database, "users", "password_hash")) &&
    (await columnExists(database, "users", "favorite_team_id")) &&
    (await columnExists(database, "users", "is_admin")) &&
    (await tableExists(database, "team_memberships")) &&
    (await tableExists(database, "races")) &&
    (await tableExists(database, "race_entries")) &&
    (await tableExists(database, "scores")) &&
    (await columnExists(database, "scores", "bonus_points"))
  );
}

async function rebuildCoreSchema(database) {
  const existingTeams = await readExistingTeams(database);
  const existingPlayers = await readExistingPlayers(database);
  const existingUsers = await readExistingUsersForSeed(database);

  await database.exec("PRAGMA foreign_keys = OFF");
  await database.exec("BEGIN");

  try {
    if (await tableExists(database, "scores")) {
      await database.exec("DROP TABLE scores");
    }

    if (await tableExists(database, "race_entries")) {
      await database.exec("DROP TABLE race_entries");
    }

    if (await tableExists(database, "races")) {
      await database.exec("DROP TABLE races");
    }

    if (await tableExists(database, "team_memberships")) {
      await database.exec("DROP TABLE team_memberships");
    }

    if (await tableExists(database, "users")) {
      await database.exec("DROP TABLE users");
    }

    if (await tableExists(database, "players")) {
      await database.exec("DROP TABLE players");
    }

    if (await tableExists(database, "teams")) {
      await database.exec("DROP TABLE teams");
    }

    await createNormalizedCoreTables(database);
    await insertTeams(database, existingTeams);
    await insertActivePlayers(database, existingPlayers);
    await syncCurrentActiveDrivers(database);
    await syncTeamSiteDriversFromLegacyPayloads(database);
    await insertSeedUsersFromExistingUsers(database, existingUsers);
    await syncTeamMemberships(database);
    await insertInactivePlayersFromTeamData(database);
    await syncCurrentTeamSitePayloads(database);
    await rebuildDerivedRaceData(database);
    await ensureMinimumSeedCoverage(database);
    await setSchemaVersion(database, currentSchemaVersion);
    await database.exec("COMMIT");
  } catch (error) {
    await database.exec("ROLLBACK");
    throw error;
  } finally {
    await database.exec("PRAGMA foreign_keys = ON");
  }
}

async function topUpNormalizedData(database) {
  await insertSeedUsers(database);
  await syncCurrentActiveDrivers(database);
  await syncTeamSiteDriversFromLegacyPayloads(database);
  await syncTeamMemberships(database);
  await insertInactivePlayersFromTeamData(database);
  await syncCurrentTeamSitePayloads(database);
  if ((await getSchemaMetaValue(database, "race_seed_version")) !== currentRaceSeedVersion) {
    await rebuildDerivedRaceData(database);
  }
  await ensureMinimumSeedCoverage(database);
  await setSchemaVersion(database, currentSchemaVersion);
}

async function ensureNormalizedLeagueSchema(database) {
  await ensureSupportTables(database);
  await ensureDefaultRootSiteData(database);

  if (await hasNormalizedCore(database)) {
    await topUpNormalizedData(database);
    return;
  }

  await rebuildCoreSchema(database);
}

function buildUserDisplayName(firstName, lastName, emailAddress) {
  return toDisplayName(firstName, lastName) || stringValue(emailAddress);
}

function mapUserRowToUser(userRow) {
  return new User({
    id: userRow.id,
    email: userRow.email,
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    displayName: buildUserDisplayName(userRow.first_name, userRow.last_name, userRow.email),
    role: userRow.role,
    isAdmin: Number(userRow.is_admin) === 1,
    favoriteTeamId: userRow.favorite_team_id,
    favoriteTeamSlug: userRow.favorite_team_slug || null,
  });
}

async function insertSeedUsersFromExistingUsers(database, existingUsers) {
  const teamRows = await database.prepare("SELECT id, slug FROM teams ORDER BY id").all();
  const teamIdBySlug = new Map();
  const insertUser = database.prepare(
    "INSERT OR IGNORE INTO users (email, first_name, last_name, password_hash, favorite_team_id, is_admin, role) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?)",
  );

  teamRows.forEach(function indexTeam(teamRow) {
    teamIdBySlug.set(teamRow.slug, teamRow.id);
  });

  for (const userSeed of buildSeedUsers(Array.isArray(existingUsers) ? existingUsers : [], teamIdBySlug)) {
    await insertUser.run(
      userSeed.email,
      userSeed.firstName,
      userSeed.lastName,
      userSeed.passwordHash || createPasswordHash(userSeed.password),
      userSeed.favoriteTeamId,
      userSeed.isAdmin,
      userSeed.role,
    );
  }
}

async function insertSeedUsers(database) {
  await insertSeedUsersFromExistingUsers(database, await readExistingUsersForSeed(database));
}

async function ensureMinimumSeedCoverage(database) {
  const userCount = Number((await database.prepare("SELECT COUNT(*) AS count FROM users").get()).count || 0);
  const adminCount = Number(
    (await database
      .prepare(
        "SELECT COUNT(*) AS count FROM users " +
          "WHERE COALESCE(is_admin, 0) = 1 OR role = ?",
      )
      .get("admin")).count || 0,
  );
  const playerCount = Number(
    (await database.prepare("SELECT COUNT(*) AS count FROM players").get()).count || 0,
  );

  if (userCount < minimumSeededUserCount) {
    throw new Error(
      "League seed is incomplete: expected at least " +
        String(minimumSeededUserCount) +
        " users but found " +
        String(userCount) +
        ".",
    );
  }

  if (adminCount < 1) {
    throw new Error("League seed is incomplete: expected at least one admin user.");
  }

  if (playerCount < minimumSeededPlayerCount) {
    throw new Error(
      "League seed is incomplete: expected at least " +
        String(minimumSeededPlayerCount) +
        " players/drivers but found " +
        String(playerCount) +
        ".",
    );
  }
}

async function authenticateUser(database, emailValue, passwordValue) {
  const normalizedEmail = normalizeEmailAddress(emailValue);

  if (!normalizedEmail || !stringValue(passwordValue)) {
    return null;
  }

  const userRow = await database
    .prepare(
      "SELECT users.id, users.email, users.first_name, users.last_name, users.password_hash, " +
        "users.role, users.is_admin, users.favorite_team_id, teams.slug AS favorite_team_slug " +
        "FROM users " +
        "LEFT JOIN teams ON teams.id = users.favorite_team_id " +
        "WHERE lower(users.email) = ?",
    )
    .get(normalizedEmail);

  if (!userRow || !verifyPassword(passwordValue, userRow.password_hash)) {
    return null;
  }

  return mapUserRowToUser(userRow);
}

async function registerUser(database, userInput) {
  const firstName = stringValue(userInput && userInput.firstName);
  const lastName = stringValue(userInput && userInput.lastName);
  const normalizedEmail = normalizeEmailAddress(userInput && userInput.email);
  const password = stringValue(userInput && userInput.password);
  const favoriteTeamId = Number.parseInt(stringValue(userInput && userInput.favoriteTeamId), 10);

  if (!firstName || !lastName || !normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("First name, last name, and a valid email are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (!Number.isInteger(favoriteTeamId) || favoriteTeamId <= 0) {
    throw new Error("A favorite team must be selected.");
  }

  {
    const teamRow = await database
      .prepare("SELECT id FROM teams WHERE id = ?")
      .get(favoriteTeamId);

    if (!teamRow) {
      throw new Error("Selected favorite team does not exist.");
    }
  }

  {
    const existingUser = await database
      .prepare("SELECT id FROM users WHERE lower(email) = ?")
      .get(normalizedEmail);

    if (existingUser) {
      throw new Error("An account with that email already exists.");
    }
  }

  await database
    .prepare(
      "INSERT INTO users (email, first_name, last_name, password_hash, favorite_team_id, is_admin, role) " +
        "VALUES (?, ?, ?, ?, ?, 0, 'visitor')",
    )
    .run(
      normalizedEmail,
      firstName,
      lastName,
      createPasswordHash(password),
      favoriteTeamId,
    );

  return authenticateUser(database, normalizedEmail, password);
}

async function updateUserProfile(database, userIdValue, userInput) {
  const userId = Number.parseInt(stringValue(userIdValue), 10);
  const firstName = stringValue(userInput && userInput.firstName);
  const lastName = stringValue(userInput && userInput.lastName);
  const normalizedEmail = normalizeEmailAddress(userInput && userInput.email);
  const password = stringValue(userInput && userInput.password);
  const favoriteTeamId = Number.parseInt(stringValue(userInput && userInput.favoriteTeamId), 10);
  const existingUser = await database
    .prepare("SELECT id, password_hash FROM users WHERE id = ?")
    .get(userId);

  if (!Number.isInteger(userId) || userId <= 0 || !existingUser) {
    throw new Error("User not found.");
  }

  if (!firstName || !lastName || !normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("First name, last name, and a valid email are required.");
  }

  if (!Number.isInteger(favoriteTeamId) || favoriteTeamId <= 0) {
    throw new Error("A favorite team must be selected.");
  }

  if (password && password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  {
    const teamRow = await database
      .prepare("SELECT id FROM teams WHERE id = ?")
      .get(favoriteTeamId);

    if (!teamRow) {
      throw new Error("Selected favorite team does not exist.");
    }
  }

  {
    const conflictingUser = await database
      .prepare("SELECT id FROM users WHERE lower(email) = ? AND id <> ?")
      .get(normalizedEmail, userId);

    if (conflictingUser) {
      throw new Error("An account with that email already exists.");
    }
  }

  await database
    .prepare(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, password_hash = ?, favorite_team_id = ? " +
        "WHERE id = ?",
    )
    .run(
      firstName,
      lastName,
      normalizedEmail,
      password ? createPasswordHash(password) : existingUser.password_hash,
      favoriteTeamId,
      userId,
    );

  const userRow = await database
    .prepare(
      "SELECT users.id, users.email, users.first_name, users.last_name, users.password_hash, " +
        "users.role, users.is_admin, users.favorite_team_id, teams.slug AS favorite_team_slug " +
        "FROM users " +
        "LEFT JOIN teams ON teams.id = users.favorite_team_id " +
        "WHERE users.id = ?",
    )
    .get(userId);

  return mapUserRowToUser(userRow);
}

module.exports = {
  authenticateUser,
  currentSchemaVersion,
  ensureNormalizedLeagueSchema,
  registerUser,
  updateUserProfile,
  verifyPassword,
};
