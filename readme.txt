Group id
- 04

Authors
- Tijn Bisschop - h.f.a.bisschop@students.uu.nl - 5037387
- Darryl Chedi - s.r.chedi@students.uu.nl - 2735377
- Benjamin Tak - b.m.j.tak@students.uu.nl - 1996630

Website URL
- http://webtech.science.uu.nl/group04


Brief explanation
- We made a Formula 1 league website. Visitors can look at the leaderboard, latest scores, upcoming races, teams, drivers, league info, player pages, and the team mini-sites.
- Users can register, log in, pick a favourite team, and edit their profile.
- Admins can enter race scores, edit scores, add drivers, and move or remove drivers from teams.

Structure of the application
- F1/
  This folder has the website pages, shared CSS and JS, images, and the team mini-sites.
- F1/index.html
  Homepage.
- F1/teams.html
  Teams page.
- F1/drivers.html
  Drivers page.
- F1/playerprofile.html
  Driver detail page.
- F1/league.html
  League info page.
- F1/latestscores.html
  Latest scores page.
- F1/upcominggames.html
  Upcoming games/races page.
- F1/About.html
  About page.
- F1/admin.html
  Admin page.
- F1/assets/css/style.css
  Main site styling.
- F1/assets/js/script.js
  Homepage, login/register/profile, and About page logic.
- F1/assets/js/main-pages.js
  Loads data for the main public pages.
- F1/assets/js/admin.js
  Admin page logic.
- F1/Team_Sites/<team>/
  Each team has its own mini-site with its own HTML, CSS, JS, and images.
- server/Server.js
  Main Node server. It serves files, handles API routes, sessions, and admin requests.
- src/server/db/leagueDatabase.js
  Opens the SQLite database and gives helper functions for queries.
- src/server/db/normalizedLeagueSchema.js
  Creates and fills the database.
- src/server/models/User.js
  User class.
- src/server/models/Player.js
  Player class.
- src/server/models/Team.js
  Team class.
- src/server/services/sessionStore.js
  Session and cookie handling.
- src/server/utils/teamPlayerDataHelper.js
  Reads main team, player, and race data.
- src/server/utils/teamSiteDataHelper.js
  Reads league info, leaderboard data, latest/upcoming race data, and mini-site data.
- src/server/utils/adminDataHelper.js
  Admin write logic.
- storage/league_runtime.db
  Main database file used by the site.
- storage/http-requests.log
  HTTP request log file.

Note about the sqlite3 conversion
- We changed the database access to sqlite3 so the site can run on the school server.
- Parts of that sqlite3 conversion were written with help from ChatGPT.
- We are saying that openly because we did not want to pretend we wrote that conversion fully by ourselves.

Database structure
- We use one SQLite database as the source of truth.
- teams
  Stores the teams.
- users
  Stores registered users, password hashes, favourite team, and admin flag.
- players
  Stores the drivers.
- team_memberships
  Stores which driver belongs to which team.
- races
  Stores the race calendar and whether a race is upcoming or completed.
- race_entries
  Stores which teams are in each race.
- scores
  Stores the race results for drivers.
- root_site_data
  Stores site-wide text data like league info and group members.
- team_site_data
  Stores team mini-site content that is still kept as structured page data.
- team_site_drivers
  Stores team mini-site driver data in the database.
- team_site_driver_former_teams
  Stores former-team data for mini-site drivers.
- driver_images
  Stores fallback driver images.
- schema_meta
  Stores schema version information.

Registered users
- admin@f1.local / dolfijn123
- benjamin@f1.local / benjamin123
- racefan@f1.local / racefan123
- gridwatcher@f1.local / gridwatch123
- b.m.j.tak@students.uu.nl / RRdJME*HkfJSu3xps&qx

Admin login
- admin@f1.local / dolfijn123

SQL definition of the database
CREATE TABLE driver_images (image_key TEXT PRIMARY KEY, file_name TEXT NOT NULL, content_type TEXT NOT NULL, image_blob BLOB NOT NULL)

CREATE TABLE players (id INTEGER PRIMARY KEY, current_team_id INTEGER, first_name TEXT NOT NULL, last_name TEXT NOT NULL, date_of_birth TEXT NOT NULL, role TEXT NOT NULL, driver_number INTEGER, photo TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)), FOREIGN KEY (current_team_id) REFERENCES teams(id) ON DELETE SET NULL)

CREATE TABLE race_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, race_id INTEGER NOT NULL, team_id INTEGER NOT NULL, entry_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (entry_status IN ('scheduled', 'completed')), team_points INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, UNIQUE (race_id, team_id))

CREATE TABLE races (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, season INTEGER NOT NULL, round_number INTEGER, name TEXT NOT NULL, circuit_name TEXT NOT NULL, scheduled_at TEXT, status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')))

CREATE TABLE root_site_data (scope_key TEXT NOT NULL, file_name TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY (scope_key, file_name))

CREATE TABLE schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)

CREATE TABLE scores (id INTEGER PRIMARY KEY AUTOINCREMENT, race_id INTEGER NOT NULL, team_id INTEGER NOT NULL, player_id INTEGER NOT NULL, finish_position INTEGER, points INTEGER NOT NULL DEFAULT 0, bonus_points INTEGER NOT NULL DEFAULT 0, result_time TEXT, status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')), FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE, FOREIGN KEY (race_id, team_id) REFERENCES race_entries(race_id, team_id) ON DELETE CASCADE, UNIQUE (race_id, player_id))

CREATE TABLE team_memberships (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL, team_id INTEGER NOT NULL, start_season INTEGER NOT NULL DEFAULT 0, end_season INTEGER NOT NULL DEFAULT 0, is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0, 1)), FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE, FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE, UNIQUE (player_id, team_id, start_season, end_season, is_current))

CREATE TABLE team_site_data (team_slug TEXT NOT NULL, file_name TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY (team_slug, file_name), FOREIGN KEY (team_slug) REFERENCES teams(slug) ON DELETE CASCADE)

CREATE TABLE team_site_driver_former_teams (team_slug TEXT NOT NULL, driver_key TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL, city TEXT, country TEXT, PRIMARY KEY (team_slug, driver_key, sort_order))

CREATE TABLE team_site_drivers (team_slug TEXT NOT NULL, driver_key TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, driver_id TEXT NOT NULL, display_name TEXT NOT NULL, full_name TEXT, wiki_url TEXT, image_path TEXT, age_text TEXT, birth_date TEXT, birth_place TEXT, nationality TEXT, driver_number TEXT, wins_text TEXT, first_name TEXT, last_name TEXT, born_text TEXT, role TEXT, photo TEXT, PRIMARY KEY (team_slug, driver_key))

CREATE TABLE teams (id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL, logo_image TEXT NOT NULL, team_image TEXT NOT NULL, base_location TEXT, founded_year INTEGER)

CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password_hash TEXT NOT NULL, favorite_team_id INTEGER, is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)), role TEXT NOT NULL DEFAULT 'visitor', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (favorite_team_id) REFERENCES teams(id) ON DELETE SET NULL)
