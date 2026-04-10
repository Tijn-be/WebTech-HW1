/* Purpose: Shapes one player record for the main site API. */

class Player {
  constructor(playerRow) {
    this.id = playerRow.id;
    this.teamId = playerRow.team_id;
    this.teamSlug = playerRow.team_slug || null;
    this.teamName = playerRow.team_name || null;
    this.firstName = playerRow.first_name;
    this.lastName = playerRow.last_name;
    this.fullName = String(playerRow.first_name + " " + playerRow.last_name).trim();
    this.ageOrDob = playerRow.age_or_dob;
    this.position = playerRow.position;
    this.number = playerRow.number;
    this.photo = playerRow.photo;
  }
}

module.exports = {
  Player,
};
