#!/usr/bin/env node

var path = require('path');
var config = require('./config.json');

/**
 * Subscribe to multiple data sources
 *
 * @param subs Array of subscriptions
 * @param cb Callback that is executed whenever the data is obtained
 * @param repeat How often to poll the subscriptions (optional)
 */
function subscribe(subs, cb, repeat, lastTime) {
    var allComponents = [];

    var done = function() {
        cb(false, allComponents);
        if (!repeat) return;

        var now = new Date();
        var timeout = repeat;
        if (lastTime) timeout -= now - lastTime;

        setTimeout(subscribe.bind(null, subs, cb, repeat, now), timeout);
    }

    var count = subs.length;
    subs.forEach(function(sub) {
        sub(function(err, components) {
            if (!err) allComponents = allComponents.concat(components);
            if (--count === 0) done();
        });
    });
}

var profile = require('./profile/' + config.profile + '.json').map(function(filename) {
    return require('./subscription/' + filename);
});

subscribe(profile, function(err, components) {
    if (err) return;
    console.log(components);
}, config.pollInterval);
