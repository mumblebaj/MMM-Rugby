var NodeHelper = require('node_helper')
const fetch = require ('node-fetch');
const fs = require('fs');
var {
    DateTime
} = require('luxon')

var startofMonth = DateTime.local(DateTime.now()).startOf('month').toISODate();
var endofMonth = DateTime.local(DateTime.now()).endOf('month').toISODate();

const countryFlags = JSON.parse(fs.readFileSync('country_flags.json', 'utf8'));

var mrumatches = `https://api.wr-rims-prod.pulselive.com/rugby/v3/match?startDate=${startofMonth}&endDate=${endofMonth}&sort=asc&pageSize=100&page=0&sport=`

var rankingsUrl = 'https://api.wr-rims-prod.pulselive.com/rugby/v3/rankings/mru?language=en'

module.exports = NodeHelper.create({
    requiresVersion: '2.26.0',

    start: function() {
        console.log('Starting node helper for ' + this.name)
    },

     getrugbyMatchData: async function(payload) {
      let url = this.mrumatches + payload.sport
        const response = await fetch(url, {
            method: 'GET',
            
        })
        const data = await response.json();
    
        let rugbymatchesData = [];
        data.content.forEach(dataEvent => {
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
      let url = this.rankingsUrl
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

    socketNotificationReceived: function(notification, payload) {
      
      if(notification === "GET_RUGBY_DATA") {
        this.getrankingsData(payload);
        this.getrugbyMatchData(payload);
      }
    }
})