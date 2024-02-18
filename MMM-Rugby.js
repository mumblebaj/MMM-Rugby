Module.register("MMM-Rugby", {
    defaults: {
        title: "MMM-Rugby",
        updateInterval: 1000*60*60*24,
        sport: "mru",
        rankingLimit: 10
    },

    getStyles: function() {
        return ["MMM-Rugby.css"]
    },

    getTranslations: function() {

    },

    getTemplate: function() {

    },

    start: function() {
        var self = this;
        Log.info(`Starting module: ${this.name}`);
        this.rankingData = null;
        this.matchData = null;
        this.dataSet1 = [];
        this.dataSet2 = [];

        this.getData();

        setInterval(function() {
            self.rotateTables();
        }, 5000);
    },

    getData: function() {
        this.sendSocketNotification("GET_RUGBY_DATA", this.config)
    },

    scheduleUpdate: function(delay) {
        var nextUpdate = this.config.updateInterval;
        if (typeof delay != "undefined" && delay >= 0) {
            nextUpdate = delay;
        }

        var self = this;
        setInterval(function() {
            self.getData()
        }, nextUpdate)
    },

    socketNotificationReceived: function(notification, payload) {
        var self = this;

        if (notification === "RUGBY_RANKING_DATA") {
            this.dataSet1 = payload;
        }

        if (notification === "RUGBY_MATCH_DATA") {
            this.dataSet2 = payload;
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
    

    getDom: function () {
        var wrapper = document.createElement("div");
    
        // Create table for first set of data
        var table1 = document.createElement("table");
        var table1Header = document.createElement("thead");
        var table1Body = document.createElement("tbody");
    
        // Create header row for table1
        var table1HeaderRow = document.createElement("tr");
        table1HeaderRow.innerHTML = "<th>Position</th><th>Team</th><th>Points</th>";
    
        // Append header row to table1 header
        table1Header.appendChild(table1HeaderRow);
    
        // Populate table1 body with data
        this.dataSet1.forEach(function (data) {
            var row = document.createElement("tr");
            row.innerHTML = `<td>${data.position}</td><td><img src="${data.flag}" alt="${data.name} flag" /> ${data.name} (${data.abbreviation})</td><td>${data.points}</td>`;
            table1Body.appendChild(row);
        });
    
        // Append header and body to table1
        table1.appendChild(table1Header);
        table1.appendChild(table1Body);
    
        // Create table for second set of data
        var table2 = document.createElement("table");
        var table2Header = document.createElement("thead");
        var table2Body = document.createElement("tbody");
    
        // Create header row for table2
        var table2HeaderRow = document.createElement("tr");
        table2HeaderRow.innerHTML = "<th>Match</th><th>Venue</th><th>Date & Time</th>";
    
        // Append header row to table2 header
        table2Header.appendChild(table2HeaderRow);
    
        // Populate table2 body with data
        this.dataSet2.forEach(function (data) {
            var row = document.createElement("tr");
            row.innerHTML = `<td>${data.team1Name} vs ${data.team2Name}</td><td>${data.venueName}, ${data.venueCity}, ${data.venueCountry}</td><td>${data.matchDateTime}</td>`;
            table2Body.appendChild(row);
        });
    
        // Append header and body to table2
        table2.appendChild(table2Header);
        table2.appendChild(table2Body);
    
        // Append tables to wrapper
        wrapper.appendChild(table1);
        wrapper.appendChild(table2);
    
        return wrapper;
    }
    

})