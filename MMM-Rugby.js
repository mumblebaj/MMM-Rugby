Module.register("MMM-Rugby", {
    defaults: {
        title: "MMM-Rugby",
        updateInterval: 1000*60*60*24,
        sport: "mru"
    },

    getStyles: function() {
        return ["MMM-Rugby.css"]
    },

    getTranslations: function() {

    },

    getTemplate: function() {

    },

    start: function() {
        Log.info(`Starting module: ${this.name}`);

        this.getData();
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

    },

    getDom: function() {
        return wrapper;
    }

})