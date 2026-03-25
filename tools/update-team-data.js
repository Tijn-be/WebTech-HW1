/*
  Rebuilds team-local carsData.json and driversData.json so each team site
  shows the right cars, years, drivers, and image references for that lineage.
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEAM_SITES_ROOT = path.join(ROOT, "F1", "Team_Sites");
const SHARED_DRIVERS_ROOT = path.join(ROOT, "F1", "drivers", "images");
const SHARED_CARS_ROOT = path.join(ROOT, "F1", "cars");

const teamMeta = {
  "Red Bull Racing": ["Red Bull Racing", "Milton Keynes", "United Kingdom"],
  Williams: ["Williams", "Grove", "United Kingdom"],
  McLaren: ["McLaren", "Woking", "United Kingdom"],
  Ferrari: ["Ferrari", "Maranello", "Italy"],
  Mercedes: ["Mercedes", "Brackley", "United Kingdom"],
  Haas: ["Haas", "Kannapolis", "United States"],
  Renault: ["Renault", "Enstone", "United Kingdom"],
  "Lotus Renault GP": ["Lotus Renault GP", "Enstone", "United Kingdom"],
  Lotus: ["Lotus", "Enstone", "United Kingdom"],
  Alpine: ["Alpine", "Enstone", "United Kingdom"],
  Jordan: ["Jordan", "Silverstone", "United Kingdom"],
  Midland: ["Midland", "Silverstone", "United Kingdom"],
  Spyker: ["Spyker", "Silverstone", "United Kingdom"],
  "Force India": ["Force India", "Silverstone", "United Kingdom"],
  "Racing Point": ["Racing Point", "Silverstone", "United Kingdom"],
  "Aston Martin": ["Aston Martin", "Silverstone", "United Kingdom"],
  Sauber: ["Sauber", "Hinwil", "Switzerland"],
  "BMW Sauber": ["BMW Sauber", "Hinwil", "Switzerland"],
  "Alfa Romeo": ["Alfa Romeo", "Hinwil", "Switzerland"],
  "Kick Sauber": ["Kick Sauber", "Hinwil", "Switzerland"],
  Audi: ["Audi", "Hinwil", "Switzerland"],
  Minardi: ["Minardi", "Faenza", "Italy"],
  "Toro Rosso": ["Toro Rosso", "Faenza", "Italy"],
  AlphaTauri: ["AlphaTauri", "Faenza", "Italy"],
  "Racing Bulls": ["Racing Bulls", "Faenza", "Italy"],
  Cadillac: ["Cadillac", "Silverstone", "United Kingdom"],
};

const currentNumbers = {
  "Alexander Albon": "23",
  "Andrea Kimi Antonelli": "12",
  "Carlos Sainz": "55",
  "Charles Leclerc": "16",
  "Esteban Ocon": "31",
  "Fernando Alonso": "14",
  "Franco Colapinto": "43",
  "Gabriel Bortoleto": "5",
  "George Russell": "63",
  "Isack Hadjar": "6",
  "Lance Stroll": "18",
  "Lando Norris": "4",
  "Lewis Hamilton": "44",
  "Liam Lawson": "30",
  "Max Verstappen": "1",
  "Mick Schumacher": "47",
  "Nico Hulkenberg": "27",
  "Nikita Mazepin": "9",
  "Oliver Bearman": "87",
  "Oscar Piastri": "81",
  "Pierre Gasly": "10",
  "Sergio Perez": "11",
  "Stoffel Vandoorne": "2",
  "Valtteri Bottas": "77",
  "Yuki Tsunoda": "22",
  "Zhou Guanyu": "24",
};

const REFERENCE_DATE = new Date("2026-03-25T00:00:00Z");

const driverInfoByName = {
  "Adrian Sutil": {
    birthDate: "11 January 1983",
    birthPlace: "Starnberg, Germany",
    nationality: "German",
    wins: "0",
  },
  "Alexander Albon": {
    birthDate: "23 March 1996",
    birthPlace: "London, England, United Kingdom",
    nationality: "Thai",
    wins: "0",
    wikiTitle: "Alex Albon",
  },
  "Andrea Kimi Antonelli": {
    birthDate: "25 August 2006",
    birthPlace: "Bologna, Italy",
    nationality: "Italian",
    wins: "0",
  },
  "Antonio Giovinazzi": {
    birthDate: "14 December 1993",
    birthPlace: "Martina Franca, Italy",
    nationality: "Italian",
    wins: "0",
  },
  "Bruno Senna": {
    birthDate: "15 October 1983",
    birthPlace: "Sao Paulo, Brazil",
    nationality: "Brazilian",
    wins: "0",
  },
  "Carlos Sainz": {
    birthDate: "1 September 1994",
    birthPlace: "Madrid, Spain",
    nationality: "Spanish",
    wins: "4",
    wikiTitle: "Carlos Sainz Jr.",
  },
  "Charles Leclerc": {
    birthDate: "16 October 1997",
    birthPlace: "Monte Carlo, Monaco",
    nationality: "Monegasque",
    wins: "8",
  },
  "Christian Klien": {
    birthDate: "7 February 1983",
    birthPlace: "Hohenems, Austria",
    nationality: "Austrian",
    wins: "0",
  },
  "Christijan Albers": {
    birthDate: "16 April 1979",
    birthPlace: "Eindhoven, Netherlands",
    nationality: "Dutch",
    wins: "0",
  },
  "Daniel Ricciardo": {
    birthDate: "1 July 1989",
    birthPlace: "Perth, Western Australia, Australia",
    nationality: "Australian",
    wins: "8",
  },
  "Daniil Kvyat": {
    birthDate: "26 April 1994",
    birthPlace: "Ufa, Russia",
    nationality: "Russian",
    wins: "0",
  },
  "David Coulthard": {
    birthDate: "27 March 1971",
    birthPlace: "Twynholm, Scotland, United Kingdom",
    nationality: "British",
    wins: "13",
  },
  "Esteban Gutierrez": {
    birthDate: "5 August 1991",
    birthPlace: "Monterrey, Nuevo Leon, Mexico",
    nationality: "Mexican",
    wins: "0",
    wikiTitle: "Esteban Gutiérrez",
  },
  "Esteban Ocon": {
    birthDate: "17 September 1996",
    birthPlace: "Evreux, France",
    nationality: "French",
    wins: "1",
  },
  "Felipe Massa": {
    birthDate: "25 April 1981",
    birthPlace: "Sao Paulo, Brazil",
    nationality: "Brazilian",
    wins: "11",
  },
  "Fernando Alonso": {
    birthDate: "29 July 1981",
    birthPlace: "Oviedo, Spain",
    nationality: "Spanish",
    wins: "32",
  },
  "Franco Colapinto": {
    birthDate: "27 May 2003",
    birthPlace: "Pilar, Buenos Aires, Argentina",
    nationality: "Argentine",
    wins: "0",
  },
  "Gabriel Bortoleto": {
    birthDate: "14 October 2004",
    birthPlace: "Sao Paulo, Brazil",
    nationality: "Brazilian",
    wins: "0",
  },
  "George Russell": {
    birthDate: "15 February 1998",
    birthPlace: "King's Lynn, England, United Kingdom",
    nationality: "British",
    wins: "3",
  },
  "Giancarlo Fisichella": {
    birthDate: "14 January 1973",
    birthPlace: "Rome, Italy",
    nationality: "Italian",
    wins: "3",
  },
  "Heikki Kovalainen": {
    birthDate: "19 October 1981",
    birthPlace: "Suomussalmi, Finland",
    nationality: "Finnish",
    wins: "1",
  },
  "Isack Hadjar": {
    birthDate: "28 September 2004",
    birthPlace: "Paris, France",
    nationality: "French",
    wins: "0",
  },
  "Jacques Villeneuve": {
    birthDate: "9 April 1971",
    birthPlace: "Saint-Jean-sur-Richelieu, Quebec, Canada",
    nationality: "Canadian",
    wins: "11",
  },
  "Jaime Alguersuari": {
    birthDate: "23 March 1990",
    birthPlace: "Barcelona, Spain",
    nationality: "Spanish",
    wins: "0",
  },
  "Jean-Eric Vergne": {
    birthDate: "25 April 1990",
    birthPlace: "Pontoise, France",
    nationality: "French",
    wins: "0",
    wikiTitle: "Jean-Éric Vergne",
  },
  "Jenson Button": {
    birthDate: "19 January 1980",
    birthPlace: "Frome, Somerset, England, United Kingdom",
    nationality: "British",
    wins: "15",
  },
  "Jolyon Palmer": {
    birthDate: "20 January 1991",
    birthPlace: "Horsham, England, United Kingdom",
    nationality: "British",
    wins: "0",
  },
  "Juan Pablo Montoya": {
    birthDate: "20 September 1975",
    birthPlace: "Bogota, Colombia",
    nationality: "Colombian",
    wins: "7",
  },
  "Kamui Kobayashi": {
    birthDate: "13 September 1986",
    birthPlace: "Amagasaki, Hyogo, Japan",
    nationality: "Japanese",
    wins: "0",
  },
  "Kevin Magnussen": {
    birthDate: "5 October 1992",
    birthPlace: "Roskilde, Denmark",
    nationality: "Danish",
    wins: "0",
  },
  "Kimi Raikkonen": {
    birthDate: "17 October 1979",
    birthPlace: "Espoo, Finland",
    nationality: "Finnish",
    wins: "21",
    wikiTitle: "Kimi Räikkönen",
  },
  "Lance Stroll": {
    birthDate: "29 October 1998",
    birthPlace: "Montreal, Quebec, Canada",
    nationality: "Canadian",
    wins: "0",
  },
  "Lando Norris": {
    birthDate: "13 November 1999",
    birthPlace: "Bristol, England, United Kingdom",
    nationality: "British",
    wins: "4",
  },
  "Lewis Hamilton": {
    birthDate: "7 January 1985",
    birthPlace: "Stevenage, England, United Kingdom",
    nationality: "British",
    wins: "105",
  },
  "Liam Lawson": {
    birthDate: "11 February 2002",
    birthPlace: "Hastings, New Zealand",
    nationality: "New Zealander",
    wins: "0",
  },
  "Logan Sargeant": {
    birthDate: "31 December 2000",
    birthPlace: "Fort Lauderdale, Florida, United States",
    nationality: "American",
    wins: "0",
  },
  "Marcus Ericsson": {
    birthDate: "2 September 1990",
    birthPlace: "Kumla, Sweden",
    nationality: "Swedish",
    wins: "0",
  },
  "Mark Webber": {
    birthDate: "27 August 1976",
    birthPlace: "Queanbeyan, New South Wales, Australia",
    nationality: "Australian",
    wins: "9",
  },
  "Max Verstappen": {
    birthDate: "30 September 1997",
    birthPlace: "Hasselt, Belgium",
    nationality: "Dutch",
    wins: "63",
  },
  "Michael Schumacher": {
    birthDate: "3 January 1969",
    birthPlace: "Hurth-Hermulheim, West Germany",
    nationality: "German",
    wins: "91",
  },
  "Mick Schumacher": {
    birthDate: "22 March 1999",
    birthPlace: "Vufflens-le-Chateau, Switzerland",
    nationality: "German",
    wins: "0",
  },
  "Narain Karthikeyan": {
    birthDate: "14 January 1977",
    birthPlace: "Coimbatore, Tamil Nadu, India",
    nationality: "Indian",
    wins: "0",
  },
  "Nelson Piquet Jr.": {
    birthDate: "25 July 1985",
    birthPlace: "Heidelberg, West Germany",
    nationality: "Brazilian",
    wins: "0",
  },
  "Nicholas Latifi": {
    birthDate: "29 June 1995",
    birthPlace: "Montreal, Quebec, Canada",
    nationality: "Canadian",
    wins: "0",
  },
  "Nick Heidfeld": {
    birthDate: "10 May 1977",
    birthPlace: "Monchengladbach, Germany",
    nationality: "German",
    wins: "0",
  },
  "Nico Hulkenberg": {
    birthDate: "19 August 1987",
    birthPlace: "Emmerich am Rhein, West Germany",
    nationality: "German",
    wins: "0",
    wikiTitle: "Nico Hülkenberg",
  },
  "Nico Rosberg": {
    birthDate: "27 June 1985",
    birthPlace: "Wiesbaden, West Germany",
    nationality: "German",
    wins: "23",
  },
  "Nikita Mazepin": {
    birthDate: "2 March 1999",
    birthPlace: "Moscow, Russia",
    nationality: "Russian",
    wins: "0",
  },
  "Oliver Bearman": {
    birthDate: "8 May 2005",
    birthPlace: "Chelmsford, Essex, England, United Kingdom",
    nationality: "British",
    wins: "0",
  },
  "Oscar Piastri": {
    birthDate: "6 April 2001",
    birthPlace: "Melbourne, Victoria, Australia",
    nationality: "Australian",
    wins: "2",
  },
  "Pastor Maldonado": {
    birthDate: "9 March 1985",
    birthPlace: "Maracay, Venezuela",
    nationality: "Venezuelan",
    wins: "1",
  },
  "Paul di Resta": {
    birthDate: "16 April 1986",
    birthPlace: "Uphall, Scotland, United Kingdom",
    nationality: "British",
    wins: "0",
  },
  "Pedro de la Rosa": {
    birthDate: "24 February 1971",
    birthPlace: "Barcelona, Spain",
    nationality: "Spanish",
    wins: "0",
  },
  "Pierre Gasly": {
    birthDate: "7 February 1996",
    birthPlace: "Rouen, France",
    nationality: "French",
    wins: "1",
  },
  "Robert Doornbos": {
    birthDate: "23 September 1981",
    birthPlace: "Rotterdam, Netherlands",
    nationality: "Dutch",
    wins: "0",
  },
  "Robert Kubica": {
    birthDate: "7 December 1984",
    birthPlace: "Krakow, Poland",
    nationality: "Polish",
    wins: "1",
  },
  "Romain Grosjean": {
    birthDate: "17 April 1986",
    birthPlace: "Geneva, Switzerland",
    nationality: "French",
    wins: "0",
  },
  "Rubens Barrichello": {
    birthDate: "23 May 1972",
    birthPlace: "Sao Paulo, Brazil",
    nationality: "Brazilian",
    wins: "11",
  },
  "Scott Speed": {
    birthDate: "24 January 1983",
    birthPlace: "Manteca, California, United States",
    nationality: "American",
    wins: "0",
  },
  "Sebastian Vettel": {
    birthDate: "3 July 1987",
    birthPlace: "Heppenheim, West Germany",
    nationality: "German",
    wins: "53",
  },
  "Sebastien Bourdais": {
    birthDate: "28 February 1979",
    birthPlace: "Le Mans, France",
    nationality: "French",
    wins: "0",
    wikiTitle: "Sébastien Bourdais",
  },
  "Sebastien Buemi": {
    birthDate: "31 October 1988",
    birthPlace: "Aigle, Switzerland",
    nationality: "Swiss",
    wins: "0",
    wikiTitle: "Sébastien Buemi",
  },
  "Sergey Sirotkin": {
    birthDate: "27 August 1995",
    birthPlace: "Moscow, Russia",
    nationality: "Russian",
    wins: "0",
  },
  "Sergio Perez": {
    birthDate: "26 January 1990",
    birthPlace: "Guadalajara, Jalisco, Mexico",
    nationality: "Mexican",
    wins: "6",
    wikiTitle: "Sergio Pérez",
  },
  "Stoffel Vandoorne": {
    birthDate: "26 March 1992",
    birthPlace: "Kortrijk, Belgium",
    nationality: "Belgian",
    wins: "0",
  },
  "Tiago Monteiro": {
    birthDate: "24 July 1976",
    birthPlace: "Porto, Portugal",
    nationality: "Portuguese",
    wins: "0",
  },
  "Valtteri Bottas": {
    birthDate: "28 August 1989",
    birthPlace: "Nastola, Finland",
    nationality: "Finnish",
    wins: "10",
  },
  "Vitaly Petrov": {
    birthDate: "8 September 1984",
    birthPlace: "Vyborg, Russia",
    nationality: "Russian",
    wins: "0",
  },
  "Vitantonio Liuzzi": {
    birthDate: "6 August 1980",
    birthPlace: "Locorotondo, Italy",
    nationality: "Italian",
    wins: "0",
  },
  "Yuki Tsunoda": {
    birthDate: "11 May 2000",
    birthPlace: "Sagamihara, Kanagawa, Japan",
    nationality: "Japanese",
    wins: "0",
  },
  "Zhou Guanyu": {
    birthDate: "30 May 1999",
    birthPlace: "Shanghai, China",
    nationality: "Chinese",
    wins: "0",
  },
};

const raceCounts = {
  2005: 19, 2006: 18, 2007: 17, 2008: 18, 2009: 17, 2010: 19, 2011: 19,
  2012: 20, 2013: 19, 2014: 19, 2015: 19, 2016: 21, 2017: 20, 2018: 21,
  2019: 21, 2020: 17, 2021: 22, 2022: 22, 2023: 22, 2024: 24, 2025: 24,
};

const prettyCode = {
  MP420: "MP4-20", MP421: "MP4-21", MP422: "MP4-22", MP423: "MP4-23", MP424: "MP4-24",
  MP425: "MP4-25", MP426: "MP4-26", MP427: "MP4-27", MP428: "MP4-28", MP429: "MP4-29",
  MP430: "MP4-30", MP431: "MP4-31",
  "248F1": "248 F1", "150Italia": "150 Italia", F14T: "F14 T", SF15T: "SF15-T",
  SF16H: "SF16-H", F175: "F1-75", SF23: "SF-23", SF24: "SF-24", SF25: "SF-25", SF26: "SF-26",
  MGPW01: "MGP W01", MGPW02: "MGP W02", F1W03: "F1 W03", F1W04: "F1 W04",
  F1W05Hybrid: "F1 W05 Hybrid", F1W06Hybrid: "F1 W06 Hybrid", F1W07Hybrid: "F1 W07 Hybrid",
  F1W08EQPower: "F1 W08 EQ Power+", F1W09EQPower: "F1 W09 EQ Power+", F1W10EQPower: "F1 W10 EQ Power+",
  F1W11EQPerformance: "F1 W11 EQ Performance", F1W12EPerformance: "F1 W12 E Performance",
  F1W13EPerformance: "F1 W13 E Performance", F1W14EPerformance: "F1 W14 E Performance", F1W15EPerformance: "F1 W15 E Performance",
  VCARB01: "VCARB 01", VCARB02: "VCARB 02", E23Hybrid: "E23 Hybrid", RS16: "R.S.16",
  RS17: "R.S.17", RS18: "R.S.18", RS19: "R.S.19", RS20: "R.S.20", F8VII: "F8-VII",
  F106: "F1.06", F107: "F1.07", F108: "F1.08", F109: "F1.09", CadillacMAC26: "MAC26",
  VF16: "VF-16", VF17: "VF-17", VF18: "VF-18", VF19: "VF-19", VF20: "VF-20", VF21: "VF-21",
  VF22: "VF-22", VF23: "VF-23", VF24: "VF-24", VF25: "VF-25", VF26: "VF-26",
};

const rosters = {
  "Red Bull": [
    [2005, "Red Bull Racing", "David Coulthard|Christian Klien|Vitantonio Liuzzi"],
    [2006, "Red Bull Racing", "David Coulthard|Christian Klien|Robert Doornbos"],
    [2007, "Red Bull Racing", "David Coulthard|Mark Webber"],
    [2008, "Red Bull Racing", "David Coulthard|Mark Webber"],
    [2009, "Red Bull Racing", "Sebastian Vettel|Mark Webber"],
    [2010, "Red Bull Racing", "Sebastian Vettel|Mark Webber"],
    [2011, "Red Bull Racing", "Sebastian Vettel|Mark Webber"],
    [2012, "Red Bull Racing", "Sebastian Vettel|Mark Webber"],
    [2013, "Red Bull Racing", "Sebastian Vettel|Mark Webber"],
    [2014, "Red Bull Racing", "Sebastian Vettel|Daniel Ricciardo"],
    [2015, "Red Bull Racing", "Daniel Ricciardo|Daniil Kvyat"],
    [2016, "Red Bull Racing", "Daniel Ricciardo|Daniil Kvyat|Max Verstappen"],
    [2017, "Red Bull Racing", "Daniel Ricciardo|Max Verstappen"],
    [2018, "Red Bull Racing", "Daniel Ricciardo|Max Verstappen"],
    [2019, "Red Bull Racing", "Max Verstappen|Pierre Gasly|Alexander Albon"],
    [2020, "Red Bull Racing", "Max Verstappen|Alexander Albon"],
    [2021, "Red Bull Racing", "Max Verstappen|Sergio Perez"],
    [2022, "Red Bull Racing", "Max Verstappen|Sergio Perez"],
    [2023, "Red Bull Racing", "Max Verstappen|Sergio Perez"],
    [2024, "Red Bull Racing", "Max Verstappen|Sergio Perez"],
    [2025, "Red Bull Racing", "Max Verstappen|Yuki Tsunoda"],
    [2026, "Red Bull Racing", "Max Verstappen|Yuki Tsunoda"],
  ],
  Ferrari: [
    [2005, "Ferrari", "Michael Schumacher|Rubens Barrichello"],
    [2006, "Ferrari", "Michael Schumacher|Felipe Massa"],
    [2007, "Ferrari", "Kimi Raikkonen|Felipe Massa"],
    [2008, "Ferrari", "Kimi Raikkonen|Felipe Massa"],
    [2009, "Ferrari", "Kimi Raikkonen|Felipe Massa|Giancarlo Fisichella"],
    [2010, "Ferrari", "Fernando Alonso|Felipe Massa"],
    [2011, "Ferrari", "Fernando Alonso|Felipe Massa"],
    [2012, "Ferrari", "Fernando Alonso|Felipe Massa"],
    [2013, "Ferrari", "Fernando Alonso|Felipe Massa"],
    [2014, "Ferrari", "Fernando Alonso|Kimi Raikkonen"],
    [2015, "Ferrari", "Sebastian Vettel|Kimi Raikkonen"],
    [2016, "Ferrari", "Sebastian Vettel|Kimi Raikkonen"],
    [2017, "Ferrari", "Sebastian Vettel|Kimi Raikkonen"],
    [2018, "Ferrari", "Sebastian Vettel|Kimi Raikkonen"],
    [2019, "Ferrari", "Sebastian Vettel|Charles Leclerc"],
    [2020, "Ferrari", "Sebastian Vettel|Charles Leclerc"],
    [2021, "Ferrari", "Charles Leclerc|Carlos Sainz"],
    [2022, "Ferrari", "Charles Leclerc|Carlos Sainz"],
    [2023, "Ferrari", "Charles Leclerc|Carlos Sainz"],
    [2024, "Ferrari", "Charles Leclerc|Carlos Sainz"],
    [2025, "Ferrari", "Charles Leclerc|Lewis Hamilton"],
    [2026, "Ferrari", "Charles Leclerc|Lewis Hamilton"],
  ],
  McLaren: [
    [2005, "McLaren", "Kimi Raikkonen|Juan Pablo Montoya"],
    [2006, "McLaren", "Kimi Raikkonen|Juan Pablo Montoya|Pedro de la Rosa"],
    [2007, "McLaren", "Fernando Alonso|Lewis Hamilton"],
    [2008, "McLaren", "Lewis Hamilton|Heikki Kovalainen"],
    [2009, "McLaren", "Lewis Hamilton|Heikki Kovalainen"],
    [2010, "McLaren", "Lewis Hamilton|Jenson Button"],
    [2011, "McLaren", "Lewis Hamilton|Jenson Button"],
    [2012, "McLaren", "Lewis Hamilton|Jenson Button"],
    [2013, "McLaren", "Jenson Button|Sergio Perez"],
    [2014, "McLaren", "Jenson Button|Kevin Magnussen"],
    [2015, "McLaren", "Jenson Button|Fernando Alonso"],
    [2016, "McLaren", "Fernando Alonso|Jenson Button"],
    [2017, "McLaren", "Fernando Alonso|Stoffel Vandoorne"],
    [2018, "McLaren", "Fernando Alonso|Stoffel Vandoorne"],
    [2019, "McLaren", "Carlos Sainz|Lando Norris"],
    [2020, "McLaren", "Carlos Sainz|Lando Norris"],
    [2021, "McLaren", "Daniel Ricciardo|Lando Norris"],
    [2022, "McLaren", "Daniel Ricciardo|Lando Norris"],
    [2023, "McLaren", "Lando Norris|Oscar Piastri"],
    [2024, "McLaren", "Lando Norris|Oscar Piastri"],
    [2025, "McLaren", "Lando Norris|Oscar Piastri"],
    [2026, "McLaren", "Lando Norris|Oscar Piastri"],
  ],
  Williams: [
    [2005, "Williams", "Mark Webber|Nick Heidfeld"],
    [2006, "Williams", "Mark Webber|Nico Rosberg"],
    [2007, "Williams", "Nico Rosberg"],
    [2008, "Williams", "Nico Rosberg"],
    [2009, "Williams", "Nico Rosberg"],
    [2010, "Williams", "Rubens Barrichello|Nico Hulkenberg"],
    [2011, "Williams", "Rubens Barrichello|Pastor Maldonado"],
    [2012, "Williams", "Pastor Maldonado|Bruno Senna"],
    [2013, "Williams", "Pastor Maldonado|Valtteri Bottas"],
    [2014, "Williams", "Felipe Massa|Valtteri Bottas"],
    [2015, "Williams", "Felipe Massa|Valtteri Bottas"],
    [2016, "Williams", "Felipe Massa|Valtteri Bottas"],
    [2017, "Williams", "Felipe Massa"],
    [2018, "Williams", "Sergey Sirotkin"],
    [2019, "Williams", "George Russell|Robert Kubica"],
    [2020, "Williams", "George Russell|Nicholas Latifi"],
    [2021, "Williams", "George Russell|Nicholas Latifi"],
    [2022, "Williams", "Alexander Albon|Nicholas Latifi"],
    [2023, "Williams", "Alexander Albon|Logan Sargeant"],
    [2024, "Williams", "Alexander Albon|Logan Sargeant|Franco Colapinto"],
    [2025, "Williams", "Alexander Albon|Carlos Sainz"],
    [2026, "Williams", "Alexander Albon|Carlos Sainz"],
  ],
  Mercedes: [
    [2010, "Mercedes", "Michael Schumacher|Nico Rosberg"],
    [2011, "Mercedes", "Michael Schumacher|Nico Rosberg"],
    [2012, "Mercedes", "Michael Schumacher|Nico Rosberg"],
    [2013, "Mercedes", "Lewis Hamilton|Nico Rosberg"],
    [2014, "Mercedes", "Lewis Hamilton|Nico Rosberg"],
    [2015, "Mercedes", "Lewis Hamilton|Nico Rosberg"],
    [2016, "Mercedes", "Lewis Hamilton|Nico Rosberg"],
    [2017, "Mercedes", "Lewis Hamilton|Valtteri Bottas"],
    [2018, "Mercedes", "Lewis Hamilton|Valtteri Bottas"],
    [2019, "Mercedes", "Lewis Hamilton|Valtteri Bottas"],
    [2020, "Mercedes", "Lewis Hamilton|Valtteri Bottas"],
    [2021, "Mercedes", "Lewis Hamilton|Valtteri Bottas"],
    [2022, "Mercedes", "Lewis Hamilton|George Russell"],
    [2023, "Mercedes", "Lewis Hamilton|George Russell"],
    [2024, "Mercedes", "Lewis Hamilton|George Russell"],
    [2025, "Mercedes", "George Russell|Andrea Kimi Antonelli"],
    [2026, "Mercedes", "George Russell|Andrea Kimi Antonelli"],
  ],
  Haas: [
    [2016, "Haas", "Romain Grosjean|Esteban Gutierrez"],
    [2017, "Haas", "Romain Grosjean|Kevin Magnussen"],
    [2018, "Haas", "Romain Grosjean|Kevin Magnussen"],
    [2019, "Haas", "Romain Grosjean|Kevin Magnussen"],
    [2020, "Haas", "Romain Grosjean|Kevin Magnussen"],
    [2021, "Haas", "Nikita Mazepin|Mick Schumacher"],
    [2022, "Haas", "Kevin Magnussen|Mick Schumacher"],
    [2023, "Haas", "Kevin Magnussen|Nico Hulkenberg"],
    [2024, "Haas", "Kevin Magnussen|Nico Hulkenberg|Oliver Bearman"],
    [2025, "Haas", "Esteban Ocon|Oliver Bearman"],
    [2026, "Haas", "Esteban Ocon|Oliver Bearman"],
  ],
  "Racing Bulls": [
    [2005, "Minardi", "Christijan Albers|Robert Doornbos"],
    [2006, "Toro Rosso", "Vitantonio Liuzzi|Scott Speed"],
    [2007, "Toro Rosso", "Vitantonio Liuzzi|Scott Speed|Sebastian Vettel"],
    [2008, "Toro Rosso", "Sebastian Vettel|Sebastien Bourdais"],
    [2009, "Toro Rosso", "Sebastien Buemi|Sebastien Bourdais"],
    [2010, "Toro Rosso", "Sebastien Buemi|Jaime Alguersuari"],
    [2011, "Toro Rosso", "Sebastien Buemi|Jaime Alguersuari"],
    [2012, "Toro Rosso", "Daniel Ricciardo|Jean-Eric Vergne"],
    [2013, "Toro Rosso", "Daniel Ricciardo|Jean-Eric Vergne"],
    [2014, "Toro Rosso", "Jean-Eric Vergne|Daniil Kvyat"],
    [2015, "Toro Rosso", "Max Verstappen|Carlos Sainz"],
    [2016, "Toro Rosso", "Daniil Kvyat|Carlos Sainz"],
    [2017, "Toro Rosso", "Daniil Kvyat|Carlos Sainz|Pierre Gasly"],
    [2018, "Toro Rosso", "Pierre Gasly"],
    [2019, "Toro Rosso", "Daniil Kvyat|Alexander Albon|Pierre Gasly"],
    [2020, "AlphaTauri", "Pierre Gasly|Daniil Kvyat"],
    [2021, "AlphaTauri", "Pierre Gasly|Yuki Tsunoda"],
    [2022, "AlphaTauri", "Pierre Gasly|Yuki Tsunoda"],
    [2023, "AlphaTauri", "Yuki Tsunoda|Daniel Ricciardo|Liam Lawson"],
    [2024, "Racing Bulls", "Yuki Tsunoda|Daniel Ricciardo|Liam Lawson"],
    [2025, "Racing Bulls", "Isack Hadjar|Liam Lawson"],
    [2026, "Racing Bulls", "Isack Hadjar|Liam Lawson"],
  ],
  Alpine: [
    [2005, "Renault", "Fernando Alonso|Giancarlo Fisichella"],
    [2006, "Renault", "Fernando Alonso|Giancarlo Fisichella"],
    [2007, "Renault", "Giancarlo Fisichella|Heikki Kovalainen"],
    [2008, "Renault", "Fernando Alonso|Nelson Piquet Jr."],
    [2009, "Renault", "Fernando Alonso|Nelson Piquet Jr.|Romain Grosjean"],
    [2010, "Renault", "Robert Kubica|Vitaly Petrov"],
    [2011, "Lotus Renault GP", "Vitaly Petrov|Nick Heidfeld|Bruno Senna"],
    [2012, "Lotus", "Kimi Raikkonen|Romain Grosjean"],
    [2013, "Lotus", "Kimi Raikkonen|Romain Grosjean"],
    [2014, "Lotus", "Romain Grosjean|Pastor Maldonado"],
    [2015, "Lotus", "Romain Grosjean|Pastor Maldonado"],
    [2016, "Renault", "Kevin Magnussen|Jolyon Palmer"],
    [2017, "Renault", "Nico Hulkenberg|Jolyon Palmer|Carlos Sainz"],
    [2018, "Renault", "Nico Hulkenberg|Carlos Sainz"],
    [2019, "Renault", "Nico Hulkenberg|Daniel Ricciardo"],
    [2020, "Renault", "Daniel Ricciardo|Esteban Ocon"],
    [2021, "Alpine", "Fernando Alonso|Esteban Ocon"],
    [2022, "Alpine", "Fernando Alonso|Esteban Ocon"],
    [2023, "Alpine", "Esteban Ocon|Pierre Gasly"],
    [2024, "Alpine", "Esteban Ocon|Pierre Gasly"],
    [2025, "Alpine", "Pierre Gasly|Franco Colapinto"],
    [2026, "Alpine", "Pierre Gasly|Franco Colapinto"],
  ],
  "Aston Martin": [
    [2005, "Jordan", "Tiago Monteiro|Narain Karthikeyan"],
    [2006, "Midland", "Christijan Albers|Tiago Monteiro"],
    [2007, "Spyker", "Adrian Sutil|Christijan Albers"],
    [2008, "Force India", "Adrian Sutil|Giancarlo Fisichella"],
    [2009, "Force India", "Adrian Sutil|Giancarlo Fisichella|Vitantonio Liuzzi"],
    [2010, "Force India", "Adrian Sutil|Vitantonio Liuzzi"],
    [2011, "Force India", "Adrian Sutil|Paul di Resta"],
    [2012, "Force India", "Nico Hulkenberg|Paul di Resta"],
    [2013, "Force India", "Adrian Sutil|Paul di Resta"],
    [2014, "Force India", "Nico Hulkenberg|Sergio Perez"],
    [2015, "Force India", "Nico Hulkenberg|Sergio Perez"],
    [2016, "Force India", "Nico Hulkenberg|Sergio Perez"],
    [2017, "Force India", "Sergio Perez|Esteban Ocon"],
    [2018, "Force India", "Sergio Perez|Esteban Ocon"],
    [2019, "Racing Point", "Sergio Perez|Lance Stroll"],
    [2020, "Racing Point", "Sergio Perez|Lance Stroll|Nico Hulkenberg"],
    [2021, "Aston Martin", "Sebastian Vettel|Lance Stroll"],
    [2022, "Aston Martin", "Sebastian Vettel|Lance Stroll|Nico Hulkenberg"],
    [2023, "Aston Martin", "Fernando Alonso|Lance Stroll"],
    [2024, "Aston Martin", "Fernando Alonso|Lance Stroll"],
    [2025, "Aston Martin", "Fernando Alonso|Lance Stroll"],
    [2026, "Aston Martin", "Fernando Alonso|Lance Stroll"],
  ],
  Audi: [
    [2005, "Sauber", "Jacques Villeneuve|Felipe Massa"],
    [2006, "BMW Sauber", "Jacques Villeneuve|Nick Heidfeld|Robert Kubica"],
    [2007, "BMW Sauber", "Nick Heidfeld|Robert Kubica|Sebastian Vettel"],
    [2008, "BMW Sauber", "Nick Heidfeld|Robert Kubica"],
    [2009, "BMW Sauber", "Nick Heidfeld|Robert Kubica"],
    [2010, "Sauber", "Kamui Kobayashi|Pedro de la Rosa|Nick Heidfeld"],
    [2011, "Sauber", "Kamui Kobayashi|Sergio Perez"],
    [2012, "Sauber", "Kamui Kobayashi|Sergio Perez"],
    [2013, "Sauber", "Nico Hulkenberg|Esteban Gutierrez"],
    [2014, "Sauber", "Adrian Sutil|Esteban Gutierrez"],
    [2015, "Sauber", "Marcus Ericsson"],
    [2016, "Sauber", "Marcus Ericsson"],
    [2017, "Sauber", "Marcus Ericsson|Antonio Giovinazzi"],
    [2018, "Sauber", "Marcus Ericsson|Charles Leclerc"],
    [2019, "Alfa Romeo", "Kimi Raikkonen|Antonio Giovinazzi"],
    [2020, "Alfa Romeo", "Kimi Raikkonen|Antonio Giovinazzi"],
    [2021, "Alfa Romeo", "Kimi Raikkonen|Antonio Giovinazzi"],
    [2022, "Alfa Romeo", "Valtteri Bottas|Zhou Guanyu"],
    [2023, "Alfa Romeo", "Valtteri Bottas|Zhou Guanyu"],
    [2024, "Kick Sauber", "Valtteri Bottas|Zhou Guanyu"],
    [2025, "Kick Sauber", "Nico Hulkenberg|Gabriel Bortoleto"],
    [2026, "Audi", "Nico Hulkenberg|Gabriel Bortoleto"],
  ],
  Cadillac: [[2026, "Cadillac", "Sergio Perez|Valtteri Bottas"]],
};

const carSpecs = {
  "Red Bull": [[2005, "RB1", "Red Bull"], [2006, "RB2", "Red Bull"], [2007, "RB3", "Red Bull"], [2008, "RB4", "Red Bull"], [2009, "RB5", "Red Bull"], [2010, "RB6", "Red Bull"], [2011, "RB7", "Red Bull"], [2012, "RB8", "Red Bull"], [2013, "RB9", "Red Bull"], [2014, "RB10", "Red Bull"], [2015, "RB11", "Red Bull"], [2016, "RB12", "Red Bull"], [2017, "RB13", "Red Bull"], [2018, "RB14", "Red Bull"], [2019, "RB15", "Red Bull"], [2020, "RB16", "Red Bull"], [2021, "RB16B", "Red Bull"], [2022, "RB18", "Red Bull"], [2023, "RB19", "Red Bull"], [2024, "RB20", "Red Bull"], [2025, "RB21", "Red Bull"], [2026, "RB22", "Red Bull"]],
  Ferrari: [[2005, "F2005", "Ferrari"], [2006, "248F1", "Ferrari"], [2007, "F2007", "Ferrari"], [2008, "F2008", "Ferrari"], [2009, "F60", "Ferrari"], [2010, "F10", "Ferrari"], [2011, "150Italia", "Ferrari"], [2012, "F2012", "Ferrari"], [2013, "F138", "Ferrari"], [2014, "F14T", "Ferrari"], [2015, "SF15T", "Ferrari"], [2016, "SF16H", "Ferrari"], [2017, "SF70H", "Ferrari"], [2018, "SF71H", "Ferrari"], [2019, "SF90", "Ferrari"], [2020, "SF1000", "Ferrari"], [2021, "SF21", "Ferrari"], [2022, "F175", "Ferrari"], [2023, "SF23", "Ferrari"], [2024, "SF24", "Ferrari"], [2025, "SF25", "Ferrari"], [2026, "SF26", "Ferrari"]],
  McLaren: [[2005, "MP420", "McLaren"], [2006, "MP421", "McLaren"], [2007, "MP422", "McLaren"], [2008, "MP423", "McLaren"], [2009, "MP424", "McLaren"], [2010, "MP425", "McLaren"], [2011, "MP426", "McLaren"], [2012, "MP427", "McLaren"], [2013, "MP428", "McLaren"], [2014, "MP429", "McLaren"], [2015, "MP430", "McLaren"], [2016, "MP431", "McLaren"], [2017, "MCL32", "McLaren"], [2018, "MCL33", "McLaren"], [2019, "MCL34", "McLaren"], [2020, "MCL35", "McLaren"], [2021, "MCL35M", "McLaren"], [2022, "MCL36", "McLaren"], [2023, "MCL60", "McLaren"], [2024, "MCL38", "McLaren"], [2025, "MCL39", "McLaren"], [2026, "MCL40", "McLaren"]],
  Williams: [[2005, "FW27", "Williams"], [2006, "FW28", "Williams"], [2007, "FW29", "Williams"], [2008, "FW30", "Williams"], [2009, "FW31", "Williams"], [2010, "FW32", "Williams"], [2011, "FW33", "Williams"], [2012, "FW34", "Williams"], [2013, "FW35", "Williams"], [2014, "FW36", "Williams"], [2015, "FW37", "Williams"], [2016, "FW38", "Williams"], [2017, "FW40", "Williams"], [2018, "FW41", "Williams"], [2019, "FW42", "Williams"], [2020, "FW43", "Williams"], [2021, "FW43B", "Williams"], [2022, "FW44", "Williams"], [2023, "FW45", "Williams"], [2024, "FW46", "Williams"], [2025, "FW47", "Williams"], [2026, "FW48", "Williams"]],
  Mercedes: [[2010, "MGPW01", "Mercedes"], [2011, "MGPW02", "Mercedes"], [2012, "F1W03", "Mercedes"], [2013, "F1W04", "Mercedes"], [2014, "F1W05Hybrid", "Mercedes"], [2015, "F1W06Hybrid", "Mercedes"], [2016, "F1W07Hybrid", "Mercedes"], [2017, "F1W08EQPower", "Mercedes"], [2018, "F1W09EQPower", "Mercedes"], [2019, "F1W10EQPower", "Mercedes"], [2020, "F1W11EQPerformance", "Mercedes"], [2021, "F1W12EPerformance", "Mercedes"], [2022, "F1W13EPerformance", "Mercedes"], [2023, "F1W14EPerformance", "Mercedes"], [2024, "F1W15EPerformance", "Mercedes"], [2025, "F1W16", "Mercedes"], [2026, "F1W17", "Mercedes"]],
  Haas: [[2016, "VF16", "Haas"], [2017, "VF17", "Haas"], [2018, "VF18", "Haas"], [2019, "VF19", "Haas"], [2020, "VF20", "Haas"], [2021, "VF21", "Haas"], [2022, "VF22", "Haas"], [2023, "VF23", "Haas"], [2024, "VF24", "Haas"], [2025, "VF25", "Haas"], [2026, "VF26", "Haas"]],
  "Racing Bulls": [[2005, "PS05", "Minardi"], [2006, "STR1", "Toro Rosso"], [2007, "STR2", "Toro Rosso"], [2008, "STR3", "Toro Rosso"], [2009, "STR4", "Toro Rosso"], [2010, "STR5", "Toro Rosso"], [2011, "STR6", "Toro Rosso"], [2012, "STR7", "Toro Rosso"], [2013, "STR8", "Toro Rosso"], [2014, "STR9", "Toro Rosso"], [2015, "STR10", "Toro Rosso"], [2016, "STR11", "Toro Rosso"], [2017, "STR12", "Toro Rosso"], [2018, "STR13", "Toro Rosso"], [2019, "STR14", "Toro Rosso"], [2020, "AT01", "AlphaTauri"], [2021, "AT02", "AlphaTauri"], [2022, "AT03", "AlphaTauri"], [2023, "AT04", "AlphaTauri"], [2024, "VCARB01", "Racing Bulls"], [2025, "VCARB02", "Racing Bulls"], [2026, "VCARB03", "Racing Bulls"]],
  Alpine: [[2005, "R25", "Renault"], [2006, "R26", "Renault"], [2007, "R27", "Renault"], [2008, "R28", "Renault"], [2009, "R29", "Renault"], [2010, "R30", "Renault"], [2011, "R31", "Lotus Renault GP"], [2012, "E20", "Lotus"], [2013, "E21", "Lotus"], [2014, "E22", "Lotus"], [2015, "E23Hybrid", "Lotus"], [2016, "RS16", "Renault"], [2017, "RS17", "Renault"], [2018, "RS18", "Renault"], [2019, "RS19", "Renault"], [2020, "RS20", "Renault"], [2021, "A521", "Alpine"], [2022, "A522", "Alpine"], [2023, "A523", "Alpine"], [2024, "A524", "Alpine"], [2025, "A525", "Alpine"], [2026, "A526", "Alpine"]],
  "Aston Martin": [[2005, "EJ15", "Jordan"], [2006, "M16", "Midland"], [2007, "F8VII", "Spyker"], [2008, "VJM01", "Force India"], [2009, "VJM02", "Force India"], [2010, "VJM03", "Force India"], [2011, "VJM04", "Force India"], [2012, "VJM05", "Force India"], [2013, "VJM06", "Force India"], [2014, "VJM07", "Force India"], [2015, "VJM08", "Force India"], [2016, "VJM09", "Force India"], [2017, "VJM10", "Force India"], [2018, "VJM11", "Force India"], [2019, "RP19", "Racing Point"], [2020, "RP20", "Racing Point"], [2021, "AMR21", "Aston Martin"], [2022, "AMR22", "Aston Martin"], [2023, "AMR23", "Aston Martin"], [2024, "AMR24", "Aston Martin"], [2025, "AMR25", "Aston Martin"], [2026, "AMR26", "Aston Martin"]],
  Audi: [[2005, "C24", "Sauber"], [2006, "F106", "BMW Sauber"], [2007, "F107", "BMW Sauber"], [2008, "F108", "BMW Sauber"], [2009, "F109", "BMW Sauber"], [2010, "C29", "Sauber"], [2011, "C30", "Sauber"], [2012, "C31", "Sauber"], [2013, "C32", "Sauber"], [2014, "C33", "Sauber"], [2015, "C34", "Sauber"], [2016, "C35", "Sauber"], [2017, "C36", "Sauber"], [2018, "C37", "Sauber"], [2019, "C38", "Alfa Romeo"], [2020, "C39", "Alfa Romeo"], [2021, "C41", "Alfa Romeo"], [2022, "C42", "Alfa Romeo"], [2023, "C43", "Alfa Romeo"], [2024, "C44", "Kick Sauber"], [2025, "C45", "Kick Sauber"], [2026, "R26", "Audi"]],
  Cadillac: [[2026, "CadillacMAC26", "Cadillac"]],
};

function slugify(name) {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "")
    .toLowerCase();
}

function buildImageMap(rootDir) {
  const map = new Map();
  for (const fileName of fs.readdirSync(rootDir)) {
    const fullPath = path.join(rootDir, fileName);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile() || stat.size === 0) {
      continue;
    }
    map.set(normalizeName(path.parse(fileName).name), fileName);
  }
  return map;
}

function wikipediaArticleUrl(title) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title).replace(/%20/g, "_")}`;
}

function wikiUrlForDriver(name) {
  const info = driverInfoByName[name];
  return wikipediaArticleUrl(info?.wikiTitle || name);
}

function calculateAge(birthDateText) {
  const birthDate = new Date(`${birthDateText} UTC`);
  if (Number.isNaN(birthDate.getTime())) {
    return "Unknown";
  }

  let age = REFERENCE_DATE.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayPassed =
    REFERENCE_DATE.getUTCMonth() > birthDate.getUTCMonth() ||
    (
      REFERENCE_DATE.getUTCMonth() === birthDate.getUTCMonth() &&
      REFERENCE_DATE.getUTCDate() >= birthDate.getUTCDate()
    );

  if (!birthdayPassed) {
    age -= 1;
  }

  return String(age);
}

function engineLabel(season) {
  if (season <= 2005) return "V10 Formula One engine";
  if (season <= 2013) return "V8 Formula One engine";
  if (season <= 2025) return "Hybrid Formula One power unit";
  return "2026 Formula One power unit";
}

function powerLabel(season) {
  if (season === 2005) return "~900 hp";
  if (season <= 2013) return "~750 hp";
  if (season <= 2020) return "~900 hp";
  if (season <= 2025) return "~1000 hp";
  return "TBD";
}

function pretty(code) {
  return prettyCode[code] || code;
}

function findExactCarImageFile(dirPath, season, code) {
  if (!fs.existsSync(dirPath)) {
    return null;
  }

  const baseName = `${season}-${code}`;
  return (
    fs.readdirSync(dirPath).find((fileName) => path.parse(fileName).name === baseName) ||
    null
  );
}

function localImagePath(teamName, season, code) {
  const localCarsDir = path.join(TEAM_SITES_ROOT, teamName, "assets", "images", "cars");
  const sharedTeamDir = path.join(SHARED_CARS_ROOT, teamName);

  const localFile = findExactCarImageFile(localCarsDir, season, code);
  if (localFile) {
    return `assets/images/cars/${localFile}`;
  }

  const sharedFile = findExactCarImageFile(sharedTeamDir, season, code);
  if (sharedFile) {
    fs.copyFileSync(
      path.join(sharedTeamDir, sharedFile),
      path.join(localCarsDir, sharedFile),
    );
    return `assets/images/cars/${sharedFile}`;
  }

  return `assets/images/${teamName.replace(/ /g, "_")}_car.png`;
}

function buildDriverEntry(name, constructorNames, imageMap) {
  const info = driverInfoByName[name];
  const imageFile = imageMap.get(normalizeName(name));
  const imagePath = imageFile
    ? `assets/images/drivers/${imageFile}`
    : "assets/images/drivers/placeholder.jpg";
  const parts = name.split(" ");
  const birthDate = info?.birthDate || "Unknown";
  const birthPlace = info?.birthPlace || "Unknown";
  const nationality = info?.nationality || "Unknown";
  const wins = info?.wins || "0";
  const number = currentNumbers[name] || "N/A";

  return {
    id: slugify(name),
    name,
    wikiUrl: wikiUrlForDriver(name),
    image: imagePath,
    fullName: name,
    age: calculateAge(birthDate),
    birthDate,
    birthPlace,
    nationality,
    number,
    wins,
    firstName: parts[0] || "Driver",
    lastName: parts.slice(1).join(" ") || "Unknown",
    born: birthDate,
    role: "Driver",
    photo: imagePath,
    formerTeams: constructorNames.map((constructorName) => {
      const [title, city, country] = teamMeta[constructorName] || [
        constructorName,
        "Unknown city",
        "Unknown country",
      ];
      return { title, city, country };
    }),
  };
}

function buildCarEntry(teamName, season, code, constructorName, drivers) {
  return {
    id: code,
    image: localImagePath(teamName, season, code),
    name: `${constructorName} ${pretty(code)}`,
    notes: `${constructorName} chassis for the ${season} Formula One season.`,
    season,
    engine: engineLabel(season),
    drivers,
    races: raceCounts[season] || "-",
    wins: "-",
    poles: "-",
    fastestLaps: "-",
    power: powerLabel(season),
  };
}

function main() {
  const driverImageMap = buildImageMap(SHARED_DRIVERS_ROOT);
  const missingDriverInfo = new Set();

  for (const [teamName, rosterRows] of Object.entries(rosters)) {
    const teamRoot = path.join(TEAM_SITES_ROOT, teamName);
    const driversDir = path.join(teamRoot, "assets", "images", "drivers");
    fs.mkdirSync(driversDir, { recursive: true });

    const constructorsByDriver = new Map();
    const latestSeasonByDriver = new Map();
    const driversBySeason = new Map();

    for (const [season, constructorName, driverList] of rosterRows) {
      const names = driverList.split("|");
      const driverRefs = names.map((name) => ({ id: slugify(name), name }));
      driversBySeason.set(season, driverRefs);

      for (const name of names) {
        if (!constructorsByDriver.has(name)) {
          constructorsByDriver.set(name, new Set());
        }
        constructorsByDriver.get(name).add(constructorName);
        latestSeasonByDriver.set(
          name,
          Math.max(latestSeasonByDriver.get(name) || 0, season),
        );

        const imageFile = driverImageMap.get(normalizeName(name));
        if (imageFile) {
          fs.copyFileSync(
            path.join(SHARED_DRIVERS_ROOT, imageFile),
            path.join(driversDir, imageFile),
          );
        }
      }
    }

    const driversData = Array.from(constructorsByDriver.keys())
      .sort((a, b) => {
        const seasonDiff =
          (latestSeasonByDriver.get(b) || 0) - (latestSeasonByDriver.get(a) || 0);
        return seasonDiff !== 0 ? seasonDiff : a.localeCompare(b);
      })
      .map((name) => {
        if (!driverInfoByName[name]) {
          missingDriverInfo.add(name);
        }

        return buildDriverEntry(
          name,
          Array.from(constructorsByDriver.get(name)),
          driverImageMap,
        );
      });

    fs.writeFileSync(
      path.join(teamRoot, "data", "driversData.json"),
      `${JSON.stringify(driversData, null, 2)}\n`,
      "utf8",
    );

    const carsData = carSpecs[teamName]
      .map(([season, code, constructorName]) =>
        buildCarEntry(
          teamName,
          season,
          code,
          constructorName,
          driversBySeason.get(season) || [],
        ),
      )
      .filter((car) => car.image.startsWith("assets/images/cars/"));

    fs.writeFileSync(
      path.join(teamRoot, "data", "carsData.json"),
      `${JSON.stringify(carsData, null, 2)}\n`,
      "utf8",
    );

    console.log(`Updated ${teamName}: ${carsData.length} cars, ${driversData.length} drivers`);
  }

  if (missingDriverInfo.size > 0) {
    console.warn(
      `Missing driver info entries: ${Array.from(missingDriverInfo).sort().join(", ")}`,
    );
  }
}

main();
