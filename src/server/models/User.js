/* Purpose: Shapes one user record for authentication and session use. */

class User {
  constructor(userRow) {
    this.id = userRow.id;
    this.email = userRow.email;
    this.firstName = userRow.firstName;
    this.lastName = userRow.lastName;
    this.displayName = userRow.displayName;
    this.role = userRow.role;
    this.isAdmin = Boolean(userRow.isAdmin);
    this.favoriteTeamId = userRow.favoriteTeamId || null;
    this.favoriteTeamSlug = userRow.favoriteTeamSlug || null;
  }
}

module.exports = {
  User,
};
