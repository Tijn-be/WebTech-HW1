/* Purpose: Opens the league SQLite database, upgrades it to the normalized schema, and exposes query helpers. */

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
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

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON");
ensureNormalizedLeagueSchema(database);

function run(sql, parameters) {
  const statement = database.prepare(sql);
  return statement.run.apply(statement, Array.isArray(parameters) ? parameters : []);
}

function get(sql, parameters) {
  const statement = database.prepare(sql);
  return statement.get.apply(statement, Array.isArray(parameters) ? parameters : []);
}

function all(sql, parameters) {
  const statement = database.prepare(sql);
  return statement.all.apply(statement, Array.isArray(parameters) ? parameters : []);
}

function close() {
  database.close();
}

function authenticateUser(loginValue, passwordValue) {
  return authenticateLeagueUser(database, loginValue, passwordValue);
}

function registerUser(userInput) {
  return registerLeagueUser(database, userInput);
}

function updateUserProfile(userId, userInput) {
  return updateLeagueUserProfile(database, userId, userInput);
}

module.exports = {
  all,
  authenticateUser,
  close,
  database,
  databasePath,
  get,
  registerUser,
  run,
  updateUserProfile,
};
