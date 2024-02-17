var NodeHelper = require('node_helper')

module.exports = NodeHelper.create({
    requiresVersion: '2.26.0',

    start: function() {
        console.log('Starting node helper for ' + this.name)
    },

    socketNotificationReceived: function(notification, payload) {
        
    }
})