Module.register("MMM-Rugby", {
    defaults: {
        title: "MMM-Rugby",
        updateInterval: 1000 * 60 * 60 * 24,
        rotateInterval: 60000,
        sport: "mru",
        rankingLimit: 10,
        matchesLimit: 10
    },

    getStyles: function () {
        return ["MMM-Rugby.css"]
    },

    getTranslations: function () { },

    getTemplate: function () { },

    start: function () {
        var self = this;
        Log.info(`Starting module: ${this.name}`);
        this.rankingData = null;
        this.matchData = null;
        this.dataSet1 = [];
        this.dataSet2 = [];
        this.currentTable = 1;

        this.getrankingData();
        this.getmatchData();

        setInterval(function () {
            self.rotateTables();
        }, this.config.rotateInterval);
    },

    getrankingData: function () {
        this.sendSocketNotification("GET_RANKING_DATA", this.config)
    },

    getmatchData: function () {
        this.sendSocketNotification("GET_MATCH_DATA", this.config)
    },

    scheduleUpdate: function (delay) {
        var nextUpdate = this.config.updateInterval;
        if (typeof delay != "undefined" && delay >= 0) {
            nextUpdate = delay;
        }

        var self = this;
        setInterval(function () {
            self.getData()
        }, nextUpdate)
    },

    socketNotificationReceived: function (notification, payload) {
        var self = this;

        if (notification === "RUGBY_RANKING_DATA") {
            this.dataSet1 = payload;
            this.table1 = this.createTable1(this.dataSet1);
            self.updateDom();
        }

        if (notification === "RUGBY_MATCH_DATA") {
            this.dataSet2 = payload;
            this.table2 = this.createTable2(this.dataSet2);
            self.updateDom();
        }

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

    createTable2: function () {
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
        this.dataSet2.forEach(function (data) {
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

    createTable1: function () {
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
        this.dataSet1.forEach(function (data) {
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

    getDom: function () {
        var wrapper = document.createElement("div");

        //Create tables and append wrapper
        this.table1 = this.createTable1(this.dataSet1);
        this.table2 = this.createTable2(this.dataSet2);

        // Initially display table1, hide table2
        if (this.currentTable === 1) {
            this.table1.style.display = "block";
            this.table2.style.display = "none";
        } else {
            this.table1.style.display = "none";
            this.table2.style.display = "block";
        }

        wrapper.appendChild(this.table1);
        wrapper.appendChild(this.table2);
        return wrapper;
    }
})
