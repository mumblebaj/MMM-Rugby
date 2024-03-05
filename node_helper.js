var NodeHelper = require('node_helper')
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
var {
  DateTime
} = require('luxon')

const countryFlags = require('./country_flags.json');
const leagueSeason = require('./league_data.json');
const leaguesLog = `${__dirname}/leagues.json`;

module.exports = NodeHelper.create({
  requiresVersion: '2.26.0',

  start: function () {
    console.log('Starting node helper for: ' + this.name)
  },

  getrugbyMatchData: async function (payload) {

    const startofMonth = DateTime.local(DateTime.now()).startOf('month').toISODate();

    const endofMonth = DateTime.local(DateTime.now()).endOf('month').toISODate();

    const league = payload.league

    let filteredData = [];

    const url = `https://api.wr-rims-prod.pulselive.com/rugby/v3/match?startDate=${startofMonth}&endDate=2024-12-31&sort=asc&pageSize=100&page=0&sport=` + payload.sport

    // Get the match data
    const response = await fetch(url, {
      method: 'GET',
    })
    const data = await response.json();

    if (payload.sport= 'mru' && payload.competitions) {
      specificCompetitions = payload.competitions;

      filteredData = data.content.filter(dataEvent => specificCompetitions.includes(dataEvent.competition));
    } else {
      filteredData = data.content;
    }

    const rugbymatchesData = [];

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

      let start1 = DateTime.fromMillis(dataEvent.time.millis).toLocaleString(DateTime.DATE_MED);

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

  getRankingsData: async function (payload) {
    try {
      const url = 'https://api.wr-rims-prod.pulselive.com/rugby/v3/rankings/mru?language=en';
      const response = await fetch(url, {
        method: 'GET'
      });

      const data = await response.json();
      const rankingLimit = payload.rankingLimit;
      const rankingsData = data.entries.slice(0, rankingLimit).map(dataEvent => {
        const countryAbbreviation = dataEvent.team.countryCode;
        const countryFlag = countryFlags.find(country => country['3code'] === countryAbbreviation)?.flag || '';
        return {
          position: dataEvent.pos,
          previousPosition: dataEvent.previousPos,
          points: dataEvent.pts,
          previousPoints: dataEvent.previousPts,
          name: dataEvent.team.name,
          abbreviation: dataEvent.team.abbreviation,
          countryCode: dataEvent.team.countryCode,
          flag: countryFlag,
          id: dataEvent.team.id
        };
      })
      this.sendSocketNotification("RUGBY_RANKING_DATA", rankingsData);
    } catch (error) {
      console.error("MMM-Rugby Error fetching rankings data: ", error);
    }
  },

  getapiSportsGameData: async function (payload) {
    try {
      const league_id = payload.apiSports.apiSportStandingLeagueId;
      const apiKey = payload.apiSports.apiSportKey;
      const time_zone = payload.apiSports.apiSportTZ;
      const activeSeason = leagueSeason.find(season => season.leagueId === league_id)?.currentSeasons[0].season || '';
      const apiSportUrl = `https://v1.rugby.api-sports.io/games?league=${league_id}&season=${activeSeason}&timezone=${time_zone}`;

      const response = await fetch(apiSportUrl, {
        headersmethod: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v1.rugby.api-sports.io'
        }
      });
      const data = await response.json();
      const apiSportleagueData = data;
      const gamestoDisplay = payload.apiSports.numberofGamesToDisplay;
      const daysPast = payload.apiSports.apiSportDaysPast;
      const daysFuture = payload.apiSports.apiSportsDaysFuture;
      const pastDays = DateTime.now().minus({
        days: daysPast
      });
      const gamesPeriod = DateTime.now().plus({
        days: daysFuture
      });

      const filteredGameData = apiSportleagueData.response.map(dataEvent => {
        const dateTime = DateTime.fromISO(dataEvent.date);
        const formattedDate = dateTime.toISODate();

        if (DateTime.fromISO(formattedDate) < pastDays || DateTime.fromISO(formattedDate) > gamesPeriod) {
          return null;
        }
        return {
          leagueId: dataEvent.league.id,
          leagueName: dataEvent.league.name,
          leagueType: dataEvent.league.type,
          leagueFlag: dataEvent.league.logo,
          matchDate: DateTime.fromISO(dataEvent.date).toISODate(),
          matchTime: dataEvent.time,
          gameWeek: dataEvent.week,
          gameStatus: dataEvent.status.long,
          homeTeam: dataEvent.teams.home.name,
          homeTeamFlag: dataEvent.teams.home.logo,
          homeTeamScore: dataEvent.scores.home,
          awayTeam: dataEvent.teams.away.name,
          awayTeamFlag: dataEvent.teams.away.logo,
          awayTeamScore: dataEvent.scores.away
        };
      }).filter(Boolean);
      const formattedData = filteredGameData.slice(0, gamestoDisplay);

      this.sendSocketNotification("API_SPORT_GAME_DATA", formattedData);
    } catch (error) {
      console.error("MMM-Rugby Error fetching API SPORTS GAME DATA: ", error)
    }
  },

  getapiSportsLeagueData: async function (payload) {
    try {
      const apiKey = payload.apiSports.apiSportsKey;
      const apiSportsLeagueUrl = 'https://v1.rugby.api-sports.io/leagues';
      const response = await fetch(apiSportsLeagueUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v1.rugby.api-sports.io'
        }
      });
      const data = await response.json();
      const leagueData = data.response.map(dataEvent => ({
        "leagueId": dataEvent.id,
        "leagueType": dataEvent.type,
        "leagueFlag": dataEvent.logo,
        "leagueCountryId": dataEvent.country.id,
        "leagueCountryName": dataEvent.country.name,
        "leagueCountryCode": dataEvent.country.code,
        "leagueCountryFlag": dataEvent.country.flag,
        "currentSeasons": dataEvent.seasons.filter(season => season.current)
      }));
      fs.writeFileSync(leaguesLog, JSON.stringify(leagueData, null, 2) + os.EOL, function (err) {
        if (err)
          throw err;
      });
    } catch (error) {
      console.error("MMM-Rugby Error fetching league data: ", error);
    }
  },

  getapiSportsRankingData: async function (payload) {
    try {
      const league_id = payload.apiSports.apiSportStandingLeagueId;
      const apiKey = payload.apiSports.apiSportKey;
      const activeSeason = leagueSeason.find(season => season.leagueId === league_id)?.currentSeasons[0].season || '';
      const apiSportsRankingUrl = `https://v1.rugby.api-sports.io/standings?league=${league_id}&season=${activeSeason}`;

      const response = await fetch(apiSportsRankingUrl, {
        headersmethod: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v1.rugby.api-sports.io'
        }
      });
      const data = await response.json();
      const rankingsData = data;
      const rankingLimit = payload.apiSports.apiSportsNumRankings;
      const rankingData = data.response[0].slice(0, rankingLimit).map(dataEvent => ({
        rank: dataEvent.position,
        league: dataEvent.league.name,
        leagueFlag: dataEvent.league.logo,
        teamName: dataEvent.team.name,
        teamFlag: dataEvent.team.logo,
        teamCountry: dataEvent.country.name,
        teamStats: {
          gamesPlayed: dataEvent.games.played,
          win: dataEvent.games.win.total,
          draw: dataEvent.games.draw.total,
          lose: dataEvent.games.lose.total,
          goalsFor: dataEvent.goals.for,
          goalsAgainst: dataEvent.goals.against,
          points: dataEvent.points
        }
      }));
      this.sendSocketNotification("API_SPORT_STANDING_DATA", rankingData);
    } catch (error) {
      console.error("MMM-Rugby Error fetching API SPORT Ranking Data: ", error)
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "GET_RANKING_DATA":
        this.getRankingsData(payload);
        break;
      case "GET_MATCH_DATA":
        this.getrugbyMatchData(payload);
        break;
      case "GET_API_SPORT_DATA":
        this.getapiSportsLeagueData(payload)
          .then(() => {
            this.getapiSportsGameData(payload);
            this.getapiSportsRankingData(payload);
          });
        break;
      default:
        console.error("MMM-Rugby Unknown notification received: ", notification);
    }
  }
})
