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
            apiSportSeason: 2023,
            apiSportKey: "your-api-key",
            apiSportTZ: "Africa/Johannesburg",
            numberofGamesToDisplay: 10,
            apiSportsNumRankings: 10,
            apiSportDaysPast: 7,
            apiSportsDaysFuture: 14
            // add games requirements league id for games to fetch
        }
    },

    getStyles: function () {
        return ["MMM-Rugby.css"]
    },

    getTranslations: function () { },

    getTemplate: function () { },

    start: function () {
        var self = this;
        Log.info(`Starting module: ${this.name}`);
        this.dataSets = {
            free: { rankingData: [], matchData: [] },
            apiSport: { rankingData: [], matchData: [] }
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

    getRankingData: function () {
        this.sendSocketNotification("GET_RANKING_DATA", this.config)
    },

    getMatchData: function () {
        this.sendSocketNotification("GET_MATCH_DATA", this.config)
    },

    getApiSportData: function () {
        this.sendSocketNotification("GET_API_SPORT_DATA", this.config)
    },

    scheduleUpdate: function () {
        setInterval(() => {
            this.getData();
        }, this.config.updateInterval);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "RUGBY_RANKING_DATA") {
            this.dataSets[this.config.collectionType].rankingData = payload;
        }
        if (notification === "RUGBY_MATCH_DATA") {
            this.dataSets[this.config.collectionType].matchData = payload;
        }
        if (notification === "API_SPORT_GAME_DATA") {
            this.dataSets[this.config.collectionType].matchData = payload;
        } else if (notification === "API_SPORT_STANDING_DATA") {
            this.dataSets[this.config.collectionType].rankingData = payload;
        }
        this.updateDom();

    },

    rotateTables: function () {
        const currentTable = this.currrentTables[this.config.collectionType];
        const nextTable = currentTable === 1 ? 2 : 1;
        const table1 = document.getElementById("table1");
        const table2 = document.getElementById("table2");
        const table3 = document.getElementById("table3");
        const table4 = document.getElementById("table4");

        if (this.config.collectionType === "free") {
            this.currentTables.free = nextTable;
            table1.style.display = nextTable === 1 ? "block" : "none";
            table2.style.display = nextTable === 2 ? "block" : "none";
        } else if (this.config.collectionType === "apiSport") {
            this.currentTables.apiSport = nextTable;
            table3.style.display = nextTable === 3 ? "block" : "none";
            table4.style.display = nextTable === 4 ? "block" : "none";
        }
    },

    createTable1: function (dataSet) {
        Log.log(dataSet)
        var MMMRugbyDiv = document.createElement('div');
        MMMRugbyDiv.classList.add('MMM-RugbyDiv');
        var rugbyHeader = document.createElement('div')
        rugbyHeader.className = 'medium'
        var headerSpan = document.createElement('span')
        headerSpan.className = 'medium'
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
        var MMMRugbyDiv = document.createElement('div');
        MMMRugbyDiv.classList.add('MMM-RugbyDiv');
        var rugbyHeader = document.createElement('div');
        rugbyHeader.className = 'medium';
        var headerSpan = document.createElement('header');
        headerSpan.className = 'xsmall';
        headerSpan.setAttribute('align', 'right');

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

        headerSpan.innerHTML = CompetitionType;
        rugbyHeader.appendChild(headerSpan);
        MMMRugbyDiv.appendChild(rugbyHeader);

        // Create table for first set of data
        var table2 = document.createElement("table");
        var table2Header = document.createElement("thead");
        var table2Body = document.createElement("tbody");

        // Populate table1 body with data
        dataSet.forEach(function (data) {
            var comprow = document.createElement("tr");

            const competitionAndTime = document.createElement("td");
            competitionAndTime.classList.add('MMM-RugbyComp');
            competitionAndTime.setAttribute('align', 'left');
            competitionAndTime.innerHTML = data.competition;
            comprow.appendChild(competitionAndTime);

            const compb1 = document.createElement("td");
            const compb2 = document.createElement("td");
            const compb3 = document.createElement("td");
            const compb4 = document.createElement("td");
            comprow.appendChild(compb1);
            comprow.appendChild(compb2);
            comprow.appendChild(compb3);
            comprow.appendChild(compb4);

            const compTime = document.createElement("td");
            compTime.classList.add('MMM-RugbyComp');
            compTime.setAttribute('align', 'right');
            compTime.innerHTML = data.matchDateTime;
            comprow.appendChild(compTime);

            table2Body.appendChild(comprow)

            var row = document.createElement("tr");
            row.classList.add('MMM-RugbyTable');
            const team1Name = document.createElement("td");
            team1Name.setAttribute('align', 'right');
            team1Name.innerHTML = data.team1Name;
            row.appendChild(team1Name);

            const team1FlagCell = document.createElement('td');
            team1FlagCell.setAttribute('align', 'left');
            const team1Flag = document.createElement('img');
            team1Flag.className = 'MMM-Rugbylogo';
            team1Flag.src = data.team1Flag
            team1Flag.width = 15;
            team1Flag.height = 15;
            team1FlagCell.appendChild(team1Flag);
            row.appendChild(team1FlagCell);

            const team1Score = document.createElement("td");
            //team1Score.setAttribute('style', 'font-size:15px');
            team1Score.setAttribute('align', 'center');
            team1Score.setAttribute('width', '15px');
            team1Score.innerHTML = data.team1Score;
            row.appendChild(team1Score);

            const scoreDiv = document.createElement("td");
            scoreDiv.classList.add('MMM-RugbyColon');
            scoreDiv.innerHTML = ':';
            row.appendChild(scoreDiv);

            const team2Score = document.createElement("td");
            team2Score.setAttribute('width', '15px');
            team2Score.setAttribute('align', 'center');
            team2Score.setAttribute('width', '3px')
            team2Score.innerHTML = data.team2Score;
            row.appendChild(team2Score);

            const team2FlagCell = document.createElement('td');
            team2FlagCell.setAttribute('align', 'right');
            const team2Flag = document.createElement('img');
            team2Flag.className = 'MMM-Rugbylogo';
            team2Flag.src = data.team2Flag
            team2Flag.width = 15;
            team2Flag.height = 15;
            team2FlagCell.appendChild(team2Flag);
            row.appendChild(team2FlagCell);

            const team2Name = document.createElement("td");
            team2Name.setAttribute('align', 'left');
            team2Name.innerHTML = data.team2Name;
            row.appendChild(team2Name);

            table2Body.appendChild(row)

            var venuerow = document.createElement("tr");
            venuerow.classList.add('MMM-RugbyBorder');
            const venueName = document.createElement("td");
            venueName.classList.add('MMM-RugbyDetails');
            venueName.setAttribute('style', 'font-size:10px');
            venueName.setAttribute('align', 'left');
            venueName.innerHTML = "Venue: " + data.venueName

            const venueCity = document.createElement('td')
            venueCity.classList.add('MMM-RugbyDetails');
            venueCity.setAttribute('style', 'font-size:10px');
            venueCity.setAttribute('align', 'center')
            venueCity.innerHTML = "City: " + data.venueCity;

            const venueb1 = document.createElement('td');
            const venueb2 = document.createElement('td')
            const venueb3 = document.createElement('td')

            const venueCountry = document.createElement('td')
            venueCountry.classList.add('MMM-RugbyDetails');
            venueCountry.setAttribute('style', 'font-size:10px');
            venueCountry.setAttribute('align', 'right')
            venueCountry.innerHTML = "Country: " + data.venueCountry;

            venuerow.appendChild(venueName);
            venuerow.appendChild(venueCity);
            venuerow.appendChild(venueb1);
            venuerow.appendChild(venueb2);
            venuerow.appendChild(venueb3);
            venuerow.appendChild(venueCountry);
            table2Body.appendChild(venuerow);
        });
        table2.appendChild(table2Header);
        table2.appendChild(table2Body);
        MMMRugbyDiv.appendChild(table2)

        return MMMRugbyDiv;
    },

    createTable3: function (dataSet) {

    },

    createTable4: function (dataSet) {

    },

    getDom: function () {
        var wrapper = document.createElement("div");

        // Create tables and append wrapper
        if (this.currentTable === 1) {
            this.table1 = this.createTable1(this.dataSets.free.rankingData);
            this.table2 = this.createTable2(this.dataSets.free.matchData);
            wrapper.appendChild(this.table1);
            wrapper.appendChild(this.table2);
        } else {
            // Ensure that table3 and table4 are not defined if not required
            if (this.table3) {
                wrapper.appendChild(this.table3);
            }
            if (this.table4) {
                wrapper.appendChild(this.table4);
            }
        }

        return wrapper;
    }

    // getDom: function () {
    //     var wrapper = document.createElement("div");

    //     const table1 = this.createTable1(this.dataSets.free.rankingData);
    //     table1.id = "table1";

    //     const table2 = this.createTable2(this.dataSets.free.matchData);
    //     table2.id = "table2";

    //     const table3 = this.createTable3(this.dataSets.apiSport.rankingData);
    //     table3.id = "table3";

    //     const table4 = this.createTable4(this.dataSets.apiSport.matchData);
    //     table4.id = "table4";

    //     wrapper.appendChild(table1);
    //     wrapper.appendChild(table2);
    //     wrapper.appendChild(table3);
    //     wrapper.appendChild(table4);
    //     return wrapper;
    // }
})
