/* Purpose: Opens the league SQLite database through sqlite3, upgrades it to the normalized schema, and exposes async query helpers. */

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const {
  authenticateUser: authenticateLeagueUser,
  ensureNormalizedLeagueSchema,
  registerUser: registerLeagueUser,
  updateUserProfile: updateLeagueUserProfile,
} = require("./normalizedLeagueSchema");

const rootDirectory = path.resolve(__dirname, "..", "..", "..");
const storageDirectory = path.join(rootDirectory, "storage");
const databasePath = path.join(storageDirectory, "league_runtime.db");

if (!fs.existsSync(storageDirectory)) {
  fs.mkdirSync(storageDirectory, { recursive: true });
}

function normalizeParameters(parameters) {
  return Array.isArray(parameters) ? parameters : [];
}

function createSqlite3Database(databaseFilePath) {
  const rawDatabase = new sqlite3.Database(databaseFilePath);

  function exec(sql) {
    return new Promise(function handleExec(resolve, reject) {
      rawDatabase.exec(sql, function onExec(error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  function get(sql, parameters) {
    return new Promise(function handleGet(resolve, reject) {
      rawDatabase.get(sql, normalizeParameters(parameters), function onGet(error, row) {
        if (error) {
          reject(error);
          return;
        }

        resolve(row || null);
      });
    });
  }

  function all(sql, parameters) {
    return new Promise(function handleAll(resolve, reject) {
      rawDatabase.all(sql, normalizeParameters(parameters), function onAll(error, rows) {
        if (error) {
          reject(error);
          return;
        }

        resolve(Array.isArray(rows) ? rows : []);
      });
    });
  }

  function run(sql, parameters) {
    return new Promise(function handleRun(resolve, reject) {
      rawDatabase.run(sql, normalizeParameters(parameters), function onRun(error) {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          changes: Number(this && this.changes) || 0,
          lastInsertRowid:
            this && this.lastID !== undefined && this.lastID !== null
              ? Number(this.lastID)
              : 0,
        });
      });
    });
  }

  return {
    exec,
    get,
    all,
    run,
    prepare: function prepare(sql) {
      return {
        run: function runPrepared() {
          return run(sql, Array.from(arguments));
        },
        get: function getPrepared() {
          return get(sql, Array.from(arguments));
        },
        all: function allPrepared() {
          return all(sql, Array.from(arguments));
        },
      };
    },
    close: function closeDatabase() {
      return new Promise(function handleClose(resolve, reject) {
        rawDatabase.close(function onClose(error) {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

const database = createSqlite3Database(databasePath);
const initializationPromise = (async function initializeDatabase() {
  await database.exec("PRAGMA foreign_keys = ON");
  await ensureNormalizedLeagueSchema(database);
})();

async function exec(sql) {
  await initializationPromise;
  return database.exec(sql);
}

async function run(sql, parameters) {
  await initializationPromise;
  const statement = database.prepare(sql);
  return statement.run.apply(statement, normalizeParameters(parameters));
}

async function get(sql, parameters) {
  await initializationPromise;
  const statement = database.prepare(sql);
  return statement.get.apply(statement, normalizeParameters(parameters));
}

async function all(sql, parameters) {
  await initializationPromise;
  const statement = database.prepare(sql);
  return statement.all.apply(statement, normalizeParameters(parameters));
}

async function close() {
  await initializationPromise;
  return database.close();
}

async function authenticateUser(loginValue, passwordValue) {
  await initializationPromise;
  return authenticateLeagueUser(database, loginValue, passwordValue);
}

async function registerUser(userInput) {
  await initializationPromise;
  return registerLeagueUser(database, userInput);
}

async function updateUserProfile(userId, userInput) {
  await initializationPromise;
  return updateLeagueUserProfile(database, userId, userInput);
}

module.exports = {
  all,
  authenticateUser,
  close,
  database,
  databasePath,
  exec,
  get,
  initializationPromise,
  registerUser,
  run,
  updateUserProfile,
};
