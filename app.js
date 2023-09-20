const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertObjectSnackCaseToObjectCamelCase = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get(`/players/`, async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;
  const getPlayersArray = await db.all(getPlayersQuery);
  response.send(getPlayersArray.map(convertObjectSnackCaseToObjectCamelCase));
});

app.get(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details WHERE player_id=${playerId};`;
  const getPlayersArray = await db.get(getPlayersQuery);
  response.send(getPlayersArray);
});

app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getPlayersQuery = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId};`;
  const getPlayersArray = await db.run(getPlayersQuery);
  response.send("Player Details Updated");
});

app.get(`/matches/:matchId/`, async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT match_id AS matchId,match,year FROM match_details WHERE match_id=${matchId};`;
  const getMatchArray = await db.get(getMatchQuery);
  response.send(getMatchArray);
});

app.get(`/players/:playerId/matches/`, async (request, response) => {
  const { playerId } = request.params;
  const getMatchIdQuery = `SELECT  match_id AS matchId,match,year  FROM  player_match_score NATURAL JOIN match_details WHERE player_id=${playerId};`;
  const getMatchId = await db.all(getMatchIdQuery);

  response.send(getMatchId);
});

app.get(`/matches/:matchId/players/`, async (request, response) => {
  const { matchId } = request.params;
  const getPlayerIdQuery = `SELECT  player_id AS playerId,player_name AS playerName FROM  player_match_score NATURAL JOIN player_details  WHERE match_id=${matchId};`;
  const getPlayerId = await db.all(getPlayerIdQuery);
  response.send(getPlayerId);
});

app.get(`/players/:playerId/playerScores/`, async (request, response) => {
  const { playerId } = request.params;
  const getMatchIdQuery = `SELECT player_details.player_id AS playerId,player_details.player_name AS playerName, SUM(player_match_score.score) AS totalScore, SUM(fours) AS totalFours, SUM(sixes) AS totalSixes FROM  player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id  WHERE player_details.player_id=${playerId};`;
  const getMatchId = await db.get(getMatchIdQuery);

  response.send(getMatchId);
});

module.exports = app;
