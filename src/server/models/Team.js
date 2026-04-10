/* Purpose: Shapes one team record for the main site API. */

class Team {
  constructor(teamRow) {
    this.id = teamRow.id;
    this.slug = teamRow.slug;
    this.name = teamRow.name;
    this.description = teamRow.description;
    this.logoImage = teamRow.logo_image;
    this.teamImage = teamRow.team_image;
  }
}

module.exports = {
  Team,
};
