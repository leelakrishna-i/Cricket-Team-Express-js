const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB ERROE:${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const dbObjectToResponsiveObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get ALL players
app.get("/players/", async (request, response) => {
  const dbQuery = `SELECT * FROM cricket_team;`;
  const playerList = await db.all(dbQuery);
  response.send(playerList.map((Player) => dbObjectToResponsiveObject(Player)));
});

//post player
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const dbQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
    ('${playerName}', '${jerseyNumber}', '${role}');`;
  await db.run(dbQuery);
  response.send("Player Added to Team");
});

//get player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `SELECT * FROM cricket_team WHERE player_id= ${playerId};`;
  const player = await db.get(dbQuery);
  response.send(dbObjectToResponsiveObject(player));
});

//put player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updateQuery = `UPDATE cricket_team SET player_name='${playerName}',
    jersey_number='${jerseyNumber}',role='${role}' WHERE player_id=${playerId};`;

  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//delete Player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;

  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
