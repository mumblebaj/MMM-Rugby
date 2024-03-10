Module.register("MMM-Rugby", {
    defaults: {
        title: "MMM-Rugby",
        updateInterval: 1000 * 60 * 60 * 24,
        rotateInterval: 60000,
        sport: "mru",
        rankingLimit: 10,
        matchesLimit: 10,
        competitions: [],
        collectionType: "apiSport", // free
        apiSports: {
            apiSportStandingLeagueId: 16,
            apiSportKey: "your-api-key",
            apiSportTZ: "Africa/Johannesburg",
            numberofGamesToDisplay: 10,
            apiSportsNumRankings: 10,
            apiSportDaysPast: 7,
            apiSportsDaysFuture: 14
        }
    },

    getStyles: function () {
        return ["MMM-Rugby.css"]
    },

    getTranslations: function () {
        return {
            fr: "translations/fr.json"
        }
    },

    getTemplate: function () { },

    start: function () {
        var self = this;
        Log.info(`Starting module: ${this.name}`);

        this.currentTable = 1;

        this.dataSets = {
            free: {
                rankingData: [],
                matchData: []
            },
            apiSport: {
                rankingData: [],
                matchData: []
            }
        };
        this.currentTables = {
            free: 1,
            apiSport: 3
        };

        this.getData();
        this.scheduleUpdate();

        setInterval(function () {
            self.rotateTables();
        }, this.config.rotateInterval);
    },

    getData: function () {
        if (this.config.collectionType === "free") {
            this.getRankingData();
            this.getMatchData();
        } else if (this.config.collectionType === "apiSport") {
            this.getApiSportData();
        }
    },

    refreshData: function () {
        if (this.config.collectionType === "free") {
            this.getRankingData();
            this.getMatchData();
        } else if (this.config.collectionType === "apiSport") {
            this.refreshApiSportData();
        }
    },

    getRankingData: function () {
        this.sendSocketNotification("GET_RANKING_DATA", this.config)
    },

    getMatchData: function () {
        this.sendSocketNotification("GET_MATCH_DATA", this.config)
    },

    getApiSportData: function () {
        this.sendSocketNotification("GET_API_SPORT_DATA", this.config)
    },

    refreshApiSportData: function () {
        this.sendSocketNotification("REFRESH_API_SPORT_DATA", this.config)
    },

    refreshApiSportLeagues: function () {
        this.sendSocketNotitication("GET_API_SPORT_LEAGUE", this.config)
    },

    scheduleUpdate: function () {

        // Second interval for daily updates
        const oneDayMilliseconds = 24 * 60 * 60 * 1000; // milliseconds in a day
        setInterval(() => {
            this.refreshApiSportLeagues();
        }, oneDayMilliseconds);
        setTimeout(() => {
            setInterval(() => {
                this.getData();
            }, this.config.updateInterval);
        }, 2000);
    },

    socketNotificationReceived: function (notification, payload) {
        var self = this;

        if (notification === "RUGBY_RANKING_DATA") {

            this.dataSets[this.config.collectionType].rankingData = payload;
            this.table1 = this.createTable1(this.dataSets.free.rankingData);
            //this.table1 = this.createTable1(payload)
            //self.updateDom()
        }
        if (notification === "RUGBY_MATCH_DATA") {

            this.dataSets[this.config.collectionType].matchData = payload;
            this.table2 = this.createTable2(this.dataSets.free.matchData);
            //this.table2 = this.createTable2(payload)
            //self.updateDom();
        }
        if (notification === "API_SPORT_GAME_DATA") {

            this.dataSets[this.config.collectionType].matchData = payload;
            this.table2 = this.createTable4(this.dataSets.apiSport.matchData);

        } else if (notification === "API_SPORT_STANDING_DATA") {

            this.dataSets[this.config.collectionType].rankingData = payload;
            this.table1 = this.createTable3(this.dataSets.apiSport.rankingData);
        }
        this.updateDom();

    },

    rotateTables: function () {
        // Toggle visibility of tables
        if (this.currentTable === 1) {
            this.currentTable = 2;
            this.table1.style.display = "none";
            this.table2.style.display = "block";
        } else {
            this.currentTable = 1;
            this.table1.style.display = "block";
            this.table2.style.display = "none";
        }
    },

    createTable1: function (dataSet) {
        var MMMRugbyDiv = document.createElement('div');
        MMMRugbyDiv.classList.add('MMM-RugbyDiv');
        var rugbyHeader = document.createElement('div')
        rugbyHeader.className = 'medium'
        var headerSpan = document.createElement('span')
        headerSpan.classList.add('medium', 'bright')
        headerSpan.setAttribute('align', 'right')
        headerSpan.innerHTML = 'World Rugby Standings'
        rugbyHeader.appendChild(headerSpan)
        MMMRugbyDiv.appendChild(rugbyHeader)

        // Create table for first set of data
        var table1 = document.createElement("table");
        var table1Header = document.createElement("thead");
        var table1Body = document.createElement("tbody");

        // Create header row for Position
        var table1HeaderRow = document.createElement("tr");
        const posHead = document.createElement('td');
        posHead.setAttribute('align', 'center');
        posHead.innerHTML = 'Position';
        table1HeaderRow.appendChild(posHead)
        // Create header row for Flag
        const flagHead = document.createElement('td');
        flagHead.setAttribute('align', 'center');
        flagHead.innerHTML = 'Flag';
        table1HeaderRow.appendChild(flagHead)
        // Create header row for Team
        const teamHead = document.createElement('td');
        teamHead.setAttribute('align', 'center');
        teamHead.innerHTML = 'Team';
        table1HeaderRow.appendChild(teamHead)
        // Create header row for Points
        const pointsHead = document.createElement('td');
        pointsHead.setAttribute('align', 'center');
        pointsHead.innerHTML = 'Points';
        table1HeaderRow.appendChild(pointsHead);

        // Append header row to table1 header
        table1Header.appendChild(table1HeaderRow);
        // Populate table1 body with data
        dataSet.forEach(function (data) {
            var row = document.createElement("tr");
            const pos = document.createElement("td");
            pos.setAttribute('align', 'left');
            pos.innerHTML = data.position;
            row.appendChild(pos);

            const teamFlagCell = document.createElement('td');
            teamFlagCell.setAttribute('align', 'left');
            const teamFlag = document.createElement('img');
            teamFlag.className = 'MMM-Rugbylogo';
            teamFlag.src = data.flag
            teamFlag.width = 20;
            teamFlag.height = 20;
            teamFlagCell.appendChild(teamFlag);
            row.appendChild(teamFlagCell);

            const teamName = document.createElement('td');
            teamName.setAttribute('align', 'left');
            teamName.innerHTML = data.name;
            row.appendChild(teamName);
            var teampoints = data.points.toFixed(2)
            const teamPoints = document.createElement('td')
            teamPoints.setAttribute('align', 'right')
            teamPoints.innerHTML = teampoints
            row.appendChild(teamPoints)
            table1Body.appendChild(row);
        });

        table1.appendChild(table1Header);
        table1.appendChild(table1Body);
        MMMRugbyDiv.appendChild(table1)

        return MMMRugbyDiv;
    },

    createTable2: function (dataSet) {
        var self = this;

        var CompetitionType = "";
        // Determine the competition type
        switch (this.config.sport) {
            case "mru":
                CompetitionType = "Mens Rugby Union";
                break;
            case "mrs":
                CompetitionType = "Mens Sevens Series";
                break;
            case "wrs":
                CompetitionType = "Woman's Sevens Series";
                break;
            case "jmu":
                CompetitionType = "U20 Six Nations";
                break;
        }

        let container = document.createElement("div");
        container.classList.add("MMMRugbyDiv");

        var rugbyHeader = document.createElement('div')
        rugbyHeader.className = 'medium'
        var headerSpan = document.createElement('span')
        headerSpan.className = 'medium'
        headerSpan.setAttribute('align', 'right')
        headerSpan.innerHTML = CompetitionType
        rugbyHeader.appendChild(headerSpan)
        container.appendChild(rugbyHeader)

        var table = document.createElement("table");
        table.id = "misSportMatchesTable";

        // Create table header
        var thead = document.createElement("thead");
        thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Time</th>
        ${self.config.sport === 'mru' && self.config.competitions.length > 1 ? '<th>Competition</th>' : ''}
        <th>Home Team</th>
        <th>Away Team</th>
        <th>Score</th>
      </tr>
    `;
        table.appendChild(thead);

        // Create table body
        var tbody = document.createElement("tbody");
        dataSet.forEach(function (match) {
            var row = document.createElement("tr");
            row.classList.add('xsmall', 'bright');
            var homeTeamScore = match.team1Score !== null ? match.team1Score : 0;
            var awayTeamScore = match.team2Score !== null ? match.team2Score : 0;
            row.innerHTML = `
        <td>${match.matchDateTime}</td>
        <td>${match.eventStart}</td>
        ${self.config.sport === 'mru' && self.config.competitions.length > 1 ? `<td>${match.competition}</td>` : ''}
        <td><img src="${match.team1Flag}" class="team-flag" /> ${match.team1Name}</td>
        <td><img src="${match.team2Flag}" class="team-flag" /> ${match.team2Name}</td>
        <td>${homeTeamScore} - ${awayTeamScore}</td>
      `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        container.appendChild(table);
        return container;
    },

    createTable3: function (dataSet) {
        let container = document.createElement('div');
        container.classList.add("MMMRugbyDiv");
        var headerDiv = document.createElement("div");
        headerDiv.id = "rankingData";
        headerDiv.classList.add('bright');
        let firstData = dataSet[0][0];
        var currentDate = new Date().toLocaleDateString();
        const firstLeagueFlag = dataSet[0].leagueFlag;
        const leagueName = dataSet[0].league;
        headerDiv.innerHTML = `
      <span>${leagueName}</span>
      <img src="${firstLeagueFlag}"/>
      <span>${currentDate}</span>
    `;
        container.appendChild(headerDiv);

        // Table
        var table = document.createElement("table");
        table.id = "MMMRugby-rankingTable";
        var thead = document.createElement("thead");
        thead.classList.add('xsmall', 'bright')
        thead.innerHTML = `
      <tr>
    <th>Rank</th>
	<th>Flag</th>
    <th>Team</th>
    <th>Country</th>
    <th>Pld</th>
    <th>W</th>
    <th>D</th>
    <th>L</th>
    <th>GD</th>
    <th>Pts</th>
  </tr>
    `;
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        dataSet.forEach(function (entry) {
            var row = document.createElement("tr");
            var goalDiff = entry.teamStats.goalsFor - entry.teamStats.goalsAgainst
            row.classList.add('xsmall', 'bright')
            row.innerHTML = `
        <td>${entry.rank}</td>
        <td><img src="${entry.teamFlag}"/> </td>
		<td>${entry.teamName}</td>
        <td>${entry.teamCountry}</td>
        <td>${entry.teamStats.gamesPlayed}</td>
        <td>${entry.teamStats.win}</td>
        <td>${entry.teamStats.draw}</td>
        <td>${entry.teamStats.lose}</td>
        <td>${goalDiff}</td>
        <td>${entry.teamStats.points}</td>
      `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        container.appendChild(table);

        return container;
    },

    createTable4: function (dataSet) {
        let container = document.createElement('div');
        container.classList.add("MMMRugbyDiv");
        var headerDiv = document.createElement("div");
        const leagueName = dataSet[0].leagueName;
        const firstLeagueFlag = dataSet[0].leagueFlag;
        var currentDate = new Date().toLocaleDateString();
        headerDiv.id = "matchData";
        headerDiv.classList.add('medium', 'bright');
        headerDiv.innerHTML = `
      <span>${leagueName}</span>
	  <img src="${firstLeagueFlag}"/>
      <span>${currentDate}</span>
	  `
        container.appendChild(headerDiv);

        var table = document.createElement("table");
        table.id = "rankingMatchesTable";
        Log.log("DataSet: ", dataSet)
        // Create table header
        var thead = document.createElement("thead");
        thead.classList.add('xsmall', 'bright')
        thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Home Team</th>
        <th>Away Team</th>
        <th>Score</th>
      </tr>
    `;
        table.appendChild(thead);

        // Create table body
        var tbody = document.createElement("tbody");
        dataSet.forEach(function (match) {
            var row = document.createElement("tr");
            row.classList.add('xsmall', 'bright')
            var homeTeamScore = match.homeTeamScore !== null ? match.homeTeamScore : 0;
            var awayTeamScore = match.awayTeamScore !== null ? match.awayTeamScore : 0;
            row.innerHTML = `
        <td>${match.matchDate}</td>
        <td>${match.matchTime}</td>
        <td><img src="${match.homeTeamFlag}" class="team-flag" /> ${match.homeTeam}</td>
        <td><img src="${match.awayTeamFlag}" class="team-flag" /> ${match.awayTeam}</td>
        <td>${homeTeamScore} - ${awayTeamScore}</td>
      `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        container.appendChild(table);
        return container;
    },

    getDom: function () {
        var wrapper = document.createElement("div");

        if (this.config.collectionType === "free") {

            if (!this.table1) {
                this.table1 = document.createElement("table");
            }
            if (!this.table2) {
                this.table2 = document.createElement("table");
            }
            if (this.currentTable === 1) {
                this.table1.style.display = "block";
                this.table2.style.display = "none";
            }
            else {
                this.table1.style.display = "none";
                this.table2.style.display = "block";
            }
            if (!wrapper.contains(this.table1)) {
                wrapper.appendChild(this.table1);
            }
            if (!wrapper.contains(this.table2)) {
                wrapper.appendChild(this.table2);
            }
            //wrapper.appendChild(this.table1);
            //wrapper.appendChild(this.table2);
        } else if (this.config.collectionType === "apiSport") {
            if (!this.table1) {
                this.table1 = document.createElement("table");
            }
            if (!this.table2) {
                this.table2 = document.createElement("table");
            }
            if (this.currentTable === 1) {
                this.table1.style.display = "block";
                this.table2.style.display = "none";
            } else {
                this.table1.style.display = "none";
                this.table2.style.display = "block";
            }
            if (!wrapper.contains(this.table1)) {
                wrapper.appendChild(this.table1);
            }
            if (!wrapper.contains(this.table2)) {
                wrapper.appendChild(this.table2);
            }
        }
        return wrapper;
    }
})