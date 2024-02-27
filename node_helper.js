var NodeHelper = require('node_helper')
const fetch = require('node-fetch');
const fs = require('fs');
var {
  DateTime
} = require('luxon')

// var startofMonth = DateTime.local(DateTime.now()).startOf('month').toISODate();

// var endofMonth = DateTime.local(DateTime.now()).endOf('month').toISODate();

const country_flags = `${__dirname}/country_flags.json`;

const league_data = `${__dirname}/league_data.json`;

const countryFlags = JSON.parse(fs.readFileSync(country_flags, 'utf8'));

const leagueSeason = JSON.parse(fs.readFileSync(league_data, 'utf8'));

var leaguesLog = `${__dirname}/leagues.json`;

module.exports = NodeHelper.create({
  requiresVersion: '2.26.0',

  start: function () {
    console.log('Starting node helper for: ' + this.name)
  },

  getrugbyMatchData: async function (payload) {

    var startofMonth = DateTime.local(DateTime.now()).startOf('month').toISODate();

    var endofMonth = DateTime.local(DateTime.now()).endOf('month').toISODate();

    var league = payload.league

    var filteredData = [];

    let url = `https://api.wr-rims-prod.pulselive.com/rugby/v3/match?startDate=${startofMonth}&endDate=${endofMonth}&sort=asc&pageSize=100&page=0&sport=` + payload.sport

    // Get the match data
    const response = await fetch(url, {
      method: 'GET',

    })
    const data = await response.json();

    if (payload.competitions) {
      specificCompetitions = payload.competitions;
      const filteredData = data.content.filter(dataEvent => specificCompetitions.includes(dataEvent.competion));
    } else {
      filteredData = data.content;
    }

    let rugbymatchesData = [];

    const sevenDaysAgo = DateTime.now().minus({
      days: payload.matchesOlderThan
    });

    // Populate the match data array
    filteredData.forEach(dataEvent => {

      let matchDateTime = DateTime.fromMillis(dataEvent.time.millis);

      if (matchDateTime < sevenDaysAgo) {
        return; // Skip this dataEvent
      }
      if (rugbymatchesData.length >= payload.matchesLimit) {
        return;
      }

      var startTime = dataEvent.events[0] ? dataEvent.events[0].start.millis : 0

      var endTime = dataEvent.events[0] ? dataEvent.events[0].start.millis : 0

      let start1 = DateTime.fromMillis(dataEvent.time.millis).toLocaleString(DateTime.DATETIME_MED);

      let eventStart = DateTime.fromMillis(dataEvent.time.millis).toLocaleString(DateTime.TIME_24_SIMPLE);

      let team1Abbreviation = dataEvent.teams[0].abbreviation;

      let team2Abbreviation = dataEvent.teams[1].abbreviation;

      // Find the flag URL for team 1
      let team1Flag = countryFlags.find(country => country['3code'] === team1Abbreviation)?.flag || '';

      // Find the flag URL for team 2
      let team2Flag = countryFlags.find(country => country['3code'] === team2Abbreviation)?.flag || '';

      rugbymatchesData.push({
        "id": dataEvent.id,
        "competition": dataEvent.competition,
        "sport": dataEvent.sport,
        "eventPhase": dataEvent.eventPhaseId ? dataEvent.eventPhaseId.type : "",
        "venueId": dataEvent.venue ? dataEvent.venue.id : "",
        "venueName": dataEvent.venue ? dataEvent.venue.name : "",
        "venueCity": dataEvent.venue ? dataEvent.venue.city : "",
        "venueCountry": dataEvent.venue ? dataEvent.venue.country : "",
        "matchDateTime": start1,
        "team1Id": dataEvent.teams[0].id,
        "team1Name": dataEvent.teams[0].name,
        "team1Abbreviation": team1Abbreviation,
        "team1Flag": team1Flag,
        "team2Id": dataEvent.teams[1].id,
        "team2Name": dataEvent.teams[1].name,
        "team2Abbreviation": team2Abbreviation,
        "team2Flag": team2Flag,
        "team1Score": dataEvent.scores[0],
        "team2Score": dataEvent.scores[1],
        "eventsLabel": dataEvent.events[0] ? dataEvent.events[0].label : "",
        "eventStart": eventStart,
        "eventsStatus": dataEvent.events[0] ? dataEvent.events[0].eventStatus.eventStatusName : ""
      })
    })
    this.sendSocketNotification("RUGBY_MATCH_DATA", rugbymatchesData)
  },

  getrankingsData: async function (payload) {

    let url = 'https://api.wr-rims-prod.pulselive.com/rugby/v3/rankings/mru?language=en'

    const response = await fetch(url, {
      method: 'GET',
    })

    const data = await response.json();

    let rankingsData = [];

    data.entries.forEach(dataEvent => {

      if (rankingsData.length >= payload.rankingLimit) {
        return;
      }

      let countryAbbreviation = dataEvent.team.countryCode;

      let countryFlag = countryFlags.find(country => country['3code'] === countryAbbreviation)?.flag || '';

      rankingsData.push({
        "position": dataEvent.pos,
        "previousPosition": dataEvent.previousPos,
        "points": dataEvent.pts,
        "previousPoints": dataEvent.previousPts,
        "name": dataEvent.team.name,
        "abbreviation": dataEvent.team.abbreviation,
        "countryCode": dataEvent.team.countryCode,
        "flag": countryFlag,
        "id": dataEvent.team.id
      })
    })
    this.sendSocketNotification("RUGBY_RANKING_DATA", rankingsData)
  },

  getapiSportsGameData: async function (payload) {
    var league_id = payload.apiSports.apiSportStandingLeagueId;
    var apiKey = payload.apiSports.apiSportKey;
    var time_zone = payload.apiSports.apiSportTZ;
    let activeSeason = leagueSeason.find(season => season.leagueId === league_id)?.currentSeasons[0].season || '';
    var apiSportUrl = `https://v1.rugby.api-sports.io/games?league=${league_id}&season=${activeSeason}&timezone=${time_zone}`;

    const response = await fetch(apiSportUrl, {
      headersmethod: 'get',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v1.rugby.api-sports.io'
      }
    })

    const data = await response.json();

    const formattedData = this.formatApiSportsData(data, payload);

    this.sendSocketNotification("API_SPORT_GAME_DATA", formattedData);
  },

  getapiSportsLeagueData: async function() {
    let leagueData = [];
    var apiSportsLeagueUrl = 'https://v1.rugby.api-sports.io/leagues'
    const response = await fetch(apiSportsLeagueUrl, {
      headersmethod: 'get',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v1.rugby.api-sports.io'
      }
    })

    const data = await response.json();
    leagueData = data;
    leagueData.response.forEach(dataEvent => {
      console.log("Data Event", dataEvent);
      leagueData.push({
        "leagueId": dataEvent.id,
        "leagueType": dataEvent.type,
        "leagueFlag": dataEvent.logo,
        "leagueCountryId": dataEvent.country.id,
        "leagueCountryName": dataEvent.country.name,
        "leagueCountryCode": dataEvent.country.code,
        "leagueCountryFlag": dataEvent.country.flag,
        "currentSeasons": dataEvent.seasons.filter(season => season.current)
      });
    });
    fs.writeFileSync(leaguesLog, JSON.stringify(leagueData, null, 2) + os.EOL, function (err) {
      if (err)
        throw err;
    })
  },

  getapiSportsRankingData: async function(payload) {
    var league_id = payload.apiSports.apiSportStandingLeagueId;
    var apiKey = payload.apiSports.apiSportKey;
    let activeSeason = leagueSeason.find(season => season.leagueId === league_id)?.currentSeasons[0].season || '';
    var apiSportsRankingUrl = `https://v1.rugby.api-sports.io/standings?league=${league_id}&season=${activeSeason}`;

    const response = await fetch(apiSportsRankingUrl, {
      headersmethod: 'get',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v1.rugby.api-sports.io'
      }
    })

    const data = await response.json();

    const formattedRankingData = this.formatApiSportsRankingData(data, payload);
    this.sendSocketNotification("API_SPORT_STANDING_DATA", formattedRankingData);
  },

  formatApiSportsRankingData: function(data, payload) {
    var rankingsData = data;
    var rankingLimit = payload.apiSports.apiSportsNumRankings;
    let rankingData = [];

    rankingsData.response.forEach(dataEvent => {
      if (rankingData.length >= rankingLimit) {
        return;
      }

      rankingData.push({
        "rank": dataEvent.position,
        "league": dataEvent.league.name,
        "leagueFlag": dataEvent.league.logo,
        "teamName": dataEvent.team.name,
        "teamFlag": dataEvent.team.logo,
        "teamCountry": dataEvent.country.name,
        "teamStats": {
          "gamesPlayed": dataEvent.games.played,
          "win": dataEvent.games.win.total,
          "draw": dataEvent.games.draw.total,
          "lose": dataEvent.games.lose.total,
          "goalsFor": dataEvent.goals.for,
          "goalsAgainst": dataEvent.goals.against,
          "points": dataEvent.points
        }
      })
    })

    return rankingData;
  },

  formatApiSportData: function (data, payload) {
    var apiSportleagueData = data;
    var gamestoDisplay = payload.apiSpots.numberofGamesToDisplay;
    var daysPast = payload.apiSports.apiSportDaysPast;
    var daysFuture = payload.apiSports.apiSportsDaysFuture;
    let leagueGameData = [];
    const pastDays = DateTime.now().minus({
      days: daysPast
    });

    const gamesPeriod = DateTime.now().plus({
      days: daysFuture
    });

    apiSportleagueData.response.forEach(dataEvent => {
      // Parse the date-time string
      const dateTime = DateTime.fromISO(dataEvent.date);
      // Convert to the desired format (YYYY-MM-DD)
      const formattedDate = dateTime.toISODate();
      // let matchDateTime = DateTime.fromMillis(dataEvent.date);
      if ((DateTime.fromISO(formattedDate) < pastDays) || (DateTime.fromISO(formattedDate) > gamesPeriod)) {
        return; // Skip this dataEvent
      }

      if (leagueGameData.length >= gamestoDisplay) {
        return;
      }

      leagueGameData.push({
        "leagueId": dataEvent.league.id,
        "leagueName": dataEvent.league.name,
        "leagueType": dataEvent.league.type,
        "leagueFlag": dataEvent.league.logo,
        "matchDate": DateTime.fromISO(dataEvent.date).toISODate(),
        "matchTime": dataEvent.time,
        "gameWeek": dataEvent.week,
        "gameStatus": dataEvent.status.long,
        "homeTeam": dataEvent.teams.home.name,
        "homeTeamFlag": dataEvent.teams.home.logo,
        "homeTeamScore": dataEvent.scores.home,
        "awayTeam": dataEvent.teams.away.name,
        "awayTeamFlag": dataEvent.teams.away.logo,
        "awayTeamScore": dataEvent.scores.away
      })

    })

    return leagueGameData;
  },

  socketNotificationReceived: function (notification, payload) {

    if (notification === "GET_RANKING_DATA") {
      this.getrankingsData(payload);
    }
    if (notification === "GET_MATCH_DATA") {
      this.getrugbyMatchData(payload);
    }
    if (notification === "GET_API_SPORT_DATA") {
      this.getapiSportsLeagueData(payload);
      this.getapiSportsGameData(payload);
      this.getapiSportsRankingData(payload);
    }
  }
})
